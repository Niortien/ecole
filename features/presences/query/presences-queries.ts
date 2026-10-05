'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { messageErreur } from '@/lib/api'
import { useActeur } from '@/hooks/use-acteur'
import { useFileAttenteStore } from '@/store/file-attente-store'
import { enregistrerAppel, getAbsentsLongs, getAppel, getSituationAppels } from '../api/presences-api'
import type { DemiJournee } from '@/types/domain'
import type { SaisieAppel } from '../types'

export const presencesKeys = {
  all: ['presences'] as const,
  situation: (userId: string, date: string) => ['presences', 'situation', userId, date] as const,
  appel: (userId: string, classeId: string, date: string, demi: DemiJournee) => ['presences', 'appel', userId, classeId, date, demi] as const,
  absents: (userId: string) => ['presences', 'absents', userId] as const,
}

export function useSituationAppels(date: string) {
  const acteur = useActeur()
  return useQuery({
    queryKey: presencesKeys.situation(acteur?.userId ?? '', date),
    queryFn: () => getSituationAppels(acteur!, date),
    enabled: !!acteur,
  })
}

export function useAppel(classeId: string, date: string, demi: DemiJournee) {
  const acteur = useActeur()
  return useQuery({
    queryKey: presencesKeys.appel(acteur?.userId ?? '', classeId, date, demi),
    queryFn: () => getAppel(acteur!, classeId, date, demi),
    enabled: !!acteur && !!classeId,
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
  })
}

export function useAbsentsLongs() {
  const acteur = useActeur()
  return useQuery({
    queryKey: presencesKeys.absents(acteur?.userId ?? ''),
    queryFn: () => getAbsentsLongs(acteur!),
    enabled: !!acteur,
  })
}

/** Enregistre l'appel ; hors ligne, il est gardé dans le téléphone et envoyé au retour du réseau. */
export function useEnregistrerAppel() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  const ajouterAppel = useFileAttenteStore((s) => s.ajouterAppel)
  return useMutation({
    mutationFn: async (saisie: SaisieAppel) => {
      if (!navigator.onLine) {
        ajouterAppel(saisie)
        return { horsLigne: true as const }
      }
      await enregistrerAppel(acteur!, saisie)
      return { horsLigne: false as const }
    },
    onSuccess: ({ horsLigne }) => {
      if (horsLigne) toast('Appel gardé sur votre téléphone : il sera envoyé au retour du réseau.')
      else toast.success('Appel enregistré')
      void queryClient.invalidateQueries({ queryKey: presencesKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['accueil'] })
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}
