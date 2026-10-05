import { IconBuildingBank, IconCash, IconChalkboard, IconHeartHandshake, IconShieldCheck } from '@tabler/icons-react'
import { Reveal } from '@/components/motion/reveal'

const ROLES = [
  {
    icon: IconBuildingBank,
    nom: 'Direction',
    texte: 'Voit d’un coup d’œil ce qui demande une décision aujourd’hui.',
    exemples: ['Appels non faits ce matin', 'Impayés en retard par classe', 'Sanctions à valider', 'Bulletins à finaliser'],
  },
  {
    icon: IconChalkboard,
    nom: 'Enseignant',
    texte: 'Saisit notes et appel en quelques gestes, même sans réseau.',
    exemples: ['Mes classes du jour', 'Notes en grille, au clavier', 'Appel enregistré hors ligne', 'Appréciation suggérée'],
  },
  {
    icon: IconShieldCheck,
    nom: 'Éducateur',
    texte: 'Suit la présence et la discipline sans papier.',
    exemples: ['Présences et retards du jour', 'Sanctions à déclarer', 'Élèves absents 3 jours de suite', 'Parents à informer'],
  },
  {
    icon: IconCash,
    nom: 'Économe',
    texte: 'Encaisse, édite les reçus et relance poliment.',
    exemples: ['Encaissements du jour', 'Soldes par élève', 'Reçus à imprimer', 'Relance par WhatsApp'],
  },
  {
    icon: IconHeartHandshake,
    nom: 'Parent',
    texte: 'Un écran simple pour savoir comment va son enfant.',
    exemples: ['Notes validées par l’enseignant', 'Bulletin à télécharger', 'Solde à payer en Mobile Money', 'Menu de la cantine'],
  },
]

export function Roles() {
  return (
    <section className="border-y border-trait bg-papier-2 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 data-reveal className="max-w-2xl text-4xl leading-tight font-bold sm:text-5xl">
            Chacun voit ce qui le concerne, rien d’autre.
          </h2>
          <p data-reveal className="mt-4 max-w-xl text-lg text-encre-doux">
            À l’ouverture, chaque profil arrive sur sa propre « salle de situation » : les choses à faire aujourd’hui,
            pas un menu de vingt modules.
          </p>
        </Reveal>

        <Reveal as="ul" stagger={0.08} className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {ROLES.map(({ icon: Icone, nom, texte, exemples }, index) => (
            <li key={nom} data-reveal className={`rounded-[1.25rem] border border-trait bg-surface p-6 ${index < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ardoise-pale text-ardoise">
                <Icone size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-2xl font-semibold">{nom}</h3>
              <p className="mt-1 text-encre-doux">{texte}</p>
              <ul className="mt-4 space-y-2 border-t border-trait pt-4 text-sm">
                {exemples.map((e) => (
                  <li key={e} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crayon" />
                    {e}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
