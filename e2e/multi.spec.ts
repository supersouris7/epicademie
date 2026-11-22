import { expect, test, type Browser, type Page } from '@playwright/test';
import { fmt, generate } from '../packages/content/src/index.ts';
import type { ArenaView } from '../packages/shared/src/index.ts';
import { loginFamily, signupFamily } from './family.ts';

/** Un appareil de la famille : le 1er crée le compte, les suivants s'y connectent. */
async function newPlayer(browser: Browser, name: string, family: { email?: string }): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  if (family.email) {
    await loginFamily(page, family.email);
    await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  } else family.email = await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(name);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/hub/);
  return page;
}

test('Plusieurs joueurs : connectés, message, profil déjà ouvert refusé, arène', async ({ browser }) => {
  test.setTimeout(120_000);
  const suffix = Date.now() % 10000;
  const family: { email?: string } = {};
  const lea = await newPlayer(browser, `Léa${suffix}`, family);
  const tom = await newPlayer(browser, `Tom${suffix}`, family);

  // Tom arrive : petite bulle chez Léa (elle était déjà connectée).
  await expect(lea.getByRole('status').filter({ hasText: `Tom${suffix} vient de se connecter` })).toBeVisible();
  // Questy annonce les joueurs connectés dans le menu Multijoueur (plus sur l'accueil).
  await expect(lea.getByRole('button', { name: /Joueurs connectés/ })).toHaveCount(0);
  await lea.getByRole('navigation', { name: 'Menu principal' }).getByRole('button', { name: 'Multi' }).click();
  await expect(lea.getByRole('button', { name: /Joueurs connectés : [1-9]/ })).toBeVisible();
  await expect(lea.getByText(new RegExp(`Tom${suffix}`)).first()).toBeVisible();

  // Message prédéfini : notification en haut de l'écran de Tom.
  await lea.getByRole('button', { name: /Joueurs connectés/ }).click();
  await lea.getByRole('button', { name: `Message à Tom${suffix}` }).click();
  await lea.getByRole('button', { name: 'Bien joué !' }).click();
  await expect(tom.getByRole('alert')).toContainText('Bien joué !');

  // Arène : Léa invite Tom ; Tom accepte depuis la notification ; Léa lance.
  await lea.goto(`/arene`);
  await lea.getByRole('checkbox').first().check();
  await lea.getByRole('button', { name: 'Envoyer les invitations' }).click();
  await tom.getByRole('alert').getByRole('button', { name: 'J’y vais !' }).click();
  await expect(tom).toHaveURL(/arene/);
  await lea.getByRole('button', { name: 'Lancer le combat' }).click();

  // Chacun répond à son tour : Léa juste, Tom faux ; Léa gagne.
  const view = async (page: Page) =>
    (await page.evaluate(() => (window as unknown as { __arena?: ArenaView }).__arena)) ?? null;
  for (let i = 0; i < 30; i++) {
    await lea.waitForTimeout(300);
    const v = await view(lea);
    if (!v || v.phase === 'over') break;
    if (v.phase !== 'playing' || !v.question) continue;
    const q = generate(v.question.skillId, v.question.level, v.question.seed);
    const leaTurn = (await lea.getByText('À toi de jouer !').count()) > 0;
    const page = leaTurn ? lea : tom;
    if (!leaTurn && (await tom.getByText('À toi de jouer !').count()) === 0) continue;
    const turn = v.turn;
    if (q.answer.kind === 'choice') {
      const idx = leaTurn ? q.answer.correct : q.answer.correct === 0 ? 1 : 0;
      await page.getByRole('tabpanel').getByRole('button').nth(idx).click();
    } else if (q.answer.kind === 'number') {
      await page.keyboard.type(leaTurn ? fmt(q.answer.value).replace('−', '-') : '987654');
      await page.keyboard.press('Enter');
    } else throw new Error(q.answer.kind);
    await expect.poll(async () => (await view(lea))?.turn ?? 0).toBeGreaterThan(turn);
  }
  await expect(lea.getByRole('heading', { name: 'Victoire !' })).toBeVisible();
  await expect(tom.getByRole('heading', { name: new RegExp(`Léa${suffix} a gagné`) })).toBeVisible();

  // Rejouer tout de suite : Tom reçoit une nouvelle invitation (la partie finie ne bloque plus).
  await lea.getByRole('button', { name: 'Suite' }).click();
  await lea.getByRole('button', { name: 'Rejouer' }).click();
  await expect(tom.getByRole('alert').getByRole('button', { name: 'J’y vais !' })).toBeVisible();

  // Le profil de Léa ouvert sur un autre appareil : ce nouvel appareil prend la main,
  // l'ancien revient au choix du joueur avec un message.
  const other = await (await browser.newContext()).newPage();
  await loginFamily(other, family.email ?? '');
  await other.getByRole('button', { name: new RegExp(`Léa${suffix}`) }).click();
  await expect(other).toHaveURL(/hub/);
  await expect(lea.getByText(/ouvert sur un autre appareil/).first()).toBeVisible();
});

test('Raid coopératif sur deux téléphones, partie affichée en grand sur l’écran TV', async ({ browser }) => {
  test.setTimeout(120_000);
  const suffix = Date.now() % 10000;
  const family: { email?: string } = {};
  const lea = await newPlayer(browser, `Léa${suffix}`, family);
  const tom = await newPlayer(browser, `Tom${suffix}`, family);
  const tv = await (await browser.newContext()).newPage();
  await loginFamily(tv, family.email ?? '');
  await tv.goto('/tv');
  await expect(tv.getByText(/la partie s’affichera ici/)).toBeVisible();

  await lea.goto('/arene?mode=raid');
  await lea.getByRole('checkbox').first().check();
  await lea.getByRole('button', { name: 'Envoyer les invitations' }).click();
  await tom.getByRole('alert').getByRole('button', { name: 'J’y vais !' }).click();
  await lea.getByRole('button', { name: 'Lancer le combat' }).click();
  await expect(tv.getByRole('progressbar', { name: 'Vie du boss' })).toBeVisible();

  // Toute l'équipe répond juste, à tour de rôle, jusqu'à la chute du boss.
  const view = async (page: Page) =>
    (await page.evaluate(() => (window as unknown as { __arena?: ArenaView }).__arena)) ?? null;
  for (let i = 0; i < 30; i++) {
    await lea.waitForTimeout(300);
    const v = await view(lea);
    if (!v || v.phase === 'over') break;
    if (v.phase !== 'playing' || !v.question) continue;
    const q = generate(v.question.skillId, v.question.level, v.question.seed);
    const page = (await lea.getByText('À toi de jouer !').count()) > 0 ? lea : tom;
    if (page === tom && (await tom.getByText('À toi de jouer !').count()) === 0) continue;
    if (q.answer.kind === 'choice') await page.getByRole('tabpanel').getByRole('button').nth(q.answer.correct).click();
    else if (q.answer.kind === 'number') {
      await page.keyboard.type(fmt(q.answer.value).replace('−', '-'));
      await page.keyboard.press('Enter');
    } else throw new Error(q.answer.kind);
    await expect.poll(async () => (await view(lea))?.turn ?? 0).toBeGreaterThan(v.turn);
  }
  await expect(lea.getByRole('heading', { name: 'Boss vaincu ! Bravo l’équipe !' })).toBeVisible();
  await expect(tv.getByRole('heading', { name: 'Boss vaincu ! Bravo l’équipe !' })).toBeVisible();
});
