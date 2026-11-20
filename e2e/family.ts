import { expect, type Page } from '@playwright/test';

/**
 * Compte familial des tests de bout en bout : chaque test crée sa propre famille (adresse
 * unique), comme un parent qui découvre l'application. Aucune donnée réelle.
 */
export const PASSWORD = 'mot de passe des tests e2e';

let n = 0;
export const uniqueEmail = () => `famille-${Date.now()}-${++n}@e2e.test`;

/** Inscription : arrive sur la création du 1er profil enfant. */
export async function signupFamily(page: Page, email = uniqueEmail()): Promise<string> {
  await page.goto('/inscription');
  await page.getByLabel('E-mail du parent').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Créer le compte' }).click();
  await expect(page).toHaveURL(/\/profils\/nouveau$/);
  return email;
}

/** Connexion d'un autre appareil au même compte : arrive sur le choix du joueur. */
export async function loginFamily(page: Page, email: string): Promise<void> {
  await page.goto('/connexion');
  await page.getByLabel('E-mail du parent').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/$/);
}
