# Suivi de la mission « prêt à vendre »

Branche `mission/commercialisation`. Un commit par chantier ; chaque chantier n'est coché
qu'après vérification (tests, lint, types, architecture, E2E concernés). Pas de déploiement en
production sans accord explicite.

## Décisions produit

Décisions prises par le responsable du produit le 20/11/2026 :

| Sujet          | Décision                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Combat de boss | 4 mobs puis boss à 3 vies, héros à 3 cœurs. Une erreur ne fait jamais passer au mob suivant.             |
| Entraînement   | Coffre **garanti** à chaque série terminée, meilleure rareté sans faute. Séries de 4, calcul mental : 5. |
| Acad-Héros     | Un héros de départ (les joueurs existants gardent le leur), les autres uniquement dans les coffres.      |
| Comptes        | Parent : e-mail + mot de passe ; profils enfants rattachés à la famille.                                 |
| Paiement       | Stripe, paiement unique par année scolaire (pas de renouvellement automatique), mode test seulement.     |
| Gratuit        | Le 1er chapitre de chaque classe et de chaque matière.                                                   |
| Contenu        | Toutes les matières pour toutes les classes (CM1 → 3e) et une classe « adulte ».                         |
| Multijoueur    | Arène fiabilisée, Raid coopératif contre un boss, mode TV (écran commun, smartphones en manettes).       |

## Chantiers (ordre des dépendances)

| #   | Prio | Chantier                                                                   | État |
| --- | ---- | -------------------------------------------------------------------------- | ---- |
| 0   | —    | Audit initial ([ETAT_INITIAL.md](ETAT_INITIAL.md))                         | ✅   |
| 1   | P0   | Règles de jeu : mob gardé après une erreur, coffre garanti                 | ✅   |
| 2   | P0   | Comptes familiaux, sessions, autorisations, isolation, rôle admin          | ✅   |
| 3   | P0   | Suivi des apprentissages (tentatives, indices, mode, individuel/collectif) | ✅   |
| 4   | P0   | Modèle pédagogique, validation automatique du contenu, signalements, admin | ✅   |
| 5   | P0   | Économie sûre : idempotence, rejeu, coffres uniques                        | ✅   |
| 6   | P0   | Multijoueur fiable (Arène : reconnexion, abandon, expiration)              | ✅   |
| 7   | P1   | Moteur adaptatif + révisions espacées (états pédagogiques)                 | ✅   |
| 8   | P1   | Tableau de bord parent                                                     | ✅   |
| 9   | P1   | Badges                                                                     | ⏳   |
| 10  | P1   | Économie : Acad-Héros en coffres, simulation, paramètres configurables     | ⏳   |
| 11  | P1   | Freemium, abonnement familial, Stripe (test) et simulateur                 | ⏳   |
| 12  | P2   | Salle des trophées, QG personnalisable, cosmétiques                        | ⏳   |
| 13  | P2   | Administration et observabilité                                            | ⏳   |
| 14  | —    | Raid coopératif et mode TV                                                 | ⏳   |
| 15  | —    | Contenu : 5 matières × 7 classes, classe adulte en maths                   | ⏳   |
| 16  | —    | Parcours de bout en bout (15 scénarios), responsive PC/TV                  | ⏳   |

## Blocages nécessitant une intervention humaine

| Sujet                         | Besoin                                                                                                                                    | Contournement en place                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| E-mails (mot de passe oublié) | Choisir et ouvrir un compte chez un fournisseur d'e-mails transactionnels (ex. Brevo, Scaleway TEM, Postmark) et fournir ses identifiants | Interface `Mailer` ; en production l'envoi est journalisé sans contenu |
