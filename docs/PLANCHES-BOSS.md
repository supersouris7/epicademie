# Planches des boss des matières (à générer dans ChatGPT)

Un boss par matière, sur le modèle exact du Sorcier π (maths). Pour chaque boss, **4 planches
déjà détourées (fond transparent)**, dans cet ordre de cases. La découpe
(`pnpm --filter @questeo/web assets:sprites`) les prend telles quelles.

| Planche                   | Grille | Contenu, dans l'ordre de lecture                                                                 |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `<boss>-anim-attente.png` | 4 × 2  | 8 images de l'animation sur place : 4 calmes, puis 4 de plus en plus en colère (la dernière vie) |
| `<boss>-poses.png`        | 4 × 2  | attente, attaque, bouclier, touché, K.-O., sort 1, sort 2 (charge), victoire                     |
| `<boss>-tetes.png`        | 4 × 3  | 6 têtes calmes, puis 6 en rage (mêmes cadrages)                                                  |
| `<boss>-portrait.png`     | 1 × 1  | portrait en pied, de face                                                                        |

Consignes communes (comme pour le Sorcier π) :

- même style que les héros : contour noir épais, couleurs franches, ombrage cartoon ;
- personnage en entier dans chaque case (jamais coupé), même échelle et même ligne de sol ;
- fond transparent, sans fumée ni effet détaché qui toucherait la case voisine ;
- pas de texte dans l'image.

## Boss proposés

Les noms et les apparences sont des propositions : à changer librement.

| Matière         | Boss proposé            | Apparence (à donner à ChatGPT)                                                                                                    |
| --------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Anglais         | **Lord Grammar**        | gentleman-robot en redingote violette et or, monocle lumineux, chapeau haut-de-forme orné d'un « A », livre de grammaire flottant |
| Espagnol        | **El Conjugador**       | chevalier masqué en armure rouge et or, cape, éventail-bouclier, médaillon « Ñ » lumineux                                         |
| Physique-chimie | **Docteur Atomix**      | savant-golem en blouse, bras de laboratoire, fiole bouillonnante, atome lumineux en orbite autour de la tête                      |
| Géographie      | **Le Cartographe**      | titan-boussole, corps de globe terrestre doré, cape-carte, rose des vents lumineuse sur la poitrine                               |
| Histoire        | **Le Gardien du Temps** | chevalier-sablier en armure de bronze, sablier lumineux dans le torse, cape aux frises chronologiques                             |

Quand une planche est prête, dépose-la dans `apps/web/assets-src/planches-v2/` avec le nom
indiqué (ex. `lord-grammar-poses.png`) et dis-le-moi : je l'ajoute à la découpe et le boss
remplace le Sorcier π dans sa matière.
