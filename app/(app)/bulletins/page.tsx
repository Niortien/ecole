import type { Metadata } from 'next'
import { BulletinsVue } from '@/features/bulletins/components/bulletins-vue'

export const metadata: Metadata = { title: 'Bulletins' }

export default async function BulletinsPage({ searchParams }: { searchParams: Promise<{ eleve?: string }> }) {
  const { eleve } = await searchParams
  return <BulletinsVue eleveInitial={eleve} />
}
