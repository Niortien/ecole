import Link from 'next/link'
import { IconCalendarEvent, IconChevronRight, IconToolsKitchen2 } from '@tabler/icons-react'
import { AvatarInitiales } from '@/components/common/avatar-initiales'
import { StatusPill } from '@/components/common/status-pill'
import { formaterDate } from '@/lib/domain/calendrier'
import { decimal, fcfa, ordinal } from '@/lib/format'
import type { EnfantCarte } from '../types'

export function CartesEnfants({ enfants }: { enfants: EnfantCarte[] }) {
  return (
    <section aria-labelledby="mes-enfants" className="mb-8">
      <h2 id="mes-enfants" className="mb-3 text-2xl font-semibold">
        Mes enfants
      </h2>
      <ul className="grid gap-4 lg:grid-cols-2">
        {enfants.map((e) => {
          const [prenoms, ...reste] = e.nom.split(' ')
          return (
            <li key={e.matricule} className="rounded-[1.25rem] border border-trait bg-surface p-5">
              <Link href={`/eleves/${e.matricule}`} className="group flex items-center gap-3">
                <AvatarInitiales nom={reste.join(' ')} prenoms={prenoms} />
                <span className="flex-1">
                  <span className="block font-display text-xl font-semibold">{e.nom}</span>
                  <span className="text-sm text-encre-doux">{e.classe}</span>
                </span>
                <IconChevronRight size={20} className="text-encre-doux transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-trait pt-4">
                <div>
                  <dt className="text-xs text-encre-doux">Moyenne du trimestre</dt>
                  <dd className="font-display text-2xl font-bold tabular-nums">
                    {e.moyenne === null ? '—' : decimal(e.moyenne)}
                    {e.moyenne !== null && <span className="text-sm font-medium text-encre-doux">/{e.bareme}</span>}
                  </dd>
                  {e.rang && <dd className="text-xs text-encre-doux">{ordinal(e.rang)} sur {e.effectif}</dd>}
                </div>
                <div>
                  <dt className="text-xs text-encre-doux">Scolarité</dt>
                  <dd className="mt-1">
                    {e.enRetard > 0 ? (
                      <StatusPill ton="alerte" label={`${fcfa(e.enRetard)} en retard`} />
                    ) : e.reste === 0 ? (
                      <StatusPill ton="ok" label="Soldée" />
                    ) : (
                      <StatusPill ton="ok" label="À jour" />
                    )}
                  </dd>
                  {e.prochaineEcheance && (
                    <dd className="mt-1 flex items-center gap-1 text-xs text-encre-doux">
                      <IconCalendarEvent size={14} aria-hidden="true" />
                      {e.prochaineEcheance.libelle} avant le {formaterDate(e.prochaineEcheance.date, 'court')}
                    </dd>
                  )}
                </div>
              </dl>

              {(e.absencesRecentes > 0 || e.menuDuJour) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-trait pt-4 text-sm">
                  {e.absencesRecentes > 0 && <StatusPill ton="attention" label={`Absent ${e.absencesRecentes} jour${e.absencesRecentes > 1 ? 's' : ''} de suite`} />}
                  {e.menuDuJour && (
                    <span className="inline-flex items-center gap-1.5 text-encre-doux">
                      <IconToolsKitchen2 size={16} aria-hidden="true" />
                      Cantine aujourd’hui : {e.menuDuJour}
                    </span>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
