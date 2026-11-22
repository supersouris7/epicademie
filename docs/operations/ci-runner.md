# Exécuteur CI auto-hébergé (mini-pc)

La CI (`.github/workflows/ci.yml`) tourne sur le runner GitHub Actions « mini-pc » (étiquettes
`self-hosted,linux,x64,questeo`), installé dans `~/actions-runner`, non éphémère, un seul runner.
Raison : jobs hébergés par GitHub indisponibles (quota de facturation).

## Commandes (utilisateur lenovo, sans sudo)

- Démarrer : `~/actions-runner/demarrer.sh` (idempotent ; lancé aussi au boot par cron `@reboot`,
  ligne marquée `# fabrique:ci-runner`).
- Arrêter : `pkill -f actions-runner/bin/Runner.Listener` (un job en cours est interrompu : attendre
  qu'il se termine de préférence).
- État : `gh api repos/supersouris7/questeo/actions/runners --jq '.runners[]|[.name,.status,.busy]'`.
- Mettre à jour : arrêter, télécharger la dernière archive `actions-runner-linux-x64-<v>.tar.gz`
  de github.com/actions/runner/releases, **vérifier sa somme SHA-256** (publiée dans les notes de
  version), l'extraire sur place (`config` conservée), redémarrer. Le runner se met aussi à jour
  seul lors d'une nouvelle version.
- Ré-enregistrer : `gh api -X POST repos/supersouris7/questeo/actions/runners/registration-token`,
  puis `./config.sh --unattended --url … --token … --name mini-pc --labels self-hosted,linux,x64,questeo --replace`.
- Retrait : `./config.sh remove --token <jeton de retrait>` et supprimer la ligne cron.

## Journaux

- Service : `~/actions-runner/_diag/runner-service.log` ; runner : `_diag/Runner_*.log` ;
  jobs : `_diag/Worker_*.log` ; espace de travail : `~/actions-runner/_work`.

## Points d'attention

- Machine partagée (2 CPU, 3 Go) avec les services Docker (questeo, patria, dashmon…) : un seul job à
  la fois, tests web en `--maxWorkers=2`. Le job `quality` (build + e2e 3 profils) est le plus long.
- Aucun port fixe : PostgreSQL de service en port hôte dynamique ; e2e sur 3100 (`E2E_PORT` pour changer).
- Dépôt privé : les workflows de PR venant de forks sont désactivés (réglage du dépôt) et chaque
  job refuse en plus les PR de forks (`if`). Ne jamais activer l'exécution de forks sur ce runner.
- Image Docker publiée en `linux/amd64` seulement (arm64 par QEMU trop lourd ici), sur `main` et
  les étiquettes `v*.*.*`. Secrets `DOCKERHUB_*` inchangés ; masqués dans les journaux par GitHub.
- Espace disque : les jobs nettoient leurs fichiers et `docker image prune -f` ; surveiller `docker system df`.
