import type { Metadata } from 'next'
import { appConfig } from '@/config/app.config'
import { DemoCta } from '@/components/vitrine/demo-cta'
import { Hero } from '@/components/vitrine/hero'
import { Ivoirien } from '@/components/vitrine/ivoirien'
import { Modules } from '@/components/vitrine/modules'
import { Quotidien } from '@/components/vitrine/quotidien'
import { Roles } from '@/components/vitrine/roles'

export const metadata: Metadata = {
  title: { absolute: `${appConfig.name} — Logiciel de gestion scolaire à Abidjan : notes, bulletins, scolarité` },
  alternates: { canonical: '/' },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: appConfig.name, url: appConfig.url },
    {
      '@type': 'SoftwareApplication',
      name: appConfig.name,
      url: appConfig.url,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'fr',
      description: appConfig.description,
    },
  ],
}

export default function AccueilPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Hero />
      <Roles />
      <Quotidien />
      <Modules />
      <Ivoirien />
      <DemoCta />
    </>
  )
}
