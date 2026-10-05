import { reponse, type ApiResponse } from '@/lib/api'
import { anneeEnCours, dateDuJour } from '@/lib/clock'
import { formaterDate, jourSemaine } from '@/lib/domain/calendrier'
import { bareme, cycleDe } from '@/lib/domain/niveaux'
import { OBJET_LABEL, situationScolarite } from '@/lib/domain/scolarite'
import { tauxPresence } from '@/lib/domain/vie-scolaire'
import { enMinutes } from '@/lib/domain/emploi-du-temps'
import { fcfa } from '@/lib/format'
import { etat } from '@/services/mock-db/store'
import { classesDeEnseignant, type Acteur } from '@/services/mock-db/acces'
import { calculerBulletin, syntheseVieScolaire } from '@/services/mock-db/selecteurs'
import type { Seed } from '@/services/mock-db/seed'
import type { Classe, JourSemaine, Utilisateur } from '@/types/domain'
import type { Chiffre, CoursDuJour, EnfantCarte, SalleDeSituation, Tache } from '../types'

/** Classes dont l'appel du matin n'est pas encore fait aujourd'hui. */
function classesSansAppel(base: Seed, aujourdhui: string, parmi?: Classe[]): Classe[] {
  const avecAppel = new Set<string>()
  const parEleve = new Map(base.eleves.map((e) => [e.matricule, e.classeId]))
  for (const p of base.presences) {
    if (p.date === aujourdhui && p.demiJournee === 'MATIN') {
      const classeId = parEleve.get(p.matricule)
      if (classeId) avecAppel.add(classeId)
    }
  }
  return (parmi ?? base.classes).filter((c) => !avecAppel.has(c.id))
}

function situations(base: Seed) {
  const annee = anneeEnCours()
  const aujourdhui = dateDuJour()
  return base.eleves.map((eleve) => {
    const classe = base.classes.find((c) => c.id === eleve.classeId) as Classe
    const frais = base.frais.find((f) => f.niveau === classe.niveau)
    const sit = frais
      ? situationScolarite(frais, base.paiements.filter((p) => p.matricule === eleve.matricule), annee, aujourdhui)
      : null
    return { eleve, classe, sit }
  })
}

const pluriel = (n: number, un: string, plusieurs: string) => (n > 1 ? plusieurs : un)

function tachesCommunes(base: Seed, aujourdhui: string) {
  const sansAppel = classesSansAppel(base, aujourdhui)
  const abs3 = base.eleves.filter((e) => syntheseVieScolaire(base, e.matricule).absencesConsecutives >= 3)
  const brouillons = base.sanctions.filter((s) => s.statut === 'BROUILLON')
  return { sansAppel, abs3, brouillons }
}

function salutation(u: Utilisateur | undefined): string {
  if (!u) return 'Bonjour'
  const civilite = u.role === 'DIRECTION' || u.role === 'ECONOME' ? 'Mme' : u.role === 'PARENT' ? '' : 'M.'
  return `Bonjour ${civilite} ${u.nom}`.replace('  ', ' ')
}

