'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { useGsapScope } from '@/hooks/use-gsap'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  as?: ElementType
  /** Décalage entre les enfants marqués `data-reveal` (s). Sans enfant marqué, le conteneur lui-même apparaît. */
  stagger?: number
}

/**
 * Apparition à l'entrée dans le viewport : 14 px de montée + fondu.
 * Le contenu reste visible sans JavaScript et avec « réduire les animations ».
 */
export function Reveal({ children, className, as: Tag = 'div', stagger = 0.07 }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGsapScope(ref, ({ gsap, reduced }) => {
    const root = ref.current
    if (!root) return
    const targets = root.querySelectorAll('[data-reveal]')
    const items = targets.length > 0 ? Array.from(targets) : [root]
    gsap.from(items, {
      opacity: 0,
      y: reduced ? 0 : 14,
      duration: 0.7,
      ease: 'power3.out',
      stagger,
      scrollTrigger: { trigger: root, start: 'top 88%', once: true },
    })
  })

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
