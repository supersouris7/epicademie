import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

/**
 * Poids du JavaScript au premier affichage, mesuré sur le build servi (taille gzip). Les contenus
 * pédagogiques (plusieurs mégaoctets) et les écrans non visités ne doivent pas en faire partie.
 */
async function scriptWeight(page: Page, path: string, ready: () => Promise<void>): Promise<number> {
  const bodies: Promise<Buffer>[] = [];
  page.on('response', (r) => {
    if (r.url().endsWith('.js')) bodies.push(r.body());
  });
  await page.goto(path);
  await ready();
  await page.waitForLoadState('networkidle');
  return (await Promise.all(bodies)).reduce((sum, body) => sum + gzipSync(body).length, 0);
}

test('console d’administration : moins de 300 Ko de JavaScript', async ({ page }) => {
  const weight = await scriptWeight(page, '/admin', () =>
    expect(page.getByText('Administration accessible uniquement depuis la page de pilotage.')).toBeVisible(),
  );
  expect(weight).toBeGreaterThan(0);
  expect(weight).toBeLessThan(300_000);
});

test('entrée du jeu : au moins trois fois plus légère que le bundle unique (1,9 Mo)', async ({ page }) => {
  const weight = await scriptWeight(page, '/connexion', () =>
    expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible(),
  );
  expect(weight).toBeGreaterThan(0);
  expect(weight).toBeLessThan(1_900_000 / 3);
});
