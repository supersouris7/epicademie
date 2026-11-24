# 0034 — Contenus de toutes les matières : 5 niveaux, nouveaux types de questions, sources et relectures

- Statut : Acceptée
- Date : 2026-11-24
- Complète : 0014 (fiabilité pédagogique), 0024 (contenus hors maths), 0025 (vocabulaire et schémas), 0031 (Sciences)

## Contexte

Le programme officiel complet du CM1 à la 3e doit être en ligne pour toutes les matières (français, maths,
anglais, histoire-géographie-EMC, sciences, espagnol), avec 5 niveaux de difficulté par notion, des sources
officielles citées et une relecture pédagogique de chaque notion. Le moteur actuel est centré sur les maths :
3 niveaux, réponses nombre, fraction, choix, point et texte court. Le contenu sera produit par lots, en continu,
par plusieurs agents en parallèle : le format doit rendre les erreurs détectables par des tests, et limiter les
conflits entre lots.

## Décision

**Un seul modèle de contenu** (`Chapter` → `Skill` → `generate(rng, level)`), étendu plutôt que dupliqué :

1. **Niveaux 1 à 5** (`Level = 1 | 2 | 3 | 4 | 5`).
   - `Skill.levels` (3 par défaut, 5 pour toute nouvelle notion) : l'adaptatif, les séries, les Défis et l'Arène
     ne demandent jamais un niveau au-delà. Les notions de maths existantes passent à 5 au fil des lots.
   - Sens commun à toutes les matières :
     - 1 découvrir (reconnaître sur un exemple typique) ;
     - 2 reconnaître (choisir parmi des propositions proches) ;
     - 3 appliquer (produire la réponse, cas réguliers) ;
     - 4 maîtriser (cas moins fréquents, irréguliers, pièges, sans aide) ;
     - 5 expert (contexte, document ou phrase longue, combinaison avec une notion antérieure ; format brevet en 3e).
   - Le niveau change la tâche, pas seulement le chronomètre.
   - Départ adaptatif : 1 (nouvelle ou à travailler), 2 (en progression), 3 (à consolider), 4 (acquise).
     Le niveau 5 s'atteint par la progression dans la série.
   - Arène : Origines 1-3, Progression 2-4, Maîtres 3-5, bornés par `Skill.levels`.
   - Migration réversible : contraintes `attempts.level` et `question_reports.level` élargies de 1-3 à 1-5.
2. **Nouveaux types de réponses**, chacun avec saisie tactile, clavier et télécommande :
   - `order` : remettre dans l'ordre (frise chronologique, mots d'une phrase, étapes d'un procédé) ;
   - `match` : associer deux colonnes (mot ↔ définition, date ↔ événement, pays ↔ capitale) ;
   - `cloze` : texte à trous, chaque trou en saisie courte ou en liste de propositions.

   Les types existants couvrent le QCM (`choice`) et la saisie courte (`text`).

3. **Nouvelles figures** :
   - `document` : extrait de texte numéroté par ligne, pour la lecture et les sources historiques ;
   - `map` : carte de France (régions, départements), d'Europe ou du monde, avec zones surlignées ou à toucher.
     Fonds simplifiés en SVG depuis IGN Admin Express (Licence Ouverte 2.0) et Natural Earth (domaine public).
4. **Audio par synthèse vocale de l'appareil** (`Question.audio = { text, lang }`, Web Speech API) :
   - bouton « Écouter » ; questions d'écoute en langues (texte masqué) ; lecture de l'énoncé au CM ;
   - aucune donnée envoyée à l'extérieur ;
   - sans voix disponible pour la langue, la question d'écoute est remplacée par une autre question de la notion.
5. **Matières et domaines** :
   - matière `francais` ajoutée à `SUBJECTS`, non disponible tant qu'aucun chapitre n'est publié ;
   - domaines `grammaire`, `conjugaison`, `orthographe`, `vocabulaire`, `lecture`, `litterature`, `histoire`,
     `geographie`, `emc`, `comprehension-orale`, `culture` ;
   - l'EMC est un domaine de la matière `histoire` (préfixe `em`) ; la Sciences garde ses trois domaines (0031),
     plus les chapitres « sciences et technologie » du CM1 à la 6e (préfixe `st`) ;
   - les boss des nouvelles matières restent « À venir » jusqu'à leurs dessins.
