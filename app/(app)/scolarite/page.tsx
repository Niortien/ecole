import type { Metadata } from 'next'
import { ScolariteVue } from '@/features/scolarite/components/scolarite-vue'

export const metadata: Metadata = { title: 'Scolarité' }

export default function ScolaritePage() {
  return <ScolariteVue />
}
