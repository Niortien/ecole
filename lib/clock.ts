import { aujourdhui } from './domain/calendrier'
import { apiConfig } from '@/config/app.config'
import { ANNEE_DEMO, DATE_DEMO } from '@/services/mock-db/seed'

/** En démonstration, « aujourd'hui » est une date fixe (3e trimestre en cours) pour que les données restent cohérentes. */
export const modeDemo = apiConfig.baseUrl === ''

export const dateDuJour = (): string => (modeDemo ? DATE_DEMO : aujourdhui())

/** Année scolaire en cours (réglable dans les paramètres de l'école avec un vrai backend). */
export const anneeEnCours = (): string => ANNEE_DEMO
