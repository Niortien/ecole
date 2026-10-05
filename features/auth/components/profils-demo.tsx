'use client'

import { useRouter } from 'next/navigation'
import { IconArrowRight } from '@tabler/icons-react'
import { ICONES_ROLE } from '@/components/app/icones'
import { useSession } from '@/hooks/use-session'
import { ACCUEIL_PAR_DEFAUT, ROLE_LABEL } from '@/lib/roles'
import { etat } from '@/services/mock-db/store'
import type { Role } from '@/types/domain'

const RESUME: Record<Role, string> = {
  DIRECTION: 'Appels non faits, impayés en retard, sanctions à valider, bulletins à finaliser.',
  ENSEIGNANT: 'Mes classes, saisie des notes en grille, appel du jour, notes à valider.',
  EDUCATEUR: 'Présences et retards du jour, sanctions à déclarer, élèves absents depuis plusieurs jours.',
  ECONOME: 'Encaissements, soldes par élève, impayés, reçus et relances.',
  PARENT: 'Notes validées, bulletins, solde à payer, menu de la cantine pour mes deux enfants.',
}

const CLES: Record<Role, 'direction' | 'enseignant' | 'educateur' | 'econome' | 'parent'> = {
  DIRECTION: 'direction',
  ENSEIGNANT: 'enseignant',
  EDUCATEUR: 'educateur',
  ECONOME: 'econome',
  PARENT: 'parent',
}

const ORDRE: Role[] = ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR', 'ECONOME', 'PARENT']

export function ProfilsDemo() {
  const router = useRouter()
  const { ouvrir } = useSession()
  const base = etat()

  function choisir(role: Role) {
    const id = base.comptesDemo[CLES[role]]
    const user = base.utilisateurs.find((u) => u.id === id)
    if (!user) return
    const civilite = user.role === 'DIRECTION' || user.role === 'ECONOME' ? 'Mme' : 'M.'
    ouvrir({ userId: user.id, role, nom: `${civilite} ${user.nom}` })
    router.push(ACCUEIL_PAR_DEFAUT)
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {ORDRE.map((role) => {
        const Icone = ICONES_ROLE[role]
        const user = base.utilisateurs.find((u) => u.id === base.comptesDemo[CLES[role]])
        return (
          <li key={role} className={role === 'PARENT' ? 'sm:col-span-2' : undefined}>
            <button
              type="button"
              onClick={() => choisir(role)}
              className="group flex min-h-24 w-full cursor-pointer items-start gap-4 rounded-[1.25rem] border border-trait bg-surface p-5 text-left transition-colors hover:border-ardoise"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ardoise-pale text-ardoise">
                <Icone size={24} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-xl font-semibold">{ROLE_LABEL[role]}</span>
                  {user && (
                    <span className="text-sm text-encre-doux">
                      {user.prenoms} {user.nom}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-encre-doux">{RESUME[role]}</span>
              </span>
              <IconArrowRight size={20} className="mt-1 shrink-0 text-encre-doux transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
