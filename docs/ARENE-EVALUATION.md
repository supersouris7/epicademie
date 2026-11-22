# Arène d'évaluation — règles pédagogiques, moteur et données

> Conception du ticket #98 (épopée #96). Décisions structurantes : `docs/adr/0030-arene-evaluation.md`.
> Cahier des charges et décisions du client : #96. Ce document fait foi pour #99 à #105 ; toute
> valeur chiffrée (seuils, budgets, récompenses) vit ensuite dans une constante unique testée.

## Sommaire

1. Vocabulaire et principes
2. Référentiel (compétences, domaines, essentielles, prérequis CE2 → 3e)
3. Observations : sources, poids, fraîcheur, règle « observations suffisantes »
4. Les 7 états d'une compétence
5. Moteur adaptatif commun
6. Spécificités des 3 épreuves
7. Maîtrise, couverture, comparabilité
8. Récompenses
9. Intégration dans le menu Défis et parcours
10. Modèle de données et migrations
11. Contrats d'API
12. Espace parent
13. Exemples chiffrés
14. Risques, dette, sécurité
15. Découpage des tickets #97 à #106

---

## 1. Vocabulaire et principes

| Terme | Sens |
| --- | --- |
| **Notion** | Exercice générable existant (`Skill` de `packages/content`), 3 niveaux de difficulté. |
| **Compétence** | Un **chapitre** du contenu (ex. `m6-fractions`), avec son domaine. C'est l'unité évaluée, déclarée « vue en classe » et rapportée aux parents. |
| **Référentiel** | Pour une matière et une classe : la liste de ses compétences, avec « essentielle » et prérequis, et une version. |
| **Programme concerné** | Compétences sur lesquelles porte la couverture d'un bilan (voir §7). |
| **Observation** | Une **première réponse individuelle sans aide** à une question d'une notion de la compétence (règle de l'ADR 0013). Second essai, indice, réponse collective : jamais une observation. |
| **Bilan** | Résultat figé d'une épreuve terminée. |
| **Classe N** | Classe actuelle de l'élève (`profiles.grade`). N−1 : classe précédente. |
| **Année scolaire** | Du 1er septembre au 31 août (fuseau de la famille), notée par son année de rentrée (2026 = 2026-2027). |

Principes non négociables (cahier des charges §9) : non étudiée ≠ échec ; une seule bonne réponse
ne prouve rien ; maîtrise et couverture toujours affichées ensemble ; aucune aide ni correction
pendant l'épreuve (explications à la fin) ; une mauvaise performance ne bloque rien et ne retire
rien ; les profils Adulte ont accès à l'Arène d'évaluation au niveau 3e (décision client du 22/11).

## 2. Référentiel

### 2.1 Forme

Fichier de données `packages/content/src/referentiel/maths.ts` (un par matière), vérifié par tests :

```ts
interface Competence {
  readonly id: string;            // = id du chapitre (m6-fractions) ou mce2-* pour le CE2
  readonly essential: boolean;    // « fondamentale » : vérifiée par Origines et Maîtres
  readonly prerequisites: readonly string[]; // compétences de N−1 (ou de la même classe)
}
interface Referential {
  readonly subject: SubjectId;
  readonly version: number;       // +1 à tout découpage, ajout ou retrait de compétence
  readonly grades: Partial<Record<'ce2' | Grade, readonly Competence[]>>;
}
```

Titre, domaine et notions se lisent dans le chapitre (aucune duplication). Tests de cohérence :
chaque chapitre de maths CM1 → 3e apparaît exactement une fois ; chaque prérequis existe et
appartient à la même classe ou à une classe antérieure ; le graphe est sans cycle ; chaque classe
a entre 6 et 9 compétences essentielles couvrant au moins 3 domaines ; aucune compétence ne
pointe vers une classe postérieure.

Domaines : ceux déjà portés par les chapitres (`DOMAINS` de `content/types.ts`) — N nombres et
calculs, G grandeurs et mesures, E espace et géométrie, D données et probabilités,
F proportionnalité et fonctions, I pensée informatique. En 4e et 3e, les grandeurs (volumes) sont
rangées dans les chapitres de géométrie : le domaine G n'y apparaît pas, ce qui est conforme au
contenu actuel.

**Ce que la grille ne change pas** : l'Entraînement, les médailles, le Mode Histoire et les Défis
gardent leurs chapitres et notions ; le référentiel ne fait qu'y ajouter deux informations.

### 2.2 Compétences par classe (E = essentielle ; « ← » = prérequis)

