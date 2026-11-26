# Déploiement

## Image

`docker.io/<compte>/epicademie` — `unstable` (chaque commit de `main` dont la CI passe), `X.Y.Z`,
`X.Y`, `X`, `latest` (tags `vX.Y.Z`). Une seule image pour deux usages :

- serveur : commande par défaut (`node server/dist/main.js`) ;
- migration : `node server/dist/migrate.js` (s'arrête une fois la base à jour).

L'image part de `node:24-slim` épinglée par empreinte, sans npm ni corepack, et n'est publiée que
si l'analyse de sécurité (Trivy) ne trouve aucune faille grave corrigeable. Pour obtenir une
nouvelle image de base, accepter la PR Dependabot correspondante.

## Une machine (Docker Compose)

```bash
cp .env.example .env    # POSTGRES_PASSWORD obligatoire
docker compose up -d    # db (sain) → migrate (terminé) → epicademie
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

- Compose : `docker compose exec db pg_dump -U questeo -Fc questeo > epicademie-$(date +%F).dump` ;
  restauration : `pg_restore -U questeo -d questeo --clean epicademie-AAAA-MM-JJ.dump`.
- Tester la restauration régulièrement (une sauvegarde non restaurée n'est pas une sauvegarde).

## Comptes

- **Administration** : plus de compte administrateur. Définir `ADMIN_OPERATOR_SECRET` (32 caractères
  min.) et faire ajouter par le frontal de la page de pilotage (port réservé, authentifié) les
  en-têtes `X-Epicademie-Operateur: <secret>` et `X-Epicademie-Operateur-Nom: <identifiant>` ; le frontal
  public doit bloquer `/admin` et `/api/v1/admin` (404) et ne jamais transmettre ces en-têtes reçus
  d'Internet. Voir [ADR 0033](../adr/0033-administration-par-operateur.md). Ce mode est remplacé par la
  connexion de l'équipe ([ADR 0036](../adr/0036-roles-d-administration-oidc.md),
  [configuration](configuration.md)) dès que celle-ci est configurée ; le frontal public bloque aussi
  `/api/v1/admin-auth` et retire les en-têtes `X-Epicademie-Secours*`.
- **Profils de la bêta** (créés avant les comptes) : conservés en base, sans famille, invisibles
  tant qu'ils ne sont pas rattachés. Après la migration, créer le compte familial depuis
  l'application, puis :
  `docker compose run --rm epicademie node server/dist/admin.js rattacher <email>`.
  Tous les profils sans famille (avec leurs progrès) rejoignent cette famille ; les profils des
  autres familles ne sont pas touchés.
- **E-mails** : aucun fournisseur branché ; les demandes de mot de passe oublié sont journalisées
  sans contenu. Choisir un fournisseur avant l'ouverture au public.