export async function getSalleDeSituation(acteur: Acteur): Promise<ApiResponse<SalleDeSituation>> {
  const base = etat()
  const aujourdhui = dateDuJour()
  const utilisateur = base.utilisateurs.find((u) => u.id === acteur.userId)
  const { sansAppel, abs3, brouillons } = tachesCommunes(base, aujourdhui)
  const taches: Tache[] = []
  const chiffres: Chiffre[] = []
  let introduction = ''
  let cours: CoursDuJour[] | undefined
  let enfants: EnfantCarte[] | undefined

  const tacheAppels = (liste: Classe[]): Tache => ({
    cle: 'appels',
    titre: `${liste.length} ${pluriel(liste.length, 'classe n’a pas', 'classes n’ont pas')} fait l’appel ce matin`,
    detail: liste.slice(0, 5).map((c) => c.libelle).join(', ') + (liste.length > 5 ? '…' : ''),
    nombre: liste.length,
    ton: 'alerte',
    href: '/presences',
  })
  const tacheAbsents: Tache = {
    cle: 'absents',
    titre: `${abs3.length} ${pluriel(abs3.length, 'élève absent', 'élèves absents')} depuis 3 jours ou plus`,
    detail: 'Les parents sont à contacter.',
    nombre: abs3.length,
    ton: 'alerte',
    href: '/presences',
  }
  const tacheSanctions: Tache = {
    cle: 'sanctions',
    titre: `${brouillons.length} ${pluriel(brouillons.length, 'sanction à valider', 'sanctions à valider')}`,
    detail: 'Déclarées par les enseignants et les éducateurs.',
    nombre: brouillons.length,
    ton: 'attention',
    href: '/discipline',
  }

  if (acteur.role === 'DIRECTION' || acteur.role === 'ECONOME') {
    const lignes = situations(base)
    const enRetard = lignes.filter((l) => l.sit?.statut === 'EN_RETARD')
    const montant = enRetard.reduce((t, l) => t + (l.sit?.enRetard ?? 0), 0)
    const mois = aujourdhui.slice(0, 7)
    const encaisseMois = base.paiements.filter((p) => p.date.startsWith(mois)).reduce((t, p) => t + p.montant, 0)
    const encaisseJour = base.paiements.filter((p) => p.date === aujourdhui).reduce((t, p) => t + p.montant, 0)

    const tacheImpayes: Tache = {
      cle: 'impayes',
      titre: `${enRetard.length} ${pluriel(enRetard.length, 'élève a', 'élèves ont')} des frais en retard`,
      detail: `${fcfa(montant)} à recouvrer.`,
      nombre: enRetard.length,
      ton: 'alerte',
      href: '/scolarite',
    }

    if (acteur.role === 'DIRECTION') {
      introduction = 'Voici ce qui demande une décision ou un suivi aujourd’hui.'
      if (sansAppel.length > 0) taches.push(tacheAppels(sansAppel))
      if (enRetard.length > 0) taches.push(tacheImpayes)
      if (brouillons.length > 0) taches.push(tacheSanctions)
      if (abs3.length > 0) taches.push(tacheAbsents)
      const series = new Set(base.notes.filter((n) => !n.publiee).map((n) => `${n.classeId}|${n.matiereId}`)).size
      if (series > 0) {
        taches.push({ cle: 'notes', titre: `${series} ${pluriel(series, 'série de notes attend', 'séries de notes attendent')} la validation`, detail: 'Une série = une classe et une matière. Les parents ne la voient pas encore.', nombre: series, ton: 'info', href: '/notes' })
      }
      const matin = base.presences.filter((p) => p.date === aujourdhui && p.demiJournee === 'MATIN')
      chiffres.push(
        { label: 'Élèves inscrits', valeur: String(base.eleves.length), aide: `${base.classes.length} classes` },
        { label: 'Présents ce matin', valeur: matin.length ? `${tauxPresence(matin)?.toString().replace('.', ',')} %` : '—', aide: matin.length ? 'sur les classes ayant fait l’appel' : 'appel pas encore fait' },
        { label: 'Encaissé ce mois', valeur: fcfa(encaisseMois) }
      )
    } else {
      introduction = 'Encaissements, impayés et relances du jour.'
      if (enRetard.length > 0) taches.push(tacheImpayes)
      chiffres.push(
        { label: 'Encaissé aujourd’hui', valeur: fcfa(encaisseJour), aide: formaterDate(aujourdhui, 'court') },
        { label: 'Encaissé ce mois', valeur: fcfa(encaisseMois) },
        { label: 'Reste à recouvrer', valeur: fcfa(lignes.reduce((t, l) => t + (l.sit?.reste ?? 0), 0)), aide: 'toute l’année' }
      )
    }
  }

  if (acteur.role === 'EDUCATEUR') {
    introduction = 'Présences, retards et discipline du jour.'
    if (sansAppel.length > 0) taches.push(tacheAppels(sansAppel))
    if (abs3.length > 0) taches.push(tacheAbsents)
    if (brouillons.length > 0) taches.push({ ...tacheSanctions, titre: `${brouillons.length} ${pluriel(brouillons.length, 'sanction à traiter', 'sanctions à traiter')}` })
    const matin = base.presences.filter((p) => p.date === aujourdhui && p.demiJournee === 'MATIN')
    chiffres.push(
      { label: 'Retards ce matin', valeur: String(matin.filter((p) => p.statut === 'RETARD').length) },
      { label: 'Absents ce matin', valeur: String(matin.filter((p) => p.statut === 'ABSENT' || p.statut === 'ABSENT_JUSTIFIE').length) }
    )
  }

  if (acteur.role === 'ENSEIGNANT') {
    introduction = 'Vos cours du jour, l’appel et les notes à valider.'
    const jour = jourSemaine(aujourdhui) as JourSemaine
    cours = base.creneaux
      .filter((c) => c.enseignantId === acteur.userId && c.jour === jour)
      .sort((a, b) => enMinutes(a.debut) - enMinutes(b.debut))
      .map((c) => ({
        id: c.id,
        debut: c.debut,
        fin: c.fin,
        matiere: base.matieres.find((m) => m.id === c.matiereId)?.libelle ?? c.matiereId,
        classe: base.classes.find((k) => k.id === c.classeId)?.libelle ?? c.classeId,
        salle: c.salle,
      }))
    const mesClasses = new Set(classesDeEnseignant(base, acteur.userId))
    const principales = base.classes.filter((c) => c.principalId === acteur.userId)
    const mesSansAppel = classesSansAppel(base, aujourdhui, principales)
    if (mesSansAppel.length > 0) taches.push({ ...tacheAppels(mesSansAppel), titre: `Appel du matin à faire : ${mesSansAppel.map((c) => c.libelle).join(', ')}` })
    const mesMatieres = new Set(base.matieresClasses.filter((m) => m.enseignantId === acteur.userId).map((m) => `${m.classeId}|${m.matiereId}`))
    const aValider = new Set(base.notes.filter((n) => !n.publiee && mesMatieres.has(`${n.classeId}|${n.matiereId}`)).map((n) => `${n.classeId}|${n.matiereId}`))
    if (aValider.size > 0) {
      taches.push({ cle: 'notes', titre: `${aValider.size} ${pluriel(aValider.size, 'série de notes à valider', 'séries de notes à valider')}`, detail: 'Les parents les verront après votre validation.', nombre: aValider.size, ton: 'attention', href: '/notes' })
    }
    chiffres.push(
      { label: 'Mes classes', valeur: String(mesClasses.size) },
      { label: 'Cours aujourd’hui', valeur: String(cours.length), aide: formaterDate(aujourdhui) }
    )
  }

  if (acteur.role === 'PARENT') {
    introduction = 'Où en sont vos enfants, en un coup d’œil.'
    const annee = anneeEnCours()
    enfants = (utilisateur?.enfants ?? []).flatMap<EnfantCarte>((matricule) => {
      const eleve = base.eleves.find((e) => e.matricule === matricule)
      const classe = eleve && base.classes.find((c) => c.id === eleve.classeId)
      if (!eleve || !classe) return []
      const bulletin = calculerBulletin(base, matricule, 3, { publieesSeulement: true })
      const frais = base.frais.find((f) => f.niveau === classe.niveau)
      const sit = frais ? situationScolarite(frais, base.paiements.filter((p) => p.matricule === matricule), annee, aujourdhui) : null
      const abonne = base.abonnements.find((a) => a.matricule === matricule)
      const menu = base.menus.find((m) => m.date === aujourdhui)
      const prochaine = sit?.prochaineEcheance
      return [
        {
          matricule,
          nom: `${eleve.prenoms} ${eleve.nom}`,
          classe: classe.libelle,
          moyenne: bulletin?.moyenne ?? null,
          bareme: bareme(cycleDe(classe.niveau)),
          rang: bulletin?.rang ?? null,
          effectif: bulletin?.effectif ?? 0,
          enRetard: sit?.enRetard ?? 0,
          reste: sit?.reste ?? 0,
          prochaineEcheance: prochaine ? { libelle: OBJET_LABEL[prochaine.objet], date: prochaine.echeance } : null,
          absencesRecentes: syntheseVieScolaire(base, matricule).absencesConsecutives,
          menuDuJour: abonne && menu ? menu.plat : undefined,
        },
      ]
    })
    for (const e of enfants) {
      if (e.enRetard > 0) taches.push({ cle: `impaye-${e.matricule}`, titre: `${fcfa(e.enRetard)} de scolarité en retard pour ${e.nom}`, nombre: 1, ton: 'alerte', href: '/scolarite' })
    }
  }

  return reponse({
    salutation: salutation(utilisateur),
    introduction,
    taches,
    chiffres,
    cours,
    enfants,
  })
}
