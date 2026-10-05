import { interdit, introuvable, reponse, type ApiResponse } from '@/lib/api'
import { etat } from '@/services/mock-db/store'
import { classesVisibles, verifierAccesEleve, type Acteur } from '@/services/mock-db/acces'
import { calculerBulletin, classementClasse, type Bulletin } from '@/services/mock-db/selecteurs'
import type { Trimestre } from '@/types/domain'
import type { BulletinResume, EnfantChoix } from '../types'

export type PeriodeBulletin = Trimestre | 'ANNEE'

/** Un parent ne voit que les notes validées par l'enseignant ; direction et enseignants voient tout. */
const publieesSeulement = (acteur: Acteur) => acteur.role === 'PARENT'

export async function getBulletin(acteur: Acteur, matricule: string, periode: PeriodeBulletin): Promise<ApiResponse<Bulletin>> {
  const base = etat()
  verifierAccesEleve(base, acteur, matricule)
  const bulletin = calculerBulletin(base, matricule, periode, { publieesSeulement: publieesSeulement(acteur) })
  if (!bulletin) return introuvable('Bulletin introuvable.')
  return reponse(bulletin)
}

/** Résumé de toute une classe pour un trimestre : moyenne, rang, mention de chaque élève. */
export async function getBulletinsClasse(acteur: Acteur, classeId: string, periode: PeriodeBulletin): Promise<ApiResponse<BulletinResume[]>> {
  if (acteur.role === 'PARENT') interdit('Les parents consultent le bulletin de leurs enfants.')
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  if (visibles && !visibles.includes(classeId)) interdit('Vous n’avez pas accès à cette classe.')

  const liste = base.eleves
    .filter((e) => e.classeId === classeId)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenoms.localeCompare(b.prenoms, 'fr'))
    .map<BulletinResume>((e) => {
      const b = calculerBulletin(base, e.matricule, periode)
      return {
        matricule: e.matricule,
        nom: e.nom,
        prenoms: e.prenoms,
        moyenne: b?.moyenne ?? null,
        rang: b?.rang ?? null,
        effectif: b?.effectif ?? 0,
        mention: b?.mention ?? 'AUCUNE',
        decision: b?.passage?.decision,
      }
    })
  // Le classement du trimestre est déjà calculé : on s'assure qu'il est chaud pour l'impression groupée.
  if (periode !== 'ANNEE') classementClasse(base, classeId, periode)
  return reponse(liste)
}

/** Enfants du parent connecté (sélecteur du portail parent). */
export async function getEnfants(acteur: Acteur): Promise<ApiResponse<EnfantChoix[]>> {
  const base = etat()
  const matricules = base.utilisateurs.find((u) => u.id === acteur.userId)?.enfants ?? []
  const enfants = base.eleves
    .filter((e) => matricules.includes(e.matricule))
    .map<EnfantChoix>((e) => ({
      matricule: e.matricule,
      nom: `${e.prenoms} ${e.nom}`,
      classe: base.classes.find((c) => c.id === e.classeId)?.libelle ?? '',
    }))
  return reponse(enfants, {}, 40)
}

/** Tous les bulletins d'une classe (impression groupée). */
export async function getBulletinsComplets(acteur: Acteur, classeId: string, periode: PeriodeBulletin): Promise<ApiResponse<Bulletin[]>> {
  if (acteur.role === 'PARENT') interdit('Les parents consultent le bulletin de leurs enfants.')
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  if (visibles && !visibles.includes(classeId)) interdit('Vous n’avez pas accès à cette classe.')
  const liste = base.eleves
    .filter((e) => e.classeId === classeId)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenoms.localeCompare(b.prenoms, 'fr'))
    .flatMap((e) => calculerBulletin(base, e.matricule, periode) ?? [])
  return reponse(liste)
}
