import {
  IconCalendarWeek,
  IconCash,
  IconCertificate,
  IconChecklist,
  IconGavel,
  IconSchool,
  IconSoup,
  IconUsers,
} from '@tabler/icons-react'
import { Reveal } from '@/components/motion/reveal'

export const MODULES = [
  { icon: IconUsers, nom: 'Élèves', texte: 'Une fiche unique par matricule : notes, discipline, scolarité et cantine au même endroit.' },
  { icon: IconSchool, nom: 'Notes et moyennes', texte: 'Saisie en grille au clavier, moyennes pondérées, rangs et mentions calculés pour vous.' },
  { icon: IconCertificate, nom: 'Bulletins', texte: 'Appréciations suggérées, décision de passage, impression A4 et envoi WhatsApp.' },
  { icon: IconChecklist, nom: 'Présences', texte: 'Appel du matin et du soir, retards, absences justifiées, alertes après trois jours.' },
  { icon: IconGavel, nom: 'Discipline', texte: 'Avertissement, blâme, retenue, exclusion : déclarés, validés, puis le parent est informé.' },
  { icon: IconCalendarWeek, nom: 'Emplois du temps', texte: 'Grille de la semaine par classe et par enseignant, conflits de salle ou de professeur refusés.' },
  { icon: IconCash, nom: 'Scolarité', texte: 'Inscription, tranches et APE, soldes, impayés, reçus numérotés et relances.' },
  { icon: IconSoup, nom: 'Cantine', texte: 'Menu de la semaine, abonnements, effectif du jour pour la cuisine et allergies signalées.' },
]

export function Modules() {
  return (
    <section className="border-y border-trait bg-papier-2 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 data-reveal className="max-w-2xl text-4xl leading-tight font-bold sm:text-5xl">
            Tout le cycle scolaire, au même endroit.
          </h2>
          <p data-reveal className="mt-4 max-w-xl text-lg text-encre-doux">
            Huit modules qui partagent la même fiche élève : on ne ressaisit jamais la même information.
          </p>
        </Reveal>
        <Reveal as="ul" stagger={0.05} className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-trait bg-trait sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map(({ icon: Icone, nom, texte }) => (
            <li key={nom} data-reveal className="bg-surface p-6">
              <Icone size={26} className="text-ardoise" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">{nom}</h3>
              <p className="mt-1.5 text-sm text-encre-doux">{texte}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
