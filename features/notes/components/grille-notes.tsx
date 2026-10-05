'use client'

import { useState } from 'react'
import { IconCheck, IconCloudOff, IconLoader2, IconPencilPlus, IconRosetteDiscountCheck, IconNotebook } from '@tabler/icons-react'
import { Selection, Champ } from '@/components/common/champs'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { boutonClasses } from '@/components/common/button-link'
import { Onglets } from '@/components/common/onglets'
import { messageErreur } from '@/lib/api'
import { dateDuJour } from '@/lib/clock'
import { trimestreActif } from '@/lib/domain/calendrier'
import { anneeEnCours } from '@/lib/clock'
import { useActeur } from '@/hooks/use-acteur'
import { useClasses } from '@/features/classes/query/classes-queries'
import { useAjouterEvaluation, useValiderNotes } from '../mutation/notes-mutations'
import { useGrille, useMatieresDeClasse } from '../query/notes-queries'
import { useModificationsEnAttente } from '../hook/use-file-attente'
import type { Trimestre } from '@/types/domain'
import type { TypeEvaluation } from '@/types/domain'
import { GrilleTable, type EtatSauvegarde } from './grille-table'

const TRIMESTRES: { cle: `${Trimestre}`; label: string }[] = [
  { cle: '1', label: '1er trimestre' },
  { cle: '2', label: '2e trimestre' },
  { cle: '3', label: '3e trimestre' },
]

const TYPES: { cle: TypeEvaluation; label: string }[] = [
  { cle: 'INTERRO', label: 'Interrogation' },
  { cle: 'DEVOIR', label: 'Devoir' },
  { cle: 'COMPOSITION', label: 'Composition' },
]

function IndicateurSauvegarde({ etat, enAttente }: { etat: EtatSauvegarde; enAttente: number }) {
  let contenu = <span className="text-encre-doux">Les notes s’enregistrent toutes seules.</span>
  if (enAttente > 0 || etat === 'enAttente') {
    contenu = (
      <span className="flex items-center gap-1.5 font-medium text-crayon-texte">
        <IconCloudOff size={16} aria-hidden="true" />
        Hors ligne : {Math.max(enAttente, 1)} modification{enAttente > 1 ? 's' : ''} en attente, envoyées au retour du réseau
      </span>
    )
  } else if (etat === 'enCours') {
    contenu = (
      <span className="flex items-center gap-1.5 text-encre-doux">
        <IconLoader2 size={16} className="animate-spin" aria-hidden="true" />
        Enregistrement…
      </span>
    )
  } else if (etat === 'enregistre') {
    contenu = (
      <span className="flex items-center gap-1.5 font-medium text-ardoise">
        <IconCheck size={16} aria-hidden="true" />
        Enregistré
      </span>
    )
  } else if (etat === 'erreur') {
    contenu = <span className="font-medium text-stylo">Une note n’a pas pu être enregistrée.</span>
  }
  return (
    <p role="status" aria-live="polite" className="text-sm">
      {contenu}
    </p>
  )
}

