'use client'

import Link from 'next/link'
import { IconDeviceMobileDollar, IconReceipt2 } from '@tabler/icons-react'
import { ChargementListe, EtatErreur } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { Panneau } from '@/components/common/panneau'
import { StatusPill, type Ton } from '@/components/common/status-pill'
import { messageErreur } from '@/lib/api'
import { formaterDate } from '@/lib/domain/calendrier'
import { MODE_PAIEMENT_LABEL, OBJET_LABEL, type StatutLigne } from '@/lib/domain/scolarite'
import { fcfa } from '@/lib/format'
import { useScolariteEnfants } from '../query/scolarite-queries'

const LIGNE: Record<StatutLigne, { label: string; ton: Ton }> = {
  PAYE: { label: 'Payé', ton: 'ok' },
  PARTIEL: { label: 'Partiel', ton: 'attention' },
  A_VENIR: { label: 'À venir', ton: 'neutre' },
  EN_RETARD: { label: 'En retard', ton: 'alerte' },
}

export function ScolariteParent() {
  const { data, isLoading, isError, error, refetch } = useScolariteEnfants()
  if (isLoading) return <ChargementListe lignes={4} libelle="Chargement de la scolarité" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  return (
    <>
      <PageHeader titre="Scolarité" description="Ce qui est payé, ce qui reste, et vos reçus." />

      <p className="mb-6 flex items-start gap-3 rounded-[1.25rem] border border-trait bg-surface p-4 text-sm">
        <IconDeviceMobileDollar size={22} className="mt-0.5 shrink-0 text-ardoise" aria-hidden="true" />
        <span>
          Vous pouvez payer à l’économat ou par Wave, Orange Money ou MTN Money. Indiquez le <strong>matricule de l’enfant</strong> comme référence : l’économat enregistre votre paiement et vous recevez un reçu ici.
        </span>
      </p>

      <div className="space-y-6">
        {data.data.map(({ matricule, nom, classe, situation, paiements }) => (
          <Panneau key={matricule} titre={nom} description={`${classe} · matricule ${matricule}`}>
            <p className="mb-3 text-sm">
              <strong className="tabular-nums">{fcfa(situation.paye)}</strong> payés sur <span className="tabular-nums">{fcfa(situation.total)}</span>
              {situation.enRetard > 0 && <span className="font-semibold text-stylo"> · {fcfa(situation.enRetard)} en retard</span>}
            </p>
            <ul className="divide-y divide-trait">
              {situation.lignes.map((l) => (
                <li key={l.objet} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="block font-medium">{OBJET_LABEL[l.objet]}</span>
                    <span className="text-xs text-encre-doux">avant le {formaterDate(l.echeance, 'court')}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums">{l.reste > 0 ? fcfa(l.reste) : fcfa(l.du)}</span>
                    <StatusPill label={LIGNE[l.statut].label} ton={LIGNE[l.statut].ton} />
                  </span>
                </li>
              ))}
            </ul>
            {paiements.length > 0 && (
              <>
                <h3 className="mt-5 mb-1 text-lg font-semibold">Mes reçus</h3>
                <ul className="divide-y divide-trait text-sm">
                  {paiements.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span>
                        <span className="block font-medium">
                          {OBJET_LABEL[p.objet]} · {fcfa(p.montant)}
                        </span>
                        <span className="text-xs text-encre-doux">
                          {formaterDate(p.date, 'court')} · {MODE_PAIEMENT_LABEL[p.mode]}
                        </span>
                      </span>
                      <Link href={`/scolarite/recu/${p.id}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-trait px-3 font-semibold hover:border-ardoise">
                        <IconReceipt2 size={16} aria-hidden="true" />
                        Reçu
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panneau>
        ))}
      </div>
    </>
  )
}
