'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { messageErreur } from '@/lib/api'
import { useActeur } from '@/hooks/use-acteur'
import { ajouterEvaluation, validerNotes } from '../api/notes-api'
import { accueilKeys } from '@/features/accueil/query/accueil-queries'
import { notesKeys } from '../query/notes-queries'
import type { ColonneEvaluation, ParamsGrille } from '../types'

export function useValiderNotes() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: ParamsGrille) => validerNotes(acteur!, params),
    onSuccess: ({ data }) => {
      toast.success(`${data.validees} note${data.validees > 1 ? 's' : ''} validée${data.validees > 1 ? 's' : ''} : les parents peuvent les voir`)
      void queryClient.invalidateQueries({ queryKey: notesKeys.all })
      void queryClient.invalidateQueries({ queryKey: accueilKeys.all })
    },
    onError: (e) => toast.error(messageErreur(e)),
  })
}

export function useAjouterEvaluation() {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: ParamsGrille & { type: ColonneEvaluation['type'] }) => ajouterEvaluation(acteur!, params),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: notesKeys.all }),
    onError: (e) => toast.error(messageErreur(e)),
  })
}
