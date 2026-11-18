<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Academy Fighters — génération des images avec ChatGPT

340 images finales, produites en 166 demandes.

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
| 4 | Icônes en couleur | 65 | 18–25 | `docs/chatgpt/lot-04-icones-en-couleur.md` |
| 5 | Questy, la mascotte | 38 | 26–45 | `docs/chatgpt/lot-05-questy-la-mascotte.md` |
| 6 | Kit combat | 183 | 46–166 | `docs/chatgpt/lot-06-kit-combat.md` |

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

#### 22. Planche « modes » (8 éléments)
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

#### 23. Planche « medailles » (9 éléments)
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

#### 24. Planche « coffres » (6 éléments)
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

#### 25. Planche « objets » (9 éléments)
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

#### 26. Questy — fiche de modèle
Enregistrer sous `assets-src/originals/characters/questy/model-sheet.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Fiche de modèle montrant Questy sous 5 angles alignés : face, trois quarts gauche, profil gauche, dos, trois quarts droite ; visage LED cyan souriant sur les vues de face.
Cadrage : fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol.
Style, fond et interdits : ceux du message de départ.
```

#### 27. Planche « questy-tetes-1 » (6 éléments)
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

#### 28. Planche « questy-tetes-2 » (6 éléments)
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

#### 29. Questy — pose idle
Enregistrer sous `assets-src/originals/characters/questy/pose-idle.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : debout, souriant, bras le long du corps.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 30. Questy — pose salut
Enregistrer sous `assets-src/originals/characters/questy/pose-salut.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : fait coucou de la main droite levée, clin d’œil.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 31. Questy — pose hero
Enregistrer sous `assets-src/originals/characters/questy/pose-hero.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : pose de héros : poing levé, petite cape orange qui flotte, regard déterminé.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 32. Questy — pose bravo
Enregistrer sous `assets-src/originals/characters/questy/pose-bravo.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : saute de joie, les deux bras levés.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 33. Questy — pose pouce
Enregistrer sous `assets-src/originals/characters/questy/pose-pouce.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : pouce levé, sourire.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 34. Questy — pose montre
Enregistrer sous `assets-src/originals/characters/questy/pose-montre.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : montre quelque chose du doigt vers la droite.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 35. Questy — pose reflexion
Enregistrer sous `assets-src/originals/characters/questy/pose-reflexion.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : main au menton, regard en coin, petit point d’interrogation en LED au-dessus.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 36. Questy — pose lecture
Enregistrer sous `assets-src/originals/characters/questy/pose-lecture.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : assis en tailleur, lit un livre violet ouvert.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 37. Questy — pose surprise
Enregistrer sous `assets-src/originals/characters/questy/pose-surprise.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : recule, mains levées, yeux ronds.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 38. Questy — pose triste
Enregistrer sous `assets-src/originals/characters/questy/pose-triste.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : assis, tête basse, larmes en LED.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 39. Questy — pose ko
Enregistrer sous `assets-src/originals/characters/questy/pose-ko.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : allongé sur le ventre, yeux en croix, petite spirale au-dessus de la tête.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 40. Questy — pose course
Enregistrer sous `assets-src/originals/characters/questy/pose-course.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : court vers la droite, une jambe en l’air, traînées de vitesse.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 41. Questy — pose jetpack
Enregistrer sous `assets-src/originals/characters/questy/pose-jetpack.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : vole avec un petit jetpack orange aux flammes cyan.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 42. Questy — pose tir
Enregistrer sous `assets-src/originals/characters/questy/pose-tir.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : tire vers la droite avec un blaster violet et orange, rayon cyan.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 43. Questy — pose bouclier
Enregistrer sous `assets-src/originals/characters/questy/pose-bouclier.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : se protège derrière un bouclier bleu.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 44. Questy — pose dort
Enregistrer sous `assets-src/originals/characters/questy/pose-dort.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1024×1024. Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais. Pose : assis, endormi, bulle de sommeil.
Cadrage : Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur.
Style, fond et interdits : ceux du message de départ.
```

#### 45. Planche « questy-accessoires » (9 éléments)
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

#### 46. Alex — fiche de modèle
Enregistrer sous `assets-src/originals/characters/alex/model-sheet.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Alex, garçon de 12 ans, cheveux roux en pics avec des mèches rasées sur le côté, yeux bleus, pansement sur la joue, foulard jaune, veste blanche et dorée, pantalon violet, gants noirs sans doigts, grosses baskets blanches et dorées, sac à dos à deux batteries de plasma lumineuses. Arme : canon à plasma blanc et doré tenu à deux mains, bouche ronde où tourbillonne une énergie violette. Fiche de modèle : 4 vues alignées (face, trois quarts gauche, profil, dos), plus l’arme seule en grand à droite.
Cadrage : fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol.
Style, fond et interdits : ceux du message de départ.
```

#### 47. Alex — portrait
Enregistrer sous `assets-src/originals/characters/alex/portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux roux en pics avec des mèches rasées sur le côté, yeux bleus, pansement sur la joue, foulard jaune, veste blanche et dorée, pantalon violet, gants noirs sans doigts, grosses baskets blanches et dorées, sac à dos à deux batteries de plasma lumineuses. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 48. Planche « alex-poses » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/alex-poses.png` · 1536×1024, grille 3×2 → chaque case finale 512×512
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.
Cases : 1 → `characters/alex/pose-idle` · 2 → `characters/alex/pose-run` · 3 → `characters/alex/pose-shoot` · 4 → `characters/alex/pose-hurt` · 5 → `characters/alex/pose-victory` · 6 → `characters/alex/pose-defeat`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Alex (exactement comme sur sa fiche de modèle), avec son arme. Pose attente : debout, détendu, arme prête
2. Alex (exactement comme sur sa fiche de modèle), avec son arme. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant
3. Alex (exactement comme sur sa fiche de modèle), avec son arme. Pose tir : arme pointée vers la droite, petit éclair à la bouche du canon
4. Alex (exactement comme sur sa fiche de modèle), avec son arme. Pose touché : recule d’un pas, grimace comique (dessin animé, aucune blessure)
5. Alex (exactement comme sur sa fiche de modèle), avec son arme. Pose victoire : saute de joie, poing ou patte levé
6. Alex (exactement comme sur sa fiche de modèle), avec son arme. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 49. Alex — pose jump
Enregistrer sous `assets-src/originals/characters/alex/pose-jump.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1536×1024. Alex, pose jump.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 50. Alex — pose shield
Enregistrer sous `assets-src/originals/characters/alex/pose-shield.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1536×1024. Alex, pose shield.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 51. Alex — joie
Enregistrer sous `assets-src/originals/characters/alex/head-joie.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 52. Alex — rire
Enregistrer sous `assets-src/originals/characters/alex/head-rire.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression rire.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 53. Alex — enthousiaste
Enregistrer sous `assets-src/originals/characters/alex/head-enthousiaste.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression enthousiaste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 54. Alex — confiant
Enregistrer sous `assets-src/originals/characters/alex/head-confiant.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression confiant.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 55. Alex — determine
Enregistrer sous `assets-src/originals/characters/alex/head-determine.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression determine.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 56. Alex — clin-oeil
Enregistrer sous `assets-src/originals/characters/alex/head-clin-oeil.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression clin-oeil.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 57. Alex — surprise
Enregistrer sous `assets-src/originals/characters/alex/head-surprise.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression surprise.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 58. Alex — reflexion
Enregistrer sous `assets-src/originals/characters/alex/head-reflexion.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression reflexion.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 59. Alex — affection
Enregistrer sous `assets-src/originals/characters/alex/head-affection.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression affection.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 60. Alex — colere
Enregistrer sous `assets-src/originals/characters/alex/head-colere.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression colere.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 61. Alex — triste
Enregistrer sous `assets-src/originals/characters/alex/head-triste.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression triste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 62. Alex — etourdi
Enregistrer sous `assets-src/originals/characters/alex/head-etourdi.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/model-sheet.png`.

