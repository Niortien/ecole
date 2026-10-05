'use client'

import { useDeferredValue, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Champ, Recherche, Saisie, Selection } from '@/components/common/champs'
import { boutonClasses } from '@/components/common/button-link'
import { SANCTION_LABEL } from '@/lib/domain/vie-scolaire'
import { useEleves } from '@/features/eleves/query/eleves-queries'
import { sanctionSchema, TYPES_SANCTION, type SanctionFormData } from '../schema/sanction-schema'
import { useCreerSanction } from '../query/discipline-queries'

export function FormulaireSanction({ onTermine }: { onTermine: () => void }) {
  const creer = useCreerSanction()
  const [recherche, setRecherche] = useState('')
  const [choisi, setChoisi] = useState<string>('')
  const differee = useDeferredValue(recherche)
  const { data } = useEleves({ recherche: differee, limit: 6 })
  const suggestions = recherche.trim().length >= 2 ? (data?.pages[0]?.data ?? []).slice(0, 6) : []

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SanctionFormData>({
    resolver: zodResolver(sanctionSchema),
    defaultValues: { type: 'AVERTISSEMENT', matricule: '', motif: '' },
  })
  const type = useWatch({ control, name: 'type' })

  const envoyer = handleSubmit(async (valeurs) => {
    try {
      await creer.mutateAsync(valeurs)
      onTermine()
    } catch {
      // Message déjà affiché par la mutation.
    }
  })

  return (
    <form onSubmit={envoyer} noValidate className="grid gap-4 rounded-[1.25rem] border border-trait bg-surface p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Champ id="eleve-sanction" label="Élève concerné" erreur={errors.matricule?.message}>
          <Recherche
            id="eleve-sanction"
            placeholder="Tapez un nom ou un matricule"
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value)
              setChoisi('')
              setValue('matricule', '')
            }}
          />
        </Champ>
        {suggestions.length > 0 && !choisi && (
          <ul className="mt-2 divide-y divide-trait overflow-hidden rounded-xl border border-trait">
            {suggestions.map(({ eleve, classe }) => (
              <li key={eleve.matricule}>
                <button
                  type="button"
                  className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-3.5 text-left hover:bg-papier-2"
                  onClick={() => {
                    setChoisi(eleve.matricule)
                    setRecherche(`${eleve.nom} ${eleve.prenoms} (${classe.libelle})`)
                    setValue('matricule', eleve.matricule, { shouldValidate: true })
                  }}
                >
                  <span className="font-medium">
                    {eleve.nom} {eleve.prenoms}
                  </span>
                  <span className="text-sm text-encre-doux">{classe.libelle}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Champ id="type-sanction" label="Type de sanction" erreur={errors.type?.message}>
        <Selection id="type-sanction" {...register('type')}>
          {TYPES_SANCTION.map((t) => (
            <option key={t} value={t}>
              {SANCTION_LABEL[t]}
            </option>
          ))}
        </Selection>
      </Champ>

      {type === 'EXCLUSION_TEMPORAIRE' && (
        <Champ id="jours-exclusion" label="Durée de l’exclusion (jours)" erreur={errors.joursExclusion?.message}>
          <Saisie id="jours-exclusion" type="number" min={1} max={8} inputMode="numeric" {...register('joursExclusion', { valueAsNumber: true })} />
        </Champ>
      )}

      <Champ id="motif-sanction" label="Motif" erreur={errors.motif?.message} aide="Faits précis, sans jugement sur l’enfant." className="sm:col-span-2">
        <textarea
          id="motif-sanction"
          rows={2}
          aria-invalid={!!errors.motif}
          {...register('motif')}
          className="w-full rounded-xl border border-trait bg-surface px-3.5 py-2 text-base focus:border-ardoise"
        />
      </Champ>

      <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
        <button type="button" onClick={onTermine} className={boutonClasses({ variante: 'discret' })}>
          Annuler
        </button>
        <button type="submit" disabled={creer.isPending} className={boutonClasses({ variante: 'primaire' })}>
          {creer.isPending ? 'Enregistrement…' : 'Déclarer la sanction'}
        </button>
      </div>
    </form>
  )
}