Le choix des essentielles suit les attendus de fin d'année des programmes (cycle 3 : BO n°16 du
17/04/2025 ; cycle 4 : BO n°10 du 5/03/2026, déjà cités par le contenu). Il est **proposé** : le
contenu (#99 pour le CE2, ticket référentiel pour le reste) le source compétence par compétence.

**CE2** (fondamentaux à écrire dans #99 ; sources du programme du cycle 2 à citer par compétence) —
évaluation seulement.

| Compétence | Dom. | E | Contenu attendu (indicatif) |
| --- | --- | --- | --- |
| `mce2-nombres` | N | E | Entiers jusqu'à 10 000 : lire, écrire, décomposer, comparer, ranger, droite graduée |
| `mce2-calcul-mental` | N | E | Tables d'addition et de multiplication (2 à 9), compléments, doubles et moitiés |
| `mce2-operations` | N | E | Addition et soustraction posées, multiplication par un nombre à un chiffre |
| `mce2-problemes` | N | E | Problèmes additifs et multiplicatifs à une ou deux étapes |
| `mce2-fractions` | N | – | Fractions simples (moitié, tiers, quart) d'une figure ou d'une longueur |
| `mce2-mesures` | G | E | Longueurs (km, m, cm, mm), masses (kg, g), contenances (L), monnaie |
| `mce2-durees` | G | – | Lire l'heure, heures et minutes |
| `mce2-geometrie` | E | E | Carré, rectangle, triangle rectangle, cercle ; angle droit ; symétrie ; solides usuels |
| `mce2-donnees` | D | – | Lire un tableau, un diagramme en barres |

**CM1** (`mcm1-*`) et **CM2** (`mcm2-*`) : même liste de chapitres. Pour le CM2, chaque compétence
a pour prérequis sa jumelle du CM1 (`mcm2-x ← mcm1-x`) en plus des liens indiqués.

| Compétence | Dom. | E CM1 | E CM2 | Prérequis du CM1 |
| --- | --- | --- | --- | --- |
| `nombres` | N | E | E | mce2-nombres |
| `fractions` | N | E | E | mce2-fractions, mce2-nombres |
| `decimaux` | N | – | E | mcm1-fractions (même classe), mce2-mesures |
| `calcul-mental` | N | E | – | mce2-calcul-mental |
| `operations` | N | E | E | mce2-operations, mce2-calcul-mental |
| `problemes` | N | E | E | mce2-problemes |
| `algebre` | N | – | – | mce2-calcul-mental |
| `mesures` | G | E | E | mce2-mesures |
| `aires` | G | – | – | mce2-geometrie, mce2-mesures |
| `durees` | G | – | – | mce2-durees |
| `geometrie` | E | E | E | mce2-geometrie |
| `angles` | E | – | – | mce2-geometrie |
| `donnees` | D | – | – | mce2-donnees |
| `probabilites` | D | – | – | aucun |
| `proportionnalite` | F | – | E | mce2-problemes, mce2-calcul-mental |

CM1 : 7 essentielles ; CM2 : 8 (le calcul mental reste évalué via ses prérequis et la couverture).

**6e** (prérequis en CM2)

| Compétence | Dom. | E | Prérequis |
| --- | --- | --- | --- |
| `m6-numeration` | N | E | mcm2-nombres, mcm2-decimaux |
| `m6-calcul` | N | E | mcm2-operations, mcm2-calcul-mental, mcm2-decimaux |
| `m6-division` | N | E | mcm2-operations |
| `m6-fractions` | N | E | mcm2-fractions |
| `m6-pourcentages` | N | – | mcm2-proportionnalite, mcm2-fractions |
| `m6-algebre` | N | – | mcm2-algebre |
| `m6-longueurs` | G | E | mcm2-mesures, mcm2-aires |
| `m6-aires` | G | E | mcm2-aires |
| `m6-volumes` | G | – | mcm2-mesures |
| `m6-durees` | G | – | mcm2-durees |
| `m6-cercles` | E | – | mcm2-geometrie |
| `m6-angles` | E | E | mcm2-angles |
| `m6-symetrie` | E | – | mcm2-geometrie |
| `m6-espace` | E | – | mcm2-geometrie |
| `m6-donnees` | D | – | mcm2-donnees |
| `m6-probabilites` | D | – | mcm2-probabilites |
| `m6-proportionnalite` | F | E | mcm2-proportionnalite |
| `m6-informatique` | I | – | aucun |

**5e** (prérequis en 6e, sauf mention)

| Compétence | Dom. | E | Prérequis |
| --- | --- | --- | --- |
| `m5-calcul` | N | – | m6-calcul |
| `m5-operations` | N | E | m6-calcul, m6-division |
| `m5-relatifs` | N | E | m6-numeration |
| `m5-fractions` | N | E | m6-fractions |
| `m5-puissances` | N | – | m6-calcul |
| `m5-litteral` | N | E | m6-algebre, m5-operations |
| `m5-reperage` | E | – | m6-numeration |
| `m5-espace` | E | – | m6-volumes, m6-espace |
| `m5-symetries` | E | – | m6-symetrie |
| `m5-angles` | E | – | m6-angles |
| `m5-triangles` | E | E | m6-angles, m6-aires |
| `m5-parallelogrammes` | E | – | m6-symetrie, m6-aires |
| `m5-statistiques` | D | E | m6-donnees |
| `m5-probabilites` | D | – | m6-probabilites |
| `m5-proportionnalite` | F | E | m6-proportionnalite, m6-pourcentages |
| `m5-fonctions` | F | – | m6-proportionnalite, m6-algebre |
| `m5-algorithmique` | I | – | m6-informatique |

**4e** (prérequis en 5e)

| Compétence | Dom. | E | Prérequis |
| --- | --- | --- | --- |
| `m4-relatifs` | N | E | m5-relatifs |
| `m4-rationnels` | N | E | m5-fractions |
| `m4-puissances` | N | E | m5-puissances |
| `m4-racines` | N | – | m5-puissances |
| `m4-litteral` | N | E | m5-litteral |
| `m4-triangles` | E | E | m5-triangles |
| `m4-parallelogrammes` | E | – | m5-parallelogrammes |
| `m4-transformations` | E | – | m5-symetries |
| `m4-espace` | E | – | m5-espace |
| `m4-statistiques` | D | – | m5-statistiques |
| `m4-probabilites` | D | – | m5-probabilites |
| `m4-proportionnalite` | F | E | m5-proportionnalite |
| `m4-fonctions` | F | E | m5-fonctions |
| `m4-algorithmique` | I | – | m5-algorithmique |

**3e** (prérequis en 4e, sauf mention)

| Compétence | Dom. | E | Prérequis |
| --- | --- | --- | --- |
| `m3-arithmetique` | N | E | m5-operations, m4-rationnels |
| `m3-puissances` | N | – | m4-puissances |
| `m3-racines` | N | – | m4-racines |
| `m3-litteral` | N | E | m4-litteral |
| `m3-thales` | E | E | m4-triangles, m4-proportionnalite |
| `m3-trigonometrie` | E | E | m4-triangles |
| `m3-vecteurs` | E | – | m4-transformations |
| `m3-espace` | E | – | m4-espace |
| `m3-statistiques` | D | E | m4-statistiques |
| `m3-probabilites` | D | E | m4-probabilites |
| `m3-proportionnalite` | F | – | m4-proportionnalite |
| `m3-fonctions` | F | E | m4-fonctions |
| `m3-algorithmique` | I | – | m4-algorithmique |

Volumétrie : CE2 9 compétences (6 E), CM1 15 (7 E), CM2 15 (8 E), 6e 18 (8 E), 5e 17 (7 E),
4e 14 (7 E), 3e 13 (7 E).

**Prérequis principal** : le premier de la liste ; c'est lui que l'exploration interroge d'abord.

## 3. Observations

### 3.1 Poids d'une observation

`poids = source × fraîcheur`, calculé au jour de l'épreuve.

| Source | Poids source |
| --- | --- |
| Arène d'évaluation (cette épreuve ou une précédente) | 1 |
| Entraînement, Défis (Contre-la-montre, Survie), Mode Histoire (mobs, problèmes, pièges rattachés au chapitre) | 0,5 |
| Duels, Quiz plateau (réponses individuelles) | 0,25 |
| Second essai, réponse avec indice ou objet « indice », réponse collective (TV, raid) | 0 |

| Âge de l'observation | Arène | Autres modes |
| --- | --- | --- |
| ≤ 30 jours | 1 | 1 |
| 31 à 90 jours | 1 | 0,5 |
| 91 à 180 jours | 0,5 | 0 |
| > 180 jours | 0 | 0 |

Toutes les réponses restent dans l'historique ; la fraîcheur ne joue que sur les états du jour.
Seules les **20 observations les plus récentes** d'une compétence sont lues (borne de calcul).

### 3.2 Grandeurs d'une compétence

- `P` = somme des poids ; `Pa` = part venant de l'Arène ; `Pe` = part venant des autres modes.
- `R` = réussite pondérée = Σ(poids × juste) / `P`.
- `n` = nombre d'observations de poids non nul ; `j` = nombre de jours distincts.
- `preuveNiveau2` = au moins une observation juste de niveau ≥ 2 et de poids non nul.
- `dernière` = date de l'observation non nulle la plus récente.

### 3.3 Règle « observations suffisantes »

Une compétence est **suffisamment observée** si `P ≥ 2` et `n ≥ 2`, **et** l'une des deux
conditions :

- **(a)** au moins une observation de l'Arène dans les 90 derniers jours ; ou
- **(b)** sans Arène : `Pe ≥ 3` sur au moins 2 jours distincts (soit au moins 6 réponses récentes
  hors Arène, le double de ce qu'exige l'Arène).

La condition (b) est la traduction de « les autres modes contribuent sans remplacer les
évaluations lorsque les observations sont insuffisantes » : ils suffisent seuls uniquement s'ils
sont nombreux, récents et étalés ; sinon l'Arène pose des questions.

## 4. Les 7 états d'une compétence

Arbre de décision, évalué dans cet ordre (fonction pure `competenceState`) :

| # | État | Condition |
| --- | --- | --- |
| 1 | **Non étudiée** | Chapitre déclaré « pas encore vu » cette année scolaire (Progression, Maîtres), et aucune observation d'exploration ne l'a montré acquis. N'est jamais un échec : exclue de la maîtrise, comptée « non couverte ». |
| 2 | **Non évaluée** | `P = 0` (aucune observation valide), ou toutes ses notions désactivées (maintenance). |
| 3 | **Évaluation insuffisante** | Observations présentes mais règle §3.3 non remplie. |
| 4 | **En difficulté** | Suffisante et `R < 0,5`. |
| 5 | **Maîtrisée** | Suffisante, `R ≥ 0,8`, au moins **2 observations justes**, `preuveNiveau2`, la dernière observation de l'Arène (s'il y en a) est juste, et `dernière` ≤ 120 jours. |
| 6 | **À consolider** | Suffisante, non maîtrisée, et : `R ≥ 0,8` (une condition de « maîtrisée » manque : pas de preuve au niveau 2, dernière réponse fausse, preuve ancienne) **ou** `R ≥ 0,5` alors qu'elle était « maîtrisée » dans le dernier bilan comparable (acquis qui s'effrite). |
| 7 | **En cours d'acquisition** | Suffisante et `0,5 ≤ R < 0,8`, sans maîtrise antérieure. |

