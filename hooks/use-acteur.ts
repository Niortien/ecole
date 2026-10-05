'use client'

import { useSession } from '@/hooks/use-session'
import type { Acteur } from '@/services/mock-db/acces'

/** L'acteur courant pour les appels API (null tant que la session n'est pas relue : les requêtes restent en attente). */
export function useActeur(): Acteur | null {
  const { session } = useSession()
  return session ? { userId: session.userId, role: session.role } : null
}
