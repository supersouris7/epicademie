# 0013 — Suivi des apprentissages : réponses détaillées, maîtrise sans aide, données minimales

- Statut : Acceptée
- Date : 2026-11-20

## Contexte

Le parent doit voir ce que l'enfant maîtrise vraiment, ce qu'il doit retravailler et comment il
progresse. Jusqu'ici, seule la première réponse de chaque question était enregistrée, sans
distinguer l'aide reçue ; le second essai (après l'indice) n'arrivait pas au serveur.

## Décision

- **Chaque réponse** (table `attempts`) garde : joueur, partie (donc mode, matière, chapitre),
  notion, niveau, graine, **version de la notion**, réponse, correction, **numéro d'essai**
  (1 ou 2), **aide affichée** (indice d'entraînement, objet « indice » en combat), **réponse
  collective** (TV, raid : jamais attribuée à l'enfant), **erreur typique reconnue**, date,
  durée.
- **Maîtrise personnelle** : calculée uniquement sur les premières réponses individuelles sans
  aide. Les réussites avec aide et les réponses collectives sont comptées à part.
- **État pédagogique par notion**, en mots, sans pourcentage affiché : pas encore commencée, à
  travailler, en progression, à consolider, acquise (règles dans
  `packages/engine/src/learning.ts`, testées). Base : les 10 dernières premières réponses, au
  moins 4 pour juger ; « acquise » demande en plus la validation par la répétition espacée.
- **Rapport** (`GET /api/v1/profiles/:id/learning`) : notions, chapitres, matières, notions à
  retravailler, révisions dues, erreurs récurrentes, 8 dernières semaines. Calculé à la demande
  (pas de tables d'agrégats à maintenir) sur au plus un an et 5 000 réponses.
- **Historique conservé** : une notion modifiée change de version ; les anciennes réponses
  gardent la leur.

## Données minimales

Aucune donnée d'identité dans les réponses. La **durée** est gardée parce qu'elle sert au bonus
de vitesse et au rythme conseillé ; la **réponse** donnée sert à reconnaître les erreurs
typiques. Rien d'autre (pas d'appareil, pas de position, pas de traçage hors du jeu).

## Conséquences

- Le tableau de bord parent et le moteur adaptatif lisent le même rapport.
- Le second essai coûte une requête de plus par erreur (négligeable).

## Options écartées

- **Pourcentage de maîtrise** : pseudo-précision trompeuse pour un parent ; des états en mots
  suffisent.
- **Agrégats précalculés** : rapides mais à maintenir cohérents ; inutiles à ce volume.
