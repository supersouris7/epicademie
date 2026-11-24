import { describe, expect, it } from 'vitest';
import type { CompetenceState } from '@epicademie/shared';
import { EVALUATION } from './constants.ts';
import type { Observation } from './observations.ts';
import {
  EVALUATION_STATE_VERSION,
  assignSeed,
  baseNeed,
  canOfferAdvanced,
  chooseAdvanced,
  createEvaluation,
  globalLevel,
  isExpired,
  nextEvaluationQuestion,
  pickSeed,
  recordEvaluationAnswer,
  stepLevel,
  summarize,
  type EvaluationQuestion,
  type EvaluationState,
  type PlanCompetence,
  type PlanInput,
} from './run.ts';

const TODAY = '2026-12-10';
const NOW = Date.parse('2026-12-10T10:00:00Z');
const MIN = 60_000;

const comp = (id: string, domain: string, essential: boolean, extra: Partial<PlanCompetence> = {}): PlanCompetence => ({
  id,
  domain,
  essential,
  skills: [`${id}-a`, `${id}-b`, `${id}-c`],
  scored: true,
  observations: [],
  ...extra,
});
const plan = (program: PlanCompetence[], extra: Partial<PlanInput> = {}): PlanInput => ({
  kind: 'origines',
  today: TODAY,
  nowMs: NOW,
  program,
  prerequisitePool: [],
  advancedPool: [],
  ...extra,
});
const eight = (): PlanCompetence[] => [
  comp('n1', 'nombres', true),
  comp('n2', 'nombres', true),
  comp('n3', 'nombres', true),
  comp('g1', 'grandeurs', true),
  comp('g2', 'grandeurs', true),
  comp('e1', 'geometrie', true),
  comp('e2', 'geometrie', true),
  comp('f1', 'fonctions', true),
];

interface Played {
  state: EvaluationState;
  asked: EvaluationQuestion[];
  canExploreAdvanced: boolean;
}
/** Fait jouer l'épreuve : `policy` décide si chaque réponse est juste. */
function play(
  start: EvaluationState,
  policy: (q: EvaluationQuestion) => boolean,
  opts: { now?: number; max?: number } = {},
): Played {
  let s = start;
  const asked: EvaluationQuestion[] = [];
  for (let guard = 0; guard < 200; guard++) {
    const next = nextEvaluationQuestion(s, opts.now ?? NOW);
    if (next.done) return { state: next.state, asked, canExploreAdvanced: next.canExploreAdvanced };
    if (asked.length >= (opts.max ?? Infinity)) return { state: s, asked, canExploreAdvanced: false };
    const q = assignSeed(next.state, 1000 + asked.length).pending!;
    asked.push(q);
    const r = recordEvaluationAnswer(assignSeed(next.state, 1000 + asked.length - 1), {
      skillId: q.skillId,
      level: q.level,
      seed: 1000 + asked.length - 1,
      correct: policy(q),
    });
    if (!r.ok) throw new Error(r.reason);
    s = r.state;
  }
  throw new Error('boucle infinie');
}
const ok = (level: 1 | 2 | 3, correct = true) => ({ skillId: 'n1-a', level, seed: 1, correct, dontKnow: false });
/** Injecte des réponses déjà données à une compétence (simule un début d'épreuve). */
const withAnswers = (
  s: EvaluationState,
  id: string,
  answers: ReturnType<typeof ok>[],
  asked: number,
): EvaluationState => ({
  ...s,
  asked,
  competences: s.competences.map((c) => (c.id === id ? { ...c, answers } : c)),
});
const scoreQs = (p: Played) => p.asked.filter((q) => q.role === 'score');
const obs = (
  skillId: string,
  correct: boolean,
  source: Observation['source'],
  day = '2026-12-09',
  level: 1 | 2 | 3 = 1,
): Observation => ({ skillId, source, correct, level, day });

