'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import { AvatarInitiales } from '@/components/common/avatar-initiales'
import { ChargementListe, EtatErreur } from '@/components/common/etats'
import { Onglets } from '@/components/common/onglets'
import { dateDuJour } from '@/lib/clock'
import { messageErreur } from '@/lib/api'
import { age } from '@/lib/format'
import { useActeur } from '@/hooks/use-acteur'
import { useFicheEleve } from '../query/eleves-queries'
import { OngletNotes } from './fiche/onglet-notes'
import { OngletResume } from './fiche/onglet-resume'
import { OngletCantine, OngletDiscipline, OngletScolarite } from './fiche/onglets-vie'

type Cle = 'resume' | 'notes' | 'discipline' | 'scolarite' | 'cantine'

export function FicheEleveVue({ matricule }: { matricule: string }) {
  const acteur = useActeur()
  const [onglet, setOnglet] = useState<Cle>('resume')
  const { data, isLoading, isError, error, refetch } = useFicheEleve(matricule)

  const retour = acteur?.role === 'PARENT' ? { href: '/accueil', label: 'Accueil' } : { href: '/eleves', label: 'Tous les élèves' }

  if (isLoading) return <ChargementListe lignes={4} libelle="Chargement de la fiche" />
  if (isError || !data) return <EtatErreur message={messageErreur(error)} onReessayer={() => void refetch()} />

  const fiche = data.data
  const { eleve, classe } = fiche
  const onglets: { cle: Cle; label: string }[] = [
    { cle: 'resume', label: 'Résumé' },
    { cle: 'notes', label: 'Notes' },
    { cle: 'discipline', label: 'Discipline' },
    ...(fiche.scolarite ? [{ cle: 'scolarite' as const, label: 'Scolarité' }] : []),
    { cle: 'cantine', label: 'Cantine' },
  ]

  return (
    <>
      <Link href={retour.href} className="no-print mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-encre-doux hover:text-encre">
        <IconArrowLeft size={18} aria-hidden="true" />
        {retour.label}
      </Link>

      <header className="mb-6 flex items-center gap-4">
        <AvatarInitiales nom={eleve.nom} prenoms={eleve.prenoms} taille="lg" />
        <div>
          <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
            {eleve.prenoms} {eleve.nom}
          </h1>
          <p className="mt-1 text-encre-doux">
            {classe.libelle} · {age(eleve.naissance, dateDuJour())} ans · matricule <span className="tabular-nums">{eleve.matricule}</span>
          </p>
        </div>
      </header>

      <Onglets ariaLabel="Sections de la fiche élève" onglets={onglets} actif={onglet} onChange={setOnglet} />
      <div role="tabpanel" className="mt-5">
        {onglet === 'resume' && <OngletResume fiche={fiche} />}
        {onglet === 'notes' && <OngletNotes fiche={fiche} />}
        {onglet === 'discipline' && <OngletDiscipline fiche={fiche} />}
        {onglet === 'scolarite' && <OngletScolarite fiche={fiche} />}
        {onglet === 'cantine' && <OngletCantine fiche={fiche} />}
      </div>
    </>
  )
}
