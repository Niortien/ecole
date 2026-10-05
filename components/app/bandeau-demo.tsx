'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { IconRefresh } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { dateDuJour } from '@/lib/clock'
import { formaterDate } from '@/lib/domain/calendrier'
import { reinitialiserDemo } from '@/services/mock-db/store'

export function BandeauDemo() {
  const router = useRouter()
  const queryClient = useQueryClient()

  function reinitialiser() {
    reinitialiserDemo()
    queryClient.clear()
    toast.success('Démo remise à zéro')
    router.refresh()
  }

  return (
    <div className="no-print flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-crayon-pale px-4 py-1.5 text-center text-xs text-crayon-texte sm:text-sm">
      <span>
        <strong>Démonstration</strong> · données fictives · date simulée : {formaterDate(dateDuJour())}
      </span>
      <button
        type="button"
        onClick={reinitialiser}
        className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 font-semibold underline underline-offset-2 hover:no-underline"
      >
        <IconRefresh size={14} aria-hidden="true" />
        Réinitialiser
      </button>
    </div>
  )
}
