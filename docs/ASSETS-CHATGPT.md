<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Academy Fighters — génération des images avec ChatGPT

327 images finales, produites en 163 demandes.

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
| 4 | Icônes en couleur | 69 | 18–26 | `docs/chatgpt/lot-04-icones-en-couleur.md` |
| 5 | Questy, la mascotte | 38 | 27–46 | `docs/chatgpt/lot-05-questy-la-mascotte.md` |
| 6 | Héros | 53 | 47–99 | `docs/chatgpt/lot-06-heros.md` |
| 7 | Boss et ennemis | 43 | 100–134 | `docs/chatgpt/lot-07-boss-et-ennemis.md` |
| 8 | Armes et projectiles | 18 | 135–144 | `docs/chatgpt/lot-08-armes-et-projectiles.md` |
| 9 | Effets | 12 | 145–146 | `docs/chatgpt/lot-09-effets.md` |
| 10 | Environnements de combat | 40 | 147–163 | `docs/chatgpt/lot-10-environnements-de-combat.md` |

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

#### 22. Planche « modes-1 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/modes-1.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/modes/revisions` · 2 → `icons/modes/entrainement` · 3 → `icons/modes/boss` · 4 → `icons/modes/atelier` · 5 → `icons/modes/chrono` · 6 → `icons/modes/survie` · 7 → `icons/modes/defi` · 8 → `icons/modes/bilan` · 9 → `icons/modes/arene`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. cerveau rose avec une flèche circulaire
2. haltère violet et orange
3. tête de mort cartoon blanche dans un hexagone rouge
4. clé à molette et marteau croisés
5. chronomètre cyan
6. cœur rouge protégé par un bouclier
7. calendrier avec une pastille dorée
8. presse-papiers avec coches vertes
9. deux blasters jouets croisés

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 23. Planche « modes-2 » (3 éléments)
Enregistrer sous `assets-src/originals/sheets/modes-2.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `icons/modes/raid` · 2 → `icons/modes/quiz` · 3 → `icons/modes/course`

```text
Image 1024×1024 : planche de 3 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet seul, centré, vu de face, marge de 10 % autour.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. trois casques de héros côte à côte
2. buzzer rouge de jeu télévisé
3. drapeau à damier et éclair

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

### Lot 6 — Héros

> Commencer par les 4 portraits. Pour les expressions et les poses d’un héros, joindre son portrait validé. L’illustration principale vient en dernier : joindre la fiche de Questy et les portraits d’Alex et de Zoé.

#### 47. Alex — portrait
Enregistrer sous `assets-src/originals/characters/alex/portrait.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 48. Alex — joie
Enregistrer sous `assets-src/originals/characters/alex/expression-joie.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Expression : grand sourire, yeux plissés de joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 49. Alex — rire
Enregistrer sous `assets-src/originals/characters/alex/expression-rire.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Expression : éclat de rire, bouche grande ouverte, un œil fermé.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 50. Alex — surprise
Enregistrer sous `assets-src/originals/characters/alex/expression-surprise.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Expression : bouche en O, sourcils très hauts, yeux ronds.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 51. Alex — determination
Enregistrer sous `assets-src/originals/characters/alex/expression-determination.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Expression : regard déterminé, sourcils froncés, sourire en coin.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 52. Alex — effort
Enregistrer sous `assets-src/originals/characters/alex/expression-effort.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Expression : grimace d’effort, un œil fermé, dents serrées (dessin animé, aucune blessure).
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 53. Alex — tristesse
Enregistrer sous `assets-src/originals/characters/alex/expression-tristesse.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1024. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Expression : moue triste, sourcils relevés au centre, regard vers le bas.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 54. Alex — pose idle
Enregistrer sous `assets-src/originals/characters/alex/pose-idle.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1536. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Tient un blaster jouet violet et orange tirant un rayon jaune-orange. Pose attente : debout, détendu, arme tenue à deux mains vers le bas.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 55. Alex — pose run
Enregistrer sous `assets-src/originals/characters/alex/pose-run.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1536. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Tient un blaster jouet violet et orange tirant un rayon jaune-orange. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 56. Alex — pose shoot
Enregistrer sous `assets-src/originals/characters/alex/pose-shoot.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1536. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Tient un blaster jouet violet et orange tirant un rayon jaune-orange. Pose tir : bras tendus, arme pointée vers la droite, éclair à la bouche du canon.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 57. Alex — pose hurt
Enregistrer sous `assets-src/originals/characters/alex/pose-hurt.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1536. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Tient un blaster jouet violet et orange tirant un rayon jaune-orange. Pose touché : recule d’un pas, bras levés, grimace (dessin animé, aucune blessure).
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 58. Alex — pose victory
Enregistrer sous `assets-src/originals/characters/alex/pose-victory.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1536. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Tient un blaster jouet violet et orange tirant un rayon jaune-orange. Pose victoire : saute sur place, poing levé, grand sourire.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 59. Alex — pose defeat
Enregistrer sous `assets-src/originals/characters/alex/pose-defeat.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/alex/portrait.png`.

