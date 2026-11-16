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
  // Serveur de production (front buildé) avec base jetable.
  webServer: {
    command: 'pnpm build && node apps/server/dist/index.js',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { NODE_ENV: 'production', PORT: String(PORT), DB_PATH: ':memory:' },
  },
});
