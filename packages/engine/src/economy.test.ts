import { describe, expect, it } from 'vitest';
import { AVAILABLE_HEROES, ITEM_PRICES, ITEMS, MAX_ITEM_STOCK, RUBY_PRICE, type HeroId } from '@questeo/shared';
import { ECONOMY } from './economy.ts';
import { rollChest } from './loot.ts';
import { coinsForXp, PERFECT_BONUS, xpForAnswer } from './xp.ts';

/**
 * Simulation de l'économie sur une année scolaire de joueurs fictifs (aucune donnée réelle).
 * Elle vérifie les ordres de grandeur, pas des valeurs exactes : pas d'inflation, des
 * récompenses régulières, une collection d'Acad-Héros atteignable, aucun blocage, pas de
 * « payer pour gagner ».
 */

/** Générateur déterministe (mulberry32) : la simulation donne toujours le même résultat. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

interface Player {
  /** Chance de répondre juste à une question. */
  readonly accuracy: number;
  /** Séries d'entraînement par jour de jeu. */
  readonly seriesPerDay: number;
}

interface Outcome {
  coins: number;
  rubies: number;
  chests: number;
  heroes: Set<HeroId>;
  /** Jour où la collection d'Acad-Héros disponibles est complète (null : jamais). */
  fullCollectionDay: number | null;
  items: number;
}

const SCHOOL_DAYS = 150;
const SERIES = 4;

/** Une année : séries de 4 questions, coffre garanti, achats d'objets quand le stock baisse. */
function simulate(player: Player, seed: number): Outcome {
  const random = rng(seed);
  const o: Outcome = { coins: 0, rubies: 0, chests: 0, heroes: new Set(['alex']), fullCollectionDay: null, items: 0 };
  for (let day = 1; day <= SCHOOL_DAYS; day++) {
    for (let s = 0; s < player.seriesPerDay; s++) {
      let correct = 0;
      let streak = 0;
      let xp = 0;
      for (let q = 0; q < SERIES; q++) {
        const ok = random() < player.accuracy;
        streak = ok ? streak + 1 : 0;
        if (ok) correct++;
        xp += xpForAnswer({ correct: ok, variant: false, durationMs: 8000, targetSeconds: 20, streak });
      }
      if (correct === SERIES) xp += PERFECT_BONUS;
      const chest = rollChest(correct, SERIES, random, o.heroes);
      o.chests++;
      o.coins += coinsForXp(xp) + chest.coins;
      o.rubies += chest.rubies;
      o.items = Math.min(
        MAX_ITEM_STOCK * ITEMS.length,
        o.items + Object.values(chest.items).reduce((a, b) => a + b, 0),
      );
      if (chest.hero && !chest.hero.duplicate) o.heroes.add(chest.hero.id);
      if (o.fullCollectionDay === null && o.heroes.size === AVAILABLE_HEROES.length) o.fullCollectionDay = day;
    }
    // Un combat tous les 3 jours consomme un objet ; on en rachète s'il en manque.
    if (day % 3 === 0) {
      if (o.items > 0) o.items--;
      else if (o.coins >= ITEM_PRICES.soin) o.coins -= ITEM_PRICES.soin;
    }
  }
  return o;
}

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;
const population = (player: Player, n = 300) => Array.from({ length: n }, (_, i) => simulate(player, i + 1));

describe('économie simulée sur une année scolaire', () => {
  const regular = population({ accuracy: 0.75, seriesPerDay: 2 });

  it('des pièces régulières, sans inflation : entre 10 et 60 par série en moyenne', () => {
    const perSeries = median(regular.map((o) => o.coins / o.chests));
    expect(perSeries).toBeGreaterThan(10);
    expect(perSeries).toBeLessThan(60);
  });

  it('les objets se gagnent en jouant ; la boutique reste un complément', () => {
    // Un objet coûte l'équivalent de quelques séries seulement.
    const perSeries = median(regular.map((o) => o.coins / o.chests));
    expect(ITEM_PRICES.bouclier / perSeries).toBeLessThan(5);
  });

  it('les rubis restent rares : quelques-uns par mois, l’achat d’un rubis est un vrai objectif', () => {
    const rubiesPerMonth = median(regular.map((o) => (o.rubies / SCHOOL_DAYS) * 30));
    expect(rubiesPerMonth).toBeGreaterThan(1);
    expect(rubiesPerMonth).toBeLessThan(15);
    const seriesForOneRuby = RUBY_PRICE / median(regular.map((o) => o.coins / o.chests));
    expect(seriesForOneRuby).toBeGreaterThan(30);
  });

  it('collection d’Acad-Héros complète en quelques semaines pour un joueur régulier', () => {
    const days = regular.map((o) => o.fullCollectionDay ?? Infinity);
    expect(median(days)).toBeLessThan(60);
    expect(median(days)).toBeGreaterThan(7);
    // Presque tous la complètent dans l'année.
    expect(days.filter((d) => d <= SCHOOL_DAYS).length / days.length).toBeGreaterThan(0.95);
  });

  it('aucun blocage : un élève en difficulté gagne aussi coffres, pièces et héros', () => {
    const struggling = population({ accuracy: 0.35, seriesPerDay: 1 });
    expect(median(struggling.map((o) => o.coins))).toBeGreaterThan(1000);
    expect(median(struggling.map((o) => o.heroes.size))).toBeGreaterThanOrEqual(2);
  });

  it('jouer plus rapporte plus, mais sans écart démesuré par série', () => {
    const intense = population({ accuracy: 0.9, seriesPerDay: 4 });
    const perSeriesIntense = median(intense.map((o) => o.coins / o.chests));
    const perSeriesRegular = median(regular.map((o) => o.coins / o.chests));
    expect(perSeriesIntense / perSeriesRegular).toBeLessThan(2);
  });

  it('pas de « payer pour gagner » : les héros ne s’achètent pas, les doublons deviennent des pièces', () => {
    expect((ITEMS as readonly string[]).some((i) => (AVAILABLE_HEROES as readonly string[]).includes(i))).toBe(false);
    expect(ECONOMY.chest.duplicateHeroCoins).toBeGreaterThan(0);
  });
});
