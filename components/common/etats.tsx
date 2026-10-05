import type { ComponentType, ReactNode } from 'react'
import { IconAlertTriangle, type IconProps } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { boutonClasses } from './button-link'

interface EtatVideProps {
  icone: ComponentType<IconProps>
  titre: string
  texte?: string
  action?: ReactNode
}

/** État vide : dit pourquoi c'est vide et propose la suite. Jamais un simple « Aucun résultat ». */
export function EtatVide({ icone: Icone, titre, texte, action }: EtatVideProps) {
  return (
    <div className="flex flex-col items-center rounded-[1.25rem] border border-dashed border-trait px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-papier-2 text-encre-doux">
        <Icone size={24} aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-xl font-semibold">{titre}</p>
      {texte && <p className="mt-1 max-w-sm text-sm text-encre-doux">{texte}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function EtatErreur({ message, onReessayer }: { message: string; onReessayer?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-stylo/30 bg-stylo-pale p-4 text-sm text-stylo">
      <IconAlertTriangle size={20} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onReessayer && (
        <button type="button" onClick={onReessayer} className={boutonClasses({ variante: 'secondaire' })}>
          Réessayer
        </button>
      )}
    </div>
  )
}

export function Squelette({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-papier-3/70', className)} />
}

export function ChargementListe({ lignes = 5, libelle = 'Chargement' }: { lignes?: number; libelle?: string }) {
  return (
    <div role="status" aria-label={libelle} className="space-y-2">
      {Array.from({ length: lignes }, (_, i) => (
        <Squelette key={i} className="h-16" />
      ))}
    </div>
  )
}
