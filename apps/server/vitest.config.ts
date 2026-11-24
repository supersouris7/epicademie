import { defineProject } from 'vitest/config';

/**
 * Tests du serveur : intégration sur une vraie base PostgreSQL (PGlite en mémoire, ou
 * TEST_DATABASE_URL en CI). Démarrer une base prend quelques secondes : délais élargis.
 */
export default defineProject({
  test: {
    name: '@epicademie/server',
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
