import type { Note, NoteValeur, Trimestre, TypeEvaluation } from '@/types/domain'

export interface ParamsGrille {
  classeId: string
  matiereId: string
  trimestre: Trimestre
}

/** Une colonne de la grille : interrogation, devoir ou composition. */
export interface ColonneEvaluation {
  index: number
  type: TypeEvaluation
  /** AAAA-MM-JJ de la première note saisie, si elle existe. */
  date?: string
}

export interface LigneGrille {
  matricule: string
  nom: string
  prenoms: string
  /** Note de chaque colonne (même ordre que `colonnes`), null si pas encore saisie. */
  notes: (Note | null)[]
}

export interface Grille {
  classe: { id: string; libelle: string }
  matiere: { id: string; libelle: string; coefficient: number }
  bareme: 10 | 20
  trimestre: Trimestre
  colonnes: ColonneEvaluation[]
  lignes: LigneGrille[]
  /** Notes saisies mais pas encore validées (invisibles pour les parents). */
  nonValidees: number
  /** Lecture seule (direction) ou saisie possible (enseignant de la matière). */
  modifiable: boolean
}

export interface EntreeNote {
  matricule: string
  classeId: string
  matiereId: string
  trimestre: Trimestre
  index: number
  type: TypeEvaluation
  /** null = suppression de la note. */
  valeur: NoteValeur | null
}

/** Une modification faite hors ligne, conservée dans le téléphone jusqu'au retour du réseau. */
export interface ModificationEnAttente extends EntreeNote {
  id: string
  creeeLe: string
}
