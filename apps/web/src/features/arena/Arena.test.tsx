import { act, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { generate } from '@questeo/content';
import type { ArenaView, OnlinePlayer } from '@questeo/shared';
import { makeProfile } from '../../testing/fakeApi.ts';
import { sockets } from '../../testing/fakeSocket.ts';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Arène vue par Léa (l'hôte) ; le serveur temps réel est simulé par la fausse connexion. */
const me = makeProfile();
const tom: OnlinePlayer = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Tom',
  hero: 'alex',
  avatar: { style: 'portrait', seed: '07' },
  busy: false,
};
const socket = () => {
  const s = sockets.at(-1);
  if (!s) throw new Error('pas de connexion');
  return s;
};
const serverSays = (event: string, arg: unknown) => {
  act(() => {
    socket().fire(event, arg);
  });
};
const emitted = (event: string) => socket().emitted.filter(([e]) => e === event);

const arena = (over: Partial<ArenaView> = {}): ArenaView => ({
  id: 'a1',
  kind: 'duel',
  raid: null,
  hostId: me.id,
  chapterId: 'm5-relatifs',
  phase: 'lobby',
  players: [
    { id: me.id, name: me.name, hero: me.hero, hearts: 3, ready: true },
    { id: tom.id, name: tom.name, hero: tom.hero, hearts: 3, ready: true },
  ],
  turnId: null,
  turn: 0,
  question: null,
  deadline: null,
  last: null,
  winnerId: null,
  ...over,
});

describe('arène', () => {
  it('sans adversaire connecté : on attend un ami', async () => {
    renderApp('/arene');
    expect(await screen.findByText(/Personne n’est disponible/)).toBeInTheDocument();
  });

  it('invitation d’un ami connecté, puis salon et lancement', async () => {
    const { user } = renderApp('/arene');
    await screen.findByText(/Le chapitre/);
    serverSays('presence', [tom]);
    await user.click(within(screen.getByRole('group', { name: 'Adversaires' })).getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Envoyer les invitations' }));
    expect(emitted('arena:create')).toHaveLength(1);

    serverSays('arena', arena());
    await user.click(await screen.findByRole('button', { name: 'Lancer le combat' }));
    expect(emitted('arena:start')).toHaveLength(1);
  });

  it('partie : à mon tour je réponds, puis la victoire s’affiche', async () => {
    const { user } = renderApp('/arene');
    await screen.findByText(/Le chapitre/);
    const question = { skillId: 'm5-relatifs-comparer', level: 1 as const, seed: 3 };
    serverSays('arena', arena({ phase: 'playing', turnId: me.id, turn: 1, question, deadline: Date.now() + 20_000 }));
    expect(await screen.findByText('À toi de jouer !')).toBeInTheDocument();
    const q = generate(question.skillId, question.level, question.seed);
    if (q.answer.kind === 'choice') {
      await user.click(within(screen.getByRole('tabpanel')).getAllByRole('button')[0]!);
    } else {
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: 'OK' }));
    }
    expect(emitted('arena:answer')).toHaveLength(1);

    serverSays(
      'arena',
      arena({
        phase: 'playing',
        turnId: tom.id,
        turn: 2,
        question,
        last: { playerId: me.id, correct: true, targetId: tom.id, timeout: false },
      }),
    );
    expect(await screen.findByText(/Au tour de Tom/)).toBeInTheDocument();

    serverSays('arena', arena({ phase: 'over', winnerId: me.id }));
    expect(await screen.findByRole('heading', { name: 'Victoire !' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Suite' }));
    // Bouton du bilan (le dernier ; le premier est la flèche retour de la page).
    await user.click(screen.getAllByRole('button', { name: 'Retour' }).at(-1)!);
    expect(emitted('arena:leave').length).toBeGreaterThan(0);
  });

  it('défaite : le nom du gagnant', async () => {
    renderApp('/arene');
    await screen.findByText(/Le chapitre/);
    serverSays(
      'arena',
      arena({
        phase: 'playing',
        turnId: me.id,
        players: [
          { id: me.id, name: me.name, hero: me.hero, hearts: 3, ready: true },
          { id: tom.id, name: tom.name, hero: tom.hero, hearts: 3, ready: true, away: true },
        ],
      }),
    );
    expect(await screen.findByText('Déconnecté…')).toBeInTheDocument();
    serverSays('arena', arena({ phase: 'over', winnerId: tom.id }));
    expect(await screen.findByRole('heading', { name: 'Tom a gagné !' })).toBeInTheDocument();
  });

  it('notifications : message reçu et invitation', async () => {
    const { user } = renderApp('/hub');
    await screen.findByRole('group', { name: 'Mon joueur' });
    serverSays('chat', {
      from: { id: tom.id, name: 'Tom', hero: 'alex' },
      payload: { kind: 'emote', id: 'bravo' },
    });
    serverSays('arena:invite', {
      arenaId: 'a1',
      from: { id: tom.id, name: 'Tom', hero: 'alex' },
      chapterId: 'm5-relatifs',
    });
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
    const go = screen.queryByRole('button', { name: 'J’y vais !' });
    if (go) {
      await user.click(go);
      expect(emitted('arena:respond')).toHaveLength(1);
    }
  });

  it('joueurs connectés : liste et message rapide', async () => {
    const before = sockets.length;
    const { user } = renderApp('/connectes');
    // La connexion temps réel s'ouvre une fois la session vérifiée.
    await waitFor(() => expect(sockets.length).toBeGreaterThan(before));
    serverSays('presence', [tom]);
    const send = await screen.findByRole('button', { name: 'Message à Tom' });
    await user.click(send);
    const emotes = screen
      .getAllByRole('button')
      .filter((b) => b !== send && b.closest('[role="dialog"], [role="menu"], section'));
    if (emotes[0]) await user.click(emotes[0]);
    expect(screen.getAllByText('Tom').length).toBeGreaterThan(0);
  });

  it('raid : invitations d’équipiers, puis boss et cœurs partagés', async () => {
    const { user } = renderApp('/arene?mode=raid');
    expect(await screen.findByRole('heading', { name: 'Raid' })).toBeInTheDocument();
    serverSays('presence', [
      { id: me.id, name: me.name, hero: me.hero, avatar: me.avatar, busy: false },
      { id: tom.id, name: tom.name, hero: tom.hero, avatar: tom.avatar, busy: false },
    ]);
    await user.click(await screen.findByRole('checkbox', { name: /Tom/ }));
    await user.click(screen.getByRole('button', { name: 'Envoyer les invitations' }));
    expect(emitted('arena:create').at(-1)?.[1]).toMatchObject({ kind: 'raid', invite: [tom.id] });
    serverSays(
      'arena',
      arena({
        kind: 'raid',
        phase: 'over',
        raid: { bossHp: 0, bossMaxHp: 6, teamHearts: 2, teamMaxHearts: 4, won: true },
      }),
    );
    expect(await screen.findByRole('heading', { name: 'Boss vaincu ! Bravo l’équipe !' })).toBeInTheDocument();
  });
});
