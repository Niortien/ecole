import type { Eleve, Role } from '@/types/domain'
import { interdit } from '@/lib/api'
import type { Seed } from './seed'

/** Qui demande ? Le « backend » de démonstration applique les mêmes règles d'accès qu'un vrai serveur. */
export interface Acteur {
  userId: string
  role: Role
}

/** Classes qu'un enseignant a en charge (maître de classe, ou professeur d'une matière dans la classe). */
export function classesDeEnseignant(etat: Seed, userId: string): string[] {
  const ids = new Set<string>()
  for (const c of etat.classes) if (c.principalId === userId) ids.add(c.id)
  for (const mc of etat.matieresClasses) if (mc.enseignantId === userId) ids.add(mc.classeId)
  return [...ids]
}

/** Classes visibles par l'acteur (null = toutes). */
export function classesVisibles(etat: Seed, acteur: Acteur): string[] | null {
  if (acteur.role === 'ENSEIGNANT') return classesDeEnseignant(etat, acteur.userId)
  if (acteur.role === 'PARENT') {
    const enfants = etat.utilisateurs.find((u) => u.id === acteur.userId)?.enfants ?? []
    return [...new Set(etat.eleves.filter((e) => enfants.includes(e.matricule)).map((e) => e.classeId))]
  }
  return null
}

/** Élèves que l'acteur a le droit de voir. */
export function elevesVisibles(etat: Seed, acteur: Acteur): Eleve[] {
  if (acteur.role === 'PARENT') {
    const enfants = etat.utilisateurs.find((u) => u.id === acteur.userId)?.enfants ?? []
    return etat.eleves.filter((e) => enfants.includes(e.matricule))
  }
  if (acteur.role === 'ENSEIGNANT') {
    const classes = new Set(classesDeEnseignant(etat, acteur.userId))
    return etat.eleves.filter((e) => classes.has(e.classeId))
  }
  return etat.eleves
}

/** Lève une erreur 403 si l'acteur ne peut pas voir cet élève. */
export function verifierAccesEleve(etat: Seed, acteur: Acteur, matricule: string): Eleve {
  const eleve = elevesVisibles(etat, acteur).find((e) => e.matricule === matricule)
  if (!eleve) interdit("Vous n'avez pas accès à la fiche de cet élève.")
  return eleve
}

export function peutVoirScolarite(role: Role): boolean {
  return role === 'DIRECTION' || role === 'ECONOME' || role === 'PARENT'
}
