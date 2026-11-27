import { expect, test, type Page } from '@playwright/test';
import { fmt, generate, type Question } from '../packages/content/src/index.ts';
import type { BattleAnswerResult, BattleView } from '../packages/shared/src/index.ts';
import { createFirstProfile, signupFamily } from './family.ts';

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

/** L'Empereur du Savoir se présente (une fois par jour) à l'entrée du Mode Histoire : deux touchers. */
async function skipEmperor(page: Page) {
  const emperor = page.getByRole('dialog', { name: 'L’Empereur du Savoir' });
  await expect(emperor).toBeVisible();
  for (let k = 0; k < 2 && (await emperor.isVisible()); k++) {
    await page.waitForTimeout(700); // anti double-toucher
    await emperor.getByRole('button', { name: 'Passer' }).click();
  }
  await expect(emperor).toHaveCount(0);
}

test('Mode Histoire : ouvert d’emblée, mobs, riposte, victoire et coffre', async ({ page }) => {
  test.setTimeout(90_000);
  const name = `Boss${Date.now() % 10000}`;
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(name);
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await createFirstProfile(page);

  await page.getByRole('button', { name: /^Mode Histoire/ }).click();
  await skipEmperor(page);
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  // Gros plan du boss de la matière qui provoque, puis choix du chapitre.
  const closeUp = page.getByRole('dialog', { name: 'Sorcier π te provoque' });
  await expect(closeUp).toContainText(/challenger|Aucun chapitre|n’ont pas mangé|cube/);
  // On passe le gros plan en touchant l'écran.
  await page.waitForTimeout(700); // anti double-toucher
  await closeUp.getByRole('button', { name: 'Passer' }).click();
  await expect(closeUp).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Mode Histoire' })).toBeVisible();
  // Tous les boss sont ouverts d'emblée ; chapitres sans boss « À venir ». Panneau « Équipement ».
  const relatifs = page.getByRole('listitem').filter({ hasText: 'Nombres relatifs' });
  await expect(page.getByRole('heading', { name: 'Équipe-toi pour ce combat' })).toBeVisible();
  await expect(page.getByText('Munitions')).toHaveCount(0);
  // Un boss par chapitre, 5e comprise ; sous le chapitre, la médaille ou « Pas encore vaincu ».
  await expect(page.getByRole('button', { name: /boss à venir/ })).toHaveCount(0);
  await expect(page.getByRole('listitem').filter({ hasText: 'Calcul mental' })).toContainText('Pas encore vaincu');
  const started = page.waitForResponse((r) => r.url().endsWith('/api/v1/battles'));
  await relatifs.getByRole('button', { name: 'Combattre' }).click();
  let view = (await (await started).json()) as BattleView;
  // Entrée en scène en grand avec le mot de Questy, puis bandeau compact.
  // Plus de texte « Combat ! » : l'arène et le face-à-face suffisent.
  await expect(page.getByText('Combat !')).toHaveCount(0);
  // Face-à-face : le boss provoque sur le chapitre, Questy répond.
  await expect(page.getByRole('status', { name: /^Sorcier π : .*relatifs/ })).toBeVisible();
  // Échange de vannes : boss, héros, boss, héros.
  await expect(page.getByTestId('battle-intro').getByRole('status')).toHaveCount(4, { timeout: 10_000 });
  await page.getByRole('button', { name: 'Passer' }).waitFor();
  await page.waitForTimeout(700); // anti double-toucher
  await page.getByRole('button', { name: 'Passer' }).click();
  // Bandeau : mobs restants en barre segmentée, comme des vies.
  await expect(page.getByRole('progressbar', { name: 'Mobs restants' })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('img', { name: '3 cœurs sur 3' })).toBeVisible();
  // Pause : le même bouton qu'à l'entraînement.
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('alertdialog', { name: 'Pause' })).toContainText('le boss garde ses vies');
  await page.getByRole('button', { name: 'Reprendre' }).click();

  // 1re réponse fausse : riposte, un cœur de moins, explication courte.
  view = await answer(page, view, false);
  await expect(page.getByRole('img', { name: '2 cœurs sur 3' })).toBeVisible();
  await expect(page.getByText(/La bonne réponse/)).toBeVisible();
  // L'explication complète s'affiche directement (plus de « Voir tout »).
  await expect(page.getByRole('button', { name: 'Voir tout' })).toHaveCount(0);
  await expect(page.getByText('Tu veux réessayer une question du même type ?')).toBeVisible();
  await page.getByRole('button', { name: 'Oui, j’essaie' }).click();

  // Puis sans faute jusqu'au boss et à sa défaite.
  let sawBoss = false;
  let sawRage = false;
  while (view.status === 'fighting') {
    if (view.bossLives === 1 && !sawRage) {
      // Dernière vie : le boss s'énerve puis passe en rage (deux grandes images), un toucher avance.
      const rage = page.getByRole('dialog', { name: /passe en rage/ });
      await expect(rage).toBeVisible();
      // Trois paliers : début, montée, rage ; un toucher avance.
      for (let k = 0; k < 3; k++) {
        await page.waitForTimeout(700); // anti double-toucher
        await rage.getByRole('button', { name: 'Passer' }).click();
      }
      await expect(rage).toHaveCount(0);
      sawRage = true;
    }
    if (view.mobsDefeated === 4 && !sawBoss) {
      // Arrivée du boss en grand : Questy félicite, sans bouton, un toucher passe.
      const arrival = page.getByTestId('boss-arrival');
      await expect(arrival.getByRole('status')).toHaveCount(3, { timeout: 8000 }); // boss, héros, Questy
      await expect(arrival).not.toContainText('3 vies');
      await expect(arrival.getByText('Touche l’écran pour continuer')).toBeVisible({ timeout: 8000 });
      await page.waitForTimeout(700); // anti double-toucher (le texte est dans le DOM dès l'arrivée)
      await arrival.getByRole('button', { name: 'Passer' }).click();
      await expect(page.getByRole('progressbar', { name: /Vies de/ })).toBeVisible();
      sawBoss = true;
    }
    view = await answer(page, view, true);
  }
  expect(view.status).toBe('won');
  expect(sawRage).toBe(true);
  await expect(page.getByRole('heading', { name: /est vaincu/ })).toBeVisible({ timeout: 10_000 });
  // Coffre de victoire en plein écran (médaille d'argent : rare, parfois épique), à ouvrir.
  const chest = page.getByRole('dialog', { name: 'Un coffre d’équipement !' });
  await expect(chest).toBeVisible();
  await chest.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await page
    .getByRole('dialog', { name: /Coffre (rare|épique)/ })
    .getByRole('button', { name: 'Continuer' })
    .click();
  await expect(page.getByText('1re victoire : un éclat de relique !')).toBeVisible();
  // Un cœur perdu : médaille d'argent.
  await expect(page.getByRole('heading', { name: 'Médaille Argent' })).toBeVisible();

  await page.getByRole('button', { name: 'Suite' }).click();
  await page.getByRole('button', { name: 'Autres boss' }).click();
  await expect(relatifs.getByRole('button', { name: 'Rejouer' })).toBeVisible();
  await expect(relatifs).toContainText('vaincu 1 fois');
  // Le coffre a rempli l'équipement (objet tiré au hasard) ; plus d'achat depuis ce panneau.
  await expect(page.getByRole('button', { name: /^Indice : / })).toHaveCount(0);
  const reserve = page.getByRole('button', { name: /× [1-9] en réserve : toucher pour l’équiper/ }).first();
  await expect(reserve).toBeVisible();
  const item = ((await reserve.getAttribute('aria-label')) ?? '').split(' ×')[0] ?? '';
  // Équipement : on équipe l'objet (il quitte la réserve), puis on le remet en réserve.
  await expect(page.getByRole('img', { name: 'Emplacement vide' })).toHaveCount(3);
  await reserve.click();
  await expect(page.getByRole('button', { name: new RegExp(`^${item} équipé`) })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Emplacement vide' })).toHaveCount(2);
  await page.getByRole('button', { name: new RegExp(`^${item} équipé`) }).click();
  await expect(page.getByRole('img', { name: 'Emplacement vide' })).toHaveCount(3);
  await expect(relatifs.getByRole('img', { name: 'Médaille Argent' })).toBeVisible();
});

