import { expect, test } from '@playwright/test';
import { loginFamily, PASSWORD, signupFamily, uniqueEmail } from './family.ts';

/** Plateforme de test (APP_ENV=recette) : on arrive sur « Se connecter », on crée un compte et on joue, sans e-mail. */
test('premier écran : « Se connecter » et « Créer un compte » ; parcours élève masqué', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/connexion$/);
  await expect(page.getByRole('link', { name: 'Créer un compte' })).toBeVisible();
  for (const path of ['/bienvenue', '/eleve']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/connexion$/);
  }
});

test('inscription : mot de passe affichable, compte actif aussitôt, reconnexion, adresse déjà prise', async ({
  page,
}) => {
  const email = uniqueEmail();
  await page.goto('/inscription');
  await page.getByLabel('E-mail du parent').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  const toggle = page.getByRole('button', { name: 'Afficher le mot de passe' });
  await toggle.click();
  await expect(page.getByLabel('Mot de passe', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Créer le compte' }).click();
  await expect(page).toHaveURL(/\/profils\/nouveau$/);

  await page.context().clearCookies();
  await page.goto('/inscription');
  await page.getByLabel('E-mail du parent').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Créer le compte' }).click();
  await expect(page.getByRole('alert')).toContainText('Cette adresse a déjà un compte : connectez-vous.');
  await loginFamily(page, email);
});

test('mot de passe oublié : consigne, pas de formulaire', async ({ page }) => {
  await page.goto('/mot-de-passe-oublie');
  await expect(page.getByText('Plateforme de test : demandez votre nouveau mot de passe')).toBeVisible();
  await expect(page.getByRole('button', { name: /Recevoir/ })).toHaveCount(0);
});

test('inscription via signupFamily : arrive sur la création du 1er profil', async ({ page }) => {
  await signupFamily(page, uniqueEmail(), { premium: false });
});
