import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { generate, type Question } from '@questeo/content';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const PATH = '/partie/entrainement/m5-calcul/m5-tables';

/** Saisit un nombre au pavé et valide. */
async function answer(user: ReturnType<typeof renderApp>['user'], text: string) {
  for (const key of text) await user.click(screen.getByRole('button', { name: key === '-' ? 'Moins' : key }));
  await user.click(screen.getByRole('button', { name: 'OK' }));
}

/** Question de la dernière réponse envoyée au serveur (pour trouver la bonne réponse). */
function lastQuestion(server: ReturnType<typeof renderApp>['server']): Question {
  const sent = server.calls.filter((c) => c.path.endsWith('/answers')).at(-1)?.body as
    { skillId: string; level: 1 | 2 | 3; seed: number } | undefined;
  if (!sent) throw new Error('aucune réponse envoyée');
  return generate(sent.skillId, sent.level, sent.seed);
}
const rightAnswer = (q: Question) => (q.answer.kind === 'number' ? q.answer.value.n.toString() : '');

describe('partie d’entraînement', () => {
  it('erreur, indice, 2e essai réussi, puis série complète jusqu’au bilan', async () => {
    const { user, server } = renderApp(PATH);
    expect(await screen.findByRole('progressbar', { name: 'Progression de la série' })).toBeInTheDocument();
    await screen.findByRole('button', { name: 'OK' });

    // 1re erreur : indice de Questy, on réessaie la même question.
    await answer(user, '-1');
    expect(await screen.findByText('Essaie encore !')).toBeInTheDocument();
    await answer(user, rightAnswer(lastQuestion(server)));
    expect(await screen.findByRole('button', { name: /Suivant/ })).toBeInTheDocument();

    // Puis, à chaque question : une erreur (indice), et la bonne réponse au 2e essai.
    const finished = () => server.calls.some((c) => c.path.endsWith('/finish'));
    for (let i = 0; i < 20 && !finished(); i++) {
      const next = screen.queryByRole('button', { name: /Suivant|Je réessaie|Voir mes résultats/ });
      if (next) {
        await user.click(next);
        continue;
      }
      await answer(user, '-1');
      if (await screen.findByText('Essaie encore !').catch(() => null))
        await answer(user, rightAnswer(lastQuestion(server)));
      await screen.findByRole('button', { name: /Suivant|Je réessaie|Voir mes résultats/ });
    }
    expect(finished()).toBe(true);
    // Bilan : 1re réponse fausse à chaque question.
    expect(await screen.findByText(/On s’accroche/)).toBeInTheDocument();
  });

  it('serveur injoignable au démarrage : message et retour à l’accueil', async () => {
    renderApp(PATH, {
      setup: (server) =>
        server.override('startSession', () => {
          throw new Error('panne');
        }),
    });
    expect(await screen.findByText(/Le serveur est-il joignable/)).toBeInTheDocument();
    expect(within(document.body).getByRole('button', { name: /Retour à l’accueil/ })).toBeInTheDocument();
  });

  it('révisions du jour : proposées sur la page de la matière, série sur les notions dues', async () => {
    const recent = Array.from({ length: 10 }, () => true);
    const { user, server } = renderApp('/jouer/entrainement/maths', {
      skills: [
        // Due depuis une semaine : à réviser.
        {
          skillId: 'm5-tables',
          stage: 2,
          due: '2026-01-01',
          attempts: 10,
          correct: 10,
          recent,
          maintained: 0,
          best: 5,
          lastPracticed: '2025-12-25',
        },
      ],
    });
    await user.click(await screen.findByRole('button', { name: /Révisions du jour/ }));
    await screen.findByRole('progressbar', { name: 'Progression de la série' });
    const started = server.calls.find((c) => c.path === '/sessions');
    expect(started?.body).toMatchObject({ chapterId: 'revisions', subject: 'maths', skillId: 'm5-tables' });
  });

  it('pas de révision due : pas de bouton, et l’adresse directe ramène à la matière', async () => {
    renderApp('/partie/entrainement/revisions/maths', { skills: [] });
    expect(await screen.findByRole('heading', { name: /Entraînement · Maths/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Révisions du jour/ })).not.toBeInTheDocument();
  });
});
