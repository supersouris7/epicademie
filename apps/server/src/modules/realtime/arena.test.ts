import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fmt, generate } from '@questeo/content';
import type { ArenaView, Profile } from '@questeo/shared';
import { createArenas } from './arena.ts';
import type { Presence } from './presence.ts';
import { fixedClock } from '../../testing/harness.ts';
import { systemRandom } from '../../core/random.ts';

/** Présence factice : trois joueurs connectés, messages reçus par joueur. */
const people = ['lea', 'tom', 'ines'].map((name, i): Profile => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`,
  name,
  avatar: { style: 'pixelbot', seed: name },
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

let arenas: ReturnType<typeof createArenas>;
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

  it('refuse un chapitre inconnu, une invitation vide ou un joueur déjà en arène', () => {
    arenas.create(lea, { chapterId: 'inconnu', invite: [tom.id] });
    arenas.create(lea, { chapterId: 'm5-calcul', invite: ['00000000-0000-4000-8000-000000000099'] });
    expect(arenas.count()).toBe(0);
    arenas.create(lea, { chapterId: 'm5-calcul', invite: [tom.id] });
    arenas.create(ines, { chapterId: 'm5-calcul', invite: [tom.id] });
    expect(arenas.count()).toBe(1);
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
});
