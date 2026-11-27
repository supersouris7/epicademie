import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { lazyScreen, preloadScreens } from './lazyScreen.tsx';

describe('écran chargé à la demande', () => {
  it('attente, puis l’écran avec ses propriétés ; rien n’est demandé avant la visite', async () => {
    let asked = 0;
    let arrive: () => void = () => undefined;
    const ready = new Promise<void>((resolve) => (arrive = resolve));
    const Screen = lazyScreen(async () => {
      asked++;
      await ready;
      return ({ name }: { readonly name: string }) => <h1>Bonjour {name}</h1>;
    });
    expect(asked).toBe(0);
    render(<Screen name="Léa" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(/Chargement/)).not.toBeInTheDocument();
    arrive();
    expect(await screen.findByRole('heading', { name: 'Bonjour Léa' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('préchargé : affiché dès le 1er rendu, code demandé une seule fois', async () => {
    let asked = 0;
    const Screen = lazyScreen(async () => {
      asked++;
      return () => <h1>Déjà là</h1>;
    });
    await preloadScreens([[Screen], [Screen]]);
    render(<Screen />);
    expect(screen.getByRole('heading', { name: 'Déjà là' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(asked).toBe(1);
  });

  it('préchargement en échec : les autres écrans continuent, le code est redemandé', async () => {
    let asked = 0;
    const Flaky = lazyScreen(async () => {
      if (++asked === 1) throw new Error('réseau coupé');
      return () => <h1>Revenu</h1>;
    });
    let others = false;
    await preloadScreens([[Flaky], [{ preload: async () => (others = true) }]]);
    expect(others).toBe(true);
    render(<Flaky />);
    expect(await screen.findByRole('heading', { name: 'Revenu' })).toBeInTheDocument();
    expect(asked).toBe(2);
  });
});
