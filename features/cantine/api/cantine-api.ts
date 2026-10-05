import { ApiError, interdit, introuvable, reponse, type ApiResponse } from '@/lib/api'
import { dateDuJour } from '@/lib/clock'
import { ajouterJours, jourSemaine } from '@/lib/domain/calendrier'
import { allergiesDuJour, attendusAuRepas } from '@/lib/domain/vie-scolaire'
import { etat, ecrire } from '@/services/mock-db/store'
import { classesVisibles, type Acteur } from '@/services/mock-db/acces'
import type { AbonnementCantine } from '@/types/domain'
import type { AbonneResume, Cantine, SaisieAbonnement } from '../types'

const gestionnaire = (a: Acteur) => a.role === 'DIRECTION' || a.role === 'ECONOME'
const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Lundi de la semaine d'une date. */
const lundiDe = (date: string) => ajouterJours(date, 1 - jourSemaine(date))

export async function getCantine(acteur: Acteur): Promise<ApiResponse<Cantine>> {
  const base = etat()
  const aujourdhui = dateDuJour()
  const lundi = lundiDe(aujourdhui)
  const semaine = [0, 1, 2, 3, 4].map((i) => {
    const date = ajouterJours(lundi, i)
    return { date, menu: base.menus.find((m) => m.date === date), repas: attendusAuRepas(base.abonnements, date).length }
  })

  const cantine: Cantine = { semaine, gestionnaire: gestionnaire(acteur) }

  if (acteur.role === 'PARENT') {
    const matricules = base.utilisateurs.find((u) => u.id === acteur.userId)?.enfants ?? []
    cantine.enfants = base.eleves
      .filter((e) => matricules.includes(e.matricule))
      .map((e) => ({
        matricule: e.matricule,
        nom: `${e.prenoms} ${e.nom}`,
        classe: base.classes.find((c) => c.id === e.classeId)?.libelle ?? '',
        abonnement: base.abonnements.find((a) => a.matricule === e.matricule) ?? null,
      }))
    return reponse(cantine)
  }

  const attendus = attendusAuRepas(base.abonnements, aujourdhui)
  const eleves = new Map(base.eleves.map((e) => [e.matricule, e]))
  const compteur = new Map<string, number>()
  for (const a of attendus) {
    const classe = base.classes.find((c) => c.id === eleves.get(a.matricule)?.classeId)
    if (classe) compteur.set(classe.libelle, (compteur.get(classe.libelle) ?? 0) + 1)
  }
  cantine.aujourdhui = {
    date: aujourdhui,
    menu: base.menus.find((m) => m.date === aujourdhui),
    total: attendus.length,
    parClasse: [...compteur.entries()].map(([classe, nombre]) => ({ classe, nombre })).sort((a, b) => a.classe.localeCompare(b.classe, 'fr', { numeric: true })),
    allergies: allergiesDuJour(attendus).map(({ allergie }) => ({
      allergie,
      eleves: attendus.filter((a) => a.allergies.includes(allergie)).map((a) => {
        const e = eleves.get(a.matricule)
        return e ? `${e.prenoms} ${e.nom}` : a.matricule
      }),
    })),
  }
  return reponse(cantine)
}

/** Recherche d'élèves avec leur abonnement (gestion des inscriptions à la cantine). */
export async function getAbonnes(acteur: Acteur, recherche: string): Promise<ApiResponse<AbonneResume[]>> {
  if (!gestionnaire(acteur)) interdit('La gestion des abonnements est réservée à l’économat et à la direction.')
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  const q = normaliser(recherche.trim())
  const liste = base.eleves
    .filter((e) => !visibles || visibles.includes(e.classeId))
    .filter((e) => q.length >= 2 && normaliser(`${e.nom} ${e.prenoms} ${e.matricule}`).includes(q))
    .slice(0, 12)
    .map<AbonneResume>((e) => ({
      matricule: e.matricule,
      nom: e.nom,
      prenoms: e.prenoms,
      classe: base.classes.find((c) => c.id === e.classeId)?.libelle ?? '',
      abonnement: base.abonnements.find((a) => a.matricule === e.matricule) ?? null,
    }))
  return reponse(liste, {}, 60)
}

export async function enregistrerAbonnement(acteur: Acteur, saisie: SaisieAbonnement): Promise<ApiResponse<AbonnementCantine>> {
  if (!gestionnaire(acteur)) interdit('La gestion des abonnements est réservée à l’économat et à la direction.')
  if (!etat().eleves.some((e) => e.matricule === saisie.matricule)) return introuvable('Élève introuvable.')
  if (saisie.jours.length === 0) throw new ApiError('Choisissez au moins un jour de repas.', 422)
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(saisie.payeJusqua)) throw new ApiError('Mois de paiement invalide.', 422)
  const abonnement: AbonnementCantine = { matricule: saisie.matricule, jours: [...saisie.jours].sort(), allergies: saisie.allergies, payeJusqua: saisie.payeJusqua }
  ecrire.abonnement(abonnement)
  return reponse(abonnement, {}, 60)
}
