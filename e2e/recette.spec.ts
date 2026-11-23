import { expect, test } from '@playwright/test';
import { PASSWORD, uniqueEmail } from './family.ts';

/** Recette : sans le lien renvoyé dans la réponse, le testeur retrouve son message dans la boîte mail de test. */
test('2e inscription sur la même adresse : le lien se retrouve dans la boîte mail de test', async ({ page }) => {
  const email = uniqueEmail();
  const signup = async () => {
    await page.goto('/inscription');
    await page.getByLabel('E-mail du parent').fill(email);
    await page.getByLabel('Mot de passe').fill(PASSWORD);
    await page.getByRole('button', { name: 'Créer le compte' }).click();
    await expect(page.getByRole('heading', { name: 'Vérifie ta boîte mail' })).toBeVisible();
  };
  await signup();
  await signup(); // réponse neutre : aucun lien affiché, le message d'information part dans la boîte
  await page.getByRole('link', { name: /boîte mail de test/ }).click();
  await expect(page.getByText('Version de test : aucun e-mail n’est envoyé.')).toBeVisible();
  await expect(page.getByText('une inscription avec ton adresse')).toBeVisible();
  await page.getByRole('link', { name: /email\/verification\?jeton=/ }).click();
  await page.getByLabel('Mot de passe du compte').fill('un autre mot de passe');
  await page.getByRole('button', { name: 'Valider mon adresse' }).click();
  await expect(page.getByRole('alert')).toContainText('Ce n’est pas le mot de passe choisi à l’inscription.');
  await page.getByLabel('Mot de passe du compte').fill(PASSWORD);
  await page.getByRole('button', { name: 'Valider mon adresse' }).click();
  await expect(page).toHaveURL(/\/profils\/nouveau$/);
});
