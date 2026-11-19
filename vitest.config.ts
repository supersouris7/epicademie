import { defineConfig } from 'vitest/config';

/** Seuil identique pour lignes, instructions et fonctions ; branches à part (plus exigeant à couvrir). */
const at = (level: number, branches: number) => ({
  lines: level,
  statements: level,
  functions: level,
  branches,
});

/**
 * Tests de tous les paquets (un projet Vitest par paquet). Couverture : `pnpm test:coverage`,
 * seuils bloquants en CI par paquet (docs/adr/0007-qualite.md). Le web n'est mesuré que sur sa
 * logique (fichiers .ts : API, état, outils) ; ses composants sont couverts par les tests de
 * bout en bout.
 */
export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/*'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**', 'apps/server/src/**', 'apps/web/src/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/testing/**',
        '**/*.d.ts',
        '**/index.ts',
        // Points d'entrée de processus : couverts par les tests de bout en bout.
        'apps/server/src/main.ts',
        'apps/server/src/cli/**',
        'apps/web/src/dev/**',
      ],
      reporter: ['text-summary', 'json-summary'],
      thresholds: {
        'packages/engine/src/**': at(85, 85),
        'packages/shared/src/**': at(85, 70),
        'packages/content/src/**': at(80, 80),
        'apps/server/src/**': at(85, 70),
        'apps/web/src/**/*.ts': at(60, 50),
      },
    },
  },
});
