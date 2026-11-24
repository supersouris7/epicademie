# Épicadémie — système graphique

Direction artistique : planches « Épicadémie » (novembre 2026). Jeu cartoon pour tablette, violet, orange et crème
dominants, contours épais, relief franc. Les illustrations sont générées avec ChatGPT Images (voir
[ASSETS-CHATGPT.md](ASSETS-CHATGPT.md)) puis importées par script.

## Arborescence

```
apps/web/
├── assets-src/originals/     PNG livrés par ChatGPT (jamais modifiés, hors image Docker)
│   └── sheets/               planches en grille, découpées à l'import
├── assets-src/chatgpt/       planches livrées hors catalogue (ordre ou contenu différents), gardées telles quelles
├── public/assets/            images servies : WebP finaux + SVG provisoires
│   ├── branding/  characters/{alex,zoe,leo,mia,questy}/  bosses/{maths,physics,biology,french,history,general,minions}/
│   ├── weapons/  projectiles/  icons/{navigation,resources,status,subjects,tools,modes,items}/
│   ├── hud/{frames,buttons,tiles}/  rewards/{medals,chests,collectibles}/
│   └── environments/{backgrounds,arenas,tiles,props}/  effects/{impacts,particles,transitions}/
├── scripts/assets/
│   ├── build.ts      SVG provisoires (générés en code, palette imposée) → `pnpm --filter @epicademie/web assets:svg`
│   ├── plan.ts       arborescence + guide ChatGPT + liste des images livrées → `assets:plan`
│   ├── import.ts     import des PNG → WebP détourés → `assets:import [--force] [filtre]`
│   ├── cut.ts        planche hors catalogue → originaux individuels → `assets:cut <png> 3x3 <chemin|-> …`
│   └── image.ts      détourage magenta, découpe en grille, contrôles (testé)
└── src/design/
    ├── palette.ts            couleurs (source unique)
    ├── tokens.css            variables CSS : palette, sémantique (thème violet lumineux unique), contours, rayons, ombres, icônes, durées
    ├── assets.ts             catalogue : 327 images prévues (type, taille, prompt, priorité, remplaçant) + manifeste
    ├── assets.generated.ts   SVG provisoires (généré)
    ├── assets.available.ts   images finales présentes (généré)
    ├── motion.ts             ressorts, apparitions, mouvements par état de personnage
    ├── skin.ts               habillage 9 parts (border-image) des cadres et boutons livrés
    └── heroes.ts             couleur de carte de chaque héros
```

## Cycle d'un asset

1. Le catalogue (`src/design/assets.ts`) décrit l'asset : chemin final, type (taille de génération et finale, cadrage),
   prompt, priorité, remplaçant SVG éventuel.
