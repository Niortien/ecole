import type { Metadata } from 'next'
import { CantineVue } from '@/features/cantine/components/cantine-vue'

export const metadata: Metadata = { title: 'Cantine' }

export default function CantinePage() {
  return <CantineVue />
}
