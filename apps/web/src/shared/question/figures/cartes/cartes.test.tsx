import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MAP_IDS, zoneIds, type MapId } from '@epicademie/content';
import { Figure } from '../Figure.tsx';
import { viewBoxOf } from './geometrie.ts';
import type { FondCarte } from './types.ts';

const load = async (map: MapId): Promise<FondCarte> => {
  const m = {
    'france-regions': () => import('./fonds-france-regions.ts'),
    'france-departements': () => import('./fonds-france-departements.ts'),
    europe: () => import('./fonds-europe.ts'),
    monde: () => import('./fonds-monde.ts'),
  }[map];
  return (await m()).fond;
};

describe('fonds de carte', () => {
  it.each(MAP_IDS)('%s : une forme dessinée pour chaque zone du registre, et inversement', async (map) => {
    const fond = await load(map);
    const ids = fond.zones.map((z) => z.id);
    expect(ids.sort()).toEqual([...zoneIds(map)].sort());
    for (const z of fond.zones) {
      expect(z.d, `${map}/${z.id}`).toMatch(/^M[-\d. MZ]+/);
      expect(z.c[0]).toBeGreaterThanOrEqual(0);
      expect(z.c[0]).toBeLessThanOrEqual(fond.w);
      expect(z.c[1]).toBeGreaterThanOrEqual(0);
      expect(z.c[1]).toBeLessThanOrEqual(fond.h);
    }
  });

  it('les fonds restent légers (chargés à la demande, < 100 ko chacun)', async () => {
    for (const map of MAP_IDS) expect(JSON.stringify(await load(map)).length).toBeLessThan(100_000);
  });

  it('le cadre de zoom reste dans la carte', async () => {
    const fond = await load('france-regions');
    expect(viewBoxOf(fond)).toBe(`0 0 ${fond.w} ${fond.h}`);
    const [x, y, w, h] = viewBoxOf(fond, { cx: 0, cy: fond.h, zoom: 4 }).split(' ').map(Number);
    expect(x).toBe(0);
    expect((y ?? 0) + (h ?? 0)).toBeLessThanOrEqual(fond.h);
    expect(w).toBe(Math.round(fond.w / 4));
  });
});

describe('figure « map »', () => {
  it('dessine le fond à la demande, surligne les zones et pose les repères', async () => {
    const { container } = render(
      <Figure
        figure={{
          kind: 'map',
          map: 'france-regions',
          highlight: ['53'],
          marks: [{ zone: '28', label: 'A' }],
        }}
      />,
    );
    expect(screen.getByText('Chargement de la carte…')).toBeTruthy();
    const svg = await screen.findByRole('img', { name: /régions/ });
    expect(svg.querySelectorAll('path[data-zone]')).toHaveLength(13);
    expect(container.querySelector('path[data-zone="53"]')?.getAttribute('fill')).toBe('var(--accent)');
    expect(container.querySelector('path[data-zone="28"]')?.getAttribute('fill')).toBe('var(--surface)');
    expect(svg.textContent).toContain('A');
    expect(screen.getByText(/IGN Admin Express/)).toBeTruthy();
    // Une carte à regarder n’a aucune zone touchable.
    expect(svg.querySelector('[role="button"]')).toBeNull();
  });

  it('monde : continents, océans et fleuves', async () => {
    const { container } = render(<Figure figure={{ kind: 'map', map: 'monde', highlight: ['nil', 'pacifique'] }} />);
    await screen.findByRole('img', { name: /Planisphère/ });
    for (const id of ['afrique', 'atlantique', 'nil'])
      expect(container.querySelector(`[data-zone="${id}"]`)).not.toBeNull();
  });
});
