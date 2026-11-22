import { expect, test } from '@playwright/test';
import { signupFamily } from './family.ts';

test('Version gratuite puis abonnement (simulateur) : chapitres débloqués, historique', async ({ page }) => {
  test.setTimeout(60_000); // parcours complet : inscription, profil, paiement simulé
  await signupFamily(page, undefined, { premium: false });
  await page.getByPlaceholder('Ex. Léa').fill(`Abo${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  // Le joueur est choisi une fois l'accueil affiché : on l'attend avant de naviguer.
  await expect(page).toHaveURL(/hub/);

  await page.goto('/jouer/entrainement/maths?classe=5e');
  await page
    .getByRole('button', { name: /Nombres relatifs/ })
    .last()
    .click();
  await expect(page.getByText(/demande à tes parents/)).toBeVisible();

  await page.goto('/parent/abonnement');
  await expect(page.getByRole('heading', { name: 'Version gratuite' })).toBeVisible();
  await page.getByRole('button', { name: /Payer l’année scolaire/ }).click();
  await page.getByRole('button', { name: 'Paiement accepté' }).click();
  await expect(page.getByRole('heading', { name: 'Abonnement actif' })).toBeVisible();
  await expect(page.getByText(/Payé \(accès/)).toBeVisible();

  await page.goto('/jouer/entrainement/maths?classe=5e');
  await page
    .getByRole('button', { name: /Nombres relatifs/ })
    .last()
    .click();
  await expect(page).toHaveURL(/m5-relatifs/);
});
