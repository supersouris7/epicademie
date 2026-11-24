# Production des contenus — format et chaîne qualité

Décision : [ADR 0034](../adr/0034-contenus-toutes-matieres.md). Référentiel des programmes : [referentiel/](referentiel/README.md).

## 1. Une notion, cinq niveaux

Une notion (`Skill`) = une compétence précise du programme, travaillée par un générateur déterministe
`generate(rng, level)`. Toute nouvelle notion déclare `levels: 5` et suit la grille commune :

| Niveau        | Intention                              | Formes typiques (hors maths)                                                        |
| ------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| 1 Découvrir   | reconnaître sur un exemple typique     | QCM à 3 propositions très distinctes, image ou schéma                               |
| 2 Reconnaître | distinguer des cas proches             | QCM à 4 propositions plausibles, association de 3 paires                            |
| 3 Appliquer   | produire la réponse, cas réguliers     | saisie courte, texte à trous, remise en ordre                                       |
| 4 Maîtriser   | cas moins fréquents, pièges, sans aide | saisie sans propositions, irréguliers, association de 5 paires                      |
| 5 Expert      | mobiliser dans un contexte             | document ou texte long, combinaison avec une notion antérieure, format brevet en 3e |

Exemples :

- **Français**, accord sujet-verbe :
  1. choisir le verbe bien accordé ;
  2. sujet pronom ou groupe nominal ;
  3. écrire le verbe d'une phrase simple ;
  4. sujet inversé ou éloigné ;
  5. corriger l'accord dans un court paragraphe.
- **Histoire**, Révolution :
  1. QCM sur une date du programme ;
  2. associer date et événement ;
  3. remettre une frise dans l'ordre ;
  4. compléter un texte à trous ;
  5. lire un extrait de document et identifier l'événement.
- **Anglais**, prétérit :
  1. reconnaître la forme ;
  2. choisir entre deux formes proches ;
  3. écrire la forme ;
  4. irréguliers rares et négation ;
  5. phrase entendue à l'audio, puis la réécrire au passé.

## 2. Types de questions

| Besoin                              | Type                            | Remarques                                                                                            |
| ----------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| QCM                                 | `choice`                        | une seule bonne proposition ; distracteurs = erreurs typiques, chacun avec son explication (`traps`) |
| Saisie courte                       | `text`                          | toutes les variantes acceptables listées ; accents exigés seulement si la notion porte sur eux       |
| Association                         | `match`                         | 3 à 6 paires, une seule solution                                                                     |
| Texte à trous                       | `cloze`                         | chaque trou en saisie ou en liste ; correction trou par trou                                         |
| Ordre (chronologie, phrase, étapes) | `order`                         | 3 à 6 éléments, un seul ordre juste                                                                  |
| Carte                               | figure `map` + `choice` ou zone | fonds IGN ou Natural Earth ; aucune frontière contestée dans les questions                           |
| Écoute                              | `audio` + tout type             | synthèse vocale de l'appareil ; le texte écouté n'apparaît pas avant la réponse                      |
| Lecture de document                 | figure `document`               | extrait court ; texte original du domaine public ou écrit pour l'exercice                            |

### Forme des réponses structurées

- `order` : `items` dans l'ordre présenté (jamais déjà rangé), `correct` = indices de `items` dans l'ordre juste.
  Réponse : `{ kind: 'order', order: [indices] }`.
- `match` : `left`, `right` (déjà mélangée), `pairs[i]` = indice de `right` associé à `left[i]`.
  Réponse : `{ kind: 'match', pairs: [indices] }`.
- `cloze` : `parts` (un segment de plus que de trous) et `blanks` : `{ mode: 'text', accepted }` ou
  `{ mode: 'list', options, correct }`. Réponse : `{ kind: 'cloze', answers: [texte par trou] }`.
- Les éléments d'une même colonne sont distincts (sans tenir compte de la casse) : `validate.ts` énumère toutes les
  permutations (6 éléments au plus) et exige qu'une seule soit jugée juste.
- `check` renvoie `parts` (réussite par place, paire ou trou) pour la correction une à une.
- Figure `document` : `{ kind: 'document', title?, lines, credit? }`, chaque ligne est numérotée à l'affichage.
- Saisie : toucher (numéros, OK), clavier physique (chiffres, lettres, Retour arrière, Entrée) et télécommande
  (flèches pour passer d'un bouton à l'autre, OK pour valider).

## 3. Explications, indices, corrections

- **Mémo** de la notion (`lesson.memo`) : 2 ou 3 phrases de coach, avec un mini-exemple. Chaque mot difficile
  est défini dans le glossaire de la matière.
- **Indice** (2e essai) : met sur la voie sans donner la réponse.
- **Étapes** : ce qu'on cherche, comment, pourquoi ; la dernière bulle donne la réponse en gras.
- **Pièges** (`traps`) : au moins deux erreurs typiques par notion, chacune avec une explication ciblée.
- **Sources** (`lesson.sources`) : programme officiel de la classe, et source institutionnelle pour chaque fait.
  Pour un fait, la source porte la citation exacte.
- **Ton** :
  - CM1-CM2 : ludique, phrases courtes (≈ 15 mots) ;
  - 6e et après : plus sérieux, vocabulaire disciplinaire ;
  - 3e : rappels du brevet quand c'est utile.

