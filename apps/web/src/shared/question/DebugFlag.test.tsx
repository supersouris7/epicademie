import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { useDebugMode } from '../lib/debugMode.ts';
import { isGameRoute } from '../lib/gameRoute.ts';
import { DebugFlag } from './DebugFlag.tsx';

const flagAt = (path: string) => {
  useDebugMode.setState({ enabled: true });
  render(
    <MemoryRouter initialEntries={[path]}>
      <DebugFlag />
    </MemoryRouter>,
  );
  return screen.getByRole('button', { name: 'Signaler un problème sur cet écran' });
};

describe('drapeau du mode debug', () => {
  afterEach(() => useDebugMode.setState({ enabled: false }));

  it('reconnaît les écrans de jeu', () => {
    for (const p of ['/partie/boss/c1', '/partie/entrainement/c1/s1', '/partie/defi/x/maths', '/arene']) {
      expect(isGameRoute(p), p).toBe(true);
    }
    for (const p of ['/', '/hub', '/jouer/boss/maths', '/parametres', '/progres'])
      expect(isGameRoute(p), p).toBe(false);
  });

  it('inchangé dans les menus : 40 px, bien visible', () => {
    const flag = flagAt('/hub');
    expect(flag).toHaveClass('h-10', 'w-10', 'opacity-70');
    expect(flag).not.toHaveAttribute('data-ingame');
  });

  it('discret en jeu : plus petit (24 px, cible minimale) et plus transparent, focus visible', () => {
    const flag = flagAt('/partie/boss/c1');
    expect(flag).toHaveClass('h-6', 'w-6', 'opacity-30');
    expect(flag).not.toHaveClass('h-10');
    expect(flag).toHaveAttribute('data-ingame', 'true');
    expect(flag.className).toContain('focus-visible:opacity-100');
    expect(flag.className).toContain('focus-visible:outline-4');
  });

  it("absent sur la console d'administration", () => {
    useDebugMode.setState({ enabled: true });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <DebugFlag />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