```text
Image 1024×1536. Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange. Tient un blaster jouet violet et orange tirant un rayon jaune-orange. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 60. Zoé — portrait
Enregistrer sous `assets-src/originals/characters/zoe/portrait.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 61. Zoé — joie
Enregistrer sous `assets-src/originals/characters/zoe/expression-joie.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1024. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Expression : grand sourire, yeux plissés de joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 62. Zoé — rire
Enregistrer sous `assets-src/originals/characters/zoe/expression-rire.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1024. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Expression : éclat de rire, bouche grande ouverte, un œil fermé.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 63. Zoé — surprise
Enregistrer sous `assets-src/originals/characters/zoe/expression-surprise.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1024. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Expression : bouche en O, sourcils très hauts, yeux ronds.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 64. Zoé — determination
Enregistrer sous `assets-src/originals/characters/zoe/expression-determination.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1024. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Expression : regard déterminé, sourcils froncés, sourire en coin.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 65. Zoé — effort
Enregistrer sous `assets-src/originals/characters/zoe/expression-effort.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1024. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Expression : grimace d’effort, un œil fermé, dents serrées (dessin animé, aucune blessure).
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 66. Zoé — tristesse
Enregistrer sous `assets-src/originals/characters/zoe/expression-tristesse.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1024. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Expression : moue triste, sourcils relevés au centre, regard vers le bas.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 67. Zoé — pose idle
Enregistrer sous `assets-src/originals/characters/zoe/pose-idle.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1536. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Tient un blaster jouet blanc et cyan tirant un anneau d’énergie cyan. Pose attente : debout, détendu, arme tenue à deux mains vers le bas.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 68. Zoé — pose run
Enregistrer sous `assets-src/originals/characters/zoe/pose-run.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1536. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Tient un blaster jouet blanc et cyan tirant un anneau d’énergie cyan. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 69. Zoé — pose shoot
Enregistrer sous `assets-src/originals/characters/zoe/pose-shoot.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1536. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Tient un blaster jouet blanc et cyan tirant un anneau d’énergie cyan. Pose tir : bras tendus, arme pointée vers la droite, éclair à la bouche du canon.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 70. Zoé — pose hurt
Enregistrer sous `assets-src/originals/characters/zoe/pose-hurt.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1536. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Tient un blaster jouet blanc et cyan tirant un anneau d’énergie cyan. Pose touché : recule d’un pas, bras levés, grimace (dessin animé, aucune blessure).
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 71. Zoé — pose victory
Enregistrer sous `assets-src/originals/characters/zoe/pose-victory.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1536. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Tient un blaster jouet blanc et cyan tirant un anneau d’énergie cyan. Pose victoire : saute sur place, poing levé, grand sourire.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 72. Zoé — pose defeat
Enregistrer sous `assets-src/originals/characters/zoe/pose-defeat.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/zoe/portrait.png`.

```text
Image 1024×1536. Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange. Tient un blaster jouet blanc et cyan tirant un anneau d’énergie cyan. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 73. Léo — portrait
Enregistrer sous `assets-src/originals/characters/leo/portrait.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 74. Léo — joie
Enregistrer sous `assets-src/originals/characters/leo/expression-joie.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1024. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Expression : grand sourire, yeux plissés de joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 75. Léo — rire
Enregistrer sous `assets-src/originals/characters/leo/expression-rire.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1024. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Expression : éclat de rire, bouche grande ouverte, un œil fermé.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 76. Léo — surprise
Enregistrer sous `assets-src/originals/characters/leo/expression-surprise.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1024. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Expression : bouche en O, sourcils très hauts, yeux ronds.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 77. Léo — determination
Enregistrer sous `assets-src/originals/characters/leo/expression-determination.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1024. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Expression : regard déterminé, sourcils froncés, sourire en coin.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 78. Léo — effort
Enregistrer sous `assets-src/originals/characters/leo/expression-effort.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1024. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Expression : grimace d’effort, un œil fermé, dents serrées (dessin animé, aucune blessure).
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 79. Léo — tristesse
Enregistrer sous `assets-src/originals/characters/leo/expression-tristesse.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1024. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Expression : moue triste, sourcils relevés au centre, regard vers le bas.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 80. Léo — pose idle
Enregistrer sous `assets-src/originals/characters/leo/pose-idle.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1536. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Tient un lance-formules jouet violet et orange avec un écran. Pose attente : debout, détendu, arme tenue à deux mains vers le bas.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 81. Léo — pose run
Enregistrer sous `assets-src/originals/characters/leo/pose-run.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1536. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Tient un lance-formules jouet violet et orange avec un écran. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 82. Léo — pose shoot
Enregistrer sous `assets-src/originals/characters/leo/pose-shoot.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1536. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Tient un lance-formules jouet violet et orange avec un écran. Pose tir : bras tendus, arme pointée vers la droite, éclair à la bouche du canon.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 83. Léo — pose hurt
Enregistrer sous `assets-src/originals/characters/leo/pose-hurt.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1536. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Tient un lance-formules jouet violet et orange avec un écran. Pose touché : recule d’un pas, bras levés, grimace (dessin animé, aucune blessure).
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 84. Léo — pose victory
Enregistrer sous `assets-src/originals/characters/leo/pose-victory.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1536. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Tient un lance-formules jouet violet et orange avec un écran. Pose victoire : saute sur place, poing levé, grand sourire.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 85. Léo — pose defeat
Enregistrer sous `assets-src/originals/characters/leo/pose-defeat.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/leo/portrait.png`.

