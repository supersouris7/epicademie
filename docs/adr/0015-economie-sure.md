# 0015 — Économie sûre : gains calculés par le serveur, opérations atomiques et idempotentes

- Statut : Acceptée
- Date : 2026-11-20

## Contexte

Les pièces, rubis, objets et coffres doivent rester justes face à la triche (requêtes
fabriquées), aux doubles appuis et aux réseaux qui renvoient une requête (tablette en Wi-Fi
instable, reconnexion).

## Décision (état vérifié par des tests)

| Risque                                             | Protection                                                                                                                                                                                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pièces ou rubis modifiés par le client             | aucune route ne les écrit ; tous les gains sont calculés par le serveur ; contraintes `CHECK ≥ 0` en base                                                                                                                                           |
| Récompense attribuée sans partie gagnée            | XP, pièces, coffres et médailles calculés à la fin d'une partie ou d'un combat, d'après les réponses corrigées par le serveur                                                                                                                       |
| Coffre ouvert deux fois, partie terminée deux fois | fin de partie et de combat sous verrou de ligne ; une partie terminée refuse toute nouvelle fin (409) ; le coffre de 1re victoire dépend de l'absence de record                                                                                     |
| Achat rejoué (double appui, réseau)                | en-tête `Idempotency-Key` (une clé par appui côté client) : la même clé rend la même réponse sans second débit, y compris pour des requêtes simultanées (verrou du profil, puis lecture de la clé) ; clés propres à chaque famille, gardées 7 jours |
| Réponse d'entraînement rejouée                     | la même réponse (notion, niveau, graine, essai) rend le résultat déjà enregistré : ni XP ni score comptés deux fois                                                                                                                                 |
| Réponse de combat rejouée                          | refusée : la question en cours a changé (409)                                                                                                                                                                                                       |
| Inventaire d'un autre joueur                       | appartenance du profil vérifiée (module comptes)                                                                                                                                                                                                    |
| Récompense dupliquée à la reconnexion              | l'arène ne distribue pas de récompense ; les futures récompenses multijoueur passeront par le serveur, une fois par partie                                                                                                                          |

## Conséquences

- Les opérations de gain et de dépense sont toutes dans une transaction unique.
- Tout nouvel achat (cosmétiques, abonnement) réutilise `idempotencyRepo`.
