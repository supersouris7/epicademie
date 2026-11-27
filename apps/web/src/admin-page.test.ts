// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

describe('page de la console (admin.html)', () => {
  const html = read('../admin.html');
  const background = /--color-pilot-bg:\s*(#[0-9a-f]{6})/.exec(read('./admin.css'))?.[1] ?? 'absent';

  it('fond de la console dès le premier pixel, couleur du navigateur assortie', () => {
    expect(html).toContain(`<meta name="theme-color" content="${background}" />`);
    expect(html).toMatch(new RegExp(`<style>\\s*html \\{\\s*background: ${background};`));
    expect(html).toContain('src="/src/admin-main.tsx"');
  });

  it('feuilles de style séparées : aucun thème du jeu dans la console, aucune console dans le jeu', () => {
    expect(read('./admin.css')).not.toMatch(/@import '[.]|--af-/);
    expect(read('./index.css')).not.toMatch(/pilot|admin-dark/);
  });
});
