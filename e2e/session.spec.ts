import { expect, test } from '@playwright/test';
import { createFirstProfile, signupFamily } from './family.ts';

/** Appareil partagé : un 2e onglet ne garde rien d'une famille déconnectée dans le 1er. */
test('Deux onglets : après déconnexion et changement de famille, aucun ancien profil affiché', async ({
  page,
  context,
}) => {
  await signupFamily(page);
  const first = `Un${Date.now() % 10000}`;
  await page.getByPlaceholder('Ex. Léa').fill(first);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await createFirstProfile(page);

  const other = await context.newPage();
  await other.goto('/');
  const oldPlayer = other.getByRole('button', { name: new RegExp(first) });
  await expect(oldPlayer).toBeVisible();

  // Le 2e onglet a pris la main sur le joueur : le 1er le rechoisit.
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: new RegExp(first) }).click();
  await expect(page).toHaveURL(/\/hub$/);
  // Sans rechargement : la déconnexion doit partir d'un onglet resté ouvert.
  await page.getByRole('navigation').getByRole('button', { name: 'Paramètres' }).click();
  await page.getByRole('button', { name: 'Déconnecter cet appareil' }).click();
  await expect(page).toHaveURL(/\/(bienvenue|connexion)$/);
  // Sans rechargement ni action dans le 2e onglet.
  await expect(other).toHaveURL(/\/(bienvenue|connexion)$/);
  await expect(oldPlayer).toHaveCount(0);

  // Nouvelle famille dans le 1er onglet : le 2e n'affiche rien de l'ancienne en revenant au jeu.
  await signupFamily(page, undefined, { premium: false });
  await other.goto('/');
  await expect(other).toHaveURL(/\/$/);
  await expect(oldPlayer).toHaveCount(0);
});
