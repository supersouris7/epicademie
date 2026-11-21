import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { generate, type Question } from '@questeo/content';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const PATH = '/partie/entrainement/m5-calcul/m5-tables';
/** Touche de validation : « OK », ou « ? » (« Je ne sais pas : un indice ») tant que rien n'est saisi. */
const ANSWER_KEY = /^(OK|Je ne sais pas : un indice)$/;

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
  it('erreur, indice, 2e essai réussi, puis série complète jusqu’au bilan', { timeout: 90_000 }, async () => {
    const { user, server } = renderApp(PATH);
    expect(await screen.findByRole('progressbar', { name: 'Progression de la série' })).toBeInTheDocument();
    await screen.findByRole('button', { name: ANSWER_KEY });

    // 1re erreur : indice de Questy, on réessaie la même question.
    await answer(user, '-1');
    expect(await screen.findByText(/Essaie encore !/)).toBeInTheDocument();
    await answer(user, rightAnswer(lastQuestion(server)));
    // Bonne réponse : pas de bouton, on passe tout seul à la suite.
    expect(await screen.findByText('Bien rattrapé !')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Suivant/ })).not.toBeInTheDocument();

    // Puis, à chaque question : une erreur (indice), et la bonne réponse au 2e essai.
    const finished = () => server.calls.some((c) => c.path.endsWith('/finish'));
    for (let i = 0; i < 30 && !finished(); i++) {
      const step = screen.queryByRole('button', { name: /^Suivant|Vérifions si j’ai compris/ });
      if (step) {
        await user.click(step);
        continue;
      }
      const ok = await screen.findByRole('button', { name: ANSWER_KEY }, { timeout: 4000 }).catch(() => null);
      if (!ok) continue;
      await answer(user, '-1');
      if (await screen.findByText(/Essaie encore !/).catch(() => null))
        await answer(user, rightAnswer(lastQuestion(server)));
      await waitFor(() => expect(screen.queryByRole('button', { name: ANSWER_KEY })).not.toBeInTheDocument());
    }
    expect(finished()).toBe(true);
    // Bilan : 1re réponse fausse à chaque question.
    expect(await screen.findByText(/On s’accroche/)).toBeInTheDocument();
  });

  it('rien de saisi : le bouton OK devient « ? » ; d’abord l’indice, puis l’explication ; une erreur', async () => {
    const { user, server } = renderApp(PATH);
    await screen.findByRole('button', { name: ANSWER_KEY });
    await user.click(screen.getByRole('button', { name: 'Je ne sais pas : un indice' }));
    // Confirmation : ça comptera comme une erreur.
    expect(await screen.findByText(/comptera comme une erreur/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Oui, aide-moi' }));
    expect(await screen.findByText(/Pas de souci, voici un indice/)).toBeInTheDocument();
    const sent = server.calls.filter((c) => c.path.endsWith('/answers')).at(-1)?.body as { response: unknown };
    expect(sent.response).toEqual({ kind: 'unknown' });
    await user.click(screen.getByRole('button', { name: 'Je ne sais pas : un indice' }));
    await user.click(await screen.findByRole('button', { name: 'Oui, aide-moi' }));
    const explanation = await screen.findByRole('region', { name: 'Explication de Questy' });
    expect(explanation).toHaveTextContent(/Tu ne savais pas/);
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
