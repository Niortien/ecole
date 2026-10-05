import type { Metadata } from 'next'
import { AccueilVue } from '@/features/accueil/components/accueil-vue'

export const metadata: Metadata = { title: 'Accueil' }

export default function AccueilPage() {
  return <AccueilVue />
}
