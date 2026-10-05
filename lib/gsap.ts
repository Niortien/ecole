import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Enregistre les plugins GSAP une seule fois (côté client uniquement). */
export function getGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  return { gsap, ScrollTrigger }
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)'
