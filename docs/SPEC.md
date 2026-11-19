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

- **Profil** : prénom, fille ou garçon, date de naissance (3 à 100 ans). Les textes s'accordent (Prêt/Prête, titres Apprenti/Apprentie… Champion/Championne). Héros au choix, tous libres et purement cosmétiques : Alex, Tao, Lina, Ayla, Pixel (migrations 0008 puis 0009 : Nassim renommé Alex). Avatar au choix : Visage (par défaut), Émoji ou Robot (DiceBear) ; le style « Personnage » a été retiré (tête trop coupée dans l’anneau, profils migrés vers Visage).
- **Âge et duels** : `packages/engine/src/duel.ts` — le plus jeune joue au niveau de référence ; écart de 1–2 ans → temps × 0,9 ; 3–5 ans → +1 niveau, temps × 0,75 ; ≥ 6 ans → +2 niveaux, temps × 0,6 ; adulte contre enfant → +2 niveaux, temps × 0,5. Utilisé par le multijoueur (à venir).
- **Conseils de Questy** (calculatrice, brouillon) : seulement à la 1re question de chaque notion dans une partie. Le tableau de conversion n'est proposé que si la question mêle deux unités d'une même grandeur (ou sur les notions de conversion).
- **Entraînement** : en haut de la liste des chapitres, « Je te propose » (à revoir d'abord, sinon chapitre commencé, sinon le premier non acquis).
- **Pas besoin de brouillon** : ardoise (dessin au doigt/stylet) sur toutes les questions ; calculatrice seulement sur les notions où le calcul n'est pas l'objectif (volumes, disque/cylindre, moyenne, fréquences, pourcentages, proportionnalité, prix/vitesse/échelle) ; tableau de conversion à remplir (longueurs, aires, volumes et contenances alignées) sur les conversions.
- **« Le truc à retenir »** (remplace « Je n'ai pas compris » et la leçon de manuel) : mémo de 2-3 phrases à hauteur d'enfant, ouvert à la demande depuis l'explication, jamais imposé ; l'ouvrir signale la notion comme mal comprise.
- **Tableau de bord « Mes progrès »** : matière → domaine officiel → chapitre → notion, avec médaille d'après la **meilleure série de 5** questions sur la notion (bonnes réponses du 1er coup) : bronze 3/5, argent 4/5, **or 5/5 = notion acquise** (règle du 18/11/2026 ; plus de points de progression ni de platine ; migration 0013 : stade 1 → 3/5, 2 → 4/5, 3 → 5/5). En tête de page, **toile d'araignée** des compétences : un axe par domaine de la classe choisie, part de notions en or.

## 6. Moteur pédagogique

### 6.1 Répétition espacée adaptative

- État par profil × notion : `maîtrise ∈ [0,1]`, `intervalle`, `échéance`.
- Bonne réponse rapide → maîtrise ↑ et intervalle × 2 ; lente → ↑ faible ; erreur → maîtrise ↓, intervalle réinitialisé.
- Le sélecteur de session (« Entraînement intelligent ») tire : 60 % notions échues/faibles, 30 % notions en cours, 10 % révision de notions maîtrisées.
- À l'intérieur d'une notion, les **paramètres ratés** reviennent (ex. 7×8 raté → reproposé dans 2–4 questions).
- Difficulté adaptée : niveau 1 → 2 après 2 réussites d'affilée, niveau 2 → 3 après 3 ; 2 erreurs → palier −1.

### 6.2 Parcours de jeu

Accueil → **choix du mode** → choix de la matière → choix du thème → partie. Seul l'Entraînement est jouable : les autres modes sont grisés avec l'étiquette « À venir » (un appui affiche « Bientôt disponible ! »). Révisions du jour, Atelier des erreurs, Défi du jour et Bilan ont été retirés (novembre 2026) ; les notions à revoir sont proposées par « Je te propose » dans l'Entraînement.
Catalogue typé dans `packages/shared/src/modes.ts`.

| Catégorie   | Mode             | Portée          | Principe                                                                                                                    |
| ----------- | ---------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Apprendre   | Entraînement     | matière → thème | 5 questions, difficulté adaptative, coffres d’équipement à gagner                                                           |
| Apprendre   | Combat de boss   | matière → thème | boss du thème, bonne réponse = dégâts, erreur = −1 cœur (3 cœurs) ; boss final de matière quand tous les thèmes sont acquis |
| Défis       | Contre-la-montre | matière → thème | max de bonnes réponses en 60 s, record par thème                                                                            |
| Défis       | Survie           | matière → thème | difficulté croissante, 3 vies, record de vagues                                                                             |
| Multijoueur | voir §9.2        |                 |                                                                                                                             |

**Boss et adversaires** : univers moderne (aliens, ninjas, gunners, robots, hackers…), jamais médiéval-fantastique. Rendu **écran LED comme Questy** : visage pixel, plus une silhouette et un équipement propres (antennes, bandeau, visière), avec leurs couleurs et leurs grimaces de boss. Personnages originaux.

### 6.2 bis Combat de boss (livré le 17/11/2026, v1)

- **Déroulé (10 questions)** : 7 mobs envoyés par le boss (notions d'entraînement du chapitre, chacune avant qu'une autre revienne ; niveau 1 pour les 3 premiers, puis 2), puis le boss à 3 vies : 2 **problèmes en contexte**, puis 1 **question piège** (les mauvaises réponses proposées sont les erreurs typiques). Le héros a 3 cœurs. Jamais deux fois le même énoncé dans un combat ni dans les derniers combats du chapitre. Erreur contre un mob : riposte (−1 cœur) et le mob s'enfuit ; erreur contre le boss : riposte et nouvelle question du même type. Pas de 2e essai : « Tu as répondu… la bonne réponse… », pourquoi, « Voir tout » (bulles) et « Le truc à retenir ». 0 cœur = défaite → bouton « S'entraîner » sur la notion la plus ratée.
- **Serveur qui fait foi** : l'état du combat vit dans `sessions.battle` (`packages/engine/src/battle.ts`, routes `/api/battles`) ; le client n'envoie que la réponse à la question en cours. Les questions de boss ne comptent pas dans la répétition espacée.
- **Écran** : entrée en scène en grand (Alex et l'adversaire arrivent en courant, « Combat ! »), puis bandeau compact en haut (tête et cœurs du héros, tête et vies de l'adversaire sur une bande de l'arène, tirs entre les deux têtes) pour laisser l'écran aux énoncés. Optimisé tablette verticale et PC. Arène tirée au hasard parmi **3** (académie, station spatiale, volcan ; jungle et glaces retirées le 18/11/2026), chacune en 4 formats. Le boss mesure 1,4 fois le héros ; mobs à la taille du héros. Les scènes de tir et de riposte se jouent au milieu de l'écran ; seule la dernière action est jouée (plus de tirs croisés). Ancienne description : arène en haut (≈30 % de la hauteur sur tablette, bandeau sur téléphone), héros à gauche, adversaire à droite, cœurs et vies du boss ; zone de réponse de l'entraînement en dessous (mêmes outils). Bonne réponse : pose « tir » → boule de plasma → adversaire « touché » → suivant automatique. Images fixes animées en code ; remplaçants provisoires tant que le kit n'est pas importé.
- **Accès** : tous les boss sont ouverts d'emblée (pas de déverrouillage). 1re victoire : médaille, coffre (1 bouclier, 1 soin, 1 indice) et +50 pièces. XP : 10 par bonne réponse + 50 pour la victoire.
- **Équipement** (panneau « Équipement » de la page des boss ; gagné dans les **coffres** de l'entraînement : fin de série, chance selon le score — 5/5 garanti, 4/5 60 %, 3/5 35 %, sinon 10 % — rareté commune 60 % / rare 30 % / épique 10 %, 1 à 3 objets + 10 à 40 pièces ; jamais achetable) (`inventory`, 9 max chacun). **Réserve et équipement** (18/11/2026) : sur la page des boss, la tête du héros et **3 emplacements** ; toucher un objet de la réserve l'équipe (types mélangés), toucher un emplacement le remet en réserve (`profiles.equipped`, `PUT /api/profiles/:id/equipment`). En combat, seuls les objets équipés servent ; utilisé, un objet quitte l'équipement et l'inventaire ; non utilisé, il reste équipé pour le combat suivant : bouclier (bloque la prochaine riposte ; gagné par un sans-faute à l'entraînement), soin (+1 cœur ; gagné à chaque notion acquise), indice (affiche l'indice ; 20 pièces).
- **Pas de munitions** (supprimées le 18/11/2026, migration 0011) : Alex tire une boule de plasma violette dessinée en code.
- **Héros** : purement cosmétiques, choisis dans le menu à part « Mon héros » (`/heros`, depuis la carte du héros de l'accueil), pas dans le profil. Seul **Alex** est dessiné (pack du 18/11/2026 : 6 poses — attente, course, tir, bouclier, saut, victoire — et 12 expressions) ; Tao, Lina, Ayla et Pixel sont « À venir » (cartes grisées), migration 0010 : tous les profils sur Alex. En combat, Alex arrive en courant, tire (bonne réponse), lève son bouclier (riposte bloquée), recule (touché), saute de joie (victoire) ; sa tête dans le HUD change d'expression (joie, enthousiaste, colère, triste, surprise, réflexion, rire, étourdi). Pose manquante (touché, défaite) : la pose d'attente animée. **Un seul boss par matière** (18/11/2026) : le Golem des Équations pour tous les chapitres et toutes les classes de maths, même apparence partout (plus de teinte par chapitre), mêmes mobs (calculatrice, cube-bot, bloc de code). Géomatrix, Probabot, Courbix et l'IA des Connaissances restent au catalogue d'images pour les futures matières. **Kit du boss des maths livré le 18/11/2026** : mage-golem encapuchonné violet et or (π au front, cube d'opérations) — 6 poses (attente, attaque retournée vers le héros, bouclier, invocation, touché, KO), 13 expressions de tête et une illustration. L'illustration en pied s'affiche en grand sur l'écran rouge « Choisir mon chapitre » (gros plan à l'entrée de la matière), sans son nom ; la carte « Combat de boss » de l'accueil garde son icône d'origine. En combat, sa tête réagit : menaçant (3 vies), inquiet (2), en colère (1), surpris ou furieux quand il est touché, rire quand le héros se trompe, perplexe sur un bouclier, KO ; il arrive en pose d'invocation, l'air moqueur ; bilan : KO (victoire) ou derrière son bouclier (défaite). Face-à-face : moqueur ou en colère s'il a déjà perdu sur le chapitre.
- **Quitter une partie** (pause → Quitter, entraînement ou combat) ramène au menu principal (`/hub`). Toute sortie de partie (Quitter, Accueil, Autres boss, Autre notion, On s'entraîne) **remplace** la partie dans l'historique : « précédent » ne relance jamais une partie quittée (s'il y retombe, retour à la liste). Pendant une partie, « précédent » ouvre la même confirmation que la Pause. Le gros plan du boss ne s'affiche pas au retour d'un combat ni par « précédent ».
- **Mode rage** (18/11/2026) : quand le boss tombe à sa dernière vie, scène plein écran en deux grandes images : « début de rage » (« Grrr… Tu m'as touché deux fois ? Tu vas le regretter… ») puis « rage » qui éclate avec secousse (« MODE RAGE ! Plus personne ne m'arrête ! »), environ 2,5 s chacune, un toucher avance. Ensuite, dans l'arène, le Golem garde son apparence de rage (attente, attaque, touché ; le KO garde sa pose) et sa tête du bandeau est « furieux ». Le texte « Combat ! » du début est retiré.
- **Dialogues** (19/11/2026, `apps/web/src/lib/dialogue.ts`) : chaque réplique porte son expression de visage. Voix des héros : Alex l'inventeur (geek, jeux de mots techno), Lina l'électrique (survoltée, compétitive), Pixel le chat ninja (flegmatique, taquin, « miaou ») ; le Golem théâtral et mauvais perdant ; le π-bot fayot (« bip bip »). Face-à-face : échange de 4 vannes boss ↔ héros tirées au hasard ; répliques après chaque coup (héros et adversaire) sous le bandeau ; arrivée du boss (boss, héros, Questy) ; réaction à la rage ; mot de la fin au bilan.
- **Rage** : 3 paliers d'environ 3 s (début, montée progressive avec flashs blancs, rage) ; arrivée du boss ≈ 6 s (sans texte « … arrive ! »), pose finale (KO, défaite) ≈ 3 s ; tout se passe d'un toucher.
- **Maîtrise** affichée = celle de la médaille : À travailler, Fragile (bronze), Satisfaisante (argent), Acquise (or).
- **Multijoueur temps réel** (socket.io, `apps/server/src/realtime.ts`) : plusieurs joueurs connectés en même temps, chacun sur son appareil ; un profil déjà ouvert ailleurs est refusé (« Non, ce joueur est déjà connecté », `GET /api/presence`). Questy annonce les connectés sur l'accueil ; page « Joueurs connectés » (`/connectes`) : messages prédéfinis et emoji seulement (pas de texte libre), reçus en notification en haut de l'écran.
- **Arène** (`/arene`) : l'hôte choisit un chapitre et invite 1 à 3 joueurs connectés (notification « J'y vais ! ») ; chacun son tour, une question du chapitre (niveau et temps adaptés à l'âge, 45 s de base) : juste = attaque l'adversaire qui a le plus de cœurs, faux ou trop lent = −1 cœur ; 3 cœurs chacun, le dernier debout gagne (30 tours au plus). L'état vit sur le serveur (`packages/engine/src/arena.ts`).
- **Coffre** : une seule illustration de coffre dans toute l'appli, teintée selon la rareté.
- **Reliques de boss** (19/11/2026) : chaque matière a une relique (maths : Cristal des maths ; anglais : Grimoire ; espagnol : Éventail ; physique : Fiole ; histoire : Casque du légionnaire ; géographie : Boussole) dont l'icône sert d'icône de la matière en Combat de boss. Chaque boss de chapitre vaincu donne un éclat (affiché « À gagner » / « Gagné ✓ » sur la liste des boss, annoncé au bilan de la 1re victoire). « Mes progrès » a un inventaire : reliques (éclats / boss de la matière) et équipement.
- **Choix de la matière** : barre de progression sous chaque bouton (classe du joueur) : notions acquises en Entraînement, boss vaincus en Combat de boss.
- **Barre du haut** : avatar, pseudo, « Niv. N » et barre d'XP segmentée (même rendu que les barres du combat). « Mon héros » retiré des Paramètres (onglet Héros).
- **Pas de musique** (retirée le 19/11/2026, interrupteur « Musique » supprimé) ; seuls les effets sonores restent.
- **Parties plus courtes** (19/11/2026) : séries d'entraînement de **4 questions** (5 si toutes les notions sont du calcul de tête : `Skill.mental`) ; médaille : sans faute Or, une erreur Argent, deux erreurs Bronze (meilleure série stockée « 5 − erreurs »). Combat : **4 mobs** (niveau 1 pour les 2 premiers) puis le boss, 7 questions. En combat : plus de mot « Mob », plus de titre de notion, plus de compteurs (« 4/4 », « 1/3 ») sur les barres.
- **Coffre en plein écran** : éclairs autour du coffre qui tremble, un toucher l'ouvre (flash blanc, rayons qui tournent, butin qui jaillit objet par objet), « Super ! » referme ; le butin reste résumé dans le bilan.
- **Personnages livrés le 19/11/2026** : Lina (l'électrique) et Pixel (le chat ninja) jouables (6 poses, 12 expressions) ; le **π-bot**, cube-robot violet et doré, est le seul mob des maths (6 poses, 12 têtes, tourné vers le héros ; sa tête du bandeau est menaçante, triste quand il est touché, rieuse quand le héros se trompe). Planches JPEG découpées par `assets:kit decouper` (détourage du fond uni ou du damier par case, retrait des repères, du cadre et des traits fins).
- **Sans scintillement** : les apparitions animées (fondu, glissement) ne se jouent qu'à la 1re visite d'un écran ; les avatars générés sont gardés en mémoire (plus d'avatar vide à chaque page). Héros à venir : cartes « ? » sans nom. Dialogues des méchants : fond rouge pâle, contour normal.
- **Audit du 18/11/2026** (téléphone 360/412 px, tablette portrait, ordinateur) : avatar sans anneau, page Progrès repliée par domaine (titre + médailles, un toucher ouvre), liste des boss avec la médaille ou « Pas encore vaincu » au lieu du nom du boss, notions avec l'état sous le titre, page Multi en message « arrive bientôt » sans tuiles à toucher, zone de jeu plus large sur grand écran.
- **Contenu** : Fractions, Nombres relatifs, Proportionnalité (3 problèmes + 2 pièges chacun, `packages/content/src/maths/boss.ts`) ; les 14 autres chapitres de 5e depuis le 18/11/2026 (2 problèmes + 1 piège chacun, `boss-cinquieme.ts`, chaque question cite l'objectif du BO de la notion qu'elle mobilise) : un boss par chapitre dans toutes les classes.
- **Images** : kit ChatGPT `docs/chatgpt/kit-combat.md` (ZIP « demande-NN.png »).
- **Début du combat** : le Golem est d'abord en face d'Alex dans l'arène (il regarde vers la gauche : toutes ses images sont tournées vers le héros) et provoque, Questy répond ; « C'est parti ! » (ou 7 s) : il invoque ses mobs (pose d'invocation), s'efface, le 1er mob entre, puis la 1re question.
- **Mise en scène (18/11/2026)** : en entrant dans Combat de boss › une matière, **gros plan du boss** qui provoque (réplique tirée au hasard, selon les victoires déjà remportées contre lui dans la matière), à chaque entrée, passable d'un toucher ou par « Choisir mon chapitre ». **Face-à-face** avant le combat : le boss provoque sur le chapitre (« Tu m'as peut-être battu… Mais tu ne feras pas long feu en fractions, haha ! » s'il a déjà perdu sur ce chapitre), puis Questy répond (« Ne l'écoute pas ! … »), bouton « C'est parti ! » (sinon suite après 7 s). Après le 7e mob, **arrivée du boss** en grand : il entre en courant, l'écran tremble, « X arrive ! », « 3 vies : 3 bonnes réponses pour le battre », Questy félicite (« Bravo, tous les mobs sont battus ! Presque fini… »), bouton « Au combat ! » (sinon suite après 4,5 s). **Défaite** : écran « On recommence ? » avec **5 secondes pour répondre** (anneau qui se vide) ; toucher relance tout le combat, sinon bilan : le héros dit « Je reviendrai plus fort(e) ! » et le gros bouton « On s'entraîne » mène à la notion la plus ratée (ou au chapitre).
- **Arènes en plusieurs formats** : la scène prend la variante la plus proche des proportions du cadre (portrait 3:4 sur téléphone, 16:9, panorama 12:5 sur tablette en paysage) ; le bandeau du haut a sa frise répétée en largeur (`docs/chatgpt/kit-arenes.md`).

### 6.2 ter Classes et matières

- **Classe** du profil : CM1, CM2, 6e, 5e, 4e, 3e ou Adulte (3e ajoutée le 18/11/2026). Déduite de la date de naissance (année scolaire de septembre), Questy demande « Tu es en 5e ? » ; « Non » ouvre la liste. Adulte : « À venir » (joue la 5e en attendant), plus tard des questions plus difficiles.
- **Programmes du CM1 à la 3e** (chantier du 18/11/2026, même profondeur que la 5e : tous les chapitres, 3 à 6 notions chacun, et un boss par chapitre — 2 problèmes + 1 piège) :
  - CM1, CM2, 6e : programme du cycle 3, **BO n°16 du 17 avril 2025** (annexe « ensel620_annexe2-v2.pdf », lue) ; en vigueur en CM1 et 6e depuis 2025, en CM2 depuis la rentrée 2026 ;
  - 4e, 3e : objectifs par année du programme du cycle 4, **BO n°10 du 5 mars 2026** (le même texte que la 5e). En 2026-2027, la 4e et la 3e suivent encore l'ancien programme (2020) ; on suit le nouveau pour garder une progression continue avec notre 5e ;
  - identifiants `m6-…`, `m4-…`, `m3-…`, `mcm1-…`, `mcm2-…` ; chaque notion cite l'objectif officiel de sa classe (`objectiveOf`).
- **Contenu livré le 18/11/2026** (fichiers `packages/content/src/maths/`) :

  | Classe | Chapitres | Notions | Boss | Fichier(s)                                                                                                                             |
  | ------ | --------- | ------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
  | CM1    | 15        | 56      | 15   | `cours-moyen.ts` (`build('cm1')` : nombres ≤ 999 999, décimaux aux centièmes, fractions de dénominateur ≤ 20)                          |
  | CM2    | 15        | 59      | 15   | `cours-moyen.ts` (`build('cm2')` : nombres ≤ 999 999 999, millièmes, dénominateurs ≤ 60, entier × fraction, aires en dm^2/m^2, degrés) |
  | 6e     | 18        | 62      | 18   | `sixieme-nombres.ts`, `sixieme-mesures.ts`, `sixieme-donnees.ts`                                                                       |
  | 5e     | 17        | 72      | 17   | `calcul.ts` … `donnees.ts`, `boss.ts`                                                                                                  |
  | 4e     | 14        | 52      | 14   | `quatrieme-nombres.ts`, `quatrieme-autres.ts`                                                                                          |
  | 3e     | 13        | 43      | 13   | `troisieme.ts`                                                                                                                         |

  Les nombres en lettres du CM suivent l'orthographe rectifiée de 1990 (traits d'union partout, « quatre-vingt-mille », « deux-cents-millions »). Domaine « Grandeurs et mesures » ajouté (cycle 3), avec son boss.

- **Choix de la classe** : en Entraînement (et sur les pages Boss et Progrès), une rangée « Classe » (CM1 → 3e) permet de jouer le programme d'une autre classe ; sa classe est cochée par défaut (pastille dorée), le choix est gardé dans l'adresse (`?classe=6e`).
- **Matières** sans contenu grisées « À venir » au choix de la matière.
- **Calculatrice** proposée partout sauf quand calculer est l'objectif de la notion (`Skill.mental` : tables, opérations, priorités, relatifs, fractions, carrés…) ; un calcul annexe (carré, aire, pourcentage) ne doit pas bloquer. Questy la conseille sur les notions à gros nombres. Touches selon la classe de la notion : CM1–CM2 ( ) ; 6e + π ; 5e + x² et √ ; 4e + xⁿ ; 3e + cos, sin, tan, cos⁻¹, sin⁻¹, tan⁻¹ (en degrés). Pavé classique (0 sous le 1, = en bas à droite, « Envoyer ➜ réponse »). L'onglet de saisie s'appelle **« Répondre »** (pavé, clavier ou choix). Sur téléphone, la zone d'outils grandit quand la calculatrice est ouverte.

### 6.3 Acquisition d'une notion

- **Acquise** = un sans-faute sur une série de 5 de la notion (médaille d'or). En arrière-plan, la répétition espacée (J0, J+2, J+7, puis mensuel) propose les notions « à revoir » ; une série ratée repasse la notion à revoir (J+1). Une série « tout le chapitre » ne compte pas pour les médailles.
- **Évaluation** affichée en double : **note /20** et **niveau de maîtrise** à l'échelle du livret scolaire (LSU) : insuffisante / fragile / satisfaisante / très bonne. Le tout est calculé par thème, par matière et en global.
- **Rappels** : badge « N notions à revoir aujourd'hui » sur l'accueil et sur le mode Révisions ; Questy prend l'air triste si des notions sont en retard. La **série quotidienne** (flamme) n'est maintenue que si les révisions du jour sont faites.

### 6.4 Quand l'élève se trompe

1. **2e essai avec indice** : à la 1re erreur, Questy dit ce qui cloche (piège prévu par le générateur, ou erreur reconnue automatiquement : virgule décalée, signe, fraction à l'envers, petite erreur de calcul — `packages/content/src/diagnose.ts`) et donne l'**indice** de la question (`Question.hint`, sans la réponse). L'enfant réessaie la même question ; une option de QCM déjà essayée est grisée. Pas de 2e essai quand il ne reste qu'une option (Vrai/Faux, < / >). Seule la 1re réponse compte pour le score et la répétition espacée ; réussie au 2e essai → « Bien rattrapé ! », sans question similaire.
2. **Explication de Questy** (2e erreur) : « Tu as répondu X, la bonne réponse est Y » + pourquoi, puis l'explication de **sa** question en bulles (une par « Continuer »), sur un ton de coach : ce qu'on cherche, comment, pourquoi (images : argent, thermomètre, pizza, balance, petits cubes…). Le tableau de conversion est animé sur les conversions (`Question.demo`). L'explication s'agrandit, l'énoncé reste en haut.
3. **Le truc à retenir** : mémo court de la notion, à la demande.
4. **Bonne réponse** : passage automatique à la question suivante après 1,5 s (jauge sur « Suivant », qui reste pour aller plus vite).
5. **Fin de partie** : récapitulatif « Tes erreurs » (énoncé + bonne réponse), replié par défaut.
6. **« Je réessaie »** : une question similaire juste après pour vérifier ; la notion passe en « à revoir » dans la répétition espacée.

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

### 6.5 Entraînement (18/11/2026)

- Série de **5 questions** (3 questions similaires au plus après erreur). Jamais deux fois le même énoncé dans une série ; les énoncés des dernières séries de la notion (40 par notion, retenus sur l'appareil) sont évités aussi.
- La tête du héros (Alex) est dans la barre du haut : son expression suit les réponses et une petite bulle réagit (« Trop facile ! », « Aïe… on se reprend ! », « Série en feu ! »). Questy garde les indices et explications.
- Fin de série : coffre d'équipement au hasard (voir §6.2 bis), ouvert en touchant le coffre. La page de l'entraînement rappelle que c'est ici qu'on gagne son équipement.

### 6.6 Navigation et accueil (18/11/2026, revu)

- **Barre du haut figée** sur les écrans principaux : le joueur en bref (avatar → changer de joueur, prénom, niveau, pièces) et les onglets Accueil · Héros · Progrès · Multi · Paramètres. Les sous-écrans gardent le bouton retour.
- **Accueil** : le héros en pied (toucher → « Mon héros ») à côté des deux grands modes (Entraînement en vert, Combat de boss en rouge), les défis « À venir » en dessous. Boutons sobres : icône et nom, l'explication est sur l'écran du mode.
- **Plein écran** : interrupteur dans Paramètres (gardé sur l'appareil ; le navigateur exige un toucher pour y revenir après un rechargement).
- **Pause** : même bouton ⏸ en entraînement (en-tête) et en combat (à côté des objets), menu Reprendre / Quitter.
- Une seule pastille « À venir » (dorée, dans le coin) pour les modes, matières, boss et héros pas encore prêts.

### 6.7 Combat : objets, médailles, animations (18/11/2026)

- **Un seul type d'objet par combat** : le premier objet utilisé fixe le type (jusqu'à 3 du même), les autres sont verrouillés.
- **Médaille du combat** selon les cœurs restants à la victoire : 3 = or, 2 = argent, 1 = bronze ; **diamant** = 3 cœurs et aucun objet. On garde la meilleure par boss (liste des boss).
- Bandeau : têtes, cœurs du héros, et à droite les **mobs restants en barre segmentée** (comme des vies), puis les vies du boss.
- **Animations en grand** : après chaque réponse, la scène (personnages entiers, tir, riposte, bouclier, victoire) remplace l'énoncé ~1,5 s, puis l'explication ou la question suivante.
- Après une erreur, l'explication complète s'affiche directement (plus de « Voir tout »).
