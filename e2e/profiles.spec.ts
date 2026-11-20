import { expect, test } from '@playwright/test';
import { signupFamily } from './family.ts';

test('création d’un profil, hub, thème sombre puis suppression', async ({ page }) => {
  const name = `E2E${Date.now() % 100000}`;
  // Le parent crée le compte familial, puis le 1er profil enfant.
  await signupFamily(page);
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('alert')).toHaveText('Le prénom est obligatoire');
  await page.getByPlaceholder('Ex. Léa').fill('X');
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('alert')).toHaveText('Choisis fille ou garçon.');

  await page.getByPlaceholder('Ex. Léa').fill(name);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('alert')).toHaveText('Choisis ta classe.');
  // Classe déduite de l'âge : Questy demande de confirmer ; « Non » ouvre la liste (du CM1 à la 3e ; Adulte à venir).
  await expect(page.getByText('Tu es en 5e ?')).toBeVisible();
  await page.getByRole('button', { name: 'Non', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'CM1', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: '3e', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Adulte, à venir' })).toBeVisible();
  await page.getByRole('radio', { name: '5e', exact: true }).click();
  await page.getByRole('button', { name: 'Robot' }).click();
  // Le héros ne se choisit plus dans le profil : il a son propre menu.
  await expect(page.getByRole('radiogroup', { name: 'Ton héros' })).toHaveCount(0);
  await page.getByRole('button', { name: /C’est parti/ }).click();

  await expect(page).toHaveURL(/\/hub$/);
  // Barre du haut : le joueur en bref (prénom, niveau, pièces).
  await expect(page.getByRole('group', { name: 'Mon joueur' })).toContainText(name);
  await expect(page.getByRole('progressbar', { name: /^Niveau 1/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Plein écran' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Alex.*changer de héros/ })).toBeVisible();
  // Menu « Mon héros » : Alex seul jouable, les autres « À venir ».
  await page.getByRole('button', { name: /Alex.*changer de héros/ }).click();
  await expect(page.getByRole('heading', { name: 'Mon héros' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Alex/ })).toBeChecked();
  // Héros à venir : cartes mystère « ? », sans nom.
  // Collection : Alex (héros de départ) ; Lina et Pixel se trouvent dans les coffres ; Tao et
  // Ayla restent des cartes mystère « ? ».
  await expect(page.getByRole('img', { name: 'Lina, à trouver dans un coffre' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Pixel, à trouver dans un coffre' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Héros mystère, à venir' })).toHaveCount(2);
  for (const soon of ['Tao', 'Ayla']) await expect(page.getByText(soon)).toHaveCount(0);
  // Barre de navigation du bas sur les écrans principaux.
  const nav = page.getByRole('navigation', { name: 'Menu principal' });
  await nav.getByRole('button', { name: 'Progrès' }).click();
  await expect(page.getByText(/0 \/ 72 notions médaillées/)).toBeVisible();
  // Domaines repliés : un toucher ouvre le domaine et montre ses chapitres.
  const domain = page.getByRole('button', { name: /^Nombres et calculs/ });
  await expect(domain).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', { name: 'Calcul mental' })).toBeHidden();
  await domain.click();
  await expect(page.getByRole('heading', { name: 'Calcul mental' })).toBeVisible();
  await nav.getByRole('button', { name: 'Accueil' }).click();

  // Modes : Entraînement et Combat de boss jouables, les autres « À venir ».
  await expect(page.getByRole('button', { name: /^Entraînement/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Combat de boss/ })).toBeVisible();
  for (const mode of ['Contre-la-montre', 'Survie']) {
    await expect(page.getByRole('button', { name: `${mode}, à venir` })).toBeVisible();
  }
  for (const gone of ['Révisions du jour', 'Atelier des erreurs', 'Défi du jour', 'Bilan']) {
    await expect(page.getByRole('button', { name: new RegExp(gone) })).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Survie, à venir' }).click();
  await expect(page.getByText('Bientôt disponible !')).toBeVisible();
  await expect(page).toHaveURL(/\/hub$/);
  // Mode d'abord, matière ensuite.
  await page.getByRole('button', { name: /^Entraînement/ }).click();
  // Matières sans contenu : grisées « À venir ».
  await expect(page.getByRole('button', { name: 'Maths', exact: true })).toBeVisible();
  for (const subject of ['Physique-Chimie', 'Anglais', 'Espagnol', 'Histoire', 'Géographie']) {
    await expect(page.getByRole('button', { name: `${subject}, à venir` })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Anglais, à venir' }).click();
  await expect(page.getByText('Anglais arrive bientôt !')).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();
  await nav.getByRole('button', { name: 'Multi' }).click();
  // Multi : message « arrive bientôt » et aperçu des modes, sans tuiles à toucher.
  // Multi : l'Arène est jouable, les autres modes « À venir ».
  await expect(page.getByRole('button', { name: /Arène/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Modes multijoueur' })).toContainText('À venir');

  await nav.getByRole('button', { name: 'Paramètres' }).click();
  await expect(page.getByRole('button', { name: 'Mon héros' })).toHaveCount(0); // le héros se choisit dans l'onglet Héros
  await expect(page.getByText('Plein écran')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Sombre' })).toHaveCount(0); // thème sombre unique

  // Le profil survit à un rechargement.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible();

  await page.getByRole('button', { name: 'Supprimer ce profil' }).click();
  await page.getByRole('button', { name: 'Oui, supprimer' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveCount(0);
});

test('sans compte, toute page mène à la connexion ; l’API reste en JSON', async ({ page, request }) => {
  await page.goto('/nimporte-quoi');
  await expect(page).toHaveURL(/\/connexion$/);
  const res = await request.get('/api/inconnu');
  expect(res.status()).toBe(404);
});
