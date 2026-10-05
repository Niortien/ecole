import type { Classe, Eleve, Mention, Note, Trimestre } from '@/types/domain'
import { bareme, cycleDe } from '@/lib/domain/niveaux'
import {
  appreciationSuggeree,
  classer,
  decisionPassage,
  mention,
  moyenneAnnuelle,
  moyenneGenerale,
  moyenneMatiere,
  type Passage,
} from '@/lib/domain/notes'
import type { ParamsCalcul } from '@/lib/domain/params'
import { absencesConsecutives, tauxPresence } from '@/lib/domain/vie-scolaire'
import type { Seed } from './seed'

/** Calculs dérivés de la base (bulletins, classements). Les index sont mémorisés tant que la base n'a pas changé. */

const cacheNotes = new WeakMap<Note[], Map<string, Note[]>>()

/** Notes de la base regroupées par matricule. */
export function notesParEleve(etat: Seed): Map<string, Note[]> {
  let index = cacheNotes.get(etat.notes)
  if (!index) {
    index = new Map()
    for (const n of etat.notes) {
      const liste = index.get(n.matricule)
      if (liste) liste.push(n)
      else index.set(n.matricule, [n])
    }
    cacheNotes.set(etat.notes, index)
  }
  return index
}

export interface LigneBulletin {
  matiereId: string
  libelle: string
  coefficient: number
  enseignant: string
  moyenne: number | null
  /** Notes détaillées du trimestre (pour l'affichage en grille). */
  notes: Note[]
}

export interface Bulletin {
  matricule: string
  eleve: Pick<Eleve, 'nom' | 'prenoms' | 'naissance' | 'sexe' | 'redoublements'>
  classe: Pick<Classe, 'id' | 'libelle' | 'niveau'> & { bareme: 10 | 20 }
  trimestre: Trimestre | 'ANNEE'
  lignes: LigneBulletin[]
  moyenne: number | null
  rang: number | null
  effectif: number
  mention: Mention
  appreciation: string
  /** Décision de passage, uniquement sur le bulletin annuel. */
  passage: Passage | null
  /** Moyennes des trois trimestres (bulletin annuel). */
  moyennesTrimestres: (number | null)[]
  absences: { total: number; justifiees: number }
}

export interface OptionsCalcul {
  /** Les parents ne voient que les notes validées par l'enseignant. */
  publieesSeulement?: boolean
  params?: ParamsCalcul
}

function nomEnseignant(etat: Seed, id: string): string {
  const u = etat.utilisateurs.find((x) => x.id === id)
  return u ? `${u.prenoms} ${u.nom}` : '—'
}

function lignesDuTrimestre(etat: Seed, matricule: string, classeId: string, trimestre: Trimestre, opts: OptionsCalcul): LigneBulletin[] {
  const params = opts.params ?? etat.params
  const notes = (notesParEleve(etat).get(matricule) ?? []).filter(
    (n) => n.trimestre === trimestre && (!opts.publieesSeulement || n.publiee)
  )
  return etat.matieresClasses
    .filter((mc) => mc.classeId === classeId)
    .map((mc) => {
      const duMatiere = notes.filter((n) => n.matiereId === mc.matiereId)
      return {
        matiereId: mc.matiereId,
        libelle: etat.matieres.find((m) => m.id === mc.matiereId)?.libelle ?? mc.matiereId,
        coefficient: mc.coefficient,
        enseignant: nomEnseignant(etat, mc.enseignantId),
        moyenne: moyenneMatiere(duMatiere, params),
        notes: duMatiere,
      }
    })
}

const cacheClassements = new WeakMap<Note[], Map<string, Map<string, { moyenne: number | null; rang: number | null }>>>()

