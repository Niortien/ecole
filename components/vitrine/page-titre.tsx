import { Reveal } from '@/components/motion/reveal'

interface PageTitreProps {
  titre: string
  intro?: string
}

/** En-tête des pages internes de la vitrine. */
export function PageTitre({ titre, intro }: PageTitreProps) {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 pt-14 pb-12 sm:px-8 sm:pt-20">
      <Reveal>
        <h1 data-reveal className="max-w-3xl text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.04] font-bold">
          {titre}
        </h1>
        {intro && (
          <p data-reveal className="mt-5 max-w-xl text-lg text-encre-doux">
            {intro}
          </p>
        )}
      </Reveal>
    </header>
  )
}
