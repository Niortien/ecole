'use client'

import { useActeur } from '@/hooks/use-acteur'
import { ScolaritePersonnel } from './scolarite-personnel'
import { ScolariteParent } from './scolarite-parent'

/** Vue de la scolarité selon le profil : économat et direction gèrent, le parent consulte. */
export function ScolariteVue() {
  const acteur = useActeur()
  if (!acteur) return null
  return acteur.role === 'PARENT' ? <ScolariteParent /> : <ScolaritePersonnel />
}
