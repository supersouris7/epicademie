# ADR 0038 — Progrès personnel, sens des matières, ressenti de fin de séance

- Statut : Acceptée
- Date : 2026-11-27
- Ticket : #121

## Contexte

Un enfant doit voir ses efforts et son chemin sans être comparé à d'autres, et savoir pourquoi il apprend.

## Décision

- `GET /profiles/:id/journey` (calcul pur `@epicademie/engine/journey`, à partir des réponses déjà enregistrées) :
  - un progrès = réussite des premières réponses des 7 derniers jours plus haute qu'avant (au moins 4 réponses de
    chaque côté, 10 au plus) ; les reculs ne sont pas montrés ; ni réponses à plusieurs ni Arène d'évaluation ;
  - efforts de la semaine : séries terminées, jours, notions retravaillées, reprise après 7 jours de pause.
- Épreuve du chapitre : avant 80 %, le bilan nomme l'étape franchie (affichage seulement).
- Sens : champ facultatif `Skill.sens` (4 types, phrase, source du registre, citation) ; les phrases de
  mathématiques du CM1 à la 6e sont rattachées dans `maths/sens.ts`.
- « Je me sens capable ? » : `POST /sessions/:id/feeling` (1 à 3), colonne `sessions.feeling` (migration 0029,
  nullable). Aucune autre donnée ; suit la partie dans l'export et l'effacement de la famille.

## Conséquences

La question n'est posée qu'après les séries d'entraînement (ni boss, ni défis).

## Options écartées

Instantanés quotidiens de maîtrise : l'historique des réponses suffit.
