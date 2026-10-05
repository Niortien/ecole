'use client'

import { useState } from 'react'
import { IconAlertTriangle, IconCheck, IconClockHour4, IconFileCheck, IconX } from '@tabler/icons-react'
import { Selection } from '@/components/common/champs'
import { boutonClasses } from '@/components/common/button-link'
import { cn } from '@/lib/utils'
import type { StatutPresence } from '@/types/domain'
import { useEnregistrerAppel } from '../query/presences-queries'
import type { AppelClasse } from '../types'

const CHOIX: { statut: StatutPresence; label: string; icone: typeof IconCheck; actif: string }[] = [
  { statut: 'PRESENT', label: 'Présent', icone: IconCheck, actif: 'border-ardoise bg-ardoise text-white' },
  { statut: 'RETARD', label: 'Retard', icone: IconClockHour4, actif: 'border-crayon bg-crayon text-encre' },
  { statut: 'ABSENT', label: 'Absent', icone: IconX, actif: 'border-stylo bg-stylo text-white' },
  { statut: 'ABSENT_JUSTIFIE', label: 'Justifié', icone: IconFileCheck, actif: 'border-bille bg-bille text-white' },
]

interface Choix {
  statut: StatutPresence | null
  retardMinutes?: number
}

export function FormulaireAppel({ appel }: { appel: AppelClasse }) {
  const enregistrer = useEnregistrerAppel()
  const [choix, setChoix] = useState<Record<string, Choix>>(() =>
    Object.fromEntries(appel.lignes.map((l) => [l.matricule, { statut: l.statut, retardMinutes: l.retardMinutes }]))
  )

  const valeurs = Object.values(choix)
  const nbPresents = valeurs.filter((c) => c.statut === 'PRESENT' || c.statut === 'RETARD').length
  const nbAbsents = valeurs.filter((c) => c.statut === 'ABSENT' || c.statut === 'ABSENT_JUSTIFIE').length
  const nbNonPointes = valeurs.filter((c) => c.statut === null).length

  function definir(matricule: string, statut: StatutPresence) {
    setChoix((c) => ({ ...c, [matricule]: { statut, retardMinutes: statut === 'RETARD' ? (c[matricule]?.retardMinutes ?? 10) : undefined } }))
  }

  function toutPresent() {
    setChoix((c) => Object.fromEntries(Object.entries(c).map(([m, v]) => [m, v.statut === null ? { statut: 'PRESENT' as const } : v])))
  }

  function sauvegarder() {
    enregistrer.mutate({
      classeId: appel.classe.id,
      date: appel.date,
      demiJournee: appel.demiJournee,
      lignes: Object.entries(choix).flatMap(([matricule, c]) => (c.statut ? [{ matricule, statut: c.statut, retardMinutes: c.retardMinutes }] : [])),
    })
  }

  return (
    <div>
      <ul className="divide-y divide-trait overflow-hidden rounded-[1.25rem] border border-trait bg-surface">
        {appel.lignes.map((l) => {
          const c = choix[l.matricule]
          return (
            <li key={l.matricule} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {l.nom} {l.prenoms}
                </span>
                {l.absencesConsecutives >= 2 && (
                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-stylo">
                    <IconAlertTriangle size={13} aria-hidden="true" />
                    {l.absencesConsecutives} jours d’absence avant aujourd’hui
                  </span>
                )}
              </span>
              <div role="group" aria-label={`Présence de ${l.prenoms} ${l.nom}`} className="grid grid-cols-4 gap-1 sm:w-[22rem]">
                {CHOIX.map((o) => {
                  const Icone = o.icone
                  const choisi = c?.statut === o.statut
                  return (
                    <button
                      key={o.statut}
                      type="button"
                      aria-pressed={choisi}
                      onClick={() => definir(l.matricule, o.statut)}
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-lg border px-1 text-xs font-semibold transition-colors',
                        choisi ? o.actif : 'border-trait bg-surface text-encre-doux hover:border-encre-doux'
                      )}
                    >
                      <Icone size={14} aria-hidden="true" />
                      {o.label}
                    </button>
                  )
                })}
              </div>
              {c?.statut === 'RETARD' && (
                <Selection
                  aria-label={`Minutes de retard de ${l.prenoms}`}
                  value={c.retardMinutes ?? 10}
                  onChange={(e) => setChoix((x) => ({ ...x, [l.matricule]: { statut: 'RETARD', retardMinutes: Number(e.target.value) } }))}
                  className="w-28"
                >
                  {[5, 10, 15, 20, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m} min
                    </option>
                  ))}
                </Selection>
              )}
            </li>
          )
        })}
      </ul>

      <div className="pb-safe sticky bottom-16 z-20 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-trait bg-papier/95 p-3 backdrop-blur-md lg:bottom-4">
        <p role="status" aria-live="polite" className="text-sm">
          <strong className="tabular-nums">{nbPresents}</strong> présents · <strong className="tabular-nums">{nbAbsents}</strong> absents ·{' '}
          <span className={nbNonPointes > 0 ? 'font-semibold text-crayon-texte' : 'text-encre-doux'}>
            <strong className="tabular-nums">{nbNonPointes}</strong> à pointer
          </span>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={toutPresent} disabled={nbNonPointes === 0} className={boutonClasses({ variante: 'secondaire' })}>
            Tous les autres présents
          </button>
          <button type="button" onClick={sauvegarder} disabled={enregistrer.isPending || nbNonPointes === appel.lignes.length} className={boutonClasses({ variante: 'primaire' })}>
            {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer l’appel'}
          </button>
        </div>
      </div>
    </div>
  )
}
