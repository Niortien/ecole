'use client'

import { useId, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

export interface Onglet<T extends string> {
  cle: T
  label: string
}

interface OngletsProps<T extends string> {
  onglets: Onglet<T>[]
  actif: T
  onChange: (cle: T) => void
  ariaLabel: string
  className?: string
}

/** Onglets accessibles (tablist) : flèches gauche/droite pour naviguer, défilement horizontal sur téléphone. */
export function Onglets<T extends string>({ onglets, actif, onChange, ariaLabel, className }: OngletsProps<T>) {
  const id = useId()

  function auClavier(e: KeyboardEvent<HTMLDivElement>) {
    const index = onglets.findIndex((o) => o.cle === actif)
    if (e.key === 'ArrowRight') onChange(onglets[(index + 1) % onglets.length].cle)
    if (e.key === 'ArrowLeft') onChange(onglets[(index - 1 + onglets.length) % onglets.length].cle)
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={auClavier}
      className={cn('no-print -mx-4 flex gap-1 overflow-x-auto border-b border-trait px-4 sm:mx-0 sm:px-0', className)}
    >
      {onglets.map((o) => {
        const selectionne = o.cle === actif
        return (
          <button
            key={o.cle}
            id={`${id}-${o.cle}`}
            role="tab"
            type="button"
            aria-selected={selectionne}
            tabIndex={selectionne ? 0 : -1}
            onClick={() => onChange(o.cle)}
            className={cn(
              '-mb-px min-h-11 shrink-0 cursor-pointer border-b-2 px-4 text-sm font-semibold transition-colors',
              selectionne ? 'border-ardoise text-ardoise' : 'border-transparent text-encre-doux hover:text-encre'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
