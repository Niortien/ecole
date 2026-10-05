import type { Classe, ModePaiement, ObjetPaiement, Paiement } from '@/types/domain'
import type { SituationScolarite, StatutGlobal } from '@/lib/domain/scolarite'

export interface LigneScolariteEleve {
  matricule: string
  nom: string
  prenoms: string
  classe: Pick<Classe, 'id' | 'libelle'>
  statut: StatutGlobal
  total: number
  paye: number
  reste: number
  enRetard: number
}

export interface ResumeScolarite {
  attendu: number
  encaisse: number
  reste: number
  enRetard: number
  nbEnRetard: number
  encaisseJour: number
}

export interface FiltresScolarite {
  statut?: StatutGlobal
  classeId?: string
  recherche?: string
  page?: number
  limit?: number
}

export interface NouveauPaiement {
  matricule: string
  objet: Exclude<ObjetPaiement, 'CANTINE'>
  montant: number
  mode: ModePaiement
}

export interface ScolariteEnfant {
  matricule: string
  nom: string
  classe: string
  situation: SituationScolarite
  paiements: Paiement[]
}

export interface RecuDetail {
  paiement: Paiement
  eleve: { matricule: string; nom: string; prenoms: string; classe: string }
  /** Reste à payer sur l'ensemble de la scolarité après ce paiement. */
  resteApres: number
}