describe('préparation et budget (§5.1)', () => {
  it('8 essentielles jamais évaluées : 2 questions chacune = 16', () => {
    const s = createEvaluation(plan(eight()));
    expect(s.planned).toBe(16);
    expect(s.competences.map((c) => c.need)).toEqual([2, 2, 2, 2, 2, 2, 2, 2]);
    expect(s.v).toBe(EVALUATION_STATE_VERSION);
  });
  it('compétence déjà suffisamment observée : 1 question de vérification', () => {
    const watched = comp('n1', 'nombres', true, {
      observations: [
        obs('n1-a', true, 'solo', '2026-12-08'),
        obs('n1-a', true, 'solo', '2026-12-08'),
        obs('n1-b', true, 'solo', '2026-12-09'),
        obs('n1-b', true, 'solo', '2026-12-09'),
        obs('n1-c', true, 'solo', '2026-12-09'),
        obs('n1-c', true, 'solo', '2026-12-09'),
      ],
    });
    expect(baseNeed(watched, TODAY)).toBe(1);
    expect(baseNeed(comp('n2', 'nombres', true), TODAY)).toBe(2);
    expect(baseNeed(comp('n3', 'nombres', true, { skills: [] }), TODAY)).toBe(0);
  });
  it('au-delà du budget : essentielles, jamais évaluées, preuve la plus ancienne, ordre du programme', () => {
    const program = [
      comp('o1', 'nombres', false), // non essentielle : sort en dernier
      comp('e1', 'nombres', true, { observations: [obs('e1-a', true, 'evaluation', '2026-09-01')] }), // évaluée, preuve ancienne
      comp('e2', 'nombres', true), // jamais évaluée : avant e1
      comp('e3', 'nombres', true, { observations: [obs('e3-a', true, 'evaluation', '2026-12-01')] }), // preuve récente
      ...Array.from({ length: 6 }, (_, i) => comp(`x${i}`, 'grandeurs', true)),
    ];
    const s = createEvaluation(plan(program));
    const need = Object.fromEntries(s.competences.map((c) => [c.id, c.need]));
    expect(s.planned).toBeLessThanOrEqual(EVALUATION.questions.target);
    expect(need.o1).toBe(0);
    expect(need.e2).toBe(2); // jamais évaluée
    expect(need.e1).toBe(2);
    expect(need.e3).toBe(0); // dernière dans l'ordre : preuve la plus récente, hors budget
    expect(
      Object.entries(need)
        .filter(([id]) => id.startsWith('x'))
        .every(([, n]) => n === 2),
    ).toBe(true);
  });
  it('petit programme : approfondi jusqu’au minimum de 12 sans dépasser 3 par compétence', () => {
    const s = createEvaluation(plan([comp('a', 'nombres', true), comp('b', 'nombres', true)]));
    expect(s.competences.map((c) => c.need)).toEqual([3, 3]);
    const four = createEvaluation(plan(Array.from({ length: 4 }, (_, i) => comp(`k${i}`, 'nombres', true))));
    expect(four.planned).toBe(12);
  });
  it('seules les compétences du périmètre noté reçoivent des questions', () => {
    const s = createEvaluation(plan([comp('a', 'nombres', true), comp('b', 'nombres', true, { scored: false })]));
    expect(s.competences.find((c) => c.id === 'b')?.need).toBe(0);
    const played = play(s, () => true);
    expect(played.asked.every((q) => q.competenceId === 'a')).toBe(true);
  });
});

