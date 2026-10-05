import { ApiError, interdit, introuvable, reponse, type ApiResponse } from '@/lib/api'
import { dateDuJour } from '@/lib/clock'
import { GRAVITE, suggestionEscalade } from '@/lib/domain/vie-scolaire'
import { etat, ecrire } from '@/services/mock-db/store'
import { classesVisibles, type Acteur } from '@/services/mock-db/acces'
import type { Sanction } from '@/types/domain'
import type { FiltresSanctions, NouvelleSanction, SanctionDetail } from '../types'

const peutGerer = (acteur: Acteur) => acteur.role === 'DIRECTION' || acteur.role === 'EDUCATEUR'

function detail(acteur: Acteur, sanction: Sanction): SanctionDetail {
  const base = etat()
  const eleve = base.eleves.find((e) => e.matricule === sanction.matricule)
  const classe = base.classes.find((c) => c.id === eleve?.classeId)
  const auteur = base.utilisateurs.find((u) => u.id === sanction.auteurId)
  const parent = base.utilisateurs.find((u) => eleve?.parentIds.includes(u.id))
  const exclusion = sanction.type === 'EXCLUSION_TEMPORAIRE' || sanction.type === 'EXCLUSION_DEFINITIVE'
  return {
    sanction,
    eleve: { matricule: sanction.matricule, nom: eleve?.nom ?? '', prenoms: eleve?.prenoms ?? '', classe: classe?.libelle ?? '' },
    auteur: auteur ? `${auteur.prenoms} ${auteur.nom}` : '—',
    suggestion: suggestionEscalade(base.sanctions.filter((s) => s.matricule === sanction.matricule)),
    parent: parent ? { prenoms: parent.prenoms, nom: parent.nom, telephone: parent.telephone } : undefined,
    // Les exclusions ne se valident que par la direction.
    validable: sanction.statut === 'BROUILLON' && peutGerer(acteur) && (!exclusion || acteur.role === 'DIRECTION'),
    informable: sanction.statut === 'VALIDEE' && peutGerer(acteur),
  }
}

export async function getSanctions(acteur: Acteur, filtres: FiltresSanctions = {}): Promise<ApiResponse<SanctionDetail[]>> {
  if (acteur.role === 'PARENT' || acteur.role === 'ECONOME') interdit('La discipline est réservée à l’équipe pédagogique.')
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  const liste = base.sanctions
    .filter((s) => {
      const eleve = base.eleves.find((e) => e.matricule === s.matricule)
      return !visibles || (eleve && visibles.includes(eleve.classeId))
    })
    .filter((s) => !filtres.statut || s.statut === filtres.statut)
    .sort((a, b) => b.date.localeCompare(a.date) || GRAVITE[b.type] - GRAVITE[a.type])
    .map((s) => detail(acteur, s))
  return reponse(liste)
}

export async function creerSanction(acteur: Acteur, nouvelle: NouvelleSanction): Promise<ApiResponse<SanctionDetail>> {
  if (acteur.role === 'PARENT' || acteur.role === 'ECONOME') interdit('Vous ne pouvez pas déclarer de sanction.')
  const base = etat()
  const eleve = base.eleves.find((e) => e.matricule === nouvelle.matricule)
  if (!eleve) return introuvable('Élève introuvable.')
  const visibles = classesVisibles(base, acteur)
  if (visibles && !visibles.includes(eleve.classeId)) interdit('Cet élève n’est pas dans vos classes.')
  const exclusion = nouvelle.type === 'EXCLUSION_TEMPORAIRE' || nouvelle.type === 'EXCLUSION_DEFINITIVE'
  if (exclusion && acteur.role === 'ENSEIGNANT') throw new ApiError('Une exclusion est décidée par la direction : déclarez un avertissement ou signalez-le à l’éducateur.', 422)

  const sanction: Sanction = {
    id: `san-${Date.now()}`,
    matricule: nouvelle.matricule,
    type: nouvelle.type,
    motif: nouvelle.motif.trim(),
    date: dateDuJour(),
    // Une sanction posée par un enseignant attend la validation de la vie scolaire.
    statut: peutGerer(acteur) && !exclusion ? 'VALIDEE' : 'BROUILLON',
    auteurId: acteur.userId,
    joursExclusion: nouvelle.type === 'EXCLUSION_TEMPORAIRE' ? nouvelle.joursExclusion : undefined,
  }
  ecrire.sanction(sanction)
  return reponse(detail(acteur, sanction))
}

export async function changerStatut(acteur: Acteur, id: string, statut: 'VALIDEE' | 'PARENT_INFORME'): Promise<ApiResponse<SanctionDetail>> {
  if (!peutGerer(acteur)) interdit('Seuls la direction et les éducateurs valident une sanction.')
  const sanction = etat().sanctions.find((s) => s.id === id)
  if (!sanction) return introuvable('Sanction introuvable.')
  const exclusion = sanction.type === 'EXCLUSION_TEMPORAIRE' || sanction.type === 'EXCLUSION_DEFINITIVE'
  if (exclusion && acteur.role !== 'DIRECTION') interdit('Seule la direction valide une exclusion.')
  const maj = { ...sanction, statut }
  ecrire.sanction(maj)
  return reponse(detail(acteur, maj), {}, 60)
}
