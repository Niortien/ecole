import type {
  AbonnementCantine,
  Creneau,
  Eleve,
  EvaluationAjoutee,
  Note,
  Paiement,
  Presence,
  Sanction,
} from '@/types/domain'
import type { ParamsCalcul } from '@/lib/domain/params'
import { genererSeed, type Seed } from './seed'

/**
 * Base de démonstration : le jeu de données est généré à l'identique à chaque chargement (graine fixe) ;
 * seules les **modifications** de l'utilisateur sont conservées dans le navigateur (localStorage).
 * « Réinitialiser la démo » efface ces modifications.
 */

const CLE = 'cartable-demo-v1'

interface Modifications {
  notes: Record<string, Note>
  notesSupprimees: string[]
  evaluations: EvaluationAjoutee[]
  presences: Record<string, Presence>
  sanctions: Record<string, Sanction>
  paiements: Paiement[]
  creneaux: Record<string, Creneau>
  creneauxSupprimes: string[]
  abonnements: Record<string, AbonnementCantine>
  eleves: Record<string, Eleve>
  params: ParamsCalcul | null
}

const vide = (): Modifications => ({
  notes: {},
  notesSupprimees: [],
  evaluations: [],
  presences: {},
  sanctions: {},
  paiements: [],
  creneaux: {},
  creneauxSupprimes: [],
  abonnements: {},
  eleves: {},
  params: null,
})

export const clePresence = (p: Pick<Presence, 'date' | 'demiJournee' | 'matricule'>) =>
  `${p.date}|${p.demiJournee}|${p.matricule}`

let base: Seed | null = null
let etatCourant: Seed | null = null

/** Le jeu de base est généré une seule fois ; seules les modifications sont réappliquées. */
const baseSeed = (): Seed => (base ??= genererSeed())
let modifications: Modifications = vide()

function lire(): Modifications {
  if (typeof window === 'undefined') return vide()
  try {
    const brut = window.localStorage.getItem(CLE)
    return brut ? { ...vide(), ...(JSON.parse(brut) as Partial<Modifications>) } : vide()
  } catch {
    return vide()
  }
}

function remplacerParId<T>(liste: T[], cle: (x: T) => string, remplacements: Record<string, T>): T[] {
  const restants = new Set(Object.keys(remplacements))
  const resultat = liste.map((x) => {
    const id = cle(x)
    if (restants.has(id)) {
      restants.delete(id)
      return remplacements[id]
    }
    return x
  })
  for (const id of restants) resultat.push(remplacements[id])
  return resultat
}

function appliquer(seed: Seed, m: Modifications): Seed {
  return {
    ...seed,
    notes: remplacerParId(seed.notes, (n) => n.id, m.notes).filter((n) => !m.notesSupprimees.includes(n.id)),
    evaluations: [...seed.evaluations, ...m.evaluations],
    presences: remplacerParId(seed.presences, clePresence, m.presences),
    sanctions: remplacerParId(seed.sanctions, (s) => s.id, m.sanctions),
    paiements: [...seed.paiements, ...m.paiements],
    creneaux: remplacerParId(seed.creneaux, (c) => c.id, m.creneaux).filter((c) => !m.creneauxSupprimes.includes(c.id)),
    abonnements: remplacerParId(seed.abonnements, (a) => a.matricule, m.abonnements),
    eleves: remplacerParId(seed.eleves, (e) => e.matricule, m.eleves),
    params: m.params ?? seed.params,
  }
}

/** État courant de la base de démonstration (créé à la première utilisation). */
export function etat(): Seed {
  if (!etatCourant) {
    modifications = lire()
    etatCourant = appliquer(baseSeed(), modifications)
  }
  return etatCourant
}

function enregistrer() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CLE, JSON.stringify(modifications))
  } catch {
    // Stockage plein ou interdit : la démo continue en mémoire.
  }
}

function recalculer() {
  etatCourant = appliquer(baseSeed(), modifications)
  enregistrer()
}

// ─── Mutations (chaque écriture est conservée dans le navigateur) ────────────────

export const ecrire = {
  note(note: Note) {
    modifications.notes[note.id] = note
    modifications.notesSupprimees = modifications.notesSupprimees.filter((id) => id !== note.id)
    recalculer()
  },
  supprimerNote(id: string) {
    delete modifications.notes[id]
    if (!modifications.notesSupprimees.includes(id)) modifications.notesSupprimees.push(id)
    recalculer()
  },
  evaluation(evaluation: EvaluationAjoutee) {
    modifications.evaluations.push(evaluation)
    recalculer()
  },
  notes(liste: Note[]) {
    for (const n of liste) modifications.notes[n.id] = n
    recalculer()
  },
  presences(liste: Presence[]) {
    for (const p of liste) modifications.presences[clePresence(p)] = p
    recalculer()
  },
  sanction(sanction: Sanction) {
    modifications.sanctions[sanction.id] = sanction
    recalculer()
  },
  paiement(paiement: Paiement) {
    modifications.paiements.push(paiement)
    recalculer()
  },
  creneau(creneau: Creneau) {
    modifications.creneaux[creneau.id] = creneau
    modifications.creneauxSupprimes = modifications.creneauxSupprimes.filter((id) => id !== creneau.id)
    recalculer()
  },
  supprimerCreneau(id: string) {
    delete modifications.creneaux[id]
    modifications.creneauxSupprimes.push(id)
    recalculer()
  },
  abonnement(abonnement: AbonnementCantine) {
    modifications.abonnements[abonnement.matricule] = abonnement
    recalculer()
  },
  params(params: ParamsCalcul) {
    modifications.params = params
    recalculer()
  },
  eleve(eleve: Eleve) {
    modifications.eleves[eleve.matricule] = eleve
    recalculer()
  },
}

export function reinitialiserDemo() {
  modifications = vide()
  if (typeof window !== 'undefined') window.localStorage.removeItem(CLE)
  etatCourant = appliquer(baseSeed(), modifications)
}

export function aDesModifications(): boolean {
  etat()
  return Object.values(modifications).some((v) => (v === null ? false : Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0))
}

/** Latence réseau simulée, pour que les états de chargement soient visibles et testables. */
export const attendre = (ms = 120) => new Promise<void>((resolve) => setTimeout(resolve, ms))
