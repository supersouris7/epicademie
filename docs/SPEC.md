# Questeo — Spécification V1

> Application web d'exercices du programme de **5e (cycle 4)**, ludique et gamifiée, pensée tablette, avec multijoueur où les smartphones servent de télécommandes.
> Statut : **validée** — 2026-11-16

---

## 1. Décisions validées

| Sujet        | Choix                                                                                                                                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Front        | React 19 + Vite + TypeScript strict, Tailwind CSS, Framer Motion                                                                                                                                                                                           |
| Back         | Node 24 + Fastify + Socket.IO (TypeScript)                                                                                                                                                                                                                 |
| Données      | SQLite (better-sqlite3) + Drizzle ORM, migrations versionnées                                                                                                                                                                                              |
| Déploiement  | Réseau local maison, Docker Compose (un seul conteneur)                                                                                                                                                                                                    |
| Utilisateurs | Profils avatars **sans mot de passe**, dashboards ouverts à tous                                                                                                                                                                                           |
| Contenu      | Générateurs procéduraux (maths, physique) + banques rédigées (langues, histoire, géo)                                                                                                                                                                      |
| Formats      | Saisie + pavé numérique, QCM / Vrai-Faux, glisser-déposer / associer, carte interactive, audio (synthèse vocale)                                                                                                                                           |
| Gamification | XP + niveaux, séries quotidiennes + défi du jour + combos, trophées + avatar personnalisable (pièces)                                                                                                                                                      |
| Drill maths  | Répétition espacée adaptative, sprints contre-la-montre, correction expliquée pas-à-pas                                                                                                                                                                    |
| Style        | Cartoon coloré « aventure », mascotte, confettis ; sons + musique ; mode sombre                                                                                                                                                                            |
| Multijoueur  | 2–6 joueurs, hôte = tablette ou TV ; modes Arène, Raid, Quiz plateau TV, Course de calcul, Handicap parent/enfant                                                                                                                                          |
| Qualité      | TS strict, ESLint + Prettier, Vitest, Playwright, Husky + lint-staged, GitHub Actions                                                                                                                                                                      |
| Repo         | Monorepo pnpm, dépôt GitHub privé                                                                                                                                                                                                                          |
| Portée V1    | Socle complet + **maths 5e complètes** ; autres matières : 2–3 notions chacune                                                                                                                                                                             |
| Mascotte     | **Questy**, avatar rond à écran LED façon pixelbot ; 12 humeurs en pixels, chacune sa couleur (rouge énervé, bleu content, vert ça roule…)                                                                                                                 |
| Avatars      | DiceBear (styles libres, embarqués, attributions dans « À propos »)                                                                                                                                                                                        |
| Contenu      | Pas de relecture humaine prévue → **chaque fait est sourcé** (champ `source` obligatoire dans les banques, sources officielles en priorité : programmes Éduscol / BO, Insee, Ined, ONU, BnF, encyclopédies de référence) et vérifié par tests de cohérence |
| Livraison    | Images Docker sur Docker Hub : tag `unstable` à chaque push sur `main`, tags semver (`1.0.1`, `1.0`, `1`, `latest`) à chaque tag git `v*.*.*`                                                                                                              |

---

## 2. Architecture

```
questeo/
├── apps/
│   ├── web/              React + Vite (SPA) — écran élève, hôte multijoueur, télécommande
│   └── server/           Fastify : API REST, Socket.IO, sert le build de web/
├── packages/
│   ├── shared/           Types, schémas zod, protocole Socket.IO, constantes de gamification
│   ├── content/          Générateurs d'exercices, banques de questions, correcteurs (pur TS, sans I/O)
│   └── engine/           Moteur pur : répétition espacée, XP/niveaux, trophées, scoring multijoueur
├── e2e/                  Tests Playwright
├── docker/               Dockerfile + compose.yml
└── docs/                 Spécification, ADR
```

**Principes**

