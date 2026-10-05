'use client'

import { useState } from 'react'
import { IconAlertTriangle, IconToolsKitchen2 } from '@tabler/icons-react'
import { ChargementListe, EtatErreur } from '@/components/common/etats'
import { Onglets } from '@/components/common/onglets'
import { PageHeader } from '@/components/common/page-header'
import { Panneau } from '@/components/common/panneau'
import { StatusPill } from '@/components/common/status-pill'
import { messageErreur } from '@/lib/api'
import { JOUR_LABEL, formaterDate } from '@/lib/domain/calendrier'
import { useCantine } from '../query/cantine-queries'
import { GestionAbonnements } from './gestion-abonnements'
import { MenuSemaine } from './menu-semaine'

type Cle = 'jour' | 'menu' | 'abonnements'

export function CantineVue() {
  const { data, isLoading, isError, error, refetch } = useCantine()
  const [onglet, setOnglet] = useState<Cle>('jour')

  if (isLoading) return <ChargementListe lignes={4} libelle="Chargement de la cantine" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  const { semaine, aujourdhui, enfants, gestionnaire } = data.data

  // Parent : menu + abonnement de chaque enfant
  if (enfants) {
    return (
      <>
        <PageHeader titre="Cantine" description="Le menu de la semaine et l’abonnement de vos enfants." />
        <div className="grid gap-4 lg:grid-cols-2">
          <MenuSemaine semaine={semaine} afficherEffectifs={false} />
          <div className="space-y-4">
            {enfants.map((e) => (
              <Panneau key={e.matricule} titre={e.nom} description={e.classe}>
                {e.abonnement ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-encre-doux">Jours de repas</dt>
                      <dd className="font-medium">{e.abonnement.jours.map((j) => JOUR_LABEL[j]).join(', ')}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-encre-doux">Payé jusqu’en</dt>
                      <dd className="font-medium">{e.abonnement.payeJusqua}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-encre-doux">Allergies</dt>
                      <dd className="font-medium">{e.abonnement.allergies.length ? e.abonnement.allergies.join(', ') : 'Aucune signalée'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-encre-doux">Pas inscrit à la cantine. Adressez-vous à l’économat pour l’inscrire.</p>
                )}
              </Panneau>
            ))}
          </div>
        </div>
      </>
    )
  }

  const onglets: { cle: Cle; label: string }[] = [
    { cle: 'jour', label: 'Aujourd’hui' },
    { cle: 'menu', label: 'Menu de la semaine' },
    ...(gestionnaire ? [{ cle: 'abonnements' as const, label: 'Abonnements' }] : []),
  ]

  return (
    <>
      <PageHeader titre="Cantine" description="Liste du jour pour la cuisine, menu de la semaine et abonnements." />
      <Onglets ariaLabel="Sections de la cantine" onglets={onglets} actif={onglet} onChange={setOnglet} className="mb-5" />

      {onglet === 'jour' && aujourdhui && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panneau titre={`Repas du ${formaterDate(aujourdhui.date)}`}>
            <p className="flex items-start gap-2 text-lg">
              <IconToolsKitchen2 size={22} className="mt-0.5 shrink-0 text-ardoise" aria-hidden="true" />
              {aujourdhui.menu ? aujourdhui.menu.plat : 'Menu non publié'}
            </p>
            <p className="mt-4 font-display text-5xl font-bold tabular-nums">
              {aujourdhui.total}
              <span className="text-xl font-medium text-encre-doux"> repas à préparer</span>
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {aujourdhui.parClasse.map((c) => (
                <li key={c.classe} className="flex justify-between rounded-lg bg-papier-2 px-3 py-2">
                  <span>{c.classe}</span>
                  <span className="font-semibold tabular-nums">{c.nombre}</span>
                </li>
              ))}
            </ul>
          </Panneau>
          <Panneau titre="Allergies à respecter" description="À afficher en cuisine avant le service.">
            {aujourdhui.allergies.length === 0 ? (
              <p className="text-sm text-encre-doux">Aucune allergie signalée parmi les enfants attendus aujourd’hui.</p>
            ) : (
              <ul className="space-y-3">
                {aujourdhui.allergies.map((a) => (
                  <li key={a.allergie}>
                    <StatusPill ton="alerte" icone={IconAlertTriangle} label={`Sans ${a.allergie} · ${a.eleves.length}`} className="text-sm" />
                    <p className="mt-1 text-sm text-encre-doux">{a.eleves.join(', ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panneau>
        </div>
      )}
      {onglet === 'menu' && <MenuSemaine semaine={semaine} afficherEffectifs />}
      {onglet === 'abonnements' && gestionnaire && <GestionAbonnements />}
    </>
  )
}
