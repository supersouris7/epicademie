import type { LearningReport, ModeId, SkillLearning, SkillStatus, SubjectId, Tally, Trend } from '@epicademie/shared';
import { SKILL_STATUSES } from '@epicademie/shared';
import type { Stage } from './srs.ts';

/**
 * Suivi des apprentissages : à partir des réponses enregistrées, état pédagogique de chaque
 * notion, progression par chapitre et par matière, erreurs récurrentes, évolution par semaine.
 * Fonctions pures et déterministes (docs/adr/0013-suivi-des-apprentissages.md).
 *
 * Règle centrale : la **maîtrise personnelle** ne se mesure que sur les premières réponses
 * individuelles sans aide. Une réussite avec indice ou au second essai est une « réussite avec
 * aide » ; une réponse collective (TV, raid, parent à côté) n'est jamais attribuée à l'enfant.
 */

/** Une réponse enregistrée, telle que le suivi la lit. */
export interface AnswerFact {
  readonly skillId: string;
  /** 1 : première réponse ; 2 : second essai après l'indice. */
  readonly attempt: 1 | 2;
  readonly correct: boolean;
  readonly hinted: boolean;
  readonly collective: boolean;
  /** Horodatage ISO de la réponse. */
  readonly at: string;
  /** Jour de la réponse (AAAA-MM-JJ, fuseau de la famille). */
  readonly day: string;
  readonly mode: ModeId;
  /** Erreur typique reconnue (texte de correction), ou null. */
  readonly diagnosis: string | null;
}

/** Place d'une notion dans les programmes. */
export interface SkillPlace {
  readonly chapterId: string;
  readonly subject: SubjectId;
}

/** État de répétition espacée d'une notion (voir srs.ts). */
export interface ReviewState {
  readonly stage: Stage;
  readonly due: string | null;
}

/** Réponses récentes prises en compte pour l'état d'une notion. */
export const RECENT_ANSWERS = 10;
/** En dessous, trop peu de réponses pour un taux de réussite. */
export const MIN_ANSWERS_FOR_RATE = 4;
/** Seuils de réussite autonome récente : « à travailler » sous 50 %, « à consolider » dès 80 %. */
export const WEAK_RATE = 0.5;
export const SOLID_RATE = 0.8;
/** Écart de réussite entre les 5 dernières et les 5 précédentes réponses pour parler de tendance. */
const TREND_GAP = 0.2;
const WEEKS = 8;

const isIndividualFirst = (f: AnswerFact) => f.attempt === 1 && !f.collective;
const isAutonomous = (f: AnswerFact) => isIndividualFirst(f) && f.correct && !f.hinted;
const successRate = (facts: readonly AnswerFact[]) => facts.filter(isAutonomous).length / facts.length;

export const emptyTally = (): Tally => ({ answered: 0, autonomous: 0, helped: 0, hints: 0, collective: 0 });

/** Comptes d'un ensemble de réponses, selon l'aide et le contexte. */
export function tallyOf(facts: readonly AnswerFact[]): Tally {
  const t = emptyTally();
  for (const f of facts) addFact(t, f);
  return t;
}

function addFact(t: { -readonly [K in keyof Tally]: number }, f: AnswerFact): void {
  if (f.collective) {
    t.collective++;
    return;
  }
  if (f.attempt === 1) t.answered++;
  if (isAutonomous(f)) t.autonomous++;
  else if (f.correct) t.helped++;
  if (f.hinted) t.hints++;
}

const addTally = (a: Tally, b: Tally): Tally => ({
  answered: a.answered + b.answered,
  autonomous: a.autonomous + b.autonomous,
  helped: a.helped + b.helped,
  hints: a.hints + b.hints,
  collective: a.collective + b.collective,
});

/**
 * État pédagogique d'une notion, à partir de ses premières réponses individuelles (ordre
 * chronologique) et de sa répétition espacée :
 * - aucune réponse : « pas encore commencée » ;
 * - moins de 4 réponses : « en progression » (on débute) ;
 * - deux dernières réponses fausses, ou réussite récente < 50 % : « à travailler » ;
 * - réussite récente < 80 % : « en progression » ;
 * - sinon « à consolider », ou « acquise » si la répétition espacée l'a validée (palier 3).
 */
export function skillStatus(firsts: readonly AnswerFact[], review?: ReviewState): SkillStatus {
  if (firsts.length === 0) return 'non-commencee';
  if (firsts.length < MIN_ANSWERS_FOR_RATE) return 'en-progression';
  const recent = firsts.slice(-RECENT_ANSWERS);
  const lastTwo = recent.slice(-2);
  if (lastTwo.every((f) => !isAutonomous(f))) return 'a-travailler';
  const rate = successRate(recent);
  if (rate < WEAK_RATE) return 'a-travailler';
  if (rate < SOLID_RATE) return 'en-progression';
  return review?.stage === 3 ? 'acquise' : 'a-consolider';
}

