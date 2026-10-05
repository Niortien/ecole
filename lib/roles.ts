import type { Role } from '../types/domain'

/**
 * UNE seule matrice des rôles : elle sert à la fois au menu, à la protection des routes (proxy.ts) et aux tests.
 * (L'un des projets existants avait deux matrices qui se contredisaient.)
 */
export interface EntreeNavigation {
  href: string
  label: string
  /** Clé d'icône, résolue dans components/app/icones.ts. */
  icone: string
  roles: Role[]
}

const TOUS: Role[] = ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR', 'ECONOME', 'PARENT']

export const NAVIGATION: EntreeNavigation[] = [
  { href: '/accueil', label: 'Accueil', icone: 'accueil', roles: TOUS },
  { href: '/eleves', label: 'Élèves', icone: 'eleves', roles: ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR', 'ECONOME'] },
  { href: '/classes', label: 'Classes', icone: 'classes', roles: ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR'] },
  { href: '/notes', label: 'Notes', icone: 'notes', roles: ['DIRECTION', 'ENSEIGNANT'] },
  { href: '/bulletins', label: 'Bulletins', icone: 'bulletins', roles: ['DIRECTION', 'ENSEIGNANT', 'PARENT'] },
  { href: '/presences', label: 'Présences', icone: 'presences', roles: ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR'] },
  { href: '/discipline', label: 'Discipline', icone: 'discipline', roles: ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR'] },
  { href: '/emplois-du-temps', label: 'Emplois du temps', icone: 'emploi', roles: TOUS },
  { href: '/scolarite', label: 'Scolarité', icone: 'scolarite', roles: ['DIRECTION', 'ECONOME', 'PARENT'] },
  { href: '/cantine', label: 'Cantine', icone: 'cantine', roles: ['DIRECTION', 'ECONOME', 'EDUCATEUR', 'PARENT'] },
  { href: '/parametres', label: 'Paramètres', icone: 'parametres', roles: ['DIRECTION'] },
]

export const ROLE_LABEL: Record<Role, string> = {
  DIRECTION: 'Direction',
  ENSEIGNANT: 'Enseignant',
  EDUCATEUR: 'Éducateur',
  ECONOME: 'Économe',
  PARENT: 'Parent',
}

/** Préfixes protégés : tout ce qui est dans le menu, plus la fiche d'un élève (`/eleves/[matricule]`). */
export const PREFIXES_APPLICATION = NAVIGATION.map((n) => n.href)

export function navigationDuRole(role: Role): EntreeNavigation[] {
  return NAVIGATION.filter((n) => n.roles.includes(role))
}

/** Le chemin appartient-il à l'application (donc nécessite une session) ? */
export function estRouteApplication(chemin: string): boolean {
  return PREFIXES_APPLICATION.some((p) => chemin === p || chemin.startsWith(`${p}/`))
}

/**
 * Un rôle peut-il ouvrir ce chemin ?
 * Exception : un parent n'ouvre que la fiche de SES enfants (`/eleves/[matricule]`), vérifiée côté page.
 */
export function peutAcceder(role: Role, chemin: string): boolean {
  if (role === 'PARENT' && /^\/eleves\/[^/]+$/.test(chemin)) return true
  const entree = NAVIGATION.filter((n) => chemin === n.href || chemin.startsWith(`${n.href}/`)).sort(
    (a, b) => b.href.length - a.href.length
  )[0]
  return entree ? entree.roles.includes(role) : false
}

/** Cookie de session de DÉMONSTRATION : non signé, il ne protège aucune vraie donnée. */
export const COOKIE_ROLE = 'cartable_role'

/** Page d'arrivée après la connexion. */
export const ACCUEIL_PAR_DEFAUT = '/accueil'