```text
Image 1024×1024. Alex, tête seule, expression etourdi.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 63. Tao — fiche de modèle
Enregistrer sous `assets-src/originals/characters/tao/model-sheet.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Tao, garçon de 12 ans, mince et agile, cheveux noirs raides en épis, bandana vert noué sur le front aux pans qui volent, yeux en amande pétillants, grand sourire, gilet sans manches beige sable à poches multiples sur t-shirt vert forêt, short cargo marron, grosses chaussures de randonnée orange, boussole dorée autour du cou, petit sac à dos avec une corde enroulée. Arme : arbalète-tech compacte vert et or tenue à deux mains, avec une lunette de visée ronde et des branches recourbées lumineuses. Fiche de modèle : 4 vues alignées (face, trois quarts gauche, profil, dos), plus l’arme seule en grand à droite.
Cadrage : fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol.
Style, fond et interdits : ceux du message de départ.
```

#### 64. Tao — portrait
Enregistrer sous `assets-src/originals/characters/tao/portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/tao/model-sheet.png`.

```text
Image 1024×1024. Tao, garçon de 12 ans, mince et agile, cheveux noirs raides en épis, bandana vert noué sur le front aux pans qui volent, yeux en amande pétillants, grand sourire, gilet sans manches beige sable à poches multiples sur t-shirt vert forêt, short cargo marron, grosses chaussures de randonnée orange, boussole dorée autour du cou, petit sac à dos avec une corde enroulée. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 65. Planche « tao-poses » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/tao-poses.png` · 1536×1024, grille 3×2 → chaque case finale 512×512
> 📎 Joindre l'image validée `characters/tao/model-sheet.png`.
Cases : 1 → `characters/tao/pose-idle` · 2 → `characters/tao/pose-run` · 3 → `characters/tao/pose-shoot` · 4 → `characters/tao/pose-hurt` · 5 → `characters/tao/pose-victory` · 6 → `characters/tao/pose-defeat`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Tao (exactement comme sur sa fiche de modèle), avec son arme. Pose attente : debout, détendu, arme prête
2. Tao (exactement comme sur sa fiche de modèle), avec son arme. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant
3. Tao (exactement comme sur sa fiche de modèle), avec son arme. Pose tir : arme pointée vers la droite, petit éclair à la bouche du canon
4. Tao (exactement comme sur sa fiche de modèle), avec son arme. Pose touché : recule d’un pas, grimace comique (dessin animé, aucune blessure)
5. Tao (exactement comme sur sa fiche de modèle), avec son arme. Pose victoire : saute de joie, poing ou patte levé
6. Tao (exactement comme sur sa fiche de modèle), avec son arme. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 66. Lina — fiche de modèle
Enregistrer sous `assets-src/originals/characters/lina/model-sheet.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Lina, fille de 12 ans, longs cheveux violets en queue de cheval haute, barrette étoile dorée, boucles d’oreilles étoiles, yeux violets, veste courte blanche et violette à liserés dorés, jupe plissée violette, chaussettes rayées violettes, baskets blanches à étoile, gants violets chargés d’éclairs. Arme : éclairs violets qu’elle lance de ses poings (boule d’énergie). Fiche de modèle : 4 vues alignées (face, trois quarts gauche, profil, dos), plus l’arme seule en grand à droite.
Cadrage : fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol.
Style, fond et interdits : ceux du message de départ.
```

#### 67. Lina — portrait
Enregistrer sous `assets-src/originals/characters/lina/portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, fille de 12 ans, longs cheveux violets en queue de cheval haute, barrette étoile dorée, boucles d’oreilles étoiles, yeux violets, veste courte blanche et violette à liserés dorés, jupe plissée violette, chaussettes rayées violettes, baskets blanches à étoile, gants violets chargés d’éclairs. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 68. Planche « lina-poses » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/lina-poses.png` · 1536×1024, grille 3×2 → chaque case finale 512×512
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.
Cases : 1 → `characters/lina/pose-idle` · 2 → `characters/lina/pose-run` · 3 → `characters/lina/pose-shoot` · 4 → `characters/lina/pose-hurt` · 5 → `characters/lina/pose-victory` · 6 → `characters/lina/pose-defeat`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Lina (exactement comme sur sa fiche de modèle), avec son arme. Pose attente : debout, détendu, arme prête
2. Lina (exactement comme sur sa fiche de modèle), avec son arme. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant
3. Lina (exactement comme sur sa fiche de modèle), avec son arme. Pose tir : arme pointée vers la droite, petit éclair à la bouche du canon
4. Lina (exactement comme sur sa fiche de modèle), avec son arme. Pose touché : recule d’un pas, grimace comique (dessin animé, aucune blessure)
5. Lina (exactement comme sur sa fiche de modèle), avec son arme. Pose victoire : saute de joie, poing ou patte levé
6. Lina (exactement comme sur sa fiche de modèle), avec son arme. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 69. Lina — pose jump
Enregistrer sous `assets-src/originals/characters/lina/pose-jump.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1536×1024. Lina, pose jump.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 70. Lina — pose shield
Enregistrer sous `assets-src/originals/characters/lina/pose-shield.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1536×1024. Lina, pose shield.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 71. Lina — joie
Enregistrer sous `assets-src/originals/characters/lina/head-joie.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 72. Lina — rire
Enregistrer sous `assets-src/originals/characters/lina/head-rire.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression rire.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 73. Lina — enthousiaste
Enregistrer sous `assets-src/originals/characters/lina/head-enthousiaste.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression enthousiaste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 74. Lina — confiant
Enregistrer sous `assets-src/originals/characters/lina/head-confiant.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression confiant.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 75. Lina — determine
Enregistrer sous `assets-src/originals/characters/lina/head-determine.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression determine.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 76. Lina — clin-oeil
Enregistrer sous `assets-src/originals/characters/lina/head-clin-oeil.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression clin-oeil.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 77. Lina — surprise
Enregistrer sous `assets-src/originals/characters/lina/head-surprise.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression surprise.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 78. Lina — reflexion
Enregistrer sous `assets-src/originals/characters/lina/head-reflexion.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression reflexion.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 79. Lina — affection
Enregistrer sous `assets-src/originals/characters/lina/head-affection.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression affection.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 80. Lina — colere
Enregistrer sous `assets-src/originals/characters/lina/head-colere.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression colere.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 81. Lina — triste
Enregistrer sous `assets-src/originals/characters/lina/head-triste.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression triste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 82. Lina — etourdi
Enregistrer sous `assets-src/originals/characters/lina/head-etourdi.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/lina/model-sheet.png`.

