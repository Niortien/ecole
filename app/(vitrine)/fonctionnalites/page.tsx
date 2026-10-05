import type { Metadata } from 'next'
import { DemoCta } from '@/components/vitrine/demo-cta'
import { MODULES } from '@/components/vitrine/modules'
import { PageTitre } from '@/components/vitrine/page-titre'
import { Reveal } from '@/components/motion/reveal'

export const metadata: Metadata = {
  title: 'Fonctionnalités',
  description:
    'Élèves, notes et moyennes, bulletins, présences, discipline, emplois du temps, scolarité et cantine : les huit modules de Cartable pour les écoles de Côte d’Ivoire.',
  alternates: { canonical: '/fonctionnalites' },
}

const DETAILS: Record<string, string[]> = {
  Élèves: ['Fiche en 5 onglets : infos, notes, discipline, scolarité, cantine', 'Recherche par nom ou matricule, filtre par classe', 'Parents rattachés à leurs enfants'],
  'Notes et moyennes': ['Interrogations, devoirs et composition', 'AJ (exclue) et ANJ (zéro) gérées', 'Rang avec ex æquo, mention, appréciation suggérée'],
  Bulletins: ['Moyennes par matière avec coefficients', 'Décision de passage de fin d’année', 'Impression A4 et partage WhatsApp'],
  Présences: ['Appel du matin et du soir', 'Retards et absences justifiées', 'Alerte après trois jours d’absence de suite'],
  Discipline: ['Avertissement, blâme, retenue, exclusions', 'Déclarée, validée, parent informé', 'Suggestion d’escalade, jamais automatique'],
  'Emplois du temps': ['Grille par classe, par enseignant', 'Refus d’un cours qui chevauche une classe, un enseignant ou une salle', 'Heures par semaine de chaque enseignant'],
  Scolarité: ['Frais par niveau : inscription, 3 tranches, APE', 'Impayés en retard et prochaine échéance', 'Reçus numérotés, relances par message'],
  Cantine: ['Menu de la semaine', 'Abonnement par jours, payé au mois', 'Liste du jour pour la cuisine, allergies en tête'],
}

export default function FonctionnalitesPage() {
  return (
    <>
      <PageTitre
        titre="Huit modules, une seule fiche élève."
        intro="Chaque module lit et écrit sur la même fiche : le matricule relie les notes, la discipline, la scolarité et la cantine."
      />
      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <Reveal as="ul" stagger={0.06} className="grid gap-4 md:grid-cols-2">
          {MODULES.map(({ icon: Icone, nom, texte }) => (
            <li key={nom} data-reveal className="rounded-[1.25rem] border border-trait bg-surface p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ardoise-pale text-ardoise">
                  <Icone size={22} aria-hidden="true" />
                </span>
                <h2 className="text-2xl font-semibold">{nom}</h2>
              </div>
              <p className="mt-3 text-encre-doux">{texte}</p>
              <ul className="mt-4 space-y-2 border-t border-trait pt-4 text-sm">
                {(DETAILS[nom] ?? []).map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crayon" />
                    {d}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </Reveal>
      </section>
      <DemoCta />
    </>
  )
}
