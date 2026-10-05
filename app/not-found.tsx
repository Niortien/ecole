import { ButtonLink } from '@/components/common/button-link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-[clamp(5rem,20vw,10rem)] leading-none font-bold text-ardoise tabular-nums">404</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Cette page n’est pas dans le cahier.</h1>
      <p className="mt-4 max-w-sm text-encre-doux">Elle n’existe pas ou a changé d’adresse.</p>
      <ButtonLink href="/" taille="lg" className="mt-8">
        Retour à l’accueil
      </ButtonLink>
    </main>
  )
}
