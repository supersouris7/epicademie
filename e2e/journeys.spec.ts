import { expect, test, type Page } from '@playwright/test';
import { loginFamily, PASSWORD, signupFamily } from './family.ts';

/** Crée un profil depuis l'écran de création (après inscription ou « Nouveau joueur »). */
async function createProfile(page: Page, name: string, birthDate = '2014-03-09') {
  await page.getByPlaceholder('Ex. Léa').fill(name);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill(birthDate);
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/hub/);
}

test('Compte : déconnexion de l’appareil, reconnexion, profils et progrès retrouvés', async ({ page }) => {
  const email = await signupFamily(page);
  const name = `Cpt${Date.now() % 10000}`;
  await createProfile(page, name);
  await page.goto('/parametres');
  await page.getByRole('button', { name: 'Déconnecter cet appareil' }).click();
  await expect(page).toHaveURL(/\/connexion$/);
  await loginFamily(page, email);
  await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
});

test('Espace parent : enfant listé, accès à l’abonnement familial', async ({ page }) => {
  await signupFamily(page);
  const name = `Par${Date.now() % 10000}`;
  await createProfile(page, name);
  await page.goto('/parent');
  await expect(page.getByRole('heading', { name: 'Progrès de vos enfants' })).toBeVisible();
  await expect(page.getByRole('listitem', { name: `Progrès de ${name}` })).toBeVisible();
  await page.getByRole('link', { name: 'Abonnement', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Abonnement actif' })).toBeVisible();

  // Code PIN : choisi dans les Réglages parent (mot de passe du compte), puis l'Espace parent s'ouvre avec.
  await page.getByRole('link', { name: 'Réglages' }).click();
  await page.getByRole('button', { name: 'Choisir un code PIN' }).click();
  await page.getByLabel('Mot de passe du compte').fill(PASSWORD);
  await page.getByLabel(/Nouveau code PIN/).fill('2580');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Code PIN enregistré.')).toBeVisible();
  await page.getByRole('button', { name: 'Verrouiller' }).click();
  for (const k of ['2', '5', '8', '0']) await page.getByRole('button', { name: k, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Réglages' })).toBeVisible();
  await page.getByRole('link', { name: 'Progrès', exact: true }).click();
  await expect(page.getByRole('listitem', { name: `Progrès de ${name}` })).toBeVisible();
});

test('Adulte : parcours de remise à niveau en maths', async ({ page }) => {
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(`Adu${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('1985-05-01');
  await expect(page.getByText('Tu es un adulte ?')).toBeVisible();
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/hub/);
  await page.goto('/jouer/entrainement/maths');
  const grades = page.getByRole('radiogroup', { name: 'Classe' });
  await expect(grades.getByRole('radio', { name: /Adulte/ })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('button', { name: /Nombres entiers et décimaux/ }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: /Pythagore/ }).last()).toBeVisible();
});

test('Anglais : chapitre des verbes irréguliers jouable', async ({ page }) => {
  await signupFamily(page);
  await createProfile(page, `Eng${Date.now() % 10000}`);
  await page.getByRole('button', { name: /Entraînement/ }).click();
  await page.getByRole('button', { name: 'Anglais', exact: true }).click();
  await page
    .getByRole('button', { name: /Les verbes irréguliers/ })
    .last()
    .click();
  await page
    .getByRole('button', { name: /Épreuve du chapitre|prétérit/i })
    .first()
    .click();
  await expect(page.getByRole('progressbar', { name: 'Progression de la série' })).toBeVisible();
  await expect(page.getByText(/prétérit|participe passé|Complète/).first()).toBeVisible();
});

test('Mes progrès : trophées et badges visibles dès le départ', async ({ page }) => {
  await signupFamily(page);
  await createProfile(page, `Pro${Date.now() % 10000}`);
  await page.goto('/progres');
  await page.getByRole('button', { name: /Trophées, badges et inventaire/ }).click();
  await expect(page.getByRole('heading', { name: 'Trophées et badges' }).first()).toBeVisible();
  await expect(page.getByText(/Acad-Héros trouvés/)).toHaveCount(0);
  await expect(page.getByText('Chasseur de boss').first()).toBeVisible();
});

test('Mise en page : aucun défilement horizontal sur les écrans principaux', async ({ page }) => {
  await signupFamily(page);
  await createProfile(page, `Lay${Date.now() % 10000}`);
  for (const path of [
    '/hub',
    '/progres',
    '/heros',
    '/multi',
    '/jouer/entrainement/maths',
    '/parent/abonnement',
    '/parent',
    '/parent/profils',
    '/parent/reglages',
    '/tv',
  ]) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});

test('Vocabulaire : le dictionnaire explique « quotient » avec la division posée et le partage', async ({ page }) => {
  await signupFamily(page);
  await createProfile(page, `Voc${Date.now() % 10000}`);
  // Le dictionnaire n'est plus dans le menu ; la page reste accessible par son adresse.
  await page.goto('/dictionnaire');
  await page.getByRole('button', { name: 'quotient', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Le mot « quotient »' });
  await expect(dialog.getByLabel('Division de 23 par 5 expliquée en image')).toBeVisible();
  await expect(dialog.getByText('4 paquets', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'J’ai compris' }).click();
  await page.getByRole('button', { name: /cm² \(centimètre carré\)/ }).click();
  await expect(page.getByRole('dialog').getByLabel(/le lien entre cm, cm² et cm³/)).toBeVisible();
});