Garanties : une seule bonne réponse ne donne jamais « maîtrisée » (`n ≥ 2`, `P ≥ 2`, 2 justes) ;
une compétence non étudiée ne baisse jamais un score.

Valeur de chaque état dans la maîtrise (§7) : maîtrisée 1 ; à consolider 0,75 ; en cours
d'acquisition 0,5 ; en difficulté 0. Les états 1 à 3 n'entrent pas dans la maîtrise.

Libellés pour l'élève (ton coach) : « Pas encore vue », « Pas encore testée », « À confirmer »,
« On s'y remet », « En route », « Maîtrisée », « À entretenir ». Libellés parents : ceux du tableau.

Relation avec le suivi existant : le rapport par **notion** (5 états, ADR 0013) est inchangé et
reste celui de l'Entraînement ; les 7 états s'appliquent aux **compétences** et aux bilans.

## 5. Moteur adaptatif commun

Fonctions pures dans `packages/engine/src/evaluation/` ; le serveur les appelle à chaque étape et
stocke l'état. Paramètres réunis dans `EVALUATION` :

| Paramètre | Valeur |
| --- | --- |
| Questions notées (cible / min / max) | 16 / 12 / 20 |
| Questions d'exploration (prérequis + avancées), en plus, total ≤ 20 | ≤ 4 (prérequis) et ≤ 3 (avancées) |
| Durée maximale | 15 min, puis fin à la question en cours |
| Expiration d'une épreuve non terminée | 7 jours |

### 5.1 Préparation (au lancement)

1. Construire le **périmètre noté** S selon l'épreuve (§6) et le **programme concerné** Π.
2. Lire les observations antérieures des notions de S et de leurs prérequis (≤ 180 jours, ≤ 20 par
   compétence) et les copier, résumées, dans l'état de l'épreuve (pas de relecture à chaque question).
