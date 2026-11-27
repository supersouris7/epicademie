import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getChapterOfSkill, isFreeChapter } from '@epicademie/content';
import {
  DUEL_INVITE_TTL_MS,
  DUEL_LIVES,
  DUEL_QUESTION_SECONDS,
  DUEL_REMATCH_TTL_MS,
  DUEL_ROUND_BREAK_SECONDS,
  DUEL_ROUND_SECONDS,
  MATCH_GRACE_MS,
  type DuelInvite,
  type DuelView,
  type Grade,
  type Profile,
} from '@epicademie/shared';
import { systemRandom } from '../../core/random.ts';
import { rightResponse } from '../../testing/answers.ts';
import { createDuels, type Duels } from './duel.ts';
import type { Presence } from './presence.ts';

/** Présence factice : Léa (CM1) et Tom (4e) liés, Zoé inconnue d'eux ; messages reçus par joueur. */
const person = (n: number, name: string, grade: Grade): Profile => ({
  id: `00000000-0000-4000-8000-00000000000${n}`,
  name,
  avatar: { style: 'portrait', seed: '07' },
  gender: 'fille',
  birthDate: '2014-03-09',
  hero: 'alex',
  grade,
  xp: 0,
  coins: 0,
  rubies: 0,
  soundOn: true,
  musicOn: true,
  createdAt: '2026-11-19T00:00:00.000Z',
});
const lea = person(1, 'Léa', 'cm1');
const tom = person(2, 'Tom', '4e');
const zoe = person(3, 'Zoé', '5e');
const ines = person(4, 'Inès', '6e');
const people = [lea, tom, zoe, ines];

let inbox: Map<string, [string, unknown][]>;
let online: Set<string>;
let unlinked: Set<string>;
let elsewhere: Set<string>;
let duels: Duels;
const onStart = vi.fn();
const canPlayChapter = vi.fn((family: string, chapterId: string) =>
  // La famille de Tom n'est pas abonnée : chapitres gratuits seulement.
  Promise.resolve(family !== `famille-${tom.id}` || isFreeChapter(chapterId)),
);

const presence = {
  isOnline: (id: string) => online.has(id),
  profile: (id: string) => (online.has(id) ? people.find((p) => p.id === id) : undefined),
  familyOf: (id: string) => `famille-${id}`,
  linked: (a: string, b: string) =>
    online.has(a) && online.has(b) && ![a, b].includes(zoe.id) && !unlinked.has(a) && !unlinked.has(b),
  emit: (id: string, event: string, data?: unknown) => {
    if (online.has(id)) inbox.get(id)?.push([event, structuredClone(data)]);
  },
} as unknown as Presence;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  inbox = new Map(people.map((p) => [p.id, []]));
  online = new Set(people.map((p) => p.id));
  unlinked = new Set();
  elsewhere = new Set();
  duels = createDuels({
    presence,
    clock: { now: () => new Date() },
    random: systemRandom,
    canPlayChapter,
    isBusyElsewhere: (id) => elsewhere.has(id),
    onStart,
    onBusyChange: () => undefined,
  });
});
afterEach(() => {
  duels.dispose();
  vi.useRealTimers();
});

const all = <T>(p: Profile, event: string) =>
  (inbox.get(p.id) ?? []).filter(([e]) => e === event).map(([, d]) => d as T);
const view = (p: Profile) => {
  const v = all<DuelView>(p, 'duel').at(-1);
  if (!v) throw new Error('aucune vue');
  return v;
};
const invitation = (p: Profile) => all<DuelInvite>(p, 'duel:invite').at(-1);
const closed = (p: Profile) => all<string>(p, 'duel:closed');
const wait = (seconds: number) => vi.advanceTimersByTimeAsync(seconds * 1000);

async function startDuel(a = lea, b = tom) {
  duels.challenge(a, { to: b.id, subject: 'maths' });
  await duels.respond(b.id, invitation(b)?.duelId ?? '', true);
}
const question = (p: Profile) => {
  const q = view(p).question;
  if (!q) throw new Error('pas de question');
  return q;
};
const good = (p: Profile) => duels.answer(p.id, { seq: question(p).seq, response: rightResponse(question(p)) });
const bad = (p: Profile) => duels.answer(p.id, { seq: question(p).seq, response: { kind: 'unknown' } });
/** Le joueur gagne la manche en cours (un bouclier adverse peut coûter un tir de plus). */
const sweep = (p: Profile) => {
  while (view(p).phase === 'playing') good(p);
};

