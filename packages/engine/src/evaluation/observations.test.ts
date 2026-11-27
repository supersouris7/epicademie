import { describe, expect, it } from 'vitest';
import { daysBetween } from '../srs.ts';
import type { Level } from '@epicademie/shared';
import {
  competenceState,
  competenceStats,
  freshness,
  isSufficient,
  observationWeight,
  type Observation,
  type ObservationSource,
} from './observations.ts';

const TODAY = '2026-12-10';
const ago = (days: number) => new Date(Date.parse(`${TODAY}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
const obs = (source: ObservationSource, correct: boolean, level: Level = 1, age = 0, skillId = 's'): Observation => ({
  skillId,
  source,
  correct,
  level,
  day: ago(age),
});
const state = (
  list: Observation[],
  extra: { previouslyMastered?: boolean; notStudied?: boolean; disabled?: boolean } = {},
) => competenceState({ stats: competenceStats(list, TODAY), ...extra });

describe('poids et fraîcheur des observations', () => {
  it('compte les jours entre deux dates', () => {
    expect(daysBetween('2026-12-01', '2026-12-10')).toBe(9);
  });
  it.each([
    ['evaluation', 0, 1],
    ['evaluation', 90, 1],
    ['evaluation', 91, 0.5],
    ['evaluation', 180, 0.5],
    ['evaluation', 181, 0],
    ['solo', 30, 1],
    ['solo', 31, 0.5],
    ['solo', 90, 0.5],
    ['solo', 91, 0],
  ] as const)('fraîcheur %s à %i jours = %f', (source, age, expected) => {
    expect(freshness(source, age)).toBe(expected);
  });
  it('poids = source × fraîcheur ; second essai / indice / collectif écartés (0)', () => {
    expect(observationWeight(obs('evaluation', true), TODAY)).toBe(1);
    expect(observationWeight(obs('solo', true), TODAY)).toBe(0.5);
    expect(observationWeight(obs('versus', true), TODAY)).toBe(0.25);
    expect(observationWeight(obs('solo', true, 1, 31), TODAY)).toBe(0.25);
    expect(observationWeight(obs('none', true), TODAY)).toBe(0);
    expect(observationWeight(obs('evaluation', true, 1, 91), TODAY)).toBe(0.5);
  });
});

describe('grandeurs et règle « observations suffisantes »', () => {
  it('ne lit que les 20 observations les plus récentes', () => {
    const list = [
      ...Array.from({ length: 5 }, () => obs('evaluation', false, 1, 3)),
      ...Array.from({ length: 20 }, () => obs('evaluation', true)),
    ];
    const s = competenceStats(list, TODAY);
    expect(s.count).toBe(20);
    expect(s.rate).toBe(1);
  });
  it('sans observation : P = 0, R nul', () => {
    const s = competenceStats([], TODAY);
    expect(s).toMatchObject({ weight: 0, rate: null, count: 0, lastAgeDays: null });
  });
  it('(a) une observation d’Arène récente avec P ≥ 2 et n ≥ 2', () => {
    expect(isSufficient(competenceStats([obs('evaluation', true), obs('evaluation', true)], TODAY))).toBe(true);
    expect(isSufficient(competenceStats([obs('evaluation', true)], TODAY))).toBe(false);
  });
  it('(a) une Arène de plus de 90 jours ne suffit pas seule', () => {
    expect(
      isSufficient(
        competenceStats(
          [obs('evaluation', true, 1, 100), obs('evaluation', true, 1, 100), obs('evaluation', true, 1, 100)],
          TODAY,
        ),
      ),
    ).toBe(false);
  });
  it('(b) sans Arène : Pe ≥ 3 sur au moins 2 jours', () => {
    const six = (days: number[]) => days.map((d) => obs('solo', true, 1, d));
    expect(isSufficient(competenceStats(six([1, 1, 1, 2, 2, 2]), TODAY))).toBe(true);
    expect(isSufficient(competenceStats(six([1, 1, 1, 1, 1, 1]), TODAY))).toBe(false); // un seul jour
    expect(isSufficient(competenceStats(six([1, 2, 2, 2]), TODAY))).toBe(false); // Pe = 2
  });
});

describe('les 7 états d’une compétence', () => {
  it('1 · non étudiée prime sur tout, sans être un échec', () => {
    expect(state([obs('evaluation', false), obs('evaluation', false)], { notStudied: true })).toBe('non-etudiee');
  });
  it('2 · non évaluée : aucune observation, observations de poids nul ou notions désactivées', () => {
    expect(state([])).toBe('non-evaluee');
    expect(state([obs('none', true), obs('solo', true, 1, 200)])).toBe('non-evaluee');
    expect(state([obs('evaluation', true), obs('evaluation', true)], { disabled: true })).toBe('non-evaluee');
  });
  it('3 · évaluation insuffisante', () => {
    expect(state([obs('evaluation', true, 2)])).toBe('evaluation-insuffisante');
    expect(state([obs('solo', true), obs('solo', true)])).toBe('evaluation-insuffisante');
  });
  it('4 · en difficulté si R < 0,5', () => {
    expect(state([obs('evaluation', false), obs('evaluation', false), obs('evaluation', true)])).toBe('en-difficulte');
  });
  it('5 · maîtrisée : R ≥ 0,8, 2 justes, preuve de niveau 2, dernière d’Arène juste, récente', () => {
    expect(state([obs('evaluation', true, 1), obs('evaluation', true, 2)])).toBe('maitrisee');
  });
  it('une seule bonne réponse ne prouve rien (exemple B)', () => {
    expect(state([obs('evaluation', true, 2)])).toBe('evaluation-insuffisante');
    expect(state([obs('evaluation', true, 2), obs('evaluation', true, 3)])).toBe('maitrisee');
  });
  it('6 · à consolider : R ≥ 0,8 mais pas de preuve de niveau 2 (exemple B, sans budget)', () => {
    expect(state([obs('evaluation', true, 1), obs('evaluation', true, 1)])).toBe('a-consolider');
  });
  it('6 · à consolider : dernière réponse d’Arène fausse', () => {
    const list = [...Array.from({ length: 5 }, () => obs('evaluation', true, 2, 2)), obs('evaluation', false, 2)];
    expect(competenceStats(list, TODAY).rate).toBeGreaterThanOrEqual(0.8);
    expect(state(list)).toBe('a-consolider');
  });
  it('6 · à consolider : preuve trop ancienne (> 120 jours)', () => {
    const list = [
      obs('evaluation', true, 2, 130),
      obs('evaluation', true, 2, 130),
      obs('solo', true, 1, 1),
      obs('solo', true, 1, 1),
      obs('solo', true, 1, 1),
      obs('solo', true, 1, 2),
    ];
    expect(competenceStats(list, TODAY).lastAgeDays).toBe(1);
    // dernière observation récente : maîtrisée ; sans elle la preuve de 130 jours ne suffit plus
    expect(state(list.slice(0, 2))).toBe('evaluation-insuffisante');
  });
  it('6 · à consolider : acquis qui s’effrite (R entre 0,5 et 0,8 alors qu’elle était maîtrisée)', () => {
    const list = [obs('evaluation', true, 2), obs('evaluation', false, 1)];
    expect(state(list)).toBe('en-cours');
    expect(state(list, { previouslyMastered: true })).toBe('a-consolider');
    expect(state([obs('evaluation', false), obs('evaluation', false)], { previouslyMastered: true })).toBe(
      'en-difficulte',
    );
  });
  it('7 · en cours d’acquisition : 0,5 ≤ R < 0,8 sans maîtrise antérieure', () => {
    expect(state([obs('evaluation', true, 2), obs('evaluation', false, 2)])).toBe('en-cours');
  });
  it('exemple A : autres modes + une réponse d’Arène', () => {
    const modes = [
      obs('solo', true, 2, 5),
      obs('solo', true, 2, 5),
      obs('solo', true, 1, 5),
      obs('solo', true, 1, 6),
      obs('solo', true, 1, 6),
      obs('solo', false, 1, 6),
    ];
    const s = competenceStats(modes, TODAY);
    expect(s.otherWeight).toBe(3);
    expect(s.rate).toBeCloseTo(2.5 / 3);
    expect(isSufficient(s)).toBe(true);
    expect(state([...modes, obs('evaluation', true, 2)])).toBe('maitrisee');
    expect(competenceStats([...modes, obs('evaluation', true, 2)], TODAY).rate).toBeCloseTo(0.875);
    expect(state([...modes, obs('evaluation', false, 2)])).toBe('en-cours');
    expect(competenceStats([...modes, obs('evaluation', false, 2)], TODAY).rate).toBeCloseTo(0.625);
  });
  it('les autres modes seuls et peu nombreux ne suffisent pas', () => {
    expect(state([obs('solo', true), obs('solo', true), obs('solo', true, 2, 1)])).toBe('evaluation-insuffisante');
  });
});
