import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { api } from '@questeo/shared';
import { renderApp } from '../../testing/renderApp.tsx';
import { evaluationHandlers, FAKE_EVALUATION_ID } from '../../testing/fakeEvaluation.ts';
import type { FakeApi } from '../../testing/fakeApi.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Touche de validation : « OK », ou « ? » tant que rien n'est saisi. */
const READY = /^(OK|Je ne sais pas)/;

const setup = (options?: Parameters<typeof evaluationHandlers>[0]) => (server: FakeApi) => {
  const h = evaluationHandlers(options);
  for (const [name, fn] of Object.entries(h)) server.override(name as keyof typeof api, fn);
};

/** Saisit un nombre au pavé puis valide. */
async function answer(user: ReturnType<typeof renderApp>['user'], text: string) {
  for (const key of text) await user.click(screen.getByRole('button', { name: key }));
  await user.click(screen.getByRole('button', { name: 'OK' }));
}

describe('Arène d’évaluation', () => {
  it(
    'de la tuile au bilan : épreuve sans juste ni faux, puis maîtrise et couverture ensemble',
    { timeout: 60_000 },
    async () => {
      const { user, server } = renderApp('/hub', { setup: setup() });
      await user.click(await screen.findByRole('button', { name: /Arène d’évaluation/ }));
      await user.click(await screen.findByRole('button', { name: /Maths/ }));

      // Accueil : l'Épreuve des Origines est conseillée, les deux autres sont « bientôt ».
      expect(await screen.findByText(/Conseillée/)).toBeInTheDocument();
      expect(screen.getAllByText('Bientôt')).toHaveLength(2);
      await user.click(screen.getByRole('button', { name: 'Lancer l’Épreuve des Origines' }));

      // Épreuve : progression visible, jamais de correction.
      expect(await screen.findByRole('progressbar', { name: 'Progression de l’épreuve' })).toBeInTheDocument();
      for (let i = 0; i < 3; i++) {
        await screen.findByRole('button', { name: READY });
        await answer(user, '1');
        expect(screen.queryByText(/Bonne réponse|Raté|Essaie encore/i)).not.toBeInTheDocument();
      }
      const sent = server.calls.filter((c) => c.path.endsWith('/answers'));
      expect(sent).toHaveLength(3);
      expect(sent[0]?.body).toMatchObject({ skillId: 'm5-tables', level: 1, seed: 11, response: { kind: 'number' } });

      // Bilan : les deux pourcentages arrondis à 5 %, côte à côte.
      expect(await screen.findByRole('heading', { name: /Mon bilan/ })).toBeInTheDocument();
      expect(screen.getByText('Maîtrise 60 %')).toBeInTheDocument();
      expect(screen.getByText('Couverture 70 %')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'À consolider pour réussir dans ta classe' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Récompenses' })).toBeInTheDocument();
      expect(server.calls.some((c) => c.path === `/evaluations/${FAKE_EVALUATION_ID}/finish`)).toBe(true);

      // Les corrections ne viennent qu'à la demande.
      expect(screen.queryByRole('list', { name: 'Corrections' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /Revoir mes réponses/ }));
      const list = await screen.findByRole('list', { name: 'Corrections' });
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    },
  );

  it('« Je ne sais pas » est confirmé puis envoyé comme réponse inconnue', { timeout: 30_000 }, async () => {
    const { user, server } = renderApp(`/partie/evaluation/${FAKE_EVALUATION_ID}`, { setup: setup() });
    await user.click(await screen.findByRole('button', { name: /Je ne sais pas/ }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('je ne sais pas');
    await user.click(within(dialog).getAllByRole('button').at(-1)!);
    await waitFor(() =>
      expect(server.calls.find((c) => c.path.endsWith('/answers'))?.body).toMatchObject({
        response: { kind: 'unknown' },
      }),
    );
  });

  it('quitter garde l’épreuve : retour à l’accueil sans la clore', async () => {
    const { user, server } = renderApp(`/partie/evaluation/${FAKE_EVALUATION_ID}`, { setup: setup() });
    await user.click(await screen.findByRole('button', { name: 'Quitter' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('gardée');
    await user.click(within(dialog).getByRole('button', { name: 'Quitter' }));
    expect(await screen.findByRole('heading', { name: 'Défis' })).toBeInTheDocument();
    expect(server.calls.some((c) => c.path.endsWith('/finish'))).toBe(false);
  });

  it('défis bonus proposés après l’épreuve : le choix est envoyé', { timeout: 60_000 }, async () => {
    const { user, server } = renderApp(`/partie/evaluation/${FAKE_EVALUATION_ID}`, { setup: setup({ bonus: true }) });
    for (let i = 0; i < 3; i++) {
      await screen.findByRole('button', { name: READY });
      await answer(user, '1');
    }
    await user.click(await screen.findByRole('button', { name: 'Non merci, voir mon bilan' }));
    expect(await screen.findByText('Maîtrise 60 %')).toBeInTheDocument();
    expect(server.calls.find((c) => c.path.endsWith('/advanced'))?.body).toEqual({ accept: false });
  });

  it('matière sans référentiel : message « bientôt », rien à lancer', async () => {
    renderApp('/jouer/evaluation/maths', { setup: setup({ available: false }) });
    expect(await screen.findByText(/arrive bientôt/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lancer/ })).not.toBeInTheDocument();
  });

  it('historique : le bilan terminé figure dans « Mes épreuves » et se rouvre', { timeout: 60_000 }, async () => {
    const { user } = renderApp(`/partie/evaluation/${FAKE_EVALUATION_ID}`, { setup: setup() });
    for (let i = 0; i < 3; i++) {
      await screen.findByRole('button', { name: READY });
      await answer(user, '1');
    }
    await user.click(await screen.findByRole('link', { name: 'Mes épreuves' }));
    const entry = await screen.findByRole('link', { name: /Épreuve des Origines · .*Maîtrise 60 %.*Couverture 70 %/ });
    await user.click(entry);
    expect(await screen.findByText('Couverture 70 %')).toBeInTheDocument();
  });
});
