import { expect, test, type Page } from '@playwright/test';
import { signupFamily } from './family.ts';

const tabs = (page: Page) => page.getByRole('navigation', { name: 'Rubriques de l’Espace parent' });

test('Espace parent : navigation stable, chaque chemin reste dans l’espace, un seul retour au jeu', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(`Par${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/hub/);

  await page.goto('/parent');
  await expect(page.getByRole('heading', { level: 1, name: 'Progrès de vos enfants' })).toBeVisible();
  await expect(tabs(page).getByRole('link', { name: 'Progrès' })).toHaveAttribute('aria-current', 'page');

  // Chaque rubrique : titre clair, onglet courant, « Retour au jeu » toujours visible, URL sous /parent.
  for (const [tab, title] of [
    ['Abonnement', 'Abonnement familial'],
    ['Profils', 'Profils des enfants'],
    ['Réglages', 'Réglages'],
    ['Progrès', 'Progrès de vos enfants'],
  ] as const) {
    await tabs(page).getByRole('link', { name: tab }).click();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(tabs(page).getByRole('link', { name: tab })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('button', { name: 'Retour au jeu' })).toBeVisible();
    await expect(page).toHaveURL(/\/parent(\/|$)/);
  }

  // Détail d'un enfant, puis retour à la liste des enfants.
  await page.getByRole('link', { name: /Voir les progrès de/ }).click();
  await expect(page).toHaveURL(/\/parent\/enfant\//);
  await expect(tabs(page).getByRole('link', { name: 'Progrès' })).toHaveAttribute('aria-current', 'page');
  // Avancement par matière (comme les menus du jeu) ; un toucher ouvre le détail par chapitre.
  await page.getByRole('button', { name: /^Maths : \d+ notions? maîtrisées? sur \d+/ }).click();
  await expect(page.getByRole('heading', { name: 'Maths, chapitre par chapitre' })).toBeVisible();
  await page.getByRole('link', { name: /Tous les enfants/ }).click();
  await expect(page).toHaveURL(/\/parent$/);

  // Ajout d'un profil : on revient à la liste des profils, pas au jeu.
  await tabs(page).getByRole('link', { name: 'Profils' }).click();
  await page.getByRole('link', { name: 'Ajouter un enfant' }).click();
  await expect(page).toHaveURL(/\/parent\/profils\/nouveau$/);
  await page.getByPlaceholder('Ex. Léa').fill('Second');
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2012-05-01');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: 'Ajouter cet enfant' }).click();
  await expect(page).toHaveURL(/\/parent\/profils$/);
  await expect(page.getByText('Second', { exact: true })).toBeVisible();

  // Retour de paiement et anciennes adresses : on reste dans l'Espace parent.
  await page.goto('/parent/abonnement?paiement=annule');
  await expect(page.getByText(/Paiement annulé/)).toBeVisible();
  await page.goto('/abonnement?paiement=ok');
  await expect(page).toHaveURL(/\/parent\/abonnement\?paiement=ok/);
  await expect(page.getByText(/Merci/)).toBeVisible();

  // Verrouiller : le code est redemandé sur place (pas de retour au jeu).
  await page.getByRole('button', { name: 'Verrouiller' }).click();
  await expect(page).toHaveURL(/\/parent\/abonnement/);
  await expect(page.getByLabel('Mot de passe du compte familial')).toBeVisible();

  // Le seul bouton qui sort : « Retour au jeu ».
  await page.getByRole('button', { name: 'Retour au jeu' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('Recommandation : le parent recommande une notion avec un mot, l’enfant la voit à l’accueil et la lance', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(`Rec${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/hub/);
  // Pas de recommandation : rien à l'accueil.
  await expect(page.getByRole('region', { name: 'Ton parent te recommande' })).toHaveCount(0);

  // Espace parent : matière, notion, petit mot (140 caractères au plus).
  await page.goto('/parent');
  await page.getByRole('link', { name: /Voir les progrès de/ }).click();
  await page.getByRole('button', { name: 'Recommander un entraînement' }).click();
  const form = page.getByRole('form', { name: 'Nouvelle recommandation' });
  await form.getByLabel('Matière').selectOption({ label: 'Maths' });
  await form.getByLabel('Notion').selectOption('m5-tables');
  await expect(form.getByLabel(/Un petit mot/)).toHaveAttribute('maxlength', '140');
  await form.getByLabel(/Un petit mot/).fill('Courage, tu vas y arriver !');
  await form.getByRole('button', { name: /^Envoyer à/ }).click();
  const pending = page.getByRole('list', { name: 'Recommandations en attente' });
  await expect(pending).toContainText('Courage, tu vas y arriver !');

  // Côté enfant : le mot de son parent, et un bouton qui lance l'entraînement de la notion.
  await page.getByRole('button', { name: 'Retour au jeu' }).click();
  await page.goto('/hub');
  const reco = page.getByRole('region', { name: 'Ton parent te recommande' });
  await expect(reco).toContainText('Courage, tu vas y arriver !');
  await reco.getByRole('button', { name: 'S’entraîner' }).click();
  await expect(page).toHaveURL(/\/partie\/entrainement\/m5-calcul\/m5-tables$/);
});
