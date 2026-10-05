import { z } from 'zod'

export const OBJETS_PAYABLES = ['INSCRIPTION', 'APE', 'TRANCHE_1', 'TRANCHE_2', 'TRANCHE_3'] as const
export const MODES = ['ESPECES', 'WAVE', 'ORANGE_MONEY', 'MTN_MONEY'] as const

export const paiementSchema = z.object({
  objet: z.enum(OBJETS_PAYABLES, { error: 'Choisissez ce que le parent règle' }),
  montant: z
    .number({ error: 'Saisissez un montant en chiffres' })
    .int('Le montant doit être un nombre entier de FCFA')
    .min(500, 'Montant minimum : 500 FCFA')
    .max(1_000_000, 'Montant trop élevé : vérifiez la saisie'),
  mode: z.enum(MODES, { error: 'Choisissez le mode de paiement' }),
})

export type PaiementFormData = z.infer<typeof paiementSchema>
