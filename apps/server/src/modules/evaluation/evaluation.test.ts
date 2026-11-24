import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { fmt, type Question } from '@epicademie/content';
import type {
  BadgeProgress,
  EvaluationAnswerResult,
  EvaluationHome,
  EvaluationNext,
  EvaluationResult,
  EvaluationStarted,
  Profile,
} from '@epicademie/shared';
import { createTestApp, profileInput } from '../../testing/harness.ts';
import { generateAny } from './evaluation.plan.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let profileId: string;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-16' });
});
afterAll(() => t.close());

const createProfile = async (client = t.http, grade = '6e') =>
  (
    await client.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      payload: { ...profileInput(), grade },
    })
  ).json<Profile>().id;

beforeEach(async () => {
  await t.reset();
  profileId = await createProfile();
});

/** Réponse juste à une question générée (ou fausse volontairement). */
function respond(q: Question, right: boolean) {
  const a = q.answer;
  if (!right) return { kind: 'unknown' as const };
  switch (a.kind) {
    case 'number':
      return { kind: 'number' as const, text: fmt(a.value) };
    case 'fraction':
      return { kind: 'fraction' as const, num: String(a.value.n), den: String(a.value.d) };
    case 'choice':
      return { kind: 'choice' as const, index: a.correct };
    case 'point':
      return { kind: 'point' as const, x: a.x, y: a.y };
    case 'text':
      return { kind: 'text' as const, text: a.accepted[0] ?? '' };
  }
}

const post = (url: string, payload?: object, client = t.http) => client.inject({ method: 'POST', url, payload });
const start = (kind = 'origines', pid = profileId, client = t.http) =>
  post('/api/v1/evaluations', { profileId: pid, subject: 'maths', kind }, client);

/** Joue l'épreuve jusqu'au bout ; `right(index)` dit si la réponse est juste. */
async function play(id: string, right: (index: number) => boolean, client = t.http, stopAfter = Infinity) {
  const seen: EvaluationNext[] = [];
  for (let i = 0; i < 40; i++) {
    const next = (await client.inject(`/api/v1/evaluations/${id}/next`)).json<EvaluationNext>();
    seen.push(next);
    if (next.done || i >= stopAfter) return seen;
    const q = next.question;
    const res = await post(
      `/api/v1/evaluations/${id}/answers`,
      {
        skillId: q.skillId,
        level: q.level,
        seed: q.seed,
        response: respond(generateAny(q.skillId, q.level, q.seed), right(q.index)),
        durationMs: 3000,
      },
      client,
    );
    expect(res.statusCode).toBe(200);
  }
  throw new Error('épreuve sans fin');
}

const finish = async (id: string, client = t.http) => {
  const res = await post(`/api/v1/evaluations/${id}/finish`, undefined, client);
  expect(res.statusCode).toBe(200);
  return res.json<EvaluationResult>();
};

const xpOf = async (id = profileId) => (await t.http.inject(`/api/v1/profiles/${id}`)).json<Profile>().xp;

