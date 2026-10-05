import type { Metadata } from 'next'
import { DisciplineVue } from '@/features/discipline/components/discipline-vue'

export const metadata: Metadata = { title: 'Discipline' }

export default function DisciplinePage() {
  return <DisciplineVue />
}
