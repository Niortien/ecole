import type { Sanction, StatutSanction, TypeSanction } from '@/types/domain'

export interface SanctionDetail {
  sanction: Sanction
  eleve: { matricule: string; nom: string; prenoms: string; classe: string }
  auteur: string
  /** Suggestion d'escalade pour cet élève (jamais automatique). */
  suggestion: TypeSanction | null
  parent?: { prenoms: string; nom: string; telephone: string }
  /** L'acteur peut-il valider cette sanction ? */
  validable: boolean
  /** L'acteur peut-il marquer le parent comme informé ? */
  informable: boolean
}

export interface FiltresSanctions {
  statut?: StatutSanction
}

export interface NouvelleSanction {
  matricule: string
  type: TypeSanction
  motif: string
  joursExclusion?: number
}