describe('accueil et lancement', () => {
  it('accueil : Origines recommandée au départ, Progression demande d’abord la déclaration', async () => {
    const home = (await t.http.inject(`/api/v1/profiles/${profileId}/evaluations/maths/home`)).json<EvaluationHome>();
    expect(home).toMatchObject({ subject: 'maths', grade: '6e', available: true, open: null, history: [] });
    expect(home.kinds.find((k) => k.recommended)).toMatchObject({ kind: 'origines', rewardable: true });
    expect(home.kinds.find((k) => k.kind === 'origines')).toMatchObject({ available: true, referentialGrade: 'cm2' });
    const res = await start('progression');
    expect(res.statusCode).toBe(400);
  });

  it('sans classe : « Indique ta classe dans ton profil »', async () => {
    // Profil ancien, sans classe (la création en exige une désormais).
    const id = await createProfile();
    await t.database.db.execute(sql`update profiles set grade = null where id = ${id}`);
    const res = await start('origines', id);
    expect(res.statusCode).toBe(400);
    expect(res.body).toContain('classe');
  });

  it('ancien client : « physique » est normalisé en « sciences » (chemin et création)', async () => {
    const home = await t.http.inject(`/api/v1/profiles/${profileId}/evaluations/physique/home`);
    expect(home.json<EvaluationHome>().subject).toBe('sciences');
    expect(
      (await post('/api/v1/evaluations', { profileId, subject: 'physique', kind: 'origines' })).body,
    ).not.toContain('physique');
  });

  it('matière sans référentiel : pas encore d’épreuve', async () => {
    const res = await post('/api/v1/evaluations', { profileId, subject: 'anglais', kind: 'origines' });
    expect(res.statusCode).toBe(400);
  });

  it('un profil Adulte est évalué au niveau 3e (Origines sur la 4e)', async () => {
    const id = await createProfile(t.http, 'adulte');
    const home = (await t.http.inject(`/api/v1/profiles/${id}/evaluations/maths/home`)).json<EvaluationHome>();
    expect(home.kinds.find((k) => k.kind === 'origines')?.referentialGrade).toBe('4e');
    expect(home.kinds.find((k) => k.kind === 'progression')?.referentialGrade).toBe('3e');
  });

  it('CM1 : Origines sur les fondamentaux CE2', async () => {
    const id = await createProfile(t.http, 'cm1');
    const res = await start('origines', id);
    expect(res.statusCode).toBe(201);
    expect(res.json<EvaluationStarted>().plan.questions).toBeGreaterThanOrEqual(12);
  });

  it('reprend l’épreuve ouverte du même type ; un autre type : 409', async () => {
    const first = (await start()).json<EvaluationStarted>();
    expect(first.resumed).toBe(false);
    expect(first.plan.questions).toBeGreaterThanOrEqual(12);
    expect(first.plan.questions).toBeLessThanOrEqual(16);
    const again = (await start()).json<EvaluationStarted>();
    expect(again).toMatchObject({ id: first.id, resumed: true });
    const other = await start('maitres');
    expect(other.statusCode).toBe(409);
    expect(other.body).toContain(first.id);
  });
});

