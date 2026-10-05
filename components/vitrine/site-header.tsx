'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconMenu2, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/common/logo'
import { ButtonLink } from '@/components/common/button-link'

const LIENS = [
  { href: '/fonctionnalites', label: 'Fonctionnalités' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const [ouvert, setOuvert] = useState(false)
  const [defile, setDefile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setDefile(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!ouvert) return
    const precedent = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = precedent
      window.removeEventListener('keydown', onKey)
    }
  }, [ouvert])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-200',
        defile ? 'border-trait bg-papier/90 backdrop-blur-md' : 'border-transparent bg-papier'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Cartable, accueil" className="rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {LIENS.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              aria-current={pathname === lien.href ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors',
                pathname === lien.href ? 'bg-papier-2 text-encre' : 'text-encre-doux hover:text-encre'
              )}
            >
              {lien.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/connexion" variante="primaire" className="hidden sm:inline-flex">
            Voir la démo
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOuvert(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={ouvert}
            className="flex h-11 w-11 items-center justify-center rounded-full text-encre hover:bg-papier-2 md:hidden"
          >
            <IconMenu2 size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!ouvert}
        inert={!ouvert}
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-papier transition-opacity duration-200 md:hidden',
          ouvert ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button
            type="button"
            onClick={() => setOuvert(false)}
            aria-label="Fermer le menu"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-papier-2"
          >
            <IconX size={24} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Navigation mobile" className="flex flex-1 flex-col justify-center gap-2 px-6">
          {LIENS.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              onClick={() => setOuvert(false)}
              className="border-b border-trait py-5 font-display text-3xl font-semibold"
            >
              {lien.label}
            </Link>
          ))}
          <ButtonLink href="/connexion" taille="lg" className="mt-6" onClick={() => setOuvert(false)}>
            Voir la démo
          </ButtonLink>
        </nav>
      </div>
    </header>
  )
}
