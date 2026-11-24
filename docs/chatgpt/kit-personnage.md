# Épicadémie — Kit d’un personnage (héros, boss ou mob)

Chaque personnage est livré en **deux planches 1536 × 1024**, au même gabarit que le kit d’Alex :

| Planche | Grille | Cases | Contenu |
|---|---|---|---|
| `poses` | 3 colonnes × 2 lignes | 512 × 512 px | 6 poses en pied, pieds sur la même ligne de sol, même taille partout |
| `tetes` | 4 colonnes × 3 lignes | 384 × 341 px | 12 expressions (tête et haut des épaules), même taille partout |

Le gabarit se trouve dans `docs/chatgpt/gabarit/` :

- **`gabarit-poses.png`** et **`gabarit-tetes.png`** : les planches d’Alex sur fond transparent. Ce sont les modèles à joindre à ChatGPT.
- **`gabarit-poses-annote.png`** et **`gabarit-tetes-annote.png`** : les mêmes planches, avec la grille, la zone utile (pointillés bleus), la ligne de sol (pointillés verts) et le nom de chaque case. Elles servent à vérifier le résultat ; on ne les donne pas à ChatGPT.

## Ordre des cases (de gauche à droite, puis de haut en bas)

**Héros**, placé à gauche de l’arène et tourné vers la droite :

- Poses : 1 attente, 2 course, 3 tir (vers la droite), 4 bouclier, 5 saut, 6 victoire.
- Têtes : 1 joie, 2 rire, 3 enthousiaste, 4 confiant, 5 déterminé, 6 clin d’œil, 7 surprise, 8 réflexion, 9 affection, 10 colère, 11 triste, 12 étourdi.

**Ennemi** (boss ou mob), placé à droite de l’arène et tourné vers la gauche :

- Poses : 1 attente, 2 attaque (vers la gauche), 3 bouclier, 4 invocation, 5 touché, 6 KO.
- Têtes : 1 menaçant, 2 moqueur, 3 colère, 4 surprise, 5 perplexe, 6 rire, 7 clin d’œil, 8 inquiet, 9 triste, 10 furieux, 11 amour, 12 KO.

## Mode d’emploi

1. Ouvre une **nouvelle conversation** ChatGPT (ChatGPT Images).
2. Joins **`gabarit-poses.png`**, et l’image de référence du nouveau personnage si tu en as une.
3. Colle le **prompt « poses »** ci-dessous en remplaçant les crochets, puis envoie.
4. Dans la même conversation, joins **`gabarit-tetes.png`** et colle le **prompt « têtes »**.
5. Télécharge les deux PNG et dépose-les ici en me disant le nom du personnage et s’il est héros ou ennemi. Je fais le découpage et l’intégration au jeu.

### Prompt « poses »

```text
Je te joins une planche modèle (1536×1024, fond transparent) : 6 poses d’un personnage, sur une grille invisible de 3 colonnes × 2 lignes (cases de 512×512).
Dessine EXACTEMENT la même planche pour un autre personnage : [description du personnage, ou « celui de l’image jointe »].
Règles :
- Image 1536×1024, fond transparent (sinon magenta uni #FF00FF), aucun texte, aucune grille, aucun cadre.
- Même grille, même ordre : [héros : 1 attente, 2 course, 3 tir vers la droite, 4 bouclier, 5 saut, 6 victoire] / [ennemi : 1 attente, 2 attaque vers la gauche, 3 bouclier, 4 invocation, 5 touché, 6 KO].
- Le personnage regarde [vers la droite (héros) / vers la gauche (ennemi)].
- Une pose par case, centrée ; rien ne déborde sur la case voisine ; marge d’environ 8 % autour.
- Même taille du personnage dans toutes les cases, pieds sur la même ligne de sol (à 92 % de la hauteur de chaque case).
- Même style que le modèle : contour noir épais, couleurs vives, rendu cartoon de jeu mobile.
```

### Prompt « têtes »

```text
Voici la planche modèle des têtes (1536×1024, fond transparent) : 12 expressions sur une grille invisible de 4 colonnes × 3 lignes (cases de 384×341).
Fais la même planche pour le même personnage que la planche des poses.
Règles :
- Image 1536×1024, fond transparent (sinon magenta uni #FF00FF), aucun texte, aucune grille.
- Même grille, même ordre : [héros : joie, rire, enthousiaste, confiant, déterminé, clin d’œil, surprise, réflexion, affection, colère, triste, étourdi] / [ennemi : menaçant, moqueur, colère, surprise, perplexe, rire, clin d’œil, inquiet, triste, furieux, amour, KO].
- Tête et haut des épaules, tournés [vers la droite (héros) / vers la gauche (ennemi)], même taille dans toutes les cases, centrés, marge d’environ 8 %.
- Les petits effets (étoiles, cœurs, gouttes, éclairs, point d’interrogation) restent dans la case de leur tête.
```

## Découpage (fait de mon côté)

```bash
pnpm --filter @epicademie/web assets:kit decouper <poses.png> <tetes.png> <heros|ennemi> <dossier>
```

Chaque forme est rattachée à la case qui contient son centre, même si elle déborde un peu ; les poussières sont ignorées. Un fond magenta est retiré automatiquement. On obtient `pose-<état>.png` et `head-<expression>.png`, rangés ensuite aux chemins du catalogue, puis importés avec `assets:import`.

Pour refaire le gabarit à partir des originaux d’Alex : `pnpm --filter @epicademie/web assets:kit gabarit`.
