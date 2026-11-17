import { expect, test, type Page } from '@playwright/test';
import { fmt, generate, type Question } from '../packages/content/src/index.ts';
import type { BattleAnswerResult, BattleView } from '../packages/shared/src/index.ts';

type Answer = { kind: 'choice'; index: number } | { kind: 'number'; text: string };

function response(q: Question, right: boolean): Answer {
  const a = q.answer;
  if (a.kind === 'choice') return { kind: 'choice', index: right ? a.correct : a.correct === 0 ? 1 : 0 };
  if (a.kind === 'number') return { kind: 'number', text: right ? fmt(a.value) : '987654' };
  throw new Error(`réponse ${a.kind} non gérée`);
}

/** Répond dans l'interface (pavé au clavier physique, ou bouton du QCM). */
async function answer(page: Page, view: BattleView, right: boolean) {
  const q = view.question;
  if (!q) throw new Error('pas de question');
  const question = generate(q.skillId, q.level, q.seed);
  const main = page.locator(`main[data-turn="${view.turn}"]`);
  await expect(main).toBeVisible();
  const sent = page.waitForResponse((r) => r.url().includes('/answers'));
  const r = response(question, right);
  if (r.kind === 'choice') {
    await main.getByRole('tabpanel').getByRole('button').nth(r.index).click();
  } else {
    await page.keyboard.type(r.text.replace('−', '-'));
    await page.keyboard.press('Enter');
  }
  return ((await (await sent).json()) as BattleAnswerResult).battle;
}

test('Combat de boss : ouvert d’emblée, mobs, riposte, victoire et coffre', async ({ page }) => {
  test.setTimeout(90_000);
  const name = `Boss${Date.now() % 10000}`;
  await page.goto('/');
  await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  await page.getByPlaceholder('Ex. Léa').fill(name);
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/\/hub$/);

  await page.getByRole('button', { name: /^Combat de boss/ }).click();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Combat de boss' })).toBeVisible();
  // Tous les boss sont ouverts d'emblée ; chapitres sans boss « À venir ». Panneau « Équipement ».
  const relatifs = page.getByRole('listitem').filter({ hasText: 'Nombres relatifs' });
  await expect(page.getByRole('heading', { name: 'Équipement' })).toBeVisible();
  await expect(page.getByText('Munitions')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Calcul mental, boss à venir' })).toBeVisible();
  const started = page.waitForResponse((r) => r.url().endsWith('/api/battles'));
  await relatifs.getByRole('button', { name: 'Combattre' }).click();
  let view = (await (await started).json()) as BattleView;
  await expect(page.getByText('Mobs 1/7')).toBeVisible();
  await expect(page.getByRole('img', { name: '3 cœurs sur 3' })).toBeVisible();

  // 1re réponse fausse : riposte, un cœur de moins, explication courte.
  view = await answer(page, view, false);
  await expect(page.getByRole('img', { name: '2 cœurs sur 3' })).toBeVisible();
  await expect(page.getByText(/La bonne réponse/)).toBeVisible();
  await page.getByRole('button', { name: 'Voir tout' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Puis sans faute jusqu'au boss et à sa défaite.
  let sawBoss = false;
  while (view.status === 'fighting') {
    if (view.mobsDefeated === 7 && !sawBoss) {
      await expect(page.getByRole('progressbar', { name: /Vies de/ })).toBeVisible();
      sawBoss = true;
    }
    view = await answer(page, view, true);
  }
  expect(view.status).toBe('won');
  await expect(page.getByRole('heading', { name: /est vaincu/ })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('1re victoire : le coffre !')).toBeVisible();

  await page.getByRole('button', { name: 'Autres boss' }).click();
  await expect(relatifs.getByRole('button', { name: 'Rejouer' })).toBeVisible();
  await expect(relatifs).toContainText('vaincu 1 fois');
  // Le coffre a rempli l'équipement.
  await expect(page.getByText('Bouclier × 1')).toBeVisible();
});
