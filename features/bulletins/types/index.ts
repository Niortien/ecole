import type { DecisionPassage, Mention } from '@/types/domain'

export interface BulletinResume {
  matricule: string
  nom: string
  prenoms: string
  moyenne: number | null
  rang: number | null
  effectif: number
  mention: Mention
  /** Décision de passage (bulletin annuel uniquement). */
  decision?: DecisionPassage
}

export interface EnfantChoix {
  matricule: string
  nom: string
  classe: string
}
