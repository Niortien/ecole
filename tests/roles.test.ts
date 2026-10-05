import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NAVIGATION, estRouteApplication, navigationDuRole, peutAcceder } from '../lib/roles.ts'

test('chaque rôle voit au moins son accueil et l’emploi du temps', () => {
  for (const role of ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR', 'ECONOME', 'PARENT'] as const) {
    const hrefs = navigationDuRole(role).map((n) => n.href)
    assert.ok(hrefs.includes('/accueil'), role)
    assert.ok(hrefs.includes('/emplois-du-temps'), role)
  }
})

test('chaque entrée de menu est accessible aux rôles qu’elle déclare, et seulement à eux', () => {
  for (const entree of NAVIGATION) {
    for (const role of ['DIRECTION', 'ENSEIGNANT', 'EDUCATEUR', 'ECONOME', 'PARENT'] as const) {
      assert.equal(peutAcceder(role, entree.href), entree.roles.includes(role), `${role} ${entree.href}`)
    }
  }
})

test('les sous-chemins héritent des droits ; le parent ouvre la fiche d’un élève', () => {
  assert.equal(peutAcceder('ECONOME', '/scolarite/paiements'), true)
  assert.equal(peutAcceder('PARENT', '/notes'), false)
  assert.equal(peutAcceder('PARENT', '/eleves'), false)
  assert.equal(peutAcceder('PARENT', '/eleves/25123456A'), true)
  assert.equal(peutAcceder('ENSEIGNANT', '/parametres'), false)
  assert.equal(peutAcceder('DIRECTION', '/parametres'), true)
  assert.equal(peutAcceder('DIRECTION', '/inconnu'), false)
})

test('les routes publiques ne sont pas protégées', () => {
  assert.equal(estRouteApplication('/'), false)
  assert.equal(estRouteApplication('/tarifs'), false)
  assert.equal(estRouteApplication('/connexion'), false)
  assert.equal(estRouteApplication('/eleves/25123456A'), true)
  assert.equal(estRouteApplication('/accueil'), true)
})

test('aucun doublon dans le menu', () => {
  const hrefs = NAVIGATION.map((n) => n.href)
  assert.equal(new Set(hrefs).size, hrefs.length)
})
