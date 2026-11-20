# 0021 — QG, salle des trophées et cosmétiques

- Statut : Acceptée
- Date : 2026-11-20

## Décision

- **Mon QG** (`/qg`) montre :
  - le héros en pied dans son décor, avec son cadre et son titre ;
  - une **vitrine** de 3 trophées au choix ;
  - la **salle des trophées** : boss vaincus, badges obtenus, Acad-Héros trouvés ;
  - la **personnalisation**.
- **Trophées déduits** des données déjà enregistrées (boss vaincus, badges, collection de héros).
  Rien n'est attribué en double, rien n'est à tenir à jour.
- **Cosmétiques** (catalogue `COSMETICS`, `@questeo/shared/hq.ts`) : décors, cadres et titres,
  **sans aucun avantage de jeu**. On les obtient de trois façons :
  - offerts au départ ;
  - **achetés en rubis ou en pièces gagnés en jouant**, jamais avec de l'argent réel. Cela donne
    enfin un usage aux rubis, qui restent rares (ADR 0019) ;
  - **débloqués par un badge** : récompenses d'apprentissage (boss, persévérance, notions
    consolidées…), jamais à vendre.
- **Rendu en CSS** (dégradés et couleurs) : pas de dépendance à de nouvelles images. Des décors
  illustrés pourront s'ajouter quand l'utilisateur fournira les visuels (direction artistique :
  images générées par l'utilisateur).
- **Contrôles serveur** :
  - l'achat se fait en une transaction (solde vérifié dans la requête, pas de double achat) ;
  - l'aménagement est validé : bon emplacement, cosmétique débloqué, trophées gagnés et
    distincts.

## Conséquences

- Ajouter un cosmétique = une entrée du catalogue (plus éventuellement un visuel). Aucune
  migration.
- Tables `owned_cosmetics` (achats seulement) et `hq_layouts` (migration 0007).
