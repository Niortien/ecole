import type { Metadata } from 'next'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import { ButtonLink } from '@/components/common/button-link'
import { PageTitre } from '@/components/vitrine/page-titre'
import { Reveal } from '@/components/motion/reveal'
import { contactConfig } from '@/config/app.config'

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'Le tarif de Cartable dépend de la taille de l’école et des modules choisis. Demandez un devis : démonstration, devis, mise en route.',
  alternates: { canonical: '/tarifs' },
}

const ETAPES = [
  { titre: 'Vous essayez la démo', texte: 'Cinq profils, une école fictive, aucune inscription. Vous voyez si l’outil convient à votre équipe.' },
  { titre: 'Nous établissons un devis', texte: 'Le tarif dépend du nombre d’élèves et des modules dont vous avez besoin, en FCFA, sans surprise.' },
  { titre: 'Nous mettons l’école en route', texte: 'Import de vos élèves et classes, réglage des coefficients et des frais, prise en main avec la direction et les enseignants.' },
]

export default function TarifsPage() {
  const whatsapp = contactConfig.whatsapp.replace(/[^0-9]/g, '')

  return (
    <>
      <PageTitre
        titre="Un devis adapté à la taille de votre école."
        intro="Pas de grille toute faite : une école de 150 élèves et un complexe de 800 n’ont pas les mêmes besoins."
      />
      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <Reveal as="ol" stagger={0.1} className="grid gap-4 md:grid-cols-3">
          {ETAPES.map((etape, index) => (
            <li key={etape.titre} data-reveal className="rounded-[1.25rem] border border-trait bg-surface p-6 sm:p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ardoise font-display text-lg font-bold text-white">
                {index + 1}
              </span>
              <h2 className="mt-4 text-2xl font-semibold">{etape.titre}</h2>
              <p className="mt-2 text-encre-doux">{etape.texte}</p>
            </li>
          ))}
        </Reveal>

        <Reveal className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[1.25rem] border border-trait bg-papier-2 p-6 sm:flex-row sm:items-center sm:p-8">
          <p data-reveal className="max-w-md text-lg">
            Dites-nous combien d’élèves compte votre école, nous revenons vers vous avec un devis.
          </p>
          <div data-reveal className="flex flex-wrap gap-3">
            <ButtonLink href={`https://wa.me/${whatsapp}`} taille="lg">
              <IconBrandWhatsapp size={20} aria-hidden="true" />
              Demander un devis
            </ButtonLink>
            <ButtonLink href="/connexion" variante="secondaire" taille="lg">
              Essayer la démo
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  )
}
