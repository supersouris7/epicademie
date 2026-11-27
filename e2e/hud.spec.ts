import { expect, test, type Page } from '@playwright/test';
import { createFirstProfile, signupFamily } from './family.ts';

/**
 * HUD sur tous les appareils : « Quitter » au même endroit dans chaque mode (cible ≥ 44 px), menu
 * lisible, déconnexion refusée sans code parent. Le duel à plusieurs est contrôlé dans multi.spec.ts.
 */
async function newPlayer(page: Page): Promise<void> {
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(`Hud${Date.now() % 100000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await createFirstProfile(page);
}

/** Coin haut droit du bouton « Quitter » ; il doit être entier à l'écran et assez grand au doigt. */
async function quitPlace(page: Page): Promise<{ right: number; top: number }> {
  const quit = page.getByRole('button', { name: 'Quitter', exact: true });
  await expect(quit).toBeVisible();
  await expect(quit).toHaveText('');
  const box = (await quit.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  // Rien ne le recouvre.
  await quit.click({ trial: true });
  return { right: Math.round(box.x + box.width), top: Math.round(box.y) };
}

test('« Quitter » et « Pause » au même endroit : entraînement, combat, défi, épreuve', async ({ page }) => {
  test.setTimeout(120_000);
  await newPlayer(page);

  await page.goto('/partie/entrainement/m5-calcul/m5-tables');
  const place = await quitPlace(page);
  const pause = page.getByRole('button', { name: 'Pause' });
  const training = (await pause.boundingBox())!;
  await pause.click({ trial: true });

  await page.goto('/partie/boss/m5-relatifs');
  expect(await quitPlace(page)).toEqual(place);
  expect(await pause.boundingBox()).toEqual(training);

  // Les défis se jouent sur les notions réussies : les tables sont données « en or » à ce profil neuf.
  await page.route('**/api/v1/profiles/*/skills', (route) =>
    route.fulfill({
      json: [
        {
          skillId: 'm5-tables',
          stage: 1,
          due: null,
          attempts: 5,
          correct: 5,
          recent: [true],
          maintained: 0,
          best: 5,
          lastPracticed: null,
        },
      ],
    }),
  );
  await page.goto('/partie/defi/survie/maths');
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('img', { name: '3 cœurs sur 3' })).toBeVisible();
  expect(await quitPlace(page)).toEqual(place);
  await page.unroute('**/api/v1/profiles/*/skills');

  await page.goto('/jouer/evaluation/maths');
  await page.getByRole('button', { name: 'Lancer l’Épreuve des Origines' }).click();
  await expect(page).toHaveURL(/\/partie\/evaluation\//);
  expect(await quitPlace(page)).toEqual(place);
});

test('menu : icônes seules sur téléphone ; déconnexion refusée sans code parent', async ({ page }, testInfo) => {
  await newPlayer(page);
  const nav = page.getByRole('navigation', { name: 'Menu principal' });
  if (testInfo.project.name === 'smartphone') await expect(nav.getByText('Paramètres')).toBeHidden();
  await nav.getByRole('button', { name: 'Paramètres' }).click();

  // Sans code parent, le serveur refuse, même en appelant l'API directement.
  const headers = { origin: new URL(page.url()).origin };
  expect((await page.request.post('/api/v1/auth/parent/lock', { headers })).status()).toBe(200);
  expect((await page.request.post('/api/v1/auth/logout', { headers })).status()).toBe(403);

  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  const gate = page.getByRole('dialog', { name: 'Espace parent' });
  await gate.getByRole('button', { name: 'Annuler' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible();
});
