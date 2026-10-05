import type { ReactNode } from 'react'

interface PageHeaderProps {
  titre: string
  description?: string
  /** Boutons d'action à droite (ou sous le titre sur téléphone). */
  actions?: ReactNode
}

export function PageHeader({ titre, description, actions }: PageHeaderProps) {
  return (
    <header className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl leading-tight font-bold sm:text-4xl">{titre}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-encre-doux">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