```text
Image 1024×1536. Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches. Tient un lance-formules jouet violet et orange avec un écran. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 86. Mia — portrait
Enregistrer sous `assets-src/originals/characters/mia/portrait.png` · 1024×1024 → final 512×512

```text
Image 1024×1024. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Expression énergique.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 87. Mia — joie
Enregistrer sous `assets-src/originals/characters/mia/expression-joie.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1024. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Expression : grand sourire, yeux plissés de joie.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 88. Mia — rire
Enregistrer sous `assets-src/originals/characters/mia/expression-rire.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1024. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Expression : éclat de rire, bouche grande ouverte, un œil fermé.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 89. Mia — surprise
Enregistrer sous `assets-src/originals/characters/mia/expression-surprise.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1024. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Expression : bouche en O, sourcils très hauts, yeux ronds.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 90. Mia — determination
Enregistrer sous `assets-src/originals/characters/mia/expression-determination.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1024. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Expression : regard déterminé, sourcils froncés, sourire en coin.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 91. Mia — effort
Enregistrer sous `assets-src/originals/characters/mia/expression-effort.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1024. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Expression : grimace d’effort, un œil fermé, dents serrées (dessin animé, aucune blessure).
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 92. Mia — tristesse
Enregistrer sous `assets-src/originals/characters/mia/expression-tristesse.png` · 1024×1024 → final 384×384
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1024. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Expression : moue triste, sourcils relevés au centre, regard vers le bas.
Cadrage : même cadrage exact que le portrait de référence, seule l’expression change.
Style, fond et interdits : ceux du message de départ.
```

#### 93. Mia — pose idle
Enregistrer sous `assets-src/originals/characters/mia/pose-idle.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1536. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Tient un canon jouet bleu et orange tirant des mini-globes. Pose attente : debout, détendu, arme tenue à deux mains vers le bas.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 94. Mia — pose run
Enregistrer sous `assets-src/originals/characters/mia/pose-run.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1536. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Tient un canon jouet bleu et orange tirant des mini-globes. Pose course : grande foulée vers la droite, un pied décollé, buste penché en avant.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 95. Mia — pose shoot
Enregistrer sous `assets-src/originals/characters/mia/pose-shoot.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1536. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Tient un canon jouet bleu et orange tirant des mini-globes. Pose tir : bras tendus, arme pointée vers la droite, éclair à la bouche du canon.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 96. Mia — pose hurt
Enregistrer sous `assets-src/originals/characters/mia/pose-hurt.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1536. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Tient un canon jouet bleu et orange tirant des mini-globes. Pose touché : recule d’un pas, bras levés, grimace (dessin animé, aucune blessure).
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 97. Mia — pose victory
Enregistrer sous `assets-src/originals/characters/mia/pose-victory.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1536. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Tient un canon jouet bleu et orange tirant des mini-globes. Pose victoire : saute sur place, poing levé, grand sourire.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 98. Mia — pose defeat
Enregistrer sous `assets-src/originals/characters/mia/pose-defeat.png` · 1024×1536 → final 768×1152
> 📎 Joindre l'image validée `characters/mia/portrait.png`.

```text
Image 1024×1536. Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange. Tient un canon jouet bleu et orange tirant des mini-globes. Pose défaite : assis par terre, étourdi, petites spirales au-dessus de la tête.
Cadrage : personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses.
Style, fond et interdits : ceux du message de départ.
```

#### 99. Illustration principale
Enregistrer sous `assets-src/originals/branding/key-art.png` · 1536×1024 → final 1536×1024 · plein cadre (pas de fond magenta)
> 📎 Joindre l'image validée `characters/questy/model-sheet.png`.

```text
Image 1536×1024. Scène de combat épique et joyeuse : à gauche Questy lève le poing, au centre Alex tire avec son blaster, à droite Zoé tire avec son blaster, face au Golem des Équations (golem de pierre violette moussue aux runes lumineuses) tout à droite ; en arrière-plan un château-académie violet flottant aux bannières à livre, ciel lavande, îles flottantes.
Cadrage : illustration plein cadre, composition lisible en petit, sans aucun texte ni interface.
Style, fond et interdits : ceux du message de départ.
```

### Lot 7 — Boss et ennemis

> Pour le portrait et la version « touché » d’un boss, joindre l’image validée de ce boss.

#### 100. Golem des Équations
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Golem massif de blocs de pierre violette et grise couverts de mousse verte, cristaux violets sur les épaules, runes géométriques violettes lumineuses sur la poitrine et les poings, yeux violets brillants en colère. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 101. Golem des Équations — portrait
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Golem massif de blocs de pierre violette et grise couverts de mousse verte, cristaux violets sur les épaules, runes géométriques violettes lumineuses sur la poitrine et les poings, yeux violets brillants en colère. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 102. Golem des Équations — touché
Enregistrer sous `assets-src/originals/bosses/maths/golem-des-equations-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/maths/golem-des-equations.png`.

```text
Image 1024×1024. Golem massif de blocs de pierre violette et grise couverts de mousse verte, cristaux violets sur les épaules, runes géométriques violettes lumineuses sur la poitrine et les poings, yeux violets brillants en colère. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 103. Géomatrix
Enregistrer sous `assets-src/originals/bosses/maths/geomatrix.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Golem de cubes de cristal bleu et violet, symboles géométriques cyan lumineux gravés, petits cubes flottant autour, yeux orange. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 104. Géomatrix — portrait
Enregistrer sous `assets-src/originals/bosses/maths/geomatrix-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/maths/geomatrix.png`.

```text
Image 1024×1024. Golem de cubes de cristal bleu et violet, symboles géométriques cyan lumineux gravés, petits cubes flottant autour, yeux orange. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 105. Géomatrix — touché
Enregistrer sous `assets-src/originals/bosses/maths/geomatrix-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/maths/geomatrix.png`.

