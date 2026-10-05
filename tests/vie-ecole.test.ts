import { test } from 'node:test'
import assert from 'node:assert/strict'
import { anneeScolaireActive, ajouterJours, dateLocaleISO, fenetresTrimestres, jourSemaine, trimestreActif } from '../lib/domain/calendrier.ts'
import { conflitsAvec, detecterConflits, heuresParSemaine, seChevauchent } from '../lib/domain/emploi-du-temps.ts'
import { echeances, messageRelance, numeroRecu, situationScolarite } from '../lib/domain/scolarite.ts'
import {
  absencesConsecutives,
  allergiesDuJour,
  attendusAuRepas,
  suggestionEscalade,
  tauxPresence,
} from '../lib/domain/vie-scolaire.ts'
import { bareme, cycleDe, examenDuNiveau, surVingt } from '../lib/domain/niveaux.ts'
import type { Creneau } from '../types/domain.ts'

const creneau = (id: string, over: Partial<Creneau> = {}): Creneau => ({
  id,
  classeId: 'c1',
  jour: 1,
  debut: '08:00',
  fin: '09:00',
  matiereId: 'm1',
  enseignantId: 'e1',
  salle: 'S1',
  ...over,
})

test('niveaux : cycle, barème, examen', () => {
  assert.equal(cycleDe('CM2'), 'PRIMAIRE')
  assert.equal(cycleDe('4E'), 'COLLEGE')
  assert.equal(cycleDe('TLE'), 'LYCEE')
  assert.equal(bareme('PRIMAIRE'), 10)
  assert.equal(bareme('LYCEE'), 20)
  assert.equal(surVingt(7, 'PRIMAIRE'), 14)
  assert.equal(examenDuNiveau('CM2'), 'CEPE')
  assert.equal(examenDuNiveau('3E'), 'BEPC')
  assert.equal(examenDuNiveau('TLE'), 'BAC')
  assert.equal(examenDuNiveau('5E'), null)
})

test('calendrier : année scolaire, trimestres, jour local', () => {
  assert.equal(anneeScolaireActive('2025-09-01'), '2025-2026')
  assert.equal(anneeScolaireActive('2026-06-30'), '2025-2026')
  assert.equal(anneeScolaireActive('2026-08-31'), '2025-2026')
  assert.equal(trimestreActif('2025-2026', '2025-10-05'), 1)
  assert.equal(trimestreActif('2025-2026', '2026-02-10'), 2)
  assert.equal(trimestreActif('2025-2026', '2026-05-01'), 3)
  assert.equal(trimestreActif('2025-2026', '2025-12-25'), null)
  assert.equal(fenetresTrimestres('2025-2026').length, 3)
  assert.throws(() => fenetresTrimestres('2025'))
  // 23 h 30 locale reste le même jour (toISOString donnerait le lendemain en UTC+2)
  assert.equal(dateLocaleISO(new Date(2026, 4, 13, 23, 30)), '2026-05-13')
  assert.equal(jourSemaine('2026-05-13'), 3) // mercredi
  assert.equal(jourSemaine('2026-05-17'), 7) // dimanche
  assert.equal(ajouterJours('2026-02-27', 2), '2026-03-01')
})

test('emploi du temps : chevauchements et conflits', () => {
  assert.equal(seChevauchent(creneau('a'), creneau('b', { debut: '08:30', fin: '09:30' })), true)
  assert.equal(seChevauchent(creneau('a'), creneau('b', { debut: '09:00', fin: '10:00' })), false)

  const base = [creneau('a')]
  const memeProf = conflitsAvec(base, creneau('b', { classeId: 'c2', salle: 'S2', debut: '08:30', fin: '09:30' }))
  assert.deepEqual(memeProf.map((c) => c.type), ['ENSEIGNANT'])
  const memeSalle = conflitsAvec(base, creneau('b', { classeId: 'c2', enseignantId: 'e2' }))
  assert.deepEqual(memeSalle.map((c) => c.type), ['SALLE'])
  const memeClasse = conflitsAvec(base, creneau('b', { enseignantId: 'e2', salle: 'S2' }))
  assert.deepEqual(memeClasse.map((c) => c.type), ['CLASSE'])
  assert.equal(conflitsAvec(base, creneau('b', { jour: 2 })).length, 0)
  assert.equal(detecterConflits([creneau('a'), creneau('b', { classeId: 'c2', enseignantId: 'e2', salle: 'S2' })]).length, 0)
  // Modifier un créneau existant ne le met pas en conflit avec lui-même
  assert.equal(conflitsAvec(base, creneau('a', { fin: '09:30' })).length, 0)
  assert.equal(heuresParSemaine([creneau('a'), creneau('b', { jour: 2, debut: '10:00', fin: '11:30' })], 'e1'), 2.5)
})

