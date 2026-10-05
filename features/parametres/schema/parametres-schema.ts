import { z } from 'zod'

const pourcentage = (nom: string) => z.number({ error: `${nom} : saisissez un nombre` }).min(0, `${nom} : entre 0 et 100`).max(100, `${nom} : entre 0 et 100`)

/** Formulaire en pourcentages (plus lisible pour une direction) ; converti en proportions à l'enregistrement. */
export const parametresSchema = z
  .object({
    poidsComposition: pourcentage('Poids de la composition'),
    tableauHonneur: pourcentage('Tableau d’honneur'),
    encouragements: pourcentage('Encouragements'),
    felicitations: pourcentage('Félicitations'),
    avertissement: pourcentage('Avertissement de travail'),
    seuilAdmission: pourcentage('Seuil d’admission'),
    anjCompteZero: z.boolean(),
    redoublementsMaxPrimaire: z.number({ error: 'Saisissez un nombre' }).int().min(0).max(5),
  })
  .superRefine((v, ctx) => {
    if (!(v.avertissement < v.tableauHonneur && v.tableauHonneur < v.encouragements && v.encouragements < v.felicitations)) {
      ctx.addIssue({
        code: 'custom',
        path: ['felicitations'],
        message: 'Les seuils doivent croître : avertissement < tableau d’honneur < encouragements < félicitations',
      })
    }
  })

export type ParametresFormData = z.infer<typeof parametresSchema>
