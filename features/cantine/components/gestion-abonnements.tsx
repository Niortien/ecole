'use client'

import { useDeferredValue, useState } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { Champ, Recherche, Selection } from '@/components/common/champs'
import { Panneau } from '@/components/common/panneau'
import { boutonClasses } from '@/components/common/button-link'
import { JOUR_LABEL } from '@/lib/domain/calendrier'
import { cn } from '@/lib/utils'
import type { JourSemaine } from '@/types/domain'
import { useAbonnes, useEnregistrerAbonnement } from '../query/cantine-queries'
import type { AbonneResume } from '../types'

const JOURS: JourSemaine[] = [1, 2, 3, 4, 5]
const ALLERGIES = ['arachide', 'lait', 'œuf', 'poisson', 'gluten']
const MOIS = [
  { cle: '2026-05', label: 'Mai 2026' },
  { cle: '2026-06', label: 'Juin 2026' },
  { cle: '2026-07', label: 'Juillet 2026' },
]

function Edition({ eleve, onTermine }: { eleve: AbonneResume; onTermine: () => void }) {
  const enregistrer = useEnregistrerAbonnement()
  const [jours, setJours] = useState<JourSemaine[]>(eleve.abonnement?.jours ?? [1, 2, 3, 4, 5])
  const [allergies, setAllergies] = useState<string[]>(eleve.abonnement?.allergies ?? [])
  const [paye, setPaye] = useState(eleve.abonnement?.payeJusqua ?? '2026-05')

  const basculer = <T,>(liste: T[], valeur: T): T[] => (liste.includes(valeur) ? liste.filter((x) => x !== valeur) : [...liste, valeur])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        enregistrer.mutate({ matricule: eleve.matricule, jours, allergies, payeJusqua: paye }, { onSuccess: onTermine })
      }}
      className="mt-3 space-y-4 rounded-2xl bg-papier-2 p-4"
    >
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Jours de repas</legend>
        <div className="flex flex-wrap gap-2">
          {JOURS.map((j) => (
            <button key={j} type="button" aria-pressed={jours.includes(j)} onClick={() => setJours(basculer(jours, j))} className={cn('min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold', jours.includes(j) ? 'border-ardoise bg-ardoise text-white' : 'border-trait bg-surface')}>
              {JOUR_LABEL[j].slice(0, 3)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Allergies à signaler à la cuisine</legend>
        <div className="flex flex-wrap gap-2">
          {ALLERGIES.map((a) => (
            <button key={a} type="button" aria-pressed={allergies.includes(a)} onClick={() => setAllergies(basculer(allergies, a))} className={cn('min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold', allergies.includes(a) ? 'border-stylo bg-stylo text-white' : 'border-trait bg-surface')}>
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      <Champ id={`paye-${eleve.matricule}`} label="Abonnement payé jusqu’à" className="max-w-xs">
        <Selection id={`paye-${eleve.matricule}`} value={paye} onChange={(e) => setPaye(e.target.value)}>
          <option value="2026-04">Avril 2026 (impayé ce mois)</option>
          {MOIS.map((m) => (
            <option key={m.cle} value={m.cle}>
              {m.label}
            </option>
          ))}
        </Selection>
      </Champ>
      <button type="submit" disabled={enregistrer.isPending || jours.length === 0} className={boutonClasses({ variante: 'primaire' })}>
        <IconCheck size={18} aria-hidden="true" />
        {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}

export function GestionAbonnements() {
  const [recherche, setRecherche] = useState('')
  const [edite, setEdite] = useState('')
  const differee = useDeferredValue(recherche)
  const { data } = useAbonnes(differee)
  const liste = data?.data ?? []

  return (
    <Panneau titre="Abonnements" description="Cherchez un élève pour l’inscrire ou modifier ses jours de repas et ses allergies.">
      <Recherche aria-label="Rechercher un élève" placeholder="Nom, prénom ou matricule (2 lettres minimum)" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      <ul className="mt-3 divide-y divide-trait">
        {liste.map((e) => (
          <li key={e.matricule} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <span>
                <span className="block font-medium">
                  {e.nom} {e.prenoms}
                </span>
                <span className="text-sm text-encre-doux">
                  {e.classe} · {e.abonnement ? `repas ${e.abonnement.jours.map((j) => JOUR_LABEL[j].slice(0, 3)).join(', ')}` : 'pas inscrit'}
                </span>
              </span>
              <button type="button" onClick={() => setEdite(edite === e.matricule ? '' : e.matricule)} aria-expanded={edite === e.matricule} className={boutonClasses({ variante: 'secondaire' })}>
                {e.abonnement ? 'Modifier' : 'Inscrire'}
              </button>
            </div>
            {edite === e.matricule && <Edition eleve={e} onTermine={() => setEdite('')} />}
          </li>
        ))}
        {recherche.trim().length >= 2 && liste.length === 0 && <li className="py-3 text-sm text-encre-doux">Aucun élève ne correspond.</li>}
      </ul>
    </Panneau>
  )
}
