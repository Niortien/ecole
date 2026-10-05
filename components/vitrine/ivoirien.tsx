import { IconCheck } from '@tabler/icons-react'
import { Reveal } from '@/components/motion/reveal'

const POINTS = [
  'Primaire (CP1 à CM2), collège (6e à 3e) et lycée (2nde, 1ère, Terminale)',
  'Notes sur 10 au primaire, sur 20 au collège et au lycée',
  'Trois trimestres, moyenne annuelle et décision de passage',
  'Préparation du CEPE, du BEPC et du BAC',
  'Mentions : tableau d’honneur, encouragements, félicitations',
  'Montants en FCFA, paiements Wave, Orange Money, MTN Money',
]

export function Ivoirien() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <h2 data-reveal className="text-4xl leading-tight font-bold sm:text-5xl">
            Les règles de l’école ivoirienne, déjà là.
          </h2>
          <p data-reveal className="mt-5 max-w-md text-lg text-encre-doux">
            Les calculs suivent l’usage courant. Chaque école peut les ajuster dans ses paramètres (poids de la
            composition, seuils de mention, traitement des absences), car les pratiques varient d’un établissement à
            l’autre.
          </p>
        </Reveal>
        <Reveal as="ul" stagger={0.07} className="divide-y divide-trait rounded-[1.25rem] border border-trait bg-surface">
          {POINTS.map((p) => (
            <li key={p} data-reveal className="flex items-start gap-3 p-4 sm:p-5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ardoise text-white">
                <IconCheck size={14} stroke={3} aria-hidden="true" />
              </span>
              {p}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
