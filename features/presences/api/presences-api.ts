import { ApiError, interdit, introuvable, reponse, type ApiResponse } from '@/lib/api'
import { absencesConsecutives, tauxPresence } from '@/lib/domain/vie-scolaire'
import { jourSemaine } from '@/lib/domain/calendrier'
import { dateDuJour } from '@/lib/clock'
import { etat, ecrire } from '@/services/mock-db/store'
import { classesVisibles, type Acteur } from '@/services/mock-db/acces'
import type { DemiJournee, Presence } from '@/types/domain'
import type { AbsentLong, AppelClasse, SaisieAppel, SituationAppel } from '../types'

function verifierClasse(acteur: Acteur, classeId: string) {
  const visibles = classesVisibles(etat(), acteur)
  if (visibles && !visibles.includes(classeId)) interdit('Vous n’avez pas accès à cette classe.')
}

/** Appel du jour de chaque classe visible : fait ou non, taux de présence. */
export async function getSituationAppels(acteur: Acteur, date: string): Promise<ApiResponse<SituationAppel[]>> {
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  const parClasse = new Map(base.classes.map((c) => [c.id, base.eleves.filter((e) => e.classeId === c.id).map((e) => e.matricule)]))
  const matin = base.presences.filter((p) => p.date === date && p.demiJournee === 'MATIN')

  const liste = base.classes
    .filter((c) => !visibles || visibles.includes(c.id))
    .map<SituationAppel>((classe) => {
      const matricules = new Set(parClasse.get(classe.id))
      const pointes = matin.filter((p) => matricules.has(p.matricule))
      return {
        classe: { id: classe.id, libelle: classe.libelle },
        effectif: matricules.size,
        fait: pointes.length > 0,
        taux: pointes.length ? tauxPresence(pointes) : null,
        absents: pointes.filter((p) => p.statut === 'ABSENT' || p.statut === 'ABSENT_JUSTIFIE').length,
        retards: pointes.filter((p) => p.statut === 'RETARD').length,
      }
    })
  return reponse(liste)
}

export async function getAppel(acteur: Acteur, classeId: string, date: string, demiJournee: DemiJournee): Promise<ApiResponse<AppelClasse>> {
  verifierClasse(acteur, classeId)
  const base = etat()
  const classe = base.classes.find((c) => c.id === classeId)
  if (!classe) return introuvable('Classe introuvable.')
  const eleves = base.eleves.filter((e) => e.classeId === classeId).sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenoms.localeCompare(b.prenoms, 'fr'))
  const duJour = base.presences.filter((p) => p.date === date && p.demiJournee === demiJournee)

  const lignes = eleves.map((e) => {
    const p = duJour.find((x) => x.matricule === e.matricule)
    const avant = base.presences.filter((x) => x.matricule === e.matricule && x.date < date)
    return {
      matricule: e.matricule,
      nom: e.nom,
      prenoms: e.prenoms,
      statut: p?.statut ?? null,
      retardMinutes: p?.retardMinutes,
      absencesConsecutives: absencesConsecutives(avant),
    }
  })
  return reponse({ classe: { id: classe.id, libelle: classe.libelle }, date, demiJournee, lignes, dejaFait: lignes.some((l) => l.statut !== null) })
}

/** Enregistre l'appel d'une classe (matin ou soir). Seuls un enseignant de la classe, un éducateur ou la direction le peuvent. */
export async function enregistrerAppel(acteur: Acteur, saisie: SaisieAppel): Promise<ApiResponse<{ enregistres: number }>> {
  if (acteur.role === 'PARENT' || acteur.role === 'ECONOME') interdit('L’appel est réservé à l’équipe pédagogique.')
  verifierClasse(acteur, saisie.classeId)
  if (jourSemaine(saisie.date) > 5) throw new ApiError('Il n’y a pas classe ce jour-là.', 422)
  const base = etat()
  const dansClasse = new Set(base.eleves.filter((e) => e.classeId === saisie.classeId).map((e) => e.matricule))
  const presences: Presence[] = saisie.lignes
    .filter((l) => dansClasse.has(l.matricule))
    .map((l) => ({ date: saisie.date, demiJournee: saisie.demiJournee, matricule: l.matricule, statut: l.statut, retardMinutes: l.statut === 'RETARD' ? l.retardMinutes : undefined }))
  ecrire.presences(presences)
  return reponse({ enregistres: presences.length }, {}, 60)
}

/** Élèves absents sans justification depuis 3 jours de classe ou plus. */
export async function getAbsentsLongs(acteur: Acteur): Promise<ApiResponse<AbsentLong[]>> {
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  const liste = base.eleves
    .filter((e) => !visibles || visibles.includes(e.classeId))
    .map((e) => ({ e, jours: absencesConsecutives(base.presences.filter((p) => p.matricule === e.matricule)) }))
    .filter((x) => x.jours >= 3)
    .map<AbsentLong>(({ e, jours }) => ({
      matricule: e.matricule,
      nom: e.nom,
      prenoms: e.prenoms,
      classe: base.classes.find((c) => c.id === e.classeId)?.libelle ?? '',
      jours,
      telephoneParent: base.utilisateurs.find((u) => e.parentIds.includes(u.id))?.telephone,
    }))
  return reponse(liste.sort((a, b) => b.jours - a.jours), {}, 60)
}

export const dateAppelParDefaut = () => dateDuJour()
