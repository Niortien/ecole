import type { Metadata } from 'next'
import { ListeEleves } from '@/features/eleves/components/liste-eleves'

export const metadata: Metadata = { title: 'Élèves' }

export default async function ElevesPage({ searchParams }: { searchParams: Promise<{ classe?: string }> }) {
  const { classe } = await searchParams
  return <ListeEleves classeInitiale={classe} />
}