describe('choix des questions (§5.2)', () => {
  it('tourniquet des domaines, égalité dans l’ordre N, G, E, D, F, I', () => {
    const p = play(createEvaluation(plan(eight())), () => true, { max: 4 });
    expect(p.asked.map((q) => q.domain)).toEqual(['nombres', 'grandeurs', 'geometrie', 'fonctions']);
  });
  it('jamais la même compétence deux fois de suite s’il en reste une autre', () => {
    const p = play(createEvaluation(plan(eight())), (q) => q.index % 3 !== 0);
    scoreQs(p).forEach((q, i, all) => {
      if (i > 0) expect(q.competenceId).not.toBe(all[i - 1]?.competenceId);
    });
  });
  it('à défaut d’autre compétence, la même peut revenir', () => {
    const p = play(createEvaluation(plan([comp('solo', 'nombres', true)])), () => true);
    expect(p.asked.length).toBeGreaterThan(1);
  });
  it('priorité : essentielle d’abord, puis plus de besoin restant', () => {
    const s = createEvaluation(plan([comp('o', 'nombres', false), comp('e', 'nombres', true)]));
    expect(nextEvaluationQuestion(s, NOW)).toMatchObject({ question: { competenceId: 'e' } });
  });
  it('anti-répétition : une notion n’est reposée qu’une fois les autres posées', () => {
    const p = play(createEvaluation(plan([comp('solo', 'nombres', true)])), () => true);
    const skills = p.asked.map((q) => q.skillId);
    expect(new Set(skills.slice(0, 3)).size).toBe(Math.min(3, skills.length));
  });
  it('privilégie la notion la moins observée récemment', () => {
    const c = comp('x', 'nombres', true, {
      observations: [obs('x-a', true, 'solo'), obs('x-a', true, 'solo'), obs('x-b', true, 'solo')],
    });
    const n = nextEvaluationQuestion(createEvaluation(plan([c])), NOW);
    expect(n.done || n.question.skillId).toBe('x-c');
  });
  it('les notions désactivées ne sont jamais posées ; tout désactivé : jamais interrogée', () => {
    const s = createEvaluation(
      plan([comp('off', 'nombres', true, { skills: [] }), comp('on', 'nombres', true, { skills: ['on-a'] })]),
    );
    const p = play(s, () => true);
    expect(p.asked.every((q) => q.skillId === 'on-a')).toBe(true);
    expect(summarize(p.state).competences.find((c) => c.id === 'off')?.state).toBe('non-evaluee');
  });
  it('pickSeed : retire jusqu’à 5 fois une graine déjà vue, puis garde la dernière', () => {
    let n = 0;
    const draws: number[] = [];
    const draw = () => (draws.push(n), n++);
    expect(pickSeed(draw, (x) => x < 3)).toBe(3);
    expect(draws).toEqual([0, 1, 2, 3]);
    n = 0;
    draws.length = 0;
    expect(pickSeed(draw, () => true)).toBe(4);
    expect(draws).toHaveLength(EVALUATION.seedAttempts);
  });
});

