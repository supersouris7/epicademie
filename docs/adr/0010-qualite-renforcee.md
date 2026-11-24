# 0010 — Qualité vérifiée en CI : couverture complète, complexité, code mort

- Statut : Acceptée (remplace [0007](0007-qualite.md))
- Date : 2026-11-20

## Contexte

L'audit de qualité du 20/11/2026 a montré une dette concentrée là où rien ne la mesurait : deux
écrans de jeu « fourre-tout » (combat de boss : une fonction de 456 lignes, complexité 72 ;
entraînement : 348 lignes, complexité 43), non couverts par les tests unitaires parce que la
couverture du front excluait les composants (`.tsx`). Il manquait aussi un contrôle du code mort.

## Décision

La CI échoue si l'une de ces vérifications échoue :

- format (Prettier), lint (ESLint strict typé), types (TypeScript strict) ;
- **lisibilité** (ESLint, code applicatif hors tests) : complexité ≤ 20 par fonction (variante
  « modifiée » : un `switch` compte pour une décision), imbrication ≤ 4, fonction ≤ 200 lignes,
  ≤ 5 paramètres. Les tables de données déclaratives (exercices `packages/content/src/maths`,
  catalogue d'images `apps/web/src/design/catalog`) sont dispensées des deux dernières règles :
  leurs constructeurs positionnels et leurs longues listes sont de la donnée, pas de la logique ;
- **règles d'architecture** (dependency-cruiser) : dépendances entre paquets, applications et
  modules (par leur `index.ts`), absence de cycles ;
- **code mort** (knip, `pnpm deadcode`) : fichiers, exports et dépendances inutilisés ;
- tests unitaires et d'intégration (Vitest) avec **seuils de couverture** par paquet (lignes,
  instructions et fonctions ; branches entre parenthèses) : moteur ≥ 85 % (85 %), serveur ≥ 85 %
  (70 %), contrats `shared` ≥ 85 % (70 %), contenu ≥ 80 % (80 %), **web entier, composants
  compris ≥ 60 % (50 %)** ;
- tests du serveur rejoués sur un **PostgreSQL réel** ;
- tests de bout en bout (Playwright, tablette et smartphone) sur le build de production ;
- analyse de sécurité de l'image Docker (voir [0011](0011-chaine-d-approvisionnement.md)).

Pour tenir ces règles côté front, un écran de jeu se découpe en trois couches :

- `state.ts` : état de l'écran et **réducteur pur** (testé sans React) ;
- `useXxx.ts` : le déroulé (minuteurs, sons, appels au serveur) qui envoie des événements ;
- le composant : l'affichage seulement.

Les écrans sont testés sur l'application complète avec un **faux serveur** construit sur le
contrat d'API (`apps/web/src/testing/`) : chaque réponse est validée par le schéma du contrat,
et les règles du jeu sont les vraies (`@epicademie/content`, `@epicademie/engine`).

## Conséquences

- La dette mesurable (complexité, code mort, couverture) ne peut plus s'accumuler en silence.
- Un nouvel écran complexe suit le découpage état / déroulé / affichage dès le départ.

## Options écartées

- **Seuil de 80 % sur les composants** : beaucoup de tests de rendu fragiles pour l'affichage
  animé, pour peu de sécurité en plus ; la logique, elle, est testée à fond dans les réducteurs.
