# 0031 — Matière unique « Sciences »

## Contexte

Au collège (5e-3e), physique-chimie, SVT et technologie sont présentées comme une seule matière : un boss,
une relique, une carte dans l'Espace parent et l'Arène d'évaluation.

## Décision

- Identifiant de matière `sciences` (remplace `physique`). Libellé selon la classe (`subjectLabel`) :
  « Sciences et technologie » de CM1 à 6e, « Sciences » ensuite.
- Chaque chapitre porte un domaine : `physique-chimie`, `svt` ou `technologie` (`SCIENCES_DOMAINS`).
  Préfixes d'identifiants de chapitre : `p`, `v`, `t` + classe.
- Les identifiants de chapitres et de notions sont conservés (`p5-…`) : progression, tentatives et récompenses
  restent valides. Migration `0023` : renomme `physique` en `sciences` dans `sessions` et `evaluations`
  (réversible par l'UPDATE inverse indiqué en tête du fichier).
- Le boss (Professeur Kaboum) et la relique (Fiole des sciences) de l'ancienne physique deviennent ceux des Sciences.

## Conséquences

Les contenus SVT et technologie s'ajoutent comme chapitres de domaine `svt` / `technologie`, sans autre changement
de structure.
