import type {
  AbonnementCantine,
  Classe,
  Eleve,
  Paiement,
  Sanction,
  Utilisateur,
} from '@/types/domain'
import type { Bulletin } from '@/services/mock-db/selecteurs'
import type { SituationScolarite } from '@/lib/domain/scolarite'

export type StatutFinancier = 'SOLDE' | 'A_JOUR' | 'EN_RETARD'

/** Ligne de la liste des élèves. */
export interface EleveResume {
  eleve: Eleve
  classe: Pick<Classe, 'id' | 'libelle' | 'niveau'>
  /** Absences non justifiées d'affilée (alerte à partir de 3). Absent pour les rôles sans accès à la vie scolaire. */
  absencesConsecutives?: number
  /** Statut de scolarité, visible seulement de la direction et de l'économe. */
  statutFinancier?: StatutFinancier
}

export interface FiltresEleves {
  recherche?: string
  classeId?: string
  cycle?: 'PRIMAIRE' | 'COLLEGE' | 'LYCEE'
  page?: number
  limit?: number
}

/** Fiche complète d'un élève (un seul identifiant, le matricule, relie tous les modules). */
export interface FicheEleve {
  eleve: Eleve
  classe: Classe
  parents: Pick<Utilisateur, 'id' | 'nom' | 'prenoms' | 'telephone'>[]
  bulletin: Bulletin | null
  vieScolaire: { taux: number | null; absencesConsecutives: number; retards: number }
  sanctions: Sanction[]
  /** Absent pour les rôles sans accès à la scolarité. */
  scolarite?: { situation: SituationScolarite; paiements: Paiement[] }
  cantine: AbonnementCantine | null
}
