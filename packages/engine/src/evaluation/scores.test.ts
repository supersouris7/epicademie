import { describe, expect, it } from 'vitest';
import type { CompetenceState } from '@epicademie/shared';
import {
  compareBilans,
  comparable,
  computeScores,
  maitresTitle,
  progressCategory,
  roundDisplay,
  scoresByDomain,
  stateValue,
  type ScoredCompetence,
} from './scores.ts';

const c = (
  id: string,
  domain: string,
  essential: boolean,
  state: CompetenceState,
  scored = true,
  studied = false,
): ScoredCompetence => ({
  id,
  domain,
  essential,
  scored,
  state,
  studied,
});

describe('valeur des états', () => {
  it('maîtrisée 1, à consolider 0,75, en cours 0,5, en difficulté 0 ; les autres hors maîtrise', () => {
    expect(
      ['maitrisee', 'a-consolider', 'en-cours', 'en-difficulte'].map((s) => stateValue(s as CompetenceState)),
    ).toEqual([1, 0.75, 0.5, 0]);
    for (const s of ['non-etudiee', 'non-evaluee', 'evaluation-insuffisante'] as const)
      expect(stateValue(s)).toBeNull();
  });
});

describe('maîtrise et couverture', () => {
  it('exemple C : Origines partielle, M = 75 %, C = 87,5 %', () => {
    const program = [
      c('numeration', 'nombres', true, 'maitrisee'),
      c('calcul', 'nombres', true, 'maitrisee'),
      c('division', 'nombres', true, 'en-cours'),
      c('fractions', 'nombres', true, 'en-difficulte'),
      c('longueurs', 'grandeurs', true, 'maitrisee'),
      c('aires', 'grandeurs', true, 'a-consolider'),
      c('angles', 'geometrie', true, 'maitrisee'),
      c('proportionnalite', 'fonctions', true, 'non-evaluee'),
    ];
    const s = computeScores(program);
    expect(s.mastery).toBeCloseTo(75);
    expect(s.coverage).toBeCloseTo(87.5);
    expect(roundDisplay(s.mastery!)).toBe(75);
    expect(roundDisplay(s.coverage)).toBe(90);
    expect(s.counts).toEqual({ evaluated: 7, mastered: 4, inProgress: 2, struggling: 1 });
    expect(s.masteryDisplayable).toBe(true);
    expect(s.studied).toBeNull();
  });
  it('exemple D exact : 17 compétences dont 7 essentielles, 6 vues (9 points sur 24)', () => {
    const program: ScoredCompetence[] = [
      c('calcul', 'nombres', false, 'maitrisee', true, true),
      c('operations', 'nombres', true, 'maitrisee', true, true),
      c('relatifs', 'nombres', true, 'en-cours', true, true),
      c('fractions', 'nombres', true, 'a-consolider', true, true),
      c('reperage', 'geometrie', false, 'maitrisee', true, true),
      c('symetries', 'geometrie', false, 'en-difficulte', true, true),
      c('triangles', 'geometrie', true, 'non-etudiee', false),
      c('statistiques', 'donnees', true, 'non-etudiee', false),
      c('proportionnalite', 'fonctions', true, 'non-etudiee', false),
      c('litteral', 'nombres', true, 'non-etudiee', false),
      ...['puissances', 'espace', 'angles', 'parallelogrammes', 'probabilites', 'fonctions', 'algorithmique'].map(
        (id) => c(id, 'nombres', false, 'non-etudiee', false),
      ),
    ];
    expect(program).toHaveLength(17);
    const s = computeScores(program, true);
    expect(s.mastery).toBeCloseTo((6.5 / 9) * 100);
    expect(roundDisplay(s.mastery!)).toBe(70);
    expect(s.coverage).toBeCloseTo(37.5);
    expect(s.studied).toBeCloseTo(37.5);
    expect(roundDisplay(s.coverage)).toBe(40);
  });
  it('la note existe toujours dès une réponse notée, et n’est jamais un échec pour une non-étudiée', () => {
    const few = computeScores([c('a', 'nombres', true, 'maitrisee'), c('b', 'nombres', false, 'en-cours')]);
    expect(few.masteryDisplayable).toBe(true);
    const thin = computeScores([
      { ...c('a', 'nombres', true, 'evaluation-insuffisante'), rate: 0.5 },
      { ...c('b', 'nombres', false, 'evaluation-insuffisante'), rate: 1 },
    ]);
    expect(thin.mastery).toBeCloseTo(((2 * 0.5 + 1) / 3) * 100);
    expect(thin.masteryDisplayable).toBe(true);
    expect(thin.counts.evaluated).toBe(0);
    expect(thin.coverage).toBe(0);
    expect(computeScores([c('z', 'nombres', true, 'non-evaluee')]).masteryDisplayable).toBe(false);
    const withUnstudied = computeScores([
      c('a', 'nombres', true, 'maitrisee'),
      c('b', 'nombres', true, 'maitrisee'),
      c('z', 'nombres', true, 'non-etudiee', false),
    ]);
    expect(withUnstudied.mastery).toBe(100);
  });
  it('sans rien d’évalué : maîtrise nulle, couverture 0', () => {
    expect(computeScores([c('a', 'nombres', true, 'non-evaluee')])).toMatchObject({ mastery: null, coverage: 0 });
  });
  it('par domaine, dans l’ordre N, G, E, D, F, I', () => {
    const d = scoresByDomain([
      c('a', 'fonctions', true, 'maitrisee'),
      c('b', 'nombres', true, 'en-cours'),
      c('c', 'nombres', false, 'non-evaluee'),
      c('d', 'zzz', false, 'maitrisee'),
    ]);
    expect(d.map((x) => x.domain)).toEqual(['nombres', 'fonctions', 'zzz']);
    expect(d[0]).toMatchObject({ mastery: 50 });
    expect(d[0]?.coverage).toBeCloseTo((2 / 3) * 100);
  });
  it('l’arrondi d’affichage va au multiple de 5 le plus proche', () => {
    expect([72.4, 72.6, 87.5, 2.4, 100].map(roundDisplay)).toEqual([70, 75, 90, 0, 100]);
  });
  it('titre des Maîtres : complet seulement à ≥ 90 % de couverture et toutes les essentielles évaluées', () => {
    const full = Array.from({ length: 10 }, (_, i) => c(`e${i}`, 'nombres', true, 'maitrisee'));
    expect(maitresTitle(full).full).toBe(true);
    const partial = [...full.slice(0, 5), c('x', 'nombres', true, 'non-evaluee'), ...full.slice(6)];
    expect(maitresTitle(partial).full).toBe(false);
    const notStudied = [...full, c('n', 'nombres', true, 'non-etudiee', false)];
    expect(maitresTitle(notStudied)).toMatchObject({ full: true }); // 20/22 = 91 % : une non-étudiée ne bloque pas le titre
    expect(maitresTitle(notStudied).coverage).toBeCloseTo((20 / 22) * 100);
    const manyNotStudied = [
      ...full,
      c('n1', 'nombres', true, 'non-etudiee', false),
      c('n2', 'nombres', true, 'non-etudiee', false),
    ];
    expect(maitresTitle(manyNotStudied).full).toBe(false); // 20/24 = 83 % : « partiel »
  });
});

