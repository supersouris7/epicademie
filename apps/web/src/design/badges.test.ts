// @vitest-environment node
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BADGE_CATEGORIES, BADGE_TIERS } from '@questeo/shared';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { BADGE_IMAGES, badgeSrc } from './badges.ts';

const PUBLIC = fileURLToPath(new URL('../../public/assets/', import.meta.url));

describe('images des badges (6 badges × 4 rangs)', () => {
  it('une image par badge et par rang, versionnée pour le cache', () => {
    expect(BADGE_IMAGES).toHaveLength(BADGE_CATEGORIES.length * BADGE_TIERS.length);
    expect(badgeSrc('boss', 'diamant')).toMatch(/^\/assets\/rewards\/badges\/boss-diamant\.webp\?v=/);
  });

  it('les 24 fichiers existent, en webp transparent, sur un canevas identique', async () => {
    const sizes = new Set<string>();
    for (const { file } of BADGE_IMAGES) {
      expect(existsSync(`${PUBLIC}${file}`), file).toBe(true);
      const meta = await sharp(`${PUBLIC}${file}`).metadata();
      expect(meta.format, file).toBe('webp');
      expect(meta.hasAlpha, file).toBe(true);
      sizes.add(`${meta.width}x${meta.height}`);
    }
    expect(sizes.size).toBe(1);
  });

  it('chaque médaille est entière : bord du canevas entièrement transparent, rien de coupé', async () => {
    for (const { file } of BADGE_IMAGES) {
      const { data, info } = await sharp(`${PUBLIC}${file}`).raw().toBuffer({ resolveWithObject: true });
      const alpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3] ?? 0;
      for (let i = 0; i < info.width; i++) {
        expect(alpha(i, 0) + alpha(i, info.height - 1), file).toBe(0);
        expect(alpha(0, i) + alpha(info.width - 1, i), file).toBe(0);
      }
    }
  });
});
