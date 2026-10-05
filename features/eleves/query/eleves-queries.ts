'use client'

import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useActeur } from '@/hooks/use-acteur'
import { getEleves, getFicheEleve } from '../api/eleves-api'
import type { FiltresEleves } from '../types'

export const elevesKeys = {
  all: ['eleves'] as const,
  liste: (role: string, userId: string, filtres: Omit<FiltresEleves, 'page'>) => ['eleves', 'liste', role, userId, filtres] as const,
  fiche: (userId: string, matricule: string) => ['eleves', 'fiche', userId, matricule] as const,
}

/** Liste paginée (« Charger plus ») des élèves visibles par l'acteur. */
export function useEleves(filtres: Omit<FiltresEleves, 'page'>) {
  const acteur = useActeur()
  return useInfiniteQuery({
    queryKey: elevesKeys.liste(acteur?.role ?? '', acteur?.userId ?? '', filtres),
    queryFn: ({ pageParam }) => getEleves(acteur!, { ...filtres, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (derniere) => {
      const page = derniere.meta.page ?? 1
      return page < (derniere.meta.totalPages ?? 1) ? page + 1 : undefined
    },
    enabled: !!acteur,
    placeholderData: keepPreviousData,
  })
}

export function useFicheEleve(matricule: string) {
  const acteur = useActeur()
  return useQuery({
    queryKey: elevesKeys.fiche(acteur?.userId ?? '', matricule),
    queryFn: () => getFicheEleve(acteur!, matricule),
    enabled: !!acteur,
    retry: false,
  })
}