- `content` et `engine` sont **purs et déterministes** (graine aléatoire injectable) → tests unitaires exhaustifs, réutilisables côté client (solo hors-réseau ponctuel) et serveur (multijoueur autoritaire).
- Le **serveur fait foi** : en multijoueur il génère les questions, chronomètre et corrige ; le client n'envoie que des réponses brutes.
- Validation **zod** à chaque frontière (HTTP, socket, lecture des banques).
- Aucune dépendance réseau externe à l'exécution (polices, cartes, avatars, sons embarqués).

**Bibliothèques front prévues** : React Router, Zustand (état UI), TanStack Query (données serveur), Recharts (dashboards), dnd-kit (glisser-déposer), d3-geo + Natural Earth (cartes SVG), Howler.js (sons), `qrcode` (QR), KaTeX (fractions/formules), DiceBear (avatars, styles sous licence libre, embarqués).

---

## 3. Modes d'écran

| Mode                      | Appareil                     | Contenu                                                                                               |
| ------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Tablette** (par défaut) | tablette paysage/portrait    | cibles tactiles ≥ 56 px, pavé numérique intégré (pas de clavier système), gestes simples, plein écran |
| **Hôte**                  | tablette / TV via navigateur | grande typographie, question + classement en direct, QR code de connexion                             |
| **Télécommande**          | smartphone                   | boutons géants A/B/C/D, pavé numérique, buzzer, retour haptique (vibration)                           |
| Bureau                    | PC                           | même UI que tablette, raccourcis clavier                                                              |

---

## 4. Profils et données

Profils créés depuis l'écran d'accueil (prénom + avatar). Aucun mot de passe, aucun email. Tous les dashboards sont visibles par tous.

### Modèle de données (SQLite)

| Table                    | Contenu clé                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `profiles`               | id, prénom, avatar (config JSON), xp, niveau, pièces, thème, réglages son                  |
| `skills`                 | catalogue des notions (id stable, matière, chapitre, prérequis) — semé depuis `content`    |
| `skill_mastery`          | profil × notion : score de maîtrise 0–1, intervalle SRS, prochaine échéance, nb tentatives |
| `sessions`               | partie solo ou multi : mode, matière, début/fin, score, XP gagné                           |
| `attempts`               | chaque réponse : question (graine + paramètres), réponse donnée, correct, temps de réponse |
| `records`                | meilleur score par profil × notion × mode (sprint 60 s, série parfaite…)                   |
| `trophies`               | trophées débloqués (id, date)                                                              |
| `inventory`              | objets d'avatar achetés / équipés                                                          |
| `streaks`                | jours d'activité, série courante, record de série                                          |
| `daily_challenges`       | défi du jour (graine de date), résultat par profil                                         |
| `mp_games`, `mp_players` | historique des parties multijoueur                                                         |

---

## 5. Contenu — programme officiel 5e (cycle 4)

Chaque matière est découpée en **chapitres → notions (skills)**. Une notion = un type d'exercice atomique, avec 3 paliers de difficulté.

### 5.1 Mathématiques — V1 complète

Référence : **nouveau programme du cycle 4, BO n°10 du 5 mars 2026** (arrêté du 18 février 2026), applicable en **5e dès la rentrée 2026**. Texte lu : annexe 2 « Programme de mathématiques pour le cycle 4 » publiée sur education.gouv.fr. Chaque notion cite dans sa leçon l'objectif officiel correspondant.

Différences notables avec l'ancien programme de 2020 en 5e : la simplification des fractions et la multiplication des relatifs passent en 4e ; arrivent en 5e les puissances (carré, cube), la valeur absolue, la division par un décimal, les critères de divisibilité par 3 et 9, le calcul littéral (substitution, k(a+b), réduire ax+b, équations ax = c et x + b = c), hauteurs, médianes, médiatrices, fonctions (« en fonction de ») et programmation par blocs.