describe('difficulté progressive (§5.3)', () => {
  it('échauffement : les 2 premières questions au niveau 1', () => {
    const p = play(createEvaluation(plan(eight())), () => true, { max: 3 });
    expect(p.asked.slice(0, 2).map((q) => q.level)).toEqual([1, 1]);
    expect(p.asked[2]?.level).toBe(2);
  });
  it('escalier d’une compétence : juste → +1 (max 3), faux → −1 (min 1)', () => {
    expect([stepLevel(1, true), stepLevel(3, true), stepLevel(2, false), stepLevel(1, false)]).toEqual([2, 3, 1, 1]);
  });
  it('niveau global : 2 puis, dès 4 réponses, 1 sous 40 % et 3 au-dessus de 80 %', () => {
    const ans = (...v: boolean[]) => v.map((correct) => ({ correct }));
    expect(globalLevel(ans(false, false, false))).toBe(2);
    expect(globalLevel(ans(false, false, false, true))).toBe(1);
    expect(globalLevel(ans(true, true, true, true, false))).toBe(2);
    expect(globalLevel(ans(true, true, true, true, true))).toBe(3);
  });
  it('niveau de départ : 1 si « en difficulté », 3 si « maîtrisée » dans le dernier bilan', () => {
    const start = (priorState: CompetenceState) => {
      const s = createEvaluation(plan([comp('a', 'nombres', true, { priorState })]));
      const p = play({ ...s, asked: EVALUATION.warmupQuestions }, () => true, { max: 1 });
      return p.asked[0]?.level;
    };
    expect(start('en-difficulte')).toBe(1);
    expect(start('maitrisee')).toBe(3);
    expect(start('en-cours')).toBe(2);
  });
  it('conclusion : deux réponses concordantes = 2 questions ; contradictoires = 3', () => {
    const forN1 = (pattern: boolean[]) => {
      const seen = { n: 0 };
      const p = play(createEvaluation(plan(eight())), (q) =>
        q.competenceId === 'n1' ? (pattern[seen.n++] ?? true) : true,
      );
      return p.asked.filter((q) => q.competenceId === 'n1').length;
    };
    expect(forN1([false, false, true])).toBe(2);
    expect(forN1([true, false, true])).toBe(3);
    expect(forN1([false, true, true])).toBe(3);
  });
  it('jamais plus de 3 questions notées par compétence (hors preuve de niveau 2)', () => {
    const p = play(createEvaluation(plan(eight())), (q) => q.index % 2 === 0);
    for (const c of p.state.competences) expect(c.answers.length).toBeLessThanOrEqual(EVALUATION.maxPerCompetence + 1);
  });
  it('exemple B : R ≥ 0,8 sans preuve de niveau 2 → une question de niveau 2 en plus', () => {
    const s = withAnswers(createEvaluation(plan(eight())), 'n1', [ok(1), ok(1)], 2);
    const p = play(s, () => true);
    const extra = p.asked.filter((q) => q.competenceId === 'n1');
    expect(extra.map((q) => q.level)).toEqual([2]); // une seule, jamais deux
    expect(summarize(p.state).competences.find((c) => c.id === 'n1')?.state).toBe('maitrisee');
  });
  it('sans budget pour la question de preuve : à consolider', () => {
    const s = withAnswers(createEvaluation(plan(eight())), 'n1', [ok(1), ok(1)], EVALUATION.questions.target);
    expect(summarize(s).competences.find((c) => c.id === 'n1')?.state).toBe('a-consolider');
    const p = play(s, () => true);
    expect(p.asked.filter((q) => q.competenceId === 'n1')).toHaveLength(0);
  });
});

describe('protection contre le découragement', () => {
  it('après 4 erreurs d’affilée : niveau 1 forcé et changement de domaine', () => {
    const p = play(createEvaluation(plan(eight())), () => false, { max: 5 });
    expect(p.asked.slice(4).map((q) => q.level)).toEqual([1]);
    expect(p.asked[4]?.domain).not.toBe(p.asked[3]?.domain);
  });
  it('après 7 erreurs d’affilée : fin de la partie notée (partielle) et passage à l’exploration', () => {
    const pool = [comp('n0-pre', 'nombres', false, { scored: false })];
    const program = [comp('n1', 'nombres', true, { primaryPrerequisite: 'n0-pre' }), ...eight().slice(1)];
    const p = play(createEvaluation(plan(program, { prerequisitePool: pool })), () => false);
    expect(scoreQs(p)).toHaveLength(EVALUATION.errorsToStop);
    expect(p.state.endReason).toBe('discouraged');
    expect(summarize(p.state).partial).toBe(true);
    expect(p.asked.filter((q) => q.role === 'prerequis').length).toBeGreaterThan(0);
  });
  it('une bonne réponse remet le compte à zéro ; « Je ne sais pas » compte comme une erreur', () => {
    let s = createEvaluation(plan(eight()));
    const n = nextEvaluationQuestion(s, NOW);
    if (n.done) throw new Error('attendu');
    s = assignSeed(n.state, 5);
    const q = s.pending!;
    const r = recordEvaluationAnswer(s, { skillId: q.skillId, level: q.level, seed: 5, correct: true, dontKnow: true });
    expect(r.ok && r.state.errorsInRow).toBe(1);
    expect(r.ok && r.state.competences.flatMap((c) => c.answers)[0]).toMatchObject({ correct: false, dontKnow: true });
  });
});