6. **Sources vérifiables** :
   - registre `sources.ts` (titre, éditeur, URL, date du texte, date de consultation) ;
   - `Lesson.sources` : au moins une source par notion ;
   - chaque fait (date, lieu, définition, forme irrégulière) porte l'identifiant de sa source et la citation exacte ;
   - un test refuse toute URL hors de la liste des domaines institutionnels : education.gouv.fr, eduscol, legifrance,
     CNRTL, Académie française, BnF, INSEE, IGN, europa.eu, vie-publique.fr, Assemblée nationale, Sénat,
     British Council, RAE, Instituto Cervantes, BIPM, CNRS, Inserm, Santé publique France, Météo-France, MNHN,
     CNES, ADEME, BRGM.
7. **Relectures enregistrées** : registre `<matiere>/relectures.ts` (notion, version, lot, date, verdict).
   - Un test exige une relecture « ok » à la version courante pour toute notion publiée hors maths.
   - Les notions de maths y entrent au fil de leurs lots ; la liste des notions de maths non encore relues est figée
     et ne peut que diminuer.
8. **Isolation des lots** :
   - un dossier par matière (et par domaine pour les Sciences), avec son index, son glossaire et ses relectures ;
   - un lot ne modifie que son dossier ;
   - les fichiers communs (`catalog.ts`, `SUBJECTS`, types) ne changent que dans les lots « moteur ».
9. **Aperçu de relecture** : un script produit, pour un chapitre, un Markdown de chaque notion avec 5 niveaux × 3 graines
   (énoncé, réponse, pièges, indice, étapes, sources). La relecture pédagogique se fait sur cet aperçu, pas sur le code.

Le référentiel des programmes (`docs/contenus/referentiel/`) liste les notions par matière et par classe avec les
textes officiels. Le référentiel d'évaluation (`packages/content/src/referentiel/`) reste celui de l'Arène :
une compétence par chapitre, ajouté par matière une fois son contenu complet.

## Conséquences

- Lots moteur à faire d'abord, dans l'ordre :
  1. niveaux 1-5 ;
  2. matière et domaines ;
  3. sources, relectures et aperçu ;
  4. nouveaux types de réponses ;
  5. audio, puis cartes ;
  6. référentiels multi-matières.
- `validate.ts` s'étend aux nouveaux types :
  - la réponse attendue est acceptée ;
  - chaque piège est refusé ;
  - un ordre ou une association a une seule solution ;
  - pas de doublon parmi les propositions ;
  - variantes d'écriture acceptées (casse, apostrophes, accents seulement si la notion ne porte pas dessus).
- Coût de maintenance : un format, une chaîne de contrôles et un aperçu communs à toutes les matières. Les
  contenus purement factuels (histoire, géographie, sciences) restent écrits en données citées, jamais générés
  librement.
- Ce qui n'est pas évaluable automatiquement (oral, écriture longue, démarche expérimentale) reste hors du jeu ;
  le jeu entraîne les connaissances associées.

## Options écartées

- **Un moteur par matière** (questions à texte libre, banques de questions statiques) : double maintenance, et
  perte des contrôles automatiques et du suivi par notion.
- **Questions rédigées à la volée par une IA dans l'application** : invérifiables, coûteuses, et elles enverraient
  des données à l'extérieur.
- **Audio enregistré ou synthétisé par un service en ligne** : coût, stockage et sortie de données. La synthèse de
  l'appareil suffit pour des phrases courtes ; sa qualité varie selon les appareils (repli prévu).
- **Garder 3 niveaux et les étirer** : ne répond pas à la demande, et les niveaux 4-5 (cas rares, contexte,
  brevet) sont précisément ceux qui distinguent l'entraînement sérieux.
