/** Montant en FCFA : « 27 000 FCFA ». */
export function fcfa(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(montant)} FCFA`
}

/** Âge en années à une date donnée (jour local). */
export function age(naissance: string, aujourdhui: string): number {
  const [ny, nm, nd] = naissance.split('-').map(Number)
  const [ay, am, ad] = aujourdhui.split('-').map(Number)
  return ay - ny - (am < nm || (am === nm && ad < nd) ? 1 : 0)
}

/** « 14,5 » : une moyenne ou une note avec la virgule française, sans zéro inutile (max. 2 décimales). */
export function decimal(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined) return '—'
  return String(Math.round((valeur + Number.EPSILON) * 100) / 100).replace('.', ',')
}

/** « 1er », « 2e » pour un rang. */
export function ordinal(rang: number): string {
  return rang === 1 ? '1er' : `${rang}e`
}

/** Numéro de téléphone nettoyé pour un lien WhatsApp. */
export function lienWhatsapp(telephone: string, message?: string): string {
  const numero = telephone.replace(/[^0-9]/g, '')
  return `https://wa.me/${numero}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

/** Lien de partage WhatsApp sans destinataire : l'utilisateur choisit le contact dans WhatsApp. */
export function lienPartageWhatsapp(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
