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
  // Classe déduite de l'âge : Questy demande de confirmer dans une fenêtre au premier plan ;
  // « Non » ouvre la liste (du CM1 à la 3e, et Adulte).
  const gradeDialog = page.getByRole('dialog', { name: 'Ta classe' });
  await expect(gradeDialog).toContainText('Tu es en 5e ?');
  await gradeDialog.getByRole('button', { name: 'Non', exact: true }).click();
  await expect(gradeDialog).toHaveCount(0);
  await expect(page.getByRole('radio', { name: 'CM1', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: '3e', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Adulte', exact: true })).toBeVisible();
  await page.getByRole('radio', { name: '5e', exact: true }).click();
  await page.getByRole('button', { name: 'Avatar 05' }).click();
  await expect(page.getByRole('button', { name: 'Avatar 05' })).toHaveAttribute('aria-pressed', 'true');
  // Le héros ne se choisit plus dans le profil : il a son propre menu.
  await expect(page.getByRole('radiogroup', { name: 'Ton héros' })).toHaveCount(0);
  await page.getByRole('button', { name: /C’est parti/ }).click();

  await expect(page).toHaveURL(/\/hub$/);
  // Barre du haut : le joueur en bref (prénom, niveau, pièces).
  await expect(page.getByRole('group', { name: 'Mon joueur' })).toContainText(name);
  await expect(page.getByRole('progressbar', { name: /^Niveau 1/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Plein écran' })).toHaveCount(0);
  // Une fille : Lina est proposée par défaut.
  await expect(page.getByRole('button', { name: /Lina.*changer de héros/ })).toBeVisible();
  // Menu « Mon héros » : Alex et Lina débloqués dès le début.
  await page.getByRole('button', { name: /Lina.*changer de héros/ }).click();
  await expect(page.getByRole('heading', { name: 'Mon héros' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Lina/ })).toBeChecked();
  await expect(page.getByRole('heading', { name: 'Choisis ton héros' })).toBeVisible();
  await page.getByRole('radio', { name: /Alex/ }).click();
  await expect(page.getByRole('radio', { name: /Alex/ })).toBeChecked();
  // Barre de navigation du bas sur les écrans principaux.
  const nav = page.getByRole('navigation', { name: 'Menu principal' });
  await nav.getByRole('button', { name: 'Progrès' }).click();
  // Résumé par matière, puis le détail des maths.
  await page.getByRole('button', { name: /^Maths : 0 notions médaillées sur 72/ }).click();
  await expect(page.getByText(/0 \/ 72 notions médaillées/)).toBeVisible();
  // Domaines repliés : un toucher ouvre le domaine et montre ses chapitres.
  const domain = page.getByRole('button', { name: /^Nombres et calculs/ });
  await expect(domain).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', { name: 'Calcul mental' })).toBeHidden();
  await domain.click();
  await expect(page.getByRole('heading', { name: 'Calcul mental' })).toBeVisible();
  await nav.getByRole('button', { name: 'Accueil' }).click();

  // Modes : Entraînement, Mode Histoire et les défis (Contre-la-montre, Survie) sont jouables.
  await expect(page.getByRole('button', { name: /^Entraînement/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Mode Histoire/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Duels/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Arène d’évaluation, à venir' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(page.locator('section[aria-labelledby^="groupe-"] button')).toHaveCount(6);
  for (const gone of ['Révisions du jour', 'Atelier des erreurs', 'Défi du jour', 'Bilan']) {
    await expect(page.getByRole('button', { name: new RegExp(gone) })).toHaveCount(0);
  }
  await page.getByRole('button', { name: /^Survie/ }).click();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  await expect(page.getByText(/3 cœurs. Chaque erreur coûte un cœur et casse ta série/)).toBeVisible();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByRole('img', { name: '3 cœurs sur 3' })).toBeVisible();
  await page.getByRole('button', { name: 'Arrêter' }).click();
  await expect(page.getByRole('heading', { name: /points/ })).toBeVisible();

  // Contre-la-montre : tirage figé (toujours « Calcule 3 × 2. ») et horloge simulée pour ne pas attendre 60 s.
  await page.goto('/hub');
  await page.getByRole('button', { name: /^Contre-la-montre/ }).click();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  await expect(page.getByText(/chaque bonne réponse te rend du temps/)).toBeVisible();
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  await page.clock.install();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page.getByText('Calcule 3 × 2.')).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Temps restant' })).toBeVisible();
  const answer = async (digit: string) => {
    await page.getByRole('button', { name: digit, exact: true }).click();
    await page.getByRole('button', { name: 'OK' }).click();
  };
  // Bonne réponse : des points et du temps gagné (selon la durée de référence de la question).
  await answer('6');
  await expect(page.getByText(/^\+\d+(,\d)? s$/)).toBeVisible();
  await expect(page.getByRole('status')).toContainText(/Bonne réponse ! \+\d+/);
  await expect(page.getByLabel(/^[1-9]\d* points$/)).toBeVisible();
  await expect(page.getByRole('timer')).toHaveText(/⏱ 6\d s/);
  await expect(page.getByRole('status')).toBeHidden();
  // Erreur : −5 s et série perdue.
  await answer('1');
  await expect(page.getByText('−5 s', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('−5 s, série perdue');
  await expect(page.getByRole('timer')).toHaveText(/⏱ [56]\d s/);
  // Fin de partie : l'horloge saute au-delà du temps restant.
  await page.clock.fastForward(70_000);
  await expect(page.getByRole('heading', { name: /\d+ points/ })).toBeVisible();
  await page.getByRole('button', { name: /Revoir mes erreurs \(1\)/ }).click();
  await expect(page.getByRole('list', { name: 'Mes erreurs' })).toContainText('Calcule 3 × 2.');
  await expect(page.getByRole('list', { name: 'Mes erreurs' })).toContainText('Bonne réponse : 6');
  await page.goto('/hub');
  // Mode d'abord, matière ensuite.
  await page.getByRole('button', { name: /^Entraînement/ }).click();
  // Matières : toutes jouables (maths, anglais, espagnol, sciences, géographie, histoire).
  await expect(page.getByRole('button', { name: 'Maths', exact: true })).toBeVisible();
  // Toutes les matières sont jouables.
  for (const subject of ['Anglais', 'Espagnol', 'Sciences', 'Géographie', 'Histoire']) {
    await expect(page.getByRole('button', { name: subject, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('button', { name: /à venir/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Retour' }).click();
  await nav.getByRole('button', { name: 'Multi' }).click();
  // Multi : seuls les Duels sont proposés.
  await expect(page.getByRole('button', { name: /Duels/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Modes multijoueur' }).getByRole('listitem')).toHaveCount(1);

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
