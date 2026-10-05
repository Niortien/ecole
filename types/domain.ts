/**
 * Types du domaine scolaire ivoirien. Fichier autonome (aucun import) : utilisé par la logique pure (lib/domain)
 * et par l'interface. Les identifiants d'élève sont des matricules (chaîne), partout.
 */

// ─── Structure de l'école ────────────────────────────────────────────────────

export type Cycle = 'PRIMAIRE' | 'COLLEGE' | 'LYCEE'

export type NiveauCode =
  | 'CP1' | 'CP2' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6E' | '5E' | '4E' | '3E'
  | '2NDE' | '1ERE' | 'TLE'

export type Trimestre = 1 | 2 | 3

export type Role = 'DIRECTION' | 'ENSEIGNANT' | 'EDUCATEUR' | 'ECONOME' | 'PARENT'

export type Sexe = 'F' | 'M'

export interface Classe {
  id: string
  niveau: NiveauCode
  /** Libellé affiché : « CM2 A », « 3e B », « Tle D 1 ». */
  libelle: string
  /** Série pour le lycée (A, C, D). */
  serie?: 'A' | 'C' | 'D'
  effectifMax: number
  /** Enseignant principal (maître de classe au primaire, professeur principal au secondaire). */
  principalId: string
  salle: string
}

export interface Eleve {
  matricule: string
  nom: string
  prenoms: string
  sexe: Sexe
  /** AAAA-MM-JJ */
  naissance: string
  classeId: string
  parentIds: string[]
  /** Redoublements déjà effectués au primaire (règle de passage obligatoire). */
  redoublements: number
  /** Élève affecté par l'État (public) ou non : utile pour le secondaire. */
  affecte: boolean
}

export interface Utilisateur {
  id: string
  nom: string
  prenoms: string
  role: Role
  email: string
  telephone: string
  /** Matricules des enfants (parent uniquement). */
  enfants?: string[]
}

export interface Matiere {
  id: string
  libelle: string
  cycles: Cycle[]
}

/** Matière enseignée dans une classe : coefficient, enseignant. */
export interface MatiereClasse {
  classeId: string
  matiereId: string
  coefficient: number
  enseignantId: string
}

// ─── Notes ───────────────────────────────────────────────────────────────────

/** AJ = absence justifiée (exclue du calcul), ANJ = absence non justifiée (compte zéro). */
export type NoteValeur =
  | { type: 'NOTE'; valeur: number }
  | { type: 'AJ' }
  | { type: 'ANJ' }

export type TypeEvaluation = 'INTERRO' | 'DEVOIR' | 'COMPOSITION'

export interface Note {
  id: string
  matricule: string
  classeId: string
  matiereId: string
  trimestre: Trimestre
  type: TypeEvaluation
  valeur: NoteValeur
  /** AAAA-MM-JJ */
  date: string
  /** Publiée aux parents seulement après validation de l'enseignant. */
  publiee: boolean
}

/** Colonne d'évaluation ajoutée par un enseignant (avant que des notes y soient saisies). */
export interface EvaluationAjoutee {
  classeId: string
  matiereId: string
  trimestre: Trimestre
  index: number
  type: TypeEvaluation
}

export type Mention = 'FELICITATIONS' | 'ENCOURAGEMENTS' | 'TABLEAU_HONNEUR' | 'AUCUNE' | 'AVERTISSEMENT_TRAVAIL'

export type DecisionPassage = 'ADMIS' | 'REDOUBLE' | 'PASSAGE_OBLIGE'

// ─── Vie scolaire ────────────────────────────────────────────────────────────

export type StatutPresence = 'PRESENT' | 'ABSENT' | 'RETARD' | 'ABSENT_JUSTIFIE'
export type DemiJournee = 'MATIN' | 'SOIR'

export interface Presence {
  /** AAAA-MM-JJ */
  date: string
  demiJournee: DemiJournee
  matricule: string
  statut: StatutPresence
  /** Minutes de retard, si RETARD. */
  retardMinutes?: number
}

export type TypeSanction = 'AVERTISSEMENT' | 'BLAME' | 'RETENUE' | 'EXCLUSION_TEMPORAIRE' | 'EXCLUSION_DEFINITIVE'
export type StatutSanction = 'BROUILLON' | 'VALIDEE' | 'PARENT_INFORME'

export interface Sanction {
  id: string
  matricule: string
  type: TypeSanction
  motif: string
  date: string
  statut: StatutSanction
  auteurId: string
  /** Jours d'exclusion (exclusion temporaire). */
  joursExclusion?: number
}

// ─── Emploi du temps ─────────────────────────────────────────────────────────

/** 1 = lundi … 6 = samedi */
export type JourSemaine = 1 | 2 | 3 | 4 | 5 | 6

export interface Creneau {
  id: string
  classeId: string
  jour: JourSemaine
  /** HH:MM */
  debut: string
  fin: string
  matiereId: string
  enseignantId: string
  salle: string
}

// ─── Scolarité et cantine ────────────────────────────────────────────────────

export type ModePaiement = 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY'
export type ObjetPaiement = 'INSCRIPTION' | 'TRANCHE_1' | 'TRANCHE_2' | 'TRANCHE_3' | 'CANTINE' | 'APE'

export interface Frais {
  niveau: NiveauCode
  inscription: number
  /** Montant de chaque tranche de scolarité (3 tranches). */
  tranche: number
  ape: number
}

export interface Paiement {
  id: string
  matricule: string
  montant: number
  mode: ModePaiement
  objet: ObjetPaiement
  date: string
  recu: string
}

export interface MenuJour {
  /** AAAA-MM-JJ */
  date: string
  plat: string
  accompagnement: string
  dessert?: string
}

export interface AbonnementCantine {
  matricule: string
  /** Jours de repas (1 = lundi … 5 = vendredi). */
  jours: JourSemaine[]
  allergies: string[]
  /** Mois payé jusqu'à (AAAA-MM). */
  payeJusqua: string
}

export interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}
