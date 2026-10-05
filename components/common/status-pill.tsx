import type { ComponentType } from 'react'
import type { IconProps } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export type Ton = 'ok' | 'attention' | 'alerte' | 'info' | 'neutre'

const TONS: Record<Ton, string> = {
  ok: 'bg-ardoise-pale text-ardoise-fonce',
  attention: 'bg-crayon-pale text-crayon-texte',
  alerte: 'bg-stylo-pale text-stylo',
  info: 'bg-bille-pale text-bille',
  neutre: 'bg-papier-2 text-encre-doux',
}

interface StatusPillProps {
  label: string
  ton: Ton
  icone?: ComponentType<IconProps>
  className?: string
}

/** Pastille de statut : teinte + icône + texte. La couleur n'est jamais seule pour porter le sens. */
export function StatusPill({ label, ton, icone: Icone, className }: StatusPillProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', TONS[ton], className)}>
      {Icone && <Icone size={13} aria-hidden="true" />}
      {label}
    </span>
  )
}
