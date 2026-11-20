import { expect, test } from '@playwright/test';
import { signupFamily } from './family.ts';

test('Mon QG : trophée en vitrine, aménagement conservé après rechargement', async ({ page }) => {
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(`Qg${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();

  await page.getByRole('button', { name: 'Mon QG et mes trophées' }).click();
  const vitrine = page.getByRole('list', { name: 'Vitrine' });
  await expect(vitrine.getByText('Emplacement libre')).toHaveCount(3);
  await page.getByRole('button', { name: /Acad-Héros :/ }).click();
  await expect(vitrine.getByText(/Acad-Héros :/)).toBeVisible();
  // Décor de badge : pas à vendre, à débloquer en jouant.
  await expect(page.getByText(/À débloquer : Badge Chasseur de boss/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole('list', { name: 'Vitrine' }).getByText(/Acad-Héros :/)).toBeVisible();
});
