import Link from 'next/link'
import { IconBrandWhatsapp, IconMapPin } from '@tabler/icons-react'
import { Logo } from '@/components/common/logo'
import { appConfig, contactConfig } from '@/config/app.config'

const LIENS = [
  { href: '/fonctionnalites', label: 'Fonctionnalités' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/contact', label: 'Contact' },
  { href: '/connexion', label: 'Voir la démo' },
]

export function SiteFooter() {
  const whatsapp = contactConfig.whatsapp.replace(/[^0-9]/g, '')

  return (
    <footer className="mt-auto border-t border-trait bg-papier-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-encre-doux">{appConfig.tagline}</p>
        </div>
        <nav aria-label="Pied de page" className="flex flex-col text-sm">
          {LIENS.map((lien) => (
            <Link key={lien.href} href={lien.href} className="flex min-h-11 items-center text-encre-doux hover:text-encre">
              {lien.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-encre-doux">
          <p className="flex items-start gap-2">
            <IconMapPin size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            {contactConfig.adresse}
          </p>
          <a
            href={`https://wa.me/${whatsapp}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-ardoise hover:underline"
          >
            <IconBrandWhatsapp size={18} aria-hidden="true" />
            Écrire sur WhatsApp
          </a>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-8 text-xs text-encre-doux sm:px-8">
        © {new Date().getFullYear()} {appConfig.name}. Les données de la démonstration sont fictives.
      </p>
    </footer>
  )
}
