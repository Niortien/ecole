import type { Metadata } from 'next'
import { EmploiDuTempsVue } from '@/features/emploi-du-temps/components/emploi-du-temps-vue'

export const metadata: Metadata = { title: 'Emplois du temps' }

export default function EmploisDuTempsPage() {
  return <EmploiDuTempsVue />
}