test('scolarité : lignes, retard, solde, prochaine échéance', () => {
  const frais = { niveau: '6E' as const, inscription: 50000, tranche: 100000, ape: 5000 }
  const annee = '2025-2026'
  const dates = echeances(annee)

  const debut = situationScolarite(frais, [], annee, '2025-09-01')
  assert.equal(debut.total, 355000)
  assert.equal(debut.statut, 'A_JOUR')
  assert.equal(debut.enRetard, 0)
  assert.equal(debut.prochaineEcheance?.objet, 'INSCRIPTION')

  const retard = situationScolarite(frais, [{ objet: 'INSCRIPTION', montant: 50000 }], annee, '2025-11-01')
  assert.equal(retard.statut, 'EN_RETARD')
  assert.equal(retard.enRetard, 105000) // APE (5 000) + tranche 1 (100 000)
  assert.equal(retard.lignes.find((l) => l.objet === 'TRANCHE_1')?.statut, 'EN_RETARD')

  const partiel = situationScolarite(frais, [{ objet: 'TRANCHE_1', montant: 40000 }], annee, dates.TRANCHE_1.replace('15', '01'))
  assert.equal(partiel.lignes.find((l) => l.objet === 'TRANCHE_1')?.statut, 'PARTIEL')

  const tout = situationScolarite(
    frais,
    [
      { objet: 'INSCRIPTION', montant: 50000 },
      { objet: 'APE', montant: 5000 },
      { objet: 'TRANCHE_1', montant: 100000 },
      { objet: 'TRANCHE_2', montant: 100000 },
      { objet: 'TRANCHE_3', montant: 100000 },
    ],
    annee,
    '2026-06-01',
  )
  assert.equal(tout.statut, 'SOLDE')
  assert.equal(tout.reste, 0)
  assert.equal(tout.prochaineEcheance, null)

  // Un trop-perçu sur une ligne n'efface pas une autre ligne
  const surplus = situationScolarite(frais, [{ objet: 'TRANCHE_1', montant: 150000 }], annee, '2025-09-01')
  assert.equal(surplus.paye, 100000)
  assert.equal(surplus.reste, 255000)
})

test('reçu et relance', () => {
  assert.equal(numeroRecu(2026, 123), 'R-2026-000123')
  const msg = messageRelance({ parent: 'M. Koné', eleve: 'Awa Koné', enRetard: 105000, ecole: 'Cartable' })
  assert.match(msg, /105\s000 FCFA/)
  assert.match(msg, /Awa Koné/)
})

test('présences : taux et absences consécutives', () => {
  assert.equal(tauxPresence([]), null)
  assert.equal(
    tauxPresence([{ statut: 'PRESENT' }, { statut: 'RETARD' }, { statut: 'ABSENT' }, { statut: 'ABSENT_JUSTIFIE' }]),
    66.7,
  )
  const jours = [
    { date: '2026-05-04', statut: 'PRESENT' as const },
    { date: '2026-05-05', statut: 'ABSENT' as const },
    { date: '2026-05-06', statut: 'ABSENT' as const },
    { date: '2026-05-06', statut: 'PRESENT' as const },
    { date: '2026-05-07', statut: 'ABSENT' as const },
  ]
  assert.equal(absencesConsecutives(jours), 3)
  assert.equal(absencesConsecutives([...jours, { date: '2026-05-08', statut: 'PRESENT' as const }]), 0)
})

test('discipline : suggestion d\'escalade jamais automatique pour un brouillon', () => {
  const av = (statut: 'BROUILLON' | 'VALIDEE') => ({ type: 'AVERTISSEMENT' as const, statut })
  assert.equal(suggestionEscalade([av('VALIDEE'), av('VALIDEE')]), null)
  assert.equal(suggestionEscalade([av('VALIDEE'), av('VALIDEE'), av('VALIDEE')]), 'BLAME')
  assert.equal(suggestionEscalade([av('VALIDEE'), av('VALIDEE'), av('BROUILLON')]), null)
  const blame = { type: 'BLAME' as const, statut: 'PARENT_INFORME' as const }
  assert.equal(suggestionEscalade([blame, blame]), 'EXCLUSION_TEMPORAIRE')
})

test('cantine : attendus du jour, abonnement payé, allergies', () => {
  const abos = [
    { matricule: 'A', jours: [1, 2, 3, 4, 5] as (1 | 2 | 3 | 4 | 5)[], allergies: ['arachide'], payeJusqua: '2026-05' },
    { matricule: 'B', jours: [1, 3] as (1 | 3)[], allergies: ['arachide', 'lait'], payeJusqua: '2026-05' },
    { matricule: 'C', jours: [3] as 3[], allergies: [], payeJusqua: '2026-04' }, // mois non payé
  ]
  const mercredi = attendusAuRepas(abos, '2026-05-13')
  assert.deepEqual(mercredi.map((a) => a.matricule), ['A', 'B'])
  assert.deepEqual(attendusAuRepas(abos, '2026-05-12').map((a) => a.matricule), ['A']) // mardi
  assert.deepEqual(allergiesDuJour(mercredi), [
    { allergie: 'arachide', nombre: 2 },
    { allergie: 'lait', nombre: 1 },
  ])
})
