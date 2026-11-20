# 0020 — Version gratuite, abonnement familial annuel, Stripe et simulateur

- Statut : Acceptée
- Date : 2026-11-20

## Décision

- **Version gratuite** : le 1er chapitre de chaque classe dans chaque matière (`isFreeChapter`,
  `@questeo/content`), sans limite d'exercices. Décision produit du 20/11/2026.
- **Abonnement familial** : un paiement unique couvre toute la famille (tous les profils) jusqu'à
  la fin de l'année scolaire (`SCHOOL_YEAR_END`, 31 août par défaut). Payer à moins de
  `PREMIUM_MIN_DAYS` jours (60) de la fin donne l'année suivante. Prix configurable
  (`PREMIUM_PRICE_CENTS`, 24,99 € par défaut). **Pas de renouvellement automatique** : pas de
  carte enregistrée, pas de prélèvement surprise.
- **Droits séparés du moteur de jeu** : le module `billing` répond « ce chapitre est-il
  jouable ? ». Le moteur, les récompenses et le suivi n'en savent rien. Le contrôle est fait au
  serveur au départ d'une série, à chaque réponse (révisions et séances mêlant des chapitres),
  au départ d'un combat de boss et à la création d'une arène. Le client n'affiche qu'un cadenas.
  Refus : HTTP 402 `PREMIUM_REQUIRED`, message pour l'enfant (« demande à tes parents »).
- **État déduit des paiements** : la table `subscriptions` garde tout l'historique (en attente,
  payé, refusé, remboursé). L'accès premium est « un paiement réussi dont la fin est à venir ».
  Aucun drapeau à tenir à jour, aucune incohérence possible.
- **Après expiration**, les progrès, médailles, héros et objets restent intacts et visibles.
  Seul le jeu sur les chapitres payants s'arrête.
- **Prestataires** (`BILLING_PROVIDER`) :
  - `stripe` : Checkout en paiement unique, appelé par `fetch` sans SDK (aucune dépendance
    ajoutée). La création porte une clé d'idempotence. Le webhook signé (HMAC-SHA256,
    tolérance 5 min, comparaison en temps constant) clôt le paiement une seule fois, même rejoué.
  - `simulateur` : page de l'application où l'on choisit « accepté » ou « refusé ». Il est
    **interdit en production** (refus au démarrage) et sert au développement et aux tests de
    bout en bout.
  - `aucun` : valeur par défaut en production tant qu'aucun compte marchand n'est ouvert. Le
    paiement est fermé (503) et la version gratuite fonctionne normalement.
- Paiement réservé au parent (verrou parent) ; un paiement d'une autre famille est introuvable.

## À faire par un humain avant la vente

- Ouvrir le compte Stripe (identité légale, IBAN), créer les clés de **test**, valider le
  parcours, puis seulement passer en clés réelles. Aucune clé n'est dans le dépôt.
- Mentions légales, CGV (droit de rétractation pour un contenu numérique), facturation et TVA :
  à valider juridiquement.
