import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { lazyScreen } from './lazyScreen.tsx';

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
    expect(screen.getByRole('status')).toHaveTextContent('Chargement…');
    arrive();
    expect(await screen.findByRole('heading', { name: 'Bonjour Léa' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