```text
Image 1024×1024. Golem de cubes de cristal bleu et violet, symboles géométriques cyan lumineux gravés, petits cubes flottant autour, yeux orange. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 106. Molécor
Enregistrer sous `assets-src/originals/bosses/physics/molecor.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Robot-fiole : grande fiole remplie de liquide vert fluo bouillonnant avec deux yeux en colère dans le liquide, carapace et bras mécaniques violets, tuyaux. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 107. Molécor — portrait
Enregistrer sous `assets-src/originals/bosses/physics/molecor-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/physics/molecor.png`.

```text
Image 1024×1024. Robot-fiole : grande fiole remplie de liquide vert fluo bouillonnant avec deux yeux en colère dans le liquide, carapace et bras mécaniques violets, tuyaux. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 108. Molécor — touché
Enregistrer sous `assets-src/originals/bosses/physics/molecor-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/physics/molecor.png`.

```text
Image 1024×1024. Robot-fiole : grande fiole remplie de liquide vert fluo bouillonnant avec deux yeux en colère dans le liquide, carapace et bras mécaniques violets, tuyaux. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 109. Professeur Molécule
Enregistrer sous `assets-src/originals/bosses/physics/professeur-molecule.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Blob de slime vert fluo dans une fiole renversée à poignées métalliques, tuyaux, yeux verts lumineux. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 110. Professeur Molécule — portrait
Enregistrer sous `assets-src/originals/bosses/physics/professeur-molecule-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/physics/professeur-molecule.png`.

```text
Image 1024×1024. Blob de slime vert fluo dans une fiole renversée à poignées métalliques, tuyaux, yeux verts lumineux. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 111. Professeur Molécule — touché
Enregistrer sous `assets-src/originals/bosses/physics/professeur-molecule-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/physics/professeur-molecule.png`.

```text
Image 1024×1024. Blob de slime vert fluo dans une fiole renversée à poignées métalliques, tuyaux, yeux verts lumineux. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 112. Florion
Enregistrer sous `assets-src/originals/bosses/biology/florion.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Golem-arbre au tronc sculpté en visage sévère, feuillage vert dense, racines en jambes, petit champignon rouge, yeux verts lumineux. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 113. Florion — portrait
Enregistrer sous `assets-src/originals/bosses/biology/florion-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/biology/florion.png`.

