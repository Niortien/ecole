import { Reveal } from '@/components/motion/reveal'
import { IllustrationBulletin, IllustrationPaiement, IllustrationReseau } from './illustrations'

const POINTS = [
  {
    illustration: IllustrationReseau,
    titre: 'Ça marche quand le réseau lâche',
    texte:
      'L’appel et la saisie de notes s’enregistrent sur le téléphone, puis partent tout seuls dès que la connexion revient. Plus de feuilles perdues, plus d’attente.',
  },
  {
    illustration: IllustrationBulletin,
    titre: 'Le bulletin part sur WhatsApp',
    texte:
      'Un bulletin A4 propre, prêt à imprimer ou à envoyer au parent en un geste. Le reçu et la relance aussi, avec un message poli déjà rédigé.',
  },
  {
    illustration: IllustrationPaiement,
    titre: 'Wave, Orange Money, MTN, espèces',
    texte:
      'Chaque paiement est imputé à la bonne ligne (inscription, tranche, APE), le solde se met à jour et le reçu est numéroté.',
  },
]

export function Quotidien() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 data-reveal className="max-w-2xl text-4xl leading-tight font-bold sm:text-5xl">
            Pensé pour la vraie vie d’une école d’Abidjan.
          </h2>
        </Reveal>
        <Reveal as="ul" stagger={0.1} className="mt-12 grid gap-6 md:grid-cols-3">
          {POINTS.map(({ illustration: Illustration, titre, texte }) => (
            <li key={titre} data-reveal className="flex flex-col rounded-[1.25rem] border border-trait bg-surface p-6">
              <div className="rounded-2xl bg-papier-2 p-4">
                <Illustration className="mx-auto h-36 w-full max-w-[16rem]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{titre}</h3>
              <p className="mt-2 text-encre-doux">{texte}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
