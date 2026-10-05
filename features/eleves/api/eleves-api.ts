import { introuvable, paginer, reponse, type ApiResponse } from '@/lib/api'
import { anneeEnCours, dateDuJour } from '@/lib/clock'
import { cycleDe } from '@/lib/domain/niveaux'
import { situationScolarite } from '@/lib/domain/scolarite'
import { etat } from '@/services/mock-db/store'
import { elevesVisibles, peutVoirScolarite, verifierAccesEleve, type Acteur } from '@/services/mock-db/acces'
import { calculerBulletin, syntheseVieScolaire } from '@/services/mock-db/selecteurs'
import type { EleveResume, FicheEleve, FiltresEleves, StatutFinancier } from '../types'

/**
 * Ce fichier est la frontière avec le backend : aujourd'hui il lit la base de démonstration, demain il appellera
 * `fetch(`${apiConfig.baseUrl}/eleves`)` en renvoyant exactement le même format `{ data, meta }`.
 */

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function statutFinancierDe(matricule: string, niveau: Parameters<typeof cycleDe>[0]): StatutFinancier {
  const base = etat()
  const frais = base.frais.find((f) => f.niveau === niveau)
  if (!frais) return 'A_JOUR'
  return situationScolarite(
    frais,
    base.paiements.filter((p) => p.matricule === matricule),
    anneeEnCours(),
    dateDuJour()
  ).statut
}

export async function getEleves(acteur: Acteur, filtres: FiltresEleves = {}): Promise<ApiResponse<EleveResume[]>> {
  const base = etat()
  const recherche = normaliser(filtres.recherche?.trim() ?? '')
  const voitScolarite = acteur.role === 'DIRECTION' || acteur.role === 'ECONOME'
  const voitVieScolaire = acteur.role !== 'ECONOME' && acteur.role !== 'PARENT'

  const liste = elevesVisibles(base, acteur)
    .filter((e) => !filtres.classeId || e.classeId === filtres.classeId)
    .filter((e) => {
      if (!filtres.cycle) return true
      const classe = base.classes.find((c) => c.id === e.classeId)
      return classe ? cycleDe(classe.niveau) === filtres.cycle : false
    })
    .filter((e) => !recherche || normaliser(`${e.nom} ${e.prenoms} ${e.matricule}`).includes(recherche))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenoms.localeCompare(b.prenoms, 'fr'))

  const resumes: EleveResume[] = liste.map((eleve) => {
    const classe = base.classes.find((c) => c.id === eleve.classeId)
    if (!classe) return introuvable('Classe introuvable.')
    return {
      eleve,
      classe: { id: classe.id, libelle: classe.libelle, niveau: classe.niveau },
      absencesConsecutives: voitVieScolaire ? syntheseVieScolaire(base, eleve.matricule).absencesConsecutives : undefined,
      statutFinancier: voitScolarite ? statutFinancierDe(eleve.matricule, classe.niveau) : undefined,
    }
  })
  return paginer(resumes, filtres.page ?? 1, filtres.limit ?? 30)
}

export async function getFicheEleve(acteur: Acteur, matricule: string): Promise<ApiResponse<FicheEleve>> {
  const base = etat()
  const eleve = verifierAccesEleve(base, acteur, matricule)
  const classe = base.classes.find((c) => c.id === eleve.classeId)
  if (!classe) return introuvable('Classe introuvable.')

  const frais = base.frais.find((f) => f.niveau === classe.niveau)
  const paiements = base.paiements.filter((p) => p.matricule === matricule).sort((a, b) => b.date.localeCompare(a.date))
  const publieesSeulement = acteur.role === 'PARENT'

  const fiche: FicheEleve = {
    eleve,
    classe,
    parents: base.utilisateurs
      .filter((u) => eleve.parentIds.includes(u.id))
      .map((u) => ({ id: u.id, nom: u.nom, prenoms: u.prenoms, telephone: u.telephone })),
    bulletin: calculerBulletin(base, matricule, 3, { publieesSeulement }),
    vieScolaire: syntheseVieScolaire(base, matricule),
    sanctions: base.sanctions
      .filter((s) => s.matricule === matricule && (acteur.role !== 'PARENT' || s.statut === 'PARENT_INFORME'))
      .sort((a, b) => b.date.localeCompare(a.date)),
    scolarite:
      frais && peutVoirScolarite(acteur.role)
        ? { situation: situationScolarite(frais, paiements, anneeEnCours(), dateDuJour()), paiements }
        : undefined,
    cantine: base.abonnements.find((a) => a.matricule === matricule) ?? null,
  }
  return reponse(fiche)
}
