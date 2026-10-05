import { cn } from '@/lib/utils'

interface AvatarProps {
  nom: string
  prenoms: string
  taille?: 'md' | 'lg'
  className?: string
}

const TEINTES = ['bg-ardoise-pale text-ardoise-fonce', 'bg-crayon-pale text-crayon-texte', 'bg-bille-pale text-bille', 'bg-papier-3 text-encre']

/** Initiales sur fond teinté (aucune photo d'enfant n'est stockée dans la démo). */
export function AvatarInitiales({ nom, prenoms, taille = 'md', className }: AvatarProps) {
  const initiales = `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  const teinte = TEINTES[(nom.length + prenoms.length) % TEINTES.length]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold',
        taille === 'lg' ? 'h-16 w-16 text-2xl' : 'h-11 w-11 text-base',
        teinte,
        className
      )}
    >
      {initiales}
    </span>
  )
}
