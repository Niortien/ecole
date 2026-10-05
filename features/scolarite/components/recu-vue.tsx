'use client'

import Link from 'next/link'
import { IconArrowLeft, IconBrandWhatsapp, IconPrinter } from '@tabler/icons-react'
import { ChargementListe, EtatErreur } from '@/components/common/etats'
import { boutonClasses } from '@/components/common/button-link'
import { ecoleDemo } from '@/config/app.config'
import { messageErreur } from '@/lib/api'
import { formaterDate } from '@/lib/domain/calendrier'
import { MODE_PAIEMENT_LABEL, OBJET_LABEL } from '@/lib/domain/scolarite'
import { fcfa, lienPartageWhatsapp } from '@/lib/format'
import { useActeur } from '@/hooks/use-acteur'
import { useRecu } from '../query/scolarite-queries'

export function RecuVue({ paiementId }: { paiementId: string }) {
  const acteur = useActeur()
  const { data, isLoading, isError, error, refetch } = useRecu(paiementId)
  const retour = acteur?.role === 'PARENT' ? '/scolarite' : '/scolarite'

  if (isLoading) return <ChargementListe lignes={4} libelle="Chargement du reçu" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  const { paiement, eleve, resteApres } = data.data
  const message = `Reçu ${paiement.recu} : ${fcfa(paiement.montant)} reçus pour ${eleve.prenoms} ${eleve.nom} (${OBJET_LABEL[paiement.objet].toLowerCase()}) le ${formaterDate(paiement.date, 'court')}. Merci.`

  return (
    <>
      <div className="no-print mb-5 flex flex-wrap items-center gap-2">
        <Link href={retour} className={boutonClasses({ variante: 'discret' })}>
          <IconArrowLeft size={18} aria-hidden="true" />
          Retour
        </Link>
        <button type="button" onClick={() => window.print()} className={boutonClasses({ variante: 'primaire' })}>
          <IconPrinter size={18} aria-hidden="true" />
          Imprimer
        </button>
        <a href={lienPartageWhatsapp(message)} target="_blank" rel="noopener noreferrer" className={boutonClasses({ variante: 'secondaire' })}>
          <IconBrandWhatsapp size={18} aria-hidden="true" />
          Envoyer par WhatsApp
        </a>
      </div>

      <article aria-label={`Reçu ${paiement.recu}`} className="print-page mx-auto max-w-xl rounded-[1.25rem] border border-trait bg-surface p-8">
        <header className="border-b-2 border-encre pb-4 text-center">
          <p className="font-display text-2xl font-bold">{ecoleDemo.nom}</p>
          <p className="text-sm text-encre-doux">
            {ecoleDemo.quartier}, {ecoleDemo.ville}
          </p>
          <p className="mt-3 inline-block rounded-lg border-2 border-encre px-4 py-1 font-display text-xl font-bold">REÇU DE PAIEMENT</p>
          <p className="mt-2 text-sm tabular-nums">N° {paiement.recu}</p>
        </header>

        <dl className="mt-5 space-y-2.5 text-base">
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Date</dt>
            <dd className="font-medium">{formaterDate(paiement.date)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Élève</dt>
            <dd className="text-right font-medium">
              {eleve.prenoms} {eleve.nom} · {eleve.classe}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Matricule</dt>
            <dd className="font-medium tabular-nums">{eleve.matricule}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Objet</dt>
            <dd className="font-medium">{OBJET_LABEL[paiement.objet]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Mode de paiement</dt>
            <dd className="font-medium">{MODE_PAIEMENT_LABEL[paiement.mode]}</dd>
          </div>
        </dl>

        <div className="mt-6 rounded-xl border-2 border-encre p-4 text-center">
          <p className="text-sm text-encre-doux">Montant reçu</p>
          <p className="font-display text-4xl font-bold tabular-nums">{fcfa(paiement.montant)}</p>
        </div>
        <p className="mt-3 text-center text-sm text-encre-doux">Reste à payer sur l’année : {fcfa(resteApres)}</p>

        <footer className="mt-10 grid grid-cols-2 gap-6 text-center text-xs text-encre-doux">
          <p className="border-t border-trait pt-2">Le parent</p>
          <p className="border-t border-trait pt-2">L’économe</p>
        </footer>
      </article>
    </>
  )
}
