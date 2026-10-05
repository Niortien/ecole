import type { Metadata } from 'next'
import { FicheEleveVue } from '@/features/eleves/components/fiche-eleve'

export const metadata: Metadata = { title: 'Fiche élève' }

export default async function FicheElevePage({ params }: { params: Promise<{ matricule: string }> }) {
  const { matricule } = await params
  return <FicheEleveVue matricule={matricule} />
}
