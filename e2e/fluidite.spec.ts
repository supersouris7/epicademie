import { expect, test, type Page } from '@playwright/test';
import { createFirstProfile, signupFamily } from './family.ts';

/**
 * Fluidité, sur tablette avec 50 ms de latence réseau : après la première ouverture, chaque écran
 * des parcours clés est utilisable en moins de 300 ms, sans jamais afficher de message d'attente.
 * Le chronomètre part de l'appui, dans la page, et s'arrête quand le contenu attendu est affiché.
 */
const LATENCY_MS = 50;
const BUDGET_MS = 300;
/** Temps laissé au premier écran avant le 1er appui : un joueur ne va pas plus vite. */
const FIRST_LOOK_MS = 2000;

/** Écran utilisable : tous ces éléments sont affichés (texte facultatif). */
type Ready = readonly (readonly [selector: string, text?: string])[];

declare global {
  interface Window {
    tappedAt?: number;
    sawWaiting?: boolean;
  }
}

async function tap(page: Page, press: () => Promise<void>, ready: Ready): Promise<number> {
  await page.evaluate(() => {
    window.tappedAt = undefined;
    addEventListener('click', () => (window.tappedAt = performance.now()), { capture: true, once: true });
  });
  await press();
  const done = await page.waitForFunction(
    (wanted) => {
      if (document.body.innerText.includes('Chargement')) window.sawWaiting = true;
      const shown = wanted.every(([selector, text]) =>
        [...document.querySelectorAll(selector)].some(
          (el) => el.getClientRects().length > 0 && (!text || el.textContent.includes(text)),
        ),
      );
      return shown && window.tappedAt !== undefined ? Math.round(performance.now() - window.tappedAt) : false;
    },
    ready,
    { polling: 'raf', timeout: 20_000 },
  );
  return (await done.jsonValue()) as number;
}

test('Parcours clés utilisables en moins de 300 ms avec 50 ms de latence', async ({ page }, info) => {
  test.skip(info.project.name !== 'tablette', 'mesure sur le profil tablette');
  test.setTimeout(90_000);
  await signupFamily(page);
  const name = `Flu${Date.now() % 10000}`;
  await page.getByPlaceholder('Ex. Léa').fill(name);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await createFirstProfile(page);

  const network = await page.context().newCDPSession(page);
  await network.send('Network.enable');
  await network.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: LATENCY_MS,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });

  // Première ouverture : nouvelle page, rien en mémoire.
  await page.goto('/');
  const player = page.getByRole('button', { name: new RegExp(name) });
  await expect(player).toBeVisible();
  await page.waitForTimeout(FIRST_LOOK_MS);

  const times: Record<string, number> = {};
  const button = (label: string | RegExp, exact = true) => page.getByRole('button', { name: label, exact }).first();
  const back = () => button('Retour').click();
  const home = () => expect(page.locator('ul[aria-label="Jouer"]')).toBeVisible();

  times.hub = await tap(page, () => player.click(), [['ul[aria-label="Jouer"] button']]);

  times.entrainement = await tap(page, () => button(/Entraînement/, false).click(), [
    ['h1', 'Entraînement'],
    ['button[aria-label="Maths"]'],
  ]);
  times['entrainement (chapitres)'] = await tap(page, () => button('Maths').click(), [
    ['h1', 'Entraînement · Maths'],
    ['main ul li button', 'acquise'],
  ]);
  await back();
  await back();
  await home();

  times.boss = await tap(page, () => button(/Mode Histoire/, false).click(), [['h1', 'Mode Histoire']]);
  // L'Empereur du Savoir se présente une fois par jour : des appuis le passent.
  const emperor = page.getByRole('dialog', { name: 'L’Empereur du Savoir' });
  await expect(async () => {
    if (await emperor.count()) await emperor.click({ timeout: 500 });
    await expect(emperor).toHaveCount(0, { timeout: 300 });
  }).toPass();
  times['boss (chapitres)'] = await tap(page, () => button('Maths').click(), [['#equipement']]);
  await page.goBack();
  await back();
  await home();

  times['progrès'] = await tap(page, () => button('Progrès').click(), [['ul[aria-label="Progrès par matière"] li']]);

  await button('Changer de joueur').click();
  await expect(player).toBeVisible();
  times.parent = await tap(page, () => button(/Espace parent/, false).click(), [
    ['h1', 'Progrès de vos enfants'],
    ['li[aria-label^="Progrès de"] button[aria-label^="Maths"]'],
  ]);

  const report = Object.entries(times)
    .map(([journey, ms]) => `${journey} : ${ms} ms`)
    .join(' · ');
  console.log(`FLUIDITE ${report}`);
  info.annotations.push({ type: 'fluidité', description: report });
  for (const [journey, ms] of Object.entries(times)) expect.soft(ms, journey).toBeLessThan(BUDGET_MS);
  expect.soft(await page.evaluate(() => window.sawWaiting === true), 'message d’attente affiché').toBe(false);
});
