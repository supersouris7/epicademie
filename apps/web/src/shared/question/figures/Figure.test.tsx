import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CHAPTERS, generate, type Question } from '@questeo/content';
import { Figure } from './Figure.tsx';

/**
 * Toutes les figures du contenu se dessinent : chaque notion, chaque niveau, quelques graines.
 * Un générateur qui produirait une figure illisible (valeur manquante, type inconnu) ferait
 * planter ce test avant d'arriver à un élève.
 */
const withFigures: Question[] = [];
for (const chapter of CHAPTERS)
  for (const skill of chapter.skills)
    for (const level of [1, 2, 3] as const)
      for (let seed = 0; seed < 3; seed++) {
        const q = generate(skill.id, level, seed);
        if (q.figure) withFigures.push(q);
      }

const kinds = [...new Set(withFigures.map((q) => q.figure?.kind))];

describe('figures des questions', () => {
  it('le contenu utilise plusieurs types de figures', () => {
    expect(kinds.length).toBeGreaterThan(5);
  });

  it.each(kinds)('figures « %s » : toutes se dessinent', (kind) => {
    for (const q of withFigures.filter((x) => x.figure?.kind === kind)) {
      const figure = q.figure;
      if (!figure) continue;
      const { container, unmount } = render(<Figure figure={figure} maxHeight="20rem" />);
      expect(container.querySelector('svg, table, ol, ul, div')).not.toBeNull();
      unmount();
    }
  });

  it('quadrillage interactif : toucher un nœud choisit un point, la correction s’affiche', () => {
    const grid = withFigures.find((q) => q.figure?.kind === 'grid' && q.answer.kind === 'point');
    if (!grid?.figure || grid.answer.kind !== 'point') throw new Error('aucun quadrillage à point');
    const onPick = vi.fn();
    const { container, rerender } = render(<Figure figure={grid.figure} onPick={onPick} picked={null} />);
    const svg = container.querySelector('svg');
    if (!svg) throw new Error('pas de dessin');
    // jsdom ne calcule pas la géométrie SVG : écran = coordonnées du dessin.
    const point = { x: 0, y: 0, matrixTransform: () => point };
    Object.assign(svg, {
      createSVGPoint: () => point,
      getScreenCTM: () => ({ inverse: () => ({}) }),
    });
    fireEvent.pointerDown(svg, { clientX: 150, clientY: 150 });
    fireEvent.pointerUp(svg, { clientX: 150, clientY: 150 });
    fireEvent.click(svg, { clientX: 150, clientY: 150 });
    expect(onPick).toHaveBeenCalled();
    rerender(<Figure figure={grid.figure} picked={{ x: 0, y: 0 }} reveal={{ x: grid.answer.x, y: grid.answer.y }} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
