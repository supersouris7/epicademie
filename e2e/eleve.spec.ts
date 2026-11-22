import { expect, test } from '@playwright/test';
import { signupFamily, uniqueEmail } from './family.ts';

const CODE = /[A-Z2-9]{4}(?:-[A-Z2-9]{4}){1,3}/;

test('élève de 15 ans ou plus : compte complet avec son e-mail', async ({ page }) => {
  await page.goto('/bienvenue');
  await page.getByRole('button', { name: 'Je suis un élève' }).click();
  await page.getByLabel('Mon âge').fill('16');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page).toHaveURL(/\/inscription\?eleve=1$/);
  await expect(page.getByLabel('Ton e-mail')).toBeVisible();
});

test('élève de moins de 15 ans : compte sans e-mail, récupération, rattachement par un parent', async ({
  page,
  browser,
}) => {
  const pseudo = `Elv${Date.now() % 100000}`;
  // Accueil, âge, puis compte sans donnée personnelle.
  await page.goto('/bienvenue');
  await page.getByRole('button', { name: 'Je suis un élève' }).click();
  await page.getByLabel('Mon âge').fill('12');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page).toHaveURL(/\/eleve\/inscription$/);
  await expect(page.getByLabel('E-mail')).toHaveCount(0);
  await page.getByLabel('Ton pseudo').fill(pseudo);
  await page.getByRole('radio', { name: '5e', exact: true }).click();
  await page.getByRole('button', { name: 'Avatar 05' }).click();
  await page.getByRole('button', { name: 'C’est parti !' }).click();

  // Le code de récupération est montré une fois, avec la consigne de le noter.
  await expect(page.getByRole('heading', { name: 'Note bien ton code' })).toBeVisible();
  const recovery = (await page.getByText(CODE).first().textContent()) ?? '';
  expect(recovery).toMatch(CODE);
  await page.getByRole('button', { name: 'J’ai noté mon code' }).click();

  // Choix du joueur : pas d'Espace parent ni de nouveau joueur, mais « Demande à un parent ».
  await expect(page.getByText(pseudo)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Espace parent' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Demande à un parent' })).toBeVisible();
  await page.getByRole('button', { name: 'Afficher mon code pour un parent' }).click();
  const invitation = (await page.getByRole('status').getByText(CODE).textContent()) ?? '';

  // Autre appareil : l'élève retrouve son compte avec le code de récupération.
  const other = await browser.newContext();
  const phone = await other.newPage();
  await phone.goto('/eleve/code');
  await phone.getByLabel('Mon code de récupération').fill(recovery);
  await phone.getByRole('button', { name: 'Retrouver mon compte' }).click();
  await expect(phone.getByText(pseudo)).toBeVisible();
  await other.close();

  // Le parent saisit l'invitation dans son Espace parent : le profil rejoint la famille.
  const parentContext = await browser.newContext();
  const parent = await parentContext.newPage();
  await signupFamily(parent, uniqueEmail(), { premium: false });
  await parent.goto('/parent/profils');
  await parent.getByLabel('Code d’invitation').fill(invitation);
  await parent.getByRole('button', { name: 'Rattacher', exact: true }).click();
  await expect(parent.getByRole('status')).toContainText(`Rattaché : ${pseudo}`);
  await expect(parent.getByRole('listitem').filter({ hasText: pseudo })).toBeVisible();
  // Le code est à usage unique.
  await parent.getByLabel('Code d’invitation').fill(invitation);
  await parent.getByRole('button', { name: 'Rattacher', exact: true }).click();
  await expect(parent.getByRole('alert')).toContainText('pas valable');
  await parentContext.close();
});
