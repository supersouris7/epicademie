import { describe, expect, it } from 'vitest';
import { ECONOMY } from '../economy.ts';
import { coinsForXp } from '../xp.ts';
import { evaluationRewards, inRewardPeriod, type EarlierEvaluation } from './rewards.ts';

const done = (
  kind: EarlierEvaluation['kind'],
  daysAgo: number,
  sameSchoolYear = true,
  rewarded = true,
): EarlierEvaluation => ({
  kind,
  daysAgo,
  sameSchoolYear,
  rewarded,
});

describe('période récompensée', () => {
  it('Origines et Maîtres : une fois par année scolaire', () => {
    expect(inRewardPeriod('origines', [])).toBe(true);
    expect(inRewardPeriod('origines', [done('origines', 30)])).toBe(false);
    expect(inRewardPeriod('origines', [done('origines', 300, false)])).toBe(true);
    expect(inRewardPeriod('maitres', [done('origines', 5), done('progression', 5)])).toBe(true);
    expect(inRewardPeriod('maitres', [done('maitres', 5)])).toBe(false);
  });
  it('un bilan déjà hors période ne ferme pas la période', () => {
    expect(inRewardPeriod('origines', [done('origines', 5, true, false)])).toBe(true);
  });
  it('Progression : au plus tous les 14 jours', () => {
    expect(inRewardPeriod('progression', [done('progression', 13)])).toBe(false);
    expect(inRewardPeriod('progression', [done('progression', 14)])).toBe(true);
    expect(inRewardPeriod('progression', [done('origines', 1)])).toBe(true);
  });
});

describe('récompenses (exemple F)', () => {
  const base = { kind: 'origines', inPeriod: true, partial: false, daysSinceLast: null, newlyMastered: 0 } as const;
  it('Origines terminée : 40 XP et coffre rare ; 2 compétences maîtrisées : +30 XP, 70 XP, 7 pièces', () => {
    expect(evaluationRewards(base)).toMatchObject({ xp: 40, chest: 'rare' });
    const r = evaluationRewards({ ...base, newlyMastered: 2 });
    expect(r.xp).toBe(70);
    expect(coinsForXp(r.xp)).toBe(7);
  });
  it('fin partielle : coffre commun (pas de persévérance)', () => {
    expect(evaluationRewards({ ...base, partial: true }).chest).toBe('commun');
  });
  it('hors période : 20 XP, pas de coffre', () => {
    expect(evaluationRewards({ ...base, kind: 'progression', inPeriod: false })).toMatchObject({ xp: 20, chest: null });
  });
  it('régularité : Progression ≥ 21 jours après le bilan précédent', () => {
    const p = { ...base, kind: 'progression' } as const;
    expect(evaluationRewards({ ...p, daysSinceLast: 21 }).regularityXp).toBe(30);
    expect(evaluationRewards({ ...p, daysSinceLast: 20 }).regularityXp).toBe(0);
    expect(evaluationRewards({ ...base, daysSinceLast: 90 }).regularityXp).toBe(0);
  });
  it('progrès : 15 XP par compétence, 60 au plus', () => {
    expect(evaluationRewards({ ...base, newlyMastered: 9 }).progressXp).toBe(60);
  });
  it('aucune récompense ne dépend des erreurs ni de la vitesse : le total reste borné sur l’année', () => {
    const e = ECONOMY.evaluation;
    // Origines + Maîtres + une Progression tous les 14 jours (≈ 26) par matière, tous les progrès payés au plus.
    const year = 2 * (e.participationXp + e.masteredCapXp) + 26 * (e.participationXp + e.regularityXp);
    expect(year).toBeLessThan(2_500);
  });
});