3. Calculer pour chaque compétence de S son **besoin** :
   - déjà suffisante par §3.3 (b) ou par un bilan Arène de moins de 90 jours → **1 question de
     vérification** ;
   - sinon → **2 questions** (3 si les deux premières se contredisent, voir 5.3).
4. Si la somme des besoins dépasse le budget, garder par ordre : essentielles, jamais évaluées,
   preuve la plus ancienne, ordre du programme. Les autres restent « non évaluée » ou « évaluation
   insuffisante » (la couverture le montre ; la prochaine épreuve les prendra en priorité).

### 5.2 Choix de la question suivante

1. **Domaine** : parmi les domaines de S qui ont encore une compétence avec besoin, prendre celui
   qui a reçu le moins de questions (tourniquet) ; égalité → ordre N, G, E, D, F, I.
2. **Compétence** dans ce domaine, par priorité décroissante :
   `10 × essentielle + 3 × besoin restant + 2 × (preuve > 90 jours ou absente)` ; jamais la même
   compétence deux fois de suite s'il en reste une autre ; égalité → ordre du programme.
3. **Notion** dans la compétence : pas encore posée dans cette épreuve, non désactivée, la moins
   observée récemment ; égalité → ordre du chapitre.
4. **Niveau** (5.3). 5. **Graine** : tirée par le serveur ; refusée et retirée (5 essais au plus) si
   le couple notion/graine a été posé à ce profil dans les 60 derniers jours.

### 5.3 Difficulté progressive

- **Échauffement** : les 2 premières questions de l'épreuve au niveau 1 (elles comptent).
- **Niveau de départ** d'une compétence : 1 si son état antérieur est « en difficulté » ; 3 si
  « maîtrisée » ; sinon le **niveau global** : 2 par défaut, puis, dès 4 réponses, 1 si la
  réussite globale de l'épreuve est < 40 %, 3 si > 80 %.
- **Escalier** par compétence : juste → niveau +1 (max 3) ; faux → −1 (min 1).
- **Conclusion** d'une compétence : besoin couvert et deux dernières réponses concordantes, ou
  3 réponses posées. Exception : `R ≥ 0,8` sans preuve de niveau 2 → une question de niveau 2 en
  plus si le budget le permet.
- **Protection contre le découragement** : après 4 erreurs consécutives, niveau 1 forcé et
  changement de domaine ; après 7, fin de la partie notée et passage direct à l'exploration des
  prérequis (« cherchons tes points forts »), présentée positivement.

### 5.4 Explorations (hors score)

- **Prérequis** : déclenchée quand une compétence **essentielle** se conclut « en difficulté »
  (ou 2 erreurs sur 2). On interroge son prérequis principal, au niveau 1 puis 2 (2 questions),
  au plus 2 compétences explorées par épreuve (≤ 4 questions). Si le prérequis est lui aussi en
  difficulté, on ne descend pas plus bas dans la même épreuve ; il est signalé « prérequis à
  retravailler ». Résultat rangé avec le rôle `prerequis`.
- **Avancées** : proposées en fin d'épreuve seulement si la réussite globale est ≥ 80 % et qu'il
  reste du temps ; l'élève peut refuser (« Défi bonus ? »). 3 questions au plus, sur des
  compétences hors périmètre (voir §6). Résultat rangé avec le rôle `avance` : seuls « maîtrisée »
  et « en cours » sont affichés (« déjà en avance sur… ») ; un échec n'est jamais montré comme tel.

### 5.5 Fin et reprise

- **Fin** quand toutes les compétences de S sont conclues et ≥ 12 questions notées, ou 20 questions,
  ou 15 minutes, puis explorations éventuelles. Une fin au temps ou au maximum est marquée
  `partielle`.
- **Reprise** : l'état est enregistré après chaque réponse ; la question en attente est conservée
  (même notion, niveau, graine) : recharger la page la redonne à l'identique. Une seule épreuve
  ouverte par profil et par matière ; relancer reprend celle-ci.
- **Abandon** : au-delà de 7 jours, ou nouvelle version du format d'état (ADR 0009), l'épreuve passe
  `expiree` : pas de bilan ni de récompense, mais les réponses restent des observations.
- **Pendant l'épreuve** : pas d'indice, pas de second essai, pas d'explication, « Je ne sais pas »
  possible (observation fausse, sans pénalité de jeu). Outils de la notion (calculatrice,
  brouillon, tableaux de conversion) disponibles comme à l'Entraînement : ils font partie de la
  notion. À la fin : « Revoir mes réponses » régénère chaque question et montre la correction pas
  à pas existante.

## 6. Spécificités des épreuves

| | Origines | Progression | Maîtres |
| --- | --- | --- | --- |
| Référentiel | classe N−1 (CM1 → CE2) | classe N | classe N |
| Périmètre noté S | essentielles de N−1 | compétences de N déclarées « vues » | toutes les compétences de N sauf « pas encore vues » |
| Programme concerné Π (couverture) | essentielles de N−1 | toutes les compétences de N | toutes les compétences de N |
| Prérequis explorés | N−2 (aucun pour CM1) | N−1 | N−1 |
| Avancées (hors score) | essentielles de N | chapitres de N « pas vus » ou « je ne sais pas » | essentielles de N+1 (sauf 3e : aucune) |
| Répétition | libre ; récompensée 1 fois par année scolaire et matière | libre ; récompense de participation au plus tous les 14 jours | libre ; récompensée 1 fois par année scolaire |
| Recommandée quand | aucun bilan Origines cette année scolaire | Origines déjà fait | à partir du 1er mai, ou ≥ 70 % des chapitres déclarés vus |

**Origines.** 7 à 8 essentielles × 2 questions ≈ 14–16 questions + exploration. Jamais de
compétence de N notée. Le bilan Origines le plus récent de l'année scolaire est le **niveau de
départ** de la matière ; il le reste même si l'élève refait l'épreuve plus tard (le parent voit
alors les deux, datés). Il produit « à consolider pour réussir en N » : les compétences de N dont
un prérequis est en difficulté, à consolider ou insuffisant.

