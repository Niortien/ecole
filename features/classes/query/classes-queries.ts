'use client'

import { useQuery } from '@tanstack/react-query'
import { useActeur } from '@/hooks/use-acteur'
import { getClasses } from '../api/classes-api'

export const classesKeys = {
  all: ['classes'] as const,
  liste: (userId: string) => ['classes', 'liste', userId] as const,
}

export function useClasses() {
  const acteur = useActeur()
  return useQuery({
    queryKey: classesKeys.liste(acteur?.userId ?? ''),
    queryFn: () => getClasses(acteur!),
    enabled: !!acteur,
    staleTime: 5 * 60_000,
  })
}