```text
Image 1024×1024. Golem-arbre au tronc sculpté en visage sévère, feuillage vert dense, racines en jambes, petit champignon rouge, yeux verts lumineux. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 114. Florion — touché
Enregistrer sous `assets-src/originals/bosses/biology/florion-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/biology/florion.png`.

```text
Image 1024×1024. Golem-arbre au tronc sculpté en visage sévère, feuillage vert dense, racines en jambes, petit champignon rouge, yeux verts lumineux. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 115. Scriptor
Enregistrer sous `assets-src/originals/bosses/french/scriptor.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Parchemin vivant enroulé au visage aux yeux orange, cape violette à bordure dorée, grande plume rose, feuilles volantes. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 116. Scriptor — portrait
Enregistrer sous `assets-src/originals/bosses/french/scriptor-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/french/scriptor.png`.

```text
Image 1024×1024. Parchemin vivant enroulé au visage aux yeux orange, cape violette à bordure dorée, grande plume rose, feuilles volantes. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 117. Scriptor — touché
Enregistrer sous `assets-src/originals/bosses/french/scriptor-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/french/scriptor.png`.

```text
Image 1024×1024. Parchemin vivant enroulé au visage aux yeux orange, cape violette à bordure dorée, grande plume rose, feuilles volantes. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 118. L’Ombre des Livres
Enregistrer sous `assets-src/originals/bosses/french/ombre-des-livres.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Silhouette encapuchonnée violette au visage d’ombre et yeux violets lumineux, livres ouverts flottant autour, volutes d’encre violette. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 119. L’Ombre des Livres — portrait
Enregistrer sous `assets-src/originals/bosses/french/ombre-des-livres-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/french/ombre-des-livres.png`.

```text
Image 1024×1024. Silhouette encapuchonnée violette au visage d’ombre et yeux violets lumineux, livres ouverts flottant autour, volutes d’encre violette. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 120. L’Ombre des Livres — touché
Enregistrer sous `assets-src/originals/bosses/french/ombre-des-livres-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/french/ombre-des-livres.png`.

```text
Image 1024×1024. Silhouette encapuchonnée violette au visage d’ombre et yeux violets lumineux, livres ouverts flottant autour, volutes d’encre violette. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 121. Chronos
Enregistrer sous `assets-src/originals/bosses/history/chronos.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Horloge géante dorée à engrenages, visage blanc aux yeux rouges dans le cadran, bras mécaniques, petit globe au-dessus. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 122. Chronos — portrait
Enregistrer sous `assets-src/originals/bosses/history/chronos-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/history/chronos.png`.

```text
Image 1024×1024. Horloge géante dorée à engrenages, visage blanc aux yeux rouges dans le cadran, bras mécaniques, petit globe au-dessus. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 123. Chronos — touché
Enregistrer sous `assets-src/originals/bosses/history/chronos-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/history/chronos.png`.

```text
Image 1024×1024. Horloge géante dorée à engrenages, visage blanc aux yeux rouges dans le cadran, bras mécaniques, petit globe au-dessus. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 124. Globotron
Enregistrer sous `assets-src/originals/bosses/history/globotron.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Robot dont la tête est un globe terrestre à visière noire et yeux jaunes, casque audio cyan, corps violet et argent. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 125. Globotron — portrait
Enregistrer sous `assets-src/originals/bosses/history/globotron-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/history/globotron.png`.

```text
Image 1024×1024. Robot dont la tête est un globe terrestre à visière noire et yeux jaunes, casque audio cyan, corps violet et argent. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 126. Globotron — touché
Enregistrer sous `assets-src/originals/bosses/history/globotron-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/history/globotron.png`.

```text
Image 1024×1024. Robot dont la tête est un globe terrestre à visière noire et yeux jaunes, casque audio cyan, corps violet et argent. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 127. IA des Connaissances
Enregistrer sous `assets-src/originals/bosses/general/ia-des-connaissances.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Robot cubique bleu à écran-visage aux yeux cyan en colère, cubes de données violets en orbite. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 128. IA des Connaissances — portrait
Enregistrer sous `assets-src/originals/bosses/general/ia-des-connaissances-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/general/ia-des-connaissances.png`.

```text
Image 1024×1024. Robot cubique bleu à écran-visage aux yeux cyan en colère, cubes de données violets en orbite. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 129. IA des Connaissances — touché
Enregistrer sous `assets-src/originals/bosses/general/ia-des-connaissances-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/general/ia-des-connaissances.png`.

```text
Image 1024×1024. Robot cubique bleu à écran-visage aux yeux cyan en colère, cubes de données violets en orbite. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 130. Araignée mécanique
Enregistrer sous `assets-src/originals/bosses/general/araignee-mecanique.png` · 1024×1024 → final 768×768

```text
Image 1024×1024. Robot araignée blanc et violet à six pattes orange pointues, cœur-réacteur orange lumineux. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 131. Araignée mécanique — portrait
Enregistrer sous `assets-src/originals/bosses/general/araignee-mecanique-portrait.png` · 1024×1024 → final 512×512
> 📎 Joindre l'image validée `bosses/general/araignee-mecanique.png`.

