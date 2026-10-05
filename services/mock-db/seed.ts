import type {
  AbonnementCantine,
  Classe,
  Creneau,
  Cycle,
  Eleve,
  EvaluationAjoutee,
  Frais,
  JourSemaine,
  Matiere,
  MatiereClasse,
  MenuJour,
  ModePaiement,
  NiveauCode,
  Note,
  NoteValeur,
  Paiement,
  Presence,
  Sanction,
  Trimestre,
  TypeEvaluation,
  TypeSanction,
  Utilisateur,
} from '@/types/domain'
import { ajouterJours, fenetresTrimestres, jourSemaine } from '@/lib/domain/calendrier'
import { bareme, cycleDe, niveauInfo } from '@/lib/domain/niveaux'
import { echeances, numeroRecu } from '@/lib/domain/scolarite'
import { PLAGES_HORAIRES, seChevauchent } from '@/lib/domain/emploi-du-temps'
import { arrondir2 } from '@/lib/domain/notes'
import { PARAMS_PAR_DEFAUT, type ParamsCalcul } from '@/lib/domain/params'
import { creerAlea, type Alea } from '@/lib/prng'
import { ALLERGIES, DESSERTS, MOTIFS_SANCTION, NOMS, PLATS, PRENOMS_F, PRENOMS_M } from './noms'

/** Date « d'aujourd'hui » de la démonstration : un mercredi, 3e trimestre en cours, 1er et 2e trimestres terminés. */
export const DATE_DEMO = '2026-05-13'
export const ANNEE_DEMO = '2025-2026'

export interface Seed {
  classes: Classe[]
  eleves: Eleve[]
  utilisateurs: Utilisateur[]
  matieres: Matiere[]
  matieresClasses: MatiereClasse[]
  notes: Note[]
  evaluations: EvaluationAjoutee[]
  presences: Presence[]
  sanctions: Sanction[]
  creneaux: Creneau[]
  frais: Frais[]
  paiements: Paiement[]
  menus: MenuJour[]
  abonnements: AbonnementCantine[]
  /** Réglages de calcul de l'école (modifiables dans les paramètres). */
  params: ParamsCalcul
  /** Identifiants des comptes de démonstration, un par profil. */
  comptesDemo: { direction: string; enseignant: string; educateur: string; econome: string; parent: string }
}

// ─── Matières et programmes ──────────────────────────────────────────────────

const TOUS: Cycle[] = ['PRIMAIRE', 'COLLEGE', 'LYCEE']
const SECONDAIRE: Cycle[] = ['COLLEGE', 'LYCEE']

export const MATIERES: Matiere[] = [
  { id: 'lecture', libelle: 'Lecture', cycles: ['PRIMAIRE'] },
  { id: 'expression-ecrite', libelle: 'Expression écrite', cycles: ['PRIMAIRE'] },
  { id: 'gco', libelle: 'Grammaire, conjugaison, orthographe', cycles: ['PRIMAIRE'] },
  { id: 'maths', libelle: 'Mathématiques', cycles: TOUS },
  { id: 'sciences', libelle: 'Sciences et technologie', cycles: ['PRIMAIRE'] },
  { id: 'hgec', libelle: 'Histoire-Géographie-Éducation civique', cycles: ['PRIMAIRE'] },
  { id: 'eps', libelle: 'Éducation physique et sportive', cycles: TOUS },
  { id: 'francais', libelle: 'Français', cycles: SECONDAIRE },
  { id: 'anglais', libelle: 'Anglais', cycles: SECONDAIRE },
  { id: 'hg', libelle: 'Histoire-Géographie', cycles: SECONDAIRE },
  { id: 'svt', libelle: 'Sciences de la vie et de la Terre', cycles: SECONDAIRE },
  { id: 'pc', libelle: 'Physique-Chimie', cycles: SECONDAIRE },
  { id: 'arts', libelle: 'Arts plastiques', cycles: ['COLLEGE'] },
  { id: 'ecm', libelle: 'Éducation civique et morale', cycles: ['COLLEGE'] },
  { id: 'philo', libelle: 'Philosophie', cycles: ['LYCEE'] },
]

