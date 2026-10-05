'use client'

import { useRef } from 'react'
import { useGsapScope } from '@/hooks/use-gsap'
import { afficherNote, appreciationSuggeree, mention, moyenneGenerale } from '@/lib/domain/notes'
import { MENTION_LABEL } from '@/lib/domain/params'

// Exemple fictif : les chiffres affichés sont calculés avec la vraie logique de l'application.
const LIGNES = [
  { matiere: 'Français', note: 14.5, coefficient: 4 },
  { matiere: 'Mathématiques', note: 12, coefficient: 4 },
  { matiere: 'Anglais', note: 16, coefficient: 3 },
  { matiere: 'Histoire-Géographie', note: 13, coefficient: 2 },
  { matiere: 'SVT', note: 11.5, coefficient: 2 },
  { matiere: 'EPS', note: 15, coefficient: 1 },
]

const MOYENNE = moyenneGenerale(LIGNES.map((l) => ({ moyenne: l.note, coefficient: l.coefficient })))
const MENTION = MENTION_LABEL[mention(MOYENNE, 20)]
const APPRECIATION = appreciationSuggeree(MOYENNE, 20)

const format = (valeur: number) => afficherNote({ type: 'NOTE', valeur })

/** Une page de bulletin qui se remplit : le moment d'animation signature de la vitrine. */
export function HeroCahier() {
  const ref = useRef<HTMLDivElement>(null)

  useGsapScope(ref, ({ gsap, reduced }) => {
    const root = ref.current
    if (!root) return

    if (reduced) {
      gsap.from(root, { opacity: 0, duration: 0.8 })
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from(root, { opacity: 0, y: 24, rotate: -1.5, duration: 0.9 })
      .from('[data-ligne]', { opacity: 0, x: -14, duration: 0.5, stagger: 0.12 }, 0.5)

    root.querySelectorAll<HTMLElement>('[data-note]').forEach((cellule, index) => {
      const cible = Number(cellule.dataset.note)
      const compteur = { v: 0 }
      cellule.textContent = format(0)
      tl.to(
        compteur,
        {
          v: cible,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => {
            cellule.textContent = format(Math.round(compteur.v * 2) / 2)
          },
          onComplete: () => {
            cellule.textContent = format(cible)
          },
        },
        0.55 + index * 0.12
      )
    })

    tl.from('[data-moyenne]', { opacity: 0, scale: 0.9, duration: 0.5 }, '>-0.2')
      .fromTo(
        '[data-annotation]',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power1.inOut' },
        '>0.1'
      )
      .from('[data-souligne]', { scaleX: 0, transformOrigin: '0 50%', duration: 0.5 }, '>-0.3')
  })

  return (
    <div
      ref={ref}
      className="lignes-cahier relative w-full max-w-md rounded-[1.25rem] border border-trait bg-surface p-6 pl-12 shadow-[0_18px_40px_-24px_rgba(27,39,51,0.35)] sm:p-8 sm:pl-14"
    >
      {/* Marge rouge du cahier */}
      <span aria-hidden="true" className="absolute inset-y-0 left-8 w-px bg-stylo/40 sm:left-10" />

      <p className="text-xs text-encre-doux">Exemple fictif de bulletin</p>
      <p className="mt-1 font-display text-xl font-semibold">Awa K. · 4e B · 2e trimestre</p>

      <table className="mt-5 w-full text-sm">
        <caption className="sr-only">Notes par matière</caption>
        <thead className="sr-only">
          <tr>
            <th>Matière</th>
            <th>Coefficient</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {LIGNES.map((l) => (
            <tr key={l.matiere} data-ligne className="h-[1.8rem] align-baseline">
              <td className="pr-3">{l.matiere}</td>
              <td className="pr-3 text-xs text-encre-doux">coef. {l.coefficient}</td>
              <td data-note={l.note} className="text-right font-semibold tabular-nums">
                {format(l.note)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-moyenne className="mt-5 flex items-baseline justify-between border-t border-encre/70 pt-3">
        <span className="font-semibold">Moyenne générale</span>
        <span className="font-display text-3xl font-bold tabular-nums">
          {format(MOYENNE ?? 0)}
          <span className="text-base font-medium text-encre-doux"> /20</span>
        </span>
      </div>
      <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-ardoise">
        <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-crayon" />
        {MENTION}
      </p>

      <div className="relative mt-5">
        <p data-annotation className="annotation text-lg leading-snug">
          {APPRECIATION}
        </p>
        <span data-souligne aria-hidden="true" className="mt-2 block h-0.5 w-40 rounded-full bg-stylo/60" />
      </div>
    </div>
  )
}
