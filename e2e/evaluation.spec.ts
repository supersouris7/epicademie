import { expect, test } from '@playwright/test';
import { signupFamily } from './family.ts';

test('Arène d’évaluation : Épreuve des Origines lancée, quittée puis reprise, sans correction', async ({ page }) => {
  test.setTimeout(60_000);
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(`Arene${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();

  await page.getByRole('button', { name: /^Arène d’évaluation/ }).click();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  await expect(page.getByText(/Conseillée/)).toBeVisible();
  await page.getByRole('button', { name: 'Lancer l’Épreuve des Origines' }).click();

  // Épreuve : progression visible, jamais de juste ni de faux.
  await expect(page.getByRole('progressbar', { name: 'Progression de l’épreuve' })).toBeVisible();
  await expect(page.getByText(/Bonne réponse|Essaie encore|Raté/)).toHaveCount(0);

  // Quitter garde l'épreuve : l'accueil de l'Arène propose de la reprendre.
  await page.getByRole('button', { name: 'Quitter' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Quitter' }).click();
  await page.getByRole('button', { name: /^Arène d’évaluation/ }).click();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Épreuve en cours' })).toBeVisible();
  await page.getByRole('button', { name: 'Reprendre', exact: true }).first().click();
  await expect(page.getByRole('progressbar', { name: 'Progression de l’épreuve' })).toBeVisible();
});
