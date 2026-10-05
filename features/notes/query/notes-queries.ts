'use client'

import { useQuery } from '@tanstack/react-query'
import { useActeur } from '@/hooks/use-acteur'
import { getGrille, getMatieresDeClasse } from '../api/notes-api'
import type { ParamsGrille } from '../types'

export const notesKeys = {
  all: ['notes'] as const,
  grille: (userId: string, p: ParamsGrille) => ['notes', 'grille', userId, p] as const,
  matieres: (userId: string, classeId: string) => ['notes', 'matieres', userId, classeId] as const,
}

export function useGrille(params: ParamsGrille | null) {
  const acteur = useActeur()
  return useQuery({
    queryKey: notesKeys.grille(acteur?.userId ?? '', params ?? { classeId: '', matiereId: '', trimestre: 1 }),
    queryFn: () => getGrille(acteur!, params!),
    enabled: !!acteur && !!params,
    retry: false,
    // La grille est modifiée localement pendant la saisie : on ne la recharge pas en tâche de fond.
    staleTime: Infinity,
    gcTime: 0,
  })
}

export function useMatieresDeClasse(classeId: string) {
  const acteur = useActeur()
  return useQuery({
    queryKey: notesKeys.matieres(acteur?.userId ?? '', classeId),
    queryFn: () => getMatieresDeClasse(acteur!, classeId),
    enabled: !!acteur && !!classeId,
  })
}