| Chapitre                | Notions (identifiants `m5-…` dans `packages/content/src/maths`)                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calcul mental           | tables, division euclidienne, décomposer en produit, produits décimaux, × ÷ 10/100/1000, addition/soustraction de décimaux                                                       |
| Opérations et priorités | priorités, somme/produit/termes/facteurs, programme de calcul → expression, distributivité numérique, multiples/diviseurs, divisibilité (2, 3, 5, 9, 10), diviser par un décimal |
| Nombres relatifs        | opposé/valeur absolue/signe, droite graduée, comparer/ranger, addition, soustraction, enchaînements, problèmes                                                                   |
| Fractions               | écriture décimale, quotient, droite graduée, fractions égales, comparer, partie entière, addition, soustraction, fraction d'un nombre, problèmes                                 |
| Puissances              | notation carré/cube, carrés 0–12, calculs avec puissances                                                                                                                        |
| Calcul littéral         | suites de motifs, formules, substitution, tester une égalité, somme ou produit, développer/factoriser, réduire, équations                                                        |
| Repérage                | abscisse décimale, coordonnées (lire, placer)                                                                                                                                    |
| Solides et volumes      | volumes cube/pavé/prisme, unités de volume et contenance, aire du disque et volume du cylindre, patron du cube                                                                   |
| Symétries               | symétrie axiale (automatisme), symétrie centrale, propriétés                                                                                                                     |
| Angles                  | vocabulaire, angles et parallèles (alternes-internes, correspondants)                                                                                                            |
| Triangles               | somme des angles (et constructibilité), aire, hauteurs/médianes/médiatrices                                                                                                      |
| Parallélogrammes        | propriétés et parallélogrammes particuliers, aire, conversions longueurs/aires                                                                                                   |
| Statistiques            | effectifs et fréquences, moyenne, lecture de diagramme                                                                                                                           |
| Probabilités            | vocabulaire, calcul (équiprobabilité), échelle et fréquences                                                                                                                     |
| Proportionnalité        | reconnaître (tableau, graphique), linéarité/retour à l'unité, pourcentages, prix unitaire/vitesse/échelle                                                                        |
| Fonctions               | grandeur en fonction d'une autre, lecture de graphique                                                                                                                           |
| Programmation           | prévoir la sortie d'un programme par blocs, boucle « répéter »                                                                                                                   |

17 chapitres, 72 notions, 3 niveaux chacune. Chaque générateur fournit l'énoncé, la réponse exacte (arithmétique rationnelle, sans flottants), les **erreurs typiques reconnues** avec leur explication, la correction pas-à-pas et une leçon sourcée.

**Contrôle qualité du contenu** (pas de relecture humaine) : test structurel sur 150 graines × 3 niveaux × 72 notions (réponse acceptée, pièges ≠ réponse, options distinctes, figures valides, déterminisme) et **vérification indépendante** : chaque énoncé « Calcule … » est réévalué par un évaluateur séparé et comparé à la réponse attendue.

### 5.2 Physique-chimie — V1 : 3 notions

- États de la matière et changements d'état (QCM + associer)
- Vitesse : v = d / t, conversions km/h ↔ m/s (générateur)
- Circuits électriques : série / dérivation, court-circuit (QCM sur schémas)

_Ensuite_ : masse et volume, mélanges et corps purs, énergie, lumière et son.

### 5.3 Anglais — V1 : 3 notions

- Vocabulaire thématique (famille, école, maison, nourriture…) avec audio TTS en-GB
- `be` / `have got` / présent simple (conjugaison, à trous)
- Prétérit : verbes irréguliers courants ★ (drill répétition espacée)

_Ensuite_ : présent en be+ing, comparatifs/superlatifs, there is/are, questions WH, génitif.

### 5.4 Espagnol (LV2 débutant) — V1 : 3 notions

- Nombres, couleurs, jours, mois (audio TTS es-ES)
- `ser` / `estar` / `tener` au présent
- Verbes réguliers -ar / -er / -ir au présent

_Ensuite_ : me gusta, hay, la hora, pays hispanophones et capitales.

### 5.5 Histoire — V1 : 2 notions

- Frise chronologique Moyen Âge → XVIIe (glisser-déposer : Clovis, Charlemagne 800, Hégire 622, 1ère croisade 1096, Bouvines 1214, 1492, Marignan 1515, édit de Nantes 1598, Louis XIV…)
- Byzance, empire carolingien et islam (VIe–XIIIe) : QCM

