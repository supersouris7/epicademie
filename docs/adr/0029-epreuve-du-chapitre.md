# 0029 — Épreuve du chapitre : validation du chapitre, coffre et trophée

- Statut : Acceptée
- Date : 2026-11-22
- Ticket : #92

## Contexte

Finir un chapitre en Entraînement ne rapportait rien. Décision du client : « Tout le chapitre » devient
« Épreuve du chapitre » ; réussie à 80 % ou plus, elle valide le chapitre et rapporte un coffre spécial
(meilleure rareté, ouvert tout de suite) et un trophée visible dans Mes progrès.

## Décision

- Épreuve = partie d'entraînement marquée `sessions.epreuve` (`POST /sessions` avec `epreuve: true`,
  mode entraînement, `skillId` nul, chapitre existant de la matière annoncée, sinon 400). Série mélangée
  de 10 questions (`EPREUVE_LENGTH`) sur les notions du chapitre ; une réponse hors chapitre est refusée.
- Validation **côté serveur** à la fin de la partie : au moins 10 questions et au moins 80 % de bonnes
  réponses du premier coup, calculé sur les réponses enregistrées (`epreuvePassed`, moteur). Le client ne
  fournit jamais le score.
- Récompense unique : table `chapter_rewards` (migration 0020, clé primaire profil + chapitre,
  suppression en cascade avec le profil). L'insertion `ON CONFLICT DO NOTHING` dans la transaction de fin
  de partie décide seule qui reçoit le coffre : deux fins simultanées ou une épreuve rejouée ne donnent
  jamais deux coffres « chapitre ». Une épreuve rejouée et réussie reste « réussie », sans nouveau coffre
  « chapitre » (le coffre habituel d'une série sans faute reste possible).
- Coffre « chapitre » : rareté légendaire (la meilleure), remis par `grantChest` dans la même
  transaction ; affiché par `ChestReveal` (célébration existante) avec un bandeau « Chapitre validé ! ».
- Épreuve ratée : pas de coffre ; le bilan donne la notion la plus ratée (`epreuve.weakestSkillId`) avec un
  bouton d'entraînement.
- Trophées : `GET /profiles/:id/chapter-trophies` ; Mes progrès affiche les chapitres de la classe jouée
  (et ceux déjà validés), grisés tant que l'épreuve n'est pas réussie.
- Retour arrière de la migration : `DROP TABLE chapter_rewards; ALTER TABLE sessions DROP COLUMN epreuve;`.

## Options écartées

- Nouveau mode de jeu `epreuve` : touche tous les écrans de modes pour un simple drapeau.
- Valider avec le score envoyé par le client : triche triviale.
- Réutiliser la médaille « bronze partout » (`learning`) : calcul sans lien avec une épreuve ni récompense unique.