describe('déroulé d’une épreuve', () => {
  it('question idempotente, aucune correction montrée, mauvaise question refusée, réponse rejouée sans doublon', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    const a = (await t.http.inject(`/api/v1/evaluations/${id}/next`)).json<EvaluationNext>();
    const b = (await t.http.inject(`/api/v1/evaluations/${id}/next`)).json<EvaluationNext>();
    expect(b).toEqual(a);
    if (a.done) throw new Error('attendu');
    const q = a.question;
    const body = (over = {}) => ({
      skillId: q.skillId,
      level: q.level,
      seed: q.seed,
      response: respond(generateAny(q.skillId, q.level, q.seed), true),
      durationMs: 2000,
      ...over,
    });
    expect((await post(`/api/v1/evaluations/${id}/answers`, body({ seed: q.seed + 1 }))).statusCode).toBe(409);
    expect((await post(`/api/v1/evaluations/${id}/answers`, body({ skillId: 'm5-tables' }))).statusCode).toBe(409);
    const ok = await post(`/api/v1/evaluations/${id}/answers`, body());
    expect(ok.statusCode).toBe(200);
    expect(Object.keys(ok.json<EvaluationAnswerResult>()).toSorted()).toEqual(['progress', 'recorded']);
    expect(ok.json<EvaluationAnswerResult>()).toMatchObject({ recorded: true, progress: { index: 1 } });
    // Rejouée : même réponse, une seule observation.
    const replay = await post(`/api/v1/evaluations/${id}/answers`, body());
    expect(replay.json()).toMatchObject({ recorded: true });
    const rows = await t.database.db.execute(
      sql`select count(*)::int as n from attempts where skill_id = ${q.skillId}`,
    );
    expect(rows).toMatchObject({ rows: [{ n: 1 }] });
  });

  it('« Je ne sais pas » est enregistré comme une erreur ; une saisie illisible ne compte pas', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    const a = (await t.http.inject(`/api/v1/evaluations/${id}/next`)).json<EvaluationNext>();
    if (a.done) throw new Error('attendu');
    const q = a.question;
    const bad = await post(`/api/v1/evaluations/${id}/answers`, {
      skillId: q.skillId,
      level: q.level,
      seed: q.seed,
      response: { kind: 'text', text: '???' },
      durationMs: 10,
    });
    const answered = bad.json<EvaluationAnswerResult>();
    if (generateAny(q.skillId, q.level, q.seed).answer.kind !== 'text') {
      expect(answered).toMatchObject({ recorded: false, invalid: true });
    }
    const idk = await post(`/api/v1/evaluations/${id}/answers`, {
      skillId: q.skillId,
      level: q.level,
      seed: q.seed,
      response: { kind: 'unknown' },
      durationMs: 10,
    });
    expect(idk.json()).toMatchObject({ recorded: true });
    const stored = await t.database.db.execute(sql`select correct from attempts where skill_id = ${q.skillId}`);
    expect(stored).toMatchObject({ rows: [{ correct: false }] });
  });

  it('épreuve complète : bilan figé, récompenses, rien dans les médailles ni la répétition espacée', async () => {
    const before = await xpOf();
    const { id } = (await start()).json<EvaluationStarted>();
    const seen = await play(id, () => true);
    expect(seen.at(-1)).toMatchObject({ done: true });
    const result = await finish(id);
    expect(result).toMatchObject({ id, kind: 'origines', subject: 'maths', referentialGrade: 'cm2', partial: false });
    expect(result.mastery).toBeGreaterThanOrEqual(70);
    expect(result.coverage).toBe(100);
    expect(result.competences.length).toBeGreaterThanOrEqual(6);
    // 40 XP de participation, coffre rare (menée à terme) et 15 XP par compétence maîtrisée (60 au plus).
    const expectedXp = 40 + Math.min(60, 15 * result.counts.mastered);
    expect(result.rewards).toMatchObject({ xp: expectedXp, chest: 'rare', inPeriod: true });
    expect(result.rewards.chestContent).not.toBeNull();
    expect(await xpOf()).toBe(before + expectedXp);
    // L'épreuve mesure : aucune médaille ni répétition espacée.
    expect(await t.database.db.execute(sql`select count(*)::int as n from skill_states`)).toMatchObject({
      rows: [{ n: 0 }],
    });

    // Clôture rejouée : même bilan, rien de versé deux fois.
    const again = await finish(id);
    expect(again.id).toBe(id);
    expect(await xpOf()).toBe(before + expectedXp);
    const read = (await t.http.inject(`/api/v1/evaluations/${id}`)).json<EvaluationResult>();
    expect(read).toMatchObject({ id, mastery: result.mastery, coverage: 100 });
    expect(read.rewards.chestContent).toBeNull();

    const review = (await t.http.inject(`/api/v1/evaluations/${id}/review`)).json<{
      questions: { correct: boolean }[];
    }>();
    expect(review.questions.length).toBeGreaterThanOrEqual(12);
    const history = (await t.http.inject(`/api/v1/profiles/${profileId}/evaluations/maths`)).json<{ id: string }[]>();
    expect(history.map((h) => h.id)).toEqual([id]);
    // Nouvelle épreuve possible ensuite.
    expect((await start('maitres')).statusCode).toBe(201);
  });

  it('on ne clôt pas une épreuve inachevée', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    expect((await post(`/api/v1/evaluations/${id}/finish`)).statusCode).toBe(409);
    expect((await t.http.inject(`/api/v1/evaluations/${id}`)).statusCode).toBe(409);
  });

  it('élève en difficulté : prérequis explorés hors score, bilan non puni', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    await play(id, () => false);
    const result = await finish(id);
    expect(result.competences.some((c) => c.role === 'prerequis')).toBe(true);
    expect(result.counts.mastered).toBe(0);
    expect(result.prerequisitesToRework.length).toBeGreaterThan(0);
    expect(result.rewards.xp).toBeGreaterThanOrEqual(40);
    expect(result.partial).toBe(true);
    // Les prérequis n'entrent ni dans la maîtrise ni dans la couverture.
    expect(result.coverage).toBeLessThanOrEqual(100);
    expect(result.trainings.length).toBeGreaterThan(0);
  });

  it('récompense : une seule fois par année pour Origines, ensuite 20 XP sans coffre', async () => {
    const first = (await start()).json<EvaluationStarted>();
    await play(first.id, () => true);
    await finish(first.id);
    const before = await xpOf();
    t.clock.set('2026-11-30');
    const second = (await start()).json<EvaluationStarted>();
    await play(second.id, () => true);
    const result = await finish(second.id);
    // Hors période : 20 XP sans coffre ; les compétences déjà payées cette année ne rapportent plus.
    expect(result.rewards).toMatchObject({ xp: 20, chest: null, inPeriod: false });
    expect(await xpOf()).toBe(before + 20);
    t.clock.set('2026-11-16');
    // La comparaison ne se fait que sur le même référentiel : la 2e épreuve se compare à la 1re.
    expect(result.progress?.comparedWith).toBe(first.id);
  });

  it('le jeu hors Arène refuse le mode evaluation, et ses parties ne passent pas par /sessions', async () => {
    const refused = await post('/api/v1/sessions', {
      profileId,
      mode: 'evaluation',
      subject: 'maths',
      chapterId: 'm6-fractions',
      skillId: null,
    });
    expect(refused.statusCode).toBe(400);
    const { id } = (await start()).json<EvaluationStarted>();
    const session = await t.database.db.execute(sql`select id from sessions where mode = 'evaluation'`);
    const sessionId = (session as { rows: { id: string }[] }).rows[0]?.id;
    expect(sessionId).toBeTruthy();
    expect((await post(`/api/v1/sessions/${sessionId}/finish`)).statusCode).toBe(409);
    expect(id).toBeTruthy();
  });
});

