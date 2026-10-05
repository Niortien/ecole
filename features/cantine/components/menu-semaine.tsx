import { IconToolsKitchen2 } from '@tabler/icons-react'
import { Panneau } from '@/components/common/panneau'
import { dateDuJour } from '@/lib/clock'
import { formaterDate } from '@/lib/domain/calendrier'
import { cn } from '@/lib/utils'
import type { CantineJour } from '../types'

export function MenuSemaine({ semaine, afficherEffectifs }: { semaine: CantineJour[]; afficherEffectifs: boolean }) {
  const aujourdhui = dateDuJour()
  return (
    <Panneau titre="Menu de la semaine" sansRemplissage>
      <ul className="divide-y divide-trait">
        {semaine.map((j) => (
          <li key={j.date} className={cn('flex items-start justify-between gap-4 px-5 py-3.5', j.date === aujourdhui && 'bg-crayon-pale/50')}>
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold capitalize">
                {formaterDate(j.date).split(' ').slice(0, 3).join(' ')}
                {j.date === aujourdhui && <span className="rounded-full bg-crayon px-2 py-0.5 text-xs font-bold normal-case">Aujourd’hui</span>}
              </span>
              {j.menu ? (
                <span className="mt-0.5 flex items-start gap-2">
                  <IconToolsKitchen2 size={16} className="mt-1 shrink-0 text-ardoise" aria-hidden="true" />
                  <span>
                    {j.menu.plat}
                    {j.menu.dessert && <span className="text-encre-doux"> · {j.menu.dessert}</span>}
                  </span>
                </span>
              ) : (
                <span className="text-sm text-encre-doux">Menu pas encore publié</span>
              )}
            </span>
            {afficherEffectifs && <span className="shrink-0 text-sm tabular-nums text-encre-doux">{j.repas} repas</span>}
          </li>
        ))}
      </ul>
    </Panneau>
  )
}
