import type { JourSemaine } from '@/types/domain'

export type TypeCible = 'classe' | 'enseignant'

export interface CreneauDetail {
  id: string
  jour: JourSemaine
  debut: string
  fin: string
  matiereId: string
  matiere: string
  classeId: string
  classe: string
  enseignantId: string
  enseignant: string
  salle: string
}

export interface OptionCible {
  id: string
  label: string
}

export interface EmploiDuTemps {
  cible: { type: TypeCible; id: string; label: string }
  creneaux: CreneauDetail[]
  /** Heures de cours par semaine (enseignant). */
  heures?: number
  /** Cibles que l'acteur peut afficher. */
  classes: OptionCible[]
  enseignants: OptionCible[]
  /** Direction seulement : ajout et suppression de cours. */
  modifiable: boolean
}

export interface NouveauCreneau {
  classeId: string
  jour: JourSemaine
  debut: string
  fin: string
  matiereId: string
  salle: string
}

/** Options pour le formulaire d'ajout : matières d'une classe et leur enseignant. */
export interface OptionsFormulaire {
  matieres: { matiereId: string; libelle: string; enseignant: string }[]
  salle: string
}