describe('badges, records et classement', () => {
  it('une épreuve toute juste ne compte pas comme « série parfaite »', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    await play(id, () => true);
    await finish(id);
    const badges = (await t.http.inject(`/api/v1/profiles/${profileId}/badges`)).json<BadgeProgress[]>();
    expect(badges.find((b) => b.category === 'parfait')?.value).toBe(0);
    const rows = await t.database.db.execute(sql`select correct, answered from sessions where mode = 'evaluation'`);
    const [s] = (rows as { rows: { correct: number; answered: number }[] }).rows;
    expect(s?.answered).toBeGreaterThanOrEqual(12);
    expect(s?.correct).toBe(s?.answered);
    const ranking = await t.http.inject(`/api/v1/profiles/${profileId}/ranking`);
    expect(ranking.statusCode).toBe(200);
    expect(ranking.json<{ chrono: number; survie: number }[]>()[0]).toMatchObject({ chrono: 0, survie: 0 });
  });
});

describe('Progression et chapitres vus en classe', () => {
  it('déclaration, pré-cochage d’après l’entraînement, épreuve sur les chapitres vus', async () => {
    const chapters = (await t.http.inject(`/api/v1/profiles/${profileId}/evaluations/maths/studied-chapters`)).json<
      { chapterId: string; status: string; suggested: boolean }[]
    >();
    expect(chapters.length).toBeGreaterThanOrEqual(15);
    expect(chapters.every((c) => c.status === 'ne-sait-pas')).toBe(true);
    const unknown = await t.http.inject({
      method: 'PUT',
      url: `/api/v1/profiles/${profileId}/evaluations/maths/studied-chapters`,
      payload: { chapters: [{ chapterId: 'm5-calcul', status: 'vu' }] },
    });
    expect(unknown.statusCode).toBe(400);
    const seen = chapters.slice(0, 7).map((c) => ({ chapterId: c.chapterId, status: 'vu' }));
    const np = { chapterId: chapters[7]?.chapterId, status: 'pas-vu' };
    const put = await t.http.inject({
      method: 'PUT',
      url: `/api/v1/profiles/${profileId}/evaluations/maths/studied-chapters`,
      payload: { chapters: [...seen, np] },
    });
    expect(put.statusCode).toBe(204);
    const { id } = (await start('progression')).json<EvaluationStarted>();
    await play(id, () => true);
    const result = await finish(id);
    expect(result.kind).toBe('progression');
    expect(result.referentialGrade).toBe('6e');
    expect(result.notStudied).toEqual([np.chapterId]);
    expect(result.studied).toBeGreaterThan(0);
    expect(result.coverage).toBeLessThan(100);
    // Une compétence non étudiée n'est jamais comptée comme un échec.
    expect(result.counts.struggling).toBe(0);
  });
});

