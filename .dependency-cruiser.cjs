/**
 * Règles d'architecture vérifiées en CI (`pnpm arch`). Voir docs/adr/0001 et 0007.
 * Une violation = une dépendance qui casse le découpage en paquets et en modules.
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: 'pas-de-cycle',
      severity: 'error',
      comment: 'Les dépendances circulaires rendent le code difficile à comprendre et à tester.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'shared-autonome',
      severity: 'error',
      comment: '@questeo/shared (contrats) ne dépend d’aucun autre paquet du dépôt.',
      from: { path: '^packages/shared/' },
      to: { path: '^(packages/(content|engine)|apps)/' },
    },
    {
      name: 'paquets-purs',
      severity: 'error',
      comment: 'content et engine sont purs : ils ne dépendent que de shared (jamais des applications).',
      from: { path: '^packages/(content|engine)/' },
      to: { path: '^apps/' },
    },
    {
      name: 'engine-sans-contenu',
      severity: 'error',
      comment: 'Les règles du jeu (engine) ne connaissent pas le contenu pédagogique.',
      from: { path: '^packages/engine/' },
      to: { path: '^packages/content/' },
    },
    {
      name: 'applications-separees',
      severity: 'error',
      comment: 'Le web et le serveur ne s’importent jamais : ils partagent seulement les paquets.',
      from: { path: '^apps/(web|server)/' },
      to: { path: '^apps/', pathNot: '^apps/$1/' },
    },
    {
      name: 'modules-serveur-par-index',
      severity: 'error',
      comment: 'Un module serveur n’importe un autre module que par son index.ts (API publique).',
      from: { path: '^apps/server/src/modules/([^/]+)/' },
      to: {
        path: '^apps/server/src/modules/([^/]+)/',
        pathNot: ['^apps/server/src/modules/$1/', '^apps/server/src/modules/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'core-sans-metier',
      severity: 'error',
      comment: 'core/ et db/ sont transverses : ils ne dépendent d’aucun module métier.',
      from: { path: '^apps/server/src/(core|db)/' },
      to: { path: '^apps/server/src/modules/' },
    },
    {
      name: 'fonctionnalites-web-par-index',
      severity: 'error',
      comment: 'Une fonctionnalité web n’importe une autre fonctionnalité que par son index.ts.',
      from: { path: '^apps/web/src/features/([^/]+)/' },
      to: {
        path: '^apps/web/src/features/([^/]+)/',
        pathNot: ['^apps/web/src/features/$1/', '^apps/web/src/features/[^/]+/index\\.tsx?$'],
      },
    },
    {
      name: 'socle-web-sans-fonctionnalite',
      severity: 'error',
      comment: 'shared/ et design/ (socle du web) ne dépendent d’aucune fonctionnalité.',
      from: { path: '^apps/web/src/(shared|design)/' },
      to: { path: '^apps/web/src/features/' },
    },
    {
      name: 'pas-de-test-en-production',
      severity: 'error',
      comment: 'Le code de production n’importe ni les tests ni l’outillage de test.',
      from: { pathNot: '\\.test\\.tsx?$|/testing/|test-setup' },
      to: { path: '\\.test\\.tsx?$|/testing/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|coverage|node_modules)/|\\.d\\.ts$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.depcruise.json' },
    combinedDependencies: true,
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'default'] },
  },
};