```text
Image 1024×1024. Lina, tête seule, expression etourdi.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 83. Ayla — fiche de modèle
Enregistrer sous `assets-src/originals/characters/ayla/model-sheet.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Ayla, fille de 12 ans, petite et vive, peau claire avec des taches de rousseur, cheveux violets courts en coupe asymétrique avec une longue mèche turquoise, casque audio jaune fluo autour du cou, sourire espiègle, veste bomber noire couverte de patchs colorés (formes, étoiles, éclairs), t-shirt jaune, pantalon baggy gris, rangers noires lacées de turquoise, éclaboussures de peinture turquoise et jaune sur les vêtements. Arme : bombe-blaster : pistolet de peinture turquoise et jaune monté sur une bombe aérosol géante, buse ronde à l’avant. Fiche de modèle : 4 vues alignées (face, trois quarts gauche, profil, dos), plus l’arme seule en grand à droite.
Cadrage : fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol.
Style, fond et interdits : ceux du message de départ.
```

#### 84. Ayla — portrait
Enregistrer sous `assets-src/originals/characters/ayla/portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/ayla/model-sheet.png`.

```text
Image 1024×1024. Ayla, fille de 12 ans, petite et vive, peau claire avec des taches de rousseur, cheveux violets courts en coupe asymétrique avec une longue mèche turquoise, casque audio jaune fluo autour du cou, sourire espiègle, veste bomber noire couverte de patchs colorés (formes, étoiles, éclairs), t-shirt jaune, pantalon baggy gris, rangers noires lacées de turquoise, éclaboussures de peinture turquoise et jaune sur les vêtements. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 85. Planche « ayla-poses » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/ayla-poses.png` · 1536×1024, grille 3×2 → chaque case finale 512×512
> 📎 Joindre l'image validée `characters/ayla/model-sheet.png`.
Cases : 1 → `characters/ayla/pose-idle` · 2 → `characters/ayla/pose-run` · 3 → `characters/ayla/pose-shoot` · 4 → `characters/ayla/pose-hurt` · 5 → `characters/ayla/pose-victory` · 6 → `characters/ayla/pose-defeat`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Ayla (exactement comme sur sa fiche de modèle), avec son arme. Pose attente : debout, détendu, arme prête
2. Ayla (exactement comme sur sa fiche de modèle), avec son arme. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant
3. Ayla (exactement comme sur sa fiche de modèle), avec son arme. Pose tir : arme pointée vers la droite, petit éclair à la bouche du canon
4. Ayla (exactement comme sur sa fiche de modèle), avec son arme. Pose touché : recule d’un pas, grimace comique (dessin animé, aucune blessure)
5. Ayla (exactement comme sur sa fiche de modèle), avec son arme. Pose victoire : saute de joie, poing ou patte levé
6. Ayla (exactement comme sur sa fiche de modèle), avec son arme. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 86. Pixel — fiche de modèle
Enregistrer sous `assets-src/originals/characters/pixel/model-sheet.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Pixel, chat gris tigré debout sur deux pattes, capuche et longue écharpe violettes, yeux jaunes, tenue de ninja noire à liserés dorés, sacoche violette à patte de chat, queue grise touffue. Arme : boule d’énergie violette lancée d’une patte, bouclier violet à empreinte de patte. Fiche de modèle : 4 vues alignées (face, trois quarts gauche, profil, dos), plus l’arme seule en grand à droite.
Cadrage : fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol.
Style, fond et interdits : ceux du message de départ.
```

#### 87. Pixel — portrait
Enregistrer sous `assets-src/originals/characters/pixel/portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, chat gris tigré debout sur deux pattes, capuche et longue écharpe violettes, yeux jaunes, tenue de ninja noire à liserés dorés, sacoche violette à patte de chat, queue grise touffue. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 88. Planche « pixel-poses » (6 éléments)
Enregistrer sous `assets-src/originals/sheets/pixel-poses.png` · 1536×1024, grille 3×2 → chaque case finale 512×512
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.
Cases : 1 → `characters/pixel/pose-idle` · 2 → `characters/pixel/pose-run` · 3 → `characters/pixel/pose-shoot` · 4 → `characters/pixel/pose-hurt` · 5 → `characters/pixel/pose-victory` · 6 → `characters/pixel/pose-defeat`

