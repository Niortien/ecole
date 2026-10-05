# DESIGN — Cartable : « cahier et ardoise »

## Concept
Un cahier d'écolier posé sur une table : **papier ivoire**, lignes de cahier discrètes, **ardoise verte** pour l'action,
**jaune crayon** pour le repère, **rouge du stylo du professeur** réservé aux corrections et alertes. Les appréciations
s'affichent comme des annotations manuscrites. Pro, chaleureux, jamais enfantin (le lycée et la direction l'utilisent aussi).

## Couleurs (tokens CSS dans `app/globals.css`, jamais de hex dans les composants)
| Rôle | Token | Valeur |
|---|---|---|
| Fond de page (papier) | `--color-papier` | #FBF8F0 |
| Surface (carte) | `--color-surface` | #FFFFFF |
| Fond secondaire | `--color-papier-2` / `--color-papier-3` | #F3EEE0 / #E8E1CD |
| Texte (encre) | `--color-encre` | #1B2733 |
| Texte secondaire | `--color-encre-doux` | #4F5B66 |
| Action principale (ardoise) | `--color-ardoise` | #1F5B4A |
| Repère (crayon) | `--color-crayon` | #F2B705 |
| Correction / alerte (stylo rouge) | `--color-stylo` | #C8372D |
| Information / lien (encre bleue) | `--color-bille` | #2B4C9B |
| Bordures | `--color-trait` | #DDD5C0 |

Sémantique stricte : vert = validé / payé / présent ; jaune = à surveiller / en attente ; rouge = impayé / absent / sanction ;
bleu = information. **La couleur n'est jamais seule** : toujours une icône et un libellé.

## Typographie
- Titres : **Fraunces** (empattement doux, esprit livre scolaire), 600–700.
- Texte : **Figtree**, 400–600, 16 px minimum sur mobile, chiffres tabulaires pour notes et montants.
- Échelle : 12 / 14 / 16 / 20 / 28 / 40 / 56.

## Forme
Rayons 8 / 12 / 20 px ; bordures 1 px couleur papier foncé ; ombres très légères (aucune ombre noire dure) ; lignes de cahier
en arrière-plan des zones de saisie de notes et d'appréciation uniquement.

## Mouvement (GSAP, réduit si « réduire les animations »)
Un moment signature : le hero de la vitrine (la page de cahier qui se remplit). Ailleurs : fondu + 14 px de montée à
l'entrée, retour d'action 150–250 ms, tampon « Validé » à la validation d'un bulletin. Pas de mouvement décoratif.

## Composants communs (`components/common`)
`PageHeader`, `SituationBoard` (à faire aujourd'hui), `StatusPill` (icône + texte + teinte), `GradeCell` (saisie note),
`EmptyState`, `DataTable`, `SegmentedControl`, `ConfirmDialog`, `Annotation` (appréciation au stylo rouge).

## Accessibilité
Contraste 4,5:1 minimum, focus visible (2 px ardoise), cibles 44 px, `aria-label` sur toute icône seule, zones vivantes
`aria-live="polite"` pour l'enregistrement, saisie de notes entièrement au clavier.
