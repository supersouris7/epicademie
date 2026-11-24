// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { outputs, svgAssets } from '../../scripts/assets/build.ts';
import { availableFile, guide, LOT_DIR, lotFiles } from '../../scripts/assets/plan.ts';
import { assetSrc, MANIFEST, PLANNED_ASSETS } from './assets.ts';
import { AVAILABLE } from './assets.available.ts';
import { PALETTE } from './palette.ts';

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

describe('tokens', () => {
  it('les variables --af-* de tokens.css reprennent exactement la palette', () => {
    const css = read('./tokens.css');
    for (const [, name, value] of css.matchAll(/--af-([\w-]+):\s*(#[0-9a-f]{6})/g)) {
      expect(PALETTE[name as keyof typeof PALETTE], name).toBe(value);
    }
  });
});

describe('contrastes AA du thème', () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
  };
  const css = read('./tokens.css');
  const raw = (name: string): string => new RegExp(`--af-${name}:\\s*(#[0-9a-f]{6})`).exec(css)?.[1] ?? '';
  const sem = (name: string): string =>
    raw(new RegExp(`\\s--${name}:\\s*var\\(--af-([\\w-]+)\\)`).exec(css)?.[1] ?? '');
  // Pire cas du halo du haut de page : violet-500 à 55 % sur le fond.
  const halo =
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(sem('bg').slice(i, i + 2), 16) * 0.45 + parseInt(raw('violet-500').slice(i, i + 2), 16) * 0.55,
        )
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');

  it.each(['bg', 'surface', 'surface-2'])('textes principal, secondaire et blanc lisibles (4,5:1) sur %s', (fond) => {
    for (const t of ['text', 'text-muted', 'text-on-color'])
      expect(ratio(sem(t), sem(fond)), `${t} / ${fond}`).toBeGreaterThanOrEqual(4.5);
  });

  it('les textes restent lisibles sur le halo le plus clair du fond', () => {
    for (const t of ['text', 'text-muted']) expect(ratio(sem(t), halo), t).toBeGreaterThanOrEqual(4.5);
  });

  it('le fond est nettement plus clair qu’avant (violet-950)', () => {
    expect(lum(sem('bg'))).toBeGreaterThan(lum(raw('violet-950')) * 3);
  });
});

describe('SVG générés', () => {
  it('sont à jour (relancer `pnpm --filter @epicademie/web assets:svg`)', () => {
    for (const [file, content] of outputs()) {
      expect(existsSync(file), file).toBe(true);
      expect(readFileSync(file, 'utf8'), file).toBe(content);
    }
  });

  it('sont du XML valide, sans script, ressource externe ni image matricielle', () => {
    const allowed = new Set<string>(Object.values(PALETTE));
    for (const [file, content] of outputs()) {
      if (!file.endsWith('.svg')) continue;
      const doc = new new JSDOM().window.DOMParser().parseFromString(content, 'image/svg+xml');
      expect(doc.getElementsByTagName('parsererror'), file).toHaveLength(0);
      expect(content, file).not.toMatch(/<script|<image|href="http|on\w+=/i);
      expect(content, file).toMatch(/viewBox="[\d. ]+"/);
      for (const [hex] of content.matchAll(/#[0-9a-fA-F]{6}\b/g))
        expect(allowed.has(hex.toLowerCase()), `${file} ${hex}`).toBe(true);
      const ids = [...content.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
      expect(new Set(ids).size, file).toBe(ids.length);
    }
    expect(svgAssets().length).toBeGreaterThan(50);
  });
});

describe('catalogue', () => {
  it('identifiants et chemins uniques', () => {
    expect(new Set(MANIFEST.map((m) => m.id)).size).toBe(MANIFEST.length);
    expect(new Set(PLANNED_ASSETS.map((p) => p.file)).size).toBe(PLANNED_ASSETS.length);
  });

  it('références et remplacements existants', () => {
    const ids = new Set(PLANNED_ASSETS.map((p) => p.id));
    const delivered = new Set<string>(AVAILABLE);
    for (const p of PLANNED_ASSETS) {
      if (p.reference) expect(ids.has(p.reference), p.id).toBe(true);
      // Tant que l'image finale n'est pas livrée, le remplaçant SVG est servi.
      if (p.fallback) expect(assetSrc(p.id), p.id).toMatch(delivered.has(p.file) ? /\.webp(\?v=.+)?$/ : /\.svg$/);
    }
  });

  it('liste des images livrées et guide ChatGPT à jour (relancer `assets:plan`)', () => {
    expect(read('./assets.available.ts')).toBe(availableFile());
    expect(read('../../../../docs/ASSETS-CHATGPT.md')).toBe(guide());
    for (const [file, content] of lotFiles()) expect(readFileSync(`${LOT_DIR}/${file}`, 'utf8'), file).toBe(content);
  });
});
