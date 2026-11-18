<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Academy Fighters — Variantes des arènes (à utiliser avec ChatGPT)

15 images : chaque arène livrée (16:9) est déclinée en 3 formats, pour que le décor ne soit jamais écrasé ni trop rogné.

| Format | Généré | Final | Proportions | Où |
|---|---|---|---|---|
| Plein cadre (livré) | 1536×1024 | 1536×864 | 16:9 | scène du combat, tablette en portrait et ordinateur |
| Portrait | 1024×1536 | 960×1280 | 3:4 | scène du combat sur téléphone |
| Panorama | 1536×1024 | 1536×640 | 12:5 | scène du combat sur tablette en paysage |
| Bandeau | 1536×1024 | 1536×384 | 4:1, répété en largeur | bandeau du haut pendant les questions |

Le jeu mesure le cadre et prend la variante dont les proportions sont les plus proches ; tant qu'une variante manque, il garde l'image plein cadre.
Le bandeau est répété horizontalement à la hauteur du bandeau : il n'est ni étiré ni écrasé, quelle que soit la largeur de l'écran.

## Mode d'emploi

1. Une **conversation ChatGPT par arène** : joins l'image de l'arène livrée indiquée, puis envoie les 3 demandes une par une.
2. Télécharge chaque image en PNG et enregistre-la au chemin indiqué.
3. Dis-moi quand c'est déposé : je lance l'import (recadrage, WebP) et le jeu les utilise aussitôt.

## Demandes

### Arène de la station spatiale

> 📎 Joindre l'arène livrée `apps/web/assets-src/originals/environments/arenas/espace.png`.

#### 1. Arène de la station spatiale (portrait) — scène du combat sur téléphone
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/espace-portrait.png` · 1024×1536 → final 960×1280

```text
Image 1024×1536, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 2. Arène de la station spatiale (panorama) — scène du combat sur tablette en paysage
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/espace-large.png` · 1536×1024 → final 1536×640

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 3. Arène de la station spatiale (bandeau) — bandeau du haut pendant les questions
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/espace-bandeau.png` · 1536×1024 → final 1536×384

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

### Arène de l’académie

> 📎 Joindre l'arène livrée `apps/web/assets-src/originals/environments/arenas/academie.png`.

#### 1. Arène de l’académie (portrait) — scène du combat sur téléphone
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/academie-portrait.png` · 1024×1536 → final 960×1280

```text
Image 1024×1536, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 2. Arène de l’académie (panorama) — scène du combat sur tablette en paysage
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/academie-large.png` · 1536×1024 → final 1536×640

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 3. Arène de l’académie (bandeau) — bandeau du haut pendant les questions
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/academie-bandeau.png` · 1536×1024 → final 1536×384

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : terrasse de l’académie au milieu des collines, cascades et observatoires.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

### Arène de la jungle

> 📎 Joindre l'arène livrée `apps/web/assets-src/originals/environments/arenas/jungle.png`.

#### 1. Arène de la jungle (portrait) — scène du combat sur téléphone
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/jungle-portrait.png` · 1024×1536 → final 960×1280

```text
Image 1024×1536, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme moussue dans une jungle aux ruines et cascades, portail violet.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 2. Arène de la jungle (panorama) — scène du combat sur tablette en paysage
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/jungle-large.png` · 1536×1024 → final 1536×640

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme moussue dans une jungle aux ruines et cascades, portail violet.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 3. Arène de la jungle (bandeau) — bandeau du haut pendant les questions
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/jungle-bandeau.png` · 1536×1024 → final 1536×384

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme moussue dans une jungle aux ruines et cascades, portail violet.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

### Arène du volcan

> 📎 Joindre l'arène livrée `apps/web/assets-src/originals/environments/arenas/volcan.png`.

#### 1. Arène du volcan (portrait) — scène du combat sur téléphone
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/volcan-portrait.png` · 1024×1536 → final 960×1280

```text
Image 1024×1536, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 2. Arène du volcan (panorama) — scène du combat sur tablette en paysage
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/volcan-large.png` · 1536×1024 → final 1536×640

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 3. Arène du volcan (bandeau) — bandeau du haut pendant les questions
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/volcan-bandeau.png` · 1536×1024 → final 1536×384

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme de pierre fissurée de lave, volcan en éruption et forteresse.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

### Arène des glaces

> 📎 Joindre l'arène livrée `apps/web/assets-src/originals/environments/arenas/glace.png`.

#### 1. Arène des glaces (portrait) — scène du combat sur téléphone
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/glace-portrait.png` · 1024×1536 → final 960×1280

```text
Image 1024×1536, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme gelée, aurores boréales, montagnes enneigées et palais de glace.
Cadrage : même décor recomposé en hauteur (format portrait, écran de téléphone), vu de face à hauteur de personnage ; sol plat et dégagé sur le tiers inférieur (les deux combattants y seront posés côte à côte, chacun sur près de la moitié de la largeur) ; le point d’intérêt du décor (planète, volcan, palais…) dans la moitié haute ; rien d’important à moins de 6 % du haut et du bas (rogné) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 2. Arène des glaces (panorama) — scène du combat sur tablette en paysage
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/glace-large.png` · 1536×1024 → final 1536×640

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme gelée, aurores boréales, montagnes enneigées et palais de glace.
Cadrage : même décor en panorama très large (tablette en paysage) : seule la bande entre 20 % et 80 % de la hauteur sera gardée ; sol plat et dégagé entre 60 % et 80 % de la hauteur, sur toute la largeur ; horizon et point d’intérêt entre 20 % et 55 % de la hauteur ; le haut et le bas de l’image ne contiennent que du ciel et du sol ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```

#### 3. Arène des glaces (bandeau) — bandeau du haut pendant les questions
Enregistrer sous `apps/web/assets-src/originals/environments/arenas/glace-bandeau.png` · 1536×1024 → final 1536×384

```text
Image 1536×1024, plein cadre. Reprends EXACTEMENT le décor de l'image jointe (mêmes lieux, couleurs, lumière et style), recomposé pour un autre format : plateforme gelée, aurores boréales, montagnes enneigées et palais de glace.
Cadrage : frise panoramique du même décor pour un bandeau de titre : seule la bande entre 31 % et 69 % de la hauteur sera gardée, tous les détails y tiennent (ligne d’horizon au milieu) ; texture régulière sans objet isolé marquant ni zone vide ; le bord gauche et le bord droit se raccordent parfaitement (image répétée en boucle) ; teintes un peu sombres, peu contrastées (du texte blanc passera dessus) ; aucun personnage.
Pas de texte, pas de personnage, pas de bordure.
```
