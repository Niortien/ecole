import { interdit, reponse, type ApiResponse } from '@/lib/api'
import type { ParamsCalcul } from '@/lib/domain/params'
import { etat, ecrire } from '@/services/mock-db/store'
import type { Acteur } from '@/services/mock-db/acces'
import type { Frais } from '@/types/domain'

export interface Parametres {
  calcul: ParamsCalcul
  frais: Frais[]
}

export async function getParametres(acteur: Acteur): Promise<ApiResponse<Parametres>> {
  if (acteur.role !== 'DIRECTION') interdit('Les paramètres sont réservés à la direction.')
  const base = etat()
  return reponse({ calcul: base.params, frais: base.frais }, {}, 50)
}

export async function enregistrerParametres(acteur: Acteur, calcul: ParamsCalcul): Promise<ApiResponse<ParamsCalcul>> {
  if (acteur.role !== 'DIRECTION') interdit('Les paramètres sont réservés à la direction.')
  ecrire.params(calcul)
  return reponse(calcul, {}, 60)
}
