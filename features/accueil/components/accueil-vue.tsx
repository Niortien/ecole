'use client'

import Link from 'next/link'
import { IconAlertTriangle, IconChevronRight, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react'
import { ChargementListe, EtatErreur } from '@/components/common/etats'
import { Panneau } from '@/components/common/panneau'
import { messageErreur } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useSalleDeSituation } from '../query/accueil-queries'
import type { Tache, TonTache } from '../types'
import { CartesEnfants } from './cartes-enfants'
import { CoursDuJourListe } from './cours-du-jour'

const TON: Record<TonTache, { fond: string; icone: typeof IconAlertTriangle; label: string }> = {
  alerte: { fond: 'bg-stylo-pale text-stylo', icone: IconAlertTriangle, label: 'Urgent' },
  attention: { fond: 'bg-crayon-pale text-crayon-texte', icone: IconAlertTriangle, label: 'À traiter' },
  info: { fond: 'bg-bille-pale text-bille', icone: IconInfoCircle, label: 'Information' },
  ok: { fond: 'bg-ardoise-pale text-ardoise-fonce', icone: IconCircleCheck, label: 'Fait' },
}

function CarteTache({ tache }: { tache: Tache }) {
  const ton = TON[tache.ton]
  const Icone = ton.icone
  return (
    <li>
      <Link
        href={tache.href}
        className="group flex min-h-20 items-center gap-4 rounded-[1.25rem] border border-trait bg-surface p-4 transition-colors hover:border-ardoise sm:p-5"
      >
        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-xl font-bold tabular-nums', ton.fond)}>
          <span aria-hidden="true">{tache.nombre}</span>
          <span className="sr-only">{ton.label} : {tache.nombre}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-semibold">
            <Icone size={16} aria-hidden="true" className={tache.ton === 'info' ? 'text-bille' : 'shrink-0'} />
            {tache.titre}
          </span>
          {tache.detail && <span className="mt-0.5 block text-sm text-encre-doux">{tache.detail}</span>}
        </span>
        <IconChevronRight size={20} className="shrink-0 text-encre-doux transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </li>
  )
}

export function AccueilVue() {
  const { data, isLoading, isError, error, refetch } = useSalleDeSituation()

  if (isLoading) return <ChargementListe lignes={4} libelle="Chargement de votre accueil" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  const { salutation, introduction, taches, chiffres, cours, enfants } = data.data

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl leading-tight font-bold sm:text-5xl">{salutation}.</h1>
        <p className="mt-2 max-w-2xl text-lg text-encre-doux">{introduction}</p>
      </header>

      {enfants && enfants.length > 0 && <CartesEnfants enfants={enfants} />}

      <section aria-labelledby="a-faire" className="mt-2">
        <h2 id="a-faire" className="mb-3 text-2xl font-semibold">
          À faire aujourd’hui
        </h2>
        {taches.length === 0 ? (
          <p className="flex items-center gap-3 rounded-[1.25rem] border border-ardoise/30 bg-ardoise-pale p-5 text-ardoise-fonce">
            <IconCircleCheck size={24} aria-hidden="true" />
            Tout est à jour. Rien ne demande votre attention pour le moment.
          </p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {taches.map((t) => (
              <CarteTache key={t.cle} tache={t} />
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {chiffres.length > 0 && (
          <Panneau titre="Aujourd’hui en chiffres">
            <dl className="divide-y divide-trait">
              {chiffres.map((c) => (
                <div key={c.label} className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <dt>
                    <span className="block font-medium">{c.label}</span>
                    {c.aide && <span className="text-xs text-encre-doux">{c.aide}</span>}
                  </dt>
                  <dd className="font-display text-2xl font-bold tabular-nums">{c.valeur}</dd>
                </div>
              ))}
            </dl>
          </Panneau>
        )}
        {cours && <CoursDuJourListe cours={cours} />}
      </div>
    </>
  )
}
