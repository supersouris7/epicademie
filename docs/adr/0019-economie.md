# 0019 — Équilibrage de l'économie : paramètres réunis, simulation, Acad-Héros en coffres

- Statut : Acceptée
- Date : 2026-11-20

## Décision

- **Paramètres réunis** dans `packages/engine/src/economy.ts` (`ECONOMY`) : contenu des coffres par
  rareté, seuils de rareté, effet du sans-faute, chance de trouver un Acad-Héros, conversion des
  doublons. Les prix de la boutique (`ITEM_PRICES`, `RUBY_PRICE` = 2 000 pièces, inchangés) et le
  barème d'XP (`xp.ts`) restent dans leurs modules.
- **Acad-Héros** : uniquement dans les coffres (décision produit du 20/11/2026). Chaque joueur
  garde son héros actuel comme héros de départ (migration 0005, aucune perte) ; un nouveau profil
  a pour héros de départ celui de sa création. Un coffre rare (4 %) ou épique (25 %) peut contenir
  un héros manquant ; s'ils sont tous trouvés, le doublon devient 60 pièces. Un héros non trouvé
  ne peut pas être porté (refus côté serveur). Aucun avantage de jeu : liste plate, purement
  cosmétique, jamais à vendre.
- **Simulation** (`economy.test.ts`, bloquante en CI) : 300 joueurs fictifs × 150 jours de classe,
  plusieurs profils (régulier 75 % de réussite et 2 séries/jour ; en difficulté 35 % et 1 série ;
  intensif 90 % et 4 séries). Résultats médians :

  | Profil        | Pièces par série | Rubis par mois | Collection complète |
  | ------------- | ---------------- | -------------- | ------------------- |
  | Régulier      | ≈ 29             | ≈ 6            | ≈ 3 semaines        |
  | En difficulté | ≈ 25             | ≈ 3            | ≈ 7 semaines        |
  | Intensif      | ≈ 31             | ≈ 13           | ≈ 12 jours          |

  Contrôles : pas d'inflation (10 à 60 pièces par série), un objet vaut moins de 5 séries, un rubis
  acheté demande plus de 30 séries, pas de blocage pour un élève en difficulté, jouer plus rapporte
  plus mais pas plus par série (rapport < 2), aucun héros à vendre.

## Conséquences

- Toute modification d'un paramètre est vérifiée par la simulation avant fusion.
- Les skins et éléments cosmétiques (QG, P2) suivront le même principe : gagnés ou achetés en
  pièces, jamais d'avantage de jeu.
