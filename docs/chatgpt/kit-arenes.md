<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Épicadémie — Arènes

5 décors fournis par le client (paysage 16:9, style cartoon, sol dégagé au centre), aucun à générer :

- `environments/arenas/jungle.png` — Arène de la jungle : temple en ruine, cascades, pont de corde et portail de cristal violet
- `environments/arenas/espace.png` — Arène de la station spatiale : pont d’une station spatiale, planète et vaisseaux dans le ciel étoilé
- `environments/arenas/volcan.png` — Arène du volcan : plateforme de pierre fissurée de lave, volcan en éruption
- `environments/arenas/glace.png` — Arène des glaces : lac gelé cerné de cristaux, ruines de glace sous les aurores boréales
- `environments/arenas/academie.png` — Arène de l’académie : parvis de l’académie, bâtiments, banderoles et collines

Chaque décor est décliné en 4 cadrages par `pnpm --filter @epicademie/web assets:arenas` (jamais d'étirement) :

| Suffixe | Final | Proportions | Cadrage |
|---|---|---|---|
| `-portrait` | 1080×1200 | 0.90:1 | cadrage 9:10 (smartphone, fenêtre étroite) : image pleine hauteur, rognée sur les côtés |
| `(aucun)` | 1600×900 | 1.78:1 | décor 16:9 fourni par le client, sol dégagé au centre ; image entière |
| `-large` | 1920×738 | 2.60:1 | cadrage 2,6:1 (tablette, ordinateur) : bande centrée sur l’horizon et le sol |
| `-pano` | 2640×600 | 4.40:1 | panorama 4,4:1 (écran large) : cadrage 2,6:1 prolongé de chaque côté par miroir, flou progressif et assombrissement |

Le jeu mesure le cadre et prend le cadrage dont les proportions sont les plus proches. Au-delà du panorama
(21:9, 32:9, fenêtre très étirée), l'image garde ses proportions, centrée, avec des bords fondus sur un fond
d'ambiance flouté de la même image ; les combattants restent groupés au centre.

Pour changer un décor : déposer le nouveau PNG 16:9 au même nom dans `assets-src/originals/environments/arenas/`, puis relancer le script.
