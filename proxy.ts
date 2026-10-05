import { NextResponse, type NextRequest } from 'next/server'
import { ACCUEIL_PAR_DEFAUT, COOKIE_ROLE, estRouteApplication, peutAcceder } from '@/lib/roles'
import type { Role } from '@/types/domain'

const ROLES: Role[] = ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR', 'ECONOME', 'PARENT']

/**
 * Protection des routes de l'application : sans session de démo on retourne à la connexion, avec un rôle qui n'a pas
 * accès à la page on retourne à l'accueil. (Une vraie authentification, avec jeton vérifié côté serveur, remplacera
 * ce cookie quand un backend sera branché.)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!estRouteApplication(pathname)) return NextResponse.next()

  const valeur = request.cookies.get(COOKIE_ROLE)?.value as Role | undefined
  const role = valeur && ROLES.includes(valeur) ? valeur : null

  if (!role) return NextResponse.redirect(new URL('/connexion', request.url))
  if (!peutAcceder(role, pathname)) return NextResponse.redirect(new URL(ACCUEIL_PAR_DEFAUT, request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/accueil/:path*', '/eleves/:path*', '/classes/:path*', '/notes/:path*', '/bulletins/:path*', '/presences/:path*', '/discipline/:path*', '/emplois-du-temps/:path*', '/scolarite/:path*', '/cantine/:path*', '/parametres/:path*'],
}
