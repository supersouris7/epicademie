# Web (`apps/web`)

React 19, Vite, Tailwind 4, motion (animations), React Query (données serveur), zustand
(état global minimal), socket.io-client (temps réel). Organisation par fonctionnalités :
[ADR 0008](../adr/0008-front-par-fonctionnalites.md).

## Fonctionnalités (`src/features/`)

| Dossier    | Écrans et rôle                                                    |
| ---------- | ----------------------------------------------------------------- |
| `profiles` | choix et création de profil, héros ; profil choisi (`session.ts`) |
| `hub`      | menu principal, choix du mode et de la matière, modes multijoueur |
| `training` | chapitres, notions, partie d'entraînement et bilan                |
| `boss`     | chapitres de boss, combat, Empereur du Savoir, boutique           |
| `arena`    | arène multijoueur (salon, tour par tour)                          |
| `realtime` | connexion temps réel, joueurs connectés, notifications, messages  |
| `progress` | progression par notion, médailles, reliques                       |
| `settings` | paramètres, à propos, crédits                                     |

## Socle (`src/shared/`, `src/design/`)

- `shared/api/client.ts` : `request(api.xxx, { params, body })`, typé par le contrat ;
  `ApiError` (statut, `code` stable, message affichable, `requestId`).
- `shared/ui/` : composants d'interface (GameButton, Bubble, PageShell, ProgressBar, Questy…).
- `shared/question/` : tout ce qui sert à afficher une question et saisir une réponse
  (figures, pavé numérique, clavier, calculatrice, brouillon, tableau de conversion).
- `shared/battle/` : mise en scène des combats (arène, barre de vie, répliques), partagée par le
  combat de boss, l'arène et l'entraînement.
- `shared/lib/` : stockage sûr, sons, dates, sortie de partie (`gameExit`), dialogues,
  minuteurs.
- `design/` : jetons CSS, palette, catalogue des images (`assets.ts`) — voir
  [DESIGN-SYSTEM](../DESIGN-SYSTEM.md).

## Règles

- Les écrans orchestrent ; la logique réutilisable va dans des hooks ou des fonctions pures
  testées (`*.test.ts`).
- Toute donnée serveur passe par React Query (clé de cache exportée par l'`api.ts` de la
  fonctionnalité, invalidée après une mutation).
- Erreurs : une barrière d'erreur (`app/ErrorBoundary.tsx`) affiche un écran de secours au lieu
  d'une page blanche et remonte l'erreur au serveur (`shared/lib/telemetry.ts`).
- Accessibilité : rôles et libellés ARIA (les tests de bout en bout s'en servent), animations
  réduites si le système le demande (`MotionConfig reducedMotion="user"`).
