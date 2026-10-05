import type { Cycle, NiveauCode } from '../../types/domain'

export interface NiveauInfo {
  code: NiveauCode
  label: string
  cycle: Cycle
  ordre: number
}

export const NIVEAUX: NiveauInfo[] = [
  { code: 'CP1', label: 'CP1', cycle: 'PRIMAIRE', ordre: 1 },
  { code: 'CP2', label: 'CP2', cycle: 'PRIMAIRE', ordre: 2 },
  { code: 'CE1', label: 'CE1', cycle: 'PRIMAIRE', ordre: 3 },
  { code: 'CE2', label: 'CE2', cycle: 'PRIMAIRE', ordre: 4 },
  { code: 'CM1', label: 'CM1', cycle: 'PRIMAIRE', ordre: 5 },
  { code: 'CM2', label: 'CM2', cycle: 'PRIMAIRE', ordre: 6 },
  { code: '6E', label: '6e', cycle: 'COLLEGE', ordre: 7 },
  { code: '5E', label: '5e', cycle: 'COLLEGE', ordre: 8 },
  { code: '4E', label: '4e', cycle: 'COLLEGE', ordre: 9 },
  { code: '3E', label: '3e', cycle: 'COLLEGE', ordre: 10 },
  { code: '2NDE', label: '2nde', cycle: 'LYCEE', ordre: 11 },
  { code: '1ERE', label: '1ère', cycle: 'LYCEE', ordre: 12 },
  { code: 'TLE', label: 'Terminale', cycle: 'LYCEE', ordre: 13 },
]

export const CYCLE_LABEL: Record<Cycle, string> = {
  PRIMAIRE: 'Primaire',
  COLLEGE: 'Collège',
  LYCEE: 'Lycée',
}

export function niveauInfo(code: NiveauCode): NiveauInfo {
  const info = NIVEAUX.find((n) => n.code === code)
  if (!info) throw new Error(`Niveau inconnu : ${code}`)
  return info
}

export function cycleDe(code: NiveauCode): Cycle {
  return niveauInfo(code).cycle
}

/** Les notes se donnent sur 10 au primaire et sur 20 au collège et au lycée. */
export function bareme(cycle: Cycle): 10 | 20 {
  return cycle === 'PRIMAIRE' ? 10 : 20
}

/** Ramène une moyenne sur 20 (pour comparer des cycles différents dans un même tableau). */
export function surVingt(valeur: number, cycle: Cycle): number {
  return cycle === 'PRIMAIRE' ? valeur * 2 : valeur
}

/** Classe d'examen : CEPE (CM2), BEPC (3e), BAC (Terminale). */
export function examenDuNiveau(code: NiveauCode): 'CEPE' | 'BEPC' | 'BAC' | null {
  if (code === 'CM2') return 'CEPE'
  if (code === '3E') return 'BEPC'
  if (code === 'TLE') return 'BAC'
  return null
}
