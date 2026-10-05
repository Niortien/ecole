'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import { IconAlertTriangle, IconCash, IconUsers } from '@tabler/icons-react'
import { AvatarInitiales } from '@/components/common/avatar-initiales'
import { Recherche, Selection } from '@/components/common/champs'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { StatusPill } from '@/components/common/status-pill'
import { boutonClasses } from '@/components/common/button-link'
import { cn } from '@/lib/utils'
import { messageErreur } from '@/lib/api'
import { CYCLE_LABEL } from '@/lib/domain/niveaux'
import { useActeur } from '@/hooks/use-acteur'
import { useClasses } from '@/features/classes/query/classes-queries'
import { useEleves } from '../query/eleves-queries'
import type { FiltresEleves } from '../types'

const CYCLES = [
  { cle: undefined, label: 'Tous' },
  { cle: 'PRIMAIRE', label: CYCLE_LABEL.PRIMAIRE },
  { cle: 'COLLEGE', label: CYCLE_LABEL.COLLEGE },
  { cle: 'LYCEE', label: CYCLE_LABEL.LYCEE },
] as const

export function ListeEleves({ classeInitiale }: { classeInitiale?: string }) {
  const acteur = useActeur()
  const [recherche, setRecherche] = useState('')
  const [cycle, setCycle] = useState<FiltresEleves['cycle']>(undefined)
  const [classeId, setClasseId] = useState(classeInitiale ?? '')
  const rechercheDifferee = useDeferredValue(recherche)

  const { data: classes } = useClasses()
  const filtres = useMemo(
    () => ({ recherche: rechercheDifferee, cycle, classeId: classeId || undefined }),
    [rechercheDifferee, cycle, classeId]
  )
  const { data, isLoading, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useEleves(filtres)

  const eleves = data?.pages.flatMap((p) => p.data) ?? []
  const total = data?.pages[0]?.meta.total ?? 0
  const classesFiltrees = (classes?.data ?? []).filter((c) => !cycle || c.cycle === cycle)

  return (
    <>
      <PageHeader
        titre="Élèves"
        description={acteur?.role === 'ENSEIGNANT' ? 'Les élèves de vos classes.' : 'Tous les élèves de l’école. Un clic ouvre la fiche complète.'}
      />

      <div className="no-print mb-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <Recherche
            aria-label="Rechercher un élève par nom ou matricule"
            placeholder="Nom, prénom ou matricule"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <Selection aria-label="Filtrer par classe" value={classeId} onChange={(e) => setClasseId(e.target.value)}>
            <option value="">Toutes les classes</option>
            {classesFiltrees.map((c) => (
              <option key={c.classe.id} value={c.classe.id}>
                {c.classe.libelle}
              </option>
            ))}
          </Selection>
        </div>
        <div role="group" aria-label="Filtrer par cycle" className="flex flex-wrap gap-2">
          {CYCLES.map((c) => (
            <button
              key={c.label}
              type="button"
              aria-pressed={cycle === c.cle}
              onClick={() => {
                setCycle(c.cle)
                setClasseId('')
              }}
              className={cn(
                'min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors',
                cycle === c.cle ? 'border-ardoise bg-ardoise text-white' : 'border-trait bg-surface hover:border-encre-doux'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <ChargementListe libelle="Chargement des élèves" />
      ) : isError ? (
        <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />
      ) : eleves.length === 0 ? (
        <EtatVide
          icone={IconUsers}
          titre="Aucun élève trouvé"
          texte="Essayez un autre nom, ou retirez un filtre pour élargir la recherche."
          action={
            <button
              type="button"
              className={boutonClasses({ variante: 'secondaire' })}
              onClick={() => {
                setRecherche('')
                setCycle(undefined)
                setClasseId('')
              }}
            >
              Effacer les filtres
            </button>
          }
        />
      ) : (
        <>
          <p aria-live="polite" className="mb-3 text-sm text-encre-doux">
            {total} élève{total > 1 ? 's' : ''}
          </p>
          <ul className="divide-y divide-trait overflow-hidden rounded-[1.25rem] border border-trait bg-surface">
            {eleves.map(({ eleve, classe, absencesConsecutives, statutFinancier }) => (
              <li key={eleve.matricule}>
                <Link
                  href={`/eleves/${eleve.matricule}`}
                  className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-papier-2 sm:gap-4 sm:px-5"
                >
                  <AvatarInitiales nom={eleve.nom} prenoms={eleve.prenoms} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {eleve.nom} {eleve.prenoms}
                    </span>
                    <span className="block truncate text-sm text-encre-doux">
                      {classe.libelle} · <span className="tabular-nums">{eleve.matricule}</span>
                    </span>
                  </span>
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {(absencesConsecutives ?? 0) >= 3 && (
                      <StatusPill ton="alerte" icone={IconAlertTriangle} label={`${absencesConsecutives} jours d’absence`} />
                    )}
                    {statutFinancier === 'EN_RETARD' && <StatusPill ton="alerte" icone={IconCash} label="Impayé" />}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {hasNextPage && (
            <div className="mt-5 flex justify-center">
              <button type="button" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage} className={boutonClasses({ variante: 'secondaire' })}>
                {isFetchingNextPage ? 'Chargement…' : `Afficher plus (${eleves.length} sur ${total})`}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
