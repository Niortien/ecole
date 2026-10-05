import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EntreeNote, ModificationEnAttente } from '@/features/notes/types'
import type { SaisieAppel } from '@/features/presences/types'

interface FileAttenteState {
  modifications: ModificationEnAttente[]
  appels: SaisieAppel[]
  /** Ajoute une modification ; si la même cellule est déjà en attente, la nouvelle valeur la remplace. */
  ajouter: (entree: EntreeNote) => void
  retirer: (ids: string[]) => void
  /** Ajoute un appel ; un nouvel appel de la même classe, date et demi-journée remplace l'ancien. */
  ajouterAppel: (saisie: SaisieAppel) => void
  viderAppels: () => void
}

const cle = (e: EntreeNote) => `${e.classeId}|${e.matiereId}|${e.trimestre}|${e.matricule}|${e.index}`
const cleAppel = (a: SaisieAppel) => `${a.classeId}|${a.date}|${a.demiJournee}`

/**
 * File des modifications faites hors ligne (appel, notes) : conservée dans le téléphone, rejouée au retour du réseau.
 * Rien n'est jamais perdu : l'écran affiche « N modifications en attente » tant que la file n'est pas vide.
 */
export const useFileAttenteStore = create<FileAttenteState>()(
  persist(
    (set) => ({
      modifications: [],
      appels: [],
      ajouter: (entree) =>
        set((s) => ({
          modifications: [
            ...s.modifications.filter((m) => cle(m) !== cle(entree)),
            { ...entree, id: `${cle(entree)}|${Date.now()}`, creeeLe: new Date().toISOString() },
          ],
        })),
      retirer: (ids) => set((s) => ({ modifications: s.modifications.filter((m) => !ids.includes(m.id)) })),
      ajouterAppel: (saisie) => set((s) => ({ appels: [...s.appels.filter((a) => cleAppel(a) !== cleAppel(saisie)), saisie] })),
      viderAppels: () => set({ appels: [] }),
    }),
    { name: 'cartable-file-attente', skipHydration: true }
  )
)
