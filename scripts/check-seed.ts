// Vérifie la cohérence du jeu de données de démonstration : volumes, emplois du temps sans conflit, rattachements.
import { genererSeed } from '../services/mock-db/seed'
import { detecterConflits, heuresParSemaine } from '../lib/domain/emploi-du-temps'

const debut = performance.now()
const seed = genererSeed()
const duree = Math.round(performance.now() - debut)

const eleves = new Set(seed.eleves.map((e) => e.matricule))
const classes = new Set(seed.classes.map((c) => c.id))
const problemes: string[] = []

if (seed.eleves.length < 350) problemes.push(`Trop peu d'élèves : ${seed.eleves.length}`)
const conflits = detecterConflits(seed.creneaux)
if (conflits.length > 0) problemes.push(`${conflits.length} conflits d'emploi du temps`)
for (const e of seed.eleves) if (!classes.has(e.classeId)) problemes.push(`Élève ${e.matricule} sans classe`)
for (const n of seed.notes) if (!eleves.has(n.matricule)) problemes.push(`Note ${n.id} sans élève`)
for (const p of seed.paiements) if (!eleves.has(p.matricule)) problemes.push(`Paiement ${p.id} sans élève`)
if (new Set(seed.eleves.map((e) => e.matricule)).size !== seed.eleves.length) problemes.push('Matricules en double')
for (const u of seed.utilisateurs) {
  if (u.role === 'PARENT') for (const m of u.enfants ?? []) if (!eleves.has(m)) problemes.push(`Parent ${u.id} : enfant ${m} inconnu`)
}
for (const e of seed.eleves) {
  for (const id of e.parentIds) if (!seed.utilisateurs.some((u) => u.id === id)) problemes.push(`Élève ${e.matricule} : parent ${id} inconnu`)
}
const surcharges = seed.utilisateurs.filter((u) => u.role === 'ENSEIGNANT' && heuresParSemaine(seed.creneaux, u.id) > 24)
if (surcharges.length > 0) problemes.push(`${surcharges.length} enseignants à plus de 24 h/semaine`)

const classesSansCours = seed.classes.filter((c) => seed.creneaux.filter((x) => x.classeId === c.id).length === 0)
if (classesSansCours.length > 0) problemes.push(`${classesSansCours.length} classes sans emploi du temps`)

console.log(
  JSON.stringify(
    {
      dureeGenerationMs: duree,
      classes: seed.classes.length,
      eleves: seed.eleves.length,
      enseignants: seed.utilisateurs.filter((u) => u.role === 'ENSEIGNANT').length,
      parents: seed.utilisateurs.filter((u) => u.role === 'PARENT').length,
      notes: seed.notes.length,
      presences: seed.presences.length,
      paiements: seed.paiements.length,
      sanctions: seed.sanctions.length,
      creneaux: seed.creneaux.length,
      abonnementsCantine: seed.abonnements.length,
      conflitsEmploiDuTemps: conflits.length,
    },
    null,
    2
  )
)
if (problemes.length > 0) {
  console.error('\nProblèmes :\n- ' + [...new Set(problemes)].slice(0, 20).join('\n- '))
  process.exit(1)
}
console.log('\nJeu de données cohérent.')
