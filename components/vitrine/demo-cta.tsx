import { IconArrowRight } from '@tabler/icons-react'
import { ButtonLink } from '@/components/common/button-link'
import { Reveal } from '@/components/motion/reveal'

export function DemoCta() {
  return (
    <section className="px-5 pb-20 sm:px-8 sm:pb-28">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ardoise p-8 text-white sm:p-14">
        <h2 data-reveal className="max-w-xl text-4xl leading-tight font-bold sm:text-5xl">
          Essayez avec les cinq profils.
        </h2>
        <p data-reveal className="mt-4 max-w-xl text-lg text-white/85">
          La démo contient une école fictive de Cocody : élèves, notes, paiements, sanctions, emplois du temps et
          cantine. Changez de profil en un clic et modifiez ce que vous voulez.
        </p>
        <div data-reveal className="mt-8">
          <ButtonLink href="/connexion" variante="crayon" taille="lg">
            Ouvrir la démo
            <IconArrowRight size={20} aria-hidden="true" />
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  )
}
