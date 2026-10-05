# PRODUCT — Cartable

## Ce que c'est
Logiciel de gestion d'un établissement scolaire ivoirien (primaire CP1–CM2, collège 6e–3e, lycée 2nde–Tle) :
élèves, notes, moyennes, bulletins, présences, sanctions, emplois du temps, scolarité, cantine.
Pensé pour une école de **Cocody (Abidjan)**. Nom provisoire, modifiable dans `config/app.config.ts`.

## Pour qui
- **Direction** : voit l'état de l'école d'un coup d'œil, décide, valide.
- **Enseignant** : saisit notes et appels vite, souvent sur téléphone, avec un réseau instable.
- **Éducateur (vie scolaire)** : présences, retards, sanctions.
- **Économe / comptable** : frais, paiements, impayés, reçus.
- **Parent** : sur téléphone, veut savoir « comment va mon enfant et ai-je quelque chose à payer ? ».

## Ce qui le distingue
1. **Simple par rôle** : chaque rôle voit sa « salle de situation » (ce qui demande une action aujourd'hui), pas un menu de 20 modules.
2. **Mobile d'abord** pour enseignants et parents ; appel et saisie de notes **utilisables hors ligne**.
3. **Contexte ivoirien réel** : CEPE, BEPC, BAC, trois trimestres, notes sur 20, FCFA, Wave / Orange Money / MTN.
4. **Une fiche élève unique** (matricule) : notes, discipline, scolarité, cantine au même endroit.
5. **Ton bienveillant** : notes publiées après validation de l'enseignant, retours positifs privés, jamais de classement public.

## Principes de produit
- Trois clics maximum pour les dix tâches les plus fréquentes.
- Aucune page « bientôt », aucun lien mort, aucune donnée codée en dur dans l'interface.
- Les règles de calcul incertaines sont des **paramètres de l'école**, signalés « à confirmer avec la direction ».
- Marketing honnête : aucun chiffre, témoignage ou logo client inventé.
- Authentification actuelle = **démo** (données de démonstration locales). À remplacer par un vrai backend.

## Tonalité
Chaleureuse, claire, sérieuse. Vocabulaire de l'école ivoirienne (« éducateur », « tableau d'honneur », « écolage »), français courant, « Enseignants » partout.

## Anti-références
Interfaces administratives denses à la PowerSchool, notifications anxiogènes à chaque note (Pronote), classements publics (ClassDojo), gabarit « gros chiffres + trois cartes », néon / dégradés sur texte.
