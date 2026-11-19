# @questeo/engine — règles du jeu

Fonctions **pures** (aucune entrée/sortie, aucun état global, hasard injecté) : le serveur les
applique et persiste le résultat ; le web s'en sert pour afficher des prévisions cohérentes.

| Fichier      | Règles                                                         |
| ------------ | -------------------------------------------------------------- |
| `xp.ts`      | XP d'une réponse, pièces                                       |
| `levels.ts`  | niveaux du joueur à partir de l'XP                             |
| `srs.ts`     | répétition espacée par notion, médailles (bronze, argent, or)  |
| `session.ts` | plan d'une partie d'entraînement (notions, niveaux, variantes) |
| `battle.ts`  | combat de boss : mobs, boss à 3 vies, rage, objets, gains      |
| `arena.ts`   | arène multijoueur : tours, attaques, fin de partie             |
| `duel.ts`    | handicap d'âge entre joueurs (niveau, temps de réponse)        |
| `loot.ts`    | coffres d'équipement                                           |

Dépend uniquement de `@questeo/shared` (vérifié par `pnpm arch`). Couverture minimale : 85 %.
