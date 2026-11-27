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

### Qualité d'une question (exigences du client, 27/11/2026)

- **Pertinente** : elle teste la notion visée et rien d'autre ; la lecture, le vocabulaire et les calculs annexes
  restent plus simples que la notion (un problème de fractions ne doit pas échouer à cause d'un mot inconnu).
  Contexte tiré de la vie d'un enfant de cet âge, nombres et situations réalistes ; jamais de piège gratuit.
- **Progressive** : chaque niveau ajoute **une seule** difficulté au précédent (forme, nombres, piège, contexte),
  sans saut. Cible de réussite d'un enfant qui a fait le niveau précédent : ≈ 90 % au niveau 1, ≈ 75 % au 3,
  ≈ 55 % au 5. Une fois des données réelles disponibles, une question hors cible (trop facile ou trop difficile
  pour son niveau) est signalée automatiquement et recalibrée.
- **Bien construite** : consigne courte qui commence par le verbe d'action (« Choisis », « Écris », « Range ») ;
  une seule bonne réponse ; distracteurs plausibles, tirés des erreurs typiques (jamais absurdes) ; en saisie,
  toutes les écritures correctes sont acceptées (majuscules, espaces, unité, écriture équivalente).
- **Variée** : le générateur produit assez de variantes pour qu'un enfant ne revoie pas la même question
  dans une séance ; les situations changent, pas seulement les nombres.
- **Utile en cas d'erreur** : la correction répond à l'erreur faite (piège reconnu → explication ciblée), puis
  propose une question du même type pour vérifier que c'est compris.

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

### Audio

`Question.audio = { text, lang }` (`lang` BCP 47 : `fr-FR`, `en-GB`, `es-ES`). Le texte lu n'apparaît pas dans l'énoncé
(contrôle `audio` du validateur). Lecture par la voix locale de l'appareil (bouton « Écouter ») ; rien n'est envoyé à
l'extérieur. Sans voix pour la langue, l'entraînement remplace la question par une autre de la notion : prévoir
plusieurs variantes sans audio ou avec une autre langue. Au CM1 et CM2, le bouton lit aussi l'énoncé des autres questions.

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
- Figure `map` : `{ kind: 'map', map, highlight?, marks? }`. `map` : `france-regions`, `france-departements`
  (France métropolitaine), `europe` ou `monde` (continents, océans, grands fleuves). `highlight` colore des zones,
  `marks` pose un repère (`{ zone, label }`) au centre d'une zone. Les identifiants de zones sont ceux du registre
  `packages/content/src/cartes-zones.ts` (INSEE pour les régions et départements, code pays à 3 lettres en minuscules pour
  l'Europe, `afrique`, `atlantique`, `nil`… pour le monde) ; le validateur refuse toute zone inconnue.
- Réponse `zone` : `{ kind: 'zone', map, zone }`, réponse `{ kind: 'zone', zone }`. L'élève touche la zone sur la carte
  (boutons ＋/－ pour les petites zones). Erreur typique : `{ zone, why }`. Après une erreur, l'entraînement affiche la
  carte avec la bonne zone surlignée. Pour « quelle est la zone surlignée ? », utiliser la figure `map` + `choice`.
- Fonds de carte : simplifiés par `apps/web/scripts/fonds-cartes.mjs` (IGN Admin Express, Licence Ouverte 2.0, et Natural
  Earth, domaine public), chargés à la demande ; ne pas les modifier à la main. Aucune zone contestée dans le registre
  (ni Kosovo, ni Chypre, ni Turquie en Europe) ; la frontière Europe/Asie du monde est approchée par le méridien 60° E ;
  les limites des océans sont des conventions simplifiées (pas d'océan Austral).
- Saisie : toucher (numéros, OK), clavier physique (chiffres, lettres, Retour arrière, Entrée) et télécommande
  (flèches pour passer d'un bouton à l'autre, OK pour valider).

## 3. Explications, indices, corrections

- **Mémo** de la notion (`lesson.memo`) : 2 ou 3 phrases de coach, avec un mini-exemple. Chaque mot difficile
  est défini dans le glossaire de la matière.
- **Indice** (2e essai) : met sur la voie sans donner la réponse.
- **Étapes** : ce qu'on cherche, comment, pourquoi ; la dernière bulle donne la réponse en gras.
  Une explication doit permettre à l'enfant de comprendre **seul, sans adulte** :
  - **par étapes** : une idée par bulle, 3 ou 4 bulles au plus, du plus simple jusqu'au résultat ;
  - **guidée** : chaque bulle dit quoi faire (« Regarde le nombre du bas », « Compte les parts »), pas seulement quoi savoir ;
  - **simple** : phrases courtes (≈ 12 mots en CM1-CM2), aucun mot nouveau sans définition, toujours un exemple concret ;
  - **vérifiable** : après l'explication, l'enfant doit pouvoir réussir seul une question du même type.
- **Pièges** (`traps`) : au moins deux erreurs typiques par notion, chacune avec une explication ciblée.
- **Sources** (`lesson.sources`) : programme officiel de la classe, et source institutionnelle pour chaque fait.
  Pour un fait, la source porte la citation exacte.
- **Ton** :
  - CM1-CM2 : ludique, phrases courtes (≈ 15 mots) ;
  - 6e et après : plus sérieux, vocabulaire disciplinaire ;
  - 3e : rappels du brevet quand c'est utile.

### Ton « pas encore » (tout texte lu par l'enfant)

- Une réponse fausse n'est qu'un « pas encore » : ni « raté », ni « échec », ni « mauvaise réponse », ni
  « points faibles ». On dit « notion à renforcer », « pas encore », « Oups ! » et on invite à réessayer.
- Après une erreur : explication ciblée, puis « Tu veux réessayer une question du même type ? ».
- Demander un indice ou l'explication n'est **jamais** une erreur. Entraînement : les deux, à tout moment,
  sans coût. Épreuve du chapitre : indice seulement (explication après la réponse). Boss : indice seulement,
  attaque un peu moins forte.
- Médailles de notion : réussite avec aide = or ; sans aide = diamant (« Reviens sans indice pour le
  diamant ! »). Une médaille gagnée n'est jamais perdue.
- Accord selon le profil avec `accord()` (« seul » / « seule ») ; genre non renseigné : tournure neutre
  (« Maîtrisée sans aide »).
- Comparaison à soi seulement (record personnel, « record à battre ») : aucun classement entre enfants.
- Contrôle : `apps/web/src/shared/lib/ton.test.ts`.

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

| #   | Critère                    | Bloquant si…                                                                                                                                                                       |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Conformité au programme    | notion hors programme de la classe, ou terminologie différente de celle du programme                                                                                               |
| 2   | Exactitude                 | un fait sans source, une citation qui ne dit pas ce qu'affirme la question, une règle fausse                                                                                       |
| 3   | Univocité                  | deux réponses défendables, distracteur juste, variante correcte refusée                                                                                                            |
| 4   | Progressivité              | niveaux 1 → 5 pas de difficulté croissante, plus d'une difficulté ajoutée d'un niveau au suivant, niveau 5 sans contexte                                                           |
| 4b  | Pertinence et construction | question qui échoue pour une autre raison que la notion, contexte irréaliste, consigne sans verbe d'action, distracteur absurde, écriture correcte refusée, trop peu de variantes  |
| 5   | Clarté et âge              | énoncé ambigu, trop long pour l'âge, mot difficile non défini                                                                                                                      |
| 6   | Explications               | étapes qui n'expliquent pas pourquoi, indice qui donne la réponse, piège sans explication, explication qui suppose l'aide d'un adulte (pas par étapes, pas guidée, trop abstraite) |
| 7   | Erreurs typiques           | moins de deux erreurs typiques prévues                                                                                                                                             |
| 8   | Neutralité et sensibilité  | stéréotype, jugement de valeur, sujet sensible traité sans sobriété (guerres, génocides, religions, corps)                                                                         |
| 9   | Accessibilité              | information portée par la seule couleur, écoute sans alternative                                                                                                                   |
| 10  | Données                    | prénom réel d'élève, donnée personnelle, lien externe dans l'énoncé                                                                                                                |

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

- **Sources** : `<matiere>/sources.ts` (sciences : `sciences/<st|svt|techno>/sources.ts`) ; celles de plusieurs matières
  dans `sources-communes.ts`, les fabriques partagées (`tlfi`, `academie`) dans `sources-outils.ts`. `sources.ts` les
  réunit (registre et liste des domaines autorisés) ; les identifiants sont uniques dans tout le registre. Une notion
  cite ses sources par identifiant dans `lesson.sources` (obligatoire pour les notions à 5 niveaux).
- **Relectures** : `<matiere>/relectures.ts`, une ligne `{ skillId, version, lot, date, verdict }` par relecture.
- **Glossaire** : `<matiere>/glossaire.ts` (maths : `glossary.ts`) ; les termes en gras d'un mémo y sont définis.
- **Contrôles** : `couverture.test.ts` applique ces règles aux notions à 5 niveaux ; le nombre de notions
  historiques (3 niveaux) ne peut que diminuer (constante `HISTORIQUES_MAX`, à abaisser à chaque lot).
- **Aperçu de relecture** : `node apps/server/scripts/apercu.ts <chapitre|notion>… [--out aperçu.md]`
  (niveaux × 3 graines : énoncé, réponse, pièges, indice, étapes, sources).

## 8. Sens des matières

Chaque notion dit à l'enfant **pourquoi l'apprendre** : champ `sens` de la notion (`Skill.sens`), une ou plusieurs
phrases de l'un des quatre types.

| Type (`type`) | Titre montré      | Contenu                                                  |
| ------------- | ----------------- | -------------------------------------------------------- |
| `usage`       | À quoi ça sert    | une situation concrète d'un enfant, ou une autre matière |
| `savais-tu`   | Le sais-tu ?      | un fait étonnant                                         |
| `metier`      | Qui s'en sert     | un métier, une discipline ou une passion                 |
| `histoire`    | Un peu d'histoire | qui a inventé ou découvert ça, et pourquoi               |

- **Longueur** : une seule phrase courte, 120 caractères au plus (`SENS_MAX_LENGTH`), mots simples.
- **Ton** : coach, concret ; aucune morale, aucune injonction, aucune promesse.
- **Source** : institutionnelle ou encyclopédique, du registre (`source` = identifiant, domaine autorisé) ;
  `citation` = le passage exact qui appuie la phrase. La phrase ne dit rien de plus que ce passage. Aucun lien
  n'est montré à l'enfant.
- **Affichage** : après une réussite (bilan de la série, sans clic), à l'ouverture d'un chapitre
  (« Pourquoi apprendre ça ? », deux phrases de types variés) et dans « Ce que tu sais maintenant faire ».
- **Obligation** : tout nouveau lot de contenu remplit `sens` pour chacune de ses notions. Le champ reste
  facultatif dans le schéma tant que l'existant n'est pas complété : absent, le test avertit sans bloquer, sauf
  en mathématiques CM1, CM2 et 6e (`maths/sens.ts`), où il est exigé.
- Contrôle : `packages/content/src/sens.test.ts`. Relecture pédagogique : exactitude et ton.

## Référentiel d'évaluation d'une nouvelle matière (Arène)

Gabarit et règles : `packages/content/src/referentiel/gabarit.ts`. Enregistrer le référentiel dans `REFERENTIALS` :
`referentiel.test.ts` le contrôle alors automatiquement (rattachement des chapitres, prérequis, cycles, essentielles).
