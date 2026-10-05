/** Générateur pseudo-aléatoire déterministe (mulberry32) : la démo est identique à chaque chargement, côté serveur comme côté client. */
export function creerAlea(graine: number) {
  let etat = graine >>> 0
  const suivant = () => {
    etat = (etat + 0x6d2b79f5) >>> 0
    let t = etat
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    /** Nombre dans [0, 1). */
    suivant,
    /** Entier dans [min, max]. */
    entier: (min: number, max: number) => Math.floor(suivant() * (max - min + 1)) + min,
    /** Élément au hasard. */
    choisir: <T,>(liste: readonly T[]): T => liste[Math.floor(suivant() * liste.length)],
    /** Vrai avec la probabilité donnée. */
    chance: (p: number) => suivant() < p,
    /** Approximation d'une loi normale (somme de 3 uniformes). */
    normale: (moyenne: number, ecart: number) => moyenne + ((suivant() + suivant() + suivant()) / 3 - 0.5) * 2 * ecart * 1.7,
  }
}

export type Alea = ReturnType<typeof creerAlea>
