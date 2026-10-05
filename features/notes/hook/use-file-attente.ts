'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usePersistHydration } from '@/lib/use-persist-hydration'
import { useActeur } from '@/hooks/use-acteur'
import { useFileAttenteStore } from '@/store/file-attente-store'
import { enregistrerAppel } from '@/features/presences/api/presences-api'
import { enregistrerNote } from '../api/notes-api'

/** Nombre de modifications (notes et appels) en attente de réseau. */
export function useModificationsEnAttente(): number {
  const pret = usePersistHydration(useFileAttenteStore.persist)
  const nombre = useFileAttenteStore((s) => s.modifications.length + s.appels.length)
  return pret ? nombre : 0
}

/**
 * Rejoue la file d'attente quand le réseau revient (et au chargement si l'appareil est en ligne).
 * À monter une seule fois, dans le cadre de l'application.
 */
export function useSynchronisationFile() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  const pret = usePersistHydration(useFileAttenteStore.persist)

  useEffect(() => {
    if (!pret || !acteur) return
    let enCours = false

    async function synchroniser() {
      const etat = useFileAttenteStore.getState()
      const total = etat.modifications.length + etat.appels.length
      if (enCours || total === 0 || !navigator.onLine || !acteur) return
      enCours = true
      const notesEnvoyees: string[] = []
      let appelsEnvoyes = 0
      try {
        for (const m of etat.modifications) {
          await enregistrerNote(acteur, m)
          notesEnvoyees.push(m.id)
        }
        for (const a of etat.appels) {
          await enregistrerAppel(acteur, a)
          appelsEnvoyes++
        }
      } catch {
        toast.error('La synchronisation a échoué. Nouvel essai au prochain retour du réseau.')
      } finally {
        etat.retirer(notesEnvoyees)
        if (appelsEnvoyes === etat.appels.length) etat.viderAppels()
        enCours = false
        const envoyes = notesEnvoyees.length + appelsEnvoyes
        if (envoyes > 0) {
          toast.success(`${envoyes} modification${envoyes > 1 ? 's' : ''} synchronisée${envoyes > 1 ? 's' : ''}`)
          void queryClient.invalidateQueries()
        }
      }
    }

    void synchroniser()
    window.addEventListener('online', synchroniser)
    return () => window.removeEventListener('online', synchroniser)
  }, [pret, acteur, queryClient])
}
