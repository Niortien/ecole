'use client'

import Link from 'next/link'
import { IconChevronRight, IconSchool } from '@tabler/icons-react'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { messageErreur } from '@/lib/api'
import { CYCLE_LABEL, examenDuNiveau } from '@/lib/domain/niveaux'
import { useActeur } from '@/hooks/use-acteur'
import { useClasses } from '../query/classes-queries'

export function ListeClasses() {
  const acteur = useActeur()
  const { data, isLoading, isError, error, refetch } = useClasses()
  const classes = data?.data ?? []

  return (
    <>
      <PageHeader
        titre="Classes"
        description={acteur?.role === 'ENSEIGNANT' ? 'Les classes où vous enseignez.' : 'Toutes les classes de l’école, par cycle.'}
      />
      {isLoading ? (
        <ChargementListe libelle="Chargement des classes" />
      ) : isError ? (
        <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />
      ) : classes.length === 0 ? (
        <EtatVide icone={IconSchool} titre="Aucune classe" texte="Aucune classe ne vous est rattachée pour le moment." />
      ) : (
        <div className="space-y-8">
          {(['PRIMAIRE', 'COLLEGE', 'LYCEE'] as const).map((cycle) => {
            const duCycle = classes.filter((c) => c.cycle === cycle)
            if (duCycle.length === 0) return null
            return (
              <section key={cycle} aria-labelledby={`cycle-${cycle}`}>
                <h2 id={`cycle-${cycle}`} className="mb-3 text-xl font-semibold">
                  {CYCLE_LABEL[cycle]}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {duCycle.map(({ classe, effectif, principal, matieresEnseignees }) => {
                    const examen = examenDuNiveau(classe.niveau)
                    return (
                      <li key={classe.id}>
                        <Link
                          href={`/eleves?classe=${classe.id}`}
                          className="group flex min-h-28 items-start justify-between gap-3 rounded-[1.25rem] border border-trait bg-surface p-5 transition-colors hover:border-ardoise"
                        >
                          <span>
                            <span className="block font-display text-2xl font-semibold">{classe.libelle}</span>
                            <span className="mt-1 block text-sm text-encre-doux">
                              {effectif} élèves · {classe.salle}
                            </span>
                            <span className="block text-sm text-encre-doux">{principal}</span>
                            {matieresEnseignees && matieresEnseignees.length > 0 && (
                              <span className="mt-2 block text-sm font-medium text-ardoise">{matieresEnseignees.map((m) => m.libelle).join(', ')}</span>
                            )}
                            {examen && <span className="mt-2 inline-block rounded-full bg-crayon-pale px-2.5 py-0.5 text-xs font-semibold text-crayon-texte">Classe d’examen : {examen}</span>}
                          </span>
                          <IconChevronRight size={20} className="mt-1 shrink-0 text-encre-doux transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
