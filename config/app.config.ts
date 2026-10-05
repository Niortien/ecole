import type { ToasterProps } from 'react-hot-toast'

// ─── App ──────────────────────────────────────────────────────────────────────

export const appConfig = {
  /** Nom provisoire du logiciel — point d'édition unique. */
  name: 'Cartable',
  tagline: 'La gestion de votre école, claire comme une page de cahier.',
  description:
    'Cartable : logiciel de gestion scolaire pour écoles primaires, collèges et lycées de Côte d’Ivoire. Élèves, notes, bulletins, présences, sanctions, emplois du temps, scolarité et cantine.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://cartable.vercel.app',
} as const

/** Établissement de démonstration (les données de l'application sont fictives). */
export const ecoleDemo = {
  nom: 'Complexe scolaire Les Cocotiers',
  quartier: 'Cocody',
  ville: 'Abidjan',
  anneeScolaire: '2025-2026',
} as const

// ─── Contact de l'éditeur (à renseigner) ─────────────────────────────────────

export const contactConfig = {
  adresse: 'Cocody, Abidjan',
  telephone: '+225 00 00 00 00 00',
  whatsapp: '+225 00 00 00 00 00',
  email: 'contact@cartable.ci',
} as const

// ─── Toast (react-hot-toast) ──────────────────────────────────────────────────

export const toastConfig: ToasterProps = {
  position: 'top-center',
  toastOptions: {
    duration: 3500,
    style: { borderRadius: '12px', fontSize: '14px' },
    success: { duration: 2500 },
    error: { duration: 5000 },
  },
}

// ─── TanStack Query ───────────────────────────────────────────────────────────

export const queryConfig = {
  staleTime: 30 * 1000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const

// ─── API ──────────────────────────────────────────────────────────────────────
/**
 * Tant que `NEXT_PUBLIC_API_URL` est vide, l'application utilise la base de démonstration locale
 * (services/mock-db). Renseigner l'URL d'un vrai backend bascule la couche API (voir lib/api.ts).
 */
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  timeout: 10_000,
} as const
