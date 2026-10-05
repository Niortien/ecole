import Link from 'next/link'
import { IconCertificate } from '@tabler/icons-react'
import { Panneau } from '@/components/common/panneau'
import { boutonClasses } from '@/components/common/button-link'
import { afficherNote } from '@/lib/domain/notes'
import { decimal } from '@/lib/format'
import type { FicheEleve } from '../../types'

const TYPE_COURT = { INTERRO: 'Interro', DEVOIR: 'Devoir', COMPOSITION: 'Compo' } as const

export function OngletNotes({ fiche }: { fiche: FicheEleve }) {
  const { bulletin } = fiche
  if (!bulletin) return <p className="text-encre-doux">Aucune note pour le moment.</p>

  return (
    <Panneau
      titre="Notes du 3e trimestre"
      description={`Barème sur ${bulletin.classe.bareme}. Une note AJ est ignorée, une note ANJ compte zéro.`}
      actions={
        <Link href={`/bulletins?eleve=${fiche.eleve.matricule}`} className={boutonClasses({ variante: 'secondaire' })}>
          <IconCertificate size={18} aria-hidden="true" />
          Voir le bulletin
        </Link>
      }
      sansRemplissage
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">Notes par matière</caption>
          <thead className="border-b border-trait text-left text-xs text-encre-doux">
            <tr>
              <th scope="col" className="px-5 py-2 font-medium">Matière</th>
              <th scope="col" className="px-2 py-2 font-medium">Coef.</th>
              <th scope="col" className="px-2 py-2 font-medium">Notes</th>
              <th scope="col" className="px-5 py-2 text-right font-medium">Moyenne</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-trait">
            {bulletin.lignes.map((l) => (
              <tr key={l.matiereId}>
                <th scope="row" className="px-5 py-3 text-left font-medium">{l.libelle}</th>
                <td className="px-2 py-3 text-encre-doux tabular-nums">{l.coefficient}</td>
                <td className="px-2 py-3">
                  <span className="flex flex-wrap gap-1.5">
                    {l.notes.length === 0 && <span className="text-encre-doux">—</span>}
                    {l.notes.map((n) => (
                      <span key={n.id} title={TYPE_COURT[n.type]} className="rounded-md bg-papier-2 px-1.5 py-0.5 text-xs tabular-nums">
                        {afficherNote(n.valeur)}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{decimal(l.moyenne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panneau>
  )
}