describe('duel : invitation', () => {
  it('défi vers un joueur non lié, hors ligne, occupé ou soi-même : sans effet', () => {
    duels.challenge(lea, { to: zoe.id, subject: 'maths' });
    duels.challenge(lea, { to: lea.id, subject: 'maths' });
    elsewhere.add(tom.id);
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    elsewhere.clear();
    online.delete(tom.id);
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    online.add(tom.id);
    // Matière sans contenu pour ces classes.
    duels.challenge(lea, { to: tom.id, subject: 'francais' });
    duels.subjects(lea.id, zoe.id);
    expect(duels.count()).toBe(0);
    expect([...inbox.values()].flat()).toEqual([]);
  });

  it('matières communes avec un joueur lié', () => {
    duels.subjects(lea.id, tom.id);
    expect(all<{ subjects: string[] }>(lea, 'duel:subjects')[0]?.subjects).toContain('maths');
  });

  it('invitation, salon, refus ; seul l’invité peut répondre', async () => {
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    const inv = invitation(tom);
    expect(inv).toMatchObject({ from: { name: 'Léa' }, subject: 'maths' });
    expect(view(lea)).toMatchObject({ phase: 'lobby', question: null, deadline: null });
    expect(all(tom, 'duel')).toEqual([]);
    // Défi répété : aucune nouvelle sollicitation.
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    expect(all(tom, 'duel:invite')).toHaveLength(1);
    await duels.respond(lea.id, inv?.duelId ?? '', true);
    await duels.respond(ines.id, inv?.duelId ?? '', true);
    expect(view(lea).phase).toBe('lobby');
    await duels.respond(tom.id, inv?.duelId ?? '', false);
    expect(closed(lea)).toEqual([inv?.duelId]);
    expect(duels.count()).toBe(0);
  });

  it('invitation sans réponse, annulée, ou remplacée : effacée', async () => {
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    await vi.advanceTimersByTimeAsync(DUEL_INVITE_TTL_MS);
    expect(closed(tom)).toHaveLength(1);
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    duels.challenge(lea, { to: ines.id, subject: 'maths' });
    expect(closed(tom)).toHaveLength(2);
    duels.leave(lea.id);
    expect(closed(ines)).toHaveLength(1);
    expect(duels.count()).toBe(0);
  });

  it('accepter annule les autres invitations des deux joueurs, qui deviennent occupés', async () => {
    duels.challenge(ines, { to: tom.id, subject: 'maths' });
    await startDuel();
    expect(closed(ines)).toHaveLength(1);
    expect(duels.count()).toBe(1);
    expect(onStart).toHaveBeenCalledWith([lea.id, tom.id]);
    expect([lea, tom, ines].map((p) => duels.isBusy(p.id))).toEqual([true, true, false]);
    duels.challenge(ines, { to: tom.id, subject: 'maths' });
    expect(duels.count()).toBe(1);
  });

  it('joueur pris par un autre mode, ou liaison retirée : le duel est effacé', async () => {
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    elsewhere.add(tom.id);
    duels.prune();
    expect(duels.count()).toBe(0);
    elsewhere.clear();
    await startDuel();
    unlinked.add(tom.id);
    duels.prune();
    expect(duels.count()).toBe(0);
    expect(duels.isBusy(lea.id)).toBe(false);
  });

  it('départ pendant la préparation des questions : aucune partie', async () => {
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    const pending = duels.respond(tom.id, invitation(tom)?.duelId ?? '', true);
    duels.leave(lea.id);
    await pending;
    expect(duels.count()).toBe(0);
    expect(all(tom, 'duel')).toEqual([]);
  });

  it('préparation en échec : duel effacé, erreur remontée', async () => {
    canPlayChapter.mockRejectedValueOnce(new Error('base indisponible'));
    await expect(startDuel()).rejects.toThrow('base indisponible');
    expect(duels.count()).toBe(0);
  });
});

