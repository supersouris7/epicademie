# 0032 — Ouverture de compte : e-mail validé ou Google

Statut : proposée

## Contexte

Un compte avec e-mail (parent, élève de 15 ans ou plus) pouvait être créé avec n'importe quelle adresse, sans preuve
qu'elle appartienne à la personne. Les enfants de moins de 15 ans restent sans e-mail, rattachés au parent.

## Décision

- Deux voies seulement : adresse validée par un lien, ou Google (e-mail vérifié par Google).
- Inscription : compte « non vérifié », aucune session ; jeton à usage unique de 24 h, seule son empreinte SHA-256 est
  stockée (table `email_verifications`). Connexion refusée (`EMAIL_NOT_VERIFIED`) après contrôle du mot de passe.
  Renvoi : un seul lien valable à la fois, un envoi par minute et par compte, plus la limite de débit des routes.
- Validation : le lien ne suffit pas, l'écran demande aussi le mot de passe du compte (`POST /auth/email/verify`
  `{ token, password }` ; mot de passe faux = 401, lien non consommé). Un tiers qui a posé l'adresse d'autrui avec
  son mot de passe ne peut donc pas la faire valider à la place du titulaire, qui n'a pas ce mot de passe : il passe par
  « Mot de passe oublié », qui valide aussi l'adresse, remplace le mot de passe et annule le lien de validation en attente.
- Pas d'énumération : l'inscription répond pareil (201, même corps, même message d'interface « Si cette adresse peut
  être utilisée… ») que l'adresse soit libre, en attente ou déjà validée. Si le compte existe, l'adresse reçoit un e-mail
  d'information (sans lien) et le compte n'est pas modifié ; le hachage du mot de passe est fait dans tous les cas.
  Aucune réponse ne contient jamais de lien (retiré avec la boîte mail de test).
- Temps de réponse : tous les e-mails (inscription, renvoi, mot de passe oublié) partent en tâche détachée
  (`detachedMailer`) : la route n'attend pas Brevo. Une erreur d'envoi est journalisée (`mail_send_failed`, nature de
  l'erreur seulement : ni adresse, ni lien, ni contenu).
- Envoi derrière l'interface `Mailer` : adaptateur Brevo (API HTTP, clé en variable d'environnement), simulation sans clé
  (lien journalisé seulement, développement). Production sans clé : démarrage refusé.
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

## Addendum — plateforme de test sans e-mail (ticket #90, remplace la boîte mail de test #88)

`APP_ENV=recette` : aucun e-mail n'existe (le `Mailer` est un garde-fou qui échoue s'il est appelé). L'inscription crée
un compte déjà validé (`email_verified_at` posé) et ouvre la session (`status: 'active'`) ; la connexion d'un compte
antérieur non validé l'active. « Mot de passe oublié » et la réinitialisation répondent 403 avec la consigne
« demandez votre nouveau mot de passe à l'administrateur ». La boîte mail de test (route, page, mémoire, `simulatedMail`,
lien dans les réponses) est supprimée.

**Choix assumé** : l'anti-énumération ci-dessus ne s'applique **qu'en production**. Sur la plateforme de test (testeurs
connus, données fictives), une adresse déjà prise répond 409 « Cette adresse a déjà un compte : connectez-vous. » :
c'est plus utile qu'un message neutre sans e-mail pour l'expliquer. En production, rien ne change.

La longueur minimale du mot de passe est réglable (`PASSWORD_MIN_LENGTH`, défaut 12 ; 8 en recette), contrôlée par le
serveur (inscription, réinitialisation) ; `/auth/options` expose `passwordMinLength` et `recette` à l'interface.