```text
Image 1024×1024. Robot araignée blanc et violet à six pattes orange pointues, cœur-réacteur orange lumineux. Tête seule, de face, l’air menaçant.
Cadrage : tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond).
Style, fond et interdits : ceux du message de départ.
```

#### 132. Araignée mécanique — touché
Enregistrer sous `assets-src/originals/bosses/general/araignee-mecanique-hurt.png` · 1024×1024 → final 768×768
> 📎 Joindre l'image validée `bosses/general/araignee-mecanique.png`.

```text
Image 1024×1024. Robot araignée blanc et violet à six pattes orange pointues, cœur-réacteur orange lumineux. Touché : recule, grimace comique, petites étincelles.
Cadrage : boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre.
Style, fond et interdits : ceux du message de départ.
```

#### 133. Planche « ennemis-1 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/ennemis-1.png` · 1024×1024, grille 3×3 → chaque case finale 384×384
Cases : 1 → `bosses/minions/cube-bot` · 2 → `bosses/minions/equerre` · 3 → `bosses/minions/calculatrice` · 4 → `bosses/minions/fiole` · 5 → `bosses/minions/molecule` · 6 → `bosses/minions/feuille` · 7 → `bosses/minions/parchemin` · 8 → `bosses/minions/livre` · 9 → `bosses/minions/globe`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : petit ennemi en pied, tourné vers la gauche, base à 90 % de sa case, occupe 70 % de la case.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. petit robot cube blanc à écran bleu, deux petits bras. Mignon mais espiègle
2. équerre jaune vivante avec un rapporteur, yeux rouges. Mignon mais espiègle
3. calculatrice grise vivante sur pattes, écran-yeux bleus. Mignon mais espiègle
4. petite fiole verte vivante, yeux jaunes. Mignon mais espiègle
5. molécule violette et rose (boules reliées), yeux méchants. Mignon mais espiègle
6. boule de feuilles vertes épineuses, yeux rouges. Mignon mais espiègle
7. petit parchemin vivant, yeux orange. Mignon mais espiègle
8. livre violet vivant à lunettes rondes. Mignon mais espiègle
9. globe terrestre vivant sur pied avec règle. Mignon mais espiègle

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 134. Planche « ennemis-2 » (1 éléments)
Enregistrer sous `assets-src/originals/sheets/ennemis-2.png` · 1024×1024, grille 3×3 → chaque case finale 384×384
Cases : 1 → `bosses/minions/casque`

```text
Image 1024×1024 : planche de 1 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : petit ennemi en pied, tourné vers la gauche, base à 90 % de sa case, occupe 70 % de la case.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. casque grec argenté à crête rouge vivant, yeux jaunes dans la fente. Mignon mais espiègle

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

### Lot 8 — Armes et projectiles

#### 135. Blaster d’Alex
Enregistrer sous `assets-src/originals/weapons/blaster-alex.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Blaster violet et orange à canon court. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 136. Blaster de Zoé
Enregistrer sous `assets-src/originals/weapons/blaster-zoe.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Blaster blanc et cyan à canon annelé. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 137. Lance-Livre
Enregistrer sous `assets-src/originals/weapons/lance-livre.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Gros lanceur violet et or dont le canon est un livre ouvert. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 138. Lance-Formules
Enregistrer sous `assets-src/originals/weapons/lance-formules.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Lanceur argenté et orange avec un écran. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 139. Rayon de Laboratoire
Enregistrer sous `assets-src/originals/weapons/rayon-labo.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Pistolet-rayon orange à réservoir de cristal violet. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 140. Canon Atlas
Enregistrer sous `assets-src/originals/weapons/canon-atlas.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Canon bleu et orange portant un globe terrestre. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 141. Plume Laser
Enregistrer sous `assets-src/originals/weapons/plume-laser.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Grande plume violette lumineuse montée sur une poignée. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 142. Bio-Scanner
Enregistrer sous `assets-src/originals/weapons/bio-scanner.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Lanceur vert à capsule contenant une feuille. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 143. Projecteur Tech
Enregistrer sous `assets-src/originals/weapons/projecteur-tech.png` · 1536×1024 → final 768×512

```text
Image 1536×1024. Lanceur violet à écran. Jouet futuriste aux formes rondes et inoffensives.
Cadrage : lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 144. Planche « projectiles » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/projectiles.png` · 1024×1024, grille 3×3 → chaque case finale 256×256
Cases : 1 → `projectiles/blaster-alex` · 2 → `projectiles/blaster-zoe` · 3 → `projectiles/lance-livre` · 4 → `projectiles/lance-formules` · 5 → `projectiles/rayon-labo` · 6 → `projectiles/canon-atlas` · 7 → `projectiles/plume-laser` · 8 → `projectiles/bio-scanner` · 9 → `projectiles/projecteur-tech`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : projectile en mouvement vers la droite avec courte traînée à gauche, centré.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. rayon d’énergie jaune-orange
2. anneau d’énergie cyan
3. livre ouvert volant
4. cube bleu lumineux
5. bulle de liquide vert
6. mini globe terrestre
7. plume violette
8. feuille verte
9. éclair violet

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

### Lot 9 — Effets

#### 145. Planche « effets-1 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/effets-1.png` · 1024×1024, grille 3×3 → chaque case finale 512×512
Cases : 1 → `effects/impacts/hit-burst` · 2 → `effects/impacts/eclat-violet` · 3 → `effects/impacts/anneau-cyan` · 4 → `effects/impacts/explosion` · 5 → `effects/impacts/eclat-feuilles` · 6 → `effects/impacts/cristaux` · 7 → `effects/particles/puff` · 8 → `effects/particles/pixels` · 9 → `effects/particles/etourdi`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : effet centré, bords nets (pas de grand halo flou).
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. éclat d’impact orange et jaune
2. éclat d’impact violet à cœur blanc
3. anneau d’onde de choc cyan vu de trois quarts
4. petite explosion orange avec cailloux
5. gerbe de feuilles vertes
6. éclats de cristal bleu glacé
7. nuage de fumée violette cartoon (disparition)
8. nuée de petits carrés cyan (téléportation)
9. trois petites spirales dorées en orbite (étourdi)

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 146. Planche « effets-2 » (3 éléments)
Enregistrer sous `assets-src/originals/sheets/effets-2.png` · 1024×1024, grille 3×3 → chaque case finale 512×512
Cases : 1 → `effects/transitions/portail` · 2 → `effects/particles/poussiere` · 3 → `effects/particles/confettis`

