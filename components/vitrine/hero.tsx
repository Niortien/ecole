'use client'

import { useRef } from 'react'
import { IconBrandWhatsapp, IconArrowRight } from '@tabler/icons-react'
import { ButtonLink } from '@/components/common/button-link'
import { useGsapScope } from '@/hooks/use-gsap'
import { contactConfig } from '@/config/app.config'
import { HeroCahier } from './hero-cahier'

const LIGNES_TITRE = ['Toute votre école,', 'sur une seule page', 'de cahier.']

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const whatsapp = contactConfig.whatsapp.replace(/[^0-9]/g, '')

  useGsapScope(ref, ({ gsap, reduced }) => {
    if (reduced) {
      gsap.from('[data-titre], [data-apparition]', { opacity: 0, duration: 0.8, stagger: 0.06 })
      return
    }
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.from('[data-titre]', { yPercent: 110, duration: 1, stagger: 0.12 }, 0.1).from(
      '[data-apparition]',
      { opacity: 0, y: 16, duration: 0.7, stagger: 0.1 },
      0.6
    )
  })

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 sm:px-8 sm:pt-20 lg:grid-cols-[1.35fr_1fr] lg:pb-28">
        <div>
          <h1 className="text-[clamp(2.4rem,6.4vw,4.1rem)] leading-[1.02] font-bold">
            {LIGNES_TITRE.map((ligne) => (
              <span key={ligne} className="block overflow-hidden pb-[0.1em]">
                <span data-titre className="block">
                  {ligne}
                </span>
              </span>
            ))}
          </h1>
          <p data-apparition className="mt-6 max-w-lg text-lg text-encre-doux">
            Élèves, notes, bulletins, présences, sanctions, emplois du temps, scolarité et cantine, pour les écoles
            primaires, collèges et lycées de Cocody et d’Abidjan.
          </p>
          <div data-apparition className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/connexion" taille="lg">
              Voir la démo
              <IconArrowRight size={20} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href={`https://wa.me/${whatsapp}`} variante="secondaire" taille="lg">
              <IconBrandWhatsapp size={20} aria-hidden="true" />
              Parler à l’équipe
            </ButtonLink>
          </div>
          <p data-apparition className="mt-5 text-sm text-encre-doux">
            Démo gratuite avec des données fictives, sans inscription.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroCahier />
        </div>
      </div>
    </section>
  )
}
