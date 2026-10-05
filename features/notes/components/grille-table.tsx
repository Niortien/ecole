'use client'

import { useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { afficherNote, moyenneMatiere, parserSaisieNote } from '@/lib/domain/notes'
import { decimal } from '@/lib/format'
import { messageErreur } from '@/lib/api'
import { useActeur } from '@/hooks/use-acteur'
import { useFileAttenteStore } from '@/store/file-attente-store'
import { enregistrerNote } from '../api/notes-api'
import type { EntreeNote, Grille } from '../types'
import { CelluleNote } from './cellule-note'

const TYPE_LABEL = { INTERRO: 'Interro', DEVOIR: 'Devoir', COMPOSITION: 'Composition' } as const

export type EtatSauvegarde = 'repos' | 'enCours' | 'enregistre' | 'enAttente' | 'erreur'

interface GrilleTableProps {
  grille: Grille
  onEtat: (etat: EtatSauvegarde) => void
  /** Nombre de notes saisies pas encore validées (mis à jour à chaque enregistrement). */
  onNonValidees: (nombre: number) => void
}

const cle = (matricule: string, index: number) => `${matricule}|${index}`

/** Étiquettes des colonnes : « Interro 1 », « Interro 2 », « Devoir », « Composition ». */
function etiquettesColonnes(grille: Grille): string[] {
  const compteur: Record<string, number> = {}
  const total = grille.colonnes.reduce<Record<string, number>>((t, c) => ({ ...t, [c.type]: (t[c.type] ?? 0) + 1 }), {})
  return grille.colonnes.map((c) => {
    compteur[c.type] = (compteur[c.type] ?? 0) + 1
    return total[c.type] > 1 ? `${TYPE_LABEL[c.type]} ${compteur[c.type]}` : TYPE_LABEL[c.type]
  })
}

export function GrilleTable({ grille, onEtat, onNonValidees }: GrilleTableProps) {
  const acteur = useActeur()
  const queryClient = useQueryClient()
  const ajouterEnAttente = useFileAttenteStore((s) => s.ajouter)
  const conteneur = useRef<HTMLDivElement>(null)
  // Dernier texte envoyé par cellule : évite d'enregistrer deux fois (Entrée puis perte de focus).
  const envoye = useRef<Record<string, string>>({})

  const initiales = useMemo(() => {
    const valeurs: Record<string, string> = {}
    for (const ligne of grille.lignes) {
      grille.colonnes.forEach((c, i) => {
        const note = ligne.notes[i]
        valeurs[cle(ligne.matricule, c.index)] = note ? afficherNote(note.valeur) : ''
      })
    }
    return valeurs
  }, [grille])

  const [valeurs, setValeurs] = useState(initiales)
  const [enregistrees, setEnregistrees] = useState(initiales)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [nonValidees, setNonValidees] = useState(
    () => new Set(grille.lignes.flatMap((l) => l.notes.filter((n) => n && !n.publiee).map((n) => cle(l.matricule, Number(n!.id.split('-').pop())))))
  )
  const libelles = etiquettesColonnes(grille)

  function aller(ligne: number, colonne: number, direction: 'haut' | 'bas') {
    const cible = conteneur.current?.querySelector<HTMLInputElement>(`[data-cell="${ligne + (direction === 'bas' ? 1 : -1)}-${colonne}"]`)
    cible?.focus()
  }

  async function valider(matricule: string, nom: string, index: number, type: EntreeNote['type']) {
    if (!acteur) return
    const k = cle(matricule, index)
    const texte = valeurs[k] ?? ''
    if (texte === (envoye.current[k] ?? enregistrees[k] ?? '')) return

    const entree: EntreeNote = { matricule, classeId: grille.classe.id, matiereId: grille.matiere.id, trimestre: grille.trimestre, index, type, valeur: null }
    const precedente = enregistrees[k] ?? ''

    if (texte.trim() !== '') {
      const lu = parserSaisieNote(texte, grille.bareme)
      if (!lu.ok) {
        setErreurs((e) => ({ ...e, [k]: lu.erreur }))
        toast.error(`${nom} : ${lu.erreur}`, { id: `err-${k}` })
        return
      }
      entree.valeur = lu.valeur
    }
    envoye.current[k] = texte
    setErreurs((e) => {
      const { [k]: _retirée, ...reste } = e
      void _retirée
      return reste
    })

    try {
      if (!navigator.onLine) {
        ajouterEnAttente(entree)
        onEtat('enAttente')
      } else {
        onEtat('enCours')
        await enregistrerNote(acteur, entree)
        onEtat('enregistre')
        // Bulletins, fiches élèves et accueil dépendent des notes : on les relira à leur prochaine ouverture.
        for (const cle of ['bulletins', 'eleves', 'accueil']) void queryClient.invalidateQueries({ queryKey: [cle] })
      }
      setEnregistrees((e) => ({ ...e, [k]: entree.valeur ? afficherNote(entree.valeur) : '' }))
      if (entree.valeur) {
        const suivant = new Set(nonValidees).add(k)
        setNonValidees(suivant)
        onNonValidees(suivant.size)
      }
      if (!entree.valeur && precedente !== '') {
        const ancienne = precedente
        toast(
          (t) => (
            <span className="flex items-center gap-3">
              Note de {nom} supprimée
              <button
                type="button"
                className="font-semibold underline"
                onClick={async () => {
                  toast.dismiss(t.id)
                  const relu = parserSaisieNote(ancienne, grille.bareme)
                  if (relu.ok) {
                    await enregistrerNote(acteur, { ...entree, valeur: relu.valeur })
                    setValeurs((v) => ({ ...v, [k]: ancienne }))
                    setEnregistrees((e) => ({ ...e, [k]: ancienne }))
                  }
                }}
              >
                Annuler
              </button>
            </span>
          ),
          { duration: 6000 }
        )
      }
    } catch (e) {
      envoye.current[k] = precedente
      onEtat('erreur')
      setErreurs((er) => ({ ...er, [k]: messageErreur(e) }))
      toast.error(messageErreur(e))
    }
  }

  const moyennes = grille.lignes.map((ligne) => {
    const evaluations = grille.colonnes.flatMap((c) => {
      const lu = parserSaisieNote(valeurs[cle(ligne.matricule, c.index)] ?? '', grille.bareme)
      return lu.ok ? [{ type: c.type, valeur: lu.valeur }] : []
    })
    return moyenneMatiere(evaluations)
  })
  const notees = moyennes.filter((m): m is number => m !== null)
  const moyenneClasse = notees.length ? notees.reduce((t, m) => t + m, 0) / notees.length : null

  return (
    <div ref={conteneur} className="overflow-x-auto rounded-[1.25rem] border border-trait bg-surface">
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="sr-only">
          Notes de {grille.matiere.libelle} en {grille.classe.libelle}, trimestre {grille.trimestre}
        </caption>
        <thead className="border-b border-trait bg-papier-2/60 text-left text-xs text-encre-doux">
          <tr>
            <th scope="col" className="sticky left-0 z-10 bg-papier-2 px-4 py-3 font-medium">Élève</th>
            {grille.colonnes.map((c, i) => (
              <th key={c.index} scope="col" className="px-2 py-3 text-center font-medium">
                {libelles[i]}
                <span className="block font-normal text-encre-doux/80">/{grille.bareme}</span>
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-right font-medium">Moyenne</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-trait">
          {grille.lignes.map((ligne, r) => (
            <tr key={ligne.matricule}>
              <th scope="row" className="sticky left-0 z-10 min-w-40 bg-surface px-4 py-2 text-left font-medium">
                {ligne.nom} {ligne.prenoms}
              </th>
              {grille.colonnes.map((c, i) => {
                const k = cle(ligne.matricule, c.index)
                return (
                  <td key={c.index} className="px-2 py-1.5">
                    <div className="flex justify-center">
                      <CelluleNote
                        valeur={valeurs[k] ?? ''}
                        onChange={(t) => setValeurs((v) => ({ ...v, [k]: t }))}
                        onValider={() => void valider(ligne.matricule, `${ligne.prenoms} ${ligne.nom}`, c.index, c.type)}
                        onAller={(d) => aller(r, i, d)}
                        etiquette={`Note de ${ligne.prenoms} ${ligne.nom}, ${libelles[i]}`}
                        ligne={r}
                        colonne={i}
                        erreur={erreurs[k]}
                        disabled={!grille.modifiable}
                        nonValidee={nonValidees.has(k) && (valeurs[k] ?? '') !== ''}
                      />
                    </div>
                  </td>
                )
              })}
              <td className="px-4 py-2 text-right font-semibold tabular-nums">{decimal(moyennes[r])}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-trait bg-papier-2/60">
          <tr>
            <th scope="row" className="sticky left-0 bg-papier-2 px-4 py-3 text-left font-semibold">Moyenne de la classe</th>
            <td colSpan={grille.colonnes.length} />
            <td className="px-4 py-3 text-right font-display text-lg font-bold tabular-nums">{decimal(moyenneClasse)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