/** Évolution : 5 dernières réponses comparées aux 5 précédentes (au moins 10 réponses). */
export function trendOf(firsts: readonly AnswerFact[]): Trend | null {
  if (firsts.length < 10) return null;
  const last = successRate(firsts.slice(-5));
  const before = successRate(firsts.slice(-10, -5));
  if (last - before > TREND_GAP) return 'hausse';
  if (before - last > TREND_GAP) return 'baisse';
  return 'stable';
}

/** Erreurs typiques revenues au moins 2 fois (3 au plus). */
function recurringErrors(facts: readonly AnswerFact[]) {
  const counts = new Map<string, number>();
  for (const f of facts) if (!f.correct && f.diagnosis) counts.set(f.diagnosis, (counts.get(f.diagnosis) ?? 0) + 1);
  return [...counts]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([text, count]) => ({ text, count }));
}

/** Lundi de la semaine d'un jour AAAA-MM-JJ. */
export function mondayOf(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

const shiftDays = (day: string, days: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const statusCounts = (skills: readonly SkillLearning[]) =>
  Object.fromEntries(SKILL_STATUSES.map((s) => [s, skills.filter((k) => k.status === s).length])) as Record<
    SkillStatus,
    number
  >;

export interface LearningInput {
  /** Réponses du joueur (ordre quelconque). */
  readonly facts: readonly AnswerFact[];
  /** Répétition espacée par notion. */
  readonly reviews: ReadonlyMap<string, ReviewState>;
  /** Place d'une notion dans les programmes (notions retirées du contenu : ignorées). */
  readonly placeOf: (skillId: string) => SkillPlace | undefined;
  /** Jour du calcul (AAAA-MM-JJ). */
  readonly today: string;
}

/** Rapport complet : notions, chapitres, matières, priorités et 8 dernières semaines. */
export function learningReport({ facts, reviews, placeOf, today }: LearningInput): LearningReport {
  const sorted = [...facts].sort((a, b) => a.at.localeCompare(b.at));
  const bySkill = new Map<string, AnswerFact[]>();
  for (const f of sorted) bySkill.set(f.skillId, [...(bySkill.get(f.skillId) ?? []), f]);

  const skills: SkillLearning[] = [];
  for (const skillId of new Set([...bySkill.keys(), ...reviews.keys()])) {
    const place = placeOf(skillId);
    if (!place) continue;
    const all = bySkill.get(skillId) ?? [];
    const firsts = all.filter(isIndividualFirst);
    const recent = firsts.slice(-RECENT_ANSWERS);
    const review = reviews.get(skillId);
    skills.push({
      skillId,
      ...place,
      status: skillStatus(firsts, review),
      tally: tallyOf(all),
      recentRate: recent.length >= MIN_ANSWERS_FOR_RATE ? successRate(recent) : null,
      trend: trendOf(firsts),
      lastPracticed: all.at(-1)?.at ?? null,
      nextReview: review?.due ?? null,
      recurringErrors: recurringErrors(all),
    });
  }
  skills.sort((a, b) => a.skillId.localeCompare(b.skillId));

  const group = <K extends string>(key: (s: SkillLearning) => K) => {
    const groups = new Map<K, SkillLearning[]>();
    for (const s of skills) groups.set(key(s), [...(groups.get(key(s)) ?? []), s]);
    return [...groups].sort(([a], [b]) => a.localeCompare(b));
  };
  const total = (list: readonly SkillLearning[]) => list.reduce((t, s) => addTally(t, s.tally), emptyTally());

  const toRework = skills
    .filter((s) => s.status === 'a-travailler')
    .sort(
      (a, b) =>
        (a.recentRate ?? 0) - (b.recentRate ?? 0) || (b.lastPracticed ?? '').localeCompare(a.lastPracticed ?? ''),
    )
    .slice(0, 5)
    .map((s) => s.skillId);
  const dueReviews = skills
    .filter((s) => s.nextReview !== null && s.nextReview <= today && (reviews.get(s.skillId)?.stage ?? 0) > 0)
    .sort((a, b) => (a.nextReview ?? '').localeCompare(b.nextReview ?? ''))
    .slice(0, 5)
    .map((s) => s.skillId);

  const firstWeek = shiftDays(mondayOf(today), -7 * (WEEKS - 1));
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const week = shiftDays(firstWeek, 7 * i);
    const inWeek = sorted.filter((f) => mondayOf(f.day) === week && placeOf(f.skillId));
    return { week, tally: tallyOf(inWeek), modes: [...new Set(inWeek.map((f) => f.mode))].sort() };
  });

  const known = sorted.filter((f) => placeOf(f.skillId));
  return {
    day: today,
    tally: tallyOf(known),
    lastActivity: known.at(-1)?.at ?? null,
    subjects: group((s) => s.subject).map(([subject, list]) => ({
      subject,
      tally: total(list),
      statuses: statusCounts(list),
    })),
    chapters: group((s) => s.chapterId).map(([chapterId, list]) => ({
      chapterId,
      subject: list[0]?.subject ?? 'maths',
      tally: total(list),
      statuses: statusCounts(list),
    })),
    skills,
    toRework,
    dueReviews,
    weeks,
  };
}
