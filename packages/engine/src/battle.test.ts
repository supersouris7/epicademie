import { describe, expect, it } from 'vitest';
import { BATTLE_MOBS } from '@questeo/shared';
import {
  answerBattle,
  applyItem,
  battleXp,
  bossStage,
  createBattle,
  itemRefusal,
  mobLevel,
  weakestSkill,
  type BattleDice,
  type BattleState,
} from './battle.ts';

const pools = { mobs: ['a', 'b', 'c'], problems: ['p1', 'p2'], traps: ['t1'] };

function dice(): BattleDice {
  let n = 0;
  return { random: () => ((n++ * 7) % 10) / 10, seed: () => ++n };
}

const play = (s: BattleState, answers: readonly boolean[], d = dice()) =>
  answers.reduce((st, ok) => answerBattle(st, pools, ok, d).state, s);

describe('combat de boss', () => {
  it('4 mobs (niveau 1 puis 2), puis 2 problèmes et le piège : 7 questions sans faute', () => {
    const d = dice();
    let s = createBattle(pools, d);
    const stages: string[] = [];
    const levels: number[] = [];
    while (s.status === 'fighting' && s.question) {
      stages.push(s.question.stage);
      levels.push(s.question.level);
      s = answerBattle(s, pools, true, d).state;
    }
    expect(s.status).toBe('won');
    expect(stages).toEqual([...Array<string>(BATTLE_MOBS).fill('mob'), 'probleme', 'probleme', 'piege']);
    expect(levels.slice(0, 4)).toEqual([1, 1, 2, 2]);
    expect(s.hearts).toBe(3);
    expect(battleXp(s)).toBe(10 * 7 + 50);
  });

  it('chaque notion du chapitre passe avant qu’une autre revienne', () => {
    const d = dice();
    let s = createBattle(pools, d);
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      seen.push(s.question?.skillId ?? '');
      s = answerBattle(s, pools, true, d).state;
    }
    expect(seen.toSorted()).toEqual(['a', 'b', 'c']);
  });

  it('une erreur contre un mob : riposte (−1 cœur), le mob reste et pose une autre question', () => {
    const d = dice();
    const s = createBattle(pools, d);
    const { state, outcome } = answerBattle(s, pools, false, d);
    expect(outcome).toBe('riposte');
    expect(state.hearts).toBe(2);
    expect(state.mobsDefeated).toBe(0);
    expect(state.misses).toEqual([s.question?.skillId]);
    // Même notion (le même mob), nouvelle question.
    expect(state.question?.skillId).toBe(s.question?.skillId);
    expect(state.question?.seed).not.toBe(s.question?.seed);
  });

  it('bouclier : l’erreur est bloquée, mais le mob reste', () => {
    const d = dice();
    const s = { ...createBattle(pools, d), shield: true };
    const { state, outcome } = answerBattle(s, pools, false, d);
    expect(outcome).toBe('blocked');
    expect(state.hearts).toBe(3);
    expect(state.mobsDefeated).toBe(0);
  });

  it('trois erreurs d’affilée sur le 1er mob : défaite sans l’avoir passé', () => {
    const d = dice();
    let s = createBattle(pools, d);
    for (let i = 0; i < 3; i++) s = answerBattle(s, pools, false, d).state;
    expect(s).toMatchObject({ status: 'lost', hearts: 0, mobsDefeated: 0, question: null });
  });

  it('une erreur contre le boss relance une question du même type', () => {
    const d = dice();
    let s = play(createBattle(pools, d), Array<boolean>(BATTLE_MOBS).fill(true), d);
    expect(s.question?.stage).toBe('probleme');
    const before = s.question?.skillId;
    s = answerBattle(s, pools, false, d).state;
    expect(s.bossLives).toBe(3);
    expect(s.question?.stage).toBe('probleme');
    expect(s.question?.skillId).not.toBe(before);
  });

  it('3 erreurs : défaite, plus de question', () => {
    const s = play(createBattle(pools, dice()), [false, false, false]);
    expect(s.status).toBe('lost');
    expect(s.question).toBeNull();
    expect(() => answerBattle(s, pools, true, dice())).toThrow();
  });

  it('le bouclier absorbe une riposte ; seuls les objets équipés servent, types mélangés', () => {
    const d = dice();
    let s = createBattle(pools, d, [], ['bouclier', 'soin', 'bouclier']);
    expect(itemRefusal(s, 'indice')).toMatch(/pas équipé/);
    s = applyItem(s, 'bouclier');
    expect(s.equipped).toEqual(['soin', 'bouclier']);
    expect(itemRefusal(s, 'bouclier')).toMatch(/déjà levé/);
    const r = answerBattle(s, pools, false, d);
    expect(r.outcome).toBe('blocked');
    expect(r.state.hearts).toBe(3);
    s = answerBattle(r.state, pools, false, d).state;
    expect(s.hearts).toBe(2);
    // Types mélangés : un soin après un bouclier.
    s = applyItem(s, 'soin');
    expect(s.hearts).toBe(3);
    s = applyItem(s, 'bouclier');
    expect(s.equipped).toEqual([]);
    expect(itemRefusal(s, 'bouclier')).toMatch(/pas équipé/);
  });

  it('le soin rend un cœur, l’indice ne vaut que pour la question en cours', () => {
    const d = dice();
    let s = createBattle(pools, d, [], ['soin']);
    expect(itemRefusal(s, 'soin')).toMatch(/pleins/);
    s = answerBattle(s, pools, false, d).state;
    s = applyItem(s, 'soin');
    expect(s.hearts).toBe(3);
    let h = applyItem(createBattle(pools, d, [], ['indice']), 'indice');
    expect(h.hintShown).toBe(true);
    h = answerBattle(h, pools, true, d).state;
    expect(h.hintShown).toBe(false);
  });

  it('notion à retravailler : la plus ratée parmi celles de l’entraînement', () => {
    const s = { ...createBattle(pools, dice()), misses: ['a', 'p1', 'b', 'a', 'p1', 'p1'] };
    expect(weakestSkill(s, pools.mobs)).toBe('a');
    expect(weakestSkill({ ...s, misses: [] }, pools.mobs)).toBeNull();
  });

  it('jamais deux fois le même énoncé (ni ceux des combats précédents)', () => {
    // Chaque notion n'a que 3 énoncés possibles, selon la graine.
    const prompt = (id: string, _l: number, seed: number) => `${id}-${seed % 3}`;
    const p = { ...pools, prompt };
    const d = dice();
    let s = createBattle(p, d, ['a-0']);
    const asked: string[] = [];
    for (let i = 0; i < 3; i++) {
      const q = s.question;
      if (q) asked.push(prompt(q.skillId, q.level, q.seed));
      s = answerBattle(s, p, true, d).state;
    }
    expect(new Set(asked).size).toBe(asked.length);
    expect(asked).not.toContain('a-0');
  });

  it('barèmes de niveau et d’étape', () => {
    expect([0, 1, 2, 3].map(mobLevel)).toEqual([1, 1, 2, 2]);
    expect([3, 2, 1].map(bossStage)).toEqual(['probleme', 'probleme', 'piege']);
  });
});
