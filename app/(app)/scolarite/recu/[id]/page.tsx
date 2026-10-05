import type { Metadata } from 'next'
import { RecuVue } from '@/features/scolarite/components/recu-vue'

export const metadata: Metadata = { title: 'Reçu de paiement' }

export default async function RecuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RecuVue paiementId={id} />
}
