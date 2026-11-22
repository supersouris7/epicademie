import type { BadgeProgress } from '@questeo/shared';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BadgeList } from './BadgeList.tsx';

const badge = (over: Partial<BadgeProgress>): BadgeProgress => ({
  category: 'boss',
  title: 'Chasseur de boss',
  how: 'Bats des boss.',
  value: 0,
  next: 1,
  tier: null,
  ...over,
});

describe('BadgeList', () => {
  it('affiche la médaille du rang atteint, en couleur', () => {
    const { container } = render(<BadgeList badges={[badge({ tier: 'or', value: 15, next: 40 })]} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toMatch(/rewards\/badges\/boss-or\.webp/);
    expect(img).not.toHaveClass('grayscale');
    expect(screen.getByLabelText('Badge Chasseur de boss : Or')).toBeInTheDocument();
  });

  it('un badge non obtenu reste grisé (médaille de bronze)', () => {
    const { container } = render(<BadgeList badges={[badge({ category: 'coffres', title: 'Chasseur de coffres' })]} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toMatch(/rewards\/badges\/coffres-bronze\.webp/);
    expect(img).toHaveClass('grayscale');
    expect(screen.getByLabelText('Badge Chasseur de coffres : pas encore gagné')).toBeInTheDocument();
  });
});