**Progression.** Avant la première Progression de l'année (et ensuite sur demande), écran
« Qu'as-tu déjà vu en classe ? » : la liste des chapitres de N, trois choix par chapitre — Oui,
Pas encore, Je ne sais pas (défaut). Règles : « Pas encore » → non étudiée (§4) ; « Je ne sais
pas » → hors score, seulement en exploration avancée ; un chapitre que l'élève a déjà travaillé à
l'Entraînement (≥ 4 observations) est pré-coché « Oui » (modifiable). Budget : compétences jamais
évaluées 2 questions ; compétences avec preuves suffisantes 1 question de vérification ;
**conservation des acquis** : jusqu'à 3 compétences « maîtrisées » d'un bilan comparable de plus
de 30 jours, 1 question chacune (les plus anciennes d'abord). Résultats propres à la Progression :
nouvelles compétences maîtrisées, difficultés persistantes, régressions (§7.3), jusqu'à
3 entraînements proposés avec lancement direct.

**Maîtres.** Évalue toute l'année : essentielles 2 questions, autres 1 question complétée par les
preuves antérieures. Lancée avant la fin du programme, l'épreuve affiche toujours trois groupes
séparés : étudiées et évaluées / non étudiées / non évaluées. Le titre du bilan est « Bilan des
Maîtres » seulement si la couverture ≥ 90 % et toutes les essentielles évaluées ; sinon « Bilan des
Maîtres partiel — X % du programme couvert ». Jamais le mot « validé ». Recommandations « pour
préparer la N+1 » : essentielles non maîtrisées de N qui sont prérequis d'essentielles de N+1.
Au changement de classe, ce bilan et l'Origines de la nouvelle année portent sur le **même
référentiel** (classe N devenue N−1) : ils sont donc directement comparables (§7.2).

## 7. Maîtrise, couverture, comparabilité

### 7.1 Formules

Poids d'une compétence `w` = 2 si essentielle, 1 sinon.
`E` = compétences de S dont l'état est 4 à 7 (évaluées).

- **Maîtrise** `M = Σ_{c ∈ E} w·v(c) / Σ_{c ∈ E} w`, avec `v` du §4.
- **Couverture** `C = Σ_{c ∈ E} w / Σ_{c ∈ Π} w`.
- **Étudié** (Progression, Maîtres) `T = Σ_{c déclarées vues} w / Σ_{c ∈ Π} w`.

Affichage : arrondi au multiple de 5 % le plus proche ; M n'est **pas affichée** si
`Σ_{E} w < 4` (« Pas encore assez d'éléments ») ; M toujours accompagnée de C et du compte
« x maîtrisées, y en cours, z en difficulté sur n évaluées ». Les explorations (`prerequis`,
`avance`) n'entrent ni dans M ni dans C. Par domaine : mêmes formules restreintes au domaine.

### 7.2 Comparabilité

Deux bilans sont **comparables** si même matière, même classe de référentiel et même version du
référentiel. Donc : Progression ↔ Progression ↔ Maîtres de la même année : oui ; Origines (N−1)
↔ Progression (N) : **jamais** ; Maîtres de 5e ↔ Origines de 4e (tous deux sur le programme de
5e) : oui. Une comparaison porte uniquement sur les compétences évaluées dans les deux bilans
(intersection) ; il faut au moins 3 compétences communes, sinon « Pas encore comparable ». Les
écarts de M entre deux bilans sont toujours recalculés sur l'intersection, jamais par différence
des M globaux.

### 7.3 Catégories de progrès (bilan B comparé au bilan comparable précédent A)

| Catégorie | A | B |
| --- | --- | --- |
| Nouvelle compétence acquise | non maîtrisée ou absente | maîtrisée |
| Difficulté résolue | en difficulté | en cours, à consolider ou maîtrisée |
| Difficulté persistante | en difficulté | en difficulté |
| Régression | maîtrisée ou à consolider | en difficulté ; ou maîtrisée → à consolider |
| Stable | même état | même état |

« Nouvelle compétence acquise » peut aussi venir d'une compétence évaluée pour la première fois.

## 8. Récompenses

Paramètres dans `ECONOMY.evaluation` (ADR 0019), versés dans la transaction de clôture (ADR 0015),
simulation `economy.test.ts` mise à jour. Aucune XP par bonne réponse ; aucun bonus de vitesse.

| Récompense | Condition | Gain |
| --- | --- | --- |
| Participation | Épreuve terminée (y compris partielle), dans la période récompensée (§6) | 40 XP + coffre commun |
| Persévérance | Épreuve terminée sans abandon, toutes les questions prévues répondues (« Je ne sais pas » compris) ; ou reprise d'une épreuve interrompue jusqu'au bout | coffre commun → rare |
| Régularité | Progression terminée ≥ 21 jours après le bilan précédent de la matière | +30 XP |
| Progrès | Chaque compétence qui devient « maîtrisée » pour la première fois de l'année scolaire | +15 XP chacune, 60 XP au plus |

Pièces : `coinsForXp` comme ailleurs ; le coffre suit `fillChest`. Hors période récompensée :
20 XP, pas de coffre. Pourquoi ce barème : rien ne pousse à répondre faux (aucune récompense liée
aux erreurs) ni à saboter un premier bilan (le progrès n'est payé qu'une fois par compétence et
par année). L'écran de résultats valorise l'effort (« 18 questions affrontées », compétences en
route, prérequis retrouvés) avant les chiffres. Badges : aucun nouveau badge dans ce lot.

## 9. Intégration dans les Défis et parcours

- `MODES` gagne `{ id: 'evaluation', name: 'Arène d'évaluation', pitch: 'Fais le point : d'où tu
  pars, ce que tu sais, ce qui reste', category: 'defis' }`. Le Hub l'affiche dans la section
  Défis à côté de Contre-la-montre et Survie (aucune autre modification du Hub).
- `/jouer/evaluation` → choix de la matière (ModeSetup existant ; matière sans référentiel :
  tuile « Bientôt ») → `/jouer/evaluation/:subject` : **accueil de l'Arène** pour cette matière :
  les 3 épreuves (l'épreuve recommandée mise en avant avec sa raison), l'épreuve en cours à
  reprendre, l'historique daté de la matière, la dernière recommandation d'entraînement.
- `/partie/evaluation/:id` : épreuve scénarisée — chaque épreuve a son gardien et son décor
  (assets existants : héros, arènes, animations d'attaque) ; une barre de progression par domaine
  (bannières), pas de cœurs ni de chrono visible ; chaque réponse fait avancer le héros.
- `/evaluation/:id` : résultats puis « Revoir mes réponses » ; consultable depuis l'historique.
- Profil sans classe : « Indique ta classe dans ton profil » ; profil Adulte : épreuves du niveau 3e (Origines sur la 4e, Progression et Maîtres sur la 3e).
- Le mode n'apparaît pas dans les records de Défis ni dans « Se comparer ».

## 10. Modèle de données et migrations

Migration `0020_arene_evaluation.sql` (journal Drizzle, `when` croissant). Toutes les tables sont
rattachées au profil (`ON DELETE CASCADE`) : isolation par famille via le profil, effacement avec lui.

**`evaluations`** — une épreuve (en cours ou bilan figé)

| Colonne | Type | Rôle |
| --- | --- | --- |
| id | uuid PK | |
| profile_id | uuid FK profiles, cascade | |
| session_id | uuid FK sessions, cascade, unique | partie de mode `evaluation` (réponses dans `attempts`) |
| subject | text | |
| kind | text check in (`origines`, `progression`, `maitres`) | |
| profile_grade | text | classe de l'élève au lancement |
| referential_grade | text | classe évaluée (`ce2`…`3e`) |
| referential_version | smallint | |
| school_year | smallint | année de rentrée |
| status | text check in (`en-cours`, `terminee`, `expiree`) | |
| state | jsonb `{v, state}` | état du moteur (null une fois terminée) |
| partial | boolean | fin au temps/maximum, ou Maîtres partiel |
| mastery, coverage, studied | smallint 0–100, null | valeurs non arrondies (arrondi à l'affichage) |
| evaluated_count, mastered_count | smallint | |
| xp, coins, chest | integer, integer, text | récompenses versées |
| started_at, finished_at | timestamptz | |

Index : `(profile_id, subject, finished_at desc)` ; unique partiel `(profile_id, subject) where
status = 'en-cours'` (une seule épreuve ouverte par matière) ; checks de bornes 0–100.

**`evaluation_competences`** — résultat figé par compétence

| Colonne | Type |
| --- | --- |
| evaluation_id | uuid FK evaluations, cascade |
| competence_id | text |
| role | text check in (`score`, `prerequis`, `avance`) |
| domain | text |
| essential | boolean |
| state | text check (7 états) |
| rate | smallint 0–100, null (R × 100) |
| weight | smallint (P × 10) |
| arena_answers | smallint |
| weakest_skill_id | text null (notion la plus fragile, pour les recommandations) |

PK `(evaluation_id, competence_id)`.

**`studied_chapters`** — chapitres déclarés

| Colonne | Type |
| --- | --- |
| profile_id | uuid FK profiles, cascade |
| school_year | smallint |
| chapter_id | text |
| status | text check in (`vu`, `pas-vu`, `ne-sait-pas`) |
| updated_at | timestamptz |

PK `(profile_id, school_year, chapter_id)`.

**Existant modifié (code, pas de colonne)** : `MODE_IDS` + `evaluation` ; `sessions.chapter_id`
reçoit `ref-<matière>-<classe>` ; filtres à ajouter pour exclure `evaluation` des badges « série
parfaite » (`learning.repo.ts`, aujourd'hui `ne(mode, 'boss')`), des records et du classement ;
`skill_states` jamais écrit par l'épreuve.

**Retour arrière** (`down`) : `DROP TABLE evaluation_competences, evaluations, studied_chapters;`
puis `DELETE FROM sessions WHERE mode = 'evaluation'` (supprime aussi leurs `attempts`), sans
quoi l'ancien contrat refuse ce mode. Testé sur données fictives ; en production, accord du client
(suppression de données). Volumétrie : ≈ 20 lignes `evaluation_competences` par bilan, quelques
bilans par mois et par matière : négligeable.

## 11. Contrats d'API

Schémas zod dans `packages/shared/src/evaluation.ts`, déclarés dans `api/contract.ts`, accès
`family` ; chaque route vérifie `owns.profile` (pour `/evaluations/:id`, via le profil de
l'épreuve ; autre famille → 404, comme les autres ressources).

| Méthode et chemin | Rôle | Réponse |
| --- | --- | --- |
| GET `/profiles/:id/evaluations/home?subject=` | Accueil de la matière : épreuves (disponible, recommandée + raison, récompense possible), épreuve ouverte, historique court | `EvaluationHome` |
| GET `/profiles/:id/studied-chapters?subject=` | Déclaration de l'année en cours (avec pré-cochage) | `StudiedChapter[]` |
| PUT `/profiles/:id/studied-chapters` | `{ subject, chapters: [{ chapterId, status }] }` | 204 |
| POST `/evaluations` | `{ profileId, subject, kind }` ; reprend l'épreuve ouverte s'il y en a une (même `kind`), sinon 409 avec son id | 201 `{ id, resumed, plan: { questions, domains } }` |
| GET `/evaluations/:id/next` | Question en attente (idempotent) ou fin | `{ question: { skillId, level, seed, index, planned, domain, role } }` ou `{ done: true, canExploreAdvanced }` |
| POST `/evaluations/:id/answers` | `{ skillId, level, seed, response, durationMs }` ; doit correspondre à la question en attente, sinon 409 ; rejouée → même réponse | `{ recorded: true, progress: { index, planned, byDomain } }` (pas de juste/faux, voir décision client n°1) |
| POST `/evaluations/:id/advanced` | `{ accept: boolean }` | 204 |
| POST `/evaluations/:id/finish` | Clôture (idempotente) : bilan figé + récompenses | `EvaluationResult` |
| GET `/evaluations/:id` | Bilan (et, si `?review=1`, les questions posées pour « Revoir mes réponses ») | `EvaluationResult` |
| GET `/profiles/:id/evaluations?subject=` | Historique | `EvaluationListItem[]` |
| GET `/profiles/:id/evaluation-summary` | Données de l'Espace parent (§12) | `EvaluationSummary` |

`EvaluationResult` : `{ id, kind, subject, referentialGrade, finishedAt, partial, mastery,
coverage, studied, counts, domains: [{ domain, mastery, coverage }], competences: [{ id, title,
domain, essential, role, state, weakestSkillId }], strengths, toWork, notEvaluated, notStudied,
progress: { comparedWith, common, newlyMastered, resolved, persistent, regressions } | null,
priorities (≤ 3), trainings: [{ chapterId, skillId }] (≤ 3), rewards }`. Valeurs en 0–100 non
arrondies ; l'arrondi et les phrases sont faits par le client web, comme `summary.ts`.

## 12. Espace parent

Dans la page de l'enfant épurée (#94), **sans nouvel écran** :

**En haut, les 4 réponses** (une phrase chacune, par matière évaluée ; matières sans bilan : une
seule ligne « Pas encore de bilan en … : il peut le passer dans Défis → Arène d'évaluation ») :

1. **Niveau de départ** (dernier Origines de l'année) : « En septembre, Léa maîtrisait 5 des
   7 fondamentaux de 6e ; à consolider : fractions, division. »
2. **Ce qu'il maîtrise** (dernière Progression ou Maîtres) : « Sur ce qu'elle a étudié cette année
   (35 % du programme), elle maîtrise 70 % des compétences évaluées. »
3. **Ses progrès** (deux derniers bilans comparables) : « Depuis le 10 décembre : 2 nouvelles
   compétences acquises, 1 difficulté résolue (nombres relatifs). » Sinon : « Un deuxième bilan
   permettra de mesurer ses progrès. »
4. **À réviser en priorité** : au plus 3, dans l'ordre : essentielles en difficulté, régressions,
   prérequis à retravailler ; chaque ligne nomme la compétence et la notion conseillée
   (« Fractions — comparer des fractions ») et, si utile, un acquis à entretenir ou un progrès à
   encourager. Texte seulement : aucun bouton de création d'entraînement (#94).

Cette réponse 4 **remplace** l'encart « À réviser » de #94 pour une matière qui a un bilan ; sans
bilan, l'encart #94 (notions les plus fragiles) reste. Un seul « À réviser » à l'écran.

**En dessous, section « Bilans » repliée**, un bloc par matière :

- courbe chronologique de la maîtrise : un point par bilan, forme différente par épreuve
  (Origines ○, Progression ●, Maîtres ★) ; les Origines forment une série séparée, légendée
  « programme de 6e (année précédente) » ; une ligne ne relie que des bilans comparables ; sous
  chaque point, la couverture du bilan ;
- maîtrise par domaine du dernier bilan (barres horizontales, couverture du domaine en texte) ;
- couverture du programme du dernier bilan (une barre « évalué / étudié / programme ») ;
- historique daté : type, date, maîtrise et couverture, mention « partiel ».

Une seule requête (`evaluation-summary`), pas d'autre graphique.

## 13. Exemples chiffrés

**A. État d'une compétence avec les autres modes.** `m5-fractions`, Progression en décembre.
Entraînement : 6 premières réponses sans aide sur 2 jours dans les 30 derniers jours, 5 justes
(dont 2 de niveau 2). `Pe = 6 × 0,5 = 3`, 2 jours → suffisante par (b), `R = 2,5/3 = 0,83`.
Besoin : 1 vérification, au niveau global (2). Réponse juste : `P = 4`, `R = (2,5 + 1)/4 = 0,875`, 2 justes ou plus, preuve de
niveau 2, dernière réponse Arène juste → **Maîtrisée**. Réponse fausse : `R = 2,5/4 = 0,625`,
sans maîtrise antérieure → **En cours d'acquisition**.

**B. Une bonne réponse ne suffit pas.** `m6-angles`, aucune donnée antérieure, Origines : une
réponse juste au niveau 2 → `P = 1` → **Évaluation insuffisante** ; deuxième réponse juste au
niveau 3 → `P = 2`, `n = 2`, `R = 1` → **Maîtrisée**. Si les deux réponses sont au niveau 1
(échauffement) et justes → une 3e au niveau 2 est posée ; sans budget → **À consolider**.

**C. Origines d'un élève de 5e (programme de 6e).** Π = S = 8 essentielles, `Σw = 16`.
Résultats : numération, calcul, longueurs, angles maîtrisées ; aires à consolider ; division en
cours ; fractions en difficulté ; proportionnalité non évaluée (fin au temps). `E` = 7
compétences, `Σw = 14`. `M = (4×2×1 + 2×0,75 + 2×0,5 + 2×0)/14 = 10,5/14 = 75 %` ;
`C = 14/16 = 87,5 %` → affichés **75 %** et **90 %**, mention « partiel ». Exploration : fractions
→ prérequis `mcm2-fractions` (2 questions), en cours → « prérequis à consolider : fractions du
CM2 ». À consolider pour réussir en 5e : `m5-fractions` (prérequis en difficulté),
`m5-operations` (prérequis `m6-division` en cours), `m5-proportionnalite` (prérequis non évalué).

**D. Progression de 5e en décembre.** Π = 17 compétences, `Σw = 7×2 + 10 = 24`. Déclarées vues :
calcul, opérations (E), relatifs (E), fractions (E), repérage, symétries → `T = 9/24 = 37,5 %`
(40 %). Toutes évaluées. États : calcul M, opérations M, relatifs en cours, fractions à
consolider, repérage M, symétries en difficulté. `M = (1 + 2 + 2×0,5 + 2×0,75 + 1 + 0)/9 =
6,5/9 = 72 %` → **70 %** ; `C = 9/24` → **40 %**. Affichage : « Maîtrise 70 % des compétences
évaluées — 40 % du programme de 5e couvert ».

**E. Comparaison.** Progression de mars (même référentiel) : 11 compétences évaluées, dont les 6
de décembre. Intersection = 6. Relatifs en cours → maîtrisée (nouvelle acquise), symétries en
difficulté → en cours (difficulté résolue), fractions à consolider → maîtrisée (nouvelle
acquise), calcul maîtrisée → à consolider (régression légère). M sur l'intersection : 72 % →
`(1×0,75 + 2 + 2×1 + 2×1 + 1 + 1×0,5)/9 = 8,25/9 = 92 %` → « +20 points sur les 6 compétences
déjà évaluées en décembre » ; la M globale de mars (11 compétences) est affichée à part.

**F. Récompenses.** Origines terminée (1re de l'année) sans abandon : 40 XP + coffre rare ;
2 compétences maîtrisées pour la première fois de l'année : +30 XP → 70 XP, 7 pièces + coffre.
Progression refaite 5 jours plus tard : 20 XP, pas de coffre.

**G. Durée.** Origines 5e : 16 questions notées + 2 d'exploration = 18 questions ; temps cible
moyen des notions ≈ 25–40 s → 8 à 12 minutes.

## 14. Risques, dette, sécurité

**Risques**

| Risque | Mesure |
| --- | --- |
| Diagnostic faussé par des questions mal calibrées (niveaux 1–3 hétérogènes d'une notion à l'autre) | Seuils prudents (2 observations, preuve de niveau 2) ; suivi en pilotage du taux de réussite par notion et niveau dans l'Arène ; signalements existants |
| Contenu CE2 non sourcé (#99) | Pas d'Origines CM1 tant que #99 n'est pas livré (épreuve « Bientôt » pour le CM1) |
| Parties `evaluation` comptées à tort (badges, records, classement) | Liste des requêtes à filtrer dans #100, test dédié |
| Confusion des vocabulaires (5 états de notion, médailles, 7 états de compétence) | Le parent ne voit que les 7 états dans « Bilans » et les 4 réponses ; l'encart #94 cède la place quand un bilan existe |
| Pourcentages mal lus | M jamais seule, arrondi à 5 %, M masquée sous 4 points de poids, comparaisons sur l'intersection |
| Triche (réponse à une autre question, rejeu) | Le serveur choisit la question et refuse toute autre ; réponses rejouées idempotentes |
| Retour arrière destructif | Voir §10 ; accord client en production |

**Dette existante qui gêne**

- `sessions.chapter_id` obligatoire alors qu'une épreuve couvre plusieurs chapitres — **petite**
  (on y met l'identifiant du référentiel ; à rendre facultatif un jour).
- Requêtes de badges et de classement qui filtrent par exclusion de mode (`ne(mode, 'boss')`) :
  chaque nouveau mode risque d'y entrer par erreur — **petite** (passer à une liste blanche).
- Trois vocabulaires d'état coexistent (suivi des notions, médailles « Fragile/Satisfaisante »,
  états de compétence) — **moyenne** : à unifier côté affichage après l'Arène, hors de ce lot.

**Sécurité et données** : aucune donnée personnelle nouvelle (classe et dates déjà connues) ;
isolation par `owns.profile` sur toutes les routes, tests d'accès croisé entre familles ;
suppression en cascade avec le profil ; les nouvelles tables entrent dans l'anonymisation et
l'export existants (ADR 0027) ; aucun appel externe.

## 15. Découpage des tickets

Corrections au découpage initial : (1) titres « Arène du Savoir » → « Arène d'évaluation » ;
(2) #101 : le mode s'ouvre depuis **Défis**, pas le menu principal (déjà noté en commentaire) ;
(3) **ajouter un ticket « Référentiel d'évaluation maths CM1 → 3e »** (données §2, tests de
cohérence), séparé de #99 et prérequis de #100 ; (4) le livrable de #98 s'appelle
`docs/ARENE-EVALUATION.md`.

| Ordre | Ticket | Contenu | Dépend de | Risque |
| --- | --- | --- | --- | --- |
| 1 | #97 | Renommer « Arène » → « Duels » (libellés ; id `arene` et routes conservés ou redirigés) | — | faible |
| 1 | #106 | « Combat de boss » → « Mode Histoire » (libellés) | — | faible |
| 1 | #99 | Fondamentaux CE2 sourcés, registre « évaluation seulement » du catalogue | — | moyen (sourcing) |
| 2 | nouveau | Référentiel maths CM1 → 3e (essentielles, prérequis, version) + tests | #98 validé | faible |
| 3 | #100 | Moteur pur `engine/evaluation` (états, sélection, scores, comparaisons, tests exhaustifs des exemples §13) ; module serveur, migration 0020, API, exclusions badges/records, économie | référentiel | **élevé** (cœur) — prévoir 2 PR : moteur pur puis serveur |
| 4 | #101 | Mode de jeu dans Défis : accueil de la matière, épreuve scénarisée, reprise, résultats, revoir mes réponses, historique, récompenses — livré avec l'épreuve Origines activée | #100 | moyen (UX) |
| 5 | #102 | Origines : réglages §6, exploration des prérequis et avancées, « à consolider pour réussir en N » ; CM1 activé quand #99 est livré | #101 (#99 pour CM1) | faible |
| 6 | #103 | Progression : déclaration des chapitres, conservation des acquis, progrès et régressions, entraînements proposés | #101 | moyen |
| 7 | #104 | Maîtres : bilan partiel, recommandations N+1, comparabilité au changement de classe | #103 | faible |
| 8 | #105 | Espace parent : 4 réponses + « Bilans » repliable | #94, #103 | moyen |

#97, #106 et #99 peuvent avancer en parallèle dès maintenant. Les autres matières : un ticket par
matière, qui n'écrit que son référentiel (l'anglais d'abord, quand son programme est rédigé).
