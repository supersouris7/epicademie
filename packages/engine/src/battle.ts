import {
  BATTLE_MOBS,
  BOSS_LIVES,
  HERO_HEARTS,
  ITEM_INFO,
  MAX_ITEMS_PER_BATTLE,
  type BattleOutcome,
  type BattleQuestion,
  type BattleStage,
  type BattleStatus,
  type ItemId,
} from '@questeo/shared';

/**
 * Combat de boss (docs/SPEC.md §6.2 bis) : 7 mobs (questions du chapitre, niveau 1 puis 2), puis le boss
 * à 3 vies : 2 problèmes en contexte puis 1 question piège. Le héros a 3 cœurs.
 * Fonctions pures : le serveur garde l'état et fait foi.
 */

/** Générateurs disponibles pour un chapitre. */
export interface BattlePools {
  readonly mobs: readonly string[];
  readonly problems: readonly string[];
  readonly traps: readonly string[];
  /** Énoncé d'une question (pour éviter les doublons) ; absent : pas de contrôle. */
  readonly prompt?: (skillId: string, level: 1 | 2 | 3, seed: number) => string;
}

export interface BattleState {
  readonly status: BattleStatus;
  readonly hearts: number;
  readonly maxHearts: number;
  readonly bossLives: number;
  readonly mobsDefeated: number;
  /** Nombre de questions déjà posées. */
  readonly turn: number;
  /** Ordre de passage des notions pour les mobs (mélangé une fois). */
  readonly order: readonly string[];
  readonly shield: boolean;
  readonly hintShown: boolean;
  readonly itemsUsed: number;
  /** Type d'objet choisi pour ce combat (au 1er objet) : un seul type par combat. */
  readonly itemType: ItemId | null;
  readonly question: BattleQuestion | null;
  readonly answered: number;
  readonly correct: number;
  /** Notions ratées, dans l'ordre (pour proposer l'entraînement après une défaite). */
  readonly misses: readonly string[];
  /** Énoncés déjà posés (dans ce combat et les précédents) : jamais deux fois le même. */
  readonly seen: readonly string[];
}

/** Énoncés retenus au plus (les plus récents). */
const SEEN_MAX = 300;

/** Graine dont l'énoncé n'a pas encore été vu (sinon la dernière essayée, si la notion en propose peu). */
function freshSeed(pools: BattlePools, skillId: string, level: 1 | 2 | 3, dice: BattleDice, seen: readonly string[]) {
  let seed = dice.seed();
  const { prompt } = pools;
  if (!prompt) return seed;
  for (let i = 0; i < 40 && seen.includes(prompt(skillId, level, seed)); i++) seed = dice.seed();
  return seed;
}

const remember = (pools: BattlePools, seen: readonly string[], q: BattleQuestion | null) =>
  q && pools.prompt ? [...seen, pools.prompt(q.skillId, q.level, q.seed)].slice(-SEEN_MAX) : seen;

/** Tirage : `random` ∈ [0, 1) ; `seed` donne la graine du générateur de question. */
export interface BattleDice {
  readonly random: () => number;
  readonly seed: () => number;
}

/** Niveau des mobs : les 3 premiers au niveau 1, les suivants au niveau 2. */
export const mobLevel = (index: number): 1 | 2 => (index < 3 ? 1 : 2);

/** Étape du boss selon ses vies restantes : 2 problèmes, puis le piège pour la dernière vie. */
export const bossStage = (lives: number): BattleStage => (lives <= 1 ? 'piege' : 'probleme');

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

function pick<T>(items: readonly T[], random: () => number, avoid?: T): T {
  const pool = items.length > 1 && avoid !== undefined ? items.filter((x) => x !== avoid) : items;
  const chosen = pool[Math.floor(random() * pool.length)];
  if (chosen === undefined) throw new Error('Aucun générateur pour ce combat');
  return chosen;
}

function nextQuestion(
  s: Omit<BattleState, 'question'>,
  pools: BattlePools,
  dice: BattleDice,
  previous?: BattleQuestion,
) {
  if (s.mobsDefeated < BATTLE_MOBS) {
    const skillId = s.order[s.mobsDefeated % s.order.length] ?? '';
    const level = mobLevel(s.mobsDefeated);
    return {
      skillId,
      level,
      seed: freshSeed(pools, skillId, level, dice, s.seen),
      stage: 'mob',
    } satisfies BattleQuestion;
  }
  const stage = bossStage(s.bossLives);
  const pool = stage === 'piege' ? pools.traps : pools.problems;
  // Après une erreur contre le boss : une autre question du même type (autre générateur si possible).
  const skillId = pick(pool, dice.random, previous?.stage === stage ? previous.skillId : undefined);
  return { skillId, level: 2, seed: freshSeed(pools, skillId, 2, dice, s.seen), stage } satisfies BattleQuestion;
}

