import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  afficherNote,
  appreciationSuggeree,
  classer,
  decisionPassage,
  mention,
  moyenneAnnuelle,
  moyenneGenerale,
  moyenneMatiere,
  parserSaisieNote,
} from '../lib/domain/notes.ts'
import { PARAMS_PAR_DEFAUT } from '../lib/domain/params.ts'

test('saisie : note, virgule, AJ, ANJ', () => {
  assert.deepEqual(parserSaisieNote('14,5', 20), { ok: true, valeur: { type: 'NOTE', valeur: 14.5 } })
  assert.deepEqual(parserSaisieNote(' aj ', 20), { ok: true, valeur: { type: 'AJ' } })
  assert.deepEqual(parserSaisieNote('anj', 10), { ok: true, valeur: { type: 'ANJ' } })
})

test('saisie : jamais de perte silencieuse, un message explique le refus', () => {
  const trop = parserSaisieNote('11', 10)
  assert.equal(trop.ok, false)
  if (!trop.ok) assert.match(trop.erreur, /Maximum 10/)
  assert.equal(parserSaisieNote('abc', 20).ok, false)
  assert.equal(parserSaisieNote('-1', 20).ok, false)
  assert.equal(parserSaisieNote('', 20).ok, false)
})

test('affichage : virgule française et tirets', () => {
  assert.equal(afficherNote({ type: 'NOTE', valeur: 12.5 }), '12,5')
  assert.equal(afficherNote({ type: 'ANJ' }), 'ANJ')
  assert.equal(afficherNote(null), '—')
})

test('moyenne de matière : interros/devoirs et composition à parts égales', () => {
  const m = moyenneMatiere([
    { type: 'INTERRO', valeur: { type: 'NOTE', valeur: 10 } },
    { type: 'DEVOIR', valeur: { type: 'NOTE', valeur: 14 } },
    { type: 'COMPOSITION', valeur: { type: 'NOTE', valeur: 16 } },
  ])
  assert.equal(m, 14) // (12 + 16) / 2
})

test('moyenne de matière : AJ exclue, ANJ compte zéro, composante seule acceptée', () => {
  assert.equal(
    moyenneMatiere([
      { type: 'INTERRO', valeur: { type: 'NOTE', valeur: 12 } },
      { type: 'DEVOIR', valeur: { type: 'AJ' } },
    ]),
    12,
  )
  assert.equal(
    moyenneMatiere([
      { type: 'INTERRO', valeur: { type: 'NOTE', valeur: 12 } },
      { type: 'DEVOIR', valeur: { type: 'ANJ' } },
    ]),
    6,
  )
  assert.equal(moyenneMatiere([{ type: 'COMPOSITION', valeur: { type: 'NOTE', valeur: 9 } }]), 9)
  assert.equal(moyenneMatiere([{ type: 'INTERRO', valeur: { type: 'AJ' } }]), null)
  assert.equal(moyenneMatiere([]), null)
})

test('ANJ ignorée si le réglage de l\'école le demande', () => {
  const params = { ...PARAMS_PAR_DEFAUT, anjCompteZero: false }
  assert.equal(
    moyenneMatiere(
      [
        { type: 'INTERRO', valeur: { type: 'NOTE', valeur: 12 } },
        { type: 'DEVOIR', valeur: { type: 'ANJ' } },
      ],
      params,
    ),
    12,
  )
})

test('moyenne générale pondérée, matières non notées ignorées', () => {
  assert.equal(
    moyenneGenerale([
      { moyenne: 10, coefficient: 2 },
      { moyenne: 16, coefficient: 4 },
      { moyenne: null, coefficient: 5 },
    ]),
    14, // (20 + 64) / 6
  )
  assert.equal(moyenneGenerale([{ moyenne: null, coefficient: 3 }]), null)
  assert.equal(moyenneGenerale([]), null)
})

test('moyenne annuelle = moyenne des trimestres disponibles', () => {
  assert.equal(moyenneAnnuelle([12, 14, null]), 13)
  assert.equal(moyenneAnnuelle([null, null, null]), null)
})

test('classement avec ex æquo (1, 1, 3) et non classés', () => {
  const rangs = classer([
    { matricule: 'A', moyenne: 15 },
    { matricule: 'B', moyenne: 15 },
    { matricule: 'C', moyenne: 12 },
    { matricule: 'D', moyenne: null },
  ])
  assert.equal(rangs.get('A'), 1)
  assert.equal(rangs.get('B'), 1)
  assert.equal(rangs.get('C'), 3)
  assert.equal(rangs.get('D'), null)
})

test('mentions : le seuil suit le barème (10 au primaire, 20 ensuite)', () => {
  assert.equal(mention(16, 20), 'FELICITATIONS')
  assert.equal(mention(8, 10), 'FELICITATIONS')
  assert.equal(mention(14, 20), 'ENCOURAGEMENTS')
  assert.equal(mention(12, 20), 'TABLEAU_HONNEUR')
  assert.equal(mention(6, 10), 'TABLEAU_HONNEUR')
  assert.equal(mention(10, 20), 'AUCUNE')
  assert.equal(mention(7, 20), 'AVERTISSEMENT_TRAVAIL')
  assert.equal(mention(null, 20), 'AUCUNE')
})

test('passage : admis, redoublement, passage obligé au primaire', () => {
  assert.equal(decisionPassage(10, 20, 'COLLEGE', 0)?.decision, 'ADMIS')
  assert.equal(decisionPassage(9.99, 20, 'COLLEGE', 0)?.decision, 'REDOUBLE')
  assert.equal(decisionPassage(5, 10, 'PRIMAIRE', 0)?.decision, 'ADMIS')
  assert.equal(decisionPassage(4.5, 10, 'PRIMAIRE', 0)?.decision, 'REDOUBLE')
  assert.equal(decisionPassage(4.5, 10, 'PRIMAIRE', 2)?.decision, 'PASSAGE_OBLIGE')
  assert.equal(decisionPassage(4.5, 20, 'LYCEE', 5)?.decision, 'REDOUBLE')
  assert.equal(decisionPassage(null, 20, 'LYCEE', 0), null)
})

test('appréciation suggérée : toujours un texte, ton bienveillant', () => {
  for (const m of [null, 3, 7, 10, 12, 14, 18]) {
    assert.ok(appreciationSuggeree(m, 20).length > 10)
  }
})
