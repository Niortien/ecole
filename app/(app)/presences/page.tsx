import type { Metadata } from 'next'
import { PresencesVue } from '@/features/presences/components/presences-vue'

export const metadata: Metadata = { title: 'Présences' }

export default function PresencesPage() {
  return <PresencesVue />
}
