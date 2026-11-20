import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

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
  ],
  // Serveur de production (front buildé) avec une base PostgreSQL embarquée jetable (en mémoire).
  webServer: {
    command: 'pnpm build && node apps/server/dist/main.js',
    url: `http://localhost:${PORT}/api/ready`,
    reuseExistingServer: false,
    timeout: 120_000,
    // Limites de débit relevées : tous les tests viennent de la même adresse IP.
    env: {
      NODE_ENV: 'production',
      PORT: String(PORT),
      DATABASE_URL: 'pglite://memory',
      RATE_LIMIT_MAX: '100000',
      AUTH_RATE_LIMIT_MAX: '1000',
    },
  },
});
