import { ApiError, interdit, introuvable, reponse, type ApiResponse } from '@/lib/api'
import { CONFLIT_LABEL, conflitsAvec, enMinutes, heuresParSemaine } from '@/lib/domain/emploi-du-temps'
import { etat, ecrire } from '@/services/mock-db/store'
import { classesDeEnseignant, classesVisibles, type Acteur } from '@/services/mock-db/acces'
import type { Creneau } from '@/types/domain'
import type { CreneauDetail, EmploiDuTemps, NouveauCreneau, OptionsFormulaire, TypeCible } from '../types'

function detailler(creneaux: Creneau[]): CreneauDetail[] {
  const base = etat()
  return creneaux
    .map((c) => {
      const ens = base.utilisateurs.find((u) => u.id === c.enseignantId)
      return {
        id: c.id,
        jour: c.jour,
        debut: c.debut,
        fin: c.fin,
        matiereId: c.matiereId,
        matiere: base.matieres.find((m) => m.id === c.matiereId)?.libelle ?? c.matiereId,
        classeId: c.classeId,
        classe: base.classes.find((k) => k.id === c.classeId)?.libelle ?? c.classeId,
        enseignantId: c.enseignantId,
        enseignant: ens ? `${ens.prenoms} ${ens.nom}` : '—',
        salle: c.salle,
      }
    })
    .sort((a, b) => a.jour - b.jour || enMinutes(a.debut) - enMinutes(b.debut))
}

export async function getEmploiDuTemps(acteur: Acteur, cible?: { type: TypeCible; id: string }): Promise<ApiResponse<EmploiDuTemps>> {
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  const classes = base.classes.filter((c) => !visibles || visibles.includes(c.id)).map((c) => ({ id: c.id, label: c.libelle }))
  const enseignants =
    acteur.role === 'PARENT'
      ? []
      : base.utilisateurs
          .filter((u) => u.role === 'ENSEIGNANT' && (acteur.role !== 'ENSEIGNANT' || u.id === acteur.userId))
          .map((u) => ({ id: u.id, label: `${u.prenoms} ${u.nom}` }))
          .sort((a, b) => a.label.localeCompare(b.label, 'fr'))

  // Cible par défaut : mes cours (enseignant), la classe de mon enfant (parent), la première classe sinon.
  const choix: { type: TypeCible; id: string } =
    cible ?? (acteur.role === 'ENSEIGNANT' ? { type: 'enseignant', id: acteur.userId } : { type: 'classe', id: classes[0]?.id ?? '' })

  let creneaux: Creneau[]
  let label: string
  if (choix.type === 'classe') {
    if (visibles && !visibles.includes(choix.id)) interdit('Vous n’avez pas accès à cet emploi du temps.')
    const classe = base.classes.find((c) => c.id === choix.id)
    if (!classe) return introuvable('Classe introuvable.')
    creneaux = base.creneaux.filter((c) => c.classeId === choix.id)
    label = classe.libelle
  } else {
    if (acteur.role === 'PARENT' || (acteur.role === 'ENSEIGNANT' && choix.id !== acteur.userId && !classesDeEnseignant(base, acteur.userId).length)) interdit()
    const ens = base.utilisateurs.find((u) => u.id === choix.id && u.role === 'ENSEIGNANT')
    if (!ens) return introuvable('Enseignant introuvable.')
    creneaux = base.creneaux.filter((c) => c.enseignantId === choix.id)
    label = `${ens.prenoms} ${ens.nom}`
  }

  return reponse({
    cible: { ...choix, label },
    creneaux: detailler(creneaux),
    heures: choix.type === 'enseignant' ? heuresParSemaine(base.creneaux, choix.id) : undefined,
    classes,
    enseignants,
    modifiable: acteur.role === 'DIRECTION',
  })
}

export async function getOptionsFormulaire(acteur: Acteur, classeId: string): Promise<ApiResponse<OptionsFormulaire>> {
  if (acteur.role !== 'DIRECTION') interdit()
  const base = etat()
  const classe = base.classes.find((c) => c.id === classeId)
  if (!classe) return introuvable('Classe introuvable.')
  const matieres = base.matieresClasses
    .filter((m) => m.classeId === classeId)
    .map((m) => {
      const ens = base.utilisateurs.find((u) => u.id === m.enseignantId)
      return {
        matiereId: m.matiereId,
        libelle: base.matieres.find((x) => x.id === m.matiereId)?.libelle ?? m.matiereId,
        enseignant: ens ? `${ens.prenoms} ${ens.nom}` : '—',
      }
    })
  return reponse({ matieres, salle: classe.salle }, {}, 40)
}

/** Ajoute un cours. Un chevauchement de classe, d'enseignant ou de salle est refusé avec le motif. */
export async function ajouterCreneau(acteur: Acteur, nouveau: NouveauCreneau): Promise<ApiResponse<CreneauDetail>> {
  if (acteur.role !== 'DIRECTION') interdit('Seule la direction modifie l’emploi du temps.')
  const base = etat()
  const mc = base.matieresClasses.find((m) => m.classeId === nouveau.classeId && m.matiereId === nouveau.matiereId)
  if (!mc) throw new ApiError('Cette matière n’est pas enseignée dans cette classe.', 422)
  if (enMinutes(nouveau.fin) <= enMinutes(nouveau.debut)) throw new ApiError('L’heure de fin doit être après l’heure de début.', 422)

  const creneau: Creneau = { id: `cr-${Date.now()}`, enseignantId: mc.enseignantId, ...nouveau }
  const conflits = conflitsAvec(base.creneaux, creneau)
  if (conflits.length > 0) {
    throw new ApiError([...new Set(conflits.map((c) => CONFLIT_LABEL[c.type]))].join(' ; ') + '.', 409)
  }
  ecrire.creneau(creneau)
  return reponse(detailler([creneau])[0], {}, 60)
}

export async function supprimerCreneau(acteur: Acteur, id: string): Promise<ApiResponse<{ id: string }>> {
  if (acteur.role !== 'DIRECTION') interdit('Seule la direction modifie l’emploi du temps.')
  if (!etat().creneaux.some((c) => c.id === id)) return introuvable('Cours introuvable.')
  ecrire.supprimerCreneau(id)
  return reponse({ id }, {}, 60)
}
