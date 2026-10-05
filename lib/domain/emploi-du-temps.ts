import type { Creneau, JourSemaine } from '../../types/domain'

/** « 08:30 » → 510 minutes. */
export function enMinutes(heure: string): number {
  const [h, m] = heure.split(':').map(Number)
  return h * 60 + m
}

export function seChevauchent(a: Pick<Creneau, 'debut' | 'fin'>, b: Pick<Creneau, 'debut' | 'fin'>): boolean {
  return enMinutes(a.debut) < enMinutes(b.fin) && enMinutes(b.debut) < enMinutes(a.fin)
}

export type TypeConflit = 'CLASSE' | 'ENSEIGNANT' | 'SALLE'

export interface Conflit {
  type: TypeConflit
  jour: number
  /** Identifiants des deux créneaux en conflit. */
  creneaux: [string, string]
}

const CLES: { type: TypeConflit; cle: (c: Creneau) => string }[] = [
  { type: 'CLASSE', cle: (c) => c.classeId },
  { type: 'ENSEIGNANT', cle: (c) => c.enseignantId },
  { type: 'SALLE', cle: (c) => c.salle },
]

/** Détecte les chevauchements d'une même classe, d'un même enseignant ou d'une même salle. */
export function detecterConflits(creneaux: Creneau[]): Conflit[] {
  const conflits: Conflit[] = []
  for (let i = 0; i < creneaux.length; i++) {
    for (let j = i + 1; j < creneaux.length; j++) {
      const a = creneaux[i]
      const b = creneaux[j]
      if (a.jour !== b.jour || !seChevauchent(a, b)) continue
      for (const { type, cle } of CLES) {
        if (cle(a) === cle(b)) conflits.push({ type, jour: a.jour, creneaux: [a.id, b.id] })
      }
    }
  }
  return conflits
}

/** Conflits qu'un nouveau créneau créerait avec l'existant (pour refuser ou avertir avant l'enregistrement). */
export function conflitsAvec(existants: Creneau[], nouveau: Creneau): Conflit[] {
  const autres = existants.filter((c) => c.id !== nouveau.id)
  return detecterConflits([...autres, nouveau]).filter((c) => c.creneaux.includes(nouveau.id))
}

export const CONFLIT_LABEL: Record<TypeConflit, string> = {
  CLASSE: 'La classe a déjà un cours à ce moment',
  ENSEIGNANT: "L'enseignant est déjà occupé à ce moment",
  SALLE: 'La salle est déjà utilisée à ce moment',
}

/** Heures de cours par semaine d'un enseignant. */
export function heuresParSemaine(creneaux: Creneau[], enseignantId: string): number {
  const minutes = creneaux
    .filter((c) => c.enseignantId === enseignantId)
    .reduce((total, c) => total + (enMinutes(c.fin) - enMinutes(c.debut)), 0)
  return Math.round((minutes / 60) * 100) / 100
}

/** Plages horaires de l'école (mercredi après-midi libre). Source unique pour l'emploi du temps et les données de démo. */
export const PLAGES_HORAIRES: { jours: JourSemaine[]; debut: string; fin: string }[] = [
  { jours: [1, 2, 3, 4, 5], debut: '07:30', fin: '08:30' },
  { jours: [1, 2, 3, 4, 5], debut: '08:30', fin: '09:30' },
  { jours: [1, 2, 3, 4, 5], debut: '09:45', fin: '10:45' },
  { jours: [1, 2, 3, 4, 5], debut: '10:45', fin: '11:45' },
  { jours: [1, 2, 3, 4, 5], debut: '12:00', fin: '13:00' },
  { jours: [1, 2, 4, 5], debut: '15:00', fin: '16:00' },
  { jours: [1, 2, 4, 5], debut: '16:00', fin: '17:00' },
]
