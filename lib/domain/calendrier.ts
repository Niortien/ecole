import type { JourSemaine, Trimestre } from '../../types/domain'

const pad = (n: number): string => String(n).padStart(2, '0')

/** Date AAAA-MM-JJ du **jour local** (jamais `toISOString()`, qui donne le jour UTC et décale selon l'heure). */
export function dateLocaleISO(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function aujourdhui(): string {
  return dateLocaleISO(new Date())
}

/** L'année scolaire commence en septembre : « 2025-2026 ». */
export function anneeScolaireActive(jour: string = aujourdhui()): string {
  const [annee, mois] = jour.split('-').map(Number)
  return mois >= 9 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`
}

export interface FenetreTrimestre {
  trimestre: Trimestre
  debut: string
  fin: string
  label: string
}

/** Fenêtres par défaut : T1 sept.–déc., T2 janv.–mars, T3 avril–juin. Modifiables dans les paramètres de l'école. */
export function fenetresTrimestres(anneeScolaire: string): FenetreTrimestre[] {
  const match = /^(\d{4})-(\d{4})$/.exec(anneeScolaire)
  if (!match) throw new Error(`Année scolaire invalide : « ${anneeScolaire} » (attendu AAAA-AAAA)`)
  const [, debut, fin] = match
  return [
    { trimestre: 1, debut: `${debut}-09-01`, fin: `${debut}-12-20`, label: '1er trimestre' },
    { trimestre: 2, debut: `${fin}-01-05`, fin: `${fin}-03-31`, label: '2e trimestre' },
    { trimestre: 3, debut: `${fin}-04-01`, fin: `${fin}-06-30`, label: '3e trimestre' },
  ]
}

/** Trimestre en cours, ou null pendant les vacances. Comparaison de chaînes ISO : pas de décalage de fuseau. */
export function trimestreActif(anneeScolaire: string, jour: string = aujourdhui()): Trimestre | null {
  const fenetre = fenetresTrimestres(anneeScolaire).find((f) => jour >= f.debut && jour <= f.fin)
  return fenetre ? fenetre.trimestre : null
}

/** Jour de la semaine d'une date ISO : 1 = lundi … 7 = dimanche. */
export function jourSemaine(dateISO: string): number {
  const [annee, mois, jour] = dateISO.split('-').map(Number)
  const jsJour = new Date(Date.UTC(annee, mois - 1, jour)).getUTCDay()
  return jsJour === 0 ? 7 : jsJour
}

export function estJourDeClasse(dateISO: string): boolean {
  return jourSemaine(dateISO) <= 6
}

export const JOUR_LABEL: Record<JourSemaine, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
}

export function formaterDate(dateISO: string, format: 'court' | 'long' = 'long'): string {
  const [annee, mois, jour] = dateISO.split('-').map(Number)
  const date = new Date(annee, mois - 1, jour)
  return format === 'court'
    ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Ajoute des jours à une date ISO (calcul en UTC, sans décalage d'heure d'été). */
export function ajouterJours(dateISO: string, jours: number): string {
  const [annee, mois, jour] = dateISO.split('-').map(Number)
  const d = new Date(Date.UTC(annee, mois - 1, jour + jours))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
