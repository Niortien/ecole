import type {
  AbonnementCantine,
  JourSemaine,
  Presence,
  Sanction,
  StatutPresence,
  TypeSanction,
} from '../../types/domain'
import { jourSemaine } from './calendrier'

// ─── Présences ───────────────────────────────────────────────────────────────

export const PRESENCE_LABEL: Record<StatutPresence, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  RETARD: 'En retard',
  ABSENT_JUSTIFIE: 'Absence justifiée',
}

/** Taux de présence en % (retard = présent ; absence justifiée = ignorée du calcul). */
export function tauxPresence(presences: Pick<Presence, 'statut'>[]): number | null {
  const comptees = presences.filter((p) => p.statut !== 'ABSENT_JUSTIFIE')
  if (comptees.length === 0) return null
  const presents = comptees.filter((p) => p.statut === 'PRESENT' || p.statut === 'RETARD').length
  return Math.round((presents / comptees.length) * 1000) / 10
}

/**
 * Jours de classe consécutifs d'absence non justifiée en remontant depuis le dernier jour pointé.
 * Une journée compte si au moins une demi-journée est absente sans justification.
 */
export function absencesConsecutives(presences: Pick<Presence, 'date' | 'statut'>[]): number {
  const parJour = new Map<string, boolean>()
  for (const p of presences) {
    const absent = p.statut === 'ABSENT'
    parJour.set(p.date, (parJour.get(p.date) ?? false) || absent)
  }
  const jours = [...parJour.keys()].sort().reverse()
  let compte = 0
  for (const jour of jours) {
    if (!parJour.get(jour)) break
    compte++
  }
  return compte
}

export const SEUIL_ALERTE_ABSENCES = 3

// ─── Discipline ──────────────────────────────────────────────────────────────

export const SANCTION_LABEL: Record<TypeSanction, string> = {
  AVERTISSEMENT: 'Avertissement',
  BLAME: 'Blâme',
  RETENUE: 'Retenue',
  EXCLUSION_TEMPORAIRE: 'Exclusion temporaire',
  EXCLUSION_DEFINITIVE: 'Exclusion définitive',
}

/** Ordre de gravité croissante (pour trier et pour la suggestion d'escalade). */
export const GRAVITE: Record<TypeSanction, number> = {
  AVERTISSEMENT: 1,
  RETENUE: 2,
  BLAME: 3,
  EXCLUSION_TEMPORAIRE: 4,
  EXCLUSION_DEFINITIVE: 5,
}

/**
 * Suggestion (jamais automatique) quand les sanctions validées s'accumulent :
 * 3 avertissements → blâme ; 2 blâmes → exclusion temporaire. La décision reste à l'éducateur et à la direction.
 */
export function suggestionEscalade(sanctions: Pick<Sanction, 'type' | 'statut'>[]): TypeSanction | null {
  const valides = sanctions.filter((s) => s.statut !== 'BROUILLON')
  const nb = (type: TypeSanction) => valides.filter((s) => s.type === type).length
  if (nb('BLAME') >= 2) return 'EXCLUSION_TEMPORAIRE'
  if (nb('AVERTISSEMENT') >= 3) return 'BLAME'
  return null
}

// ─── Cantine ─────────────────────────────────────────────────────────────────

/** Matricules attendus au repas ce jour-là (abonnés, jour de repas, abonnement payé pour le mois). */
export function attendusAuRepas(abonnements: AbonnementCantine[], dateISO: string): AbonnementCantine[] {
  const jour = jourSemaine(dateISO)
  const mois = dateISO.slice(0, 7)
  return abonnements.filter((a) => a.jours.includes(jour as JourSemaine) && a.payeJusqua >= mois)
}

/** Allergies à signaler à la cuisine pour la liste d'un jour donné. */
export function allergiesDuJour(attendus: AbonnementCantine[]): { allergie: string; nombre: number }[] {
  const compteur = new Map<string, number>()
  for (const a of attendus) for (const al of a.allergies) compteur.set(al, (compteur.get(al) ?? 0) + 1)
  return [...compteur.entries()].map(([allergie, nombre]) => ({ allergie, nombre })).sort((a, b) => b.nombre - a.nombre)
}
