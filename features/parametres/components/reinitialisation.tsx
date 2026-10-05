'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { IconRefresh } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { Panneau } from '@/components/common/panneau'
import { boutonClasses } from '@/components/common/button-link'
import { aDesModifications, reinitialiserDemo } from '@/services/mock-db/store'

/** Remet les données de démonstration à leur état d'origine (efface les notes, paiements, sanctions… saisis pendant l'essai). */
export function BandeauReinitialisation() {
  const router = useRouter()
  const queryClient = useQueryClient()

  function reinitialiser() {
    reinitialiserDemo()
    queryClient.clear()
    toast.success('Démo remise à zéro')
    router.refresh()
  }

  return (
    <Panneau titre="Données de démonstration" description="Vous êtes dans une école fictive : tout ce que vous modifiez reste dans ce navigateur.">
      <button type="button" onClick={reinitialiser} disabled={!aDesModifications()} className={boutonClasses({ variante: 'secondaire' })}>
        <IconRefresh size={18} aria-hidden="true" />
        Réinitialiser la démo
      </button>
    </Panneau>
  )
}