/** `recent` : énoncés des combats précédents, à éviter aussi. */
export function createBattle(pools: BattlePools, dice: BattleDice, recent: readonly string[] = []): BattleState {
  if (pools.mobs.length === 0 || pools.problems.length === 0 || pools.traps.length === 0) {
    throw new Error('Chapitre sans combat de boss');
  }
  const base = {
    status: 'fighting' as const,
    hearts: HERO_HEARTS,
    maxHearts: HERO_HEARTS,
    bossLives: BOSS_LIVES,
    mobsDefeated: 0,
    turn: 0,
    order: shuffle(pools.mobs, dice.random),
    shield: false,
    hintShown: false,
    itemsUsed: 0,
    itemType: null,
    answered: 0,
    correct: 0,
    misses: [],
    seen: recent.slice(-SEEN_MAX),
  };
  const question = nextQuestion(base, pools, dice);
  return { ...base, seen: remember(pools, base.seen, question), question };
}

/**
 * Applique une réponse : bonne → tir (mob vaincu ou boss −1 vie) ; mauvaise → riposte (−1 cœur, ou
 * bouclier consommé). Un mob raté s'enfuit quand même (le combat garde ses 10 questions) ; contre le
 * boss, une erreur relance une question du même type.
 */
export function answerBattle(
  s: BattleState,
  pools: BattlePools,
  correct: boolean,
  dice: BattleDice,
): { state: BattleState; outcome: BattleOutcome } {
  if (s.status !== 'fighting' || !s.question) throw new Error('Combat terminé');
  const q = s.question;
  const onMob = q.stage === 'mob';
  let hearts = s.hearts;
  let shield = s.shield;
  let outcome: BattleOutcome = 'hit';
  if (!correct) {
    if (shield) {
      shield = false;
      outcome = 'blocked';
    } else {
      hearts -= 1;
      outcome = 'riposte';
    }
  }
  const mobsDefeated = onMob ? s.mobsDefeated + 1 : s.mobsDefeated;
  const bossLives = !onMob && correct ? s.bossLives - 1 : s.bossLives;
  const status: BattleStatus = hearts <= 0 ? 'lost' : bossLives <= 0 ? 'won' : 'fighting';
  const next = {
    ...s,
    status,
    hearts,
    shield,
    mobsDefeated,
    bossLives,
    turn: s.turn + 1,
    hintShown: false,
    answered: s.answered + 1,
    correct: s.correct + (correct ? 1 : 0),
    misses: correct ? s.misses : [...s.misses, q.skillId],
  };
  const question = status === 'fighting' ? nextQuestion(next, pools, dice, q) : null;
  return { state: { ...next, seen: remember(pools, next.seen, question), question }, outcome };
}

/** Raison du refus d'un objet, ou null s'il peut servir maintenant. */
export function itemRefusal(
  s: Pick<BattleState, 'status' | 'itemsUsed' | 'itemType' | 'hearts' | 'maxHearts' | 'shield' | 'hintShown'>,
  item: ItemId,
): string | null {
  if (s.status !== 'fighting') return 'Le combat est terminé';
  if (s.itemType && s.itemType !== item)
    return `Un seul type d’objet par combat : ${ITEM_INFO[s.itemType].name.toLowerCase()}`;
  if (s.itemsUsed >= MAX_ITEMS_PER_BATTLE) return `${MAX_ITEMS_PER_BATTLE} objets au plus par combat`;
  if (item === 'soin' && s.hearts >= s.maxHearts) return 'Tes cœurs sont déjà pleins';
  if (item === 'bouclier' && s.shield) return 'Ton bouclier est déjà levé';
  if (item === 'indice' && s.hintShown) return 'L’indice est déjà affiché';
  return null;
}

export function applyItem(s: BattleState, item: ItemId): BattleState {
  const refusal = itemRefusal(s, item);
  if (refusal) throw new Error(refusal);
  const used = { ...s, itemsUsed: s.itemsUsed + 1, itemType: item };
  if (item === 'soin') return { ...used, hearts: s.hearts + 1 };
  if (item === 'bouclier') return { ...used, shield: true };
  return { ...used, hintShown: true };
}

/** Notion la plus souvent ratée (la plus récente en cas d'égalité), parmi les notions d'entraînement. */
export function weakestSkill(s: BattleState, trainable: readonly string[]): string | null {
  const counts = new Map<string, number>();
  for (const id of s.misses) if (trainable.includes(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
  let best: string | null = null;
  let max = 0;
  for (const id of [...s.misses].reverse()) {
    const n = counts.get(id) ?? 0;
    if (n > max) {
      max = n;
      best = id;
    }
  }
  return best;
}

/** Barème du combat (docs/SPEC.md §7). */
export const BATTLE_XP_PER_HIT = 10;
export const BATTLE_WIN_XP = 50;
export const BATTLE_FIRST_WIN_COINS = 50;

export function battleXp(s: BattleState): number {
  return s.correct * BATTLE_XP_PER_HIT + (s.status === 'won' ? BATTLE_WIN_XP : 0);
}
