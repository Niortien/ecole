'use client'

import { usePersistHydration } from '@/lib/use-persist-hydration'
import { useSessionStore } from '@/store/session-store'

/** Session courante ; `pret` vaut false tant que le navigateur n'a pas relu le stockage (évite tout écart serveur/client). */
export function useSession() {
  const pret = usePersistHydration(useSessionStore.persist)
  const session = useSessionStore((s) => s.session)
  const ouvrir = useSessionStore((s) => s.ouvrir)
  const fermer = useSessionStore((s) => s.fermer)
  return { pret, session: pret ? session : null, ouvrir, fermer }
}
