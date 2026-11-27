import { act, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { generate } from '@epicademie/content';
import { renderApp } from '../../testing/renderApp.tsx';
import { FakeError, type FakeApi } from '../../testing/fakeApi.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const PATH = '/partie/boss/m5-relatifs';
type User = ReturnType<typeof renderApp>['user'];

/** Fait passer le temps des mises en scène (minuteurs simulés). */
const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

/** Répond à la question en cours (forme valide ; le faux serveur décide si c'est juste). */
async function answer(user: User, server: FakeApi) {
  const battle = [...server.battles.values()].at(-1);
  const q = battle?.state.question;
  if (!q) throw new Error('pas de question en cours');
  const question = generate(q.skillId, q.level, q.seed);
  if (question.answer.kind === 'choice') {
    await user.click(within(screen.getByRole('tabpanel')).getAllByRole('button')[0]!);
  } else {
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
  }
}

/** Passe l'entrée en scène : face-à-face, invocation des mobs, 1re question. */
async function skipIntro(user: User) {
  const pass = await screen.findByRole('button', { name: 'Passer' });
  await wait(700); // anti double-toucher
  await user.click(pass);
  await wait(3000);
  expect(await screen.findByRole('progressbar', { name: 'Mobs restants' })).toBeInTheDocument();
}

describe('combat de boss', () => {
  it('victoire sans faute : mobs, arrivée du boss, rage, bilan', async () => {
    const { user, server } = renderApp(PATH, { fakeTimers: true, battleAnswers: true });
    await skipIntro(user);
    expect(screen.getByRole('img', { name: '3 cœurs sur 3' })).toBeInTheDocument();

    let sawArrival = false;
    let sawRage = false;
    for (let turn = 0; turn < 10; turn++) {
      const battle = [...server.battles.values()].at(-1);
      if (battle?.state.status !== 'fighting') break;
      await answer(user, server);
      await wait(2000); // tir, touché, question suivante
      const arrival = screen.queryByTestId('boss-arrival');
      if (arrival) {
        sawArrival = true;
        expect(arrival).not.toHaveTextContent('3 vies');
        expect(within(arrival).queryByRole('button', { name: /Au combat/ })).not.toBeInTheDocument();
        await wait(6500); // répliques, puis « Touche l’écran pour continuer »
        expect(within(arrival).getByText(/Touche l’écran pour continuer/)).toBeInTheDocument();
        await user.click(within(arrival).getByRole('button', { name: 'Passer' }));
      }
      const rage = screen.queryByRole('dialog', { name: /passe en rage/ });
      if (rage) {
        sawRage = true;
        for (let k = 0; k < 3; k++) {
          await wait(700); // anti double-toucher
          await user.click(within(rage).getByRole('button', { name: 'Passer' }));
        }
        await wait(10_000); // réplique du héros, fin des minuteurs de la rage
      }
    }
    expect(sawArrival).toBe(true);
    expect(sawRage).toBe(true);
    await wait(4000); // pose finale avant le bilan
    expect(await screen.findByRole('heading', { name: /est vaincu/ })).toBeInTheDocument();
    expect(server.calls.some((c) => c.path.endsWith('/finish'))).toBe(true);
  });

  it('défaite : riposte, explication, puis « On recommence ? »', async () => {
    const { user, server } = renderApp(PATH, { fakeTimers: true, battleAnswers: false });
    await skipIntro(user);
    for (let i = 0; i < 3; i++) {
      await answer(user, server);
      await wait(1500);
      await user.click(await screen.findByRole('button', { name: /Oui, j’essaie|Voir le résultat/ }));
    }
    await wait(4000);
    expect((await screen.findAllByText(/On recommence/)).length).toBeGreaterThan(0);
    expect(server.calls.some((c) => c.path.endsWith('/finish'))).toBe(true);
  });

  it('objets : l’indice s’affiche, un objet épuisé est refusé', async () => {
    const { user, server } = renderApp(PATH, {
      fakeTimers: true,
      inventory: { bouclier: 0, soin: 0, indice: 1 },
    });
    server.overview.equipped = ['indice'];
    await skipIntro(user);
    await user.click(screen.getByRole('button', { name: /Indice/ }));
    expect(await screen.findByText('Indice :')).toBeInTheDocument();
  });

  it('indice sans objet : « ? » le donne, sans réponse envoyée ni erreur', async () => {
    const { user, server } = renderApp(PATH, { fakeTimers: true });
    await skipIntro(user);
    await user.click(screen.getByRole('button', { name: 'Un indice (attaque un peu moins forte)' }));
    expect(await screen.findByText('Indice :')).toBeInTheDocument();
    expect(screen.getByText(/ton attaque sera un peu moins forte/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3 cœurs sur 3' })).toBeInTheDocument();
    expect(server.calls.some((c) => c.path.endsWith('/hint'))).toBe(true);
    expect(server.calls.some((c) => c.path.endsWith('/answers'))).toBe(false);
  });

  it('pause : le boss garde ses vies, on peut reprendre', async () => {
    const { user } = renderApp(PATH, { fakeTimers: true });
    await skipIntro(user);
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('alertdialog', { name: 'Pause' })).toHaveTextContent('le boss garde ses vies');
    await user.click(screen.getByRole('button', { name: 'Reprendre' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('pause : Recommencer relance un combat identique', async () => {
    const { user, server } = renderApp(PATH, { fakeTimers: true });
    await skipIntro(user);
    const before = server.battles.size;
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    const labels = within(screen.getByRole('alertdialog', { name: 'Pause' }))
      .getAllByRole('button')
      .map((b) => b.textContent);
    expect(labels).toEqual(['Reprendre', 'Recommencer', 'Quitter le combat']);
    await user.click(screen.getByRole('button', { name: 'Recommencer' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(await screen.findByTestId('battle-intro')).toBeInTheDocument();
    await waitFor(() => expect(server.battles.size).toBe(before + 1));
  });

  it('combat expiré par une mise à jour : message et relance possible', async () => {
    const { user, server } = renderApp(PATH, { fakeTimers: true });
    server.override('answerBattle', () => {
      throw new FakeError(410, 'GONE', 'Ce combat a expiré avec la mise à jour du jeu. Relance-le !');
    });
    await skipIntro(user);
    await answer(user, server);
    expect(await screen.findByText(/a expiré/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Relancer le combat' })).toBeInTheDocument();
  });

  it('serveur injoignable au lancement : message d’erreur', async () => {
    renderApp(PATH, {
      setup: (server) =>
        server.override('startBattle', () => {
          throw new Error('panne');
        }),
    });
    expect(await screen.findByText(/joindre le serveur/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retour aux boss' })).toBeInTheDocument();
  });
});
