import { defineConfig, devices } from '@playwright/test';

// Port configurable (E2E_PORT) si 3100 est occupé sur la machine d'exécution.
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'tablette', use: { ...devices['iPad (gen 7) landscape'], browserName: 'chromium' } },
    { name: 'smartphone', use: { ...devices['Pixel 7'] } },
    // Ordinateur et télévision (mode TV) : grand écran 1920 × 1080, écrans principaux.
    {
      name: 'ordinateur-tv',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
      testMatch: ['profiles.spec.ts', 'journeys.spec.ts', 'multi.spec.ts'],
    },
  ],
  // Serveur de production (front buildé) avec une base PostgreSQL embarquée jetable (en mémoire).
  webServer: {
    command: 'pnpm build && node apps/server/dist/main.js',
    url: `http://localhost:${PORT}/api/ready`,
    reuseExistingServer: false,
    timeout: 120_000,
    // Build de production servi en mode « test » : le simulateur de paiement y est permis (il est
    // interdit en production). Limites de débit relevées : tous les tests viennent de la même IP.
    env: {
      NODE_ENV: 'test',
      WEB_DIR: 'apps/web/dist',
      BILLING_PROVIDER: 'simulateur',
      PORT: String(PORT),
      DATABASE_URL: 'pglite://memory',
      RATE_LIMIT_MAX: '100000',
      AUTH_RATE_LIMIT_MAX: '1000',
    },
  },
});
