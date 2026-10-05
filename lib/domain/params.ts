import type { Mention } from '../../types/domain'

/**
 * Paramètres de calcul de l'école. Ce sont des **réglages**, pas des vérités officielles :
 * les valeurs par défaut suivent l'usage courant mais doivent être confirmées avec la direction de l'établissement.
 */
export interface ParamsCalcul {
  /** Part de la composition dans la moyenne d'une matière (0–1). Le reste vient des interros et devoirs. */
  poidsComposition: number
  /** Seuils de mention, en proportion du barème (0.6 = 12/20, 6/10). */
  seuils: { tableauHonneur: number; encouragements: number; felicitations: number; avertissement: number }
  /** Seuil d'admission en proportion du barème (0.5 = 10/20, 5/10). */
  seuilAdmission: number
  /** Un absent non justifié compte zéro (vrai) ou est ignoré (faux). */
  anjCompteZero: boolean
  /** Nombre maximal de redoublements au primaire avant passage obligatoire. */
  redoublementsMaxPrimaire: number
}

export const PARAMS_PAR_DEFAUT: ParamsCalcul = {
  poidsComposition: 0.5,
  seuils: { tableauHonneur: 0.6, encouragements: 0.7, felicitations: 0.8, avertissement: 0.4 },
  seuilAdmission: 0.5,
  anjCompteZero: true,
  redoublementsMaxPrimaire: 2,
}

export const MENTION_LABEL: Record<Mention, string> = {
  FELICITATIONS: 'Félicitations',
  ENCOURAGEMENTS: 'Encouragements',
  TABLEAU_HONNEUR: "Tableau d'honneur",
  AUCUNE: 'Aucune mention',
  AVERTISSEMENT_TRAVAIL: 'Avertissement de travail',
}
