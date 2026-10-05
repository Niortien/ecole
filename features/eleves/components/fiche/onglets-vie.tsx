import { IconCheck, IconClockHour4, IconGavel, IconHourglassHigh } from '@tabler/icons-react'
import { EtatVide } from '@/components/common/etats'
import { Panneau } from '@/components/common/panneau'
import { StatusPill, type Ton } from '@/components/common/status-pill'
import { formaterDate } from '@/lib/domain/calendrier'
import { MODE_PAIEMENT_LABEL, OBJET_LABEL, type StatutLigne } from '@/lib/domain/scolarite'
import { SANCTION_LABEL } from '@/lib/domain/vie-scolaire'
import { fcfa } from '@/lib/format'
import { JOUR_LABEL } from '@/lib/domain/calendrier'
import type { Sanction } from '@/types/domain'
import type { FicheEleve } from '../../types'

const STATUT_SANCTION: Record<Sanction['statut'], { label: string; ton: Ton }> = {
  BROUILLON: { label: 'À valider', ton: 'attention' },
  VALIDEE: { label: 'Validée', ton: 'info' },
  PARENT_INFORME: { label: 'Parent informé', ton: 'ok' },
}

export function OngletDiscipline({ fiche }: { fiche: FicheEleve }) {
  if (fiche.sanctions.length === 0) {
    return <EtatVide icone={IconGavel} titre="Aucune sanction" texte="Le comportement de cet élève n’a donné lieu à aucune sanction cette année." />
  }
  return (
    <Panneau titre="Sanctions de l’année" sansRemplissage>
      <ul className="divide-y divide-trait">
        {fiche.sanctions.map((s) => (
          <li key={s.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
            <span>
              <span className="block font-semibold">
                {SANCTION_LABEL[s.type]}
                {s.joursExclusion ? ` · ${s.joursExclusion} jour${s.joursExclusion > 1 ? 's' : ''}` : ''}
              </span>
              <span className="block text-sm text-encre-doux">{s.motif}</span>
              <span className="mt-0.5 block text-xs text-encre-doux">{formaterDate(s.date)}</span>
            </span>
            <StatusPill label={STATUT_SANCTION[s.statut].label} ton={STATUT_SANCTION[s.statut].ton} />
          </li>
        ))}
      </ul>
    </Panneau>
  )
}

const STATUT_LIGNE: Record<StatutLigne, { label: string; ton: Ton; icone: typeof IconCheck }> = {
  PAYE: { label: 'Payé', ton: 'ok', icone: IconCheck },
  PARTIEL: { label: 'Partiel', ton: 'attention', icone: IconHourglassHigh },
  A_VENIR: { label: 'À venir', ton: 'neutre', icone: IconClockHour4 },
  EN_RETARD: { label: 'En retard', ton: 'alerte', icone: IconHourglassHigh },
}

export function OngletScolarite({ fiche }: { fiche: FicheEleve }) {
  const s = fiche.scolarite
  if (!s) return <p className="text-encre-doux">La scolarité n’est pas accessible avec votre profil.</p>
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Panneau titre="Frais de scolarité" description={`${fcfa(s.situation.paye)} payés sur ${fcfa(s.situation.total)}`} sansRemplissage>
        <ul className="divide-y divide-trait">
          {s.situation.lignes.map((l) => {
            const meta = STATUT_LIGNE[l.statut]
            return (
              <li key={l.objet} className="flex items-center justify-between gap-3 px-5 py-3">
                <span>
                  <span className="block font-medium">{OBJET_LABEL[l.objet]}</span>
                  <span className="text-xs text-encre-doux">échéance {formaterDate(l.echeance, 'court')}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm tabular-nums">{fcfa(l.paye)} / {fcfa(l.du)}</span>
                  <StatusPill label={meta.label} ton={meta.ton} icone={meta.icone} />
                </span>
              </li>
            )
          })}
        </ul>
      </Panneau>
      <Panneau titre="Paiements" sansRemplissage>
        {s.paiements.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-encre-doux">Aucun paiement enregistré.</p>
        ) : (
          <ul className="divide-y divide-trait">
            {s.paiements.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>
                  <span className="block font-medium">{OBJET_LABEL[p.objet]}</span>
                  <span className="text-xs text-encre-doux">
                    {formaterDate(p.date, 'court')} · {MODE_PAIEMENT_LABEL[p.mode]} · {p.recu}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">{fcfa(p.montant)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panneau>
    </div>
  )
}

export function OngletCantine({ fiche }: { fiche: FicheEleve }) {
  const a = fiche.cantine
  if (!a) return <p className="text-encre-doux">Cet élève n’est pas inscrit à la cantine.</p>
  return (
    <Panneau titre="Abonnement à la cantine">
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-encre-doux">Jours de repas</dt>
          <dd className="mt-1 font-medium">{a.jours.map((j) => JOUR_LABEL[j]).join(', ')}</dd>
        </div>
        <div>
          <dt className="text-xs text-encre-doux">Payé jusqu’en</dt>
          <dd className="mt-1 font-medium">{a.payeJusqua}</dd>
        </div>
        <div>
          <dt className="text-xs text-encre-doux">Allergies</dt>
          <dd className="mt-1 font-medium">{a.allergies.length ? a.allergies.join(', ') : 'Aucune signalée'}</dd>
        </div>
      </dl>
    </Panneau>
  )
}
