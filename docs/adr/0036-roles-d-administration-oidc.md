# ADR 0036 — Rôles d'administration et connexion de l'équipe par OpenID Connect

- Statut : Acceptée (remplace [0033](0033-administration-par-operateur.md) une fois la connexion configurée)
- Date : 2026-11-26

## Contexte

Un secret unique, ajouté par un frontal, donnait tous les droits d'administration à qui passait ce
frontal : ni identité vérifiable, ni droits limités, ni révocation individuelle, alors que la console
donne accès à des données d'enfants.

## Décision

- **Identité** : fournisseur OpenID Connect de l'équipe (client confidentiel, code + PKCE S256,
  `state`, `nonce`, portées `openid profile email groups`). Le serveur vérifie l'`id_token`
  (signature RS256, PS256 ou ES256 par les clés publiées, émetteur, audience et `azp`, expiration,
  âge de 10 minutes au plus, `nonce`). Groupes et nom absents du jeton : lus au point `userinfo`,
  pour le même `sub`. Seuls `sub`, nom et rôle sont conservés. Ni mot de passe ni second facteur
  dans l'application : ils relèvent du fournisseur. Des en-têtes d'identité posés par un frontal
  sont écartés : ils se forgent depuis tout processus qui atteint le port du serveur.
- **Rôles** : groupes `epicademie-proprietaire`, `-moderation`, `-pedagogie`, `-lecture` ; plusieurs :
  le premier de cette liste ; aucun : 403. Chaque route d'administration du contrat déclare une
  permission (table dans `@epicademie/shared`, `admin-roles.ts`) ; sans elle, refus.

| Permission                                              | Propriétaire | Modération | Pédagogie | Lecture seule |
| ------------------------------------------------------- | ------------ | ---------- | --------- | ------------- |
| `stats:lire`                                            | oui          | oui        | oui       | oui           |
| `comptes:lire` (recherche, fiche, anomalies par profil) | oui          | oui        | non       | non           |
| `comptes:agir`                                          | oui          | oui        | non       | non           |
| `signalements:lire`                                     | oui          | oui        | oui       | oui           |
| `signalements:traiter`                                  | oui          | oui        | oui       | non           |
| `contenus:lire`                                         | oui          | non        | oui       | oui           |
| `contenus:modifier`                                     | oui          | non        | oui       | non           |
| `finances:lire` (montants, abonnements agrégés)         | oui          | non        | non       | non           |
| `audit:lire` (journal d'audit, journal des erreurs)     | oui          | non        | non       | non           |

Sans `finances:lire`, statistiques et tendances renvoient `null` à la place des montants et des
abonnements. La fiche d'un compte (réservée à `comptes:lire`) garde son historique d'abonnement.

- **Session** : table `admin_sessions` (empreinte du jeton), 12 h au plus, 30 min d'inactivité au
  plus. Rôle relu à chaque connexion ; une connexion avec un autre rôle, ou sans rôle, ferme les
  sessions précédentes de la personne. Un retrait de groupe prend donc effet à la reconnexion,
  au plus tard à l'expiration.
- **Déconnexion** : la session de l'application est fermée et le cookie effacé, puis le navigateur est
  envoyé chez le fournisseur : `end_session_endpoint` de la découverte (RP-Initiated Logout, avec
  `client_id` et `post_logout_redirect_uri`) s'il l'annonce, sinon `<OIDC_ISSUER>/logout?rd=` (cas
  d'Authelia 4.39). Retour sur `<ADMIN_ORIGIN>/admin`, à autoriser chez le fournisseur.
- **Site distinct** : cookie `__Host-epicademie_admin` (Secure, HttpOnly, SameSite=Lax pour le retour
  du fournisseur). Connexion, retour, déconnexion et session ne sont acceptés que si `Host` (et
  `Origin` s'il est présent) correspondent à `ADMIN_ORIGIN` ; `Origin` est obligatoire pour écrire.
- **Bascule** : sans `OIDC_*`, rien ne change (`ADMIN_OPERATOR_SECRET`, rôle propriétaire). Avec les
  quatre variables, le secret d'opérateur est ignoré. Son code sera retiré une fois la connexion
  vérifiée sur chaque environnement.
- **Accès de secours** : désactivé par défaut ; actif seulement si `ADMIN_SECOURS_SECRET` (32
  caractères min.) est défini. En-têtes `X-Epicademie-Secours` et `-Nom`, rôle propriétaire, limité à
  `ADMIN_ORIGIN` s'il est défini ; chaque requête est inscrite au journal.
- **Journal** : `admin_audit` et `content_events` gagnent `admin_sub` ; connexions, déconnexions, refus de rôle
  et requêtes de secours vont dans `admin_access_events`, affichés avec le reste du journal.
- **Base** : migration 0027, ajouts seuls ; retour arrière écrit en tête du fichier et testé.

## Conséquences

- L'administration dépend de la disponibilité du fournisseur (le jeu, non) ; le secours couvre la panne.
- Le frontal du site d'administration doit transmettre `Host` tel quel ; le frontal public doit
  continuer de répondre 404 sur `/admin*`, `/api/v1/admin*` et `/api/v1/admin-auth*`, et retirer les
  en-têtes d'opérateur et de secours reçus d'Internet.
- Réglages du fournisseur : voir [configuration](../operations/configuration.md).

## Options écartées

- Comptes d'administration dans l'application : gestion de mots de passe et de second facteur à refaire.
- En-têtes d'identité du frontal : forgeables en local.
