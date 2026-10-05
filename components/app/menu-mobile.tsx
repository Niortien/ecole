'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { IconDots, IconLogout, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/hooks/use-session'
import { ROLE_LABEL, navigationDuRole } from '@/lib/roles'
import type { Session } from '@/store/session-store'
import { ICONES_NAVIGATION } from './icones'

/** Barre du bas sur téléphone : 4 raccourcis + « Plus » qui ouvre toute la navigation du profil. */
export function MenuMobile({ session }: { session: Session }) {
  const [ouvert, setOuvert] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { fermer } = useSession()
  const entrees = navigationDuRole(session.role)
  const raccourcis = entrees.slice(0, 4)

  return (
    <>
      <nav
        aria-label="Navigation rapide"
        className="no-print pb-safe fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-trait bg-papier/95 backdrop-blur-md lg:hidden"
      >
        {raccourcis.map((entree) => {
          const Icone = ICONES_NAVIGATION[entree.icone]
          const actif = pathname === entree.href || pathname.startsWith(`${entree.href}/`)
          return (
            <Link
              key={entree.href}
              href={entree.href}
              aria-current={actif ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                actif ? 'text-ardoise' : 'text-encre-doux'
              )}
            >
              {Icone && <Icone size={22} aria-hidden="true" />}
              <span className="max-w-full truncate px-1">{entree.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setOuvert(true)}
          aria-expanded={ouvert}
          className="flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-encre-doux"
        >
          <IconDots size={22} aria-hidden="true" />
          Plus
        </button>
      </nav>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Toutes les pages"
        aria-hidden={!ouvert}
        inert={!ouvert}
        className={cn(
          'no-print fixed inset-0 z-50 flex flex-col bg-papier transition-opacity duration-200 lg:hidden',
          ouvert ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-display text-xl font-semibold">{session.nom}</p>
            <p className="text-sm text-encre-doux">{ROLE_LABEL[session.role]}</p>
          </div>
          <button
            type="button"
            onClick={() => setOuvert(false)}
            aria-label="Fermer"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-papier-2"
          >
            <IconX size={24} aria-hidden="true" />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto px-5">
          {entrees.map((entree) => {
            const Icone = ICONES_NAVIGATION[entree.icone]
            return (
              <li key={entree.href}>
                <Link href={entree.href} onClick={() => setOuvert(false)} className="flex min-h-14 items-center gap-4 border-b border-trait text-lg font-medium">
                  {Icone && <Icone size={24} className="text-ardoise" aria-hidden="true" />}
                  {entree.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="p-5">
          <button
            type="button"
            onClick={() => {
              fermer()
              router.push('/connexion')
            }}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-trait font-semibold"
          >
            <IconLogout size={18} aria-hidden="true" />
            Changer de profil
          </button>
        </div>
      </div>
    </>
  )
}
