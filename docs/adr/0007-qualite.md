# 0007 — Qualité vérifiée en CI : couverture, règles de modules

- Statut : Acceptée
- Date : 2026-11-19

## Décision

La CI échoue si l'une de ces vérifications échoue :

- format (Prettier), lint (ESLint strict typé), types (TypeScript strict) ;
- **règles d'architecture** (dependency-cruiser, `.dependency-cruiser.cjs`) : dépendances entre
  paquets, entre applications, entre modules (par leur `index.ts` seulement), absence de cycles ;
- tests unitaires et d'intégration (Vitest) avec **seuils de couverture** par paquet
  (lignes, instructions et fonctions ; branches entre parenthèses) : moteur ≥ 85 % (85 %),
  serveur ≥ 85 % (70 %), contrats `shared` ≥ 85 % (70 %), contenu ≥ 80 % (80 %), logique du
  web — fichiers `.ts` : API, état, outils — ≥ 60 % (50 %). Les composants d'affichage et les
  points d'entrée de processus sont couverts par les tests de bout en bout ;
- tests du serveur rejoués sur un **PostgreSQL réel** ;
- tests de bout en bout (Playwright, tablette et smartphone) sur le build de production.

## Conséquences

- Une baisse de couverture ou une dépendance interdite bloque la fusion : la dette ne
  s'accumule pas en silence.
