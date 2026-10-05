import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COOKIE_ROLE } from '@/lib/roles'
import type { Role } from '@/types/domain'

export interface Session {
  userId: string
  role: Role
  /** Nom affiché (« Mme Aka »). */
  nom: string
}

interface SessionState {
  session: Session | null
  ouvrir: (session: Session) => void
  fermer: () => void
}

function ecrireCookie(role: Role | null) {
  if (typeof document === 'undefined') return
  document.cookie = role
    ? `${COOKIE_ROLE}=${role}; path=/; max-age=${60 * 60 * 12}; SameSite=Lax`
    : `${COOKIE_ROLE}=; path=/; max-age=0; SameSite=Lax`
}

/** Session de démonstration (rôle choisi sur la page de connexion), conservée dans le navigateur. */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      ouvrir: (session) => {
        ecrireCookie(session.role)
        set({ session })
      },
      fermer: () => {
        ecrireCookie(null)
        set({ session: null })
      },
    }),
    { name: 'cartable-session', skipHydration: true }
  )
)
