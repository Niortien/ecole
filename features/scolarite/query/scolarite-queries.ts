'use client'

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { messageErreur } from '@/lib/api'
import { useActeur } from '@/hooks/use-acteur'
import { enregistrerPaiement, getRecu, getScolarite, getScolariteEnfants } from '../api/scolarite-api'
import type { FiltresScolarite, NouveauPaiement } from '../types'

export const scolariteKeys = {
  all: ['scolarite'] as const,
  liste: (userId: string, filtres: Omit<FiltresScolarite, 'page'>) => ['scolarite', 'liste', userId, filtres] as const,
  enfants: (userId: string) => ['scolarite', 'enfants', userId] as const,
}

export function useScolarite(filtres: Omit<FiltresScolarite, 'page'>) {
  const acteur = useActeur()
  const autorise = acteur?.role === 'DIRECTION' || acteur?.role === 'ECONOME'
  return useInfiniteQuery({
    queryKey: scolariteKeys.liste(acteur?.userId ?? '', filtres),
    queryFn: ({ pageParam }) => getScolarite(acteur!, { ...filtres, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (derniere) => ((derniere.meta.page ?? 1) < (derniere.meta.totalPages ?? 1) ? (derniere.meta.page ?? 1) + 1 : undefined),
    enabled: !!acteur && autorise,
    placeholderData: keepPreviousData,
  })
}

export function useScolariteEnfants() {
  const acteur = useActeur()
  return useQuery({
    queryKey: scolariteKeys.enfants(acteur?.userId ?? ''),
    queryFn: () => getScolariteEnfants(acteur!),
    enabled: acteur?.role === 'PARENT',
  })
}

export function useEnregistrerPaiement() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nouveau: NouveauPaiement) => enregistrerPaiement(acteur!, nouveau),
    onSuccess: ({ data }) => {
      toast.success(`Paiement enregistré · reçu ${data.recu}`)
      void queryClient.invalidateQueries({ queryKey: scolariteKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['eleves'] })
      void queryClient.invalidateQueries({ queryKey: ['accueil'] })
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}

export function useRecu(paiementId: string) {
  const acteur = useActeur()
  return useQuery({
    queryKey: ['scolarite', 'recu', acteur?.userId ?? '', paiementId] as const,
    queryFn: () => getRecu(acteur!, paiementId),
    enabled: !!acteur,
    retry: false,
  })
}
