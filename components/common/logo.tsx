import { cn } from '@/lib/utils'
import { appConfig } from '@/config/app.config'

/** Marque : un cahier ouvert dessiné en SVG (aucune image à charger) + le nom du logiciel. */
export function Logo({ className, nom = true }: { className?: string; nom?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-display text-xl font-bold text-encre', className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="34" height="34" rx="10" className="fill-ardoise" />
        <path d="M17 9.5c-2.4-1.6-5.4-2-8.5-1.6v15.2c3.1-.4 6.1 0 8.5 1.6 2.4-1.6 5.4-2 8.5-1.6V7.9c-3.1-.4-6.1 0-8.5 1.6Z" className="fill-papier" />
        <path d="M17 9.5v15.2" className="stroke-ardoise" strokeWidth="1.4" />
        <path d="M11 12.6c1.3-.1 2.6 0 3.8.5M11 15.7c1.3-.1 2.6 0 3.8.5M20 13.1c1.2-.5 2.5-.6 3.8-.5" className="stroke-encre-doux" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="24.5" cy="9" r="3.2" className="fill-crayon" />
      </svg>
      {nom && <span>{appConfig.name}</span>}
    </span>
  )
}
