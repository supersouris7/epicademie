# 0006 — Temps réel socket.io en mémoire d'une instance

- Statut : Acceptée
- Date : 2026-11-19

## Contexte

La présence (qui est connecté), les messages prédéfinis et l'arène (tour par tour) reposent
sur socket.io. Leur état est éphémère (secondes ou minutes).

## Décision

- L'état temps réel vit **en mémoire de l'instance** (`modules/realtime`), derrière des
  interfaces étroites (`Presence`, `createArenas`).
- Chaque message client → serveur est **validé** par un schéma Zod partagé et **limité en
  débit** par connexion ; les événements sont typés (`ClientToServerEvents`,
  `ServerToClientEvents`).
- Connexion **authentifiée** dans un intergiciel (profil existant, pas déjà ouvert ailleurs) ;
  refus transmis au client par `connect_error`. Seules les pages du même domaine (ou de
  `CORS_ORIGINS`) peuvent se connecter.

## Conséquences et limite connue

- Tant que le temps réel tourne sur **une seule instance**, c'est correct. Pour plusieurs
  instances : adaptateur socket.io Redis (diffusion entre instances) et présence/arènes dans
  Redis, ou affinité de session sur le répartiteur. Les interfaces actuelles permettent ce
  remplacement sans toucher aux appelants.
