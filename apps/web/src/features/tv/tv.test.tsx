import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ArenaView } from '@questeo/shared';
import { renderApp } from '../../testing/renderApp.tsx';
import { sockets } from '../../testing/fakeSocket.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const raid: ArenaView = {
  id: 'r1',
  kind: 'raid',
  raid: { bossHp: 4, bossMaxHp: 6, teamHearts: 3, teamMaxHearts: 4, won: null },
  hostId: 'p1',
  chapterId: 'm5-calcul',
  phase: 'playing',
  players: [
    { id: 'p1', name: 'Léa', hero: 'lina', hearts: 1, ready: true },
    { id: 'p2', name: 'Tom', hero: 'alex', hearts: 1, ready: true },
  ],
  turnId: 'p2',
  turn: 3,
  question: { skillId: 'm5-tables', level: 1, seed: 7 },
  deadline: Date.now() + 30_000,
  last: { playerId: 'p1', correct: true, targetId: null, timeout: false },
  winnerId: null,
};

describe('mode TV', () => {
  it('écran sans profil : attend une partie, puis affiche le raid en grand (question, boss, équipe)', async () => {
    renderApp('/tv');
    expect(await screen.findByText(/la partie s’affichera ici/)).toBeInTheDocument();
    const tv = sockets.find((s) => 'tv' in s.auth);
    if (!tv) throw new Error('pas de connexion TV');
    act(() => tv.fire('arena', raid));
    expect(screen.getByRole('main', { name: 'Écran TV' })).toBeInTheDocument();
    expect(screen.getByText('Au tour de Tom !')).toBeInTheDocument();
    expect(screen.getByText('⚔️ Léa a trouvé : le boss perd 1 point de vie !')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Vie du boss' })).toHaveAttribute('aria-valuenow', '4');
    expect(screen.getByLabelText('Cœurs de l’équipe : 3 sur 4')).toBeInTheDocument();
    // L'écran ne joue pas : aucun clavier de réponse.
    expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument();
    act(() => tv.fire('arena', { ...raid, phase: 'over', raid: { ...raid.raid, bossHp: 0, won: true } }));
    expect(screen.getByRole('heading', { name: 'Boss vaincu ! Bravo l’équipe !' })).toBeInTheDocument();
  });
});
