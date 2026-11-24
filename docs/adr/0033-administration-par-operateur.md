# ADR 0033 — Administration par opérateur et consultation des comptes

## Contexte

La console `/admin` exigeait un compte de jeu au rôle `admin` et une session de 15 minutes
(mot de passe redemandé). Le responsable produit se retrouvait renvoyé vers « Je suis un élève /
un parent » et l'administration était liée à un compte de famille. L'exploitation dispose déjà
d'une page de pilotage réservée (port dédié derrière un frontal : authentification HTTP + blocage
des échecs répétés) qui affiche la console dans un onglet de même origine.

## Décision

- **Opérateur** : le frontal du port de pilotage ajoute `X-Epicademie-Operateur: <secret>` et
  `X-Epicademie-Operateur-Nom: <identifiant>`. Le serveur reconnaît l'opérateur si le secret
  (`ADMIN_OPERATOR_SECRET`, 32 caractères min., comparaison en temps constant) correspond. L'opérateur
  n'a **que** les droits d'administration : aucune famille, aucun profil, aucun cookie lu. Secret
  absent = aucune administration ; trop court = refus de démarrer. Le nom est assaini (contrôles
  retirés, 40 caractères) avant d'entrer dans les journaux.
- Les routes `admin` du contrat exigent l'opérateur (403 sinon). La vérification d'origine (CSRF)
  reste appliquée aux requêtes non sûres.
- **Retraits** : rôle `admin` des comptes (contrainte SQL `role = 'parent'`), session admin
  (`/auth/admin`, `/auth/admin/close`, `auth_sessions.admin_until`), commande `admin role`.
  Migration 0025 : comptes admin repassés en `parent` ; `content_events.account_id` remplacé par
  `operator` (nom) ; retour arrière dans l'en-tête du fichier SQL.
- **Web** : `/admin` est rendue avant toute logique de session de jeu ; elle interroge
  `GET /admin/session` (`{ operator }` ou 403 → message « Administration accessible uniquement depuis
  la page de pilotage. »).
- **Comptes** (module serveur `admin`) : recherche `POST /admin/accounts/search` (e-mail, identifiant de
  famille, prénom, partielle, sans casse ni accents ; filtres type et état ; tri création ou activité),
  25 lignes par page, page ≤ 400 (jamais de liste non bornée, total et page suivante renvoyés) ;
  fiche `GET /admin/accounts/:id` (résumés : compte, profils, parties récentes, signalements, démarches
  en cours, abonnement ; jamais d'empreinte, de jeton ni de réponses détaillées) ; mot de passe
  temporaire `POST /admin/accounts/:id/password-reset` (12 caractères lisibles, montré une fois,
  sessions du compte fermées, refusé pour un élève autonome).
- **Audit RGPD** : table `admin_audit` (opérateur, action, compte, date ; sans clé étrangère, la trace survit
  à la suppression du compte). Chaque ouverture de fiche et chaque réinitialisation y figure ; lecture
  paginée par `POST /admin/audit`. Le mot de passe temporaire n'y est jamais écrit.

## Conséquences

- Sécurité : la protection repose sur le frontal (authentification, blocage d'IP) **et** sur le secret ;
  le frontal public doit répondre 404 sur `/admin` et `/api/v1/admin` et retirer ces en-têtes reçus
  d'Internet. Le secret se change par simple redéploiement (pas de session à révoquer).
- Pas d'état « suppression en attente » : la suppression d'un compte est immédiate ; la fiche
  indique les démarches en cours (invitation, liens envoyés).
- La recherche utilise `like` sur colonnes normalisées (pas d'extension PostgreSQL) : adaptée à
  quelques dizaines de milliers de comptes ; au-delà, ajouter un index trigramme.
