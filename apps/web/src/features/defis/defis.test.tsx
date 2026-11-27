import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

// Tirage figé : la question est toujours « Calcule 3 × 2. » (réponse 6).
const answer = async (user: ReturnType<typeof renderApp>['user'], digit: string) => {
  await user.click(screen.getByRole('button', { name: new RegExp(`^${digit}$`) }));
  await user.click(screen.getByRole('button', { name: 'OK' }));
};

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Notion réussie (or) : les défis se jouent sur elle seule. */
const GOLD = {
  skills: [
    {
      skillId: 'm5-tables',
      stage: 1,
      due: null,
      attempts: 5,
      correct: 5,
      recent: [true],
      maintained: 0,
      best: 5,
      lastPracticed: null,
    },
  ],
} as const;

describe('défis', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Contre-la-montre : règles, chronomètre, arrêt et résultats', async () => {
    const { user } = renderApp('/partie/defi/chrono/maths', GOLD);
    expect(await screen.findByText(/60 secondes, et chaque bonne réponse te rend du temps/)).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /C’est parti/ }));
    expect(await screen.findByRole('timer')).toHaveTextContent(/⏱ (60|59) s/);
    expect(screen.getByRole('progressbar', { name: 'Temps restant' })).toBeInTheDocument();
    expect(screen.getByLabelText('0 points')).toBeInTheDocument();
    // HUD de combat réutilisé : cadre, portrait et jauge segmentée (10 cases) ; record lisible.
    expect(screen.getByRole('progressbar', { name: 'Temps restant' })).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText(/^Record \d+$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Arrêter' }));
    expect(await screen.findByRole('heading', { name: /0 points/ })).toBeInTheDocument();
  });

  it('Survie : trois cœurs au départ', async () => {
    const { user } = renderApp('/partie/defi/survie/maths', GOLD);
    await user.click(await screen.findByRole('button', { name: /C’est parti/ }));
    expect(await screen.findByRole('img', { name: '3 cœurs sur 3' })).toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('depuis l’accueil : les défis sont jouables', async () => {
    const { user } = renderApp('/hub');
    await user.click(await screen.findByRole('button', { name: /Survie/ }));
    await user.click(await screen.findByRole('button', { name: 'Maths' }));
    expect(await screen.findByText(/3 cœurs. Chaque erreur coûte un cœur et casse ta série/)).toBeInTheDocument();
  });

  it('Revoir mes erreurs : question, réponse donnée, bonne réponse et explication', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { user } = renderApp('/partie/defi/survie/maths', GOLD);
    await user.click(await screen.findByRole('button', { name: /C’est parti/ }));
    expect(await screen.findByText('Calcule 3 × 2.')).toBeInTheDocument();
    await answer(user, '5');
    expect(await screen.findByRole('status')).toHaveTextContent('Oups ! −1 cœur, la série repart');
    await user.click(screen.getByRole('button', { name: 'Arrêter' }));
    await user.click(await screen.findByRole('button', { name: /Revoir mes erreurs \(1\)/ }));
    const list = screen.getByRole('list', { name: 'Mes erreurs' });
    expect(list).toHaveTextContent('Calcule 3 × 2.');
    expect(list).toHaveTextContent('Ta réponse : 5');
    expect(list).toHaveTextContent('Bonne réponse : 6');
    expect(list).toHaveTextContent('Tu veux réessayer une question du même type ?');
  });

  it('sans notion en or ou diamant : pas de défi, on propose de s’entraîner', async () => {
    renderApp('/partie/defi/chrono/maths', { skills: [{ ...GOLD.skills[0], best: 4 }] });
    expect(await screen.findByText(/gagne une médaille d’or ou de diamant/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /C’est parti/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'M’entraîner' })).toBeInTheDocument();
  });
});
