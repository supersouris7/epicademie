# 0023 — Raid coopératif et mode TV

- Statut : Acceptée
- Date : 2026-11-20

## Décision

- **Raid** : variante coopérative de l'arène (même salon, mêmes invitations, même tour de rôle,
  même reconnexion de 30 s). Toute l'équipe (2 à 4 joueurs) affronte un boss.
  - Le boss a 3 PV par joueur ; l'équipe a 2 cœurs par joueur (au moins 3).
  - Bonne réponse : le boss perd 1 PV. Erreur ou temps écoulé : l'équipe perd 1 cœur.
  - Victoire **de toute l'équipe** quand le boss tombe. Défaite sans cœurs, ou après 40 tours.
  - Personne n'est éliminé. Un joueur qui part sort du tour de table **sans pénalité** pour
    l'équipe.
  - Règles pures dans `@questeo/engine/raid.ts`. L'orchestration reste dans
    `modules/realtime/arena.ts` (`kind: 'duel' | 'raid'`).
- **Mode TV** (`/tv`) : un écran partagé (télévision, ordinateur branché), connecté au compte
  familial **sans profil**. Il affiche en grand :
  - l'arène ou le raid en cours de la famille (joueurs, question, figure, propositions,
    minuteur, boss et cœurs) ;
  - chacun répond sur son téléphone, qui sert de manette.

  Côté serveur :
  - la connexion temps réel accepte `{ tv: true }` (session de la famille vérifiée par cookie) ;
  - l'écran rejoint la diffusion `tv:<famille>` et ne reçoit **que** les parties de sa famille ;
  - aucun message de jeu n'est accepté d'un écran TV.

- **Suivi des apprentissages** : les réponses d'arène, de raid et du mode TV ne sont pas
  enregistrées comme maîtrise personnelle (ADR 0013 : le jeu collectif ne compte pas).

## Conséquences

- Le quiz plateau à buzzer reste « à venir » ; il réutilisera la diffusion TV.
- L'état reste en mémoire de l'instance (ADR 0006). Le passage à plusieurs instances
  demandera un adaptateur socket.io partagé, y compris pour les salles `tv:`.
