'use client'

import { useMemo, useState } from 'react'
import { IconAlertTriangle, IconBrandWhatsapp, IconCheck, IconChecklist } from '@tabler/icons-react'
import { Champ, Selection } from '@/components/common/champs'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { Onglets } from '@/components/common/onglets'
import { PageHeader } from '@/components/common/page-header'
import { Panneau } from '@/components/common/panneau'
import { StatusPill } from '@/components/common/status-pill'
import { messageErreur } from '@/lib/api'
import { dateDuJour } from '@/lib/clock'
import { ajouterJours, formaterDate, jourSemaine } from '@/lib/domain/calendrier'
import { decimal, lienWhatsapp } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { DemiJournee } from '@/types/domain'
import { useAbsentsLongs, useAppel, useSituationAppels } from '../query/presences-queries'
import { FormulaireAppel } from './formulaire-appel'

/** Les 5 derniers jours de classe, du plus récent au plus ancien. */
function joursDeClasse(): string[] {
  const jours: string[] = []
  let jour = dateDuJour()
  while (jours.length < 5) {
    if (jourSemaine(jour) <= 5) jours.push(jour)
    jour = ajouterJours(jour, -1)
  }
  return jours
}

const DEMIS: { cle: DemiJournee; label: string }[] = [
  { cle: 'MATIN', label: 'Matin' },
  { cle: 'SOIR', label: 'Après-midi' },
]

export function PresencesVue() {
  const jours = useMemo(() => joursDeClasse(), [])
  const [date, setDate] = useState(jours[0])
  const [demi, setDemi] = useState<DemiJournee>('MATIN')
  const [classeChoisie, setClasseChoisie] = useState('')

  const { data: situationData, isLoading, isError, error, refetch } = useSituationAppels(date)
  const situation = situationData?.data ?? []
  const classeId = classeChoisie || situation.find((s) => !s.fait)?.classe.id || situation[0]?.classe.id || ''
  const appel = useAppel(classeId, date, demi)
  const { data: absentsData } = useAbsentsLongs()
  const absents = absentsData?.data ?? []
  const nonFaits = situation.filter((s) => !s.fait).length

  return (
    <>
      <PageHeader titre="Présences" description="Faites l’appel en quelques gestes. Il s’enregistre aussi sans réseau et part dès que la connexion revient." />

      <div className="no-print mb-5 max-w-xs">
        <Champ id="jour" label="Jour de classe">
          <Selection id="jour" value={date} onChange={(e) => setDate(e.target.value)}>
            {jours.map((j) => (
              <option key={j} value={j}>
                {formaterDate(j)}
              </option>
            ))}
          </Selection>
        </Champ>
      </div>

      {isLoading ? (
        <ChargementListe lignes={4} libelle="Chargement des appels" />
      ) : isError ? (
        <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />
      ) : situation.length === 0 ? (
        <EtatVide icone={IconChecklist} titre="Aucune classe" texte="Aucune classe ne vous est rattachée." />
      ) : (
        <>
          <section aria-labelledby="appels-jour" className="mb-8">
            <h2 id="appels-jour" className="mb-1 text-2xl font-semibold">
              Appels du matin
            </h2>
            <p className="mb-3 text-sm text-encre-doux">
              {nonFaits === 0 ? 'Tous les appels du matin sont faits.' : `${nonFaits} appel${nonFaits > 1 ? 's' : ''} du matin à faire.`}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {situation.map((s) => (
                <li key={s.classe.id}>
                  <button
                    type="button"
                    aria-pressed={s.classe.id === classeId}
                    onClick={() => setClasseChoisie(s.classe.id)}
                    className={cn(
                      'flex min-h-16 w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border p-3 text-left transition-colors',
                      s.classe.id === classeId ? 'border-ardoise bg-ardoise-pale' : 'border-trait bg-surface hover:border-encre-doux'
                    )}
                  >
                    <span>
                      <span className="block font-display text-lg font-semibold">{s.classe.libelle}</span>
                      <span className="text-xs text-encre-doux">
                        {s.fait ? `${decimal(s.taux)} % présents · ${s.absents} absent${s.absents > 1 ? 's' : ''}` : `${s.effectif} élèves`}
                      </span>
                    </span>
                    {s.fait ? <StatusPill ton="ok" icone={IconCheck} label="Fait" /> : <StatusPill ton="alerte" icone={IconAlertTriangle} label="À faire" />}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="faire-appel">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h2 id="faire-appel" className="text-2xl font-semibold">
                Appel : {situation.find((s) => s.classe.id === classeId)?.classe.libelle}
              </h2>
              <Onglets ariaLabel="Demi-journée" onglets={DEMIS} actif={demi} onChange={setDemi} />
            </div>
            {appel.isLoading ? (
              <ChargementListe lignes={6} libelle="Chargement de la liste d’appel" />
            ) : appel.isError || !appel.data ? (
              <EtatErreur message={messageErreur(appel.error)} onReessayer={() => void appel.refetch()} />
            ) : (
              <>
                {appel.data.data.dejaFait && <p className="mb-3 rounded-xl bg-bille-pale p-3 text-sm text-bille">L’appel a déjà été fait : vous pouvez corriger un statut puis enregistrer à nouveau.</p>}
                <FormulaireAppel key={`${classeId}|${date}|${demi}|${appel.dataUpdatedAt}`} appel={appel.data.data} />
              </>
            )}
          </section>

          {absents.length > 0 && (
            <Panneau
              titre="Absents depuis 3 jours ou plus"
              description="Les parents sont à contacter."
              className="mt-8"
              sansRemplissage
            >
              <ul className="divide-y divide-trait">
                {absents.map((a) => (
                  <li key={a.matricule} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <span>
                      <span className="block font-medium">
                        {a.nom} {a.prenoms}
                      </span>
                      <span className="text-sm text-encre-doux">
                        {a.classe} · {a.jours} jours d’absence de suite
                      </span>
                    </span>
                    {a.telephoneParent && (
                      <a
                        href={lienWhatsapp(a.telephoneParent, `Bonjour, ${a.prenoms} est absent(e) depuis ${a.jours} jours. Pouvez-vous nous en donner la raison ? Merci.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-trait px-4 text-sm font-semibold hover:border-ardoise"
                      >
                        <IconBrandWhatsapp size={18} className="text-ardoise" aria-hidden="true" />
                        Prévenir le parent
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Panneau>
          )}
        </>
      )}
    </>
  )
}
