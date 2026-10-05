import { IconCalendarOff } from '@tabler/icons-react'
import { Panneau } from '@/components/common/panneau'
import type { CoursDuJour } from '../types'

export function CoursDuJourListe({ cours }: { cours: CoursDuJour[] }) {
  return (
    <Panneau titre="Mes cours aujourd’hui">
      {cours.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-encre-doux">
          <IconCalendarOff size={18} aria-hidden="true" />
          Pas de cours aujourd’hui.
        </p>
      ) : (
        <ol className="space-y-3">
          {cours.map((c) => (
            <li key={c.id} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-sm font-semibold tabular-nums">
                {c.debut} – {c.fin}
              </span>
              <span className="min-w-0 flex-1 border-l-2 border-crayon pl-4">
                <span className="block font-medium">{c.matiere}</span>
                <span className="text-sm text-encre-doux">
                  {c.classe} · {c.salle}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panneau>
  )
}
