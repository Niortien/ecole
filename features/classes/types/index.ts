import type { Classe, Cycle } from '@/types/domain'

export interface ClasseResume {
  classe: Classe
  cycle: Cycle
  effectif: number
  principal: string
  /** Matières que l'acteur enseigne dans cette classe (enseignant uniquement). */
  matieresEnseignees?: { matiereId: string; libelle: string }[]
}
