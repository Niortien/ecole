'use client'

import { useState } from 'react'
import { IconCalendarWeek, IconPlus } from '@tabler/icons-react'
import { Champ, Selection } from '@/components/common/champs'
import { ChargementListe, EtatErreur, EtatVide } from '@/components/common/etats'
import { PageHeader } from '@/components/common/page-header'
import { Onglets } from '@/components/common/onglets'
import { boutonClasses } from '@/components/common/button-link'
import { messageErreur } from '@/lib/api'
import { useEmploiDuTemps, useSupprimerCreneau } from '../query/emploi-du-temps-queries'
import type { TypeCible } from '../types'
import { FormulaireCours } from './formulaire-cours'
import { GrilleEdt } from './grille-edt'

export function EmploiDuTempsVue() {
  const [cible, setCible] = useState<{ type: TypeCible; id: string } | undefined>(undefined)
  const [formulaire, setFormulaire] = useState(false)
  const { data, isLoading, isError, error, refetch } = useEmploiDuTemps(cible)
  const supprimer = useSupprimerCreneau()

  if (isLoading) return <ChargementListe lignes={5} libelle="Chargement de l’emploi du temps" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  const edt = data.data
  const type = edt.cible.type
  const options = type === 'classe' ? edt.classes : edt.enseignants
  const peutChoisirType = edt.enseignants.length > 1 || (edt.enseignants.length === 1 && edt.classes.length > 0)

  return (
    <>
      <PageHeader
        titre="Emplois du temps"
        description={type === 'enseignant' ? `Les cours de ${edt.cible.label}${edt.heures ? ` · ${edt.heures} h par semaine` : ''}.` : `La semaine de la classe ${edt.cible.label}.`}
        actions={
          edt.modifiable && type === 'classe' ? (
            <button type="button" onClick={() => setFormulaire((v) => !v)} aria-expanded={formulaire} className={boutonClasses({ variante: 'primaire' })}>
              <IconPlus size={18} aria-hidden="true" />
              Ajouter un cours
            </button>
          ) : undefined
        }
      />

      <div className="no-print mb-5 flex flex-wrap items-end gap-3">
        {peutChoisirType && (
          <Onglets
            ariaLabel="Afficher par"
            onglets={[
              { cle: 'classe', label: 'Par classe' },
              { cle: 'enseignant', label: 'Par enseignant' },
            ]}
            actif={type}
            onChange={(t) => setCible({ type: t, id: (t === 'classe' ? edt.classes[0]?.id : edt.enseignants[0]?.id) ?? '' })}
          />
        )}
        {options.length > 1 && (
          <Champ id="cible-edt" label={type === 'classe' ? 'Classe' : 'Enseignant'} className="min-w-56">
            <Selection id="cible-edt" value={edt.cible.id} onChange={(e) => setCible({ type, id: e.target.value })}>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </Selection>
          </Champ>
        )}
      </div>

      {formulaire && edt.modifiable && type === 'classe' && <FormulaireCours classeId={edt.cible.id} onTermine={() => setFormulaire(false)} />}

      {edt.creneaux.length === 0 ? (
        <EtatVide icone={IconCalendarWeek} titre="Aucun cours programmé" texte="Aucun cours n’est enregistré pour cette sélection." />
      ) : (
        <GrilleEdt creneaux={edt.creneaux} type={type} onSupprimer={edt.modifiable ? (id) => supprimer.mutate(id) : undefined} />
      )}
    </>
  )
}
