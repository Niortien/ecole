import type { Metadata } from 'next'
import { IconBrandWhatsapp, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react'
import { ButtonLink } from '@/components/common/button-link'
import { PageTitre } from '@/components/vitrine/page-titre'
import { contactConfig } from '@/config/app.config'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l’équipe Cartable à Cocody, Abidjan : WhatsApp, téléphone ou e-mail.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  const whatsapp = contactConfig.whatsapp.replace(/[^0-9]/g, '')

  return (
    <>
      <PageTitre titre="Parlons de votre école." intro="Une question, une démonstration en direct, un devis : le plus rapide est WhatsApp." />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-24 sm:px-8 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-trait bg-surface p-6 sm:p-8">
          <ul className="space-y-5 text-lg">
            <li className="flex items-start gap-3">
              <IconMapPin size={22} className="mt-1 shrink-0 text-ardoise" aria-hidden="true" />
              {contactConfig.adresse}
            </li>
            <li className="flex items-start gap-3">
              <IconPhone size={22} className="mt-1 shrink-0 text-ardoise" aria-hidden="true" />
              {contactConfig.telephone}
            </li>
            <li className="flex items-start gap-3">
              <IconMail size={22} className="mt-1 shrink-0 text-ardoise" aria-hidden="true" />
              {contactConfig.email}
            </li>
          </ul>
          <p className="mt-6 text-sm text-encre-doux">Coordonnées à confirmer avant la mise en ligne définitive.</p>
        </div>
        <div className="flex flex-col items-start justify-between gap-6 rounded-[1.25rem] bg-ardoise p-6 text-white sm:p-8">
          <p className="font-display text-3xl leading-tight font-bold">Écrivez-nous sur WhatsApp, on vous répond avec une démo.</p>
          <ButtonLink href={`https://wa.me/${whatsapp}`} variante="crayon" taille="lg">
            <IconBrandWhatsapp size={20} aria-hidden="true" />
            Ouvrir WhatsApp
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
