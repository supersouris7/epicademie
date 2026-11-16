import { expect, test } from '@playwright/test';

test('Entraînement : série complète de tables, correction, leçon et résultats', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  await page.getByPlaceholder('Ex. Léa').fill(`Jeu${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
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
  await page.getByRole('button', { name: 'Je n’ai pas compris' }).click();
  await expect(page.getByRole('dialog')).toContainText('Tables de multiplication');
  await page.getByRole('button', { name: /exemple guidé/ }).click();
  await page.getByRole('button', { name: 'Première étape' }).click();
  await expect(page.getByText(/Réponse :/)).toBeVisible();
  await page.getByRole('button', { name: /J’ai compris/ }).click();
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

test('outils : calculatrice, tableau de conversion et ardoise', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  await page.getByPlaceholder('Ex. Léa').fill(`Outil${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2013-05-20');
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByText(/Prêt à jouer/)).toBeVisible();

  // Calculatrice proposée sur l'aire du disque, pas sur les tables.
  await page.goto('/partie/entrainement/m5-espace/m5-disque');
  await page.getByRole('button', { name: 'Calculatrice' }).click();
  for (const k of ['3', ',', '1', '4', '×', '2', '5', '='])
    await page.getByRole('dialog').getByRole('button', { name: k, exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('78,5');
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('button', { name: 'Ardoise' }).click();
  await expect(page.getByRole('dialog', { name: 'Ardoise' })).toBeVisible();
  await page.getByRole('dialog', { name: 'Ardoise' }).getByRole('button', { name: 'Fermer' }).click();

  await page.goto('/partie/entrainement/m5-espace/m5-conversions-volume');
  await page.getByRole('button', { name: 'Tableau de conversion' }).click();
  await expect(page.getByRole('dialog')).toContainText('dm');
  await page.getByRole('button', { name: 'Case 4' }).click();
  await page.getByRole('dialog').getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: 'Virgule' }).click();
  await expect(page.getByRole('button', { name: 'Case 4' })).toHaveText('2');

  await page.goto('/partie/entrainement/m5-calcul/m5-tables');
  await expect(page.getByRole('button', { name: 'Ardoise' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Calculatrice' })).toHaveCount(0);
});
