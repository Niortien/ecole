import type { Metadata } from 'next'
import { ListeClasses } from '@/features/classes/components/liste-classes'

export const metadata: Metadata = { title: 'Classes' }

export default function ClassesPage() {
  return <ListeClasses />
}