```text
Image 1024×1024 : planche de 3 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : effet centré, bords nets (pas de grand halo flou).
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. tourbillon de portail violet vu de face
2. petit nuage de poussière blanche (course)
3. gerbe de confettis violets, orange, cyan et roses

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

### Lot 10 — Environnements de combat

#### 147. Arène tech
Enregistrer sous `assets-src/originals/environments/arenas/arene-tech.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Arène circulaire violette à piliers dorés et néons cyan, cercle lumineux au sol.
Cadrage : île d’arène isométrique flottante vue de trois quarts plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 148. Arène académie
Enregistrer sous `assets-src/originals/environments/arenas/arene-academie.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Arène circulaire en dalles crème avec bannières violettes à livre, portail surmonté d’un livre géant.
Cadrage : île d’arène isométrique flottante vue de trois quarts plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 149. Arène nature
Enregistrer sous `assets-src/originals/environments/arenas/arene-nature.png` · 1536×1024 → final 1536×1024

```text
Image 1536×1024. Arène circulaire d’herbe avec arbres, piliers de pierre moussus, portail bleu lumineux.
Cadrage : île d’arène isométrique flottante vue de trois quarts plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 150. Plateforme herbe
Enregistrer sous `assets-src/originals/environments/tiles/plateforme-herbe.png` · 1536×1024 → final 512×256

```text
Image 1536×1024. Bloc de pierre grise surmonté d’herbe verte.
Cadrage : plateforme flottante vue de face légèrement plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 151. Plateforme violette
Enregistrer sous `assets-src/originals/environments/tiles/plateforme-violette.png` · 1536×1024 → final 512×256

```text
Image 1536×1024. Bloc de pierre violette.
Cadrage : plateforme flottante vue de face légèrement plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 152. Plateforme pierre
Enregistrer sous `assets-src/originals/environments/tiles/plateforme-pierre.png` · 1536×1024 → final 512×256

```text
Image 1536×1024. Bloc de pavés gris.
Cadrage : plateforme flottante vue de face légèrement plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 153. Plateforme glace
Enregistrer sous `assets-src/originals/environments/tiles/plateforme-glace.png` · 1536×1024 → final 512×256

```text
Image 1536×1024. Bloc de glace bleue cristalline.
Cadrage : plateforme flottante vue de face légèrement plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 154. Plateforme lave
Enregistrer sous `assets-src/originals/environments/tiles/plateforme-lave.png` · 1536×1024 → final 512×256

```text
Image 1536×1024. Bloc de roche noire fissurée de lave orange.
Cadrage : plateforme flottante vue de face légèrement plongée, centrée, occupe 85 % de la largeur.
Style, fond et interdits : ceux du message de départ.
```

#### 155. Sol dalles
Enregistrer sous `assets-src/originals/environments/tiles/sol-dalles.png` · 1024×1024 → final 256×256 · plein cadre (pas de fond magenta)

```text
Image 1024×1024. Dalles de pierre grise.
Cadrage : tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords.
Style, fond et interdits : ceux du message de départ.
```

#### 156. Sol violet
Enregistrer sous `assets-src/originals/environments/tiles/sol-violet.png` · 1024×1024 → final 256×256 · plein cadre (pas de fond magenta)

