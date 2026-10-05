'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { messageErreur } from '@/lib/api'
import { useActeur } from '@/hooks/use-acteur'
import { enregistrerAbonnement, getAbonnes, getCantine } from '../api/cantine-api'
import type { SaisieAbonnement } from '../types'

export const cantineKeys = {
  all: ['cantine'] as const,
  vue: (userId: string) => ['cantine', 'vue', userId] as const,
  abonnes: (userId: string, q: string) => ['cantine', 'abonnes', userId, q] as const,
}

export function useCantine() {
  const acteur = useActeur()
  return useQuery({ queryKey: cantineKeys.vue(acteur?.userId ?? ''), queryFn: () => getCantine(acteur!), enabled: !!acteur })
}

export function useAbonnes(recherche: string) {
  const acteur = useActeur()
  return useQuery({
    queryKey: cantineKeys.abonnes(acteur?.userId ?? '', recherche),
    queryFn: () => getAbonnes(acteur!, recherche),
    enabled: !!acteur && recherche.trim().length >= 2,
  })
}

export function useEnregistrerAbonnement() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (saisie: SaisieAbonnement) => enregistrerAbonnement(acteur!, saisie),
    onSuccess: () => {
      toast.success('Abonnement enregistré')
      void queryClient.invalidateQueries({ queryKey: cantineKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['eleves'] })
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}