```text
Image 1536×1024 : planche de 6 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Pixel (exactement comme sur sa fiche de modèle), avec son arme. Pose attente : debout, détendu, arme prête
2. Pixel (exactement comme sur sa fiche de modèle), avec son arme. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant
3. Pixel (exactement comme sur sa fiche de modèle), avec son arme. Pose tir : arme pointée vers la droite, petit éclair à la bouche du canon
4. Pixel (exactement comme sur sa fiche de modèle), avec son arme. Pose touché : recule d’un pas, grimace comique (dessin animé, aucune blessure)
5. Pixel (exactement comme sur sa fiche de modèle), avec son arme. Pose victoire : saute de joie, poing ou patte levé
6. Pixel (exactement comme sur sa fiche de modèle), avec son arme. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 89. Pixel — pose jump
Enregistrer sous `assets-src/originals/characters/pixel/pose-jump.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1536×1024. Pixel, pose jump.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 90. Pixel — pose shield
Enregistrer sous `assets-src/originals/characters/pixel/pose-shield.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1536×1024. Pixel, pose shield.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 91. Pixel — joie
Enregistrer sous `assets-src/originals/characters/pixel/head-joie.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 92. Pixel — rire
Enregistrer sous `assets-src/originals/characters/pixel/head-rire.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression rire.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 93. Pixel — enthousiaste
Enregistrer sous `assets-src/originals/characters/pixel/head-enthousiaste.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression enthousiaste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 94. Pixel — confiant
Enregistrer sous `assets-src/originals/characters/pixel/head-confiant.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression confiant.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 95. Pixel — determine
Enregistrer sous `assets-src/originals/characters/pixel/head-determine.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression determine.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 96. Pixel — clin-oeil
Enregistrer sous `assets-src/originals/characters/pixel/head-clin-oeil.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression clin-oeil.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 97. Pixel — surprise
Enregistrer sous `assets-src/originals/characters/pixel/head-surprise.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression surprise.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 98. Pixel — reflexion
Enregistrer sous `assets-src/originals/characters/pixel/head-reflexion.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression reflexion.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 99. Pixel — affection
Enregistrer sous `assets-src/originals/characters/pixel/head-affection.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression affection.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 100. Pixel — colere
Enregistrer sous `assets-src/originals/characters/pixel/head-colere.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression colere.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 101. Pixel — triste
Enregistrer sous `assets-src/originals/characters/pixel/head-triste.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression triste.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 102. Pixel — etourdi
Enregistrer sous `assets-src/originals/characters/pixel/head-etourdi.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/pixel/model-sheet.png`.

