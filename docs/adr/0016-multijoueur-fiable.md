# 0016 — Multijoueur fiable : reconnexion, changement d'appareil, expiration

- Statut : Acceptée (complète [0006](0006-temps-reel.md))
- Date : 2026-11-20

## Contexte

En famille, les tablettes passent en veille et le Wi-Fi saute. Jusqu'ici, une connexion perdue
éliminait aussitôt le joueur de l'arène, et un salon jamais lancé restait ouvert indéfiniment.

## Décision

- **Délai de reconnexion** de 30 s (`ARENA_GRACE_MS`) : le joueur reste dans l'arène, marqué
  « Déconnecté… » chez les autres ; son tour continue de s'écouler (pas d'avantage à couper le
  réseau). S'il revient, depuis le même appareil ou un autre appareil de la famille, il reprend
  sa place et reçoit l'état en cours ; sinon il quitte l'arène (règles habituelles : éliminé).
- **Salon jamais lancé** : fermé pour tous au bout de 10 minutes (`LOBBY_TTL_MS`).
- **Réponses simultanées** : seule celle du joueur dont c'est le tour est prise en compte.
- **Un profil, un appareil** : une seconde connexion du même profil reste refusée tant que la
  première est active.
- **Récompenses** : l'arène n'en distribue pas (aucune duplication possible à la reconnexion).
- Métrique `epicademie_realtime_disconnects_total` (déconnexions temps réel).

## Conséquences

- L'état des arènes reste en mémoire d'une instance (ADR 0006) : un redémarrage du serveur
  ferme les arènes en cours.
