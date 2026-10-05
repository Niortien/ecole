'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/hooks/use-session'
import { useSynchronisationFile } from '@/features/notes/hook/use-file-attente'
import { ACCUEIL_PAR_DEFAUT, peutAcceder } from '@/lib/roles'
import { BandeauDemo } from './bandeau-demo'
import { MenuMobile } from './menu-mobile'
import { SidebarNav } from './sidebar-nav'

/** Cadre de l'application : barre latérale (ordinateur), barre du bas (téléphone), garde de session. */
export function AppShell({ children }: { children: ReactNode }) {
  const { pret, session, ouvrir } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  useSynchronisationFile()

  useEffect(() => {
    if (!pret) return
    if (!session) {
      router.replace('/connexion')
      return
    }
    // Renouvelle le cookie de démo (durée 12 h) tant que la session locale existe.
    ouvrir(session)
    if (!peutAcceder(session.role, pathname)) router.replace(ACCUEIL_PAR_DEFAUT)
  }, [pret, session, pathname, router, ouvrir])

  if (!pret || !session) {
    return (
      <div role="status" aria-label="Chargement" className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-trait border-t-ardoise" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-ardoise focus:px-4 focus:py-2 focus:text-white">
        Aller au contenu
      </a>
      <BandeauDemo />
      <div className="flex flex-1">
        <SidebarNav session={session} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="contenu" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 sm:px-8 sm:pt-8 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
      <MenuMobile session={session} />
    </div>
  )
}
