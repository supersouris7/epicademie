# 0035 — Écrans et contenus chargés à la demande

- Statut : Acceptée
- Date : 2026-11-26

## Contexte

Le web tenait dans un seul fichier JavaScript (environ 6,7 Mo, 1,9 Mo gzip), surtout à cause des
contenus pédagogiques. Tout était téléchargé avant le premier écran, y compris sur `/admin`.

## Décision

- La console et le jeu sont deux pages (entrées Vite `index.html` et `admin.html`, chacune avec sa
  feuille de style) ; le serveur sert `admin.html` pour `/admin` et ses sous-adresses. La console
  affiche son fond dès le premier pixel, sans passer par le thème du jeu. Chaque écran du jeu est importé à la première
  visite (`React.lazy`, une attente par écran), fichier par fichier depuis `app/`.
- L’`index.ts` d’une fonctionnalité reste son API pour les autres fonctionnalités ; il n’est créé
  que s’il a quelque chose à leur offrir.
- `@epicademie/content` et `apps/web` se déclarent sans effet de bord (`sideEffects`) : le
  découpage ne garde que ce qui est réellement utilisé. Un module ne doit donc rien faire à son
  seul import (hors `main.tsx` et les feuilles de style).
- Les contenus restent un seul morceau, téléchargé au premier écran qui en a besoin. Les rubriques
  de la console qui affichent des titres de notions les chargent à leur ouverture.
- Morceau introuvable après une mise à jour (`vite:preloadError`) : la page se recharge, au plus une
  fois par minute. Un préchargement en échec est silencieux (aucun rechargement) : le code est
  redemandé à la visite.

## Conséquences

- Premier affichage bien plus léger. Après la première ouverture, le code des écrans est préchargé
  en arrière-plan (session vérifiée seulement) ; sinon une silhouette tient la place.
- Le premier écran à contenus télécharge toujours toutes les matières.

## Options écartées

- Contenus par matière à la demande : le catalogue est synchrone et réunit toutes les matières
  (progression, titres, tirage des questions) ; le rendre asynchrone changerait le comportement et
  de nombreux écrans. À traiter à part.
