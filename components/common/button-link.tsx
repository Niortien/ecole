import Link from 'next/link'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type Variante = 'primaire' | 'secondaire' | 'crayon' | 'discret'
type Taille = 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  primaire: 'bg-ardoise text-white hover:bg-ardoise-fonce',
  secondaire: 'border border-trait bg-surface text-encre hover:border-encre-doux',
  crayon: 'bg-crayon text-encre hover:brightness-95',
  discret: 'text-encre hover:bg-papier-2',
}

const TAILLES: Record<Taille, string> = {
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-14 px-7 text-base',
}

/** Classes d'un bouton : à utiliser aussi sur un `<button>` (`className={boutonClasses({...})}`). */
export function boutonClasses({
  variante = 'primaire',
  taille = 'md',
  className,
}: { variante?: Variante; taille?: Taille; className?: string } = {}) {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTES[variante],
    TAILLES[taille],
    className
  )
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variante?: Variante
  taille?: Taille
}

export function ButtonLink({ variante, taille, className, ...props }: ButtonLinkProps) {
  return <Link {...props} className={boutonClasses({ variante, taille, className })} />
}
