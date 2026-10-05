'use client'

import { cn } from '@/lib/utils'

interface CelluleNoteProps {
  /** Texte affiché dans la cellule (peut être invalide : il n'est jamais effacé par l'application). */
  valeur: string
  onChange: (texte: string) => void
  onValider: () => void
  onAller: (direction: 'haut' | 'bas') => void
  etiquette: string
  /** Position pour la navigation au clavier. */
  ligne: number
  colonne: number
  erreur?: string
  disabled?: boolean
  nonValidee?: boolean
}

/**
 * Cellule de saisie d'une note. Entrée valide et descend ; flèches haut/bas changent de ligne ; Tab passe à la colonne
 * suivante. Une saisie invalide reste affichée avec son message : elle n'efface jamais la note en silence.
 */
export function CelluleNote({ valeur, onChange, onValider, onAller, etiquette, ligne, colonne, erreur, disabled, nonValidee }: CelluleNoteProps) {
  const idErreur = `err-${ligne}-${colonne}`
  return (
    <div className="relative">
      <input
        data-cell={`${ligne}-${colonne}`}
        value={valeur}
        disabled={disabled}
        inputMode="decimal"
        autoComplete="off"
        aria-label={etiquette}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? idErreur : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onValider}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onValider()
            onAller('bas')
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            onAller('bas')
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            onAller('haut')
          }
        }}
        className={cn(
          'h-11 w-16 rounded-lg border bg-surface text-center text-base font-semibold tabular-nums transition-colors disabled:bg-papier-2 disabled:text-encre-doux',
          erreur ? 'border-stylo bg-stylo-pale text-stylo' : nonValidee ? 'border-dashed border-crayon' : 'border-trait focus:border-ardoise'
        )}
      />
      {nonValidee && !erreur && <span aria-hidden="true" title="Pas encore validée" className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-crayon" />}
      {erreur && (
        <span id={idErreur} role="alert" className="sr-only">
          {erreur}
        </span>
      )}
    </div>
  )
}
