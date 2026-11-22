# 0026 — Élève de moins de 15 ans : compte autonome sans donnée personnelle

- Statut : Acceptée
- Date : 2026-11-22
- Ticket : #44

## Contexte

Un enfant doit pouvoir installer l'application seul. Le RGPD (art. 8) et la loi française
(art. 45 de la loi Informatique et Libertés) exigent le consentement d'un parent pour traiter
les données d'un mineur de moins de 15 ans. Plutôt que de collecter puis de faire valider, on
ne collecte **rien de personnel** sous 15 ans, et on réserve à un parent tout ce qui engage
(paiement, suivi à distance).

## Décision

- **Accueil** : « Je suis un parent » / « Je suis un élève ». L'élève indique son âge.
  L'âge oriente le parcours et n'est **jamais stocké** (le serveur le revérifie : au plus 14).
- **15 ans et plus** : compte complet (e-mail + mot de passe), comme un parent.
- **Moins de 15 ans** : _famille autonome_ (`families.autonomous`), compte sans e-mail ni mot
  de passe (`accounts.email` et `password_hash` deviennent facultatifs), un profil
  (pseudo, avatar, classe ; ni genre ni naissance).
- **Récupération** : code de 16 symboles (alphabet de 31, ≈ 79 bits) tiré par `crypto.randomInt`,
  montré une seule fois ; seule son empreinte SHA-256 est stockée (`accounts.recovery_hash`).
  Entropie suffisante pour un hachage rapide et une recherche indexée. L'élève peut en générer
  un nouveau (l'ancien cesse de valoir). Sans le code, la session de l'appareil reste valable.
- **Accès restreint** : tant qu'aucun parent n'a rattaché le compte, `access: 'parent'` est refusé
  (« Demande à un parent »), donc ni paiement, ni création de profils, ni Espace parent ; le
  contenu gratuit reste jouable.
- **Rattachement** : l'élève génère une invitation (`family_invites`) : code de 8 symboles
  (≈ 40 bits), 24 h, usage unique, une seule active par famille, empreinte seule stockée. Le
  parent la saisit dans son Espace parent (`POST /family/join`). Dans une transaction, les
  profils passent dans la famille du parent (progression intacte) puis la famille autonome
  (compte, sessions, invitations) est supprimée. L'appareil de l'élève perd alors sa session :
  il joue désormais depuis le compte du parent.
- **Sécurité** : les routes de récupération, d'invitation et de rattachement utilisent la limite
  de débit par IP des routes sensibles (`authRateLimitMax`) ; réponse unique pour code faux,
  expiré ou déjà utilisé ; isolation par famille inchangée ; aucun code, pseudo ni donnée
  personnelle n'est journalisé.
- **Information** : section « Données personnelles » dans la page « À propos ».

## Conséquences

- `Me.account.email` devient nullable ; `Me.family.autonomous` indique le mode restreint.
- Un code de récupération perdu = compte perdu (pas d'e-mail pour le renvoyer) : l'élève est
  invité à le noter ; la limite est assumée.
- L'invitation de 40 bits repose sur la limite de débit et la durée de 24 h.

## Options écartées

- Demander l'e-mail d'un parent à l'inscription : collecte une donnée tierce, friction.
- Stocker la date de naissance : inutile pour décider, donnée en plus.
- Garder l'appareil connecté après rattachement : exigerait de conserver un compte sans
  parent dans la famille du parent (rôle spécial à gérer partout).
