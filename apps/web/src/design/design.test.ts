// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { outputs, svgAssets } from '../../scripts/assets/build.ts';
import { availableFile, guide } from '../../scripts/assets/plan.ts';
import { assetSrc, MANIFEST, PLANNED_ASSETS } from './assets.ts';
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

describe('SVG générés', () => {
  it('sont à jour (relancer `pnpm --filter @questeo/web assets:svg`)', () => {
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
    for (const p of PLANNED_ASSETS) {
      if (p.reference) expect(ids.has(p.reference), p.id).toBe(true);
      if (p.fallback) expect(assetSrc(p.id), p.id).toMatch(/\.svg$/);
    }
  });

  it('liste des images livrées et guide ChatGPT à jour (relancer `assets:plan`)', () => {
    expect(read('./assets.available.ts')).toBe(availableFile());
    expect(read('../../../../docs/ASSETS-CHATGPT.md')).toBe(guide());
  });
});