_Ensuite_ : société féodale, affirmation de l'État royal, Renaissance et Réformes, du prince de la Renaissance au roi absolu.

### 5.6 Géographie — V1 : 2 notions

- Repères : continents, océans, grands pays et capitales (carte interactive : cliquer le bon pays)
- La question démographique et l'inégal développement (QCM, lecture de cartes/graphiques)

_Ensuite_ : ressources (eau, énergie, alimentation), risques et changement global.

---

## 5bis. Profils, aides et tableau de bord

- **Profil** : prénom, fille ou garçon, date de naissance (3 à 100 ans). Les textes s'accordent (Prêt/Prête, titres Apprenti/Apprentie… Champion/Championne). Avatar « Personnage » (DiceBear big-ears) avec coiffures longues pour une fille, courtes pour un garçon.
- **Âge et duels** : `packages/engine/src/duel.ts` — le plus jeune joue au niveau de référence ; écart de 1–2 ans → temps × 0,9 ; 3–5 ans → +1 niveau, temps × 0,75 ; ≥ 6 ans → +2 niveaux, temps × 0,6 ; adulte contre enfant → +2 niveaux, temps × 0,5. Utilisé par le multijoueur (à venir).
- **Pas besoin de brouillon** : ardoise (dessin au doigt/stylet) sur toutes les questions ; calculatrice seulement sur les notions où le calcul n'est pas l'objectif (volumes, disque/cylindre, moyenne, fréquences, pourcentages, proportionnalité, prix/vitesse/échelle) ; tableau de conversion à remplir (longueurs, aires, volumes et contenances alignées) sur les conversions.
- **« Je n'ai pas compris »** (remplace « Revoir la leçon ») : leçon, puis un nouvel exemple de la notion résolu étape par étape, puis la question similaire ; la notion repasse « à revoir » en fin de partie.
- **Tableau de bord « Mes progrès »** : matière → domaine officiel → chapitre → notion, avec médaille : bronze (1re réussite), argent (2e, J+2), or (acquise, J+7), platine (acquise, ≥ 90 % sur les réponses récentes et au moins un rappel mensuel réussi).

## 6. Moteur pédagogique

### 6.1 Répétition espacée adaptative

- État par profil × notion : `maîtrise ∈ [0,1]`, `intervalle`, `échéance`.
- Bonne réponse rapide → maîtrise ↑ et intervalle × 2 ; lente → ↑ faible ; erreur → maîtrise ↓, intervalle réinitialisé.
- Le sélecteur de session (« Entraînement intelligent ») tire : 60 % notions échues/faibles, 30 % notions en cours, 10 % révision de notions maîtrisées.
- À l'intérieur d'une notion, les **paramètres ratés** reviennent (ex. 7×8 raté → reproposé dans 2–4 questions).
- Difficulté adaptée : 3 réussites rapides consécutives → palier +1 ; 2 erreurs → palier −1.

### 6.2 Parcours de jeu

Accueil → **choix du mode** → choix de la matière (si le mode le demande) → choix du thème → partie.
Catalogue typé dans `packages/shared/src/modes.ts`.

| Catégorie   | Mode                | Portée            | Principe                                                                                                                    |
| ----------- | ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Apprendre   | Révisions du jour   | toutes matières   | notions échues selon la répétition espacée ; badge « N à revoir » sur l'accueil                                             |
| Apprendre   | Entraînement        | matière → thème   | 10 questions, difficulté adaptative, sans pression                                                                          |
| Apprendre   | Combat de boss      | matière → thème   | boss du thème, bonne réponse = dégâts, erreur = −1 cœur (3 cœurs) ; boss final de matière quand tous les thèmes sont acquis |
| Apprendre   | Atelier des erreurs | toutes matières   | uniquement les questions ratées : explication puis variante, jusqu'à réussite                                               |
| Défis       | Contre-la-montre    | matière → thème   | max de bonnes réponses en 60 s, record par thème                                                                            |
| Défis       | Survie              | matière → thème   | difficulté croissante, 3 vies, record de vagues                                                                             |
| Défis       | Défi du jour        | toutes matières   | 10 questions identiques pour la famille (graine = date), classement du jour, bonus XP                                       |
| Défis       | Bilan               | global ou matière | test sans aide : note /20 **et** niveau de maîtrise par thème, plan de révision généré                                      |
| Multijoueur | voir §9.2           |                   |                                                                                                                             |

