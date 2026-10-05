import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import { Logo } from '@/components/common/logo'
import { ProfilsDemo } from '@/features/auth/components/profils-demo'
import { ecoleDemo } from '@/config/app.config'

export const metadata: Metadata = {
  title: 'Démo',
  description: 'Essayez Cartable avec une école fictive : choisissez un profil.',
  robots: { index: false, follow: false },
}

export default function ConnexionPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10 sm:py-16">
      <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-encre-doux hover:text-encre">
        <IconArrowLeft size={18} aria-hidden="true" />
        Retour au site
      </Link>
      <Logo className="mt-6" />
      <h1 className="mt-8 text-4xl leading-tight font-bold sm:text-5xl">Choisissez un profil.</h1>
      <p className="mt-3 max-w-xl text-lg text-encre-doux">
        Vous entrez dans {ecoleDemo.nom}, une école fictive de {ecoleDemo.quartier}. Les données sont inventées, vous
        pouvez tout modifier : un bouton remet la démo à zéro.
      </p>
      <div className="mt-8">
        <ProfilsDemo />
      </div>
    </main>
  )
}
