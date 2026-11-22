# 0028 — Recommandation de travail d'un parent à son enfant

- Statut : Remplacée — décision du client du 22/11/2026 (#94) : le parent ne crée plus aucun entraînement
  (ni recommandation, ni séance ciblée). Table supprimée par la migration 0021 ; l'Espace parent est en lecture
  seule (synthèse, cartes matière, « À réviser »).
- Date : 2026-11-22
- Ticket : #75

## Contexte

Un parent veut orienter le travail de son enfant. Décision du client : une recommandation = **une notion
et un petit mot** (140 caractères), pas de texte libre long, pas de messagerie.

## Décision

- Table `recommendations` (migration 0019, réversible par `DROP TABLE`), rattachée au profil de l'enfant
  (suppression en cascade). États : `en-attente`, `faite`, `annulee`. 3 recommandations en attente au plus
  par enfant (vérifié dans une transaction qui verrouille la ligne du profil), une seule par notion.
- Contrat dans `packages/shared/src/recommendations.ts` (zod) : le mot est nettoyé (espaces), vide = absent,
  140 caractères au plus (aussi contrôlé par une contrainte de la base).
- Accès : création, annulation et vue « famille » réservées au parent (verrou de l'Espace parent) ; l'enfant
  lit seulement les recommandations **en attente de son profil**. Tout profil d'une autre famille répond 404
  (même règle que les autres modules). Une recommandation annulée ou faite ne se rouvre pas.
- « Faite » : à la fin d'une série d'entraînement sur cette seule notion, la transaction de fin de partie
  marque la recommandation (date, bonnes réponses du premier coup sur réponses). Pas de bonus de récompense
  pour éviter qu'un enfant ou un parent « fabrique » des gains.
- Le mot du parent n'est jamais écrit dans les journaux ni cité dans une erreur : les journaux Fastify ne
  consignent pas les corps de requête, aucun message d'erreur ne le reprend. Il n'est pas anonymisé
  (`core/anonymize.ts`) : il circule seulement entre le parent et son enfant, jamais vers l'extérieur ni
  vers d'autres familles ou l'administration.
- Suggestions côté Espace parent : notions à retravailler et « à travailler » du suivi (`LearningReport`),
  proposées en premier dans la matière choisie.

## Conséquences

Pas de notification : l'enfant la voit à l'accueil. Une notion de boss ne peut pas être recommandée (seulement
les notions d'entraînement). Extension possible plus tard : plusieurs notions, date souhaitée.
