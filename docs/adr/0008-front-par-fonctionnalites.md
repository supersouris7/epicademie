# 0008 — Front organisé par fonctionnalités

- Statut : Acceptée
- Date : 2026-11-19

## Contexte

Le web était rangé par nature technique (`pages/`, `components/`, `lib/`, `api/`) : pour
comprendre ou modifier le combat de boss, il fallait ouvrir cinq dossiers. Plusieurs fichiers
dépassaient 600 lignes.

## Décision

```
apps/web/src/
  main.tsx            démarrage : fournisseurs (requêtes, animations, routeur), suivi d'erreurs
  app/                application : routes, garde de profil, barrière d'erreur
  features/<domaine>/ une fonctionnalité = ses écrans, ses composants, ses appels API, son état
    index.ts          API publique de la fonctionnalité
  shared/             socle commun, sans fonctionnalité
    api/              client HTTP typé par le contrat
    ui/               composants d'interface (boutons, bulles, cadres, mascotte…)
    question/         affichage et saisie d'une question (figures, pavé, outils)
    battle/           mise en scène de combat (arène, héros, répliques)
    lib/              outils (stockage, sons, dates, sorties de partie, dialogues…)
  design/             design system : jetons, palette, catalogue d'images
```

- Fonctionnalités : `profiles`, `hub`, `training`, `boss`, `arena`, `realtime`, `progress`,
  `settings`.
- Une fonctionnalité n'importe une autre fonctionnalité **que par son `index.ts`** ; `shared/`
  et `design/` n'importent **aucune** fonctionnalité (vérifié par `pnpm arch`).
- Données serveur : React Query (`features/*/api.ts`, appels `request(api.xxx)`), état client
  local : `useState`/`useReducer` ; état global seulement si nécessaire (zustand : profil choisi,
  connexion temps réel).
- Un fichier vise une responsabilité ; au-delà d'environ 400 lignes, on découpe.

## Conséquences

- Supprimer ou réécrire une fonctionnalité touche un seul dossier.
- Les composants partagés sont repérables et réutilisés au lieu d'être dupliqués.
