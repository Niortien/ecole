'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { messageErreur } from '@/lib/api'
import { useActeur } from '@/hooks/use-acteur'
import { ajouterCreneau, getEmploiDuTemps, getOptionsFormulaire, supprimerCreneau } from '../api/emploi-du-temps-api'
import type { NouveauCreneau, TypeCible } from '../types'

export const edtKeys = {
  all: ['emploi-du-temps'] as const,
  vue: (userId: string, cible: string) => ['emploi-du-temps', 'vue', userId, cible] as const,
  options: (userId: string, classeId: string) => ['emploi-du-temps', 'options', userId, classeId] as const,
}

export function useEmploiDuTemps(cible?: { type: TypeCible; id: string }) {
  const acteur = useActeur()
  return useQuery({
    queryKey: edtKeys.vue(acteur?.userId ?? '', cible ? `${cible.type}:${cible.id}` : 'defaut'),
    queryFn: () => getEmploiDuTemps(acteur!, cible),
    enabled: !!acteur,
    retry: false,
  })
}

export function useOptionsFormulaire(classeId: string) {
  const acteur = useActeur()
  return useQuery({
    queryKey: edtKeys.options(acteur?.userId ?? '', classeId),
    queryFn: () => getOptionsFormulaire(acteur!, classeId),
    enabled: acteur?.role === 'DIRECTION' && !!classeId,
  })
}

export function useAjouterCreneau() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nouveau: NouveauCreneau) => ajouterCreneau(acteur!, nouveau),
    onSuccess: () => {
      toast.success('Cours ajouté')
      void queryClient.invalidateQueries({ queryKey: edtKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['accueil'] })
    },
  })
}

export function useSupprimerCreneau() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supprimerCreneau(acteur!, id),
    onSuccess: () => {
      toast.success('Cours supprimé')
      void queryClient.invalidateQueries({ queryKey: edtKeys.all })
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}
