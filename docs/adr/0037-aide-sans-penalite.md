# ADR 0037 — Aide sans pénalité, médaille de diamant, aucune comparaison entre enfants

- Statut : Acceptée
- Date : 2026-11-27
- Ticket : #121

## Contexte

Un enfant doit pouvoir demander de l'aide et se tromper sans le vivre comme un échec.

## Décision

- Note de série d'une notion (`skill_states.best_series`) de 0 à 6 : 6 = diamant (tout juste du premier coup,
  sans aide), 5 = or (tout réussi, avec aide ou au second essai), 4 argent, 3 bronze. Le maximum est conservé.
  Migration 0028 : les 5 existants (obtenus sans erreur ni aide) deviennent 6 ; retour arrière documenté.
- `AnswerSubmit.helped` : réponse donnée après un indice ou l'explication (`attempts.hinted`). Elle compte
  comme une réponse normale (score, XP, progression).
- Épreuve du chapitre : indice seulement. « Je n'ai pas compris » ne fait que reproposer la notion le lendemain.
- Boss : `POST /battles/:id/hint` donne l'indice sans objet ; le tir rapporte moins d'XP et la médaille de
  diamant est écartée. L'état de combat passe en version 2 (ADR 0009 : les combats en cours sont clos).
- Classement « Se comparer » supprimé (écran, route `/profiles/:id/ranking`, calcul).
- Défis : questions tirées des seules notions en or ou diamant (choix fait par le client web) ; aucun badge ni
  chapitre ne dépend d'un défi.

## Conséquences

Un profil sans notion en or ou diamant dans la matière est invité à s'entraîner avant de lancer un défi.

## Options écartées

Colonne séparée « sans aide » : la note unique suffit et garantit qu'une médaille ne se perd pas.