describe('explorations hors score (§5.4)', () => {
  const pre = (id: string) => comp(id, 'nombres', false, { scored: false });
  it('prérequis : une essentielle en difficulté déclenche son prérequis principal, niveaux 1 puis 2', () => {
    const program = [comp('e1', 'nombres', true, { primaryPrerequisite: 'p1' }), comp('e2', 'grandeurs', true)];
    const p = play(
      createEvaluation(plan(program, { prerequisitePool: [pre('p1')] })),
      (q) => q.role !== 'score' || q.competenceId !== 'e1',
    );
    const explored = p.asked.filter((q) => q.role === 'prerequis');
    expect(explored.map((q) => [q.competenceId, q.level])).toEqual([
      ['p1', 1],
      ['p1', 2],
    ]);
    expect(p.asked.at(-1)?.role).toBe('prerequis'); // après la partie notée
  });
  it('pas d’exploration si la compétence n’est pas en difficulté, ni sans prérequis disponible', () => {
    const program = [comp('e1', 'nombres', true, { primaryPrerequisite: 'p1' })];
    expect(
      play(createEvaluation(plan(program, { prerequisitePool: [pre('p1')] })), () => true).asked.some(
        (q) => q.role === 'prerequis',
      ),
    ).toBe(false);
    expect(play(createEvaluation(plan(program)), () => false).asked.some((q) => q.role === 'prerequis')).toBe(false);
  });
  it('seules les essentielles déclenchent une exploration', () => {
    const program = [comp('o1', 'nombres', false, { primaryPrerequisite: 'p1' })];
    expect(
      play(createEvaluation(plan(program, { prerequisitePool: [pre('p1')] })), () => false).asked.some(
        (q) => q.role === 'prerequis',
      ),
    ).toBe(false);
  });
  it('au plus 2 compétences explorées, 4 questions, sans descendre plus bas', () => {
    const program = eight().map((c, i) => ({ ...c, primaryPrerequisite: `p${i}` }));
    const pool = program.map((_, i) => pre(`p${i}`));
    const p = play(createEvaluation(plan(program, { prerequisitePool: pool })), (q) => q.role !== 'score');
    const explored = p.asked.filter((q) => q.role === 'prerequis');
    expect(explored).toHaveLength(4);
    expect(new Set(explored.map((q) => q.competenceId)).size).toBe(2);
    expect(p.asked.length).toBeLessThanOrEqual(EVALUATION.questions.max);
  });
  it('un prérequis en difficulté est signalé « à retravailler » et n’entre ni dans M ni dans C', () => {
    const program = [
      comp('e1', 'nombres', true, { primaryPrerequisite: 'p1' }),
      comp('e2', 'grandeurs', true),
      comp('e3', 'geometrie', true),
    ];
    const p = play(createEvaluation(plan(program, { prerequisitePool: [pre('p1')] })), () => false);
    const out = summarize(p.state);
    expect(out.competences.find((c) => c.id === 'p1')).toMatchObject({
      role: 'prerequis',
      state: 'en-difficulte',
      toRework: true,
    });
    expect(out.scores.counts.evaluated).toBe(3);
    expect(out.scores.coverage).toBe(100);
  });
  it('avancées : proposées seulement avec ≥ 80 % de réussite ; 3 questions au plus, hors score', () => {
    const adv = [comp('v1', 'nombres', false, { scored: false }), comp('v2', 'grandeurs', false, { scored: false })];
    const base = createEvaluation(plan(eight(), { advancedPool: adv }));
    const good = play(base, () => true);
    expect(good.canExploreAdvanced).toBe(true);
    expect(good.state.phase).toBe('fin');
    const accepted = play(chooseAdvanced(good.state, true), () => true);
    const bonus = accepted.asked;
    expect(bonus.map((q) => [q.role, q.competenceId])).toEqual([
      ['avance', 'v1'],
      ['avance', 'v1'],
      ['avance', 'v2'],
    ]);
    expect(accepted.state.phase).toBe('termine');
    const out = summarize(accepted.state);
    expect(out.competences.filter((c) => c.role === 'avance')).toHaveLength(2);
    expect(out.scores.counts.evaluated).toBe(8);
    const weak = play(base, (q) => q.index % 3 !== 0);
    expect(weak.canExploreAdvanced).toBe(false);
  });
  it('avancées : refus = fin ; réponse fausse jamais présentée comme un échec (rôle avance, pas de score)', () => {
    const adv = [comp('v1', 'nombres', false, { scored: false })];
    const good = play(createEvaluation(plan(eight(), { advancedPool: adv })), () => true);
    expect(chooseAdvanced(good.state, false).phase).toBe('termine');
    expect(canOfferAdvanced(chooseAdvanced(good.state, false))).toBe(false);
    const failed = play(chooseAdvanced(good.state, true), (q) => q.role !== 'avance');
    expect(summarize(failed.state).scores.counts.evaluated).toBe(8);
  });
  it('pas d’avancée sans compétence disponible, ni après une fin partielle', () => {
    expect(play(createEvaluation(plan(eight())), () => true).canExploreAdvanced).toBe(false);
    const adv = [comp('v1', 'nombres', false, { scored: false })];
    const timed = play(createEvaluation(plan(eight(), { advancedPool: adv })), () => true, { now: NOW + 16 * MIN });
    expect(timed.canExploreAdvanced).toBe(false);
  });
});

