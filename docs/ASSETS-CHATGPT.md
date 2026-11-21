<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Academy Fighters — génération des images avec ChatGPT

275 images finales, produites en 140 demandes.

Chaque lot existe aussi en **fichier séparé et autonome** (message de départ inclus) dans `docs/chatgpt/` :
c'est ce fichier qu'il faut utiliser dans ChatGPT, un lot par conversation. Ce document-ci regroupe tout pour référence.

**Règles pour ChatGPT** (rappelées dans le message de départ)
- **Une seule image par message**, jamais tout le lot d'un coup.
- **Aucun ZIP, aucun script, aucun détourage par code** : uniquement des images générées, sur fond magenta uni.
- Télécharge chaque image **telle quelle** en PNG (taille d'origine, fond magenta) : le détourage et le redimensionnement sont faits par le script d'import du projet.

| Lot | Contenu | Images | Demandes | Fichier |
|---|---|---|---|---|
| 1 | Marque et fonds de menu | 4 | 1–4 | `docs/chatgpt/lot-01-marque-et-fonds-de-menu.md` |
| 2 | Kit d’interface : cadres, boutons, tuiles | 23 | 5–14 | `docs/chatgpt/lot-02-kit-d-interface-cadres-boutons-tuiles.md` |
| 3 | Pictogrammes blancs (boutons) | 27 | 15–17 | `docs/chatgpt/lot-03-pictogrammes-blancs-boutons.md` |
| 4 | Icônes en couleur | 71 | 18–26 | `docs/chatgpt/lot-04-icones-en-couleur.md` |
| 5 | Questy, la mascotte | 38 | 27–46 | `docs/chatgpt/lot-05-questy-la-mascotte.md` |
| 6 | Kit combat | 112 | 47–140 | `docs/chatgpt/lot-06-kit-combat.md` |

## Modèle à utiliser

Utilise **ChatGPT Images**, le générateur d’images intégré à ChatGPT, qui s’appuie sur le modèle GPT Image le plus récent :

- GPT Image 2.5 est sorti le 8 septembre 2026 ;
- GPT Image 2.6 est sorti le 4 novembre 2026.

Ces dates viennent de l’article Wikipédia « GPT Image ». OpenAI ne précise pas quelle version tourne dans l’application.

**Transparence**
- Dans l’application ChatGPT, le fond transparent est peu fiable. Le message de départ demande donc un fond magenta uni : le script d’import le retirera et vérifiera la transparence.
- Par l’API OpenAI, la série 2.5 (`gpt-image-2.5`) gérerait le fond transparent avec `background: "transparent"` et une sortie PNG. Cette information vient d’un blog tiers et n’est pas confirmée par la documentation d’OpenAI.

## Mode d’emploi

1. Ouvre **une conversation par lot**, pour que le style reste cohérent sans que la conversation ne s’allonge trop.
2. Dans chaque conversation, joins **toutes les planches de référence** et colle le **message de départ** ci-dessous.
3. Envoie ensuite les demandes du lot **une par une**, dans l’ordre.
4. Si une image ne convient pas, demande une correction précise (« contour plus épais », « même personnage mais sans sac ») plutôt que de tout régénérer.
5. Télécharge chaque image en PNG et enregistre-la exactement au chemin indiqué. Les dossiers existent déjà, dans `apps/web/`.
6. Les planches en grille seront découpées automatiquement. Garde toujours les originaux : ils restent dans `assets-src/originals`.
7. Dis-moi quand un lot est déposé. Je le détoure, je le convertis en WebP aux dimensions finales, je contrôle la transparence et je mets à jour le manifeste.

Aucune image ne contient de texte, sauf le logo et le badge « XP ». Les libellés (« Jouer », « Collection », noms des matières, chiffres) sont écrits par l’application, pour rester lisibles et modifiables.

## Message de départ (à coller dans chaque conversation)

```text
Tu es directeur artistique et illustrateur d'un jeu vidéo éducatif pour tablette, « Academy Fighters », destiné aux élèves de 5e (11-13 ans).
Je joins les planches de référence : elles fixent la direction artistique (personnages, mascotte, boss, interface). Toutes les images que je vais te demander doivent appartenir à cet univers et à ce style, comme si un seul illustrateur les avait dessinées. Ne recopie pas le texte des planches.

STYLE (à respecter pour CHAQUE image)
- Illustration 2D cartoon de jeu mobile moderne, rendu propre façon vectoriel, très lisible en petit sur tablette.
- Contour extérieur épais et régulier violet très foncé #1D1238 (environ 3 % de la taille du sujet), contours intérieurs plus fins.
- Ombrage cel-shading en deux tons (ombre franche en bas à droite), un reflet blanc net en haut à gauche, lumière venant du haut à gauche.
- Couleurs saturées. Dominantes : violet #7C4DFF / #4D24B8, orange #FF8A1F, crème #FFF3DD. Secondaires : cyan #1EC8F2, vert #3FC944, rose #FF4FA0, or #FFD23F, rouge #F03A4F.
- Formes arrondies et épaisses, volumes simples, silhouettes reconnaissables au premier coup d'œil.
- Héros : proportions « héroïques chibi » (tête ≈ 1/3,5 de la hauteur), grands yeux expressifs, ados de 12 ans, sympathiques et dynamiques.
- Mascotte : Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Son visage n'existe que sous forme de LED sur la visière.
- Ennemis et boss : menaçants mais comiques, jamais effrayants ni gores.
- Armes : jouets futuristes aux formes rondes et aux couleurs vives, jamais réalistes.
- Éléments d'interface (cadres, boutons, tuiles) : épais, en relief, coins arrondis, bas plus sombre, reflet en haut, comme sur les planches.
- Création 100 % originale : ne copie ni personnage, ni logo, ni interface de Brawl Stars, Clash of Clans, Fortnite ou d'un autre jeu.

INTERDITS (sauf mention contraire dans la demande)
- Aucun texte, lettre, chiffre, logo, signature ou filigrane. Les libellés seront ajoutés par l'application.
- Pas de décor, pas de sol, pas d'ombre portée au sol, pas de cadre autour du sujet.
- Pas de grand halo lumineux flou ni de particules décoratives autour du sujet, pas d'étoiles décoratives.

FOND ET FORMAT
- Fond transparent si tu sais le produire. Sinon : fond uni magenta pur #FF00FF, parfaitement plat (sans dégradé, texture, ombre ni vignettage), et aucune teinte magenta dans le sujet.
- Exception : les illustrations « plein cadre » (fonds de décor, illustration principale, sols) ont un vrai décor et aucun fond magenta.
- Le sujet ne touche jamais les bords de l'image (sauf plein cadre et sols).
- L'application est uniquement en thème sombre : les images seront posées sur un fond violet très sombre (#150C33). Garde un contour bien visible et des couleurs lumineuses pour qu'elles ressortent.
- Respecte exactement la taille d'image demandée (1024×1024, 1536×1024 ou 1024×1536).

MÉTHODE
- Je t'envoie une demande par message. Réponds à chaque fois par UNE seule image, sans commentaire.
- Ne produis jamais d'archive ZIP, de code ni de traitement d'image par script (détourage, redimensionnement, découpe) : uniquement des images générées, en taille d'origine, sur fond magenta. Le détourage est fait de mon côté.
- Quand je joins une image de référence (fiche de Questy, portrait ou boss validé), reproduis exactement le même personnage : couleurs, coiffure, vêtements, proportions.
- Pour une planche en grille, respecte l'ordre et la grille : je découperai l'image automatiquement case par case.

Réponds simplement « Prêt » si tu as compris.
```

## Demandes

### Lot 1 — Marque et fonds de menu

#### 1. Logo Academy Fighters
Enregistrer sous `assets-src/originals/branding/logo.png` · 1536×1024 → final 1200×800

```text
Image 1536×1024. Logo de jeu vidéo : grand blason-bouclier violet à bordure orange et liseré cyan, livre ouvert doré posé sur le haut du blason ; lettrage « ACADEMY » en blanc à contour violet foncé sur la première ligne, « FIGHTERS » plus grand en dégradé jaune-orange à contour violet foncé sur la seconde, lettres très épaisses légèrement inclinées, effet de relief.
Cadrage : logo centré, marge de 8 %, lettrage parfaitement lisible et orthographié exactement.
Style, fond et interdits : ceux du message de départ.
```

#### 2. Emblème
Enregistrer sous `assets-src/originals/branding/emblem.png` · 1024×1024 → final 256×256

```text
Image 1024×1024. Blason-bouclier violet à bordure orange épaisse portant un livre ouvert blanc et un chevron cyan en bas, sans texte, lisible à 32 px.
Cadrage : objet seul, centré, vu de face, marge de 10 % autour.
Style, fond et interdits : ceux du message de départ.
```

#### 3. Fond d’accueil
Enregistrer sous `assets-src/originals/environments/backgrounds/accueil.png` · 1536×1024 → final 1536×1024 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Château-académie violet aux toits pointus et bannières portant un livre, sur une île flottante, autres petites îles flottantes, ciel lavande et nuages roses, lumière douce.
Cadrage : décor plein cadre sans personnage ni texte, détails concentrés en haut et sur les côtés, zone centrale calme et un peu floue pour poser des menus par-dessus.
Style, fond et interdits : ceux du message de départ.
```

#### 4. Fond de combat
Enregistrer sous `assets-src/originals/environments/backgrounds/combat.png` · 1536×1024 → final 1536×1024 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Plaine rocheuse violette au pied du château-académie, cristaux violets, rochers moussus, ciel lavande crépusculaire.
Cadrage : décor plein cadre sans personnage ni texte, détails concentrés en haut et sur les côtés, zone centrale calme et un peu floue pour poser des menus par-dessus.
Style, fond et interdits : ceux du message de départ.
```

### Lot 2 — Kit d’interface : cadres, boutons, tuiles

> Ces éléments sont vides : l’application y écrit les textes et y pose les pictogrammes. Ils seront étirés : les bords doivent rester droits et réguliers.

#### 5. Panneau
Enregistrer sous `assets-src/originals/hud/frames/panel.png` · 1536×1024 → final 768×512 · étirable en 9 parts

```text
Image 1536×1024. Panneau rectangulaire au fond crème clair, épaisse bordure violette, coins renforcés orange, petit liseré intérieur violet clair.
Cadrage : cadre d’interface vide, forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément.
Style, fond et interdits : ceux du message de départ.
```

#### 6. Panneau à onglet
Enregistrer sous `assets-src/originals/hud/frames/panel-tab.png` · 1536×1024 → final 768×512 · étirable en 9 parts

```text
Image 1536×1024. Panneau rectangulaire au fond crème clair, bordure violette, avec en haut à gauche un onglet de titre violet foncé vide qui dépasse du cadre.
Cadrage : cadre d’interface vide, forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément.
Style, fond et interdits : ceux du message de départ.
```

#### 7. Bulle de dialogue
Enregistrer sous `assets-src/originals/hud/frames/bubble.png` · 1536×1024 → final 768×512 · étirable en 9 parts

```text
Image 1536×1024. Bulle de dialogue rectangulaire au fond crème clair, bordure violette, coins orange, pointe triangulaire en bas à gauche.
Cadrage : cadre d’interface vide, forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément.
Style, fond et interdits : ceux du message de départ.
```

#### 8. Cadre HUD
Enregistrer sous `assets-src/originals/hud/frames/hud-frame.png` · 1536×1024 → final 768×512 · étirable en 9 parts

```text
Image 1536×1024. Cadre tech rectangulaire violet aux coins coupés orange et petits voyants cyan au milieu du haut et du bas, intérieur entièrement vide (transparent).
Cadrage : cadre d’interface vide, forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément.
Style, fond et interdits : ceux du message de départ.
```

#### 9. Bannière
Enregistrer sous `assets-src/originals/hud/frames/ribbon.png` · 1536×1024 → final 768×512 · étirable en 9 parts

```text
Image 1536×1024. Bannière de titre horizontale violette vide à extrémités repliées en queue d’aronde violet foncé.
Cadrage : cadre d’interface vide, forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément.
Style, fond et interdits : ceux du message de départ.
```

#### 10. Anneau d’avatar
Enregistrer sous `assets-src/originals/hud/frames/avatar-ring.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Anneau épais violet à quatre encoches orange (haut, bas, gauche, droite) et liseré violet clair.
Cadrage : anneau de cadre rond vu de face, centre entièrement vide (transparent), marge de 6 %.
Style, fond et interdits : ceux du message de départ.
```

#### 11. Cadre de carte de héros
Enregistrer sous `assets-src/originals/hud/frames/hero-card.png` · 1024×1536 → final 384×576

```text
Image 1024×1536. Cadre de carte de collection à coins arrondis, bordure violette épaisse à coins dorés, bandeau violet foncé vide en bas.
Cadrage : cadre de carte de collection vu de face, intérieur vide (transparent), bandeau vide en bas pour le nom.
Style, fond et interdits : ceux du message de départ.
```

#### 12. Cadre de carte de boss
Enregistrer sous `assets-src/originals/hud/frames/boss-card.png` · 1024×1536 → final 384×576

```text
Image 1024×1536. Cadre de carte de collection à coins arrondis, bordure rouge foncé et violette à pointes métalliques, bandeau vide en bas.
Cadrage : cadre de carte de collection vu de face, intérieur vide (transparent), bandeau vide en bas pour le nom.
Style, fond et interdits : ceux du message de départ.
```

#### 13. Planche « boutons » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/boutons.png` · 1536×1024, grille 2×3 → chaque case finale 768×256
Cases : 1 → `hud/buttons/orange` · 2 → `hud/buttons/violet` · 3 → `hud/buttons/cyan` · 4 → `hud/buttons/vert` · 5 → `hud/buttons/rouge` · 6 → `hud/buttons/verrouille`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 2 colonnes × 3 lignes (cases de 768×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : bouton capsule vide (sans texte ni icône), très large et peu haut (rapport 3:1), forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. bouton capsule orange vif à reflet jaune en haut, épais contour violet très foncé, bas plus sombre donnant du relief, reflet net en haut
2. bouton capsule violet à reflet violet clair, épais contour violet très foncé, bas plus sombre donnant du relief, reflet net en haut
3. bouton capsule cyan à reflet bleu clair, épais contour violet très foncé, bas plus sombre donnant du relief, reflet net en haut
4. bouton capsule vert à reflet vert clair, épais contour violet très foncé, bas plus sombre donnant du relief, reflet net en haut
5. bouton capsule rouge à reflet rose, épais contour violet très foncé, bas plus sombre donnant du relief, reflet net en haut
6. bouton capsule gris violacé terne, épais contour violet très foncé, bas plus sombre donnant du relief, reflet net en haut

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 14. Planche « tuiles » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/tuiles.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `hud/tiles/violet` · 2 → `hud/tiles/cyan` · 3 → `hud/tiles/orange` · 4 → `hud/tiles/vert` · 5 → `hud/tiles/rouge` · 6 → `hud/tiles/bleu` · 7 → `hud/tiles/rose` · 8 → `hud/tiles/verrouille` · 9 → `hud/tiles/compteur`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : tuile carrée aux coins arrondis, vide (sans icône), vue de face, marge de 8 %.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. tuile violet en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
2. tuile cyan en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
3. tuile orange en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
4. tuile vert en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
5. tuile rouge en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
6. tuile bleu roi en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
7. tuile rose en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
8. tuile gris violacé terne en relief, épais contour violet très foncé, bas plus sombre, reflet en haut
9. tuile violet très foncé, en forme de capsule allongée horizontale (fond des compteurs de ressources) en relief, épais contour violet très foncé, bas plus sombre, reflet en haut

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

### Lot 3 — Pictogrammes blancs (boutons)

#### 15. Planche « pictogrammes-1 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/pictogrammes-1.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/navigation/home` · 2 → `icons/navigation/back` · 3 → `icons/navigation/next` · 4 → `icons/navigation/play` · 5 → `icons/navigation/settings` · 6 → `icons/navigation/close` · 7 → `icons/navigation/check` · 8 → `icons/navigation/retry` · 9 → `icons/navigation/plus`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : pictogramme blanc plein à contour violet très foncé épais, centré, vu de face, sans fond ni tuile, marge de 15 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. maison
2. flèche épaisse vers la gauche
3. flèche épaisse vers la droite
4. triangle « lecture » arrondi
5. engrenage
6. croix épaisse
7. coche épaisse
8. flèche circulaire « recommencer »
9. signe plus épais

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 16. Planche « pictogrammes-2 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/pictogrammes-2.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/navigation/menu` · 2 → `icons/navigation/info` · 3 → `icons/navigation/fullscreen` · 4 → `icons/navigation/fullscreen-exit` · 5 → `icons/navigation/team` · 6 → `icons/navigation/target` · 7 → `icons/navigation/sound-on` · 8 → `icons/navigation/sound-off` · 9 → `icons/navigation/edit`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : pictogramme blanc plein à contour violet très foncé épais, centré, vu de face, sans fond ni tuile, marge de 15 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. liste : trois puces et trois barres
2. lettre i minuscule
3. quatre coins pointant vers l’extérieur (plein écran)
4. quatre coins pointant vers l’intérieur (quitter le plein écran)
5. trois silhouettes de joueurs (multijoueur)
6. viseur rond (défis)
7. haut-parleur avec ondes
8. haut-parleur barré
9. crayon (modifier)

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 17. Planche « pictogrammes-3 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/pictogrammes-3.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/navigation/swap` · 2 → `icons/navigation/hint` · 3 → `icons/navigation/lesson` · 4 → `icons/navigation/calendar` · 5 → `icons/navigation/history` · 6 → `icons/navigation/inventory` · 7 → `icons/navigation/collection` · 8 → `icons/navigation/mail` · 9 → `icons/navigation/ranking`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : pictogramme blanc plein à contour violet très foncé épais, centré, vu de face, sans fond ni tuile, marge de 15 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. deux flèches circulaires opposées (changer de joueur)
2. point d’interrogation (je n’ai pas compris)
3. livre ouvert (leçon)
4. calendrier (défi du jour)
5. horloge avec flèche circulaire (historique)
6. sac à dos (inventaire)
7. deux cartes superposées avec une silhouette (collection)
8. enveloppe (messages)
9. couronne (classement)

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

### Lot 4 — Icônes en couleur

#### 18. Planche « ressources » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/ressources.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/resources/coin` · 2 → `icons/resources/gem` · 3 → `icons/resources/energy` · 4 → `icons/resources/life` · 5 → `icons/resources/life-empty` · 6 → `icons/resources/xp` · 7 → `icons/resources/streak` · 8 → `icons/resources/level` · 9 → `icons/resources/progression`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. pièce d’or épaisse avec un petit livre ouvert gravé au centre
2. gemme violette hexagonale à facettes
3. éclair jaune et orange
4. cœur rose-rouge brillant
5. cœur gris éteint (même forme que le cœur rouge)
6. badge hexagonal cyan à contour violet portant les lettres « XP » blanches (seule exception à la règle sans texte)
7. flamme orange et jaune (série)
8. badge hexagonal doré vide (on y écrira le niveau)
9. histogramme de trois barres orange avec flèche montante dorée

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 19. Planche « statuts » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/statuts.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/status/correct` · 2 → `icons/status/wrong` · 3 → `icons/status/hint` · 4 → `icons/status/alert` · 5 → `icons/status/boost` · 6 → `icons/status/malus` · 7 → `icons/status/locked` · 8 → `icons/status/due` · 9 → `icons/status/new`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. pastille ronde verte avec coche blanche
2. pastille ronde rouge avec croix blanche
3. bulle de dialogue violette avec point d’interrogation blanc
4. bulle de dialogue orange avec point d’exclamation blanc
5. double chevron cyan vers le haut
6. double chevron rouge vers le bas
7. cadenas doré fermé
8. réveil orange (notion à réviser aujourd’hui)
9. pastille ronde rose avec un point d’exclamation blanc (nouveauté)

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 20. Planche « outils » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/outils.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/tools/pencil` · 2 → `icons/tools/calculator` · 3 → `icons/tools/conversion` · 4 → `icons/tools/eraser` · 5 → `icons/tools/undo` · 6 → `icons/tools/trash` · 7 → `icons/tools/dice` · 8 → `icons/tools/phone` · 9 → `icons/tools/qr`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. crayon orange à gomme rose
2. calculatrice bleue à écran cyan et touches blanches
3. petit tableau à 3 colonnes à en-tête cyan avec une virgule rouge
4. gomme rose et bleue
5. flèche courbe blanche vers la gauche (annuler)
6. poubelle grise (tout effacer)
7. dé blanc à cinq points
8. smartphone à écran cyan (télécommande)
9. carré stylisé évoquant un QR code, violet foncé sur fond blanc (pas un vrai code)

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 21. Planche « matieres » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/matieres.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/subjects/maths` · 2 → `icons/subjects/physique` · 3 → `icons/subjects/anglais` · 4 → `icons/subjects/espagnol` · 5 → `icons/subjects/histoire` · 6 → `icons/subjects/geographie`

```text
Image 1024×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. calculatrice blanche
2. fiole de laboratoire au liquide violet
3. drapeau britannique stylisé ondulant
4. drapeau espagnol stylisé ondulant
5. tour de château fort avec fanion (le Moyen Âge est au programme de 5e)
6. globe terrestre bleu et vert

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 22. Planche « reliques » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/reliques.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/subjects/boss-maths` · 2 → `icons/subjects/boss-anglais` · 3 → `icons/subjects/boss-espagnol` · 4 → `icons/subjects/boss-physique` · 5 → `icons/subjects/boss-histoire` · 6 → `icons/subjects/boss-geographie`

```text
Image 1024×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. cristal violet au π et aux signes + − × ÷ sur socle doré
2. livre violet et doré au drapeau britannique, marque-page rouge
3. éventail rouge et jaune aux armes de l’Espagne
4. fiole bleue à l’atome, bulles
5. casque de légionnaire à crête rouge et lauriers dorés
6. boussole dorée et carte au trésor

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 23. Planche « modes » (8 éléments)
Enregistrer sous `assets-src/originals/sheets/modes.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/modes/entrainement` · 2 → `icons/modes/boss` · 3 → `icons/modes/chrono` · 4 → `icons/modes/survie` · 5 → `icons/modes/arene` · 6 → `icons/modes/raid` · 7 → `icons/modes/quiz` · 8 → `icons/modes/course`

```text
Image 1024×1024 : planche de 8 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. haltère violet et orange
2. tête de mort cartoon blanche dans un hexagone rouge
3. chronomètre cyan
4. cœur rouge protégé par un bouclier
5. deux blasters jouets croisés
6. trois casques de héros côte à côte
7. buzzer rouge de jeu télévisé
8. drapeau à damier et éclair

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 24. Planche « medailles » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/medailles.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `rewards/medals/bronze` · 2 → `rewards/medals/argent` · 3 → `rewards/medals/or` · 4 → `rewards/medals/platine` · 5 → `rewards/medals/none` · 6 → `rewards/collectibles/trophy` · 7 → `rewards/collectibles/record` · 8 → `rewards/collectibles/crown` · 9 → `rewards/collectibles/key`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. médaille de bronze à ruban rouge, un galon gravé
2. médaille d’argent à ruban cyan, deux galons gravés
3. médaille d’or à ruban violet, trois galons gravés
4. médaille de platine bleu glacé à ruban rose, diamant au centre
5. emplacement de médaille vide : cercle gris en pointillés
6. trophée doré sur socle violet
7. badge rond doré à bordure crantée (record battu)
8. couronne dorée à gemmes violettes (champion)
9. clé dorée (déverrouillage)

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 25. Planche « coffres » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/coffres.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `rewards/chests/commun` · 2 → `rewards/chests/rare` · 3 → `rewards/chests/epique` · 4 → `rewards/chests/ouvert` · 5 → `rewards/chests/carte-mystere` · 6 → `rewards/chests/cadeau`

```text
Image 1024×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. coffre en métal gris à bandes orange
2. coffre violet à ferrures dorées, lueur violette dans la serrure
3. coffre tech cyan et violet aux lignes lumineuses
4. coffre violet ouvert débordant de pièces d’or
5. carte violette à cadre doré portant un grand point d’interrogation
6. paquet cadeau rouge à ruban doré

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 26. Planche « objets » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/objets.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/items/soin` · 2 → `icons/items/bouclier` · 3 → `icons/items/temps` · 4 → `icons/items/precision` · 5 → `icons/items/vitesse` · 6 → `icons/items/collecte` · 7 → `icons/items/boost-xp` · 8 → `icons/items/gel` · 9 → `icons/items/batterie`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. trousse de soin rouge à croix blanche
2. bouclier bleu à emblème cyan
3. sablier doré à sable cyan (temps en plus)
4. cible rouge et blanche avec viseur
5. basket violette ailée
6. aimant en U rouge à pointes argentées
7. canette violette et dorée marquée d’un éclair
8. flocon de neige cyan glacé
9. batterie cyan et orange avec éclair

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

### Lot 5 — Questy, la mascotte

> Commencer par la fiche de modèle, la valider, puis la joindre à chaque demande de ce lot.

#### 27. Questy — fiche de modèle
Enregistrer sous `assets-src/originals/characters/questy/model-sheet.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Fiche de modèle montrant Questy sous 5 angles alignés : face, trois quarts gauche, profil gauche, dos, trois quarts droite ; visage LED cyan souriant sur les vues de face.
Cadrage : fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol.
Style, fond et interdits : ceux du message de départ.
```

#### 28. Planche « questy-tetes-1 » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/questy-tetes-1.png` · 1536×1024, grille 3×2 → chaque case finale 384×384
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.
Cases : 1 → `characters/questy/head-happy` · 2 → `characters/questy/head-ok` · 3 → `characters/questy/head-laugh` · 4 → `characters/questy/head-love` · 5 → `characters/questy/head-wow` · 6 → `characters/questy/head-proud`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : tête seule de face (sans le corps), centrée, occupe 80 % de sa case, même angle et même taille d’une tête à l’autre.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED cyan, yeux en arcs souriants et grand sourire
2. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED vertes, yeux ronds et petit sourire tranquille
3. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED cyan, yeux en chevrons fermés > < et bouche grande ouverte
4. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED roses, yeux en cœurs et sourire
5. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED cyan, yeux ronds écarquillés et bouche en O
6. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED dorées, yeux plissés satisfaits et sourire en coin

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 29. Planche « questy-tetes-2 » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/questy-tetes-2.png` · 1536×1024, grille 3×2 → chaque case finale 384×384
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.
Cases : 1 → `characters/questy/head-cool` · 2 → `characters/questy/head-wink` · 3 → `characters/questy/head-angry` · 4 → `characters/questy/head-sad` · 5 → `characters/questy/head-dizzy` · 6 → `characters/questy/head-sleepy`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : tête seule de face (sans le corps), centrée, occupe 80 % de sa case, même angle et même taille d’une tête à l’autre.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED cyan, lunettes de soleil en pixels et sourire
2. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED cyan, un œil fermé en arc, un œil rond, sourire
3. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED rouges, sourcils en V très froncés et bouche en zigzag
4. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED bleu pâle, yeux tombants et larmes en pixels
5. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED violettes, yeux en croix et bouche ondulée
6. tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : LED bleu nuit, yeux fermés en traits et petite bulle de sommeil

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 30. Questy — pose idle
Enregistrer sous `assets-src/originals/characters/questy/pose-idle.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : debout, souriant, bras le long du corps.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 31. Questy — pose salut
Enregistrer sous `assets-src/originals/characters/questy/pose-salut.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : fait coucou de la main droite levée, clin d’œil.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 32. Questy — pose hero
Enregistrer sous `assets-src/originals/characters/questy/pose-hero.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : pose de héros : poing levé, petite cape orange qui flotte, regard déterminé.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 33. Questy — pose bravo
Enregistrer sous `assets-src/originals/characters/questy/pose-bravo.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : saute de joie, les deux bras levés.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 34. Questy — pose pouce
Enregistrer sous `assets-src/originals/characters/questy/pose-pouce.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : pouce levé, sourire.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 35. Questy — pose montre
Enregistrer sous `assets-src/originals/characters/questy/pose-montre.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : montre quelque chose du doigt vers la droite.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 36. Questy — pose reflexion
Enregistrer sous `assets-src/originals/characters/questy/pose-reflexion.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : main au menton, regard en coin, petit point d’interrogation en LED au-dessus.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 37. Questy — pose lecture
Enregistrer sous `assets-src/originals/characters/questy/pose-lecture.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : assis en tailleur, lit un livre violet ouvert.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 38. Questy — pose surprise
Enregistrer sous `assets-src/originals/characters/questy/pose-surprise.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : recule, mains levées, yeux ronds.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 39. Questy — pose triste
Enregistrer sous `assets-src/originals/characters/questy/pose-triste.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : assis, tête basse, larmes en LED.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 40. Questy — pose ko
Enregistrer sous `assets-src/originals/characters/questy/pose-ko.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : allongé sur le ventre, yeux en croix, petite spirale au-dessus de la tête.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 41. Questy — pose course
Enregistrer sous `assets-src/originals/characters/questy/pose-course.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : court vers la droite, une jambe en l’air, traînées de vitesse.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 42. Questy — pose jetpack
Enregistrer sous `assets-src/originals/characters/questy/pose-jetpack.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : vole avec un petit jetpack orange aux flammes cyan.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 43. Questy — pose tir
Enregistrer sous `assets-src/originals/characters/questy/pose-tir.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : tire vers la droite avec un blaster violet et orange, rayon cyan.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 44. Questy — pose bouclier
Enregistrer sous `assets-src/originals/characters/questy/pose-bouclier.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : se protège derrière un bouclier bleu.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 45. Questy — pose dort
Enregistrer sous `assets-src/originals/characters/questy/pose-dort.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : assis, endormi, bulle de sommeil.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 46. Planche « questy-accessoires » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/questy-accessoires.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `characters/questy/accessories/visiere` · 2 → `characters/questy/accessories/sac` · 3 → `characters/questy/accessories/bouclier` · 4 → `characters/questy/accessories/batterie` · 5 → `characters/questy/accessories/livre` · 6 → `characters/questy/accessories/blaster` · 7 → `characters/questy/accessories/hologramme` · 8 → `characters/questy/accessories/jetpack` · 9 → `characters/questy/accessories/tablette`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. visière-écran de rechange noire à reflet cyan
2. sac à dos violet à poches orange et écusson cyan
3. bouclier orange à cœur de cristal cyan
4. batterie cyan et orange avec éclair
5. livre violet épais à reliure dorée
6. blaster jouet violet et orange à canon cyan
7. socle de téléportation orange et violet avec anneau holographique cyan
8. jetpack orange à deux réacteurs aux flammes cyan
9. tablette holographique cyan avec un graphique

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

### Lot 6 — Kit combat

> Ce lot se génère avec le fichier autonome docs/chatgpt/kit-combat.md (prompt à copier en tête du fichier).

#### 47. Alex — animation sur place
Enregistrer sous `assets-src/originals/characters/alex/anim-idle.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange. Animation idle en 8 images.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 48. Alex — animation victoire
Enregistrer sous `assets-src/originals/characters/alex/anim-victory.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange. Animation victory en 8 images.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 49. Alex — pose course
Enregistrer sous `assets-src/originals/characters/alex/pose-run.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange. Pose course.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 50. Alex — pose tir
Enregistrer sous `assets-src/originals/characters/alex/pose-shoot.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange. Pose tir.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 51. Alex — pose bouclier
Enregistrer sous `assets-src/originals/characters/alex/pose-shield.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange. Pose bouclier.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 52. Alex — pose touché
Enregistrer sous `assets-src/originals/characters/alex/pose-hurt.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange. Pose touché.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 53. Alex — pose K.-O.
Enregistrer sous `assets-src/originals/characters/alex/pose-defeat.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange. Pose K.-O..
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 54. Alex — joie
Enregistrer sous `assets-src/originals/characters/alex/head-joie.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 55. Alex — rire
Enregistrer sous `assets-src/originals/characters/alex/head-rire.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression rire.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 56. Alex — enthousiaste
Enregistrer sous `assets-src/originals/characters/alex/head-enthousiaste.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression enthousiaste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 57. Alex — confiant
Enregistrer sous `assets-src/originals/characters/alex/head-confiant.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression confiant.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 58. Alex — determine
Enregistrer sous `assets-src/originals/characters/alex/head-determine.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression determine.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 59. Alex — clin-oeil
Enregistrer sous `assets-src/originals/characters/alex/head-clin-oeil.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression clin-oeil.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 60. Alex — surprise
Enregistrer sous `assets-src/originals/characters/alex/head-surprise.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression surprise.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 61. Alex — reflexion
Enregistrer sous `assets-src/originals/characters/alex/head-reflexion.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression reflexion.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 62. Alex — affection
Enregistrer sous `assets-src/originals/characters/alex/head-affection.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression affection.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 63. Alex — colere
Enregistrer sous `assets-src/originals/characters/alex/head-colere.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression colere.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 64. Alex — triste
Enregistrer sous `assets-src/originals/characters/alex/head-triste.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression triste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 65. Alex — etourdi
Enregistrer sous `assets-src/originals/characters/alex/head-etourdi.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Alex, tête seule, expression etourdi.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 66. Lina — animation sur place
Enregistrer sous `assets-src/originals/characters/lina/anim-idle.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile. Animation idle en 8 images.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 67. Lina — animation victoire
Enregistrer sous `assets-src/originals/characters/lina/anim-victory.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile. Animation victory en 8 images.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 68. Lina — pose course
Enregistrer sous `assets-src/originals/characters/lina/pose-run.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile. Pose course.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 69. Lina — pose tir
Enregistrer sous `assets-src/originals/characters/lina/pose-shoot.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile. Pose tir.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 70. Lina — pose bouclier
Enregistrer sous `assets-src/originals/characters/lina/pose-shield.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile. Pose bouclier.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 71. Lina — pose touché
Enregistrer sous `assets-src/originals/characters/lina/pose-hurt.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile. Pose touché.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 72. Lina — pose K.-O.
Enregistrer sous `assets-src/originals/characters/lina/pose-defeat.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile. Pose K.-O..
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 73. Lina — joie
Enregistrer sous `assets-src/originals/characters/lina/head-joie.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 74. Lina — rire
Enregistrer sous `assets-src/originals/characters/lina/head-rire.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression rire.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 75. Lina — enthousiaste
Enregistrer sous `assets-src/originals/characters/lina/head-enthousiaste.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression enthousiaste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 76. Lina — confiant
Enregistrer sous `assets-src/originals/characters/lina/head-confiant.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression confiant.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 77. Lina — determine
Enregistrer sous `assets-src/originals/characters/lina/head-determine.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression determine.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 78. Lina — clin-oeil
Enregistrer sous `assets-src/originals/characters/lina/head-clin-oeil.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression clin-oeil.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 79. Lina — surprise
Enregistrer sous `assets-src/originals/characters/lina/head-surprise.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression surprise.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 80. Lina — reflexion
Enregistrer sous `assets-src/originals/characters/lina/head-reflexion.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression reflexion.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 81. Lina — affection
Enregistrer sous `assets-src/originals/characters/lina/head-affection.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression affection.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 82. Lina — colere
Enregistrer sous `assets-src/originals/characters/lina/head-colere.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression colere.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 83. Lina — triste
Enregistrer sous `assets-src/originals/characters/lina/head-triste.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression triste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 84. Lina — etourdi
Enregistrer sous `assets-src/originals/characters/lina/head-etourdi.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Lina, tête seule, expression etourdi.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 85. Sorcier π — animation sur place
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/anim-idle.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, 8 images du calme à la rage.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 86. Sorcier π — pose idle
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-idle.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose idle.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 87. Sorcier π — pose attack
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-attack.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose attack.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 88. Sorcier π — pose shield
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-shield.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose shield.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 89. Sorcier π — pose hurt
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-hurt.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose hurt.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 90. Sorcier π — pose defeat
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-defeat.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose defeat.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 91. Sorcier π — pose cast
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-cast.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose cast.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 92. Sorcier π — pose charge
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-charge.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose charge.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 93. Sorcier π — pose victory
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/pose-victory.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, pose victory.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 94. Sorcier π — menace
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-menace.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux bleus plissés.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 95. Sorcier π — concentre
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-concentre.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux bleus grands ouverts.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 96. Sorcier π — surprise
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-surprise.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux bleus ronds.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 97. Sorcier π — moqueur
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-moqueur.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux bleus mi-clos.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 98. Sorcier π — perplexe
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-perplexe.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux bleus ronds, regard fixe.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 99. Sorcier π — colere
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-colere.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux bleus en colère.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 100. Sorcier π — inquiet
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-inquiet.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux rouges ronds.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 101. Sorcier π — rage-menace
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-rage-menace.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux rouges plissés.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 102. Sorcier π — rage-surprise
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-rage-surprise.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux rouges ronds, lueur.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 103. Sorcier π — furieux
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-furieux.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux rouges furieux.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 104. Sorcier π — rage-cri
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-rage-cri.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux rouges grands ouverts.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 105. Sorcier π — rage-plisse
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/head-rage-plisse.png` · 1024×1024 → final 384×384

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or, tête seule, yeux rouges mi-clos.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 106. Sorcier π — portrait
Enregistrer sous `assets-src/originals/bosses/sorcier-pi/portrait.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 107. L’Empereur du Savoir
Enregistrer sous `assets-src/originals/bosses/empereur/empereur.png` · 1024×1024 → final 1024×1024

```text
Image 1024×1024. Grand boss en armure violette et dorée, couronne à pointes, crinière blanche, cœur de galaxie, cape violette.
Cadrage : personnage en pied centré, de face, fond transparent, halo et effets autour de lui.
Style, fond et interdits : ceux du message de départ.
```

#### 108. L’Empereur du Savoir et les matières
Enregistrer sous `assets-src/originals/bosses/empereur/empereur-reliques.png` · 1024×1024 → final 1024×1024

```text
Image 1024×1024. Le même grand boss entouré des symboles des six matières dans un anneau violet.
Cadrage : personnage en pied centré, de face, fond transparent, halo et effets autour de lui.
Style, fond et interdits : ceux du message de départ.
```

#### 109. Bannière du Combat de boss
Enregistrer sous `assets-src/originals/bosses/empereur/banniere.png` · 1536×1024 → final 1536×512 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. L’Empereur du Savoir en buste, mains lumineuses, ciel violet étoilé et cristaux flottants.
Cadrage : bannière très large, sujet au centre, fond peint jusqu’aux bords, sans texte.
Style, fond et interdits : ceux du message de départ.
```

#### 110. Planche « mobs » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/mobs.png` · 1024×1024, grille 3×3 → chaque case finale 384×384
Cases : 1 → `bosses/minions/calculatrice` · 2 → `bosses/minions/cube-bot` · 3 → `bosses/minions/equerre` · 4 → `bosses/minions/compas` · 5 → `bosses/minions/de` · 6 → `bosses/minions/camembert` · 7 → `bosses/minions/courbe` · 8 → `bosses/minions/bug` · 9 → `bosses/minions/bloc-code`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : petit ennemi en pied, tourné vers la gauche, base à 90 % de sa case, occupe 70 % de la case.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. calculatrice grise vivante sur deux petites pattes, écran aux yeux bleus (sans chiffres), touches colorées. Mignon mais espiègle
2. petit robot cube blanc à écran-visage bleu, deux petits bras. Mignon mais espiègle
3. équerre jaune vivante, yeux rouges, petites jambes. Mignon mais espiègle
4. compas argenté vivant qui marche sur ses deux pointes, yeux violets. Mignon mais espiègle
5. petit dé blanc vivant aux points violets, yeux et sourire moqueur, petits bras. Mignon mais espiègle
6. diagramme circulaire vivant (disque coupé en parts rouge, jaune, bleu), yeux méchants. Mignon mais espiègle
7. petite courbe néon cyan vivante qui ondule comme un ver, yeux jaunes. Mignon mais espiègle
8. insecte en pixels verts (bug informatique), six pattes, antennes. Mignon mais espiègle
9. bloc de programmation orange arrondi et vivant (comme une brique de code), yeux blancs. Mignon mais espiègle

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 111. Mob π-bot — idle
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose idle.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 112. Mob π-bot — attack
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-attack.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose attack.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 113. Mob π-bot — shield
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-shield.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose shield.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 114. Mob π-bot — run
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-run.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose run.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 115. Mob π-bot — jump
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-jump.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose jump.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 116. Mob π-bot — victory
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-victory.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose victory.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 117. Mob π-bot — tête menace
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-menace.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, menace.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 118. Mob π-bot — tête moqueur
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-moqueur.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, moqueur.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 119. Mob π-bot — tête joie
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-joie.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, joie.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 120. Mob π-bot — tête rire
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-rire.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, rire.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 121. Mob π-bot — tête surprise
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-surprise.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, surprise.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 122. Mob π-bot — tête triste
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-triste.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, triste.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 123. Mob π-bot — tête etourdi
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-etourdi.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, etourdi.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 124. Mob π-bot — tête colere
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-colere.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, colere.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 125. Mob π-bot — tête reflexion
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-reflexion.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, reflexion.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 126. Mob π-bot — tête idee
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-idee.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, idee.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 127. Mob π-bot — tête amour
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-amour.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, amour.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 128. Mob π-bot — tête dort
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-dort.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, dort.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 129. Planche « effets-1 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/effets-1.png` · 1024×1024, grille 3×3 → chaque case finale 512×512
Cases : 1 → `effects/impacts/hit-burst` · 2 → `effects/impacts/anneau` · 3 → `effects/impacts/etincelles` · 4 → `effects/impacts/flash` · 5 → `effects/impacts/explosion` · 6 → `effects/particles/puff` · 7 → `effects/particles/bouclier` · 8 → `effects/particles/soin` · 9 → `effects/particles/etourdi`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : effet centré, bords nets (pas de grand halo flou).
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. éclat d’impact étoilé BLANC pur (sera recoloré par l’application)
2. anneau d’onde de choc BLANC pur vu de trois quarts (sera recoloré)
3. gerbe d’étincelles BLANCHES en étoile (sera recolorée)
4. flash de bouche de canon BLANC et jaune pâle, en étoile, vu de profil vers la droite
5. petite explosion cartoon orange et jaune avec fumée
6. nuage de fumée violette cartoon (disparition d’un mob)
7. bulle de bouclier hexagonale cyan translucide (vue de face, vide au centre)
8. croix verte lumineuse entourée de petits cœurs et d’étincelles vertes
9. trois petites spirales dorées en orbite (étourdi)

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 130. Planche « effets-2 » (3 éléments)
Enregistrer sous `assets-src/originals/sheets/effets-2.png` · 1024×1024, grille 3×3 → chaque case finale 512×512
Cases : 1 → `effects/impacts/onde-boss` · 2 → `effects/particles/confettis` · 3 → `effects/transitions/portail`

```text
Image 1024×1024 : planche de 3 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : effet centré, bords nets (pas de grand halo flou).
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. onde d’attaque rouge et orange en forme de croissant, se déplaçant vers la gauche
2. gerbe de confettis violets, orange, cyan et jaunes
3. tourbillon de portail violet vu de face

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 131. Arène de la station spatiale
Enregistrer sous `assets-src/originals/environments/arenas/espace.png` · 1536×1024 → final 1536×864 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : décor de combat plein cadre vu de face, à hauteur de personnage, sol plat et dégagé sur le quart inférieur (les combattants seront posés à gauche et à droite), centre calme et lisible, aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 132. Arène de la station spatiale (portrait)
Enregistrer sous `assets-src/originals/environments/arenas/espace-portrait.png` · 1024×1536 → final 960×1280 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/espace.png`.

```text
Image 1024×1536. Plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 133. Arène de la station spatiale (panorama)
Enregistrer sous `assets-src/originals/environments/arenas/espace-large.png` · 1536×1024 → final 1536×640 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/espace.png`.

```text
Image 1536×1024. Plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 134. Arène de l’académie
Enregistrer sous `assets-src/originals/environments/arenas/academie.png` · 1536×1024 → final 1536×864 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : décor de combat plein cadre vu de face, à hauteur de personnage, sol plat et dégagé sur le quart inférieur (les combattants seront posés à gauche et à droite), centre calme et lisible, aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 135. Arène de l’académie (portrait)
Enregistrer sous `assets-src/originals/environments/arenas/academie-portrait.png` · 1024×1536 → final 960×1280 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/academie.png`.

```text
Image 1024×1536. Terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 136. Arène de l’académie (panorama)
Enregistrer sous `assets-src/originals/environments/arenas/academie-large.png` · 1536×1024 → final 1536×640 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/academie.png`.

```text
Image 1536×1024. Terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 137. Arène du volcan
Enregistrer sous `assets-src/originals/environments/arenas/volcan.png` · 1536×1024 → final 1536×864 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : décor de combat plein cadre vu de face, à hauteur de personnage, sol plat et dégagé sur le quart inférieur (les combattants seront posés à gauche et à droite), centre calme et lisible, aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 138. Arène du volcan (portrait)
Enregistrer sous `assets-src/originals/environments/arenas/volcan-portrait.png` · 1024×1536 → final 960×1280 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/volcan.png`.

```text
Image 1024×1536. Plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 139. Arène du volcan (panorama)
Enregistrer sous `assets-src/originals/environments/arenas/volcan-large.png` · 1536×1024 → final 1536×640 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/volcan.png`.

```text
Image 1536×1024. Plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 140. Illustration principale
Enregistrer sous `assets-src/originals/branding/key-art.png` · 1536×1024 → final 1536×1024 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1536×1024. Scène de combat épique et joyeuse : les cinq héros alignés de gauche à droite (Alex avec son canon à plasma, Lina avec son lance-ballons, Pixel le chat avec son canon-poisson au premier plan, Ayla avec sa bombe-blaster, Tao avec son arbalète) et Questy qui lève le poing au milieu, tous face au Golem des Équations tout à droite ; en arrière-plan un château-académie violet flottant aux bannières à livre, ciel lavande, îles flottantes.
Cadrage : illustration plein cadre, composition lisible en petit, sans aucun texte ni interface.
Style, fond et interdits : ceux du message de départ.
```
