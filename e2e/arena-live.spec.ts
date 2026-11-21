import { expect, test, type Page } from '@playwright/test';
import { signupFamily } from './family.ts';

async function start(page: Page) {
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill('Live');
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/\/hub$/);
  await page.getByRole('button', { name: /^Combat de boss/ }).click();
  const emperor = page.getByRole('dialog', { name: 'L’Empereur du Savoir' });
  for (let k = 0; k < 6 && (await emperor.isVisible().catch(() => false)); k++) {
    await emperor.getByRole('button', { name: 'Passer' }).click();
    await page.waitForTimeout(500);
  }
  await expect(emperor).toHaveCount(0);
  await page.waitForTimeout(800);
  console.log(
    'apres empereur',
    page.url(),
    'dialogues:',
    await page.getByRole('dialog').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label'))),
    'storage:',
    await page.evaluate(() => JSON.stringify(localStorage)),
  );
  const maths = page.getByRole('button', { name: 'Maths', exact: true });
  for (let k = 0; k < 3 && (await emperor.isVisible().catch(() => false)); k++) {
    await emperor.getByRole('button', { name: 'Passer' }).click();
    await page.waitForTimeout(500);
  }
  await maths.click();
  const closeUp = page.getByRole('dialog', { name: 'Sorcier π te provoque' });
  if (await closeUp.isVisible().catch(() => false)) await closeUp.getByRole('button', { name: 'Passer' }).click();
  const mental = page.getByRole('listitem').filter({ hasText: 'Calcul mental' });
  await mental.getByRole('button', { name: 'Combattre' }).click();
  await expect(page.getByRole('button', { name: 'C’est parti !' })).toBeVisible({ timeout: 15_000 });
}

const SIZES = [
  [1024, 768],
  [1080, 810],
  [1180, 820],
  [1366, 1024],
  [1920, 1080],
  [810, 1180],
] as const;

test('capture les arènes à plusieurs tailles', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  test.skip(testInfo.project.name !== 'tablette', 'capture unique');
  await start(page);
  for (const [width, height] of SIZES) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `/tmp/opencode/arena-${width}x${height}-intro.png` });
  }
  await page.setViewportSize({ width: 1080, height: 810 });
  await page.getByRole('button', { name: 'C’est parti !' }).click();
  for (const [width, height] of SIZES) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `/tmp/opencode/arena-${width}x${height}-play.png` });
  }
});