2. `assets:plan` régénère `docs/ASSETS-CHATGPT.md` et crée les dossiers.
3. L'image générée est déposée dans `assets-src/originals/<chemin>.png` (ou `sheets/<planche>.png`).
4. `assets:import` :
   - retire le fond magenta par remplissage depuis les bords, ce qui épargne le violet et le rose du sujet ;
   - adoucit et dé-magentise les bords ;
   - découpe les planches : chaque forme est rattachée à la case de la grille qui contient son centre
     (un élément qui déborde n'est ni coupé ni mêlé au voisin) ;
   - un original individuel est prioritaire sur la case de planche correspondante ;
   - recadre les icônes ;
   - convertit en WebP aux dimensions finales ;
   - vérifie les coins transparents, l'absence de reste magenta et la présence de transparence ;
   - met à jour `assets.available.ts`.
5. `assetSrc(id)` sert l'image finale. Avant son arrivée, il sert le SVG provisoire ; à défaut, il renvoie `null` et le composant s'adapte.

Statuts du manifeste : **disponible** (WebP présent), **provisoire** (SVG de remplacement), **manquant** (rien).
La page `/dev/assets` (développement uniquement, absente du build) affiche tous les composants et le catalogue par
catégorie et par statut.

Planche livrée dans un autre ordre ou avec d'autres objets : la ranger dans `assets-src/chatgpt/`, puis
`assets:cut` attribue chaque case utile à un chemin du catalogue (`-` pour ignorer), avant `assets:import`.

## Règles de dessin

- Contour encre `#1D1238`, épais et régulier ; ombre franche en bas à droite ; reflet blanc en haut à gauche.
- Uniquement les couleurs de `palette.ts` dans les SVG (testé) ; aucun hexadécimal dans les composants (tokens).
- Aucun texte dans les images, sauf le logo et le badge XP : les libellés sont écrits par l'application.
- Cadres et boutons livrés « vides » et étirables (coins identiques, bords droits) : `skinStyle()`.
- Les cadres illustrés sont crème : leur contenu passe en `on-light` (texte encre, surfaces crème).

## Composants (`src/components/game/`)

| Composant                   | Rôle                                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GameButton`                | Bouton de jeu. Variantes : primary, accent, info, success, danger, surface. Tailles sm à xl. Icône, mode `iconOnly`. États : survol, appuyé, désactivé, `selected`, `locked`. |
| `GameIcon`                  | Icône du catalogue (WebP sinon SVG provisoire), tailles des tokens, décorative par défaut.                                                                                    |
| `GamePanel`                 | Panneau crème à bordure violette et coins orange, avec onglet de titre optionnel (`h2`).                                                                                      |
| `ResourceCounter`           | Capsule avec icône débordante, valeur qui rebondit, bouton « + » optionnel.                                                                                                   |
| `ProgressBar`               | Barre segmentée animée en `scaleX`. Sert de base à `HealthBar`, `EnergyBar`, `XPBar` (badge de niveau) et `BossHealthBar` (portrait et nom).                                  |
| `CharacterAvatar`           | Avatar du compte (DiceBear) dans l'anneau de jeu, badge de niveau optionnel.                                                                                                  |
| `CharacterCard`, `HeroCard` | Carte de collection : fond coloré, illustration, bandeau de nom ; rôle radio pour le choix du héros.                                                                          |
| `BossCard`                  | Illustration du boss et bandeau de matière ; état vaincu.                                                                                                                     |
| `MedalBadge`, `RewardBadge` | Médaille d'une notion ; tuile de récompense gagnée.                                                                                                                           |
| `SubjectIcon`               | Icône de matière.                                                                                                                                                             |
| `CharacterSprite`           | Héros animé par images clés : une pose par état, mouvement `motion` ; rien n'est affiché sans les poses.                                                                      |
| `GameBackdrop`              | Décor de fond des menus quand il est livré.                                                                                                                                   |
| `Questy`, `QuestyPose`      | Questy : une tête illustrée par humeur, avec la version LED en remplacement ; poses en pied.                                                                                  |

Séparation : l'apparence vient des tokens et des assets, les données arrivent par les props, les états
interactifs sont gérés par les attributs ARIA et les variantes, et les animations sont centralisées dans `design/motion.ts`.

## Animations

- **États prévus** : idle, run, shoot, hurt, victory, defeat pour les héros ; 16 poses et 12 humeurs pour Questy.
- **Point d'ancrage commun** : le milieu des pieds. Il est garanti par le cadrage imposé à la génération : pieds à 92 % de la hauteur, même échelle.
- **Pas de planches de sprites** : les générateurs d'images ne produisent pas d'images successives cohérentes. On anime donc des poses clés avec `transform` et `opacity`.
- **Réduction des animations** : la préférence système est respectée, via `useReducedMotion` et la règle globale de `index.css`.

## Profil et héros

Chaque compte garde son avatar DiceBear et choisit un héros (Alex, Zoé, Léo, Mia), modifiable dans le profil
(colonne `hero`, migration 0005).

## Écran de jeu : écran coupé

- **Disposition** : énoncé et figure d'un côté ; zone de réponse et d'outils (`PlayDock`) de l'autre.
  - En portrait, la zone est en bas, à portée de pouce.
  - En paysage (dès 640 px de large, téléphone couché compris), elle est sur le côté.
  - Aucune fenêtre ne recouvre l'énoncé.
- **Onglets de la zone** :
  - Pavé (ou Clavier, ou Réponse pour les QCM et les points) ;
  - Calculatrice, si la notion la permet ;
  - Brouillon ;
  - Conversion, si la notion la permet.
  - Le contenu de chaque onglet est conservé.
- **Calculatrice** :
  - touche π, multiplication implicite (`25π`) ;
  - 6 décimales au plus, comme la saisie des réponses ;
  - « Envoyer ➜ réponse » remplit le pavé et y revient : l'élève arrondit puis valide.
- **Clavier AZERTY** (`Keyboard`) : lettres accentuées (français, espagnol), majuscule, apostrophe. Il sert aux réponses écrites (`answer.kind = 'text'`).
- **Conseils** : Questy affiche « Tu peux t'aider de la calculatrice » ou « Je te conseille de faire un brouillon ».
  - L'onglet conseillé brille tant qu'il n'a pas été ouvert.
  - Le conseil vient de `skill.advice`, ou à défaut de la calculatrice quand elle est permise.
- **Écrans bas** (hauteur 500 px ou moins) : touches et marges réduites. Les figures sont limitées par `--figure-max`.
- **Hauteur fixe de la zone**, la même pour tous les onglets ; chaque mode remplit cet espace.
  - En portrait : entre 280 et 390 px, soit 40 % de l'écran.
  - Sur le côté : 560 px au plus.
  - L'énoncé garde tout le reste.
- **Tableau de conversion** :
  - proposé sur toute question numérique qui parle de longueurs, d'aires, de volumes ou de contenances (`measureKind`) ;
  - « Envoyer ➜ réponse » lit le nombre comme sur le cahier (`readConversion`) ;
  - la virgule se place juste après le dernier chiffre écrit.
- **Brouillon pleine page** : l'énoncé et la figure restent en haut, la feuille prend le reste, et le dessin est conservé.
- **Avatar** : Visage, Émoji ou Robot. L'avatar remplit exactement le trou de l'anneau illustré, et l'anneau déborde un peu du cadre.
