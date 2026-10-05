import { IconAlertTriangle, IconBrandWhatsapp, IconCash, IconGavel, IconToolsKitchen2 } from '@tabler/icons-react'
import { Panneau } from '@/components/common/panneau'
import { StatusPill } from '@/components/common/status-pill'
import { decimal, lienWhatsapp, ordinal } from '@/lib/format'
import { MENTION_LABEL } from '@/lib/domain/params'
import { fcfa } from '@/lib/format'
import type { FicheEleve } from '../../types'

export function OngletResume({ fiche }: { fiche: FicheEleve }) {
  const { bulletin, vieScolaire, scolarite, sanctions, cantine, parents } = fiche
  const alertes: { cle: string; ton: 'alerte' | 'attention'; icone: typeof IconCash; texte: string }[] = []

  if (scolarite && scolarite.situation.enRetard > 0) {
    alertes.push({ cle: 'impaye', ton: 'alerte', icone: IconCash, texte: `${fcfa(scolarite.situation.enRetard)} de scolarité en retard` })
  }
  if (vieScolaire.absencesConsecutives >= 3) {
    alertes.push({ cle: 'absences', ton: 'alerte', icone: IconAlertTriangle, texte: `${vieScolaire.absencesConsecutives} jours d’absence de suite` })
  }
  const aVerifier = sanctions.filter((s) => s.statut === 'BROUILLON').length
  if (aVerifier > 0) alertes.push({ cle: 'sanction', ton: 'attention', icone: IconGavel, texte: `${aVerifier} sanction${aVerifier > 1 ? 's' : ''} en attente de validation` })
  if (cantine && cantine.allergies.length > 0) {
    alertes.push({ cle: 'allergie', ton: 'attention', icone: IconToolsKitchen2, texte: `Allergie : ${cantine.allergies.join(', ')}` })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {alertes.length > 0 && (
        <Panneau titre="À surveiller" className="lg:col-span-2">
          <ul className="flex flex-wrap gap-2">
            {alertes.map((a) => (
              <li key={a.cle}>
                <StatusPill ton={a.ton} icone={a.icone} label={a.texte} className="text-sm" />
              </li>
            ))}
          </ul>
        </Panneau>
      )}

      <Panneau titre="Résultats du 3e trimestre" description="Trimestre en cours : la moyenne évolue avec les nouvelles notes.">
        {bulletin && bulletin.moyenne !== null ? (
          <dl className="grid grid-cols-3 gap-3">
            <div>
              <dt className="text-xs text-encre-doux">Moyenne</dt>
              <dd className="font-display text-3xl font-bold tabular-nums">
                {decimal(bulletin.moyenne)}
                <span className="text-sm font-medium text-encre-doux">/{bulletin.classe.bareme}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-encre-doux">Rang</dt>
              <dd className="font-display text-3xl font-bold tabular-nums">
                {bulletin.rang ? ordinal(bulletin.rang) : '—'}
                <span className="text-sm font-medium text-encre-doux"> / {bulletin.effectif}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-encre-doux">Mention</dt>
              <dd className="mt-1 text-sm font-semibold">{MENTION_LABEL[bulletin.mention]}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-encre-doux">Pas encore de notes validées ce trimestre.</p>
        )}
      </Panneau>

      <Panneau titre="Vie scolaire" description="Sur les 15 derniers jours de classe.">
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs text-encre-doux">Présence</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">{vieScolaire.taux === null ? '—' : `${decimal(vieScolaire.taux)} %`}</dd>
          </div>
          <div>
            <dt className="text-xs text-encre-doux">Retards</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">{vieScolaire.retards}</dd>
          </div>
          <div>
            <dt className="text-xs text-encre-doux">Sanctions</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">{sanctions.length}</dd>
          </div>
        </dl>
      </Panneau>

      <Panneau titre="Parents" className="lg:col-span-2">
        <ul className="divide-y divide-trait">
          {parents.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <span>
                <span className="block font-semibold">
                  {p.prenoms} {p.nom}
                </span>
                <span className="text-sm text-encre-doux tabular-nums">{p.telephone}</span>
              </span>
              <a
                href={lienWhatsapp(p.telephone)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-trait px-4 text-sm font-semibold hover:border-ardoise"
              >
                <IconBrandWhatsapp size={18} className="text-ardoise" aria-hidden="true" />
                WhatsApp
              </a>
            </li>
          ))}
        </ul>
      </Panneau>
    </div>
  )
}
