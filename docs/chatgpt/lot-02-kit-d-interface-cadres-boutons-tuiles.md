<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Épicadémie — Lot 2 — Kit d’interface : cadres, boutons, tuiles

23 images, demandes 5 à 14 (10 messages à envoyer).

## Marche à suivre

1. Ouvre une **nouvelle conversation** ChatGPT.
2. Joins **toutes les planches de référence** et colle le **message de départ** ci-dessous. Attends « Prêt ».
3. Envoie les demandes **une par une**, dans l'ordre : copie le bloc de texte de la demande, attends l'image, télécharge-la.
4. Enregistre chaque PNG exactement au chemin indiqué (dans `apps/web/`).

**Règles pour ChatGPT** (rappelées dans le message de départ)
- **Une seule image par message**, jamais tout le lot d'un coup.
- **Aucun ZIP, aucun script, aucun détourage par code** : uniquement des images générées, sur fond magenta uni.
- Télécharge chaque image **telle quelle** en PNG (taille d'origine, fond magenta) : le détourage et le redimensionnement sont faits par le script d'import du projet.

## Message de départ

```text
Tu es directeur artistique et illustrateur d'un jeu vidéo éducatif pour tablette, « Épicadémie », destiné aux élèves de 5e (11-13 ans).
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
