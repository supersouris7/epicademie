import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ArenaView, ChatMessage, OnlinePlayer } from '@questeo/shared';

/** Fausse connexion socket.io : enregistre les écouteurs et les messages émis. */
class FakeSocket {
  handlers = new Map<string, (arg: unknown) => void>();
  emitted: [string, unknown][] = [];
  active = true;
  disconnected = false;
  on(event: string, fn: (arg: unknown) => void) {
    this.handlers.set(event, fn);
    return this;
  }
  emit(event: string, arg?: unknown) {
    this.emitted.push([event, arg]);
  }
  disconnect() {
    this.disconnected = true;
  }
  fire(event: string, arg?: unknown) {
    this.handlers.get(event)?.(arg);
  }
}
const sockets: FakeSocket[] = [];
vi.mock('socket.io-client', () => ({
  io: (opts: { auth: { profileId: string } }) => {
    const s = Object.assign(new FakeSocket(), { auth: opts.auth });
    sockets.push(s);
    return s;
  },
}));

const { useRealtime } = await import('./store.ts');
const last = (): FakeSocket => {
  const s = sockets.at(-1);
  if (!s) throw new Error('aucune connexion');
  return s;
};

beforeEach(() => {
  useRealtime.getState().connect(null);
  useRealtime.setState({ notices: [], refused: null });
});

describe('connexion temps réel', () => {
  it('se connecte pour le profil choisi et reçoit la présence', () => {
    useRealtime.getState().connect('p1');
    const players: OnlinePlayer[] = [
      { id: 'p1', name: 'Léa', hero: 'lina', avatar: { style: 'pixelbot', seed: 'x' }, busy: false },
    ];
    last().fire('presence', players);
    expect(useRealtime.getState().online).toEqual(players);
    // Même profil : pas de nouvelle connexion.
    const count = sockets.length;
    useRealtime.getState().connect('p1');
    expect(sockets.length).toBe(count);
  });

  it('change de joueur : coupe l’ancienne connexion', () => {
    useRealtime.getState().connect('p1');
    const first = last();
    useRealtime.getState().connect('p2');
    expect(first.disconnected).toBe(true);
    expect(useRealtime.getState().profileId).toBe('p2');
  });

  it('refus du serveur : message gardé, retour au choix du profil', () => {
    const onRefused = vi.fn();
    window.addEventListener('questeo:refused', onRefused);
    useRealtime.getState().connect('p1');
    const s = last();
    s.active = false;
    s.fire('connect_error', new Error('Non, ce joueur est déjà connecté sur un autre appareil.'));
    expect(useRealtime.getState().refused).toMatch(/déjà connecté/);
    expect(useRealtime.getState().profileId).toBeNull();
    expect(onRefused).toHaveBeenCalled();
    useRealtime.getState().clearRefused();
    expect(useRealtime.getState().refused).toBeNull();
  });

  it('coupure réseau : pas de refus (reconnexion automatique)', () => {
    useRealtime.getState().connect('p1');
    last().fire('connect_error', new Error('xhr poll error'));
    expect(useRealtime.getState().refused).toBeNull();
  });

  it('messages et invitations : 4 notifications au plus, fermables', () => {
    useRealtime.getState().connect('p1');
    const msg: ChatMessage = { from: { id: 'p2', name: 'Tom', hero: 'alex' }, text: 'Salut !', at: 1 };
    for (let i = 0; i < 6; i++) last().fire('chat', msg);
    const notices = useRealtime.getState().notices;
    expect(notices).toHaveLength(4);
    useRealtime.getState().dismiss(notices[0]?.id ?? -1);
    expect(useRealtime.getState().notices).toHaveLength(3);
    last().fire('arena:invite', { arenaId: 'a', from: msg.from, chapterId: 'c' });
    expect(useRealtime.getState().notices.at(-1)?.kind).toBe('invite');
  });

  it('arène : vue reçue, fermée, actions envoyées au serveur', () => {
    useRealtime.getState().connect('p1');
    const s = last();
    const view = { id: 'a1' } as ArenaView;
    s.fire('arena', view);
    expect(useRealtime.getState().arena).toBe(view);
    s.fire('arena:closed', 'autre');
    expect(useRealtime.getState().arena).toBe(view);
    s.fire('arena:closed', 'a1');
    expect(useRealtime.getState().arena).toBeNull();
    const st = useRealtime.getState();
    st.sendChat('p2', { kind: 'emoji', index: 0 });
    st.createArena('m5-calcul', ['p2']);
    st.respondArena('a1', true);
    st.startArena();
    st.answerArena({ kind: 'number', text: '3' });
    st.leaveArena();
    expect(s.emitted.map(([e]) => e)).toEqual([
      'chat',
      'arena:create',
      'arena:respond',
      'arena:start',
      'arena:answer',
      'arena:leave',
    ]);
  });
});
