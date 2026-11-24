import { expect, test } from '@playwright/test';

/** En-têtes que le frontal de la page de pilotage ajoute (secret fictif défini dans playwright.config.ts). */
const OPERATOR = {
  'X-Questeo-Operateur': 'secret-operateur-e2e-0123456789-abcdefghij',
  'X-Questeo-Operateur-Nom': 'Recette',
};

test.describe('console d’administration (opérateur)', () => {
  test.use({ extraHTTPHeaders: OPERATOR });

  test('ouverte directement, sans compte de jeu ni choix de profil ; recherche de comptes', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: /Console d’administration/ })).toBeVisible();
    await expect(page.getByText('Opérateur : Recette')).toBeVisible();
    // Smartphone : le menu des rubriques est une liste déroulante ; sinon, des onglets.
    const menu = page.getByRole('combobox', { name: 'Rubrique' });
    if (await menu.isVisible()) await menu.selectOption({ label: 'Utilisateurs · Comptes' });
    else await page.getByRole('tab', { name: 'Comptes' }).click();
    await page.getByRole('searchbox').fill('introuvable');
    await page.getByRole('button', { name: 'Rechercher' }).click();
    await expect(page.getByText('Aucun compte ne correspond.')).toBeVisible();
  });
});

test.describe('sans opérateur', () => {
  test('message, jamais de renvoi vers l’accueil du jeu', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('Administration accessible uniquement depuis la page de pilotage.')).toBeVisible();
    await expect(page).toHaveURL(/\/admin$/);
  });
});
