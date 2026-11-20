# Parcours de bout en bout

16 parcours Playwright sur le build de production (base PostgreSQL embarquée jetable, aucune
donnée réelle), joués sur **trois formats** :

- `tablette` : iPad paysage ;
- `smartphone` : Pixel 7 ;
- `ordinateur-tv` : 1920 × 1080. Ce format joue les écrans principaux, le multijoueur et le
  mode TV.

Commande : `pnpm e2e`. Elle est bloquante en CI.

| #   | Fichier            | Parcours                                                                                      |
| --- | ------------------ | --------------------------------------------------------------------------------------------- |
| 1   | `profiles.spec.ts` | Sans compte : toute page mène à la connexion ; l'API répond en JSON                           |
| 2   | `profiles.spec.ts` | Inscription, création de profil (classe déduite de l'âge), hub, thème sombre, suppression     |
| 3   | `training.spec.ts` | Série d'entraînement : erreur, indice, 2e essai, explication, leçon, résultats, coffre        |
| 4   | `training.spec.ts` | Outils : calculatrice, brouillon, tableau de conversion                                       |
| 5   | `boss.spec.ts`     | Combat de boss : mobs, riposte, victoire, coffre                                              |
| 6   | `boss.spec.ts`     | Défaite : 5 secondes pour recommencer, puis l'entraînement                                    |
| 7   | `multi.spec.ts`    | Plusieurs appareils : présence, message, profil déjà ouvert refusé, arène jusqu'à la victoire |
| 8   | `multi.spec.ts`    | Raid coopératif sur deux téléphones, partie affichée sur l'écran TV                           |
| 9   | `billing.spec.ts`  | Version gratuite (cadenas), paiement simulé, chapitres débloqués, historique                  |
| 11  | `journeys.spec.ts` | Compte : déconnexion de l'appareil, reconnexion, profils retrouvés                            |
| 12  | `journeys.spec.ts` | Espace parent : enfant listé, abonnement familial                                             |
| 13  | `journeys.spec.ts` | Adulte : parcours de remise à niveau                                                          |
| 14  | `journeys.spec.ts` | Anglais : verbes irréguliers jouables                                                         |
| 15  | `journeys.spec.ts` | Mes progrès : trophées et badges visibles                                                     |
| 16  | `journeys.spec.ts` | Mise en page : aucun défilement horizontal sur 8 écrans principaux                            |

Les familles e2e prennent l'abonnement par le simulateur, sauf dans le parcours « version
gratuite ». Le simulateur est permis car le serveur e2e tourne en mode `test` ; il est
interdit en production.