export function GrilleNotes() {
  const acteur = useActeur()
  const { data: classesData, isLoading: chargementClasses } = useClasses()
  const classes = classesData?.data ?? []
  const [classeChoisie, setClasseChoisie] = useState('')
  const [matiereChoisie, setMatiereChoisie] = useState('')
  const [trimestre, setTrimestre] = useState<`${Trimestre}`>(() => String(trimestreActif(anneeEnCours(), dateDuJour()) ?? 3) as `${Trimestre}`)
  const [sauvegarde, setSauvegarde] = useState<{ pour: string; etat: EtatSauvegarde }>({ pour: '', etat: 'repos' })
  const enAttente = useModificationsEnAttente()

  const classeId = classeChoisie || classes[0]?.classe.id || ''
  const { data: matieresData } = useMatieresDeClasse(classeId)
  const matieres = matieresData?.data ?? []
  const matiereId = matieres.some((m) => m.matiereId === matiereChoisie) ? matiereChoisie : (matieres[0]?.matiereId ?? '')

  const params = classeId && matiereId ? { classeId, matiereId, trimestre: Number(trimestre) as Trimestre } : null
  const { data, isLoading, isError, error, refetch } = useGrille(params)
  const valider = useValiderNotes()
  const ajouter = useAjouterEvaluation()
  const [attente, setAttente] = useState<{ pour: string; n: number } | null>(null)
  const [typeAjout, setTypeAjout] = useState<TypeEvaluation>('INTERRO')

  // L'indicateur repart de zéro quand on change de classe, de matière ou de trimestre.
  const contexte = `${classeId}|${matiereId}|${trimestre}`
  const etat = sauvegarde.pour === contexte ? sauvegarde.etat : 'repos'
  const setEtat = (e: EtatSauvegarde) => setSauvegarde({ pour: contexte, etat: e })

  const grille = data?.data
  const nonValidees = attente && attente.pour === contexte ? attente.n : (grille?.nonValidees ?? 0)

  return (
    <>
      <PageHeader
        titre="Notes"
        description={acteur?.role === 'ENSEIGNANT' ? 'Saisissez au clavier : Entrée valide et descend, Tab passe à la colonne suivante.' : 'Consultation des notes par classe et par matière.'}
      />

      <div className="no-print mb-5 grid gap-3 sm:grid-cols-2">
        <Champ id="classe" label="Classe">
          <Selection id="classe" value={classeId} onChange={(e) => setClasseChoisie(e.target.value)} disabled={chargementClasses}>
            {classes.map((c) => (
              <option key={c.classe.id} value={c.classe.id}>
                {c.classe.libelle}
              </option>
            ))}
          </Selection>
        </Champ>
        <Champ id="matiere" label="Matière">
          <Selection id="matiere" value={matiereId} onChange={(e) => setMatiereChoisie(e.target.value)}>
            {matieres.map((m) => (
              <option key={m.matiereId} value={m.matiereId}>
                {m.libelle}
              </option>
            ))}
          </Selection>
        </Champ>
      </div>
      <Onglets
        ariaLabel="Trimestre"
        onglets={TRIMESTRES}
        actif={trimestre}
        onChange={setTrimestre}
        className="mb-5"
      />

      {!classeId ? (
        <EtatVide icone={IconNotebook} titre="Aucune classe" texte="Aucune classe ne vous est rattachée pour le moment." />
      ) : isLoading || !grille ? (
        isError ? <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} /> : <ChargementListe lignes={6} libelle="Chargement des notes" />
      ) : (
        <>
          <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3">
            <IndicateurSauvegarde etat={etat} enAttente={enAttente} />
            {grille.modifiable && (
              <div className="flex flex-wrap items-center gap-2">
                <Selection
                  aria-label="Type de la nouvelle évaluation"
                  value={typeAjout}
                  onChange={(e) => setTypeAjout(e.target.value as TypeEvaluation)}
                  className="w-44"
                >
                  {TYPES.map((t) => (
                    <option key={t.cle} value={t.cle}>
                      {t.label}
                    </option>
                  ))}
                </Selection>
                <button
                  type="button"
                  className={boutonClasses({ variante: 'secondaire' })}
                  disabled={ajouter.isPending || !params}
                  onClick={() => params && ajouter.mutate({ ...params, type: typeAjout })}
                >
                  <IconPencilPlus size={18} aria-hidden="true" />
                  Ajouter
                </button>
                <button
                  type="button"
                  className={boutonClasses({ variante: 'primaire' })}
                  disabled={valider.isPending || nonValidees === 0 || !params}
                  onClick={() => params && valider.mutate(params, { onSuccess: () => setAttente(null) })}
                >
                  <IconRosetteDiscountCheck size={18} aria-hidden="true" />
                  Valider{nonValidees > 0 ? ` (${nonValidees})` : ''}
                </button>
              </div>
            )}
          </div>
          {!grille.modifiable && <p className="mb-3 rounded-xl bg-bille-pale p-3 text-sm text-bille">Consultation seulement : la saisie est réservée à l’enseignant de la matière.</p>}
          <GrilleTable key={`${grille.classe.id}|${grille.matiere.id}|${grille.trimestre}|${grille.colonnes.length}|${grille.nonValidees}`} grille={grille} onEtat={setEtat} onNonValidees={(n) => setAttente({ pour: contexte, n })} />
          <p className="no-print mt-3 text-sm text-encre-doux">
            Un point jaune signale une note pas encore validée : les parents ne la voient qu’après votre validation. AJ = absence justifiée (ignorée), ANJ = absence non justifiée (zéro).
          </p>
        </>
      )}
    </>
  )
}
