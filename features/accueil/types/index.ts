export type TonTache = 'alerte' | 'attention' | 'info' | 'ok'

/** Une chose à faire aujourd'hui, avec le lien pour la traiter. */
export interface Tache {
  cle: string
  titre: string
  detail?: string
  /** Nombre d'éléments concernés (affiché en grand). */
  nombre: number
  ton: TonTache
  href: string
}

export interface Chiffre {
  label: string
  valeur: string
  aide?: string
}

export interface CoursDuJour {
  id: string
  debut: string
  fin: string
  matiere: string
  classe: string
  salle: string
}

export interface EnfantCarte {
  matricule: string
  nom: string
  classe: string
  moyenne: number | null
  bareme: 10 | 20
  rang: number | null
  effectif: number
  enRetard: number
  reste: number
  prochaineEcheance: { libelle: string; date: string } | null
  absencesRecentes: number
  menuDuJour?: string
}

export interface SalleDeSituation {
  salutation: string
  introduction: string
  taches: Tache[]
  chiffres: Chiffre[]
  cours?: CoursDuJour[]
  enfants?: EnfantCarte[]
}
