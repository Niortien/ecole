'use client'

import { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { Onglets } from '@/components/common/onglets'
import { JOUR_LABEL } from '@/lib/domain/calendrier'
import { PLAGES_HORAIRES, enMinutes } from '@/lib/domain/emploi-du-temps'
import { cn } from '@/lib/utils'
import type { JourSemaine } from '@/types/domain'
import type { CreneauDetail, TypeCible } from '../types'

const TEINTES = ['bg-ardoise-pale border-ardoise/25', 'bg-crayon-pale border-crayon/40', 'bg-bille-pale border-bille/25', 'bg-papier-3 border-trait']

/** Une teinte stable par matière, pour repérer d'un coup d'œil les cours de même nature. */
const teinte = (matiereId: string) => TEINTES[[...matiereId].reduce((t, c) => t + c.charCodeAt(0), 0) % TEINTES.length]

const JOURS: JourSemaine[] = [1, 2, 3, 4, 5]

interface GrilleProps {
  creneaux: CreneauDetail[]
  type: TypeCible
  onSupprimer?: (id: string) => void
}

function Cours({ c, type, onSupprimer }: { c: CreneauDetail; type: TypeCible; onSupprimer?: (id: string) => void }) {
  return (
    <div className={cn('relative h-full rounded-xl border p-2.5 text-left', onSupprimer && 'pr-9', teinte(c.matiereId))}>
      <p className="text-sm leading-tight font-semibold">{c.matiere}</p>
      <p className="mt-0.5 text-xs text-encre-doux">
        {type === 'enseignant' ? c.classe : c.enseignant} · {c.salle}
      </p>
      {onSupprimer && (
        <button
          type="button"
          aria-label={`Supprimer le cours de ${c.matiere} du ${JOUR_LABEL[c.jour].toLowerCase()} à ${c.debut}`}
          onClick={() => onSupprimer(c.id)}
          className="absolute top-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-encre-doux hover:bg-surface hover:text-stylo"
        >
          <IconTrash size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export function GrilleEdt({ creneaux, type, onSupprimer }: GrilleProps) {
  const [jour, setJour] = useState<`${JourSemaine}`>('1')

  return (
    <>
      {/* Ordinateur : grille de la semaine */}
      <div className="hidden overflow-x-auto rounded-[1.25rem] border border-trait bg-surface md:block">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">Emploi du temps de la semaine</caption>
          <thead className="bg-papier-2/60 text-xs text-encre-doux">
            <tr>
              <th scope="col" className="w-28 px-3 py-3 text-left font-medium">Horaire</th>
              {JOURS.map((j) => (
                <th key={j} scope="col" className="px-2 py-3 text-left font-medium">
                  {JOUR_LABEL[j]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAGES_HORAIRES.map((p) => (
              <tr key={p.debut} className="border-t border-trait align-top">
                <th scope="row" className="px-3 py-2 text-left text-xs font-medium whitespace-nowrap text-encre-doux tabular-nums">
                  {p.debut} – {p.fin}
                </th>
                {JOURS.map((j) => {
                  const cours = creneaux.filter((c) => c.jour === j && enMinutes(c.debut) === enMinutes(p.debut))
                  return (
                    <td key={j} className="h-[4.5rem] min-w-32 px-1.5 py-1.5">
                      {cours.map((c) => (
                        <Cours key={c.id} c={c} type={type} onSupprimer={onSupprimer} />
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Téléphone : un jour à la fois */}
      <div className="md:hidden">
        <Onglets ariaLabel="Jour de la semaine" onglets={JOURS.map((j) => ({ cle: String(j) as `${JourSemaine}`, label: JOUR_LABEL[j].slice(0, 3) }))} actif={jour} onChange={setJour} className="mb-4" />
        <ol className="space-y-2">
          {creneaux
            .filter((c) => c.jour === Number(jour))
            .map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="w-20 shrink-0 pt-2.5 text-xs font-semibold text-encre-doux tabular-nums">
                  {c.debut}
                  <br />
                  {c.fin}
                </span>
                <div className="flex-1">
                  <Cours c={c} type={type} onSupprimer={onSupprimer} />
                </div>
              </li>
            ))}
          {creneaux.filter((c) => c.jour === Number(jour)).length === 0 && <li className="text-sm text-encre-doux">Pas de cours ce jour-là.</li>}
        </ol>
      </div>
    </>
  )
}
