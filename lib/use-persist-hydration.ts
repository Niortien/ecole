'use client'

import { useEffect, useSyncExternalStore } from 'react'

interface PersistApi<T> {
  hasHydrated: () => boolean
  rehydrate: () => Promise<void> | void
  onFinishHydration: (callback: (state: T) => void) => () => void
}

// Les stores zustand persistants n'exposent `.persist` qu'au client (voir
// node_modules/zustand/middleware.js : sur le serveur, `window` n'existe
// pas, donc `.persist` reste `undefined`). Ce hook attend l'hydratation
// réelle avant d'exposer les données persistées, pour éviter tout mismatch
// SSR/client.
export function usePersistHydration<T>(persist: PersistApi<T> | undefined) {
  useEffect(() => {
    if (!persist?.hasHydrated()) {
      persist?.rehydrate()
    }
  }, [persist])

  return useSyncExternalStore(
    (callback) => {
      const unsubscribe = persist?.onFinishHydration(callback)
      return unsubscribe ?? (() => {})
    },
    () => persist?.hasHydrated() ?? false,
    () => false
  )
}