interface LigneProgramme {
  matiereId: string
  coefficient: number
  heures: number
}

/** Coefficients et volumes horaires par défaut. Ce sont des paramètres de l'école, à confirmer avec la direction. */
function programme(niveau: NiveauCode, serie?: 'A' | 'C' | 'D'): LigneProgramme[] {
  const cycle = cycleDe(niveau)
  if (cycle === 'PRIMAIRE') {
    return [
      { matiereId: 'lecture', coefficient: 1, heures: 4 },
      { matiereId: 'expression-ecrite', coefficient: 1, heures: 3 },
      { matiereId: 'gco', coefficient: 1, heures: 3 },
      { matiereId: 'maths', coefficient: 2, heures: 6 },
      { matiereId: 'sciences', coefficient: 1, heures: 2 },
      { matiereId: 'hgec', coefficient: 1, heures: 2 },
      { matiereId: 'eps', coefficient: 1, heures: 2 },
    ]
  }
  if (cycle === 'COLLEGE') {
    return [
      { matiereId: 'francais', coefficient: 4, heures: 4 },
      { matiereId: 'maths', coefficient: 4, heures: 4 },
      { matiereId: 'anglais', coefficient: 3, heures: 3 },
      { matiereId: 'hg', coefficient: 2, heures: 2 },
      { matiereId: 'svt', coefficient: 2, heures: 2 },
      { matiereId: 'pc', coefficient: 2, heures: 2 },
      { matiereId: 'eps', coefficient: 1, heures: 2 },
      { matiereId: 'arts', coefficient: 1, heures: 1 },
      { matiereId: 'ecm', coefficient: 1, heures: 1 },
    ]
  }
  const s = serie ?? 'A'
  const lignes: LigneProgramme[] = [
    { matiereId: 'francais', coefficient: s === 'A' ? 4 : 2, heures: 4 },
    { matiereId: 'maths', coefficient: s === 'A' ? 2 : s === 'C' ? 5 : 4, heures: s === 'A' ? 3 : s === 'C' ? 6 : 5 },
    { matiereId: 'anglais', coefficient: s === 'A' ? 3 : 2, heures: 3 },
    { matiereId: 'hg', coefficient: s === 'A' ? 3 : 2, heures: 3 },
    { matiereId: 'svt', coefficient: s === 'D' ? 4 : 1, heures: s === 'D' ? 4 : 2 },
    { matiereId: 'pc', coefficient: s === 'A' ? 1 : s === 'C' ? 5 : 3, heures: s === 'A' ? 2 : s === 'C' ? 5 : 4 },
    { matiereId: 'eps', coefficient: 1, heures: 2 },
  ]
  if (niveau === 'TLE') lignes.push({ matiereId: 'philo', coefficient: s === 'A' ? 5 : 2, heures: 3 })
  return lignes
}

// ─── Classes ─────────────────────────────────────────────────────────────────

interface DefClasse {
  niveau: NiveauCode
  lettre: string
  serie?: 'A' | 'C' | 'D'
}

const DEFS_CLASSES: DefClasse[] = [
  { niveau: 'CP1', lettre: 'A' }, { niveau: 'CP2', lettre: 'A' }, { niveau: 'CE1', lettre: 'A' },
  { niveau: 'CE2', lettre: 'A' }, { niveau: 'CM1', lettre: 'A' }, { niveau: 'CM2', lettre: 'A' },
  { niveau: 'CM2', lettre: 'B' },
  { niveau: '6E', lettre: 'A' }, { niveau: '6E', lettre: 'B' }, { niveau: '5E', lettre: 'A' },
  { niveau: '5E', lettre: 'B' }, { niveau: '4E', lettre: 'A' }, { niveau: '3E', lettre: 'A' },
  { niveau: '3E', lettre: 'B' },
  { niveau: '2NDE', lettre: 'A', serie: 'A' }, { niveau: '2NDE', lettre: 'C', serie: 'C' },
  { niveau: '1ERE', lettre: 'A', serie: 'A' }, { niveau: '1ERE', lettre: 'D', serie: 'D' },
  { niveau: 'TLE', lettre: 'A', serie: 'A' }, { niveau: 'TLE', lettre: 'D', serie: 'D' },
]