describe('duel : partie', () => {
  it('chacun reçoit des notions de sa classe et des chapitres de sa famille', async () => {
    await startDuel();
    for (let i = 0; i < 12; i++) {
      const mine = getChapterOfSkill(question(lea).skillId);
      const theirs = getChapterOfSkill(question(tom).skillId);
      expect(mine?.grade).toBe('cm1');
      expect(theirs?.grade).toBe('4e');
      expect(isFreeChapter(theirs?.id ?? '')).toBe(true);
      bad(lea);
      bad(tom);
    }
  });

  it('bonne réponse : tir à la réception ; mauvaise ou temps écoulé : aucune vie perdue', async () => {
    await startDuel();
    const first = question(lea);
    const theirs = question(tom);
    good(lea);
    expect(view(tom)).toMatchObject({ you: { lives: DUEL_LIVES - 1 }, lastShot: { by: 'opponent', outcome: 'hit' } });
    expect(view(lea).lastShot).toMatchObject({ by: 'you', outcome: 'hit' });
    // La file de Léa avance seule ; Tom garde sa question.
    expect(question(lea).seq).toBe(first.seq + 1);
    expect(question(tom)).toEqual(theirs);
    // Réponse en retard (question passée) : ignorée.
    duels.answer(lea.id, { seq: first.seq, response: rightResponse(first) });
    // Réponse illisible : redemandée.
    duels.answer(lea.id, { seq: question(lea).seq, response: { kind: 'order', order: [99] } });
    expect(view(tom).you.lives).toBe(DUEL_LIVES - 1);
    bad(tom);
    expect(view(lea)).toMatchObject({ you: { lives: DUEL_LIVES }, lastShot: { by: 'opponent', outcome: 'missed' } });
    const late = question(lea).seq;
    await wait(DUEL_QUESTION_SECONDS);
    expect(question(lea).seq).toBe(late + 1);
    expect(view(lea).you.lives).toBe(DUEL_LIVES);
    expect(view(tom).you.lives).toBe(DUEL_LIVES - 1);
  });

  it('bouclier actif : le tir suivant reçu est bloqué ; la vue ne montre que sa question', async () => {
    await startDuel();
    good(tom);
    good(tom);
    good(tom);
    expect(view(lea).opponent.shield).toBe(true);
    good(lea);
    expect(view(tom)).toMatchObject({ you: { lives: DUEL_LIVES, shield: false }, lastShot: { outcome: 'blocked' } });
    expect(view(lea).question).not.toEqual(view(tom).question);
    expect(view(lea).summary).toBeNull();
  });

  it('manches : égalité au temps, pause, puis victoire en 2 manches gagnantes', async () => {
    await startDuel();
    await wait(DUEL_ROUND_SECONDS);
    expect(view(lea)).toMatchObject({
      phase: 'round-over',
      roundWinner: 'both',
      question: null,
      you: { roundsWon: 1 },
      opponent: { roundsWon: 1 },
    });
    await wait(DUEL_ROUND_BREAK_SECONDS);
    expect(view(lea)).toMatchObject({ phase: 'playing', round: 2 });
    sweep(lea);
    expect(view(lea)).toMatchObject({ phase: 'over', end: 'match', winner: 'you', deadline: null, question: null });
    expect(view(tom)).toMatchObject({ winner: 'opponent', summary: { hits: 0, shields: 0, correct: 0 } });
    expect(view(lea).summary).toMatchObject({ hits: DUEL_LIVES, correct: DUEL_LIVES, shields: 1 });
    expect(duels.isBusy(lea.id)).toBe(false);
  });

  it('manche gagnée aux vies, puis match', async () => {
    await startDuel();
    good(tom);
    await wait(DUEL_ROUND_SECONDS);
    expect(view(tom)).toMatchObject({ phase: 'round-over', roundWinner: 'you' });
    await wait(DUEL_ROUND_BREAK_SECONDS);
    sweep(tom);
    expect(view(lea)).toMatchObject({ phase: 'over', winner: 'opponent' });
  });
});

