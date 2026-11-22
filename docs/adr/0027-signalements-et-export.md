# 0027 — Signalements généraux, erreurs agrégées, anonymisation et export

- Statut : Acceptée
- Date : 2026-11-22

## Contexte

Les retours des familles (bug, son, affichage, difficulté) n'avaient pas de canal hors question, et
les erreurs du navigateur n'étaient que journalisées. L'équipe veut les transformer en tickets sans
que l'application envoie quoi que ce soit à l'extérieur, et sans donnée d'enfant dans les tickets.

## Décision

- **Même table** `question_reports` : colonne `kind` (`question` | `general`), `screen`,
  `app_version`, `exported_at` ; notion, niveau, graine et version deviennent nuls pour un
  signalement général (contrainte : une question a toujours sa notion). Même vue admin.
- **Erreurs** : table `client_errors`, une ligne par empreinte (SHA-256 de message normalisé +
  première ligne de pile + version) avec compteur ; nombres, identifiants, e-mails et liens
  normalisés. Aucun lien avec une famille ou un profil.
- **Anonymisation serveur avant stockage** (`core/anonymize.ts`) : e-mails, téléphones, liens et
  pseudos des profils de la famille de l'auteur (mots entiers, sans casse ni accents) → « [masqué] ».
  L'écran est normalisé (identifiants → `:id`, pas de paramètres).
- **Export par CLI** (`server/dist/reports.js export | mark-exported <id…>`) : JSON sur stdout,
  doublons fusionnés avec compteur, identifiants de profil/famille jamais exportés. Le marquage
  « exporté » est une commande distincte, lancée après la création des tickets. Une erreur déjà
  exportée dont le compteur augmente ensuite n'est pas ré-exportée.

- **Durcissement (revue sécurité)** : l'export ré-applique l'anonymisation à chaque ligne (lignes
  antérieures à 0018 comprises) et neutralise `@` et `#<n>` (mentions/références GitHub) ; l'écran
  est limité aux routes connues de l'appli (sinon `/autre`) et la version à un jeton court ; les
  messages et piles d'erreur sont purgés des jetons (Bearer, JWT, chaînes de 16 caractères ou
  plus), plafonnés à 300 caractères ; 50 signalements par jour et par famille (429 au-delà) ;
  `client_errors` bornée à 5000 empreintes non exportées (ensuite, seuls les compteurs montent).

## Conséquences

- Aucune dépendance sortante ; l'export est piloté depuis l'hôte (cron, chef de projet).
- Le filtrage des prénoms ne couvre que les pseudos de la famille : un prénom tiers dans un
  commentaire libre passe (l'interface invite à ne rien écrire de personnel).
- Retour arrière de la migration 0018 : voir l'en-tête du fichier SQL.

## Options écartées

- Envoi direct vers GitHub par l'application : sortie réseau et risque de fuite de données.
- Table séparée pour les signalements généraux : deux vues admin et deux exports.
