import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const BASE =
  'min-h-11 w-full rounded-xl border border-trait bg-surface px-3.5 text-base text-encre placeholder:text-encre-doux/70 focus:border-ardoise'

interface ChampProps {
  label: string
  /** Texte d'aide persistant sous le champ. */
  aide?: string
  erreur?: string
  children: ReactNode
  id: string
  className?: string
}

/** Étiquette visible + aide + erreur reliées au champ (jamais un simple placeholder). */
export function Champ({ label, aide, erreur, children, id, className }: ChampProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {aide && !erreur && (
        <p id={`${id}-aide`} className="mt-1 text-xs text-encre-doux">
          {aide}
        </p>
      )}
      {erreur && (
        <p id={`${id}-erreur`} role="alert" className="mt-1 text-sm text-stylo">
          {erreur}
        </p>
      )}
    </div>
  )
}

export function Saisie({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(BASE, className)} />
}

export function Selection({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(BASE, 'cursor-pointer pr-8', className)}>
      {children}
    </select>
  )
}

export function Recherche({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn('relative', className)}>
      <IconSearch size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-encre-doux" />
      <input type="search" {...props} className={cn(BASE, 'pl-10')} />
    </div>
  )
}
