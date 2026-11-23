import { expect, type Page } from '@playwright/test';

/**
 * Compte familial des tests de bout en bout : chaque test crée sa propre famille (adresse
 * unique), comme un parent qui découvre l'application. Aucune donnée réelle.
 */
export const PASSWORD = 'mot de passe des tests e2e';

let n = 0;
export const uniqueEmail = () => `famille-${Date.now()}-${++n}@e2e.test`;

/**
 * Inscription puis validation de l'adresse par le lien (simulation) : arrive sur la création du 1er profil enfant. Par défaut, la famille prend
 * l'abonnement via le simulateur de paiement (tous les chapitres jouables) ; `premium: false`
 * garde la version gratuite.
 */
export async function signupFamily(
  page: Page,
  email = uniqueEmail(),
  { premium = true }: { premium?: boolean } = {},
): Promise<string> {
  await page.goto('/inscription');
  await page.getByLabel('E-mail du parent').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Créer le compte' }).click();
  // Mode simulation (hors production, sans fournisseur d'e-mail) : le lien de validation est affiché.
  await page.getByRole('link', { name: /Ouvrir le lien/ }).click();
  await expect(page).toHaveURL(/\/profils\/nouveau$/);
  if (premium) await subscribe(page);
  return email;
}

/** Paiement simulé de l'année scolaire (même session que la page, verrou parent ouvert). */
async function subscribe(page: Page): Promise<void> {
  const origin = new URL(page.url()).origin;
  const headers = { origin };
  const checkout = await page.request.post('/api/v1/billing/checkout', { headers });
  expect(checkout.status()).toBe(201);
  const { url } = (await checkout.json()) as { url: string };
  const id = new URL(url, origin).searchParams.get('paiement') ?? '';
  const paid = await page.request.post(`/api/v1/billing/simulate/${id}`, { headers, data: { outcome: 'succes' } });
  expect(paid.status()).toBe(200);
}

/** Connexion d'un autre appareil au même compte : arrive sur le choix du joueur. */
export async function loginFamily(page: Page, email: string): Promise<void> {
  await page.goto('/connexion');
  await page.getByLabel('E-mail du parent').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/$/);
}