describe('arrêt, reprise et expiration (§5.5)', () => {
  it('fin normale : toutes les compétences conclues, non partielle', () => {
    const p = play(createEvaluation(plan(eight())), () => true);
    expect(p.state.endReason).toBe('concluded');
    expect(summarize(p.state).partial).toBe(false);
    expect(p.state.asked).toBeLessThanOrEqual(EVALUATION.questions.max);
  });
  it('fin au temps (15 min) : partielle, la question en cours est conservée', () => {
    let s = createEvaluation(plan(eight()));
    const first = play(s, () => true, { max: 3 });
    s = first.state;
    const n = nextEvaluationQuestion(s, NOW + 14 * MIN);
    expect(n.done).toBe(false);
    const late = nextEvaluationQuestion(s, NOW + 15 * MIN);
    expect(late.done).toBe(true);
    expect(late.state.endReason).toBe('time');
    expect(summarize(late.state).partial).toBe(true);
  });
  it('un temps dépassé avec une question en attente la redonne', () => {
    const n = nextEvaluationQuestion(createEvaluation(plan(eight())), NOW);
    if (n.done) throw new Error('attendu');
    expect(nextEvaluationQuestion(n.state, NOW + 30 * MIN)).toMatchObject({ done: false, question: n.question });
  });
  it('nombre fixe : exactement le nombre annoncé, quelles que soient les réponses', () => {
    const program = Array.from({ length: 12 }, (_, i) => comp(`c${i}`, 'nombres', true));
    const policies = [
      () => true,
      (q: EvaluationQuestion) => q.index % 2 === 0,
      (q: EvaluationQuestion) => q.index % 3 !== 0,
    ];
    for (const build of [() => plan(program), () => plan(eight()), () => plan([comp('a', 'nombres', true)])]) {
      for (const policy of policies) {
        const s = createEvaluation(build());
        const p = play(s, policy);
        const main = p.asked.filter((q) => q.role !== 'avance');
        expect(main).toHaveLength(s.planned);
        expect(p.asked.every((q) => q.planned === s.planned)).toBe(true);
      }
    }
    expect(createEvaluation(plan([comp('a', 'nombres', true)])).planned).toBe(EVALUATION.maxPerCompetence);
  });
  it('les prérequis explorés restent dans le nombre fixe', () => {
    const program = eight().map((c) => ({ ...c, primaryPrerequisite: 'p1' }));
    const pre = comp('p1', 'nombres', false, { scored: false });
    const s = createEvaluation(plan(program, { prerequisitePool: [pre] }));
    const p = play(s, (q) => q.role === 'prerequis' || q.competenceId !== 'n1');
    expect(p.asked.some((q) => q.role === 'prerequis')).toBe(true);
    expect(p.asked).toHaveLength(s.planned);
  });
  it('nombre atteint : fin conclue, sans nouvelle question', () => {
    const forced = play({ ...createEvaluation(plan(eight())), asked: 16 }, () => true);
    expect(forced.asked).toHaveLength(0);
    expect(forced.state.endReason).toBe('concluded');
  });
  it('reprise : l’état sérialisé redonne exactement la même question', () => {
    const n = nextEvaluationQuestion(createEvaluation(plan(eight())), NOW);
    if (n.done) throw new Error('attendu');
    const seeded = assignSeed(n.state, 777);
    const restored = JSON.parse(JSON.stringify(seeded)) as EvaluationState;
    expect(nextEvaluationQuestion(restored, NOW + 5 * MIN)).toMatchObject({
      done: false,
      question: { ...n.question, seed: 777 },
    });
  });
  it('reprise à mi-parcours : continuer après un aller-retour JSON donne le même déroulé', () => {
    const policy = (q: EvaluationQuestion) => q.index % 4 !== 0;
    const direct = play(createEvaluation(plan(eight())), policy);
    const half = play(createEvaluation(plan(eight())), policy, { max: 7 });
    const resumed = play(JSON.parse(JSON.stringify(half.state)) as EvaluationState, policy);
    expect([...half.asked, ...resumed.asked].map((q) => q.skillId)).toEqual(direct.asked.map((q) => q.skillId));
  });
  it('seule la question attendue est acceptée', () => {
    const n = nextEvaluationQuestion(createEvaluation(plan(eight())), NOW);
    if (n.done) throw new Error('attendu');
    const s = assignSeed(n.state, 9);
    const q = n.question;
    expect(recordEvaluationAnswer(s, { skillId: 'autre', level: q.level, seed: 9, correct: true })).toEqual({
      ok: false,
      reason: 'unexpected-question',
    });
    expect(
      recordEvaluationAnswer(s, { skillId: q.skillId, level: q.level === 1 ? 2 : 1, seed: 9, correct: true }),
    ).toEqual({ ok: false, reason: 'unexpected-question' });
    expect(recordEvaluationAnswer(s, { skillId: q.skillId, level: q.level, seed: 10, correct: true })).toEqual({
      ok: false,
      reason: 'unexpected-question',
    });
    expect(
      recordEvaluationAnswer(createEvaluation(plan(eight())), { skillId: q.skillId, level: 1, seed: 1, correct: true }),
    ).toEqual({ ok: false, reason: 'no-pending' });
    expect(recordEvaluationAnswer(s, { skillId: q.skillId, level: q.level, seed: 9, correct: true }).ok).toBe(true);
  });
  it('les fonctions ne modifient jamais l’état reçu', () => {
    const s = createEvaluation(plan(eight()));
    const frozen = JSON.stringify(s);
    const n = nextEvaluationQuestion(s, NOW);
    expect(JSON.stringify(s)).toBe(frozen);
    if (!n.done)
      recordEvaluationAnswer(assignSeed(n.state, 1), {
        skillId: n.question.skillId,
        level: n.question.level,
        seed: 1,
        correct: true,
      });
    expect(JSON.stringify(s)).toBe(frozen);
  });
  it('expiration après 7 jours ou si le format de l’état a changé', () => {
    const s = createEvaluation(plan(eight()));
    expect(isExpired(s, NOW + 7 * 86_400_000)).toBe(false);
    expect(isExpired(s, NOW + 7 * 86_400_000 + 1)).toBe(true);
    expect(isExpired({ ...s, v: 0 }, NOW)).toBe(true);
  });
});

