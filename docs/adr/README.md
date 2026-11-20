# Décisions d'architecture (ADR)

Chaque décision structurante est consignée ici, avec son contexte, la décision, ses conséquences
et les options écartées. Une ADR acceptée ne se modifie pas : une nouvelle ADR la remplace
(statut « Remplacée par NNNN »).

| N°                                         | Décision                                                      | Statut             |
| ------------------------------------------ | ------------------------------------------------------------- | ------------------ |
| [0001](0001-monorepo-modulaire.md)         | Monorepo pnpm, paquets purs et applications par modules       | Acceptée           |
| [0002](0002-postgresql.md)                 | PostgreSQL, PGlite embarqué en développement et en tests      | Acceptée           |
| [0003](0003-migrations.md)                 | Migrations par une commande dédiée avant le démarrage         | Acceptée           |
| [0004](0004-api-versionnee.md)             | Contrat d'API unique, versionné, validé et documenté          | Acceptée           |
| [0005](0005-observabilite.md)              | Journaux structurés, sondes, métriques, suivi d'erreurs       | Acceptée           |
| [0006](0006-temps-reel.md)                 | Temps réel socket.io en mémoire d'une instance                | Acceptée           |
| [0007](0007-qualite.md)                    | Qualité vérifiée en CI : couverture, règles de modules        | Remplacée par 0010 |
| [0008](0008-front-par-fonctionnalites.md)  | Front organisé par fonctionnalités                            | Acceptée           |
| [0009](0009-etat-des-combats.md)           | État des combats stocké versionné et validé                   | Acceptée           |
| [0010](0010-qualite-renforcee.md)          | Qualité en CI : couverture complète, complexité, code mort    | Acceptée           |
| [0011](0011-chaine-d-approvisionnement.md) | Chaîne d'approvisionnement : épinglage, mises à jour, analyse | Acceptée           |

## Modèle

```markdown
# NNNN — Titre

- Statut : Proposée | Acceptée | Remplacée par NNNN
- Date : AAAA-MM-JJ

## Contexte

## Décision

## Conséquences

## Options écartées
```
