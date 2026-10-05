'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { IconLogout } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/common/logo'
import { useSession } from '@/hooks/use-session'
import { ROLE_LABEL, navigationDuRole } from '@/lib/roles'
import type { Session } from '@/store/session-store'
import { ICONES_NAVIGATION, ICONES_ROLE } from './icones'

export function SidebarNav({ session }: { session: Session }) {
  const pathname = usePathname()
  const router = useRouter()
  const { fermer } = useSession()
  const IconeRole = ICONES_ROLE[session.role]

  function changerProfil() {
    fermer()
    router.push('/connexion')
  }

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-trait bg-papier-2 p-4 lg:flex">
      <Link href="/accueil" aria-label="Cartable, accueil" className="rounded-lg px-2 py-2">
        <Logo />
      </Link>

      <nav aria-label="Navigation de l'application" className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navigationDuRole(session.role).map((entree) => {
          const Icone = ICONES_NAVIGATION[entree.icone]
          const actif = pathname === entree.href || pathname.startsWith(`${entree.href}/`)
          return (
            <Link
              key={entree.href}
              href={entree.href}
              aria-current={actif ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                actif ? 'bg-ardoise text-white' : 'text-encre hover:bg-papier-3'
              )}
            >
              {Icone && <Icone size={20} aria-hidden="true" />}
              {entree.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-trait bg-surface p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ardoise-pale text-ardoise">
            <IconeRole size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{session.nom}</p>
            <p className="text-xs text-encre-doux">{ROLE_LABEL[session.role]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={changerProfil}
          className="mt-3 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-trait text-sm font-medium hover:border-encre-doux"
        >
          <IconLogout size={16} aria-hidden="true" />
          Changer de profil
        </button>
      </div>
    </aside>
  )
}