describe('comparabilité et progrès', () => {
  const meta = { subject: 'maths', referentialGrade: '5e', referentialVersion: 1 };
  it('comparables seulement à matière, classe de référentiel et version égales', () => {
    expect(comparable(meta, { ...meta })).toBe(true);
    expect(comparable(meta, { ...meta, referentialGrade: '6e' })).toBe(false);
    expect(comparable(meta, { ...meta, referentialVersion: 2 })).toBe(false);
    expect(comparable(meta, { ...meta, subject: 'anglais' })).toBe(false);
  });
  it.each([
    [null, 'maitrisee', 'newly-mastered'],
    ['en-cours', 'maitrisee', 'newly-mastered'],
    ['en-difficulte', 'en-cours', 'resolved'],
    ['en-difficulte', 'a-consolider', 'resolved'],
    ['en-difficulte', 'en-difficulte', 'persistent'],
    ['maitrisee', 'en-difficulte', 'regression'],
    ['a-consolider', 'en-difficulte', 'regression'],
    ['maitrisee', 'a-consolider', 'regression'],
    ['maitrisee', 'maitrisee', 'stable'],
    ['en-cours', 'en-cours', 'stable'],
    ['en-cours', 'a-consolider', 'other'],
  ] as const)('%s → %s : %s', (before, after, expected) => {
    expect(progressCategory(before, after)).toBe(expected);
  });
  it('exemple E : écart recalculé sur l’intersection (72 % → 92 %), pas sur les M globaux', () => {
    const e = (id: string, essential: boolean, state: CompetenceState) => ({ id, essential, state });
    const december = [
      e('calcul', false, 'maitrisee'),
      e('operations', true, 'maitrisee'),
      e('relatifs', true, 'en-cours'),
      e('fractions', true, 'a-consolider'),
      e('reperage', false, 'maitrisee'),
      e('symetries', false, 'en-difficulte'),
    ];
    const march = [
      e('calcul', false, 'a-consolider'),
      e('operations', true, 'maitrisee'),
      e('relatifs', true, 'maitrisee'),
      e('fractions', true, 'maitrisee'),
      e('reperage', false, 'maitrisee'),
      e('symetries', false, 'en-cours'),
      e('angles', false, 'maitrisee'),
      e('espace', false, 'en-difficulte'),
      e('triangles', true, 'a-consolider'),
      e('statistiques', true, 'en-cours'),
      e('probabilites', false, 'maitrisee'),
    ];
    const p = compareBilans(december, march);
    expect(p?.common).toBe(6);
    expect(p?.masteryBefore).toBeCloseTo(72.2, 1);
    expect(p?.masteryAfter).toBeCloseTo(91.7, 1);
    expect(p?.newlyMastered).toEqual(['relatifs', 'fractions', 'angles', 'probabilites']);
    expect(p?.resolved).toEqual(['symetries']);
    expect(p?.regressions).toEqual(['calcul']); // régression légère
    expect(p?.persistent).toEqual([]);
  });
  it('« pas encore comparable » sous 3 compétences communes ; seules les évaluées comptent', () => {
    const e = (id: string, state: CompetenceState) => ({ id, essential: true, state });
    expect(
      compareBilans([e('a', 'maitrisee'), e('b', 'maitrisee')], [e('a', 'maitrisee'), e('b', 'maitrisee')]),
    ).toBeNull();
    const before = [e('a', 'maitrisee'), e('b', 'maitrisee'), e('c', 'non-evaluee')];
    const after = [e('a', 'maitrisee'), e('b', 'maitrisee'), e('c', 'maitrisee')];
    expect(compareBilans(before, after)).toBeNull();
  });
  it('régression et difficulté persistante', () => {
    const e = (id: string, state: CompetenceState) => ({ id, essential: false, state });
    const p = compareBilans(
      [e('a', 'maitrisee'), e('b', 'en-difficulte'), e('c', 'maitrisee'), e('d', 'en-cours')],
      [e('a', 'en-difficulte'), e('b', 'en-difficulte'), e('c', 'a-consolider'), e('d', 'en-cours')],
    );
    expect(p?.regressions).toEqual(['a', 'c']);
    expect(p?.persistent).toEqual(['b']);
  });
});
