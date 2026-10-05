'use client'

import { useEffect, useState } from 'react'
import { IconBrandWhatsapp, IconCertificate, IconPrinter } from '@tabler/icons-react'
import { Champ, Selection } from '@/components/common/champs'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { Onglets } from '@/components/common/onglets'
import { PageHeader } from '@/components/common/page-header'
import { boutonClasses } from '@/components/common/button-link'
import { messageErreur } from '@/lib/api'
import { MENTION_LABEL } from '@/lib/domain/params'
import { appreciationSuggeree } from '@/lib/domain/notes'
import { decimal, lienPartageWhatsapp, ordinal } from '@/lib/format'
import { useActeur } from '@/hooks/use-acteur'
import { useClasses } from '@/features/classes/query/classes-queries'
import { useFicheEleve } from '@/features/eleves/query/eleves-queries'
import { useBulletin, useBulletinsClasse, useBulletinsComplets, useEnfants } from '../query/bulletins-queries'
import type { PeriodeBulletin } from '../api/bulletins-api'
import { BulletinFeuille } from './bulletin-feuille'

type CleOnglet = '1' | '2' | '3' | 'ANNEE'
const PERIODES: { cle: CleOnglet; label: string }[] = [
  { cle: '1', label: '1er trimestre' },
  { cle: '2', label: '2e trimestre' },
  { cle: '3', label: '3e trimestre' },
  { cle: 'ANNEE', label: 'Année' },
]
const enPeriode = (cle: CleOnglet): PeriodeBulletin => (cle === 'ANNEE' ? 'ANNEE' : (Number(cle) as 1 | 2 | 3))

/** Feuille du bulletin d'un élève, avec appréciation modifiable (staff) et actions d'impression et de partage. */
function ApercuBulletin({ matricule, periode, modifiable }: { matricule: string; periode: PeriodeBulletin; modifiable: boolean }) {
  const { data, isLoading, isError, error, refetch } = useBulletin(matricule, periode)
  const [saisie, setSaisie] = useState<{ pour: string; texte: string } | null>(null)

  if (isLoading) return <ChargementListe lignes={5} libelle="Chargement du bulletin" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  const bulletin = data.data
  const cle = `${matricule}|${periode}`
  const appreciation = saisie && saisie.pour === cle ? saisie.texte : appreciationSuggeree(bulletin.moyenne, bulletin.classe.bareme)
  const message =
    `Bulletin de ${bulletin.eleve.prenoms} ${bulletin.eleve.nom} (${bulletin.classe.libelle}) : moyenne ${decimal(bulletin.moyenne)}/${bulletin.classe.bareme}` +
    (bulletin.rang ? `, ${ordinal(bulletin.rang)} sur ${bulletin.effectif}` : '') +
    `, ${MENTION_LABEL[bulletin.mention].toLowerCase()}. Le bulletin complet est disponible à l’école.`

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => window.print()} className={boutonClasses({ variante: 'primaire' })}>
          <IconPrinter size={18} aria-hidden="true" />
          Imprimer
        </button>
        <a href={lienPartageWhatsapp(message)} className={boutonClasses({ variante: 'secondaire' })} target="_blank" rel="noopener noreferrer">
          <IconBrandWhatsapp size={18} aria-hidden="true" />
          Partager sur WhatsApp
        </a>
      </div>
      {modifiable && (
        <div className="no-print mb-4">
          <Champ id="appreciation" label="Appréciation du bulletin" aide="Une suggestion bienveillante est proposée : modifiez-la avant l’impression.">
            <textarea
              id="appreciation"
              value={appreciation}
              onChange={(e) => setSaisie({ pour: cle, texte: e.target.value })}
              rows={2}
              className="lignes-cahier w-full rounded-xl border border-trait bg-surface px-3.5 py-2 text-base leading-[1.8rem] focus:border-ardoise"
            />
          </Champ>
        </div>
      )}
      <BulletinFeuille bulletin={bulletin} appreciation={appreciation} />
    </div>
  )
}

function ImpressionGroupee({ classeId, periode, declenche }: { classeId: string; periode: PeriodeBulletin; declenche: number }) {
  const { data } = useBulletinsComplets(classeId, periode, declenche > 0)
  useEffect(() => {
    if (declenche > 0 && data) {
      const t = setTimeout(() => window.print(), 300)
      return () => clearTimeout(t)
    }
  }, [declenche, data])

  if (!data) return null
  return (
    <div className="hidden print:block" aria-hidden="true">
      {data.data.map((b, i) => (
        <BulletinFeuille key={b.matricule} bulletin={b} appreciation={appreciationSuggeree(b.moyenne, b.classe.bareme)} saut={i < data.data.length - 1} />
      ))}
    </div>
  )
}

