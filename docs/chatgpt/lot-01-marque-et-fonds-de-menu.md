<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Épicadémie — Lot 1 — Marque et fonds de menu

4 images, demandes 1 à 4 (4 messages à envoyer).

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

### Lot 1 — Marque et fonds de menu

#### 1. Logo Épicadémie
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
