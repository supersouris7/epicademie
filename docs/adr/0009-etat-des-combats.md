# 0009 — État des combats stocké versionné et validé

- Statut : Acceptée
- Date : 2026-11-20

## Contexte

Un combat de boss dure plusieurs minutes ; son état complet (questions tirées, cœurs, vies du
boss, objets) est tenu par le serveur dans `sessions.battle` (jsonb). Une mise à jour du serveur
peut arriver pendant un combat : la nouvelle version relit alors un état écrit par l'ancienne.
Jusqu'ici, cet état était relu par un simple cast TypeScript : un changement de format du moteur
aurait fait planter le combat, ou pire, l'aurait fait se comporter de travers sans erreur.

## Décision

- L'état est stocké dans une enveloppe `{ v, state }` ; `v` est la version du format
  (`BATTLE_STATE_VERSION`, `apps/server/src/modules/battles/battle-state.ts`).
- À la lecture, l'état est **validé** par un schéma Zod. Le compilateur vérifie, dans les deux
  sens, que ce schéma décrit exactement le type `BattleState` du moteur : un changement du moteur
  sans mise à jour du schéma ne compile pas.
- Toute évolution du format incrémente la version.
- Un état d'une autre version, ou illisible, n'est **pas converti** : le combat est clos sans
  récompense ni pénalité (la clôture est enregistrée), et l'API répond `410 GONE`. L'écran affiche
  « Ce combat a expiré avec la mise à jour du jeu » et propose de le relancer.

## Conséquences

- Aucune donnée de combat n'est relue sans être vérifiée.
- Un déploiement pendant un combat coûte au pire un combat à relancer, jamais une erreur
  serveur ni un état incohérent.
- Le code d'erreur `GONE` rejoint le contrat d'API (`ERROR_CODES`).

## Options écartées

- **Migrer l'état d'une version à l'autre** : une fonction de conversion par changement de
  format, à écrire et tester à chaque évolution, pour des combats de quelques minutes. Coût
  disproportionné ; décision du 20/11/2026.
- **Casser le combat (erreur 500)** : expérience déplorable pour l'enfant, bruit dans le suivi
  d'erreurs.