describe('bilan (§4, §7)', () => {
  it('les états d’Arène alimentent maîtrise et couverture', () => {
    const p = play(createEvaluation(plan(eight())), () => true);
    const out = summarize(p.state);
    expect(out.kind).toBe('origines');
    expect(out.scores.coverage).toBe(100);
    expect(out.scores.mastery).toBeGreaterThan(70);
    expect(out.scores.studied).toBeNull();
    expect(out.questions).toBe(p.state.asked);
    expect(out.competences.every((c) => c.role === 'score')).toBe(true);
    expect(out.domains.map((d) => d.domain)).toEqual(['nombres', 'grandeurs', 'geometrie', 'fonctions']);
  });
  it('la notion la plus ratée est retenue pour les recommandations', () => {
    const p = play(createEvaluation(plan([comp('a', 'nombres', true)])), () => false);
    const a = summarize(p.state).competences[0];
    expect(a?.state).toBe('en-difficulte');
    expect(a?.weakestSkillId).toMatch(/^a-/);
    expect(a?.arenaAnswers).toBeGreaterThanOrEqual(2);
  });
  it('Progression : non étudiée = pas un échec (exclue de M), part étudiée suivie', () => {
    const program = [
      comp('v1', 'nombres', true, { studied: 'vu' }),
      comp('v2', 'nombres', true, { studied: 'vu' }),
      comp('v3', 'grandeurs', true, { studied: 'vu' }),
      comp('np', 'grandeurs', true, { studied: 'pas-vu', scored: false }),
      comp('ns', 'geometrie', false, { studied: 'ne-sait-pas', scored: false }),
    ];
    const p = play(createEvaluation(plan(program, { kind: 'progression' })), (q) => q.competenceId !== 'v3');
    const out = summarize(p.state);
    expect(out.notStudied).toEqual(['np']);
    expect(out.notEvaluated).toEqual(['ns']);
    expect(out.scores.studied).toBeCloseTo((6 / 9) * 100);
    expect(out.scores.coverage).toBeCloseTo((6 / 9) * 100);
    expect(out.scores.counts.struggling).toBe(1);
    expect(out.competences.find((c) => c.id === 'np')).toMatchObject({ scored: false, state: 'non-etudiee' });
  });
  it('conservation des acquis : « maîtrisée » dans le bilan précédent et qui s’effrite → à consolider', () => {
    const program = [comp('a', 'nombres', true, { priorState: 'maitrisee' })];
    const p = play(createEvaluation(plan(program, { kind: 'progression' })), (q) => q.index !== 2);
    expect(['a-consolider', 'en-difficulte']).toContain(summarize(p.state).competences[0]?.state);
    expect(p.asked[0]?.level).toBe(1); // échauffement prioritaire
  });
  it('les observations des autres modes comptent dans l’état sans remplacer les questions', () => {
    const watched = comp('a', 'nombres', true, {
      observations: [
        obs('a-a', true, 'solo', '2026-12-08', 2),
        obs('a-a', true, 'solo', '2026-12-08'),
        obs('a-b', true, 'solo', '2026-12-09'),
        obs('a-b', true, 'solo', '2026-12-09'),
        obs('a-c', true, 'solo', '2026-12-09'),
        obs('a-c', false, 'solo', '2026-12-09'),
      ],
    });
    const p = play(createEvaluation(plan([watched, comp('b', 'grandeurs', true)])), () => true);
    expect(p.asked.filter((q) => q.competenceId === 'a').length).toBeGreaterThanOrEqual(1);
    expect(summarize(p.state).competences.find((c) => c.id === 'a')?.state).toBe('maitrisee');
  });
});
