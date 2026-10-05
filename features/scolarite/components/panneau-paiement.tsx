'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandWhatsapp, IconReceipt2, IconX } from '@tabler/icons-react'
import { Champ, Saisie, Selection } from '@/components/common/champs'
import { ChargementListe, EtatErreur } from '@/components/common/etats'
import { Panneau } from '@/components/common/panneau'
import { StatusPill, type Ton } from '@/components/common/status-pill'
import { boutonClasses } from '@/components/common/button-link'
import { ecoleDemo } from '@/config/app.config'
import { messageErreur } from '@/lib/api'
import { formaterDate } from '@/lib/domain/calendrier'
import { MODE_PAIEMENT_LABEL, OBJET_LABEL, messageRelance, type StatutLigne } from '@/lib/domain/scolarite'
import { fcfa, lienWhatsapp } from '@/lib/format'
import { useFicheEleve } from '@/features/eleves/query/eleves-queries'
import { MODES, OBJETS_PAYABLES, paiementSchema, type PaiementFormData } from '../schema/paiement-schema'
import { useEnregistrerPaiement } from '../query/scolarite-queries'

const LIGNE: Record<StatutLigne, { label: string; ton: Ton }> = {
  PAYE: { label: 'Payé', ton: 'ok' },
  PARTIEL: { label: 'Partiel', ton: 'attention' },
  A_VENIR: { label: 'À venir', ton: 'neutre' },
  EN_RETARD: { label: 'En retard', ton: 'alerte' },
}

export function PanneauPaiement({ matricule, onFermer }: { matricule: string; onFermer: () => void }) {
  const { data, isLoading, isError, error, refetch } = useFicheEleve(matricule)
  const router = useRouter()
  const enregistrer = useEnregistrerPaiement()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PaiementFormData>({
    resolver: zodResolver(paiementSchema),
    defaultValues: { mode: 'WAVE', objet: 'TRANCHE_1' },
  })
  const objet = useWatch({ control, name: 'objet' })

  if (isLoading) return <ChargementListe lignes={4} libelle="Chargement de la scolarité" />
  if (isError || !data?.data.scolarite) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  const { eleve, parents, scolarite } = data.data
  const { situation, paiements } = scolarite
  const parent = parents[0]
  const ligneChoisie = situation.lignes.find((l) => l.objet === objet)

  const envoyer = handleSubmit(async (valeurs) => {
    try {
      const { data: paiement } = await enregistrer.mutateAsync({ matricule, ...valeurs })
      reset({ mode: valeurs.mode, objet: valeurs.objet })
      router.push(`/scolarite/recu/${paiement.id}`)
    } catch {
      // Le message d'erreur est déjà affiché par la mutation (toast) : rien d'autre à faire ici.
    }
  })

  return (
    <Panneau
      titre={`${eleve.prenoms} ${eleve.nom}`}
      description={`${fcfa(situation.paye)} payés sur ${fcfa(situation.total)} · reste ${fcfa(situation.reste)}`}
      actions={
        <button type="button" onClick={onFermer} aria-label="Fermer le détail" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-papier-2">
          <IconX size={20} aria-hidden="true" />
        </button>
      }
    >
      <ul className="divide-y divide-trait">
        {situation.lignes.map((l) => (
          <li key={l.objet} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span>
              <span className="block font-medium">{OBJET_LABEL[l.objet]}</span>
              <span className="text-xs text-encre-doux">échéance {formaterDate(l.echeance, 'court')}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="tabular-nums">{fcfa(l.reste)}</span>
              <StatusPill label={LIGNE[l.statut].label} ton={LIGNE[l.statut].ton} />
            </span>
          </li>
        ))}
      </ul>

      {situation.enRetard > 0 && parent && (
        <a
          href={lienWhatsapp(parent.telephone, messageRelance({ parent: `${parent.prenoms} ${parent.nom}`, eleve: eleve.prenoms, enRetard: situation.enRetard, ecole: ecoleDemo.nom }))}
          target="_blank"
          rel="noopener noreferrer"
          className={`${boutonClasses({ variante: 'secondaire' })} mt-4`}
        >
          <IconBrandWhatsapp size={18} className="text-ardoise" aria-hidden="true" />
          Relancer le parent ({fcfa(situation.enRetard)})
        </a>
      )}

      <form onSubmit={envoyer} noValidate className="mt-5 grid gap-3 rounded-2xl bg-papier-2 p-4 sm:grid-cols-2">
        <h3 className="text-lg font-semibold sm:col-span-2">Enregistrer un paiement</h3>
        <Champ id="pay-objet" label="Ligne réglée" erreur={errors.objet?.message}>
          <Selection
            id="pay-objet"
            {...register('objet', {
              onChange: (e) => {
                const l = situation.lignes.find((x) => x.objet === e.target.value)
                if (l && l.reste > 0) setValue('montant', l.reste)
              },
            })}
          >
            {OBJETS_PAYABLES.map((o) => (
              <option key={o} value={o}>
                {OBJET_LABEL[o]}
              </option>
            ))}
          </Selection>
        </Champ>
        <Champ id="pay-montant" label="Montant (FCFA)" erreur={errors.montant?.message} aide={ligneChoisie ? `Reste ${fcfa(ligneChoisie.reste)} sur cette ligne` : undefined}>
          <Saisie id="pay-montant" type="number" inputMode="numeric" aria-invalid={!!errors.montant} {...register('montant', { valueAsNumber: true })} />
        </Champ>
        <Champ id="pay-mode" label="Mode de paiement" erreur={errors.mode?.message} className="sm:col-span-2">
          <Selection id="pay-mode" {...register('mode')}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_PAIEMENT_LABEL[m]}
              </option>
            ))}
          </Selection>
        </Champ>
        <button type="submit" disabled={enregistrer.isPending} className={`${boutonClasses({ variante: 'primaire' })} sm:col-span-2`}>
          {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer et éditer le reçu'}
        </button>
      </form>

      {paiements.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-lg font-semibold">Reçus</h3>
          <ul className="divide-y divide-trait text-sm">
            {paiements.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="block font-medium">
                    {OBJET_LABEL[p.objet]} · {fcfa(p.montant)}
                  </span>
                  <span className="text-xs text-encre-doux">
                    {formaterDate(p.date, 'court')} · {MODE_PAIEMENT_LABEL[p.mode]} · {p.recu}
                  </span>
                </span>
                <Link href={`/scolarite/recu/${p.id}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-trait px-3 font-semibold hover:border-ardoise">
                  <IconReceipt2 size={16} aria-hidden="true" />
                  Reçu
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panneau>
  )
}
