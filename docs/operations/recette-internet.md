# Recette sur Internet (serveur « atelier »)

Une instance de recette, réservée à quelques testeurs, joignable en HTTPS à l'adresse
`https://<IP de l'atelier>`. **Données fictives uniquement** (prénoms inventés). Ce n'est pas la production.

**Mode plateforme de test** (`APP_ENV=recette`, `PASSWORD_MIN_LENGTH=8` dans le `.env`) : on arrive sur
« Se connecter » avec un bouton « Créer un compte » ; l'inscription (e-mail + mot de passe d'au moins 8 caractères)
ouvre un compte actif, connecté aussitôt. **Aucun e-mail** n'est envoyé ni simulé : pas de lien, pas de boîte mail
de test. « Mot de passe oublié » affiche la consigne de demander un nouveau mot de passe à l'administrateur (qui
le réinitialise en base). Le parcours élève autonome est masqué. Adresse déjà utilisée : message clair.

## Architecture

```
Internet ──443/80──▶ Caddy (service système)  ──127.0.0.1:3000──▶ questeo (conteneur)
                     · TLS Let's Encrypt (adresse IP,           └─▶ postgres (réseau interne, jamais publié)
                       profil « shortlived », renouvelé seul)
                     · porte d'accès basic_auth (tout le site, /api, temps réel)
                     · en-têtes de sécurité, journal JSON
```

- **Isolement** : la pile tourne sous l'utilisateur système `recette` (sans sudo, sans mot de passe),
  avec **Docker sans privilèges** (rootless, service utilisateur, `linger`). Aucun accès au Docker
  root ni au répertoire de l'utilisateur d'exploitation de la machine ; le conteneur serveur est en
  lecture seule, sans capacité Linux, `no-new-privileges`.
- **Fichiers** : `~recette/stack/` — `compose.yml` (copie de celui du dépôt, rafraîchie à chaque
  déploiement), `compose.override.yml` (écoute `127.0.0.1:3000` seulement, durcissement),
  `.env` (mode 600 : secrets aléatoires, `APP_ENV=recette`, `TRUST_PROXY=1`, `COOKIE_SECURE=true`,
  `PUBLIC_URL`), `~recette/backups/` (14 dernières sauvegardes de la base).
- **Pare-feu** (ufw) : entrée refusée par défaut ; 22/tcp, 80/tcp, 443/tcp et 443/udp (HTTP/3).
- **fail2ban** : jail `sshd` et jail `caddy-auth` (10 identifiants refusés en 10 min → bannissement
  1 h, doublé à chaque récidive, plafond 1 semaine). Un 401 sans identifiant (première visite) n'est
  pas compté. Le journal est `/var/log/caddy/access.log`.
- **Mises à jour de sécurité** : `unattended-upgrades`, sans redémarrage automatique.
- **Limites applicatives** : `RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` ; avec `TRUST_PROXY=1`,
  l'application lit l'adresse réelle du visiteur dans l'en-tête posé par Caddy.
- **Alertes** (Gotify) : bannissement (au plus une alerte par heure) et application muette
  (contrôle toutes les 5 min, alerte à la 2ᵉ vérification en échec, puis message « rétablie »).

## Déployer

Depuis l'atelier, après chaque fusion sur `main` (une fois l'image `unstable` publiée) :

```bash
~/.claude/fabrique/scripts/deployer-atelier.sh            # sauvegarde, migration, redémarrage, contrôle
~/.claude/fabrique/scripts/deployer-atelier.sh --version  # image et révision en service
```

Le script mémorise l'empreinte de l'image précédente, sauvegarde la base, rejoue la migration puis
vérifie `/api/ready`.

## Retour arrière

```bash
~/.claude/fabrique/scripts/deployer-atelier.sh --retour   # revient à l'image précédente
```

Ne restaure **pas** la base. Si une migration doit être défaite : arrêter la pile, restaurer la
sauvegarde la plus récente de `~recette/backups/` (`pg_restore --clean`), puis `--retour`.

## Ajouter / retirer un testeur

Les comptes sont dans `/etc/caddy/testeurs.conf` (une ligne `nom empreinte-bcrypt`).

```bash
caddy hash-password                       # saisir le mot de passe, copier l'empreinte
sudoedit /etc/caddy/testeurs.conf         # ajouter « nom <empreinte> » ou supprimer la ligne
sudo systemctl reload caddy               # effet immédiat, sans coupure
```

Les accès en clair sont conservés **hors dépôt**, dans le dossier secrets de la fabrique
(`recette-acces.txt`, mode 600). Les transmettre par un canal privé, jamais par ticket ou PR.
Pour couper un testeur : supprimer sa ligne et recharger Caddy.

## En cas d'alerte

- **« ne répond plus »** : `systemctl status caddy` ; `sudo -u recette docker compose -f ~recette/stack/compose.yml ps`
  (avec `DOCKER_HOST=unix:///run/user/<uid de recette>/docker.sock`) ; journaux : `docker compose logs --tail 50 questeo`.
  Application bloquée : `deployer-atelier.sh` (redéploie) ou `--retour`. Certificat : `journalctl -u caddy | grep -i acme`
  (le certificat d'adresse IP dure une semaine et se renouvelle seul ; les ports 80/443 doivent rester ouverts).
- **« bannissement »** : `sudo fail2ban-client status caddy-auth` ; lever un bannissement :
  `sudo fail2ban-client set caddy-auth unbanip <ip>`. Un testeur banni a probablement un mauvais mot de passe.
  Plusieurs bannissements en continu = tentative de force brute : rien à faire, les mots de passe sont forts.
- **Compromission supposée** : `sudo systemctl stop caddy` (coupe l'accès), changer tous les mots de passe,
  recréer la pile (`docker compose down -v` sous `recette` détruit les données fictives).

## Repli si le certificat d'adresse IP n'est plus délivré

Utiliser un nom basé sur l'adresse (`<IP-avec-tirets>.sslip.io`) : remplacer l'adresse en tête du
`Caddyfile` par ce nom (certificat ordinaire), rediriger l'adresse nue vers ce nom, et mettre
`PUBLIC_URL` à jour dans `.env`.

## Contrôles de sécurité (audit du 23/11/2026)

Vérifié : ports exposés (22, 80, 443/tcp, 443/udp seulement ; 2019 et 3000 en local), TLS 1.2/1.3,
certificat d'adresse IP valide (renouvellement seul), porte d'accès sur toutes les routes (chemins
encodés, `//`, `..`, méthodes inhabituelles), limites de débit avec adresse réelle (en-tête
`X-Forwarded-For` du client ignoré), conteneur applicatif sans privilège, Docker sans privilèges
sans accès à l'hôte, `/home/ubuntu` illisible pour `caddy` et `recette`.

Points connus, acceptés (risque faible) :

- une requête dont l'en-tête `Host` n'est pas l'adresse du site reçoit un `200` vide de Caddy
  (aucune transmission à l'application) ;
- la redirection automatique 80→443 renvoie `Server: Caddy` (sans version) ;
- le fail2ban ignore l'adresse de l'atelier lui-même : un test de bannissement doit venir d'ailleurs
  (le filtre se vérifie avec `fail2ban-regex /var/log/caddy/access.log caddy-auth`).
