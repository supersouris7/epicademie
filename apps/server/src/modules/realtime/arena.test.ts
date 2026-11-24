import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fmt, generate } from '@epicademie/content';
import type { ArenaView, Profile } from '@epicademie/shared';
import { ARENA_GRACE_MS, createArenas, LOBBY_TTL_MS, type Arenas } from './arena.ts';
import type { Presence } from './presence.ts';
import { fixedClock } from '../../testing/harness.ts';
import { systemRandom } from '../../core/random.ts';

/** Présence factice : trois joueurs connectés, messages reçus par joueur. */
const people = ['lea', 'tom', 'ines'].map((name, i): Profile => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`,
  name,
  avatar: { style: 'portrait', seed: '07' },
  gender: 'fille',
  birthDate: i === 2 ? '2010-01-01' : '2014-03-09',
  hero: 'alex',
  grade: '5e',
  xp: 0,
  coins: 0,
  rubies: 0,
  soundOn: true,
  musicOn: true,
  createdAt: '2026-11-19T00:00:00.000Z',
}));
const [lea, tom, ines] = people as [Profile, Profile, Profile];
let inbox: Map<string, [string, unknown][]>;
const presence = {
  isOnline: (id: string) => people.some((p) => p.id === id),
  profile: (id: string) => people.find((p) => p.id === id),
  emit: (id: string, event: string, data?: unknown) => inbox.get(id)?.push([event, data]),
} as unknown as Presence;
const last = (id: string, event: string) =>
  [...(inbox.get(id) ?? [])].reverse().find(([e]) => e === event)?.[1] as ArenaView | string | undefined;

let arenas: Arenas;
const busy = vi.fn();
beforeEach(() => {
  vi.useFakeTimers();
  inbox = new Map(people.map((p) => [p.id, []]));
  arenas = createArenas({ presence, clock: fixedClock('2026-11-19'), random: systemRandom, onBusyChange: busy });
});
afterEach(() => {
  arenas.dispose();
  vi.useRealTimers();
});

const rightAnswer = (v: ArenaView) => {
  const q = v.question;
  if (!q) throw new Error('pas de question');
  const a = generate(q.skillId, q.level, q.seed).answer;
  if (a.kind === 'number') return { kind: 'number' as const, text: fmt(a.value) };
  if (a.kind === 'choice') return { kind: 'choice' as const, index: a.correct };
  throw new Error(a.kind);
};

describe('arène', () => {
  it('salon : invitation, refus, l’hôte qui part ferme le salon', () => {
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id, ines.id, lea.id] });
    expect(last(tom.id, 'arena:invite')).toMatchObject({ from: { name: 'lea' } });
    expect(arenas.viewOf(lea.id)?.players.map((p) => p.name)).toEqual(['lea', 'tom', 'ines']);
    arenas.respond(ines.id, arenas.viewOf(lea.id)?.id ?? '', false);
    expect(last(ines.id, 'arena:closed')).toBeDefined();
    expect(arenas.viewOf(lea.id)?.players).toHaveLength(2);
    arenas.leave(lea.id);
    expect(last(tom.id, 'arena:closed')).toBeDefined();
    expect(arenas.count()).toBe(0);
  });

  it('refuse un chapitre inconnu, une invitation vide ou un joueur en pleine partie', () => {
    arenas.create(lea, { chapterId: 'inconnu', invite: [tom.id] });
    arenas.create(lea, { chapterId: 'm5-calcul', invite: ['00000000-0000-4000-8000-000000000099'] });
    expect(arenas.count()).toBe(0);
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    // Un salon en attente ne bloque pas : Inès peut aussi inviter Tom.
    arenas.create(ines, { chapterId: 'm5-calcul', invite: [tom.id] });
    expect(arenas.count()).toBe(2);
    // Tom accepte Inès : il quitte le salon de Léa (qui n'a plus d'invité).
    arenas.respond(tom.id, arenas.viewOf(ines.id)?.id ?? '', true);
    arenas.start(ines.id);
    expect(arenas.viewOf(tom.id)?.phase).toBe('playing');
    // En pleine partie : Léa ne peut plus l'inviter.
    arenas.leave(lea.id);
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    expect(arenas.viewOf(lea.id)).toBeNull();
  });

  it('après une partie terminée : on peut réinviter tout de suite (plus « en arène »)', () => {
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    arenas.respond(tom.id, arenas.viewOf(lea.id)?.id ?? '', true);
    arenas.start(lea.id);
    arenas.leave(tom.id); // Tom part : Léa gagne, la partie est finie.
    expect(arenas.viewOf(lea.id)?.phase).toBe('over');
    expect(arenas.isBusy(lea.id)).toBe(false);
    expect(arenas.isBusy(tom.id)).toBe(false);
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    expect(arenas.viewOf(lea.id)?.phase).toBe('lobby');
    expect(last(tom.id, 'arena:invite')).toMatchObject({ from: { name: 'lea' } });
  });

  it('déconnexion pendant son tour : pause (on l’attend), reprise avec le temps restant, sinon il sort', () => {
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    arenas.respond(tom.id, arenas.viewOf(lea.id)?.id ?? '', true);
    arenas.start(lea.id);
    const turnId = arenas.viewOf(lea.id)?.turnId ?? '';
    const other = turnId === lea.id ? tom.id : lea.id;
    const turn = arenas.viewOf(lea.id)?.turn;
    vi.advanceTimersByTime(3000);
    arenas.disconnected(turnId);
    expect(arenas.viewOf(other)).toMatchObject({ waitingFor: turnId, deadline: null });
    // Pendant la pause, son tour ne s'écoule pas.
    vi.advanceTimersByTime(40_000);
    expect(arenas.viewOf(other)?.turn).toBe(turn);
    arenas.reconnected(turnId);
    expect(arenas.viewOf(other)).toMatchObject({ waitingFor: null, turn });
    expect(arenas.viewOf(other)?.deadline).not.toBeNull();
    // Nouvelle coupure, sans retour : au bout de 60 s, il sort et l'autre gagne.
    arenas.disconnected(turnId);
    vi.advanceTimersByTime(60_000);
    expect(arenas.viewOf(other)).toMatchObject({ phase: 'over', winnerId: other });
  });

  it('seul l’hôte lance, avec au moins 2 joueurs prêts ; les absents sont écartés', () => {
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id, ines.id] });
    arenas.start(lea.id);
    expect(arenas.viewOf(lea.id)?.phase).toBe('lobby');
    const id = arenas.viewOf(lea.id)?.id ?? '';
    arenas.respond(tom.id, id, true);
    arenas.start(tom.id);
    expect(arenas.viewOf(lea.id)?.phase).toBe('lobby');
    arenas.start(lea.id);
    expect(arenas.viewOf(lea.id)?.phase).toBe('playing');
    expect(last(ines.id, 'arena:closed')).toBe(id);
    expect(arenas.isBusy(tom.id)).toBe(true);
    expect(busy).toHaveBeenCalled();
  });

  it('temps écoulé : le tour est perdu ; un joueur qui part est éliminé', () => {
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    arenas.respond(tom.id, arenas.viewOf(lea.id)?.id ?? '', true);
    arenas.start(lea.id);
    const before = arenas.viewOf(lea.id);
    vi.advanceTimersByTime(120_000);
    const after = arenas.viewOf(lea.id);
    expect(after?.turn).toBeGreaterThan(before?.turn ?? 0);
    expect(after?.last).toMatchObject({ timeout: true });
    arenas.leave(tom.id);
    const end = arenas.viewOf(lea.id);
    expect(end?.phase).toBe('over');
    expect(end?.winnerId).toBe(lea.id);
    // Arène terminée : effacée au bout d'une minute.
    vi.advanceTimersByTime(61_000);
    expect(arenas.count()).toBe(0);
  });

  it('seul le joueur dont c’est le tour peut répondre ; une bonne réponse attaque', () => {
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    arenas.respond(tom.id, arenas.viewOf(lea.id)?.id ?? '', true);
    arenas.start(lea.id);
    const v = arenas.viewOf(lea.id);
    if (!v) throw new Error('arène');
    const other = v.turnId === lea.id ? tom.id : lea.id;
    arenas.answer(other, rightAnswer(v));
    expect(arenas.viewOf(lea.id)?.turn).toBe(v.turn);
    arenas.answer(v.turnId ?? '', rightAnswer(v));
    const next = arenas.viewOf(lea.id);
    expect(next?.turn).toBe(v.turn + 1);
    expect(next?.last).toMatchObject({ correct: true, targetId: other });
  });

  describe('connexion perdue', () => {
    const playing = () => {
      arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
      arenas.respond(tom.id, arenas.viewOf(lea.id)?.id ?? '', true);
      arenas.start(lea.id);
    };

    it('le joueur reste « déconnecté » quelques secondes, puis reprend sa place', () => {
      playing();
      arenas.disconnected(tom.id);
      expect(arenas.viewOf(lea.id)?.players.find((p) => p.id === tom.id)?.away).toBe(true);
      vi.advanceTimersByTime(ARENA_GRACE_MS - 1000);
      arenas.reconnected(tom.id);
      const v = arenas.viewOf(lea.id);
      expect(v?.phase).toBe('playing');
      expect(v?.players.find((p) => p.id === tom.id)?.away).toBeUndefined();
      // Le délai annulé ne l'élimine plus.
      vi.advanceTimersByTime(ARENA_GRACE_MS);
      expect(arenas.viewOf(lea.id)?.players.find((p) => p.id === tom.id)?.hearts).toBeGreaterThan(0);
    });

    it('sans retour dans le délai : il quitte l’arène, l’autre gagne', () => {
      playing();
      arenas.disconnected(tom.id);
      arenas.disconnected(tom.id); // une seconde déconnexion ne relance pas le délai
      vi.advanceTimersByTime(ARENA_GRACE_MS + 10);
      expect(arenas.viewOf(lea.id)).toMatchObject({ phase: 'over', winnerId: lea.id });
    });

    it('reconnexion hors arène ou sans déconnexion : rien ne change', () => {
      arenas.reconnected(lea.id);
      arenas.disconnected(lea.id);
      expect(arenas.count()).toBe(0);
    });

    it('salon jamais lancé : fermé pour tous au bout de 10 minutes', () => {
      arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
      vi.advanceTimersByTime(LOBBY_TTL_MS + 10);
      expect(arenas.count()).toBe(0);
      expect(last(tom.id, 'arena:closed')).toBeDefined();
      expect(last(lea.id, 'arena:closed')).toBeDefined();
    });

    it('salon lancé à temps : pas de fermeture automatique', () => {
      playing();
      vi.advanceTimersByTime(LOBBY_TTL_MS + 10);
      // La partie se joue (ou se termine par les minuteurs de tour), mais le salon n'est jamais « fermé ».
      expect(last(tom.id, 'arena:closed')).toBeUndefined();
    });
  });
});
