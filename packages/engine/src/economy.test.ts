import { describe, expect, it } from 'vitest';
import { AVAILABLE_HEROES, ITEM_PRICES, ITEMS, MAX_ITEM_STOCK, RUBY_PRICE } from '@epicademie/shared';
import { trainingChest } from './loot.ts';
import { coinsForXp, PERFECT_BONUS, xpForAnswer } from './xp.ts';

/**
 * Simulation de l'économie sur une année scolaire de joueurs fictifs (aucune donnée réelle).
 * Elle vérifie les ordres de grandeur, pas des valeurs exactes : pas d'inflation, des
 * récompenses régulières, aucun blocage, pas de
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
  /** Séries jouées, et coffres reçus (séries entièrement justes). */
  series: number;
  chests: number;
  items: number;
}

const SCHOOL_DAYS = 150;
const SERIES = 4;

/**
 * Une année : séries de 4 questions (2e essai avec indice après une erreur), coffre seulement si
 * toute la série est juste, achats d'objets quand le stock baisse.
 */
function simulate(player: Player, seed: number): Outcome {
  const random = rng(seed);
  const o: Outcome = {
    coins: 0,
    rubies: 0,
    series: 0,
    chests: 0,
    items: 0,
  };
  for (let day = 1; day <= SCHOOL_DAYS; day++) {
    for (let s = 0; s < player.seriesPerDay; s++) {
      let correct = 0;
      let solved = 0;
      let streak = 0;
      let xp = 0;
      for (let q = 0; q < SERIES; q++) {
        const ok = random() < player.accuracy;
        streak = ok ? streak + 1 : 0;
        if (ok) correct++;
        // Après une erreur, l'indice aide : 2e essai un peu plus souvent juste.
        if (ok || random() < Math.min(0.95, player.accuracy + 0.15)) solved++;
        xp += xpForAnswer({ correct: ok, variant: false, durationMs: 8000, targetSeconds: 20, streak });
      }
      if (correct === SERIES) xp += PERFECT_BONUS;
      o.series++;
      o.coins += coinsForXp(xp);
      const chest = trainingChest({ total: SERIES, solved, firstTry: correct }, random);
      if (!chest) continue;
      o.chests++;
      o.coins += chest.coins;
      o.rubies += chest.rubies;
      o.items = Math.min(
        MAX_ITEM_STOCK * ITEMS.length,
        o.items + Object.values(chest.items).reduce((a, b) => a + b, 0),
      );
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
    const perSeries = median(regular.map((o) => o.coins / o.series));
    expect(perSeries).toBeGreaterThan(10);
    expect(perSeries).toBeLessThan(60);
  });

  it('les objets se gagnent en jouant ; la boutique reste un complément', () => {
    // Un objet coûte l'équivalent de quelques séries seulement.
    const perSeries = median(regular.map((o) => o.coins / o.series));
    expect(ITEM_PRICES.bouclier / perSeries).toBeLessThan(5);
  });

  it('les rubis restent rares : quelques-uns par mois, l’achat d’un rubis est un vrai objectif', () => {
    const rubiesPerMonth = median(regular.map((o) => (o.rubies / SCHOOL_DAYS) * 30));
    expect(rubiesPerMonth).toBeGreaterThan(1);
    expect(rubiesPerMonth).toBeLessThan(15);
    const seriesForOneRuby = RUBY_PRICE / median(regular.map((o) => o.coins / o.series));
    expect(seriesForOneRuby).toBeGreaterThan(30);
  });

  it('coffres : réservés aux séries entièrement justes, mais réguliers (plusieurs par semaine)', () => {
    const perWeek = median(regular.map((o) => (o.chests / SCHOOL_DAYS) * 5));
    expect(perWeek).toBeGreaterThan(3);
    // Pas un coffre à chaque série : il faut tout trouver (l'indice aide beaucoup).
    expect(median(regular.map((o) => o.chests / o.series))).toBeLessThan(0.95);
  });

  it('aucun blocage : un élève en difficulté gagne aussi des coffres et des pièces', () => {
    const struggling = population({ accuracy: 0.35, seriesPerDay: 1 });
    // Moins de coffres (il faut tout trouver) : les pièces viennent surtout des réponses.
    expect(median(struggling.map((o) => o.coins))).toBeGreaterThan(200);
    // Avec l'indice, il finit aussi des séries entièrement justes : des coffres chaque mois.
    expect(median(struggling.map((o) => o.chests))).toBeGreaterThan(20);
  });

  it('jouer plus rapporte plus, mais sans écart démesuré par série', () => {
    const intense = population({ accuracy: 0.9, seriesPerDay: 4 });
    const perSeriesIntense = median(intense.map((o) => o.coins / o.series));
    const perSeriesRegular = median(regular.map((o) => o.coins / o.series));
    expect(perSeriesIntense / perSeriesRegular).toBeLessThan(2);
  });

  it('pas de « payer pour gagner » : les héros ne s’achètent pas (ils se choisissent librement)', () => {
    expect((ITEMS as readonly string[]).some((i) => (AVAILABLE_HEROES as readonly string[]).includes(i))).toBe(false);
  });
});
