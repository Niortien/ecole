'use client'

import { useEffect, type RefObject } from 'react'
import { getGsap, FULL_MOTION, REDUCED_MOTION } from '@/lib/gsap'

type Tools = ReturnType<typeof getGsap>
type MotionSetup = (tools: Tools & { reduced: boolean }) => void | (() => void)

/**
 * Exécute une animation GSAP bornée au conteneur `scope`.
 * `reduced` vaut true quand l'utilisateur a demandé de réduire les animations :
 * le setup doit alors se limiter à des fondus et à des effets sans déplacement
 * (pas de parallaxe, de translation ni de mise à l'échelle). Nettoyage au démontage.
 */
export function useGsapScope(scope: RefObject<HTMLElement | null>, setup: MotionSetup) {
  useEffect(() => {
    const root = scope.current
    if (!root) return
    const tools = getGsap()
    const mm = tools.gsap.matchMedia(root)
    mm.add(FULL_MOTION, () => setup({ ...tools, reduced: false }))
    mm.add(REDUCED_MOTION, () => setup({ ...tools, reduced: true }))
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
