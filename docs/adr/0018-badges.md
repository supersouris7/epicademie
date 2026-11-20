# 0018 — Badges calculés à partir des événements, conditions centralisées

- Statut : Acceptée
- Date : 2026-11-20

## Décision

- Toutes les conditions sont dans `packages/engine/src/badges.ts` : six badges (boss vaincus,
  séries parfaites, persévérance, chapitres terminés, notions consolidées, Acad-Héros
  collectionnés), quatre grades (bronze, argent, or, diamant) par seuils.
- Les badges se **calculent** à partir d'événements déjà enregistrés : aucune table d'attribution,
  donc aucune récompense en double possible, et un changement de seuil s'applique à tous.
- Les badges ne donnent ni pièces ni objets (pas d'économie à protéger).
- **Pas d'encouragement à la répétition facile** : une série parfaite compte une fois par notion
  et par jour ; la persévérance compte les erreurs corrigées au second essai ; une notion
  consolidée suppose la répétition espacée sur plusieurs jours ; un chapitre terminé demande
  une médaille sur chacune de ses notions.

## Options écartées

- **Badges stockés à l'obtention** : historique d'obtention, mais risque de doublons et de
  divergence avec les conditions ; non nécessaire aujourd'hui.
