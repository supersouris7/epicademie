import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router';
import { useBackGuard, useGameExit } from './gameExit.ts';

function Game({ onBack }: { readonly onBack: () => void }) {
  const { left, exit } = useGameExit('/liste');
  useBackGuard(!left, onBack);
  return (
    <div>
      <p>partie</p>
      <button type="button" onClick={() => exit('/hub')}>
        quitter
      </button>
    </div>
  );
}

function Menu() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => void navigate('/partie')}>
      jouer
    </button>
  );
}

const app = (onBack = vi.fn()) =>
  render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/partie" element={<Game onBack={onBack} />} />
        <Route path="/hub" element={<p>hub</p>} />
        <Route path="/liste" element={<p>liste</p>} />
      </Routes>
    </BrowserRouter>,
  );

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('sortie de partie', () => {
  it('« précédent » pendant la partie demande confirmation au lieu de quitter', async () => {
    const onBack = vi.fn();
    app(onBack);
    act(() => screen.getByText('jouer').click());
    expect(screen.getByText('partie')).toBeInTheDocument();
    // Entrée de garde posée au-dessus de la partie.
    expect((window.history.state as { partieGarde?: boolean }).partieGarde).toBe(true);
    act(() => window.history.back());
    await waitFor(() => expect(onBack).toHaveBeenCalled());
    expect(screen.getByText('partie')).toBeInTheDocument();
  });

  it('Quitter remplace la partie dans l’historique : on arrive sur la destination', async () => {
    app();
    act(() => screen.getByText('jouer').click());
    act(() => screen.getByText('quitter').click());
    await waitFor(() => expect(screen.getByText('hub')).toBeInTheDocument());
    expect(window.location.pathname).toBe('/hub');
  });
});
