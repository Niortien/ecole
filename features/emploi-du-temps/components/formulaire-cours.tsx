'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Champ, Saisie, Selection } from '@/components/common/champs'
import { boutonClasses } from '@/components/common/button-link'
import { messageErreur } from '@/lib/api'
import { JOUR_LABEL } from '@/lib/domain/calendrier'
import { PLAGES_HORAIRES } from '@/lib/domain/emploi-du-temps'
import type { JourSemaine } from '@/types/domain'
import { useAjouterCreneau, useOptionsFormulaire } from '../query/emploi-du-temps-queries'

/** Ajout d'un cours : un chevauchement de classe, d'enseignant ou de salle est refusé et expliqué sur place. */
export function FormulaireCours({ classeId, onTermine }: { classeId: string; onTermine: () => void }) {
  const { data } = useOptionsFormulaire(classeId)
  const ajouter = useAjouterCreneau()
  const [jour, setJour] = useState<JourSemaine>(1)
  const [plage, setPlage] = useState(0)
  const [matiere, setMatiere] = useState('')
  const [salle, setSalle] = useState('')

  const matieres = data?.data.matieres ?? []
  const matiereId = matiere || matieres[0]?.matiereId || ''
  const horaire = PLAGES_HORAIRES[plage]

  function envoyer(e: React.FormEvent) {
    e.preventDefault()
    ajouter.mutate(
      { classeId, jour, debut: horaire.debut, fin: horaire.fin, matiereId, salle: salle || data?.data.salle || '' },
      { onSuccess: onTermine }
    )
  }

  return (
    <form onSubmit={envoyer} className="mb-5 grid gap-4 rounded-[1.25rem] border border-trait bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4">
      <Champ id="cours-jour" label="Jour">
        <Selection id="cours-jour" value={jour} onChange={(e) => setJour(Number(e.target.value) as JourSemaine)}>
          {([1, 2, 3, 4, 5] as JourSemaine[]).map((j) => (
            <option key={j} value={j}>
              {JOUR_LABEL[j]}
            </option>
          ))}
        </Selection>
      </Champ>
      <Champ id="cours-horaire" label="Horaire">
        <Selection id="cours-horaire" value={plage} onChange={(e) => setPlage(Number(e.target.value))}>
          {PLAGES_HORAIRES.map((p, i) => (
            <option key={p.debut} value={i}>
              {p.debut} – {p.fin}
            </option>
          ))}
        </Selection>
      </Champ>
      <Champ id="cours-matiere" label="Matière" aide={matieres.find((m) => m.matiereId === matiereId)?.enseignant}>
        <Selection id="cours-matiere" value={matiereId} onChange={(e) => setMatiere(e.target.value)}>
          {matieres.map((m) => (
            <option key={m.matiereId} value={m.matiereId}>
              {m.libelle}
            </option>
          ))}
        </Selection>
      </Champ>
      <Champ id="cours-salle" label="Salle">
        <Saisie id="cours-salle" value={salle || data?.data.salle || ''} onChange={(e) => setSalle(e.target.value)} />
      </Champ>

      {ajouter.isError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-stylo/30 bg-stylo-pale p-3 text-sm text-stylo sm:col-span-2 lg:col-span-4">
          <IconAlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          Ce cours ne peut pas être ajouté : {messageErreur(ajouter.error)}
        </p>
      )}

      <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-4">
        <button type="button" onClick={onTermine} className={boutonClasses({ variante: 'discret' })}>
          Annuler
        </button>
        <button type="submit" disabled={ajouter.isPending || !matiereId} className={boutonClasses({ variante: 'primaire' })}>
          {ajouter.isPending ? 'Vérification…' : 'Ajouter le cours'}
        </button>
      </div>
    </form>
  )
}
