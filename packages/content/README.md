# @questeo/content — contenu pédagogique

Générateurs d'exercices **purs et déterministes** : `(notion, niveau, graine) → question`, toujours
la même. Le serveur s'en sert pour régénérer et corriger chaque réponse (il ne fait jamais
confiance au client) ; le web pour afficher la question.

## API publique (`src/index.ts`)

| Fonction                                 | Rôle                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `generate(skillId, level, seed)`         | la question (énoncé, réponse attendue, indice, étapes, figure)       |
| `check(question, response)`              | `{ correct, invalid, why? }` ; `invalid` = saisie illisible          |
| `CHAPTERS`, `chaptersOf(subject, grade)` | catalogue des chapitres                                              |
| `getChapter`, `getSkill`, `getAnySkill`  | recherche par identifiant (`getAnySkill` inclut les notions de boss) |
| `gradesOf(subject)`                      | classes qui ont du contenu                                           |
| `battlePools(chapterId)`                 | réserves de questions d'un combat de boss (mobs, problèmes, pièges)  |
| `fmt`, `frac`, rationnels                | nombres à la française, calcul exact en fractions                    |

Types : `Question`, `Response`, `Skill`, `Chapter`, `Figure`, `Level`… (`src/types.ts`).

## Organisation

```
src/
  index.ts            API publique
  catalog.ts          catalogue (toutes matières) et génération
  check.ts            correction (tolérante : virgule, espaces, fractions équivalentes…)
  build.ts            briques de construction d'une question (choix, pièges, sources)
  rational.ts rng.ts  calcul exact, hasard reproductible
  maths/
    index.ts          toutes les classes, dans l'ordre de la scolarité
    kit.ts            outils de construction communs aux classes
    cm/ 6e/ 5e/ 4e/ 3e/
      index.ts        chapitres de la classe, dans l'ordre du programme
      <chapitre>.ts   un fichier par chapitre (ses notions et son boss)
      commun.ts       outils partagés par plusieurs chapitres de la classe (cm/ : outils.ts)
```

Le cours moyen (CM1, CM2) partage un même générateur paramétré par la classe :
`cm/contexte.ts` (réglages de la classe) et une fonction `buildX(contexte)` par chapitre.

## Règles

- Chaque notion cite l'objectif officiel du programme (`lesson.source`) ; aucun fait non sourcé.
- Une question ne dépend que de sa graine : jamais `Math.random`, `Date`, ni état global.
- Tout générateur est couvert par les tests de cohérence (`catalog.test.ts`, `spotcheck.test.ts`) :
  la réponse attendue est acceptée par `check`, les pièges sont refusés, les énoncés sont variés.
