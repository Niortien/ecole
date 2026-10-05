'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Champ, Saisie } from '@/components/common/champs'
import { ChargementListe, EtatErreur } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { Panneau } from '@/components/common/panneau'
import { boutonClasses } from '@/components/common/button-link'
import { messageErreur } from '@/lib/api'
import { niveauInfo } from '@/lib/domain/niveaux'
import type { ParamsCalcul } from '@/lib/domain/params'
import { fcfa } from '@/lib/format'
import { parametresSchema, type ParametresFormData } from '../schema/parametres-schema'
import { useEnregistrerParametres, useParametres } from '../query/parametres-queries'
import { BandeauReinitialisation } from './reinitialisation'

const versFormulaire = (p: ParamsCalcul): ParametresFormData => ({
  poidsComposition: Math.round(p.poidsComposition * 100),
  tableauHonneur: Math.round(p.seuils.tableauHonneur * 100),
  encouragements: Math.round(p.seuils.encouragements * 100),
  felicitations: Math.round(p.seuils.felicitations * 100),
  avertissement: Math.round(p.seuils.avertissement * 100),
  seuilAdmission: Math.round(p.seuilAdmission * 100),
  anjCompteZero: p.anjCompteZero,
  redoublementsMaxPrimaire: p.redoublementsMaxPrimaire,
})

const versParams = (f: ParametresFormData): ParamsCalcul => ({
  poidsComposition: f.poidsComposition / 100,
  seuils: { tableauHonneur: f.tableauHonneur / 100, encouragements: f.encouragements / 100, felicitations: f.felicitations / 100, avertissement: f.avertissement / 100 },
  seuilAdmission: f.seuilAdmission / 100,
  anjCompteZero: f.anjCompteZero,
  redoublementsMaxPrimaire: f.redoublementsMaxPrimaire,
})

function FormulaireCalcul({ valeurs }: { valeurs: ParamsCalcul }) {
  const enregistrer = useEnregistrerParametres()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ParametresFormData>({ resolver: zodResolver(parametresSchema), defaultValues: versFormulaire(valeurs) })

  const champ = (id: keyof ParametresFormData, label: string, aide?: string) => (
    <Champ id={id} label={label} aide={aide} erreur={errors[id]?.message}>
      <Saisie id={id} type="number" inputMode="numeric" aria-invalid={!!errors[id]} {...register(id, { valueAsNumber: true })} />
    </Champ>
  )

  return (
    <form onSubmit={handleSubmit((f) => enregistrer.mutate(versParams(f)))} noValidate>
      <p className="mb-4 rounded-xl bg-crayon-pale p-3 text-sm text-crayon-texte">
        Ces réglages suivent l’usage courant mais les pratiques varient d’une école à l’autre : <strong>à confirmer avec la direction de l’établissement</strong>.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {champ('poidsComposition', 'Poids de la composition (%)', 'Le reste vient des interrogations et des devoirs.')}
        {champ('seuilAdmission', 'Seuil d’admission (% du barème)', '50 % = 10/20 au collège, 5/10 au primaire.')}
        {champ('tableauHonneur', 'Tableau d’honneur à partir de (%)')}
        {champ('encouragements', 'Encouragements à partir de (%)')}
        {champ('felicitations', 'Félicitations à partir de (%)')}
        {champ('avertissement', 'Avertissement de travail sous (%)')}
        {champ('redoublementsMaxPrimaire', 'Redoublements maximum au primaire', 'Au-delà, le passage est obligatoire.')}
        <div className="flex items-end">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
            <input type="checkbox" className="h-5 w-5 accent-[var(--color-ardoise)]" {...register('anjCompteZero')} />
            Une absence non justifiée à une évaluation compte zéro
          </label>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={enregistrer.isPending || !isDirty} className={boutonClasses({ variante: 'primaire' })}>
          {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </form>
  )
}

export function ParametresVue() {
  const { data, isLoading, isError, error, refetch } = useParametres()
  if (isLoading) return <ChargementListe lignes={4} libelle="Chargement des paramètres" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  return (
    <>
      <PageHeader titre="Paramètres" description="Les règles de calcul de votre école et les frais de scolarité." />
      <div className="space-y-6">
        <Panneau titre="Calcul des moyennes et des mentions" description="Chaque changement recalcule immédiatement tous les bulletins.">
          <FormulaireCalcul valeurs={data.data.calcul} />
        </Panneau>

        <Panneau titre="Frais de scolarité par niveau" description="Trois tranches par an, plus l’inscription et l’APE." sansRemplissage>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <caption className="sr-only">Frais par niveau</caption>
              <thead className="border-b border-trait text-left text-xs text-encre-doux">
                <tr>
                  <th scope="col" className="px-5 py-2 font-medium">Niveau</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Inscription</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Chaque tranche</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">APE</th>
                  <th scope="col" className="px-5 py-2 text-right font-medium">Total annuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trait tabular-nums">
                {data.data.frais.map((f) => (
                  <tr key={f.niveau}>
                    <th scope="row" className="px-5 py-2.5 text-left font-medium">{niveauInfo(f.niveau).label}</th>
                    <td className="px-2 py-2.5 text-right">{fcfa(f.inscription)}</td>
                    <td className="px-2 py-2.5 text-right">{fcfa(f.tranche)}</td>
                    <td className="px-2 py-2.5 text-right">{fcfa(f.ape)}</td>
                    <td className="px-5 py-2.5 text-right font-semibold">{fcfa(f.inscription + f.ape + f.tranche * 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panneau>

        <BandeauReinitialisation />
      </div>
    </>
  )
}