export function BulletinsVue({ eleveInitial }: { eleveInitial?: string }) {
  const acteur = useActeur()
  const parent = acteur?.role === 'PARENT'
  const [periodeCle, setPeriodeCle] = useState<CleOnglet>('3')
  const periode = enPeriode(periodeCle)

  // Parent : choix de l'enfant
  const { data: enfantsData } = useEnfants()
  const enfants = enfantsData?.data ?? []
  const [enfantChoisi, setEnfantChoisi] = useState(eleveInitial ?? '')
  const enfant = enfants.some((e) => e.matricule === enfantChoisi) ? enfantChoisi : (enfants[0]?.matricule ?? '')

  // Équipe : choix de la classe, puis de l'élève
  const { data: classesData } = useClasses()
  const classes = classesData?.data ?? []
  const { data: ficheInitiale } = useFicheEleve(!parent && eleveInitial ? eleveInitial : '')
  const [classeChoisie, setClasseChoisie] = useState('')
  const classeId = classeChoisie || ficheInitiale?.data.classe.id || classes[0]?.classe.id || ''
  const [eleveChoisi, setEleveChoisi] = useState(eleveInitial ?? '')
  const { data: resume, isLoading: chargement, isError, error, refetch } = useBulletinsClasse(classeId, periode)
  const [impression, setImpression] = useState(0)

  const lignes = resume?.data ?? []
  const selection = lignes.some((l) => l.matricule === eleveChoisi) ? eleveChoisi : ''

  return (
    <>
      <PageHeader
        titre="Bulletins"
        description={parent ? 'Les résultats de vos enfants, validés par les enseignants.' : 'Consultez, ajustez l’appréciation et imprimez les bulletins de chaque classe.'}
      />
      <Onglets ariaLabel="Période" onglets={PERIODES} actif={periodeCle} onChange={setPeriodeCle} className="mb-5" />

      {parent ? (
        <>
          {enfants.length > 1 && (
            <div role="group" aria-label="Choisir un enfant" className="no-print mb-5 flex flex-wrap gap-2">
              {enfants.map((e) => (
                <button
                  key={e.matricule}
                  type="button"
                  aria-pressed={e.matricule === enfant}
                  onClick={() => setEnfantChoisi(e.matricule)}
                  className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold ${e.matricule === enfant ? 'border-ardoise bg-ardoise text-white' : 'border-trait bg-surface'}`}
                >
                  {e.nom} · {e.classe}
                </button>
              ))}
            </div>
          )}
          {enfant ? <ApercuBulletin matricule={enfant} periode={periode} modifiable={false} /> : <ChargementListe lignes={3} />}
        </>
      ) : (
        <>
          <div className="no-print mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Champ id="classe-bulletin" label="Classe">
              <Selection
                id="classe-bulletin"
                value={classeId}
                onChange={(e) => {
                  setClasseChoisie(e.target.value)
                  setEleveChoisi('')
                }}
              >
                {classes.map((c) => (
                  <option key={c.classe.id} value={c.classe.id}>
                    {c.classe.libelle}
                  </option>
                ))}
              </Selection>
            </Champ>
            <button type="button" className={boutonClasses({ variante: 'secondaire' })} onClick={() => setImpression((n) => n + 1)} disabled={!classeId}>
              <IconPrinter size={18} aria-hidden="true" />
              Imprimer toute la classe
            </button>
          </div>

          {chargement ? (
            <ChargementListe libelle="Chargement des bulletins" />
          ) : isError ? (
            <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />
          ) : lignes.length === 0 ? (
            <EtatVide icone={IconCertificate} titre="Aucun élève dans cette classe" />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[22rem_1fr] lg:items-start">
              <ul className="no-print max-h-[70vh] divide-y divide-trait overflow-y-auto rounded-[1.25rem] border border-trait bg-surface">
                {lignes.map((l) => (
                  <li key={l.matricule}>
                    <button
                      type="button"
                      aria-pressed={l.matricule === selection}
                      onClick={() => setEleveChoisi(l.matricule)}
                      className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left transition-colors ${l.matricule === selection ? 'bg-ardoise-pale' : 'hover:bg-papier-2'}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {l.nom} {l.prenoms}
                        </span>
                        <span className="text-xs text-encre-doux">{l.rang ? `${ordinal(l.rang)} sur ${l.effectif}` : 'Non classé'}</span>
                      </span>
                      <span className="font-display text-lg font-bold tabular-nums">{decimal(l.moyenne)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {selection ? (
                <ApercuBulletin matricule={selection} periode={periode} modifiable />
              ) : (
                <EtatVide icone={IconCertificate} titre="Choisissez un élève" texte="Son bulletin s’affiche ici, prêt à imprimer." />
              )}
            </div>
          )}
          <ImpressionGroupee classeId={classeId} periode={periode} declenche={impression} />
        </>
      )}
    </>
  )
}
