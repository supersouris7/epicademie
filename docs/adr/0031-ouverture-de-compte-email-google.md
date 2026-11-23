# 0031 — Ouverture de compte : e-mail validé ou Google

Statut : proposée

## Contexte

Un compte avec e-mail (parent, élève de 15 ans ou plus) pouvait être créé avec n'importe quelle adresse, sans preuve
qu'elle appartienne à la personne. Les enfants de moins de 15 ans restent sans e-mail, rattachés au parent.

## Décision

- Deux voies seulement : adresse validée par un lien, ou Google (e-mail vérifié par Google).
- Inscription : compte « non vérifié », aucune session ; jeton à usage unique de 24 h, seule son empreinte SHA-256 est
  stockée (table `email_verifications`). Connexion refusée (`EMAIL_NOT_VERIFIED`) après contrôle du mot de passe.
  Renvoi : un seul lien valable à la fois, un envoi par minute et par compte, plus la limite de débit des routes.
- Envoi derrière l'interface `Mailer` : adaptateur Brevo (API HTTP, clé en variable d'environnement), simulation sans clé
  (lien journalisé ; renvoyé dans la réponse seulement si `APP_ENV` n'est pas `production`). Production sans clé : démarrage refusé.
- Google : OpenID Connect, code + PKCE S256 + `state` + `nonce` (gardés dans un cookie HttpOnly de 10 min), `id_token`
  vérifié avec `jose` contre les clés publiques de Google (`iss`, `aud`, `exp`, `nonce`), `email_verified` exigé. Même
  e-mail = même compte ; un compte jamais validé relié à Google perd son mot de passe (pas de prise de compte par
  pré-inscription).
- Les comptes existants sont vérifiés par la migration 0023 (réversible, voir son en-tête).

## Conséquences

- Un compte Google n'a pas de mot de passe : « Mot de passe oublié » permet d'en définir un (requis pour confirmer les
  actions parent et le PIN).
- Une adresse inscrite mais jamais validée reste réservée jusqu'à validation, Google ou réinitialisation du mot de passe
  (nettoyage des comptes jamais validés : à prévoir).
