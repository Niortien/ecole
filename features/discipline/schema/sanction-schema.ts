import { z } from 'zod'

export const TYPES_SANCTION = ['AVERTISSEMENT', 'RETENUE', 'BLAME', 'EXCLUSION_TEMPORAIRE', 'EXCLUSION_DEFINITIVE'] as const

export const sanctionSchema = z
  .object({
    matricule: z.string().min(1, 'Choisissez un élève'),
    type: z.enum(TYPES_SANCTION, { error: 'Choisissez le type de sanction' }),
    motif: z.string().trim().min(5, 'Décrivez le motif en quelques mots (5 caractères minimum)').max(200, '200 caractères maximum'),
    joursExclusion: z.number({ error: 'Indiquez un nombre de jours' }).int().min(1, 'Au moins 1 jour').max(8, '8 jours maximum').optional(),
  })
  .superRefine((valeurs, ctx) => {
    if (valeurs.type === 'EXCLUSION_TEMPORAIRE' && !valeurs.joursExclusion) {
      ctx.addIssue({ code: 'custom', path: ['joursExclusion'], message: 'Indiquez la durée de l’exclusion (en jours)' })
    }
  })

export type SanctionFormData = z.infer<typeof sanctionSchema>
