import type { Frais, ModePaiement, ObjetPaiement, Paiement } from '../../types/domain'

export const MODE_PAIEMENT_LABEL: Record<ModePaiement, string> = {
  ESPECES: 'Espèces',
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  MTN_MONEY: 'MTN Money',
}

export const OBJET_LABEL: Record<ObjetPaiement, string> = {
  INSCRIPTION: 'Inscription',
  TRANCHE_1: '1re tranche',
  TRANCHE_2: '2e tranche',
  TRANCHE_3: '3e tranche',
  CANTINE: 'Cantine',
  APE: 'APE',
}

/** Échéances par défaut d'une année « AAAA-AAAA » (modifiables dans les paramètres). */
export function echeances(anneeScolaire: string): Record<Exclude<ObjetPaiement, 'CANTINE'>, string> {
  const [debut, fin] = anneeScolaire.split('-')
  return {
    INSCRIPTION: `${debut}-09-15`,
    APE: `${debut}-09-30`,
    TRANCHE_1: `${debut}-10-15`,
    TRANCHE_2: `${fin}-01-20`,
    TRANCHE_3: `${fin}-04-15`,
  }
}

export type StatutLigne = 'PAYE' | 'PARTIEL' | 'A_VENIR' | 'EN_RETARD'

export interface LigneScolarite {
  objet: Exclude<ObjetPaiement, 'CANTINE'>
  du: number
  paye: number
  reste: number
  echeance: string
  statut: StatutLigne
}

export type StatutGlobal = 'SOLDE' | 'A_JOUR' | 'EN_RETARD'

export interface SituationScolarite {
  lignes: LigneScolarite[]
  total: number
  paye: number
  reste: number
  /** Montant déjà exigible à la date donnée et non payé. */
  enRetard: number
  statut: StatutGlobal
  prochaineEcheance: { objet: LigneScolarite['objet']; echeance: string; reste: number } | null
}

/**
 * Situation de scolarité d'un élève à une date donnée. Chaque paiement est imputé à son objet ; le surplus d'un objet
 * n'efface pas une autre ligne (pas d'imputation magique, le reçu dit ce qui est payé).
 */
export function situationScolarite(
  frais: Frais,
  paiements: Pick<Paiement, 'objet' | 'montant'>[],
  anneeScolaire: string,
  aujourdhui: string,
): SituationScolarite {
  const dates = echeances(anneeScolaire)
  const dus: Record<LigneScolarite['objet'], number> = {
    INSCRIPTION: frais.inscription,
    APE: frais.ape,
    TRANCHE_1: frais.tranche,
    TRANCHE_2: frais.tranche,
    TRANCHE_3: frais.tranche,
  }

  const lignes: LigneScolarite[] = (Object.keys(dus) as LigneScolarite['objet'][]).map((objet) => {
    const paye = paiements.filter((p) => p.objet === objet).reduce((total, p) => total + p.montant, 0)
    const du = dus[objet]
    const reste = Math.max(0, du - paye)
    const echeance = dates[objet]
    let statut: StatutLigne
    if (reste === 0) statut = 'PAYE'
    else if (aujourdhui > echeance) statut = 'EN_RETARD'
    else statut = paye > 0 ? 'PARTIEL' : 'A_VENIR'
    return { objet, du, paye, reste, echeance, statut }
  })

  const total = lignes.reduce((t, l) => t + l.du, 0)
  const paye = lignes.reduce((t, l) => t + Math.min(l.paye, l.du), 0)
  const reste = total - paye
  const enRetard = lignes.filter((l) => l.statut === 'EN_RETARD').reduce((t, l) => t + l.reste, 0)
  const aVenir = lignes
    .filter((l) => l.reste > 0 && l.statut !== 'EN_RETARD')
    .sort((a, b) => a.echeance.localeCompare(b.echeance))[0]

  return {
    lignes,
    total,
    paye,
    reste,
    enRetard,
    statut: reste === 0 ? 'SOLDE' : enRetard > 0 ? 'EN_RETARD' : 'A_JOUR',
    prochaineEcheance: aVenir ? { objet: aVenir.objet, echeance: aVenir.echeance, reste: aVenir.reste } : null,
  }
}

/** Numéro de reçu : R-2026-000123. */
export function numeroRecu(annee: number, sequence: number): string {
  return `R-${annee}-${String(sequence).padStart(6, '0')}`
}

/** Message de relance prêt à envoyer (WhatsApp ou SMS), poli et précis. */
export function messageRelance(params: {
  parent: string
  eleve: string
  enRetard: number
  prochaineEcheance?: string
  ecole: string
}): string {
  const montant = new Intl.NumberFormat('fr-FR').format(params.enRetard)
  return (
    `Bonjour ${params.parent}, l'école ${params.ecole} vous informe qu'un montant de ${montant} FCFA ` +
    `reste à régler pour la scolarité de ${params.eleve}. Vous pouvez payer par Wave, Orange Money, MTN Money ` +
    `ou à l'économat. Merci de votre confiance.`
  )
}
