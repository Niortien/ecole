import type { Meta } from '@/types/domain'
import { attendre } from '@/services/mock-db/store'

/**
 * Enveloppe commune des réponses : `{ data, meta }`. Tous les hooks lisent ce format, qu'il vienne de la base de
 * démonstration (aujourd'hui) ou d'un vrai backend (demain) : seul le contenu des fichiers `features/<x>/api` change.
 */
export interface ApiResponse<T> {
  data: T
  meta: Partial<Meta>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function reponse<T>(data: T, meta: Partial<Meta> = {}, latence = 90): Promise<ApiResponse<T>> {
  await attendre(latence)
  return { data, meta }
}

export async function paginer<T>(liste: T[], page = 1, limit = 20): Promise<ApiResponse<T[]>> {
  const total = liste.length
  const debut = (page - 1) * limit
  return reponse(liste.slice(debut, debut + limit), {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  })
}

export function interdit(message = "Vous n'avez pas accès à cette information."): never {
  throw new ApiError(message, 403)
}

export function introuvable(message = 'Introuvable.'): never {
  throw new ApiError(message, 404)
}

/** Message affichable pour n'importe quelle erreur (jamais une trace technique). */
export function messageErreur(erreur: unknown): string {
  if (erreur instanceof ApiError) return erreur.message
  return 'Une erreur est survenue. Réessayez dans un instant.'
}
