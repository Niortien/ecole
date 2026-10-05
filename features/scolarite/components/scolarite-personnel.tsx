'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { IconCash } from '@tabler/icons-react'
import { Recherche, Selection } from '@/components/common/champs'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { Panneau } from '@/components/common/panneau'
import { StatusPill, type Ton } from '@/components/common/status-pill'
import { boutonClasses } from '@/components/common/button-link'
import { messageErreur } from '@/lib/api'
import type { StatutGlobal } from '@/lib/domain/scolarite'
import { fcfa } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useClasses } from '@/features/classes/query/classes-queries'
import { useScolarite } from '../query/scolarite-queries'
import { PanneauPaiement } from './panneau-paiement'

const STATUTS: { cle: StatutGlobal | undefined; label: string }[] = [
  { cle: undefined, label: 'Tous' },
  { cle: 'EN_RETARD', label: 'En retard' },
  { cle: 'A_JOUR', label: 'À jour' },
  { cle: 'SOLDE', label: 'Soldés' },
]

const PASTILLE: Record<StatutGlobal, { label: string; ton: Ton }> = {
  EN_RETARD: { label: 'En retard', ton: 'alerte' },
  A_JOUR: { label: 'À jour', ton: 'ok' },
  SOLDE: { label: 'Soldé', ton: 'neutre' },
}

export function ScolaritePersonnel() {
  const [statut, setStatut] = useState<StatutGlobal | undefined>('EN_RETARD')
  const [classeId, setClasseId] = useState('')
  const [recherche, setRecherche] = useState('')
  const [choisi, setChoisi] = useState('')
  const differee = useDeferredValue(recherche)
  const filtres = useMemo(() => ({ statut, classeId: classeId || undefined, recherche: differee }), [statut, classeId, differee])
  const { data, isLoading, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useScolarite(filtres)
  const { data: classesData } = useClasses()

  const lignes = data?.pages.flatMap((p) => p.data) ?? []
  const resume = data?.pages[0]?.resume
  const total = data?.pages[0]?.meta.total ?? 0

  return (
    <>
      <PageHeader titre="Scolarité" description="Encaissements, soldes et impayés. Les plus gros retards sont en tête de liste." />

      {resume && (
        <Panneau className="mb-6" titre="Situation de l’école">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Attendu sur l’année', valeur: fcfa(resume.attendu) },
              { label: 'Déjà encaissé', valeur: fcfa(resume.encaisse) },
              { label: 'Reste à encaisser', valeur: fcfa(resume.reste) },
              { label: 'Exigible et impayé', valeur: fcfa(resume.enRetard), aide: `${resume.nbEnRetard} élèves concernés` },
            ].map((c) => (
              <div key={c.label}>
                <dt className="text-sm text-encre-doux">{c.label}</dt>
                <dd className="font-display text-2xl font-bold tabular-nums">{c.valeur}</dd>
                {c.aide && <dd className="text-xs text-encre-doux">{c.aide}</dd>}
              </div>
            ))}
          </dl>
        </Panneau>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_26rem] lg:items-start">
        <div>
          <div className="no-print mb-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
              <Recherche aria-label="Rechercher un élève" placeholder="Nom, prénom ou matricule" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
              <Selection aria-label="Filtrer par classe" value={classeId} onChange={(e) => setClasseId(e.target.value)}>
                <option value="">Toutes les classes</option>
                {(classesData?.data ?? []).map((c) => (
                  <option key={c.classe.id} value={c.classe.id}>
                    {c.classe.libelle}
                  </option>
                ))}
              </Selection>
            </div>
            <div role="group" aria-label="Filtrer par situation" className="flex flex-wrap gap-2">
              {STATUTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  aria-pressed={statut === s.cle}
                  onClick={() => setStatut(s.cle)}
                  className={cn('min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors', statut === s.cle ? 'border-ardoise bg-ardoise text-white' : 'border-trait bg-surface hover:border-encre-doux')}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <ChargementListe libelle="Chargement des soldes" />
          ) : isError ? (
            <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />
          ) : lignes.length === 0 ? (
            <EtatVide icone={IconCash} titre="Aucun élève dans cette vue" texte="Changez de filtre pour voir d’autres situations." />
          ) : (
            <>
              <p aria-live="polite" className="mb-2 text-sm text-encre-doux">
                {total} élève{total > 1 ? 's' : ''}
              </p>
              <ul className="divide-y divide-trait overflow-hidden rounded-[1.25rem] border border-trait bg-surface">
                {lignes.map((l) => (
                  <li key={l.matricule}>
                    <button
                      type="button"
                      aria-pressed={choisi === l.matricule}
                      onClick={() => setChoisi(l.matricule)}
                      className={cn('flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors', choisi === l.matricule ? 'bg-ardoise-pale' : 'hover:bg-papier-2')}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {l.nom} {l.prenoms}
                        </span>
                        <span className="text-sm text-encre-doux">{l.classe.libelle}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-semibold tabular-nums">{l.enRetard > 0 ? fcfa(l.enRetard) : fcfa(l.reste)}</span>
                        <StatusPill label={PASTILLE[l.statut].label} ton={PASTILLE[l.statut].ton} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {hasNextPage && (
                <div className="mt-4 flex justify-center">
                  <button type="button" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage} className={boutonClasses({ variante: 'secondaire' })}>
                    {isFetchingNextPage ? 'Chargement…' : `Afficher plus (${lignes.length} sur ${total})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-4">
          {choisi ? <PanneauPaiement key={choisi} matricule={choisi} onFermer={() => setChoisi('')} /> : <EtatVide icone={IconCash} titre="Choisissez un élève" texte="Sa situation, ses reçus et l’enregistrement d’un paiement s’affichent ici." />}
        </div>
      </div>
    </>
  )
}