```text
Image 1024×1024. Pixel, tête seule, expression etourdi.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 103. Planche « armes » (5 éléments)
Enregistrer sous `assets-src/originals/sheets/armes.png` · 1536×1024, grille 3×2 → chaque case finale 384×256
Cases : 1 → `weapons/alex` · 2 → `weapons/tao` · 3 → `weapons/lina` · 4 → `weapons/ayla` · 5 → `weapons/pixel`

```text
Image 1536×1024 : planche de 5 éléments de jeu disposés sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : arme seule vue de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur de sa case.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. arme d’Alex : canon à plasma blanc et doré tenu à deux mains, bouche ronde où tourbillonne une énergie violette
2. arme de Tao : arbalète-tech compacte vert et or tenue à deux mains, avec une lunette de visée ronde et des branches recourbées lumineuses
3. arme de Lina : éclairs violets qu’elle lance de ses poings (boule d’énergie)
4. arme d’Ayla : bombe-blaster : pistolet de peinture turquoise et jaune monté sur une bombe aérosol géante, buse ronde à l’avant
5. arme de Pixel : boule d’énergie violette lancée d’une patte, bouclier violet à empreinte de patte

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 104. Planche « golem-des-equations-etats » (4 éléments)
Enregistrer sous `assets-src/originals/sheets/golem-des-equations-etats.png` · 1536×1024, grille 2×2 → chaque case finale 512×512
Cases : 1 → `bosses/maths/golem-des-equations` · 2 → `bosses/maths/golem-des-equations-attack` · 3 → `bosses/maths/golem-des-equations-hurt` · 4 → `bosses/maths/golem-des-equations-ko`