describe('expiration et isolation par famille', () => {
  it('une épreuve de plus de 7 jours expire (410) ; ses réponses restent', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    await play(id, () => true, t.http, 2);
    t.clock.set('2026-11-24');
    expect((await t.http.inject(`/api/v1/evaluations/${id}/next`)).statusCode).toBe(410);
    expect((await post(`/api/v1/evaluations/${id}/finish`)).statusCode).toBe(410);
    const kept = await t.database.db.execute(sql`select count(*)::int as n from attempts`);
    expect((kept as { rows: { n: number }[] }).rows[0]?.n).toBeGreaterThan(0);
    // Une nouvelle épreuve peut être lancée.
    expect((await start()).statusCode).toBe(201);
    t.clock.set('2026-11-16');
  });

  it('une autre famille ne voit rien : 404 partout, aucune écriture', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    await play(id, () => true, t.http, 3);
    const other = t.as((await t.signup()).cookie);
    const q = (await t.http.inject(`/api/v1/evaluations/${id}/next`)).json<EvaluationNext>();
    if (q.done) throw new Error('attendu');
    const payload = {
      skillId: q.question.skillId,
      level: q.question.level,
      seed: q.question.seed,
      response: { kind: 'unknown' },
      durationMs: 1,
    };
    const profileUrls = ['home', ''].map((p) => `/api/v1/profiles/${profileId}/evaluations/maths${p ? `/${p}` : ''}`);
    for (const url of [
      ...profileUrls,
      `/api/v1/profiles/${profileId}/evaluations/maths/studied-chapters`,
      `/api/v1/profiles/${profileId}/evaluation-summary`,
      `/api/v1/evaluations/${id}`,
      `/api/v1/evaluations/${id}/next`,
      `/api/v1/evaluations/${id}/review`,
    ]) {
      expect((await other.inject(url)).statusCode, url).toBe(404);
    }
    expect((await post(`/api/v1/evaluations/${id}/answers`, payload, other)).statusCode).toBe(404);
    expect((await post(`/api/v1/evaluations/${id}/advanced`, { accept: true }, other)).statusCode).toBe(404);
    expect((await post(`/api/v1/evaluations/${id}/finish`, undefined, other)).statusCode).toBe(404);
    expect((await start('origines', profileId, other)).statusCode).toBe(404);
    expect(
      (
        await other.inject({
          method: 'PUT',
          url: `/api/v1/profiles/${profileId}/evaluations/maths/studied-chapters`,
          payload: { chapters: [] },
        })
      ).statusCode,
    ).toBe(404);
    // Rien n'a changé pour la vraie famille.
    const stillThere = (await t.http.inject(`/api/v1/evaluations/${id}/next`)).json<EvaluationNext>();
    expect(stillThere).toEqual(q);
  });

  it('un appareil non connecté est refusé', async () => {
    expect(
      (await t.http.inject({ url: `/api/v1/evaluations/${profileId}/next`, headers: { cookie: '' } })).statusCode,
    ).toBe(401);
  });

  it('l’effacement d’un profil emporte ses épreuves', async () => {
    const { id } = (await start()).json<EvaluationStarted>();
    await t.database.db.execute(sql`delete from profiles where id = ${profileId}`);
    expect((await t.http.inject(`/api/v1/evaluations/${id}/next`)).statusCode).toBe(404);
  });
});

describe('résumé pour l’Espace parent', () => {
  it('une entrée par matière évaluée, avec le dernier bilan', async () => {
    const empty = (await t.http.inject(`/api/v1/profiles/${profileId}/evaluation-summary`)).json<{
      subjects: unknown[];
    }>();
    expect(empty.subjects).toEqual([]);
    const { id } = (await start()).json<EvaluationStarted>();
    await play(id, () => true);
    await finish(id);
    const summary = (await t.http.inject(`/api/v1/profiles/${profileId}/evaluation-summary`)).json<{
      subjects: { subject: string; history: unknown[]; latest: { id: string } | null }[];
    }>();
    expect(summary.subjects).toHaveLength(1);
    expect(summary.subjects[0]).toMatchObject({ subject: 'maths', latest: { id } });
  });
});
