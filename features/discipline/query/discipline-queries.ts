'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { messageErreur } from '@/lib/api'
import { useActeur } from '@/hooks/use-acteur'
import { changerStatut, creerSanction, getSanctions } from '../api/discipline-api'
import type { FiltresSanctions, NouvelleSanction } from '../types'

export const disciplineKeys = {
  all: ['discipline'] as const,
  liste: (userId: string, filtres: FiltresSanctions) => ['discipline', 'liste', userId, filtres] as const,
}

export function useSanctions(filtres: FiltresSanctions) {
  const acteur = useActeur()
  return useQuery({
    queryKey: disciplineKeys.liste(acteur?.userId ?? '', filtres),
    queryFn: () => getSanctions(acteur!, filtres),
    enabled: !!acteur,
  })
}

function useInvalidation() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: disciplineKeys.all })
    void queryClient.invalidateQueries({ queryKey: ['accueil'] })
    void queryClient.invalidateQueries({ queryKey: ['eleves'] })
  }
}

export function useCreerSanction() {
  const acteur = useActeur()
  const invalider = useInvalidation()
  return useMutation({
    mutationFn: (nouvelle: NouvelleSanction) => creerSanction(acteur!, nouvelle),
    onSuccess: ({ data }) => {
      toast.success(data.sanction.statut === 'BROUILLON' ? 'Sanction déclarée : elle attend la validation de la vie scolaire' : 'Sanction enregistrée')
      invalider()
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}

export function useChangerStatut() {
  const acteur = useActeur()
  const invalider = useInvalidation()
  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: 'VALIDEE' | 'PARENT_INFORME' }) => changerStatut(acteur!, id, statut),
    onSuccess: ({ data }) => {
      toast.success(data.sanction.statut === 'VALIDEE' ? 'Sanction validée' : 'Parent marqué comme informé')
      invalider()
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}