test('Défaite : 5 secondes pour recommencer, puis l’entraînement', async ({ page }) => {
  test.setTimeout(60_000);
  await signupFamily(page);
  await page.getByPlaceholder('Ex. Léa').fill(`Perdu${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await createFirstProfile(page);
  await page.getByRole('button', { name: /^Mode Histoire/ }).click();
  await skipEmperor(page);
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  const provoke = page.getByRole('dialog', { name: /te provoque/ });
  await expect(provoke).toBeVisible(); // l'écran est chargé à la demande
  await page.waitForTimeout(700); // anti double-toucher
  await provoke.getByRole('button', { name: 'Passer' }).click();
  await expect(provoke).toHaveCount(0);
  const started = page.waitForResponse((r) => r.url().endsWith('/api/v1/battles'));
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Nombres relatifs' })
    .getByRole('button', { name: 'Combattre' })
    .click();
  let view = (await (await started).json()) as BattleView;
  await page.getByRole('button', { name: 'Passer' }).waitFor();
  await page.waitForTimeout(700); // anti double-toucher
  await page.getByRole('button', { name: 'Passer' }).click();
  while (view.status === 'fighting') {
    view = await answer(page, view, false);
    await page.getByRole('button', { name: /Oui, j’essaie|Voir le résultat/ }).click();
  }
  expect(view.status).toBe('lost');
  await expect(page.getByRole('heading', { name: 'On recommence ?' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('timer')).toBeVisible();
  // Sans réponse en 5 secondes : le bilan, avec l'entraînement et le mot du héros.
  // Le héros (Alex) a le mot de la fin, puis le Sorcier π.
  await expect(page.getByText(/je reviendrai plus fort|améliorer mon algorithme/i)).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole('button', { name: /On s’entraîne/ })).toBeVisible();
});
