# Cartable

Logiciel de gestion d'école ivoirienne (primaire, collège, lycée) : élèves, notes et moyennes, bulletins, présences,
discipline, emplois du temps, scolarité et cantine. Site vitrine + application. Pensé pour une école de Cocody (Abidjan).

> Nom provisoire : modifiable en un seul endroit, `config/app.config.ts`.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

La page `/connexion` propose cinq profils de démonstration (direction, enseignant, éducateur, économe, parent) sur une
**école fictive** de 463 élèves. La date de la démo est fixée au mercredi 13 mai 2026 (3e trimestre en cours).

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint |
| `npm test` | Tests de la logique de calcul (moyennes, mentions, rangs, scolarité, emploi du temps, rôles) |
| `npm run check:links` | Vérifie qu'aucun lien interne ne mène à une page inexistante |
| `npm run check:seed` | Vérifie la cohérence des données de démonstration |

## Architecture

```
app/(vitrine)/        site public : accueil, fonctionnalités, tarifs, contact
app/(app)/            application protégée : accueil, élèves, classes, notes, bulletins, présences, discipline,
                      emplois du temps, scolarité (+ reçus), cantine, paramètres
app/connexion         choix du profil de démonstration
features/<domaine>/   api/ · query/ · mutation/ · schema/ · hook/ · types/ · components/
lib/domain/           logique métier pure et testée (aucune dépendance) : niveaux, notes, calendrier, scolarité…
lib/roles.ts          UNE seule matrice des rôles (menu, protection des routes, tests)
services/mock-db/     base de démonstration (données générées + modifications gardées dans le navigateur)
components/common/    composants partagés (boutons, champs, onglets, états vides/erreur…)
```

## Brancher un vrai backend

Chaque fichier `features/<domaine>/api/*.ts` est la **frontière** avec le serveur. Aujourd'hui il lit `services/mock-db` ;
pour passer à une vraie API, remplacez son contenu par des appels `fetch` vers `NEXT_PUBLIC_API_URL` en renvoyant le même
format `{ data, meta }` (`lib/api.ts`). Les composants, hooks et la logique métier ne changent pas.

L'authentification actuelle est une **démonstration** (cookie de rôle non signé lu par `proxy.ts`). Elle doit être
remplacée par une authentification réelle (jeton vérifié côté serveur) avant toute mise en service.

## Règles de calcul

Les calculs suivent l'usage courant (notes sur 10 au primaire et sur 20 ensuite, trois trimestres, composition à 50 %,
mentions en proportion du barème) mais **chaque école peut les ajuster** dans *Paramètres*. À confirmer avec la direction
de l'établissement : coefficients, traitement des absences (AJ/ANJ), seuils de mention.
