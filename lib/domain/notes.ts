import type { Cycle, DecisionPassage, Mention, NoteValeur, TypeEvaluation } from '../../types/domain'
import { PARAMS_PAR_DEFAUT, type ParamsCalcul } from './params'

/** Arrondi à 2 décimales (évite 12.349999). */
export function arrondir2(valeur: number): number {
  return Math.round((valeur + Number.EPSILON) * 100) / 100
}

export type ResultatSaisie = { ok: true; valeur: NoteValeur } | { ok: false; erreur: string }

/**
 * Lit une saisie de note : « 14 », « 14,5 », « AJ », « ANJ ». L'erreur est toujours renvoyée avec un message
 * lisible : la saisie invalide ne doit jamais effacer la note en silence.
 */
export function parserSaisieNote(saisie: string, bareme: 10 | 20): ResultatSaisie {
  const texte = saisie.trim().toUpperCase()
  if (texte === 'AJ') return { ok: true, valeur: { type: 'AJ' } }
  if (texte === 'ANJ') return { ok: true, valeur: { type: 'ANJ' } }
  if (texte === '') return { ok: false, erreur: 'Saisissez une note, AJ ou ANJ.' }

  const nombre = Number(texte.replace(',', '.'))
  if (Number.isNaN(nombre)) return { ok: false, erreur: 'Note invalide : chiffres, AJ ou ANJ uniquement.' }
  if (nombre < 0) return { ok: false, erreur: 'Une note ne peut pas être négative.' }
  if (nombre > bareme) return { ok: false, erreur: `Maximum ${bareme} pour cette classe.` }
  return { ok: true, valeur: { type: 'NOTE', valeur: arrondir2(nombre) } }
}

export function afficherNote(valeur: NoteValeur | null | undefined): string {
  if (!valeur) return '—'
  if (valeur.type !== 'NOTE') return valeur.type
  return String(arrondir2(valeur.valeur)).replace('.', ',')
}

/** Valeur numérique d'une note pour le calcul, ou null si elle est exclue (AJ, ou ANJ si le réglage l'ignore). */
export function valeurPourCalcul(valeur: NoteValeur, params: ParamsCalcul = PARAMS_PAR_DEFAUT): number | null {
  if (valeur.type === 'NOTE') return valeur.valeur
  if (valeur.type === 'ANJ' && params.anjCompteZero) return 0
  return null
}

export interface EvaluationLigne {
  type: TypeEvaluation
  valeur: NoteValeur
}

function moyenne(valeurs: number[]): number | null {
  if (valeurs.length === 0) return null
  return valeurs.reduce((total, v) => total + v, 0) / valeurs.length
}

/**
 * Moyenne d'une matière sur un trimestre : (moyenne des interros et devoirs) et composition, selon le poids réglé.
 * Une seule des deux composantes disponible → on la prend seule. Aucune → null (matière non notée).
 */
export function moyenneMatiere(
  evaluations: EvaluationLigne[],
  params: ParamsCalcul = PARAMS_PAR_DEFAUT,
): number | null {
  const suivi: number[] = []
  const compositions: number[] = []
  for (const ev of evaluations) {
    const v = valeurPourCalcul(ev.valeur, params)
    if (v === null) continue
    if (ev.type === 'COMPOSITION') compositions.push(v)
    else suivi.push(v)
  }
  const mSuivi = moyenne(suivi)
  const mCompo = moyenne(compositions)
  if (mSuivi === null && mCompo === null) return null
  if (mSuivi === null) return arrondir2(mCompo as number)
  if (mCompo === null) return arrondir2(mSuivi)
  return arrondir2(mSuivi * (1 - params.poidsComposition) + mCompo * params.poidsComposition)
}

export interface LigneMoyenne {
  moyenne: number | null
  coefficient: number
}

/** Moyenne générale pondérée par les coefficients ; les matières non notées sont ignorées. */
export function moyenneGenerale(lignes: LigneMoyenne[]): number | null {
  let points = 0
  let coefficients = 0
  for (const { moyenne: m, coefficient } of lignes) {
    if (m === null || coefficient <= 0) continue
    points += m * coefficient
    coefficients += coefficient
  }
  return coefficients === 0 ? null : arrondir2(points / coefficients)
}

