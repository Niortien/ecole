'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { messageErreur } from '@/lib/api'
import type { ParamsCalcul } from '@/lib/domain/params'
import { useActeur } from '@/hooks/use-acteur'
import { enregistrerParametres, getParametres } from '../api/parametres-api'

export function useParametres() {
  const acteur = useActeur()
  return useQuery({ queryKey: ['parametres', acteur?.userId ?? ''] as const, queryFn: () => getParametres(acteur!), enabled: acteur?.role === 'DIRECTION' })
}

export function useEnregistrerParametres() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (calcul: ParamsCalcul) => enregistrerParametres(acteur!, calcul),
    onSuccess: () => {
      toast.success('Paramètres enregistrés : les moyennes et bulletins sont recalculés')
      // Tout ce qui dépend du calcul des moyennes doit être relu.
      void queryClient.invalidateQueries()
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}
