import { expect, test } from '@playwright/test';

test('Entraînement : série complète de tables, correction, leçon et résultats', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  await page.getByPlaceholder('Ex. Léa').fill(`Jeu${Date.now() % 10000}`);
  await page.getByRole('button', { name: /C’est parti/ }).click();

  await page.getByRole('button', { name: /Entraînement/ }).click();
  await page.getByRole('button', { name: 'Maths' }).click();
  await expect(page.getByRole('heading', { name: /Entraînement · Maths/ })).toBeVisible();
  await page.getByRole('button', { name: /Calcul mental/ }).click();
  await page.getByRole('button', { name: /Tables de multiplication/ }).click();

  // Première réponse volontairement fausse : explication, leçon, question similaire.
  await expect(page.getByRole('progressbar', { name: 'Progression de la série' })).toBeVisible();
  await page.getByRole('button', { name: 'Moins' }).click();
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('La correction')).toBeVisible();
  await page.getByRole('button', { name: 'Revoir la leçon' }).click();
  await expect(page.getByRole('dialog')).toContainText('Tables de multiplication');
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.getByRole('button', { name: /Question similaire/ }).click();
  await expect(page.getByText('Question similaire', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Question similaire/ })).toBeHidden();

  // On répond « −1 » (toujours faux) jusqu'à la fin de la série : 10 questions + 5 variantes au plus.
  const ok = page.getByRole('button', { name: 'OK' });
  const next = page.getByRole('button', { name: /Suivant|Question similaire/ });
  const end = page.getByText(/On s’accroche/);
  for (let i = 0; i < 40; i++) {
    await expect(ok.or(next).or(end).first()).toBeVisible();
    if (await end.isVisible()) break;
    if (await ok.isVisible()) {
      await page.getByRole('button', { name: 'Moins' }).click();
      await page.getByRole('button', { name: '1', exact: true }).click();
      await ok.click();
      await expect(next).toBeVisible();
    }
    await next.click();
    await expect(next).toBeHidden();
  }
  await expect(page.getByText(/On s’accroche/)).toBeVisible();
  await expect(page.getByText('0/10')).toBeVisible();
  await expect(page.getByText(/À revoir dès/)).toBeVisible();

  // La notion apparaît « à revoir » demain : pas encore échue aujourd'hui, mais évaluée.
  await page.getByRole('button', { name: 'Autre notion' }).click();
  await expect(page.getByRole('button', { name: /Tables de multiplication/ })).toContainText('Maîtrise insuffisante');
});