## 4. Contrôles automatiques (bloquants en CI)

1. `validate.test.ts` : toutes les notions × 5 niveaux × 20 graines.
   - Structure de chaque question.
   - La réponse attendue est jugée juste.
   - Chaque piège est jugé faux.
   - Un même énoncé n'a jamais deux réponses.
   - Pas de doublon parmi les propositions.
   - Ordre et association à solution unique.
   - Variantes d'écriture acceptées.
2. Progression des niveaux : chaque niveau produit des questions différentes des autres sur 20 graines, et les
   niveaux 4 et 5 ne sont pas une copie des niveaux 1 à 3.
3. Sources :
   - chaque notion a au moins une source du registre ;
   - chaque URL appartient à un domaine institutionnel autorisé ;
   - chaque fait porte une source et une citation non vide.
4. Relectures : toute notion publiée hors maths a une relecture « ok » à sa version courante.
5. Données de référence :
   - conjugaisons espagnoles comparées aux tables RAE ;
   - verbes irréguliers anglais comparés au tableau du British Council ;
   - codes géographiques comparés à l'INSEE ;
   - vérification indépendante des calculs (`spotcheck`).
6. Glossaire : chaque terme en gras d'un mémo est défini.
7. Lint, types, code mort, architecture, e2e sur 3 profils (CI habituelle).

## 5. Chaîne par lot

Un lot = une matière × une classe × un chapitre (4 à 8 notions), sur une branche
`feat/<ticket>-<lot>`, avec une PR.

1. **Génération** (développeur) :
   1. lire le référentiel de la classe et les extraits du programme ;
   2. écrire données citées, générateurs, mémo, glossaire ;
   3. contrôles ciblés verts ;
   4. aperçu de relecture produit.
2. **Relecture pédagogique** (agent pédagogie) sur la même branche : grille ci-dessous, notion par notion.
   - Verdict par notion.
   - Corrections mineures faites par le relecteur.
   - Corrections bloquantes renvoyées au développeur.
   - Relectures « ok » enregistrées dans `relectures.ts`.
   - Compte rendu dans la PR.
3. **Corrections** : un seul aller-retour ; au-delà, le lot est bloqué et signalé.
4. **CI verte**, fusion, mise en recette.

### Grille de relecture (chaque notion)

| #   | Critère                   | Bloquant si…                                                                                               |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Conformité au programme   | notion hors programme de la classe, ou terminologie différente de celle du programme                       |
| 2   | Exactitude                | un fait sans source, une citation qui ne dit pas ce qu'affirme la question, une règle fausse               |
| 3   | Univocité                 | deux réponses défendables, distracteur juste, variante correcte refusée                                    |
| 4   | Progressivité             | niveaux 1 → 5 pas de difficulté croissante, niveau 5 sans contexte                                         |
| 5   | Clarté et âge             | énoncé ambigu, trop long pour l'âge, mot difficile non défini                                              |
| 6   | Explications              | étapes qui n'expliquent pas pourquoi, indice qui donne la réponse, piège sans explication                  |
| 7   | Erreurs typiques          | moins de deux erreurs typiques prévues                                                                     |
| 8   | Neutralité et sensibilité | stéréotype, jugement de valeur, sujet sensible traité sans sobriété (guerres, génocides, religions, corps) |
| 9   | Accessibilité             | information portée par la seule couleur, écoute sans alternative                                           |
| 10  | Données                   | prénom réel d'élève, donnée personnelle, lien externe dans l'énoncé                                        |

Aucun lien vers un site non institutionnel. Pour la littérature : seulement des œuvres du domaine public,
ou des textes écrits pour l'exercice.

## 6. Critères d'acceptation d'un lot

- Toutes les notions du lot du référentiel sont présentes, en 5 niveaux, ou leur report est justifié dans la PR.
- Contrôles automatiques verts en local ciblé, puis CI complète verte.
- Relecture « ok » enregistrée pour chaque notion, à sa version courante ; aucun point bloquant ouvert.
- Sources : chaque notion cite le programme de la classe ; chaque fait cite sa source et sa citation.
- Notions existantes reprises : identifiants conservés (progression des élèves), `version` incrémentée si les
  énoncés ou réponses changent.
- Aperçu de relecture joint à la PR (extrait), état du référentiel mis à jour (`couverte`).

## 7. Outils du moteur (lot mo-03)

- **Sources** : `packages/content/src/sources.ts` (registre, liste des domaines autorisés) ; une notion cite ses
  sources par identifiant dans `lesson.sources` (obligatoire pour les notions à 5 niveaux).
- **Relectures** : `<matiere>/relectures.ts`, une ligne `{ skillId, version, lot, date, verdict }` par relecture.
- **Glossaire** : `<matiere>/glossaire.ts` (maths : `glossary.ts`) ; les termes en gras d'un mémo y sont définis.
- **Contrôles** : `couverture.test.ts` applique ces règles aux notions à 5 niveaux ; le nombre de notions
  historiques (3 niveaux) ne peut que diminuer (constante `HISTORIQUES_MAX`, à abaisser à chaque lot).
- **Aperçu de relecture** : `node apps/server/scripts/apercu.ts <chapitre|notion>… [--out aperçu.md]`
  (niveaux × 3 graines : énoncé, réponse, pièges, indice, étapes, sources).
