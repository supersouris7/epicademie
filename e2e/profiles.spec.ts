import { expect, test } from '@playwright/test';

test('création d’un profil, hub, thème sombre puis suppression', async ({ page }) => {
  const name = `E2E${Date.now() % 100000}`;
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Academy Fighters' })).toBeVisible();

  await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('alert')).toHaveText('Le prénom est obligatoire');
  await page.getByPlaceholder('Ex. Léa').fill('X');
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('alert')).toHaveText('Choisis fille ou garçon.');

  await page.getByPlaceholder('Ex. Léa').fill(name);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Robot' }).click();
  await page.getByRole('radio', { name: /Mia/ }).click();
  await expect(page.getByRole('radio', { name: /Mia/ })).toBeChecked();
  await page.getByRole('button', { name: /C’est parti/ }).click();

  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByText('Apprentie')).toBeVisible();
  await expect(page.getByText(/Prête à jouer/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Mia.*Changer de héros/ })).toBeVisible();
  await page.getByRole('button', { name: /Mes progrès/ }).click();
  await expect(page.getByText(/0 \/ 72 notions médaillées/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nombres et calculs' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();

  // Mode d'abord, matière ensuite.
  for (const mode of ['Révisions du jour', 'Entraînement', 'Combat de boss', 'Contre-la-montre', 'Bilan']) {
    await expect(page.getByRole('button', { name: new RegExp(mode) })).toBeVisible();
  }
  await page.getByRole('button', { name: /Combat de boss/ }).click();
  await expect(page).toHaveURL(/\/jouer\/boss$/);
  for (const subject of ['Maths', 'Physique-Chimie', 'Anglais', 'Espagnol', 'Histoire', 'Géographie']) {
    await expect(page.getByRole('button', { name: subject })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Retour' }).click();
  await page.getByRole('button', { name: /Multijoueur/ }).click();
  await expect(page.getByRole('button', { name: /Arène/ })).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();

  await page.getByRole('button', { name: 'Paramètres' }).click();
  await page.getByRole('radio', { name: 'Sombre' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Le profil et le thème survivent à un rechargement.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Supprimer ce profil' }).click();
  await page.getByRole('button', { name: 'Oui, supprimer' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveCount(0);
});

test('une route inconnue renvoie vers l’accueil, l’API reste en JSON', async ({ page, request }) => {
  await page.goto('/nimporte-quoi');
  await expect(page).toHaveURL(/\/$/);
  const res = await request.get('/api/inconnu');
  expect(res.status()).toBe(404);
});
