# Déploiement

## Image

`docker.io/<compte>/questeo` — `unstable` (chaque commit de `main` dont la CI passe), `X.Y.Z`,
`X.Y`, `X`, `latest` (tags `vX.Y.Z`). Une seule image pour deux usages :

- serveur : commande par défaut (`node server/dist/main.js`) ;
- migration : `node server/dist/migrate.js` (s'arrête une fois la base à jour).

## Une machine (Docker Compose)

```bash
cp .env.example .env    # POSTGRES_PASSWORD obligatoire
docker compose up -d    # db (sain) → migrate (terminé) → questeo
curl -s http://localhost:3000/api/ready
```

Mise à jour : `docker compose pull && docker compose up -d` (la migration se rejoue, sans effet
si la base est à jour, avant le redémarrage du serveur).

## Cloud (hébergeur UE)

1. PostgreSQL managé (sauvegardes quotidiennes + restauration à un instant donné, chiffrement).
2. Tâche de migration (même image, commande `migrate.js`) exécutée à chaque déploiement, avant
   les instances.
3. Instances du serveur derrière un répartiteur TLS : sondes `/api/health` (vivacité) et
   `/api/ready` (disponibilité), `TRUST_PROXY=1`, `METRICS_TOKEN` défini.
4. Temps réel : une instance, ou affinité de session (voir [ADR 0006](../adr/0006-temps-reel.md)).

## Sauvegardes

- Compose : `docker compose exec db pg_dump -U questeo -Fc questeo > questeo-$(date +%F).dump` ;
  restauration : `pg_restore -U questeo -d questeo --clean questeo-AAAA-MM-JJ.dump`.
- Tester la restauration régulièrement (une sauvegarde non restaurée n'est pas une sauvegarde).