describe('duel : coupures, départs et revanche', () => {
  it('coupure de moins de 30 s : le temps continue, reprise avec l’état courant', async () => {
    await startDuel();
    good(lea);
    const seq = question(tom).seq;
    online.delete(tom.id);
    duels.disconnected(tom.id);
    expect(view(lea).opponent.away).toBe(true);
    await vi.advanceTimersByTimeAsync(MATCH_GRACE_MS - 1000);
    online.add(tom.id);
    duels.reconnected(tom.id);
    expect(view(tom)).toMatchObject({ phase: 'playing', you: { lives: DUEL_LIVES - 1, away: false } });
    expect(question(tom).seq).toBeGreaterThanOrEqual(seq);
    expect(view(lea).opponent.away).toBe(false);
    await vi.advanceTimersByTimeAsync(MATCH_GRACE_MS);
    expect(view(lea).end).toBeNull();
  });

  it.each([
    [
      'coupure de plus de 30 s',
      async () => {
        online.delete(tom.id);
        duels.disconnected(tom.id);
        await vi.advanceTimersByTimeAsync(MATCH_GRACE_MS);
      },
    ],
    [
      'départ volontaire',
      () => {
        duels.leave(tom.id);
        return Promise.resolve();
      },
    ],
  ])('%s : fin propre, bilan au restant, aucun vainqueur', async (_label, quit) => {
    await startDuel();
    good(lea);
    await quit();
    expect(view(lea)).toMatchObject({
      phase: 'over',
      end: 'opponent-left',
      winner: null,
      rematch: null,
      question: null,
      summary: { hits: 1, correct: 1 },
    });
    expect(duels.isBusy(lea.id)).toBe(false);
    await duels.rematch(lea.id);
    await vi.advanceTimersByTimeAsync(DUEL_REMATCH_TTL_MS);
    expect(duels.count()).toBe(0);
    expect(closed(lea)).toEqual([]);
  });

  it('les deux partent : plus rien en mémoire', async () => {
    await startDuel();
    duels.leave(tom.id);
    duels.leave(lea.id);
    expect(duels.count()).toBe(0);
  });

  const finishedDuel = async () => {
    await startDuel();
    sweep(lea);
    await wait(DUEL_ROUND_BREAK_SECONDS);
    sweep(lea);
  };

  it('revanche : une nouvelle partie quand les deux l’acceptent', async () => {
    await finishedDuel();
    const old = view(lea).id;
    await duels.rematch(lea.id);
    expect(view(tom).rematch).toMatchObject({ you: false, opponent: true });
    await duels.rematch(tom.id);
    expect(closed(tom)).toEqual([old]);
    expect(view(tom)).toMatchObject({ phase: 'playing', round: 1, you: { lives: DUEL_LIVES, roundsWon: 0 } });
    expect(view(tom).id).not.toBe(old);
    expect(duels.count()).toBe(1);
  });

  it('revanche expirée après 60 s : le bilan reste affiché, le duel est effacé', async () => {
    await finishedDuel();
    await duels.rematch(lea.id);
    await vi.advanceTimersByTimeAsync(DUEL_REMATCH_TTL_MS);
    expect(view(lea)).toMatchObject({ phase: 'over', rematch: null });
    await duels.rematch(tom.id);
    expect(duels.count()).toBe(0);
  });

  it('quitter le bilan, ou défier quelqu’un d’autre : plus de revanche', async () => {
    await finishedDuel();
    duels.challenge(tom, { to: ines.id, subject: 'maths' });
    expect(view(lea).rematch).toBeNull();
    expect(closed(tom)).toHaveLength(1);
    duels.leave(lea.id);
    expect(duels.count()).toBe(1);
  });

  it('invitation en attente : retrouvée à la reconnexion, effacée après 30 s d’absence', async () => {
    duels.challenge(lea, { to: tom.id, subject: 'maths' });
    duels.disconnected(tom.id);
    duels.reconnected(tom.id);
    expect(all(tom, 'duel:invite')).toHaveLength(2);
    duels.disconnected(lea.id);
    await vi.advanceTimersByTimeAsync(MATCH_GRACE_MS);
    expect(duels.count()).toBe(0);
  });
});
