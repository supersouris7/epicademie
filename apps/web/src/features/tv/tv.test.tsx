import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ArenaView } from '@epicademie/shared';
import { renderApp } from '../../testing/renderApp.tsx';
import { sockets } from '../../testing/fakeSocket.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const duel: ArenaView = {
  id: 'd1',
  hostId: 'p1',
  chapterId: 'm5-calcul',
  phase: 'playing',
  players: [
    { id: 'p1', name: 'Léa', hero: 'lina', hearts: 3, ready: true },
    { id: 'p2', name: 'Tom', hero: 'alex', hearts: 2, ready: true },
  ],
  turnId: 'p2',
  turn: 3,
  question: { skillId: 'm5-tables', level: 1, seed: 7 },
  deadline: Date.now() + 30_000,
  last: { playerId: 'p1', correct: true, targetId: 'p2', timeout: false },
  winnerId: null,
};

describe('mode TV', () => {
  it('écran sans profil : attend une partie, puis affiche le duel en grand (question, joueurs)', async () => {
    renderApp('/tv');
    expect(await screen.findByText(/la partie s’affichera ici/)).toBeInTheDocument();
    const tv = sockets.find((s) => 'tv' in s.auth);
    if (!tv) throw new Error('pas de connexion TV');
    act(() => tv.fire('arena', duel));
    expect(screen.getByRole('main', { name: 'Écran TV' })).toBeInTheDocument();
    expect(screen.getByText('Au tour de Tom !')).toBeInTheDocument();
    expect(screen.getByText('⚔️ Léa a trouvé et attaque Tom !')).toBeInTheDocument();
    expect(screen.getByLabelText('2 cœurs')).toBeInTheDocument();
    // L'écran ne joue pas : aucun clavier de réponse.
    expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument();
    act(() => tv.fire('arena', { ...duel, phase: 'over', winnerId: 'p1' }));
    expect(screen.getByRole('heading', { name: 'Léa a gagné !' })).toBeInTheDocument();
  });
});