/** Moyenne annuelle = moyenne des trimestres disponibles. */
export function moyenneAnnuelle(trimestres: (number | null)[]): number | null {
  const m = moyenne(trimestres.filter((t): t is number => t !== null))
  return m === null ? null : arrondir2(m)
}

export interface Classable {
  matricule: string
  moyenne: number | null
}

/**
 * Classement avec ex æquo : 1, 1, 3. Les élèves sans moyenne ne sont pas classés (rang null).
 */
export function classer(eleves: Classable[]): Map<string, number | null> {
  const rangs = new Map<string, number | null>()
  const classes = eleves
    .filter((e): e is { matricule: string; moyenne: number } => e.moyenne !== null)
    .sort((a, b) => b.moyenne - a.moyenne)
  classes.forEach((eleve, index) => {
    const precedent = classes[index - 1]
    const rang =
      precedent && precedent.moyenne === eleve.moyenne ? (rangs.get(precedent.matricule) as number) : index + 1
    rangs.set(eleve.matricule, rang)
  })
  for (const e of eleves) if (e.moyenne === null) rangs.set(e.matricule, null)
  return rangs
}

/** Mention du trimestre, en proportion du barème (12/20 ou 6/10 pour le tableau d'honneur par défaut). */
export function mention(moyenneEleve: number | null, bareme: 10 | 20, params: ParamsCalcul = PARAMS_PAR_DEFAUT): Mention {
  if (moyenneEleve === null) return 'AUCUNE'
  const ratio = moyenneEleve / bareme
  if (ratio >= params.seuils.felicitations) return 'FELICITATIONS'
  if (ratio >= params.seuils.encouragements) return 'ENCOURAGEMENTS'
  if (ratio >= params.seuils.tableauHonneur) return 'TABLEAU_HONNEUR'
  if (ratio < params.seuils.avertissement) return 'AVERTISSEMENT_TRAVAIL'
  return 'AUCUNE'
}

export interface Passage {
  decision: DecisionPassage
  motif: string
}

/** Décision de fin d'année. Au primaire, le nombre maximal de redoublements impose le passage. */
export function decisionPassage(
  moyenneFinale: number | null,
  bareme: 10 | 20,
  cycle: Cycle,
  redoublements: number,
  params: ParamsCalcul = PARAMS_PAR_DEFAUT,
): Passage | null {
  if (moyenneFinale === null) return null
  const seuil = bareme * params.seuilAdmission
  if (moyenneFinale >= seuil) return { decision: 'ADMIS', motif: `Moyenne annuelle supérieure ou égale à ${seuil}.` }
  if (cycle === 'PRIMAIRE' && redoublements >= params.redoublementsMaxPrimaire) {
    return {
      decision: 'PASSAGE_OBLIGE',
      motif: `Maximum de ${params.redoublementsMaxPrimaire} redoublements atteint au primaire : passage obligatoire.`,
    }
  }
  return { decision: 'REDOUBLE', motif: `Moyenne annuelle inférieure à ${seuil}. La direction peut décider autrement.` }
}

/** Appréciation de départ, bienveillante, que l'enseignant peut modifier. */
export function appreciationSuggeree(moyenneEleve: number | null, bareme: 10 | 20): string {
  if (moyenneEleve === null) return 'Pas encore assez de notes pour apprécier le trimestre.'
  const ratio = moyenneEleve / bareme
  if (ratio >= 0.8) return 'Excellent trimestre. Continue ainsi.'
  if (ratio >= 0.7) return 'Très bon travail, des résultats solides.'
  if (ratio >= 0.6) return 'Bon trimestre. Encore un peu d’effort pour viser plus haut.'
  if (ratio >= 0.5) return 'Résultats corrects. Un travail plus régulier donnera de meilleures notes.'
  if (ratio >= 0.4) return 'Résultats fragiles. Un suivi à la maison et des révisions régulières sont conseillés.'
  return 'Résultats insuffisants. Rencontrons-nous pour trouver ensemble des solutions.'
}
