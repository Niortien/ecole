import { ecoleDemo } from '@/config/app.config'
import { MENTION_LABEL } from '@/lib/domain/params'
import { afficherNote } from '@/lib/domain/notes'
import { formaterDate } from '@/lib/domain/calendrier'
import { decimal, ordinal } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Bulletin } from '@/services/mock-db/selecteurs'

const DECISION_LABEL = {
  ADMIS: 'Admis(e) en classe supérieure',
  REDOUBLE: 'Redouble',
  PASSAGE_OBLIGE: 'Passage obligatoire',
} as const

interface BulletinFeuilleProps {
  bulletin: Bulletin
  appreciation: string
  /** Un saut de page suit cette feuille à l'impression groupée. */
  saut?: boolean
}

/** Feuille de bulletin prête à imprimer en A4 (les couleurs d'écran se remplacent par un rendu sobre à l'impression). */
export function BulletinFeuille({ bulletin, appreciation, saut }: BulletinFeuilleProps) {
  const { eleve, classe, lignes, trimestre } = bulletin
  const annuel = trimestre === 'ANNEE'
  const titre = annuel ? 'Bulletin annuel' : `Bulletin du ${trimestre === 1 ? '1er' : `${trimestre}e`} trimestre`

  return (
    <article
      aria-label={`${titre} de ${eleve.prenoms} ${eleve.nom}`}
      className={cn('print-page rounded-[1.25rem] border border-trait bg-surface p-6 sm:p-10', saut && 'print:break-after-page')}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-encre pb-4">
        <div>
          <p className="font-display text-2xl font-bold">{ecoleDemo.nom}</p>
          <p className="text-sm text-encre-doux">
            {ecoleDemo.quartier}, {ecoleDemo.ville} · Année scolaire {ecoleDemo.anneeScolaire}
          </p>
        </div>
        <p className="rounded-lg border-2 border-encre px-3 py-1.5 font-display text-lg font-bold">{titre}</p>
      </header>

      <dl className="mt-4 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-encre-doux">Élève :</dt>
          <dd className="font-semibold">{eleve.nom} {eleve.prenoms}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-encre-doux">Classe :</dt>
          <dd className="font-semibold">{classe.libelle} ({bulletin.effectif} élèves)</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-encre-doux">Matricule :</dt>
          <dd className="font-semibold tabular-nums">{bulletin.matricule}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-encre-doux">Né(e) le :</dt>
          <dd className="font-semibold">{formaterDate(eleve.naissance)}</dd>
        </div>
      </dl>

      <table className="mt-5 w-full text-sm">
        <caption className="sr-only">Résultats par matière</caption>
        <thead className="border-y border-encre text-left text-xs">
          <tr>
            <th scope="col" className="py-2 pr-2 font-semibold">Matière</th>
            <th scope="col" className="px-2 py-2 text-center font-semibold">Coef.</th>
            {annuel ? null : <th scope="col" className="hidden px-2 py-2 font-semibold sm:table-cell">Notes</th>}
            <th scope="col" className="px-2 py-2 text-right font-semibold">Moyenne /{classe.bareme}</th>
            <th scope="col" className="py-2 pl-2 text-right font-semibold">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-trait">
          {lignes.map((l) => (
            <tr key={l.matiereId}>
              <th scope="row" className="py-2 pr-2 text-left font-medium">
                {l.libelle}
                <span className="block text-xs font-normal text-encre-doux">{l.enseignant}</span>
              </th>
              <td className="px-2 py-2 text-center tabular-nums">{l.coefficient}</td>
              {annuel ? null : (
                <td className="hidden px-2 py-2 text-xs text-encre-doux tabular-nums sm:table-cell">{l.notes.map((n) => afficherNote(n.valeur)).join(' · ') || '—'}</td>
              )}
              <td className="px-2 py-2 text-right font-semibold tabular-nums">{decimal(l.moyenne)}</td>
              <td className="py-2 pl-2 text-right tabular-nums">{l.moyenne === null ? '—' : decimal(l.moyenne * l.coefficient)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr]">
        <dl className="space-y-1.5 text-sm">
          {annuel && (
            <div className="flex justify-between gap-4">
              <dt className="text-encre-doux">Moyennes des trimestres</dt>
              <dd className="font-medium tabular-nums">{bulletin.moyennesTrimestres.map((m) => decimal(m)).join(' · ')}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Rang</dt>
            <dd className="font-semibold">{bulletin.rang ? `${ordinal(bulletin.rang)} sur ${bulletin.effectif}` : '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Absences</dt>
            <dd className="font-medium">{bulletin.absences.total} non justifiée{bulletin.absences.total > 1 ? 's' : ''} · {bulletin.absences.justifiees} justifiée{bulletin.absences.justifiees > 1 ? 's' : ''}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre-doux">Mention</dt>
            <dd className="font-semibold">{MENTION_LABEL[bulletin.mention]}</dd>
          </div>
        </dl>
        <div className="rounded-xl border-2 border-encre p-3 text-center">
          <p className="text-xs text-encre-doux">Moyenne {annuel ? 'annuelle' : 'générale'}</p>
          <p className="font-display text-4xl font-bold tabular-nums">
            {decimal(bulletin.moyenne)}
            <span className="text-base font-medium text-encre-doux"> /{classe.bareme}</span>
          </p>
        </div>
      </div>

      {bulletin.passage && (
        <p className="mt-4 rounded-xl bg-papier-2 p-3 text-sm print:border print:border-encre">
          <span className="font-semibold">Décision du conseil de classe : {DECISION_LABEL[bulletin.passage.decision]}.</span>{' '}
          <span className="text-encre-doux">{bulletin.passage.motif}</span>
        </p>
      )}

      <div className="mt-5">
        <p className="text-xs text-encre-doux">Appréciation</p>
        <p className="annotation mt-1 text-lg leading-snug">{appreciation}</p>
      </div>

      <footer className="mt-8 grid grid-cols-2 gap-6 text-center text-xs text-encre-doux">
        <p className="border-t border-trait pt-2">Signature du parent</p>
        <p className="border-t border-trait pt-2">Le directeur</p>
      </footer>
    </article>
  )
}
