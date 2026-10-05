import { ApiError, interdit, introuvable, paginer, reponse, type ApiResponse } from '@/lib/api'
import { anneeEnCours, dateDuJour } from '@/lib/clock'
import { numeroRecu, situationScolarite } from '@/lib/domain/scolarite'
import { etat, ecrire } from '@/services/mock-db/store'
import type { Acteur } from '@/services/mock-db/acces'
import type { Paiement } from '@/types/domain'
import type { FiltresScolarite, LigneScolariteEleve, NouveauPaiement, RecuDetail, ResumeScolarite, ScolariteEnfant } from '../types'

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const gestionnaire = (a: Acteur) => a.role === 'DIRECTION' || a.role === 'ECONOME'

function situationDe(matricule: string, niveau: string) {
  const base = etat()
  const frais = base.frais.find((f) => f.niveau === niveau)
  if (!frais) return null
  return situationScolarite(frais, base.paiements.filter((p) => p.matricule === matricule), anneeEnCours(), dateDuJour())
}

export async function getScolarite(acteur: Acteur, filtres: FiltresScolarite = {}): Promise<ApiResponse<LigneScolariteEleve[]> & { resume: ResumeScolarite }> {
  if (!gestionnaire(acteur)) interdit('La scolarité est réservée à l’économat et à la direction.')
  const base = etat()
  const recherche = normaliser(filtres.recherche?.trim() ?? '')

  const toutes = base.eleves.flatMap<LigneScolariteEleve>((e) => {
    const classe = base.classes.find((c) => c.id === e.classeId)
    const sit = classe && situationDe(e.matricule, classe.niveau)
    if (!classe || !sit) return []
    return [{ matricule: e.matricule, nom: e.nom, prenoms: e.prenoms, classe: { id: classe.id, libelle: classe.libelle }, statut: sit.statut, total: sit.total, paye: sit.paye, reste: sit.reste, enRetard: sit.enRetard }]
  })

  const resume: ResumeScolarite = {
    attendu: toutes.reduce((t, l) => t + l.total, 0),
    encaisse: toutes.reduce((t, l) => t + l.paye, 0),
    reste: toutes.reduce((t, l) => t + l.reste, 0),
    enRetard: toutes.reduce((t, l) => t + l.enRetard, 0),
    nbEnRetard: toutes.filter((l) => l.statut === 'EN_RETARD').length,
    encaisseJour: base.paiements.filter((p) => p.date === dateDuJour()).reduce((t, p) => t + p.montant, 0),
  }

  const liste = toutes
    .filter((l) => !filtres.statut || l.statut === filtres.statut)
    .filter((l) => !filtres.classeId || l.classe.id === filtres.classeId)
    .filter((l) => !recherche || normaliser(`${l.nom} ${l.prenoms} ${l.matricule}`).includes(recherche))
    // Les plus gros retards d'abord : c'est ce que l'économe traite en priorité.
    .sort((a, b) => b.enRetard - a.enRetard || a.nom.localeCompare(b.nom, 'fr'))

  const page = await paginer(liste, filtres.page ?? 1, filtres.limit ?? 25)
  return { ...page, resume }
}

export async function getScolariteEnfants(acteur: Acteur): Promise<ApiResponse<ScolariteEnfant[]>> {
  if (acteur.role !== 'PARENT') interdit()
  const base = etat()
  const matricules = base.utilisateurs.find((u) => u.id === acteur.userId)?.enfants ?? []
  const enfants = base.eleves.filter((e) => matricules.includes(e.matricule)).flatMap<ScolariteEnfant>((e) => {
    const classe = base.classes.find((c) => c.id === e.classeId)
    const sit = classe && situationDe(e.matricule, classe.niveau)
    if (!classe || !sit) return []
    return [
      {
        matricule: e.matricule,
        nom: `${e.prenoms} ${e.nom}`,
        classe: classe.libelle,
        situation: sit,
        paiements: base.paiements.filter((p) => p.matricule === e.matricule).sort((a, b) => b.date.localeCompare(a.date)),
      },
    ]
  })
  return reponse(enfants)
}

/** Enregistre un paiement. Le montant ne peut pas dépasser ce qu'il reste à payer sur la ligne choisie. */
export async function enregistrerPaiement(acteur: Acteur, nouveau: NouveauPaiement): Promise<ApiResponse<Paiement>> {
  if (!gestionnaire(acteur)) interdit('Seuls l’économat et la direction enregistrent un paiement.')
  const base = etat()
  const eleve = base.eleves.find((e) => e.matricule === nouveau.matricule)
  const classe = base.classes.find((c) => c.id === eleve?.classeId)
  if (!eleve || !classe) return introuvable('Élève introuvable.')
  const sit = situationDe(eleve.matricule, classe.niveau)
  const ligne = sit?.lignes.find((l) => l.objet === nouveau.objet)
  if (!ligne) throw new ApiError('Ligne de scolarité inconnue.', 422)
  if (!Number.isFinite(nouveau.montant) || nouveau.montant <= 0) throw new ApiError('Le montant doit être supérieur à zéro.', 422)
  if (nouveau.montant > ligne.reste) {
    throw new ApiError(`Il ne reste que ${new Intl.NumberFormat('fr-FR').format(ligne.reste)} FCFA à payer sur cette ligne.`, 422)
  }
  const aujourdhui = dateDuJour()
  const annee = Number(aujourdhui.slice(0, 4))
  const sequence = base.paiements.filter((p) => p.recu.startsWith(`R-${annee}-`)).length + 1
  const paiement: Paiement = {
    id: `pay-${Date.now()}`,
    matricule: nouveau.matricule,
    montant: nouveau.montant,
    mode: nouveau.mode,
    objet: nouveau.objet,
    date: aujourdhui,
    recu: numeroRecu(annee, sequence),
  }
  ecrire.paiement(paiement)
  return reponse(paiement, {}, 80)
}

/** Détail d'un reçu (impression). Réservé à l'économat, à la direction et aux parents de l'élève. */
export async function getRecu(acteur: Acteur, paiementId: string): Promise<ApiResponse<RecuDetail>> {
  const base = etat()
  const paiement = base.paiements.find((p) => p.id === paiementId)
  if (!paiement) return introuvable('Reçu introuvable.')
  const eleve = base.eleves.find((e) => e.matricule === paiement.matricule)
  const classe = base.classes.find((c) => c.id === eleve?.classeId)
  if (!eleve || !classe) return introuvable('Élève introuvable.')
  const parentDeLEleve = acteur.role === 'PARENT' && eleve.parentIds.includes(acteur.userId)
  if (!gestionnaire(acteur) && !parentDeLEleve) interdit('Vous n’avez pas accès à ce reçu.')
  const sit = situationDe(eleve.matricule, classe.niveau)
  return reponse({
    paiement,
    eleve: { matricule: eleve.matricule, nom: eleve.nom, prenoms: eleve.prenoms, classe: classe.libelle },
    resteApres: sit?.reste ?? 0,
  })
}
