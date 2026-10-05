'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconBrandWhatsapp, IconCheck, IconGavel, IconPlus, IconTrendingUp } from '@tabler/icons-react'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { StatusPill, type Ton } from '@/components/common/status-pill'
import { boutonClasses } from '@/components/common/button-link'
import { messageErreur } from '@/lib/api'
import { formaterDate } from '@/lib/domain/calendrier'
import { SANCTION_LABEL } from '@/lib/domain/vie-scolaire'
import { lienWhatsapp } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { StatutSanction } from '@/types/domain'
import { useChangerStatut, useSanctions } from '../query/discipline-queries'
import { FormulaireSanction } from './formulaire-sanction'

const STATUTS: { cle: StatutSanction | undefined; label: string }[] = [
  { cle: undefined, label: 'Toutes' },
  { cle: 'BROUILLON', label: 'À valider' },
  { cle: 'VALIDEE', label: 'Validées' },
  { cle: 'PARENT_INFORME', label: 'Parent informé' },
]

const PASTILLE: Record<StatutSanction, { label: string; ton: Ton }> = {
  BROUILLON: { label: 'À valider', ton: 'attention' },
  VALIDEE: { label: 'Validée', ton: 'info' },
  PARENT_INFORME: { label: 'Parent informé', ton: 'ok' },
}

export function DisciplineVue() {
  const [statut, setStatut] = useState<StatutSanction | undefined>(undefined)
  const [formulaire, setFormulaire] = useState(false)
  const { data, isLoading, isError, error, refetch } = useSanctions({ statut })
  const changer = useChangerStatut()
  const sanctions = data?.data ?? []

  return (
    <>
      <PageHeader
        titre="Discipline"
        description="Déclarée, validée, puis le parent est informé. Les exclusions sont décidées par la direction."
        actions={
          <button type="button" onClick={() => setFormulaire((v) => !v)} aria-expanded={formulaire} className={boutonClasses({ variante: 'primaire' })}>
            <IconPlus size={18} aria-hidden="true" />
            Déclarer une sanction
          </button>
        }
      />

      {formulaire && (
        <div className="mb-6">
          <FormulaireSanction onTermine={() => setFormulaire(false)} />
        </div>
      )}

      <div role="group" aria-label="Filtrer par statut" className="no-print mb-5 flex flex-wrap gap-2">
        {STATUTS.map((s) => (
          <button
            key={s.label}
            type="button"
            aria-pressed={statut === s.cle}
            onClick={() => setStatut(s.cle)}
            className={cn(
              'min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors',
              statut === s.cle ? 'border-ardoise bg-ardoise text-white' : 'border-trait bg-surface hover:border-encre-doux'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ChargementListe libelle="Chargement des sanctions" />
      ) : isError ? (
        <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />
      ) : sanctions.length === 0 ? (
        <EtatVide icone={IconGavel} titre="Aucune sanction ici" texte="Rien à traiter pour ce filtre. Une bonne nouvelle pour la vie de l’école." />
      ) : (
        <ul className="space-y-3">
          {sanctions.map(({ sanction, eleve, auteur, suggestion, parent, validable, informable }) => (
            <li key={sanction.id} className="rounded-[1.25rem] border border-trait bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold">
                    {SANCTION_LABEL[sanction.type]}
                    {sanction.joursExclusion ? ` · ${sanction.joursExclusion} jour${sanction.joursExclusion > 1 ? 's' : ''}` : ''}
                  </p>
                  <Link href={`/eleves/${eleve.matricule}`} className="font-medium text-bille hover:underline">
                    {eleve.prenoms} {eleve.nom}
                  </Link>
                  <span className="text-encre-doux"> · {eleve.classe}</span>
                </div>
                <StatusPill label={PASTILLE[sanction.statut].label} ton={PASTILLE[sanction.statut].ton} />
              </div>
              <p className="mt-2">{sanction.motif}</p>
              <p className="mt-1 text-sm text-encre-doux">
                {formaterDate(sanction.date)} · déclarée par {auteur}
              </p>

              {suggestion && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-crayon-pale p-3 text-sm text-crayon-texte">
                  <IconTrendingUp size={18} aria-hidden="true" className="shrink-0" />
                  Cet élève cumule des sanctions : un(e) {SANCTION_LABEL[suggestion].toLowerCase()} peut être envisagé(e). La décision revient à la direction.
                </p>
              )}

              {(validable || informable) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {validable && (
                    <button type="button" disabled={changer.isPending} onClick={() => changer.mutate({ id: sanction.id, statut: 'VALIDEE' })} className={boutonClasses({ variante: 'primaire' })}>
                      <IconCheck size={18} aria-hidden="true" />
                      Valider
                    </button>
                  )}
                  {informable && parent && (
                    <a
                      href={lienWhatsapp(parent.telephone, `Bonjour ${parent.prenoms} ${parent.nom}, nous vous informons que ${eleve.prenoms} a reçu : ${SANCTION_LABEL[sanction.type].toLowerCase()} (${sanction.motif.toLowerCase()}). Merci de prendre contact avec l’école.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => changer.mutate({ id: sanction.id, statut: 'PARENT_INFORME' })}
                      className={boutonClasses({ variante: 'secondaire' })}
                    >
                      <IconBrandWhatsapp size={18} aria-hidden="true" />
                      Informer le parent
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
