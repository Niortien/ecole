import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanneauProps {
  titre?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  /** Retire le remplissage interne (tableaux pleine largeur). */
  sansRemplissage?: boolean
}

/** Carte de contenu : fond blanc sur le papier, bordure fine. */
export function Panneau({ titre, description, actions, children, className, sansRemplissage }: PanneauProps) {
  return (
    <section className={cn('rounded-[1.25rem] border border-trait bg-surface', className)}>
      {(titre || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div>
            {titre && <h2 className="text-xl font-semibold">{titre}</h2>}
            {description && <p className="mt-0.5 text-sm text-encre-doux">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn(sansRemplissage ? 'mt-3' : 'p-5', (titre || actions) && !sansRemplissage && 'pt-4')}>{children}</div>
    </section>
  )
}
