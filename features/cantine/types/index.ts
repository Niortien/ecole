import type { AbonnementCantine, MenuJour } from '@/types/domain'

export interface CantineJour {
  date: string
  menu?: MenuJour
  /** Nombre de repas attendus ce jour-là (abonnés, jour de repas, mois payé). */
  repas: number
}

export interface CantineAujourdhui {
  date: string
  menu?: MenuJour
  total: number
  parClasse: { classe: string; nombre: number }[]
  allergies: { allergie: string; eleves: string[] }[]
}

export interface Cantine {
  semaine: CantineJour[]
  /** Équipe seulement : liste de cuisine du jour. */
  aujourdhui?: CantineAujourdhui
  /** Parent seulement : abonnement de chaque enfant. */
  enfants?: { matricule: string; nom: string; classe: string; abonnement: AbonnementCantine | null }[]
  /** Droit de gérer les abonnements (économat, direction). */
  gestionnaire: boolean
}

export interface AbonneResume {
  matricule: string
  nom: string
  prenoms: string
  classe: string
  abonnement: AbonnementCantine | null
}

export interface SaisieAbonnement {
  matricule: string
  jours: AbonnementCantine['jours']
  allergies: string[]
  payeJusqua: string
}
