import { reponse, type ApiResponse } from '@/lib/api'
import { cycleDe, niveauInfo } from '@/lib/domain/niveaux'
import { etat } from '@/services/mock-db/store'
import { classesVisibles, type Acteur } from '@/services/mock-db/acces'
import type { ClasseResume } from '../types'

export async function getClasses(acteur: Acteur): Promise<ApiResponse<ClasseResume[]>> {
  const base = etat()
  const visibles = classesVisibles(base, acteur)
  const liste = base.classes
    .filter((c) => !visibles || visibles.includes(c.id))
    .sort((a, b) => niveauInfo(a.niveau).ordre - niveauInfo(b.niveau).ordre || a.libelle.localeCompare(b.libelle, 'fr'))
    .map<ClasseResume>((classe) => {
      const principal = base.utilisateurs.find((u) => u.id === classe.principalId)
      return {
        classe,
        cycle: cycleDe(classe.niveau),
        effectif: base.eleves.filter((e) => e.classeId === classe.id).length,
        principal: principal ? `${principal.prenoms} ${principal.nom}` : '—',
        matieresEnseignees:
          acteur.role === 'ENSEIGNANT'
            ? base.matieresClasses
                .filter((mc) => mc.classeId === classe.id && mc.enseignantId === acteur.userId)
                .map((mc) => ({ matiereId: mc.matiereId, libelle: base.matieres.find((m) => m.id === mc.matiereId)?.libelle ?? mc.matiereId }))
            : undefined,
      }
    })
  return reponse(liste)
}
