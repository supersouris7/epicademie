# @questeo/shared — contrats partagés

Types, constantes et **schémas Zod** communs au serveur, au web et au moteur. Aucune dépendance
interne, aucun effet de bord.

| Fichier                                | Contenu                                                             |
| -------------------------------------- | ------------------------------------------------------------------- |
| `api/contract.ts`                      | contrat de l'API HTTP v1 (points d'accès, schémas, codes d'erreur)  |
| `profile.ts`                           | profil, avatar, héros, création et modification                     |
| `play.ts`                              | entraînement : réponses, résultats, progression par notion, bilan   |
| `battle.ts`                            | combat de boss : vue, réponses, bilan, médailles                    |
| `items.ts`                             | objets, inventaire, coffres, boutique                               |
| `realtime.ts`                          | temps réel : présence, messages prédéfinis, arène, événements typés |
| `modes.ts`, `subjects.ts`, `grades.ts` | modes de jeu, matières, classes                                     |

Le contrat d'API est la source unique : voir [ADR 0004](../../docs/adr/0004-api-versionnee.md).