```text
Image 1024×1024. Dalle violette à cercle lumineux central.
Cadrage : tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords.
Style, fond et interdits : ceux du message de départ.
```

#### 157. Sol grille
Enregistrer sous `assets-src/originals/environments/tiles/sol-grille.png` · 1024×1024 → final 256×256 · plein cadre (pas de fond magenta)

```text
Image 1024×1024. Grille métallique sombre.
Cadrage : tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords.
Style, fond et interdits : ceux du message de départ.
```

#### 158. Sol énergie
Enregistrer sous `assets-src/originals/environments/tiles/sol-energie.png` · 1024×1024 → final 256×256 · plein cadre (pas de fond magenta)

```text
Image 1024×1024. Dalle cyan lumineuse.
Cadrage : tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords.
Style, fond et interdits : ceux du message de départ.
```

#### 159. Sol herbe
Enregistrer sous `assets-src/originals/environments/tiles/sol-herbe.png` · 1024×1024 → final 256×256 · plein cadre (pas de fond magenta)

```text
Image 1024×1024. Herbe avec petites fleurs jaunes.
Cadrage : tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords.
Style, fond et interdits : ceux du message de départ.
```

#### 160. Sol sable
Enregistrer sous `assets-src/originals/environments/tiles/sol-sable.png` · 1024×1024 → final 256×256 · plein cadre (pas de fond magenta)

```text
Image 1024×1024. Sable clair.
Cadrage : tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords.
Style, fond et interdits : ceux du message de départ.
```

#### 161. Planche « decors-1 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/decors-1.png` · 1024×1024, grille 3×3 → chaque case finale 384×384
Cases : 1 → `environments/props/banniere` · 2 → `environments/props/lampadaire` · 3 → `environments/props/arche` · 4 → `environments/props/bibliotheque` · 5 → `environments/props/pile-livres` · 6 → `environments/props/globe` · 7 → `environments/props/telescope` · 8 → `environments/props/tableau` · 9 → `environments/props/eprouvettes`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet de décor posé au sol, trois quarts face, base à 90 % de sa case.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. bannière violette suspendue portant un livre ouvert
2. lampadaire noir avec petit drapeau violet
3. arche de pierre moussue
4. bibliothèque en bois remplie de livres colorés
5. pile de livres colorés
6. globe terrestre sur pied doré
7. télescope doré sur trépied
8. tableau noir sur pied avec un triangle dessiné à la craie
9. porte-éprouvettes en bois avec liquides colorés

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 162. Planche « decors-2 » (9 éléments)
Enregistrer sous `assets-src/originals/sheets/decors-2.png` · 1024×1024, grille 3×3 → chaque case finale 384×384
Cases : 1 → `environments/props/terrarium` · 2 → `environments/props/cristaux` · 3 → `environments/props/colonne` · 4 → `environments/props/casier` · 5 → `environments/props/sac-a-dos` · 6 → `environments/props/portail-violet` · 7 → `environments/props/portail-bleu` · 8 → `environments/props/portail-vert` · 9 → `environments/props/portail-orange`

```text
Image 1024×1024 : planche de 9 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet de décor posé au sol, trois quarts face, base à 90 % de sa case.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. cloche de verre avec une plante
2. grappe de cristaux violets
3. colonne grecque brisée avec lierre
4. casier d’école violet
5. sac à dos orange et violet
6. portail de pierre à tourbillon violet
7. portail de pierre à tourbillon bleu
8. portail de pierre moussue à tourbillon vert
9. portail à engrenages dorés à tourbillon orange

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```

#### 163. Planche « decors-3 » (8 éléments)
Enregistrer sous `assets-src/originals/sheets/decors-3.png` · 1024×1024, grille 3×3 → chaque case finale 384×384
Cases : 1 → `environments/props/barriere-energie` · 2 → `environments/props/barriere-laser` · 3 → `environments/props/caisse` · 4 → `environments/props/rocher` · 5 → `environments/props/marqueur-cible` · 6 → `environments/props/marqueur-zone` · 7 → `environments/props/marqueur-soin` · 8 → `environments/props/marqueur-alerte`

```text
Image 1024×1024 : planche de 8 éléments de jeu disposés sur une grille invisible de 3 colonnes × 3 lignes (cases de 341×341 px).
Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.
Cadrage de chaque élément : objet de décor posé au sol, trois quarts face, base à 90 % de sa case.
Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.

1. barrière d’énergie hexagonale cyan
2. deux poteaux reliés par des lasers rouges
3. caisse en bois
4. rochers gris
5. marqueur de sol rouge en forme de viseur
6. disque de sol bleu lumineux
7. disque de sol vert à croix
8. disque de sol orange à point d’exclamation

Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).
```
