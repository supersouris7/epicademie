import { expect, test, type Page } from '@playwright/test';
import { createFirstProfile, signupFamily } from './family.ts';

/**
 * Non-débordement sur les écrans principaux, en tablette portrait (768 × 1024) et paysage
 * (1024 × 768) ; l'inscription et la connexion relèvent d'un autre ticket : ni défilement horizontal de la page, ni élément visible hors de l'écran,
 * ni texte coupé dans un bouton ou un titre.
 */
const VIEWPORTS = [
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
] as const;

const FAMILY_SCREENS = [
  '/hub',
  '/jouer/entrainement',
  '/jouer/entrainement/maths',
  '/jouer/boss',
  '/jouer/chrono',
  '/jouer/survie',
  '/arene',
  '/multi',
  '/amis',
  '/heros',
  '/shop',
  '/progres',
  '/parametres',
  '/dictionnaire',
  '/parent',
  '/parent/abonnement',
  '/parent/profils',
  '/parent/reglages',
  '/tv',
  '/',
];

/** Éléments qui dépassent à droite/à gauche de l'écran ou dont le texte est coupé. */
async function overflows(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    if (document.documentElement.scrollWidth > vw + 1) {
      out.push(`page : scrollWidth ${document.documentElement.scrollWidth} > ${vw}`);
    }
    for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || el.closest('[aria-hidden="true"], .sr-only')) {
        continue;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const label = `${el.tagName.toLowerCase()}.${el.className.slice(0, 40)} « ${el.textContent.trim().slice(0, 30)} »`;
      if (r.right > vw + 1 || r.left < -1)
        out.push(`${label} hors écran (${Math.round(r.left)}→${Math.round(r.right)})`);
      else if (
        (el.tagName === 'BUTTON' || el.tagName === 'A') &&
        style.overflowX !== 'visible' &&
        el.scrollWidth > el.clientWidth + 1
      ) {
        out.push(`${label} texte coupé`);
      }
    }
    // Texte qui sort de son bouton ou de son lien (ou touche le bord sans marge).
    for (const box of document.body.querySelectorAll<HTMLElement>('button, a')) {
      const b = box.getBoundingClientRect();
      if (b.width === 0 || box.closest('[aria-hidden="true"], .sr-only')) continue;
      for (const child of box.querySelectorAll<HTMLElement>('span, h1, h2, h3, p')) {
        const range = document.createRange();
        range.selectNodeContents(child);
        const t = range.getBoundingClientRect();
        if (t.width > 0 && (t.right > b.right - 2 || t.left < b.left + 2 || t.bottom > b.bottom + 1)) {
          out.push(`« ${child.textContent.trim().slice(0, 30)} » dépasse de son bouton`);
        }
      }
    }
    // Boutons qui se chevauchent.
    const buttons = [...document.body.querySelectorAll<HTMLElement>('button, a')].filter((e) => {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || getComputedStyle(e).visibility === 'hidden') return false;
      if (e.closest('[aria-hidden="true"]')) return false;
      // Un bouton recouvert (fenêtre ou scène au premier plan) ne gêne pas.
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return top !== null && e.contains(top);
    });
    for (let i = 0; i < buttons.length; i++) {
      for (let j = i + 1; j < buttons.length; j++) {
        const a = buttons[i]!;
        const c = buttons[j]!;
        if (a.contains(c) || c.contains(a)) continue;
        // Liens en ligne qui passent à la ligne : leurs boîtes englobantes se recoupent sans gêne.
        if (getComputedStyle(a).display === 'inline' || getComputedStyle(c).display === 'inline') continue;
        const x = a.getBoundingClientRect();
        const y = c.getBoundingClientRect();
        const w = Math.min(x.right, y.right) - Math.max(x.left, y.left);
        const h = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
        if (w > 4 && h > 4) {
          const name = (e: HTMLElement) =>
            `« ${(e.getAttribute('aria-label') ?? e.textContent).trim().slice(0, 20)} » (${Math.round(e.getBoundingClientRect().left)},${Math.round(e.getBoundingClientRect().top)})`;
          out.push(`${name(a)} chevauche ${name(c)}`);
        }
      }
    }
    return out;
  });
}

async function audit(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  // Écran chargé à la demande : on l'attend, puis la fin de son animation d'apparition.
  await expect(page.getByText('Chargement…')).toHaveCount(0);
  await expect
    .configure({ soft: true })
    .poll(() => overflows(page), { message: `${path} à ${page.viewportSize()?.width}×${page.viewportSize()?.height}` })
    .toEqual([]);
}

test.describe('tablette : aucun débordement', () => {
  test.beforeEach(({ viewport }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablette' || !viewport, 'profil tablette uniquement');
  });

  for (const vp of VIEWPORTS) {
    test(`écrans de la famille ${vp.width}×${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await signupFamily(page);
      expect(await overflows(page), 'création du profil').toEqual([]);
      await page.getByPlaceholder('Ex. Léa').fill(`Tab${Date.now() % 10000}`);
      await page.getByRole('button', { name: 'Une fille' }).click();
      await page.getByLabel('Date de naissance').fill('2014-03-09');
      await page.getByRole('button', { name: 'Oui', exact: true }).click();
      await createFirstProfile(page);
      for (const path of FAMILY_SCREENS) await audit(page, path);
    });
  }
});
