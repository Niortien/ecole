'use client'

import { useQuery } from '@tanstack/react-query'
import { useActeur } from '@/hooks/use-acteur'
import { getSalleDeSituation } from '../api/accueil-api'

export const accueilKeys = {
  all: ['accueil'] as const,
  salle: (userId: string) => ['accueil', 'salle', userId] as const,
}

export function useSalleDeSituation() {
  const acteur = useActeur()
  return useQuery({
    queryKey: accueilKeys.salle(acteur?.userId ?? ''),
    queryFn: () => getSalleDeSituation(acteur!),
    enabled: !!acteur,
  })
}