const FRAIS: Record<Cycle, Omit<Frais, 'niveau'>> = {
  PRIMAIRE: { inscription: 50_000, tranche: 60_000, ape: 5_000 },
  COLLEGE: { inscription: 75_000, tranche: 90_000, ape: 5_000 },
  LYCEE: { inscription: 90_000, tranche: 120_000, ape: 5_000 },
}

// ─── Génération ──────────────────────────────────────────────────────────────

const pad = (n: number, taille = 2) => String(n).padStart(taille, '0')

function telephone(alea: Alea): string {
  const bloc = () => pad(alea.entier(0, 99))
  return `+225 07 ${bloc()} ${bloc()} ${bloc()} ${bloc()}`
}

function jourDeClasse(alea: Alea): JourSemaine {
  return alea.entier(1, 5) as JourSemaine
}

/** Jours de classe (lundi–vendredi, hors 1er mai) en remontant depuis la date de démo. */
function joursDeClasseRecents(nombre: number): string[] {
  const jours: string[] = []
  let jour = DATE_DEMO
  while (jours.length < nombre) {
    if (jourSemaine(jour) <= 5 && jour !== '2026-05-01') jours.push(jour)
    jour = ajouterJours(jour, -1)
  }
  return jours
}

export function genererSeed(): Seed {
  const alea = creerAlea(20260513)
  const fenetres = fenetresTrimestres(ANNEE_DEMO)

  // Enseignants et classes ----------------------------------------------------
  const utilisateurs: Utilisateur[] = []
  let compteurEns = 0
  const nouvelEnseignant = (): Utilisateur => {
    compteurEns++
    const feminin = alea.chance(0.45)
    const prenoms = alea.choisir(feminin ? PRENOMS_F : PRENOMS_M)
    const user: Utilisateur = {
      id: `ens-${pad(compteurEns, 3)}`,
      nom: alea.choisir(NOMS),
      prenoms,
      role: 'ENSEIGNANT',
      email: `enseignant${compteurEns}@les-cocotiers.ci`,
      telephone: telephone(alea),
    }
    utilisateurs.push(user)
    return user
  }

  const classes: Classe[] = []
  const matieresClasses: MatiereClasse[] = []
  const progParClasse = new Map<string, LigneProgramme[]>()

  // Maîtres du primaire : un par classe, créés tout de suite
  const maitreDe = new Map<string, string>()
  DEFS_CLASSES.forEach((def, index) => {
    const id = `cl-${def.niveau.toLowerCase()}-${def.lettre.toLowerCase()}`
    const info = niveauInfo(def.niveau)
    let principalId = ''
    if (info.cycle === 'PRIMAIRE') {
      principalId = nouvelEnseignant().id
      maitreDe.set(id, principalId)
    }
    classes.push({
      id,
      niveau: def.niveau,
      libelle: info.cycle === 'LYCEE' ? `${info.label} ${def.serie}` : `${info.label} ${def.lettre}`,
      serie: def.serie,
      effectifMax: info.cycle === 'LYCEE' ? 30 : 35,
      principalId,
      salle: `Salle ${index + 1}`,
    })
    progParClasse.set(id, programme(def.niveau, def.serie))
  })

  // Professeurs du secondaire : un nouveau professeur dès que 18 h/semaine sont atteintes
  const profCourant = new Map<string, { id: string; heures: number }>()
  for (const classe of classes) {
    const cycle = cycleDe(classe.niveau)
    for (const ligne of progParClasse.get(classe.id) ?? []) {
      let enseignantId: string
      if (cycle === 'PRIMAIRE') {
        enseignantId = maitreDe.get(classe.id) as string
      } else {
        let courant = profCourant.get(ligne.matiereId)
        if (!courant || courant.heures + ligne.heures > 18) {
          courant = { id: nouvelEnseignant().id, heures: 0 }
          profCourant.set(ligne.matiereId, courant)
        }
        courant.heures += ligne.heures
        enseignantId = courant.id
      }
      matieresClasses.push({ classeId: classe.id, matiereId: ligne.matiereId, coefficient: ligne.coefficient, enseignantId })
    }
    if (cycle !== 'PRIMAIRE') {
      classe.principalId = matieresClasses.find((m) => m.classeId === classe.id && m.matiereId === 'francais')?.enseignantId ?? ''
    }
  }

  // Emplois du temps ------------------------------------------------------------
  const HORAIRES = PLAGES_HORAIRES
  const creneaux: Creneau[] = []
  const parJour = new Map<number, Creneau[]>()
  const libre = (c: Creneau): boolean =>
    !(parJour.get(c.jour) ?? []).some(
      (autre) => seChevauchent(autre, c) && (autre.classeId === c.classeId || autre.enseignantId === c.enseignantId || autre.salle === c.salle)
    )

  let numeroCreneau = 0
  classes.forEach((classe, indexClasse) => {
    const lecons: { matiereId: string; enseignantId: string }[] = []
    const lignes = (progParClasse.get(classe.id) ?? []).slice().sort((a, b) => b.heures - a.heures)
    for (const ligne of lignes) {
      const mc = matieresClasses.find((m) => m.classeId === classe.id && m.matiereId === ligne.matiereId)
      for (let h = 0; h < ligne.heures; h++) lecons.push({ matiereId: ligne.matiereId, enseignantId: mc?.enseignantId ?? '' })
    }
    // Répartit les heures d'une même matière sur des jours différents
    const parMatiere = new Map<string, Set<number>>()
    lecons.forEach((lecon, index) => {
      const jours = parMatiere.get(lecon.matiereId) ?? new Set<number>()
      parMatiere.set(lecon.matiereId, jours)
      const candidats: { jour: JourSemaine; debut: string; fin: string }[] = []
      for (let decalage = 0; decalage < 5; decalage++) {
        const jour = (((index + indexClasse + decalage * 2) % 5) + 1) as JourSemaine
        for (const h of HORAIRES) if (h.jours.includes(jour)) candidats.push({ jour, debut: h.debut, fin: h.fin })
      }
      const ordonnes = [...candidats.filter((c) => !jours.has(c.jour)), ...candidats.filter((c) => jours.has(c.jour))]
      for (const c of ordonnes) {
        const nouveau: Creneau = {
          id: `cr-${++numeroCreneau}`,
          classeId: classe.id,
          jour: c.jour,
          debut: c.debut,
          fin: c.fin,
          matiereId: lecon.matiereId,
          enseignantId: lecon.enseignantId,
          salle: classe.salle,
        }
        if (!libre(nouveau)) {
          numeroCreneau--
          continue
        }
        creneaux.push(nouveau)
        parJour.set(nouveau.jour, [...(parJour.get(nouveau.jour) ?? []), nouveau])
        jours.add(c.jour)
        break
      }
    })
  })

  // Élèves, parents -------------------------------------------------------------
  const eleves: Eleve[] = []
  let compteurParent = 0
  const creerParent = (nom: string): Utilisateur => {
    compteurParent++
    const parent: Utilisateur = {
      id: `par-${pad(compteurParent, 3)}`,
      nom,
      prenoms: alea.choisir(alea.chance(0.5) ? PRENOMS_F : PRENOMS_M),
      role: 'PARENT',
      email: `parent${compteurParent}@exemple.ci`,
      telephone: telephone(alea),
      enfants: [],
    }
    utilisateurs.push(parent)
    return parent
  }

  for (const classe of classes) {
    const cycle = cycleDe(classe.niveau)
    const effectif = cycle === 'LYCEE' ? alea.entier(17, 24) : cycle === 'COLLEGE' ? alea.entier(22, 28) : alea.entier(20, 26)
    const ordre = niveauInfo(classe.niveau).ordre
    for (let i = 0; i < effectif; i++) {
      const sexe = alea.chance(0.5) ? 'F' : 'M'
      const nom = alea.choisir(NOMS)
      const ageMin = 5 + ordre
      const annee = 2025 - ageMin - alea.entier(0, 1)
      const parent = creerParent(nom)
      const matricule = `${pad(annee % 100)}${pad(alea.entier(100000, 999999), 6)}${String.fromCharCode(65 + alea.entier(0, 25))}`
      parent.enfants?.push(matricule)
      eleves.push({
        matricule,
        nom,
        prenoms: alea.choisir(sexe === 'F' ? PRENOMS_F : PRENOMS_M),
        sexe,
        naissance: `${annee}-${pad(alea.entier(1, 12))}-${pad(alea.entier(1, 28))}`,
        classeId: classe.id,
        parentIds: [parent.id],
        redoublements: cycle === 'PRIMAIRE' && alea.chance(0.07) ? alea.entier(1, 2) : 0,
        affecte: alea.chance(0.8),
      })
    }
  }

  // Comptes de démonstration --------------------------------------------------
  const direction: Utilisateur = { id: 'u-direction', nom: 'Aka', prenoms: 'Marie-Claire', role: 'DIRECTION', email: 'direction@les-cocotiers.ci', telephone: '+225 07 01 02 03 04' }
  const educateur: Utilisateur = { id: 'u-educateur', nom: 'Doumbia', prenoms: 'Ismaël', role: 'EDUCATEUR', email: 'educateur@les-cocotiers.ci', telephone: '+225 07 05 06 07 08' }
  const econome: Utilisateur = { id: 'u-econome', nom: 'Sanogo', prenoms: 'Fanta', role: 'ECONOME', email: 'econome@les-cocotiers.ci', telephone: '+225 07 09 10 11 12' }
  utilisateurs.unshift(direction, educateur, econome)

  // L'enseignant de démo est le premier professeur de mathématiques du collège (plusieurs classes à saisir).
  const profMaths = matieresClasses.find((m) => m.matiereId === 'maths' && cycleDe(classes.find((c) => c.id === m.classeId)?.niveau ?? 'CP1') === 'COLLEGE')
  const enseignantDemo = utilisateurs.find((u) => u.id === profMaths?.enseignantId) as Utilisateur
  enseignantDemo.nom = 'Kouadio'
  enseignantDemo.prenoms = 'Yao'

  // Parent de démo : deux enfants dans deux cycles (un CM1, un élève de 5e).
  const enfantPrimaire = eleves.find((e) => e.classeId === 'cl-cm1-a') as Eleve
  const enfantCollege = eleves.find((e) => e.classeId === 'cl-5e-a') as Eleve
  const parentDemo: Utilisateur = {
    id: 'u-parent',
    nom: 'Koné',
    prenoms: 'Seydou',
    role: 'PARENT',
    email: 'seydou.kone@exemple.ci',
    telephone: '+225 07 13 14 15 16',
    enfants: [enfantPrimaire.matricule, enfantCollege.matricule],
  }
  utilisateurs.push(parentDemo)
  for (const enfant of [enfantPrimaire, enfantCollege]) {
    const ancien = utilisateurs.find((u) => u.id === enfant.parentIds[0])
    if (ancien) ancien.enfants = (ancien.enfants ?? []).filter((m) => m !== enfant.matricule)
    enfant.parentIds = [parentDemo.id]
    enfant.nom = parentDemo.nom
  }
  const orphelins = new Set(utilisateurs.filter((u) => u.role === 'PARENT' && (u.enfants?.length ?? 0) === 0).map((u) => u.id))
  const utilisateursFinal = utilisateurs.filter((u) => !orphelins.has(u.id))

  // Notes ----------------------------------------------------------------------
  const notes: Note[] = []
  const TYPES_PAR_TRIMESTRE: Record<Trimestre, { type: TypeEvaluation; part: number }[]> = {
    1: [{ type: 'INTERRO', part: 0.2 }, { type: 'INTERRO', part: 0.45 }, { type: 'DEVOIR', part: 0.7 }, { type: 'COMPOSITION', part: 0.95 }],
    2: [{ type: 'INTERRO', part: 0.2 }, { type: 'INTERRO', part: 0.45 }, { type: 'DEVOIR', part: 0.7 }, { type: 'COMPOSITION', part: 0.95 }],
    // 3e trimestre en cours : pas encore de composition
    3: [{ type: 'INTERRO', part: 0.12 }, { type: 'DEVOIR', part: 0.28 }, { type: 'INTERRO', part: 0.44 }],
  }
  const dateDansFenetre = (t: Trimestre, part: number): string => {
    const f = fenetres[t - 1]
    const [ay, am, ad] = f.debut.split('-').map(Number)
    const [by, bm, bd] = f.fin.split('-').map(Number)
    const jours = Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
    return ajouterJours(f.debut, Math.round(jours * part))
  }
  // La dernière évaluation du 3e trimestre attend la validation de l'enseignant dans environ 3 séries (classe × matière) sur 10.
  const enAttente = (classeId: string, matiereId: string) =>
    [...`${classeId}|${matiereId}`].reduce((total, c) => total + c.charCodeAt(0), 0) % 10 < 3

  for (const eleve of eleves) {
    const classe = classes.find((c) => c.id === eleve.classeId) as Classe
    const barem = bareme(cycleDe(classe.niveau))
    const niveauEleve = Math.min(0.9, Math.max(0.25, alea.normale(0.58, 0.14)))
    for (const mc of matieresClasses.filter((m) => m.classeId === classe.id)) {
      const facilite = alea.normale(0, 0.07)
      for (const t of [1, 2, 3] as Trimestre[]) {
        TYPES_PAR_TRIMESTRE[t].forEach((evaluation, index) => {
          let valeur: NoteValeur
          const tirage = alea.suivant()
          if (tirage < 0.015) valeur = { type: 'AJ' }
          else if (tirage < 0.022) valeur = { type: 'ANJ' }
          else {
            const ratio = Math.min(1, Math.max(0, niveauEleve + facilite + alea.normale(0, 0.1)))
            valeur = { type: 'NOTE', valeur: arrondir2(Math.round(ratio * barem * 4) / 4) }
          }
          const date = dateDansFenetre(t, evaluation.part)
          notes.push({
            id: `n-${eleve.matricule}-${mc.matiereId}-${t}-${index}`,
            matricule: eleve.matricule,
            classeId: classe.id,
            matiereId: mc.matiereId,
            trimestre: t,
            type: evaluation.type,
            valeur,
            date,
            // Les notes récentes attendent la validation de l'enseignant avant d'être visibles des parents.
            publiee: !(t === 3 && index === 2 && enAttente(classe.id, mc.matiereId)),
          })
        })
      }
    }
  }

  // Frais et paiements -----------------------------------------------------------
  const frais: Frais[] = (['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2', '6E', '5E', '4E', '3E', '2NDE', '1ERE', 'TLE'] as NiveauCode[]).map((niveau) => ({
    niveau,
    ...FRAIS[cycleDe(niveau)],
  }))
  const dates = echeances(ANNEE_DEMO)
  const paiements: Paiement[] = []
  const MODES: ModePaiement[] = ['WAVE', 'WAVE', 'WAVE', 'ORANGE_MONEY', 'ORANGE_MONEY', 'MTN_MONEY', 'ESPECES', 'ESPECES', 'ESPECES']
  const brutsPaiements: Omit<Paiement, 'recu' | 'id'>[] = []
  const payer = (matricule: string, objet: Paiement['objet'], montant: number, echeance: string) => {
    const decalage = alea.entier(-12, 18)
    const date = ajouterJours(echeance, decalage)
    if (date > DATE_DEMO) return
    brutsPaiements.push({ matricule, montant, mode: alea.choisir(MODES), objet, date })
  }
  for (const eleve of eleves) {
    const classe = classes.find((c) => c.id === eleve.classeId) as Classe
    const f = frais.find((x) => x.niveau === classe.niveau) as Frais
    if (alea.chance(0.995)) payer(eleve.matricule, 'INSCRIPTION', f.inscription, dates.INSCRIPTION)
    if (alea.chance(0.985)) payer(eleve.matricule, 'APE', f.ape, dates.APE)
    const tranches: { objet: 'TRANCHE_1' | 'TRANCHE_2' | 'TRANCHE_3'; complet: number; partiel: number }[] = [
      { objet: 'TRANCHE_1', complet: 0.95, partiel: 0.02 },
      { objet: 'TRANCHE_2', complet: 0.92, partiel: 0.03 },
      { objet: 'TRANCHE_3', complet: 0.86, partiel: 0.04 },
    ]
    for (const t of tranches) {
      const tirage = alea.suivant()
      if (tirage < t.complet) payer(eleve.matricule, t.objet, f.tranche, dates[t.objet])
      else if (tirage < t.complet + t.partiel) payer(eleve.matricule, t.objet, Math.round((f.tranche * alea.entier(30, 70)) / 100 / 1000) * 1000, dates[t.objet])
    }
  }
  brutsPaiements.sort((a, b) => a.date.localeCompare(b.date))
  brutsPaiements.forEach((p, index) => {
    paiements.push({ ...p, id: `pay-${index + 1}`, recu: numeroRecu(Number(p.date.slice(0, 4)), index + 1) })
  })

  // Présences : 15 jours de classe, appel du jour non fait dans certaines classes ------------
  const presences: Presence[] = []
  const jours = joursDeClasseRecents(15)
  const classesSansAppel = new Set(classes.filter((_, i) => i % 4 === 3).map((c) => c.id))
  const chroniques = new Set(
    eleves
      .filter((e) => !classesSansAppel.has(e.classeId))
      .filter((_, i) => i % 61 === 7)
      .slice(0, 6)
      .map((e) => e.matricule)
  )
  for (const eleve of eleves) {
    for (const jour of jours) {
      const aujourdhui = jour === DATE_DEMO
      if (aujourdhui && classesSansAppel.has(eleve.classeId)) continue
      const demis: ('MATIN' | 'SOIR')[] = aujourdhui ? ['MATIN'] : ['MATIN', 'SOIR']
      const recents = jours.slice(0, 3).includes(jour)
      for (const demi of demis) {
        let statut: Presence['statut'] = 'PRESENT'
        let retardMinutes: number | undefined
        if (chroniques.has(eleve.matricule) && recents) statut = 'ABSENT'
        else {
          const tirage = alea.suivant()
          if (tirage < 0.035) statut = 'ABSENT'
          else if (tirage < 0.05) statut = 'ABSENT_JUSTIFIE'
          else if (tirage < 0.08) {
            statut = 'RETARD'
            retardMinutes = alea.choisir([5, 10, 15, 20, 30])
          }
        }
        presences.push({ date: jour, demiJournee: demi, matricule: eleve.matricule, statut, retardMinutes })
      }
    }
  }

  // Sanctions ------------------------------------------------------------------
  const sanctions: Sanction[] = []
  const secondaires = eleves.filter((e) => cycleDe((classes.find((c) => c.id === e.classeId) as Classe).niveau) !== 'PRIMAIRE')
  const tousProfs = utilisateursFinal.filter((u) => u.role === 'ENSEIGNANT')
  const ajouterSanction = (matricule: string, type: TypeSanction, statut: Sanction['statut'], joursAvant: number) => {
    sanctions.push({
      id: `san-${sanctions.length + 1}`,
      matricule,
      type,
      motif: alea.choisir(MOTIFS_SANCTION),
      date: ajouterJours(DATE_DEMO, -joursAvant),
      statut,
      auteurId: alea.chance(0.5) ? 'u-educateur' : alea.choisir(tousProfs).id,
      joursExclusion: type === 'EXCLUSION_TEMPORAIRE' ? alea.entier(1, 3) : undefined,
    })
  }
  const TYPES: TypeSanction[] = ['AVERTISSEMENT', 'AVERTISSEMENT', 'AVERTISSEMENT', 'RETENUE', 'RETENUE', 'BLAME', 'BLAME', 'EXCLUSION_TEMPORAIRE']
  for (let i = 0; i < 55; i++) {
    const eleve = alea.choisir(secondaires)
    const tirage = alea.suivant()
    ajouterSanction(eleve.matricule, alea.choisir(TYPES), tirage < 0.55 ? 'PARENT_INFORME' : tirage < 0.85 ? 'VALIDEE' : 'BROUILLON', alea.entier(1, 60))
  }
  // Trois élèves cumulent des avertissements : la suggestion d'escalade s'affiche pour eux.
  for (const eleve of secondaires.slice(10, 13)) {
    for (let k = 0; k < 3; k++) ajouterSanction(eleve.matricule, 'AVERTISSEMENT', 'PARENT_INFORME', 10 + k * 9)
  }

  // Cantine --------------------------------------------------------------------
  const menus: MenuJour[] = []
  let jourMenu = ajouterJours(DATE_DEMO, -7)
  let indexPlat = 0
  for (let i = 0; i < 21; i++) {
    if (jourSemaine(jourMenu) <= 5 && jourMenu !== '2026-05-01') {
      const p = PLATS[indexPlat % PLATS.length]
      menus.push({ date: jourMenu, plat: p.plat, accompagnement: p.accompagnement, dessert: alea.chance(0.7) ? alea.choisir(DESSERTS) : undefined })
      indexPlat++
    }
    jourMenu = ajouterJours(jourMenu, 1)
  }
  const abonnements: AbonnementCantine[] = []
  for (const eleve of eleves) {
    const classe = classes.find((c) => c.id === eleve.classeId) as Classe
    if (cycleDe(classe.niveau) === 'LYCEE' || !alea.chance(0.4)) continue
    abonnements.push({
      matricule: eleve.matricule,
      jours: alea.chance(0.6) ? [1, 2, 3, 4, 5] : [jourDeClasse(alea), jourDeClasse(alea), jourDeClasse(alea)].filter((j, i, tab) => tab.indexOf(j) === i).sort() as JourSemaine[],
      allergies: alea.chance(0.1) ? [alea.choisir(ALLERGIES)] : [],
      payeJusqua: alea.chance(0.8) ? '2026-05' : '2026-04',
    })
  }

  return {
    classes,
    eleves,
    utilisateurs: utilisateursFinal,
    matieres: MATIERES,
    matieresClasses,
    notes,
    evaluations: [],
    presences,
    sanctions,
    creneaux,
    frais,
    paiements,
    menus,
    abonnements,
    params: PARAMS_PAR_DEFAUT,
    comptesDemo: {
      direction: direction.id,
      enseignant: enseignantDemo.id,
      educateur: educateur.id,
      econome: econome.id,
      parent: parentDemo.id,
    },
  }
}

