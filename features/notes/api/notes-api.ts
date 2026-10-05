import { ApiError, interdit, introuvable, reponse, type ApiResponse } from '@/lib/api'
import { dateDuJour } from '@/lib/clock'
import { bareme, cycleDe } from '@/lib/domain/niveaux'
import { etat, ecrire } from '@/services/mock-db/store'
import { classesDeEnseignant, type Acteur } from '@/services/mock-db/acces'
import type { Note, Trimestre } from '@/types/domain'
import type { ColonneEvaluation, EntreeNote, Grille, ParamsGrille } from '../types'

const idNote = (n: Pick<EntreeNote, 'matricule' | 'matiereId' | 'trimestre' | 'index'>) =>
  `n-${n.matricule}-${n.matiereId}-${n.trimestre}-${n.index}`

/** Un enseignant ne saisit que dans les (classe, matière) qui lui sont attribuées. */
function enseigne(acteur: Acteur, classeId: string, matiereId: string): boolean {
  const base = etat()
  return base.matieresClasses.some((m) => m.classeId === classeId && m.matiereId === matiereId && m.enseignantId === acteur.userId)
}

function verifierDroitLecture(acteur: Acteur, classeId: string) {
  if (acteur.role === 'DIRECTION') return
  if (acteur.role === 'ENSEIGNANT' && classesDeEnseignant(etat(), acteur.userId).includes(classeId)) return
  interdit('Vous n’avez pas accès aux notes de cette classe.')
}

export async function getGrille(acteur: Acteur, params: ParamsGrille): Promise<ApiResponse<Grille>> {
  const base = etat()
  verifierDroitLecture(acteur, params.classeId)
  const classe = base.classes.find((c) => c.id === params.classeId)
  const mc = base.matieresClasses.find((m) => m.classeId === params.classeId && m.matiereId === params.matiereId)
  const matiere = base.matieres.find((m) => m.id === params.matiereId)
  if (!classe || !mc || !matiere) return introuvable('Classe ou matière introuvable.')

  const notes = base.notes.filter((n) => n.classeId === classe.id && n.matiereId === matiere.id && n.trimestre === params.trimestre)
  const colonnesMap = new Map<number, ColonneEvaluation>()
  for (const n of notes) {
    const existante = colonnesMap.get(Number(n.id.split('-').pop()))
    const index = Number(n.id.split('-').pop())
    if (!existante || (existante.date ?? '9') > n.date) colonnesMap.set(index, { index, type: n.type, date: n.date })
  }
  for (const e of base.evaluations) {
    if (e.classeId === classe.id && e.matiereId === matiere.id && e.trimestre === params.trimestre && !colonnesMap.has(e.index)) {
      colonnesMap.set(e.index, { index: e.index, type: e.type })
    }
  }
  const colonnes = [...colonnesMap.values()].sort((a, b) => a.index - b.index)

  const lignes = base.eleves
    .filter((e) => e.classeId === classe.id)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenoms.localeCompare(b.prenoms, 'fr'))
    .map((e) => ({
      matricule: e.matricule,
      nom: e.nom,
      prenoms: e.prenoms,
      notes: colonnes.map((c) => notes.find((n) => n.matricule === e.matricule && n.id === idNote({ matricule: e.matricule, matiereId: matiere.id, trimestre: params.trimestre, index: c.index })) ?? null),
    }))

  return reponse({
    classe: { id: classe.id, libelle: classe.libelle },
    matiere: { id: matiere.id, libelle: matiere.libelle, coefficient: mc.coefficient },
    bareme: bareme(cycleDe(classe.niveau)),
    trimestre: params.trimestre,
    colonnes,
    lignes,
    nonValidees: notes.filter((n) => !n.publiee).length,
    modifiable: acteur.role === 'ENSEIGNANT' && enseigne(acteur, classe.id, matiere.id),
  })
}

/** Enregistre ou supprime une note. Une note modifiée après validation reste visible (correction), une nouvelle note attend la validation. */
export async function enregistrerNote(acteur: Acteur, entree: EntreeNote): Promise<ApiResponse<Note | null>> {
  if (acteur.role !== 'ENSEIGNANT' || !enseigne(acteur, entree.classeId, entree.matiereId)) {
    interdit('Seul l’enseignant de la matière peut saisir ces notes.')
  }
  const base = etat()
  const eleve = base.eleves.find((e) => e.matricule === entree.matricule && e.classeId === entree.classeId)
  if (!eleve) return introuvable('Élève introuvable dans cette classe.')
  const id = idNote(entree)

  if (entree.valeur === null) {
    ecrire.supprimerNote(id)
    return reponse(null, {}, 40)
  }
  if (entree.valeur.type === 'NOTE') {
    const max = bareme(cycleDe(base.classes.find((c) => c.id === entree.classeId)?.niveau ?? 'CP1'))
    if (entree.valeur.valeur < 0 || entree.valeur.valeur > max) throw new ApiError(`La note doit être comprise entre 0 et ${max}.`, 422)
  }
  const existante = base.notes.find((n) => n.id === id)
  const note: Note = {
    id,
    matricule: entree.matricule,
    classeId: entree.classeId,
    matiereId: entree.matiereId,
    trimestre: entree.trimestre,
    type: entree.type,
    valeur: entree.valeur,
    date: existante?.date ?? dateDuJour(),
    publiee: existante?.publiee ?? false,
  }
  ecrire.note(note)
  return reponse(note, {}, 40)
}

/** Ajoute une colonne d'évaluation (interrogation, devoir, composition) à la grille. */
export async function ajouterEvaluation(acteur: Acteur, params: ParamsGrille & { type: ColonneEvaluation['type'] }): Promise<ApiResponse<ColonneEvaluation>> {
  if (acteur.role !== 'ENSEIGNANT' || !enseigne(acteur, params.classeId, params.matiereId)) interdit()
  const grille = await getGrille(acteur, params)
  const index = Math.max(-1, ...grille.data.colonnes.map((c) => c.index)) + 1
  ecrire.evaluation({ classeId: params.classeId, matiereId: params.matiereId, trimestre: params.trimestre, index, type: params.type })
  return reponse({ index, type: params.type })
}

/** Valide les notes d'une matière et d'un trimestre : les parents les voient à partir de maintenant. */
export async function validerNotes(acteur: Acteur, params: ParamsGrille): Promise<ApiResponse<{ validees: number }>> {
  if (acteur.role !== 'ENSEIGNANT' || !enseigne(acteur, params.classeId, params.matiereId)) interdit()
  const aValider = etat().notes.filter(
    (n) => n.classeId === params.classeId && n.matiereId === params.matiereId && n.trimestre === (params.trimestre as Trimestre) && !n.publiee
  )
  ecrire.notes(aValider.map((n) => ({ ...n, publiee: true })))
  return reponse({ validees: aValider.length })
}

/** Matières que l'acteur peut consulter dans une classe. */
export async function getMatieresDeClasse(acteur: Acteur, classeId: string): Promise<ApiResponse<{ matiereId: string; libelle: string; modifiable: boolean }[]>> {
  verifierDroitLecture(acteur, classeId)
  const base = etat()
  const liste = base.matieresClasses
    .filter((m) => m.classeId === classeId)
    .map((m) => ({
      matiereId: m.matiereId,
      libelle: base.matieres.find((x) => x.id === m.matiereId)?.libelle ?? m.matiereId,
      modifiable: acteur.role === 'ENSEIGNANT' && m.enseignantId === acteur.userId,
    }))
    .filter((m) => acteur.role !== 'ENSEIGNANT' || m.modifiable)
  return reponse(liste, {}, 40)
}