```text
Image 1536×1024 : planche de 4 éléments de jeu disposés sur une grille invisible de 2 colonnes × 2 lignes (cases de 768×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Golem des Équations, boss du domaine « nombres et calculs » : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine. Pose de combat menaçante mais comique
2. Golem des Équations, boss du domaine « nombres et calculs » : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine. Attaque : se penche vers la gauche et lance une grosse onde d’énergie rouge
3. Golem des Équations, boss du domaine « nombres et calculs » : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine. Touché : recule, grimace comique, petites étincelles
4. Golem des Équations, boss du domaine « nombres et calculs » : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine. Vaincu : affalé, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 105. Golem des Équations — portrait
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Golem des Équations (exactement comme sur sa planche d’états) : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine. Tête seule, de face, l’air menaçant mais drôle.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 106. Planche « geomatrix-etats » (4 éléments)
Enregistrer sous `assets-src/originals/sheets/geomatrix-etats.png` · 1536×1024, grille 2×2 → chaque case finale 512×512
Cases : 1 → `bosses/maths/geomatrix` · 2 → `bosses/maths/geomatrix-attack` · 3 → `bosses/maths/geomatrix-hurt` · 4 → `bosses/maths/geomatrix-ko`

```text
Image 1536×1024 : planche de 4 éléments de jeu disposés sur une grille invisible de 2 colonnes × 2 lignes (cases de 768×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Géomatrix, boss du domaine « géométrie » : golem fait de cubes et de pyramides de cristal bleu et violet, arêtes cyan lumineuses, petits cubes flottant autour de lui, yeux orange. Pose de combat menaçante mais comique
2. Géomatrix, boss du domaine « géométrie » : golem fait de cubes et de pyramides de cristal bleu et violet, arêtes cyan lumineuses, petits cubes flottant autour de lui, yeux orange. Attaque : se penche vers la gauche et lance une grosse onde d’énergie rouge
3. Géomatrix, boss du domaine « géométrie » : golem fait de cubes et de pyramides de cristal bleu et violet, arêtes cyan lumineuses, petits cubes flottant autour de lui, yeux orange. Touché : recule, grimace comique, petites étincelles
4. Géomatrix, boss du domaine « géométrie » : golem fait de cubes et de pyramides de cristal bleu et violet, arêtes cyan lumineuses, petits cubes flottant autour de lui, yeux orange. Vaincu : affalé, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 107. Géomatrix — portrait
Enregistrer sous `assets-src/originals/bosses/maths/geomatrix-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/geomatrix.png`.

```text
Image 1024×1024. Géomatrix (exactement comme sur sa planche d’états) : golem fait de cubes et de pyramides de cristal bleu et violet, arêtes cyan lumineuses, petits cubes flottant autour de lui, yeux orange. Tête seule, de face, l’air menaçant mais drôle.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 108. Planche « probabot-etats » (4 éléments)
Enregistrer sous `assets-src/originals/sheets/probabot-etats.png` · 1536×1024, grille 2×2 → chaque case finale 512×512
Cases : 1 → `bosses/maths/probabot` · 2 → `bosses/maths/probabot-attack` · 3 → `bosses/maths/probabot-hurt` · 4 → `bosses/maths/probabot-ko`

```text
Image 1536×1024 : planche de 4 éléments de jeu disposés sur une grille invisible de 2 colonnes × 2 lignes (cases de 768×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Probabot, boss du domaine « données et probabilités » : robot trapu dont le corps est un énorme dé blanc aux points violets, une face-écran avec des yeux rouges en colère, bras mécaniques dorés qui jonglent avec deux petits dés, roues chenilles. Pose de combat menaçante mais comique
2. Probabot, boss du domaine « données et probabilités » : robot trapu dont le corps est un énorme dé blanc aux points violets, une face-écran avec des yeux rouges en colère, bras mécaniques dorés qui jonglent avec deux petits dés, roues chenilles. Attaque : se penche vers la gauche et lance une grosse onde d’énergie rouge
3. Probabot, boss du domaine « données et probabilités » : robot trapu dont le corps est un énorme dé blanc aux points violets, une face-écran avec des yeux rouges en colère, bras mécaniques dorés qui jonglent avec deux petits dés, roues chenilles. Touché : recule, grimace comique, petites étincelles
4. Probabot, boss du domaine « données et probabilités » : robot trapu dont le corps est un énorme dé blanc aux points violets, une face-écran avec des yeux rouges en colère, bras mécaniques dorés qui jonglent avec deux petits dés, roues chenilles. Vaincu : affalé, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 109. Probabot — portrait
Enregistrer sous `assets-src/originals/bosses/maths/probabot-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/probabot.png`.

```text
Image 1024×1024. Probabot (exactement comme sur sa planche d’états) : robot trapu dont le corps est un énorme dé blanc aux points violets, une face-écran avec des yeux rouges en colère, bras mécaniques dorés qui jonglent avec deux petits dés, roues chenilles. Tête seule, de face, l’air menaçant mais drôle.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 110. Planche « courbix-etats » (4 éléments)
Enregistrer sous `assets-src/originals/sheets/courbix-etats.png` · 1536×1024, grille 2×2 → chaque case finale 512×512
Cases : 1 → `bosses/maths/courbix` · 2 → `bosses/maths/courbix-attack` · 3 → `bosses/maths/courbix-hurt` · 4 → `bosses/maths/courbix-ko`

```text
Image 1536×1024 : planche de 4 éléments de jeu disposés sur une grille invisible de 2 colonnes × 2 lignes (cases de 768×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. Courbix, boss du domaine « proportionnalité et fonctions » : serpent mécanique géant dont le long corps segmenté ondule comme une courbe de graphique, segments violets reliés par des articulations cyan lumineuses, tête-écran aux yeux jaunes, crête en antennes. Pose de combat menaçante mais comique
2. Courbix, boss du domaine « proportionnalité et fonctions » : serpent mécanique géant dont le long corps segmenté ondule comme une courbe de graphique, segments violets reliés par des articulations cyan lumineuses, tête-écran aux yeux jaunes, crête en antennes. Attaque : se penche vers la gauche et lance une grosse onde d’énergie rouge
3. Courbix, boss du domaine « proportionnalité et fonctions » : serpent mécanique géant dont le long corps segmenté ondule comme une courbe de graphique, segments violets reliés par des articulations cyan lumineuses, tête-écran aux yeux jaunes, crête en antennes. Touché : recule, grimace comique, petites étincelles
4. Courbix, boss du domaine « proportionnalité et fonctions » : serpent mécanique géant dont le long corps segmenté ondule comme une courbe de graphique, segments violets reliés par des articulations cyan lumineuses, tête-écran aux yeux jaunes, crête en antennes. Vaincu : affalé, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 111. Courbix — portrait
Enregistrer sous `assets-src/originals/bosses/maths/courbix-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/courbix.png`.

```text
Image 1024×1024. Courbix (exactement comme sur sa planche d’états) : serpent mécanique géant dont le long corps segmenté ondule comme une courbe de graphique, segments violets reliés par des articulations cyan lumineuses, tête-écran aux yeux jaunes, crête en antennes. Tête seule, de face, l’air menaçant mais drôle.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 112. Planche « ia-des-connaissances-etats » (4 éléments)
Enregistrer sous `assets-src/originals/sheets/ia-des-connaissances-etats.png` · 1536×1024, grille 2×2 → chaque case finale 512×512
Cases : 1 → `bosses/maths/ia-des-connaissances` · 2 → `bosses/maths/ia-des-connaissances-attack` · 3 → `bosses/maths/ia-des-connaissances-hurt` · 4 → `bosses/maths/ia-des-connaissances-ko`

```text
Image 1536×1024 : planche de 4 éléments de jeu disposés sur une grille invisible de 2 colonnes × 2 lignes (cases de 768×512 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. IA des Connaissances, boss du domaine « programmation » : gros robot cubique bleu nuit flottant, écran-visage aux yeux cyan en colère, câbles comme des tentacules, cubes de données violets en orbite. Pose de combat menaçante mais comique
2. IA des Connaissances, boss du domaine « programmation » : gros robot cubique bleu nuit flottant, écran-visage aux yeux cyan en colère, câbles comme des tentacules, cubes de données violets en orbite. Attaque : se penche vers la gauche et lance une grosse onde d’énergie rouge
3. IA des Connaissances, boss du domaine « programmation » : gros robot cubique bleu nuit flottant, écran-visage aux yeux cyan en colère, câbles comme des tentacules, cubes de données violets en orbite. Touché : recule, grimace comique, petites étincelles
4. IA des Connaissances, boss du domaine « programmation » : gros robot cubique bleu nuit flottant, écran-visage aux yeux cyan en colère, câbles comme des tentacules, cubes de données violets en orbite. Vaincu : affalé, étourdi, petites spirales au-dessus de la tête

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 113. IA des Connaissances — portrait
Enregistrer sous `assets-src/originals/bosses/maths/ia-des-connaissances-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/ia-des-connaissances.png`.

```text
Image 1024×1024. IA des Connaissances (exactement comme sur sa planche d’états) : gros robot cubique bleu nuit flottant, écran-visage aux yeux cyan en colère, câbles comme des tentacules, cubes de données violets en orbite. Tête seule, de face, l’air menaçant mais drôle.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 114. Golem des Équations — shield
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-shield.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1536×1024. Golem des Équations : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine. Bouclier : bulle d’énergie violette hexagonale autour de lui.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 115. Golem des Équations — summon
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-summon.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1536×1024. Golem des Équations : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine. Invocation : bras levés, cube d’opérations au-dessus de la tête, débris en lévitation.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 116. Golem des Équations — tête menace
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-menace.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux plissés menaçants.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 117. Golem des Équations — tête moqueur
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-moqueur.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux fermés en arc, sourire moqueur.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 118. Golem des Équations — tête colere
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-colere.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux rouges, veine de colère.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 119. Golem des Équations — tête surprise
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-surprise.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : grands yeux ronds, traits de surprise.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 120. Golem des Équations — tête perplexe
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-perplexe.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : regard en coin, point d’interrogation.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 121. Golem des Équations — tête rire
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-rire.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : éclat de rire, yeux fermés.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 122. Golem des Équations — tête clin-oeil
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-clin-oeil.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : clin d’œil, étoile scintillante.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 123. Golem des Équations — tête amour
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-amour.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux en cœur, petits cœurs.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 124. Golem des Équations — tête triste
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-triste.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux tombants, larme.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 125. Golem des Équations — tête inquiet
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-inquiet.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux ronds, goutte de sueur.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 126. Golem des Équations — tête furieux
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-furieux.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux blancs, éclairs.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 127. Golem des Équations — tête concentre
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-concentre.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux mi-clos, anneaux d’énergie.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 128. Golem des Équations — tête ko
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-head-ko.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Tête du Golem des Équations (golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine) : yeux en croix, étoiles qui tournent.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 129. Golem des Équations — début de rage
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-rage-debut.png` · 1536×1024 → final 1200×800
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1536×1024. Golem des Équations qui s’énerve : aura rouge naissante, yeux rouges, bras écartés : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine.
Cadrage : personnage en pied centré, de face, fond transparent, halo et effets autour de lui.
Style, fond et interdits : ceux du message de départ.
```

#### 130. Golem des Équations — rage
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-rage.png` · 1536×1024 → final 1200×800
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1536×1024. Golem des Équations en rage : éclairs rouges partout, gueule hérissée de crocs, bras écartés : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine.
Cadrage : personnage en pied centré, de face, fond transparent, halo et effets autour de lui.
Style, fond et interdits : ceux du message de départ.
```

#### 131. Golem des Équations — en rage (combat)
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-rage-combat.png` · 1536×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1536×1024. Golem des Équations en rage dans l’arène, poings serrés, aura de flammes rouges : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 132. Golem des Équations — illustration
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-art.png` · 1536×1024 → final 1200×800
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1536×1024. Golem des Équations en pied, de face, mains ouvertes, cube d’opérations brillant devant lui, signes + − × ÷ en lévitation dans un anneau violet : golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine.
Cadrage : personnage en pied centré, de face, fond transparent, halo et effets autour de lui.
Style, fond et interdits : ceux du message de départ.
```

#### 133. Planche « mobs » (9 éléments)
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

#### 134. Mob π-bot — idle
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose idle.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 135. Mob π-bot — attack
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-attack.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose attack.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 136. Mob π-bot — shield
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-shield.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose shield.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 137. Mob π-bot — run
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-run.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose run.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 138. Mob π-bot — jump
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-jump.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose jump.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 139. Mob π-bot — victory
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-victory.png` · 1536×1024 → final 512×512

```text
Image 1536×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, pose victory.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases.
Style, fond et interdits : ceux du message de départ.
```

#### 140. Mob π-bot — tête menace
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-menace.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, menace.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 141. Mob π-bot — tête moqueur
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-moqueur.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, moqueur.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 142. Mob π-bot — tête joie
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-joie.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, joie.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 143. Mob π-bot — tête rire
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-rire.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, rire.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 144. Mob π-bot — tête surprise
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-surprise.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, surprise.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 145. Mob π-bot — tête triste
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-triste.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, triste.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 146. Mob π-bot — tête etourdi
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-etourdi.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, etourdi.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 147. Mob π-bot — tête colere
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-colere.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, colere.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 148. Mob π-bot — tête reflexion
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-reflexion.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, reflexion.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 149. Mob π-bot — tête idee
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-idee.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, idee.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 150. Mob π-bot — tête amour
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-amour.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, amour.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 151. Mob π-bot — tête dort
Enregistrer sous `assets-src/originals/bosses/minions/pi-bot-head-dort.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings, dort.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 152. Planche « effets-1 » (9 éléments)
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

#### 153. Planche « effets-2 » (3 éléments)
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

#### 154. Arène de la station spatiale
Enregistrer sous `assets-src/originals/environments/arenas/espace.png` · 1536×1024 → final 1536×864 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : décor de combat plein cadre vu de face, à hauteur de personnage, sol plat et dégagé sur le quart inférieur (les combattants seront posés à gauche et à droite), centre calme et lisible, aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 155. Arène de la station spatiale (portrait)
Enregistrer sous `assets-src/originals/environments/arenas/espace-portrait.png` · 1024×1536 → final 960×1280 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/espace.png`.

```text
Image 1024×1536. Plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 156. Arène de la station spatiale (panorama)
Enregistrer sous `assets-src/originals/environments/arenas/espace-large.png` · 1536×1024 → final 1536×640 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/espace.png`.

```text
Image 1536×1024. Plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 157. Arène de la station spatiale (bandeau)
Enregistrer sous `assets-src/originals/environments/arenas/espace-bandeau.png` · 1536×1024 → final 1536×384 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/espace.png`.

```text
Image 1536×1024. Plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 158. Arène de l’académie
Enregistrer sous `assets-src/originals/environments/arenas/academie.png` · 1536×1024 → final 1536×864 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : décor de combat plein cadre vu de face, à hauteur de personnage, sol plat et dégagé sur le quart inférieur (les combattants seront posés à gauche et à droite), centre calme et lisible, aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 159. Arène de l’académie (portrait)
Enregistrer sous `assets-src/originals/environments/arenas/academie-portrait.png` · 1024×1536 → final 960×1280 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/academie.png`.

```text
Image 1024×1536. Terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 160. Arène de l’académie (panorama)
Enregistrer sous `assets-src/originals/environments/arenas/academie-large.png` · 1536×1024 → final 1536×640 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/academie.png`.

```text
Image 1536×1024. Terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 161. Arène de l’académie (bandeau)
Enregistrer sous `assets-src/originals/environments/arenas/academie-bandeau.png` · 1536×1024 → final 1536×384 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/academie.png`.

```text
Image 1536×1024. Terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 162. Arène du volcan
Enregistrer sous `assets-src/originals/environments/arenas/volcan.png` · 1536×1024 → final 1536×864 · plein cadre (pas de fond magenta)

```text
Image 1536×1024. Plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : décor de combat plein cadre vu de face, à hauteur de personnage, sol plat et dégagé sur le quart inférieur (les combattants seront posés à gauche et à droite), centre calme et lisible, aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 163. Arène du volcan (portrait)
Enregistrer sous `assets-src/originals/environments/arenas/volcan-portrait.png` · 1024×1536 → final 960×1280 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/volcan.png`.

```text
Image 1024×1536. Plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 164. Arène du volcan (panorama)
Enregistrer sous `assets-src/originals/environments/arenas/volcan-large.png` · 1536×1024 → final 1536×640 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/volcan.png`.

```text
Image 1536×1024. Plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 165. Arène du volcan (bandeau)
Enregistrer sous `assets-src/originals/environments/arenas/volcan-bandeau.png` · 1536×1024 → final 1536×384 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `environments/arenas/volcan.png`.

```text
Image 1536×1024. Plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Style, fond et interdits : ceux du message de départ.
```

#### 166. Illustration principale
Enregistrer sous `assets-src/originals/branding/key-art.png` · 1536×1024 → final 1536×1024 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1536×1024. Scène de combat épique et joyeuse : les cinq héros alignés de gauche à droite (Alex avec son canon à plasma, Lina avec son lance-ballons, Pixel le chat avec son canon-poisson au premier plan, Ayla avec sa bombe-blaster, Tao avec son arbalète) et Questy qui lève le poing au milieu, tous face au Golem des Équations tout à droite ; en arrière-plan un château-académie violet flottant aux bannières à livre, ciel lavande, îles flottantes.
Cadrage : illustration plein cadre, composition lisible en petit, sans aucun texte ni interface.
Style, fond et interdits : ceux du message de départ.
```