**Boss et adversaires** : univers moderne (aliens, ninjas, gunners, robots, hackers…), jamais médiéval-fantastique. Rendu **écran LED comme Questy** : visage pixel, plus une silhouette et un équipement propres (antennes, bandeau, visière), avec leurs couleurs et leurs grimaces de boss. Personnages originaux.

### 6.3 Acquisition d'une notion

- **Acquise** = 3 réussites espacées sans erreur : J0, J+2, J+7. Ensuite, rappel d'entretien mensuel. Une erreur repasse la notion « à revoir » (J+1).
- **Évaluation** affichée en double : **note /20** et **niveau de maîtrise** à l'échelle du livret scolaire (LSU) : insuffisante / fragile / satisfaisante / très bonne. Le tout est calculé par thème, par matière et en global.
- **Rappels** : badge « N notions à revoir aujourd'hui » sur l'accueil et sur le mode Révisions ; Questy prend l'air triste si des notions sont en retard. La **série quotidienne** (flamme) n'est maintenue que si les révisions du jour sont faites.

### 6.4 Quand l'élève se trompe

1. **Pourquoi cette erreur** : chaque mauvaise réponse typique est reconnue par le générateur (ex. « tu as additionné les dénominateurs », « le signe − s'applique à tout le produit ») et reçoit une explication ciblée.
2. **Correction pas-à-pas** animée (surlignage de l'étape en cours).
3. **Rappel de cours** : bouton « Revoir la leçon » qui ouvre une fiche courte de la notion avec un exemple.
4. **Variante immédiate** : une question similaire juste après pour vérifier ; la notion passe en « à revoir » dans la répétition espacée.

---

## 7. Gamification

- **XP** : 10 par bonne réponse, + bonus vitesse (jusqu'à +5), × combo (×1,5 à 5 d'affilée, ×2 à 10), + 50 défi du jour.
- **Niveaux** : courbe `xp(n) = 100 · n^1,5` ; titres : Apprenti → Explorateur → Aventurier → Héros → Champion → Légende.
- **Séries** : flamme 🔥 par jour avec ≥ 1 session ; jalons 3, 7, 30, 100 jours.
- **Pièces** : gagnées par session et trophée ; boutique d'avatar (chapeaux, tenues, accessoires, fonds, animations de victoire).
- **Trophées** (~40 en V1) : premiers pas, maître des tables (toutes tables ≥ 90 %), records de sprint (bronze / argent / or / diamant), série de 7 jours, sans-faute, champion multijoueur…
- **Récompenses graphiques** : confettis, médaille animée en plein écran sur nouveau record, montée de niveau avec mascotte, vitrine de trophées.
- **Sons** : réussite, erreur, combo, level-up, musique d'ambiance — volumes réglables, coupure globale.

---

## 8. Dashboards et historique

- **Mon tableau de bord** : niveau, XP, série, maîtrise par matière (radar), progression dans le temps (courbe), notions à retravailler, records, trophées.
- **Historique** : liste des sessions filtrable, détail question par question (erreurs revoyables).
- **Vue famille** : tous les profils côte à côte, activité de la semaine, comparaison de records (ouvert à tous).

---

## 9. Multijoueur

### 9.1 Connexion

1. L'hôte (tablette/TV) crée une salle → code à 4 lettres + **QR code** vers `http://<IP-LAN>:<port>/j/<CODE>` (IP LAN détectée par le serveur, surchargeable par variable d'env).
2. Le smartphone scanne → choisit un profil existant ou joue en invité → devient télécommande.
3. Reconnexion automatique (Socket.IO + jeton de joueur en `sessionStorage`) si l'écran du téléphone se met en veille.

### 9.2 Modes

| Mode                 | Déroulé                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Arène**            | chaque joueur a une barre de vie ; ses bonnes réponses attaquent les autres, les combos déclenchent des coups spéciaux ; le dernier debout gagne |
| **Raid**             | toute l'équipe contre un boss géant sur l'écran TV ; chaque bonne réponse lui inflige des dégâts, chaque erreur ou retard le soigne              |
| **Quiz plateau TV**  | question à l'écran hôte, buzzer et choix sur les téléphones, points selon rapidité, classement animé entre les questions                         |
| **Course de calcul** | chacun reçoit son flux de questions sur son téléphone, l'écran hôte montre une course, le premier à 20 bonnes réponses gagne                     |
| **Handicap**         | applicable à tout mode : par joueur, temps réduit et/ou palier de difficulté supérieur (parent vs enfant)                                        |

### 9.3 Protocole (Socket.IO, typé dans `packages/shared`)

- Client → serveur : `room:create`, `room:join`, `room:configure`, `game:start`, `answer:submit`, `player:ready`
- Serveur → clients : `room:state`, `game:question`, `game:tick`, `game:reveal`, `game:scoreboard`, `game:end`
- Toutes les charges validées par zod ; serveur autoritaire sur le temps et le score ; XP/historique enregistrés pour les profils non invités.

---

## 10. Qualité

- TypeScript `strict` + `noUncheckedIndexedAccess` dans tous les packages.
- ESLint (flat config, typescript-eslint strict-type-checked, react-hooks, jsx-a11y) + Prettier.
- **Vitest** : tous les générateurs (propriétés : réponse correcte vérifiée, distracteurs ≠ réponse, déterminisme par graine), moteur SRS, XP, trophées, logique de salle.
- **Playwright** : parcours solo, création de profil, record + trophée, **multijoueur avec 3 contextes navigateur** (hôte + 2 téléphones émulés).
- Husky + lint-staged (lint/format au commit), Conventional Commits.
- GitHub Actions : install → lint → typecheck → tests unitaires → build → E2E.
- Accessibilité : contrastes AA en clair/sombre, `prefers-reduced-motion` respecté, tailles de texte réglables.

---

## 11. Déploiement local

- `docker compose up` → un conteneur Node qui sert le front buildé + API + Socket.IO sur le port 3000 ; volume pour `questeo.db`.
- Sauvegarde : export/import JSON de la base depuis la vue famille.
- Dev : `pnpm dev` (Vite + serveur en watch, accessible sur le LAN pour tester avec un vrai téléphone).

---

## 12. Plan de réalisation

| Jalon                    | Contenu                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **J1 — Socle**           | monorepo, outillage qualité, CI, serveur + BDD, profils/avatars, thème cartoon clair/sombre, mode tablette |
| **J2 — Moteur**          | format d'exercice générique, pavé numérique, QCM, correction pas-à-pas, SRS, XP/niveaux, sons              |
| **J3 — Maths**           | tous les générateurs maths 5e + tests ; sprints et records                                                 |
| **J4 — Gamification**    | trophées, pièces, boutique avatar, séries, défi du jour, animations de récompense                          |
| **J5 — Dashboards**      | tableau de bord, historique, vue famille                                                                   |
| **J6 — Multijoueur**     | salles, QR, télécommande, 4 modes, handicap, E2E multi-contextes                                           |
| **J7 — Autres matières** | glisser-déposer, carte interactive, TTS ; notions V1 de physique, anglais, espagnol, histoire, géo         |
| **J8 — Finition**        | Docker, export/import, polish, accessibilité                                                               |

---

## 13. Livraison continue

- Workflow GitHub Actions unique : `quality` (lint, typecheck, tests, build, E2E) → `docker` (seulement si `quality` passe).
- Push sur `main` → `docker.io/<user>/questeo:unstable` (+ `sha-<court>`).
- Tag `v1.0.1` → `:1.0.1`, `:1.0`, `:1`, `:latest`.
- Images multi-architecture `linux/amd64` + `linux/arm64` (Raspberry Pi possible).
- Secrets requis dans le dépôt GitHub : `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` (jeton d'accès Docker Hub, droits Read & Write).