/** Moyenne et rang de chaque élève d'une classe pour un trimestre. */
export function classementClasse(etat: Seed, classeId: string, trimestre: Trimestre, opts: OptionsCalcul = {}) {
  let parCle = cacheClassements.get(etat.notes)
  if (!parCle) {
    parCle = new Map()
    cacheClassements.set(etat.notes, parCle)
  }
  const cle = `${classeId}|${trimestre}|${opts.publieesSeulement ? 'p' : 't'}|${JSON.stringify(opts.params ?? etat.params)}`
  const memo = parCle.get(cle)
  if (memo) return memo

  const eleves = etat.eleves.filter((e) => e.classeId === classeId)
  const moyennes = eleves.map((e) => {
    const lignes = lignesDuTrimestre(etat, e.matricule, classeId, trimestre, opts)
    return { matricule: e.matricule, moyenne: moyenneGenerale(lignes.map((l) => ({ moyenne: l.moyenne, coefficient: l.coefficient }))) }
  })
  const rangs = classer(moyennes)
  const resultat = new Map(moyennes.map((m) => [m.matricule, { moyenne: m.moyenne, rang: rangs.get(m.matricule) ?? null }]))
  parCle.set(cle, resultat)
  return resultat
}

/** Bulletin d'un élève pour un trimestre ou pour l'année. */
export function calculerBulletin(etat: Seed, matricule: string, trimestre: Trimestre | 'ANNEE', opts: OptionsCalcul = {}): Bulletin | null {
  const eleve = etat.eleves.find((e) => e.matricule === matricule)
  const classe = eleve && etat.classes.find((c) => c.id === eleve.classeId)
  if (!eleve || !classe) return null
  const cycle = cycleDe(classe.niveau)
  const b = bareme(cycle)
  const params = opts.params ?? etat.params

  const moyennesTrimestres = ([1, 2, 3] as Trimestre[]).map(
    (t) => classementClasse(etat, classe.id, t, opts).get(matricule)?.moyenne ?? null
  )
  const effectif = etat.eleves.filter((e) => e.classeId === classe.id).length

  let lignes: LigneBulletin[]
  let moyenne: number | null
  let rang: number | null
  let passage: Passage | null = null

  if (trimestre === 'ANNEE') {
    // Moyenne annuelle par matière = moyenne des trimestres où la matière est notée
    const parTrimestre = ([1, 2, 3] as Trimestre[]).map((t) => lignesDuTrimestre(etat, matricule, classe.id, t, opts))
    lignes = parTrimestre[0].map((ligne, i) => ({
      ...ligne,
      moyenne: moyenneAnnuelle(parTrimestre.map((l) => l[i].moyenne)),
      notes: parTrimestre.flatMap((l) => l[i].notes),
    }))
    moyenne = moyenneAnnuelle(moyennesTrimestres)
    const annuelles = etat.eleves
      .filter((e) => e.classeId === classe.id)
      .map((e) => ({
        matricule: e.matricule,
        moyenne: moyenneAnnuelle(([1, 2, 3] as Trimestre[]).map((t) => classementClasse(etat, classe.id, t, opts).get(e.matricule)?.moyenne ?? null)),
      }))
    rang = classer(annuelles).get(matricule) ?? null
    passage = decisionPassage(moyenne, b, cycle, eleve.redoublements, params)
  } else {
    lignes = lignesDuTrimestre(etat, matricule, classe.id, trimestre, opts)
    const classement = classementClasse(etat, classe.id, trimestre, opts).get(matricule)
    moyenne = classement?.moyenne ?? null
    rang = classement?.rang ?? null
  }

  const presences = etat.presences.filter((p) => p.matricule === matricule)
  return {
    matricule,
    eleve: { nom: eleve.nom, prenoms: eleve.prenoms, naissance: eleve.naissance, sexe: eleve.sexe, redoublements: eleve.redoublements },
    classe: { id: classe.id, libelle: classe.libelle, niveau: classe.niveau, bareme: b },
    trimestre,
    lignes,
    moyenne,
    rang,
    effectif,
    mention: mention(moyenne, b, params),
    appreciation: appreciationSuggeree(moyenne, b),
    passage,
    moyennesTrimestres,
    absences: {
      total: presences.filter((p) => p.statut === 'ABSENT').length,
      justifiees: presences.filter((p) => p.statut === 'ABSENT_JUSTIFIE').length,
    },
  }
}

/** Taux de présence et série d'absences d'un élève. */
export function syntheseVieScolaire(etat: Seed, matricule: string) {
  const presences = etat.presences.filter((p) => p.matricule === matricule)
  return {
    taux: tauxPresence(presences),
    absencesConsecutives: absencesConsecutives(presences),
    retards: presences.filter((p) => p.statut === 'RETARD').length,
  }
}
