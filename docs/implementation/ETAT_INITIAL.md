# État initial — audit du 20/11/2026

Point de départ de la mission « prêt à vendre aux familles » (branche `mission/commercialisation`,
à partir du commit `d043101`). Chaque élément est classé :

- ✅ **Présent et vérifié** (tests automatisés qui le couvrent) ;
- 🟡 **Présent, insuffisamment testé** ;
- 🟠 **Partiel** ;
- ❌ **Absent** ;
- ⚫ **Obsolète**.

Décisions produit prises avant le développement : voir [SUIVI.md](SUIVI.md#décisions-produit).

| #   | Domaine                           | État | Constat                                                                                                                                                                                                                                                                       |
| --- | --------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Architecture générale             | ✅   | Monorepo pnpm : `shared` (contrats), `engine` (règles pures), `content` (exercices), `server` (Fastify, modules), `web` (React, fonctionnalités). Règles de dépendances vérifiées en CI (ADR 0001, 0008).                                                                     |
| 2   | Technologies et dépendances       | ✅   | Node 24, TypeScript strict, PostgreSQL/PGlite, Drizzle, Zod, socket.io, React 19. `pnpm audit` propre, versions épinglées, Dependabot (ADR 0011).                                                                                                                             |
| 3   | Modules et services               | ✅   | Serveur : profils, entraînement, combats, inventaire, temps réel, système, télémétrie (routes → service → dépôt).                                                                                                                                                             |
| 4   | Modèles de données                | 🟠   | 6 tables (`profiles`, `sessions`, `attempts`, `skill_states`, `inventory`, `boss_records`). **Pas de famille, de compte, de droits, de signalement, de badge, de collection de héros.**                                                                                       |
| 5   | Authentification et autorisations | ❌   | **Aucune** : tout appareil qui atteint le serveur liste, ouvre, modifie et supprime tous les profils (limite connue, `docs/architecture/securite.md`).                                                                                                                        |
| 6   | Familles et joueurs               | ❌   | Profils joueurs à plat, sans compte parent ni rattachement.                                                                                                                                                                                                                   |
| 7   | Moteur d'exercices                | ✅   | Générateurs déterministes par graine (`content`), 3 niveaux, 343 notions de maths, CM1 → 3e ; tests de génération massive.                                                                                                                                                    |
| 8   | Génération et correction          | 🟠   | Correction pure partagée client/serveur (`check`), pièges reconnus, arrondis, équivalences. **Pas de version d'exercice, pas d'état de validation, pas de contrôle indépendant des calculs ni de détection systématique des doublons de QCM.**                                |
| 9   | Progression pédagogique           | 🟠   | Répétition espacée par notion (`engine/srs.ts` : paliers 0–3, échéances), médailles par série, niveau adaptatif dans la série. **Pas d'indice, de tentative ni de mode enregistrés par réponse ; pas d'état « à travailler / en progression / à consolider ».**               |
| 10  | Combats et multijoueur            | 🟠   | Boss : 4 mobs + boss 3 vies, héros 3 cœurs, objets. **Bug de règle : une mauvaise réponse fait quand même tomber le mob** (`answerBattle`). Arène 2–4 joueurs (en mémoire). **Pas de reconnexion à une arène après changement d'appareil testée, pas de Raid ni de mode TV.** |
| 11  | Économie et récompenses           | 🟠   | Pièces, rubis (1 rubis = 2 000 pièces), objets (stock max 9), équipement 3 emplacements, coffre d'entraînement **aléatoire** (doit être garanti). Héros choisis librement (doivent venir des coffres). Pas de skins, pas d'idempotence des achats.                            |
| 12  | Interfaces et responsive          | 🟡   | Tablette et smartphone testés de bout en bout ; PC et TV non testés.                                                                                                                                                                                                          |
| 13  | Tests existants                   | ✅   | 1 317 tests unitaires/intégration, 14 de bout en bout, couverture bloquante par paquet (web ≥ 60 %).                                                                                                                                                                          |
| 14  | CI/CD                             | ✅   | Format, lint (complexité), types, architecture, code mort, couverture, Postgres réel, E2E, Trivy, publication Docker.                                                                                                                                                         |
| 15  | Sécurité                          | 🟠   | En-têtes stricts, limitation de débit, validation des entrées et sorties, temps réel contrôlé, image durcie. **Faille majeure : pas d'authentification ni d'isolation.**                                                                                                      |
| 16  | Performances                      | 🟡   | Requêtes indexées, pas de N+1 connu ; pas de mesure de charge.                                                                                                                                                                                                                |
| 17  | Accessibilité                     | 🟡   | Rôles et libellés ARIA utilisés par les tests, animations réduites ; contrastes et navigation clavier non vérifiés systématiquement.                                                                                                                                          |
| 18  | Administration                    | ❌   | Aucune interface ni rôle d'administration.                                                                                                                                                                                                                                    |
| 19  | Sauvegardes et migrations         | 🟠   | Migrations versionnées et testées (commande dédiée). Sauvegardes seulement documentées (`docs/operations/deploiement.md`), pas d'outil ni de test de restauration.                                                                                                            |
| 20  | Fonctionnalités commerciales      | ❌   | Pas d'offre, de droits d'accès, de paiement, d'abonnement.                                                                                                                                                                                                                    |

## Contenu par matière

| Matière         | CM1 | CM2 | 6e  | 5e  | 4e  | 3e  | Adulte |
| --------------- | --- | --- | --- | --- | --- | --- | ------ |
| Mathématiques   | 15  | 15  | 18  | 17  | 14  | 13  | ❌     |
| Anglais         | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌     |
| Espagnol        | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌     |
| Histoire        | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌     |
| Géographie      | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌     |
| Physique-chimie | —   | —   | —   | ❌  | ❌  | ❌  | ❌     |

(Nombre de chapitres, chacun avec son boss. Physique-chimie : discipline enseignée à partir du
cycle 4 ; au CM et en 6e, « sciences et technologie ».)

## Modes de jeu

| Mode                         | État                                               |
| ---------------------------- | -------------------------------------------------- |
| Entraînement                 | ✅ (séries de 4, 5 en calcul mental)               |
| Combat de boss (« Quête »)   | 🟠 bug de règle (mob passé après une erreur)       |
| Arène (multi, tour par tour) | 🟡 reconnexion et changement d'appareil non testés |
| Contre-la-montre, Survie     | ❌ annoncés « à venir »                            |
| Raid (coop contre un boss)   | ❌ annoncé « à venir »                             |
| Mode TV + manettes           | ❌                                                 |
