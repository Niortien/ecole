'use client'

import { useQuery } from '@tanstack/react-query'
import { useActeur } from '@/hooks/use-acteur'
import { getBulletin, getBulletinsClasse, getBulletinsComplets, getEnfants, type PeriodeBulletin } from '../api/bulletins-api'

export const bulletinsKeys = {
  all: ['bulletins'] as const,
  un: (userId: string, matricule: string, periode: PeriodeBulletin) => ['bulletins', 'un', userId, matricule, periode] as const,
  classe: (userId: string, classeId: string, periode: PeriodeBulletin) => ['bulletins', 'classe', userId, classeId, periode] as const,
  enfants: (userId: string) => ['bulletins', 'enfants', userId] as const,
}

export function useBulletin(matricule: string, periode: PeriodeBulletin) {
  const acteur = useActeur()
  return useQuery({
    queryKey: bulletinsKeys.un(acteur?.userId ?? '', matricule, periode),
    queryFn: () => getBulletin(acteur!, matricule, periode),
    enabled: !!acteur && !!matricule,
    retry: false,
  })
}

export function useBulletinsClasse(classeId: string, periode: PeriodeBulletin) {
  const acteur = useActeur()
  return useQuery({
    queryKey: bulletinsKeys.classe(acteur?.userId ?? '', classeId, periode),
    queryFn: () => getBulletinsClasse(acteur!, classeId, periode),
    enabled: !!acteur && acteur.role !== 'PARENT' && !!classeId,
    retry: false,
  })
}

export function useEnfants() {
  const acteur = useActeur()
  return useQuery({
    queryKey: bulletinsKeys.enfants(acteur?.userId ?? ''),
    queryFn: () => getEnfants(acteur!),
    enabled: acteur?.role === 'PARENT',
  })
}

/** Tous les bulletins d'une classe, chargés seulement quand l'impression groupée est demandée. */
export function useBulletinsComplets(classeId: string, periode: PeriodeBulletin, actif: boolean) {
  const acteur = useActeur()
  return useQuery({
    queryKey: ['bulletins', 'complets', acteur?.userId ?? '', classeId, periode] as const,
    queryFn: () => getBulletinsComplets(acteur!, classeId, periode),
    enabled: !!acteur && actif && !!classeId,
    retry: false,
  })
}
