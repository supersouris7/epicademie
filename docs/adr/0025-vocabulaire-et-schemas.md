# 0025 — Vocabulaire expliqué et schémas dans les explications

- Statut : Acceptée
- Date : 2026-11-20

## Contexte

Retour terrain d'un parent :

- les enfants bloquent sur le **vocabulaire** (division euclidienne, quotient, reste,
  décimales…) plus que sur le calcul ;
- les explications manquent de **schémas et de tableaux** ;
- l'enfant mélange **aire et volume, cm, cm² et cm³** sans faire le lien.

## Décision

- **Glossaire** (`@questeo/content/glossary.ts`) : 27 mots en cinq familles (opérations,
  division, nombres décimaux, fractions, longueurs/aires/volumes). Chaque mot a :
  - une définition courte ;
  - un exemple chiffré, vérifié par les tests ;
  - un schéma quand il aide.
- **Mots touchables** : dans les énoncés, les explications de Questy et les leçons, chaque mot du
  glossaire est souligné en pointillés. Un toucher ouvre sa définition, l'exemple et le schéma.
  - Jamais dans une option à toucher (pas de bouton dans un bouton).
  - `cm^2`/`cm^3` s'affichent `cm²`/`cm³` et sont eux aussi des mots touchables.
- **Leçon** : section « Les mots à connaître » avant « Le truc à retenir ». Elle liste les mots
  présents dans la notion (titre, mémo, énoncés types).
- **Mon dictionnaire** (`/dictionnaire` ; retiré du menu de l'accueil le 20/11/2026) : tous les mots par famille ; ceux
  déjà regardés sont cochés (stockage local de l'appareil).
- **Schémas d'explication** (`Demo`) :
  - `division` : division posée, chaque nombre nommé et coloré (dividende, diviseur, quotient,
    reste) ; partage en paquets de jetons (jusqu'à 60) ; égalité de contrôle
    `dividende = diviseur × quotient + reste` ;
  - `unites` : trait de 1 cm, carré de 1 cm², cube de 1 cm³ côte à côte, un exemple compté
    (3 cm, 6 cm², 12 cm³) et le tableau « je mesure… je compte des… unité » ;
  - `rangs` : le nombre dans le tableau des rangs (partie entière en bleu, décimales en vert) ;
  - `conversion` : inchangé.
- **Attribution automatique** (`explain.ts`) : quand le générateur ne fournit pas de schéma, il
  est choisi d'après l'énoncé :
  - division, multiple, divisible, partage → division ;
  - aire, volume, périmètre → unités ;
  - dixièmes, centièmes, partie entière → rangs.

  Le schéma n'est ajouté que si les nombres sont lisibles et entiers (jamais « 5 » dans
  « 7,5 ÷ 3 »). Sur le catalogue (3 niveaux × 10 graines), cela donne des centaines
  d'explications illustrées, mesurées par `explain.test.ts`.

## Suite

- Étendre le glossaire (géométrie, proportionnalité, statistiques, algèbre) et les schémas
  (fractions en parts, droite graduée des relatifs, tableau de proportionnalité) chapitre par
  chapitre, avec le même circuit : définition, exemple vérifié, test.
