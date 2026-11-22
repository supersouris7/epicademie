# 0030 — Arène d'évaluation : compétence = chapitre, moteur déterministe, bilans figés

- Statut : Acceptée (décisions client du 22/11/2026 : rien de montré pendant l'épreuve, récompenses Origines/Maîtres 1×/an et Progression 14 j, profils Adulte au niveau 3e, compétences essentielles validées)
- Date : 2026-11-22
- Ticket : #98 (épopée #96)

## Contexte

Le client veut un mode « Arène d'évaluation », placé dans les **Défis**, avec trois épreuves
(Origines : acquis de l'année précédente ; Progression : année en cours, répétable ; Maîtres :
bilan de l'année), pour les élèves du CM1 à la 3e, matière par matière (maths d'abord). Chaque
bilan donne une **maîtrise** et une **couverture** distinctes, 7 états de compétence, des
comparaisons honnêtes entre bilans et alimente l'Espace parent (4 réponses + section « Bilans »).

L'existant fournit déjà : des notions générées de façon déterministe (`packages/content`),
rangées en chapitres qui portent un domaine du programme ; un journal de toutes les réponses
(`attempts`, avec essai, aide, réponse collective, ADR 0013) ; un moteur adaptatif pur et sans IA
(ADR 0017) ; un état de partie versionné côté serveur (ADR 0009) ; une économie atomique (ADR 0015,
0019). Le règlement détaillé est dans `docs/ARENE-EVALUATION.md`.

## Décision

1. **Compétence = chapitre du contenu.** Le référentiel d'évaluation est un fichier de données par
   matière (`packages/content/src/referentiel/maths.ts`) qui, pour chaque chapitre existant, ajoute :
   « essentielle » ou non, ses prérequis (graphe CE2 → 3e), et un numéro de **version** du
   référentiel. Les notions du chapitre sont les questions possibles de la compétence. Le même
   identifiant sert pour les chapitres « déjà vus en classe » déclarés par l'élève.
2. **CE2 = contenu d'évaluation seulement** : chapitres `mce2-*` enregistrés dans un registre à part
   du catalogue (comme les questions de boss), générables et corrigés par le serveur, absents de
   l'Entraînement, de la répétition espacée et de `GRADES` (pas de classe CE2 créée).
3. **Moteur pur et déterministe** dans `packages/engine/src/evaluation/` (états, sélection, scores,
   comparaisons), sans IA, prolongeant l'ADR 0017. Les seuils sont réunis dans une constante
   `EVALUATION` et testés.
4. **Le serveur choisit chaque question** (notion, niveau, graine) et n'accepte que la réponse à la
   question attendue. L'état de l'épreuve est stocké versionné et validé (`{ v, state }`, ADR 0009) :
   reprise exacte après interruption ; un état d'une autre version clôt l'épreuve (410) sans perte
   des réponses.
5. **Un seul journal d'observations** : les réponses d'épreuve vont dans `attempts` via une partie
   `sessions` de mode `evaluation`. Elles nourrissent le profil commun (rapport de suivi) mais **ne
   modifient ni médailles ni répétition espacée** (`skill_states`) : une épreuve mesure, elle ne fait
   ni gagner ni perdre de progression de jeu. Les autres modes comptent dans l'évaluation avec un
   poids réduit et une fraîcheur limitée ; ils ne suffisent seuls qu'au-delà d'un seuil explicite.
6. **Bilans figés** : à la fin, le résultat est copié dans `evaluations` (une ligne par bilan) et
   `evaluation_competences` (une ligne par compétence). L'historique ne se recalcule jamais. Deux
   bilans ne sont comparables que s'ils portent sur la même matière, la même classe de référentiel
   et la même version ; la comparaison se fait sur les compétences évaluées dans les deux.
7. **Pourcentages autorisés pour les bilans seulement** (maîtrise et couverture), arrondis à 5 %,
   jamais affichés l'un sans l'autre. L'ADR 0013 (pas de pourcentage) reste valable pour le suivi
   des notions.
8. **Nouveau mode `evaluation`** (catégorie `defis`) ; l'identifiant `arene` reste celui du
   multijoueur (renommé « Duels » à l'affichage, #97) pour ne toucher à aucune donnée existante.
9. **Récompenses forfaitaires**, jamais proportionnelles aux bonnes réponses : participation,
   régularité, compétences nouvellement maîtrisées (une fois par compétence et par année), dans
   `ECONOMY.evaluation` et dans la même transaction que la clôture (ADR 0015).

## Conséquences

- Positives : aucun contenu à dupliquer ; une seule grille par matière ; comportement reproductible
  et explicable aux parents ; historique fiable ; une nouvelle matière s'ouvre en écrivant son seul
  référentiel (anglais ensuite).
- Négatives : granularité « chapitre » parfois large (5e fractions : 10 notions) ; le diagnostic fin
  se lit alors au niveau des notions (recommandations). Si un chapitre est découpé, la version du
  référentiel monte et les comparaisons se limitent aux compétences inchangées.
- À surveiller : les parties `evaluation` ne doivent pas compter dans les badges « série parfaite »
  (`learning.repo.ts` filtre aujourd'hui seulement `boss`), ni dans les records de défis ; le champ
  `sessions.chapter_id` reçoit l'identifiant du référentiel (`ref-maths-6e`) ; `MODE_IDS` gagne
  `evaluation` (contrat `weeks.modes`).
- Retour arrière : migration descendante = suppression des 3 nouvelles tables **et** des parties de
  mode `evaluation` (sinon l'ancien contrat refuse le mode inconnu) ; en production, cette
  suppression de données demande l'accord du client.

## Options écartées

- **Compétence = notion** : 45 à 70 notions par classe ; impossible d'en observer chacune au moins
  deux fois en 15–20 questions, donc presque tout resterait « évaluation insuffisante ».
- **Grille de compétences indépendante du contenu** (rattachement notion par notion) : double
  maintenance et risque de compétences sans question ; à reconsidérer seulement si un programme
  impose un découpage différent des chapitres.
- **Test adaptatif psychométrique (IRT)** : demande une calibration des questions sur des milliers
  de réponses que nous n'avons pas ; résultats inexplicables à un parent.
- **IA générative** pour choisir les questions ou rédiger les bilans : mêmes motifs que l'ADR 0017.
- **Recalcul des bilans à la demande** depuis `attempts` : l'historique changerait avec le contenu
  et les seuils ; un bilan doit rester ce qu'il était le jour où il a été passé.
- **Mettre à jour médailles et répétition espacée** pendant l'épreuve : une mauvaise journée ferait
  perdre de la progression de jeu, contraire au cahier des charges.
- **Réutiliser l'identifiant `arene`** : collision avec l'historique du multijoueur.

## Mise en œuvre (ticket #12, première partie)

- Moteur pur : `packages/engine/src/evaluation/` (constante `EVALUATION`, observations et états,
  maîtrise/couverture/comparaison, déroulé `createEvaluation` → `nextEvaluationQuestion` →
  `recordEvaluationAnswer` → `summarize`). L'état est un JSON versionné (`EVALUATION_STATE_VERSION`).
- Données : migration `0022_arene_evaluation` (numéro réel ; retour arrière dans son en-tête, testé).
  Maîtrise, couverture et part étudiée sont stockées en entiers 0–100 (l'affichage arrondit à 5 %).
- Interprétations tranchées : `questions.max` plafonne le total, explorations comprises ;
  `questions.min` relève seulement le besoin des petits programmes (3 questions au plus par
  compétence) ; à l'arrêt « découragement », une essentielle dont toutes les réponses sont fausses
  déclenche l'exploration de son prérequis ; les avancées posent 2 questions sur la première
  compétence puis 1 sur la suivante (3 au plus).
- À venir (service) : routes, contrats `packages/shared`, `MODE_IDS`/`MODES`, filtres « série
  parfaite »/records, récompenses `ECONOMY.evaluation`, isolation par famille.
