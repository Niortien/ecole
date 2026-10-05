import type { Classe, DemiJournee, StatutPresence } from '@/types/domain'

export interface SituationAppel {
  classe: Pick<Classe, 'id' | 'libelle'>
  effectif: number
  /** L'appel du matin a-t-il été fait à cette date ? */
  fait: boolean
  /** Taux de présence du matin (si l'appel est fait). */
  taux: number | null
  absents: number
  retards: number
}

export interface LigneAppel {
  matricule: string
  nom: string
  prenoms: string
  /** null = pas encore pointé. */
  statut: StatutPresence | null
  retardMinutes?: number
  /** Absences non justifiées d'affilée avant cette date. */
  absencesConsecutives: number
}

export interface AppelClasse {
  classe: Pick<Classe, 'id' | 'libelle'>
  date: string
  demiJournee: DemiJournee
  lignes: LigneAppel[]
  dejaFait: boolean
}

export interface SaisieAppel {
  classeId: string
  date: string
  demiJournee: DemiJournee
  lignes: { matricule: string; statut: StatutPresence; retardMinutes?: number }[]
}

export interface AbsentLong {
  matricule: string
  nom: string
  prenoms: string
  classe: string
  jours: number
  telephoneParent?: string
}
