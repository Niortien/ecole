import type { Metadata } from 'next'
import { ParametresVue } from '@/features/parametres/components/parametres-vue'

export const metadata: Metadata = { title: 'Paramètres' }

export default function ParametresPage() {
  return <ParametresVue />
}
