import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { chaptersOf, fmt, generate, getChapter, type Question, type Response } from '@questeo/content';
import type {
  BattleAnswerResult,
  BattleSummary,
  BattleView,
  BossOverview,
  Profile,
  SessionSummary,
} from '@questeo/shared';
import { eq } from 'drizzle-orm';
import { attempts, inventory, profiles, sessions } from '../../db/schema.ts';
import { createTestApp, fixedRandom } from '../../testing/harness.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let app: Awaited<ReturnType<typeof createTestApp>>['http'];
const CHAPTER = 'm5-relatifs';
let profileId: string;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-17', random: fixedRandom(0) });
  app = t.http;
});
afterAll(() => t.close());

beforeEach(async () => {
  await t.reset();
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/profiles',
    payload: {
      name: 'Léa',
      avatar: { style: 'pixelbot', seed: 's' },
      gender: 'fille',
      birthDate: '2014-03-09',
      grade: '5e',
    },
  });
  profileId = res.json<Profile>().id;
});

function perfect(q: Question): Response {
  const a = q.answer;
  if (a.kind === 'number') return { kind: 'number', text: fmt(a.value) };
  if (a.kind === 'fraction') return { kind: 'fraction', num: String(a.value.n), den: String(a.value.d) };
  if (a.kind === 'choice') return { kind: 'choice', index: a.correct };
  if (a.kind === 'point') return { kind: 'point', x: a.x, y: a.y };
  return { kind: 'text', text: a.accepted[0] ?? '' };
}

/** Une mauvaise réponse sûre pour n'importe quelle question. */
function wrong(q: Question): Response {
  const a = q.answer;
  if (a.kind === 'choice') return { kind: 'choice', index: a.correct === 0 ? 1 : 0 };
  if (a.kind === 'number') return { kind: 'number', text: fmt(a.value) === '987654' ? '1' : '987654' };
  if (a.kind === 'fraction') return { kind: 'fraction', num: '987', den: '1' };
  if (a.kind === 'point') return { kind: 'point', x: a.x + 1, y: a.y };
  return { kind: 'text', text: 'zzz' };
}

const startBattle = (chapterId = CHAPTER) =>
  app.inject({ method: 'POST', url: '/api/v1/battles', payload: { profileId, chapterId } });

async function reply(b: BattleView, right: boolean) {
  const q = b.question;
  if (!q) throw new Error('pas de question');
  const question = generate(q.skillId, q.level, q.seed);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/battles/${b.id}/answers`,
    payload: { ...q, response: right ? perfect(question) : wrong(question), durationMs: 3000 },
  });
  return res.json<BattleAnswerResult>();
}

const overview = async () => (await app.inject(`/api/v1/profiles/${profileId}/bosses`)).json<BossOverview>();

describe('combat de boss', () => {
  it('tous les boss sont ouverts d’emblée (5e comprise) ; un chapitre inconnu est refusé', async () => {
    expect((await startBattle()).statusCode).toBe(201);
    expect((await startBattle('m5-calcul')).statusCode).toBe(201);
    expect((await startBattle('m5-inconnu')).statusCode).toBe(400);
  });

  it('victoire sans faute : munition, coffre, pièces ; la 2e victoire ne redonne pas le coffre', async () => {
    const res = await startBattle();
    expect(res.statusCode).toBe(201);
    let b = res.json<BattleView>();
    expect(b).toMatchObject({ hearts: 3, bossLives: 3, mobsDefeated: 0, status: 'fighting' });
    let turns = 0;
    while (b.status === 'fighting') {
      const r = await reply(b, true);
      expect(r.outcome).toBe('hit');
      b = r.battle;
      turns++;
    }
    expect(turns).toBe(7);
    expect(b.status).toBe('won');
    const sum = (await app.inject({ method: 'POST', url: `/api/v1/battles/${b.id}/finish` })).json<BattleSummary>();
    expect(sum).toMatchObject({ won: true, firstWin: true, hearts: 3, xpGained: 120, medal: 'diamant', newBest: true });
    expect(sum.items).toEqual({ bouclier: 1, soin: 1, indice: 1 });
    expect((await overview()).records).toMatchObject([
      { chapterId: CHAPTER, wins: 1, bestHearts: 3, bestMedal: 'diamant' },
    ]);

    let b2 = (await startBattle()).json<BattleView>();
    while (b2.status === 'fighting') b2 = (await reply(b2, true)).battle;
    const sum2 = (await app.inject({ method: 'POST', url: `/api/v1/battles/${b2.id}/finish` })).json<BattleSummary>();
    expect(sum2).toMatchObject({ firstWin: false, items: {}, medal: 'diamant', newBest: false });
    expect((await overview()).records[0]?.wins).toBe(2);
  });

  it('3 erreurs : défaite, notion à retravailler, pas de médaille', async () => {
    let b = (await startBattle()).json<BattleView>();
    const first = b.question?.skillId;
    for (let i = 0; i < 3; i++) b = (await reply(b, false)).battle;
    expect(b).toMatchObject({ status: 'lost', hearts: 0, question: null });
    const sum = (await app.inject({ method: 'POST', url: `/api/v1/battles/${b.id}/finish` })).json<BattleSummary>();
    expect(sum).toMatchObject({ won: false, medal: null, newBest: false });
    expect(getChapter(CHAPTER)?.skills.some((s) => s.id === sum.weakSkill)).toBe(true);
    expect(first).toBeDefined();
    expect((await overview()).records).toEqual([]);
  });

  it('refuse une autre question que celle en cours et une fin prématurée', async () => {
    const b = (await startBattle()).json<BattleView>();
    const q = b.question;
    if (!q) throw new Error('pas de question');
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/battles/${b.id}/answers`,
      payload: { ...q, seed: q.seed + 1, response: { kind: 'number', text: '1' }, durationMs: 1 },
    });
    expect(res.statusCode).toBe(409);
    expect((await app.inject({ method: 'POST', url: `/api/v1/battles/${b.id}/finish` })).statusCode).toBe(409);
  });

  it('objets : gagnés à l’entraînement (sans-faute), achetés en pièces, utilisés en combat', async () => {
    // Série d'entraînement : un coffre au hasard (ici commun : 1 bouclier, 10 pièces).
    const chapter = chaptersOf('maths')[0];
    const s = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: chapter?.id, skillId: 'm5-tables' },
    });
    const sid = s.json<{ id: string }>().id;
    for (let seed = 1; seed <= 5; seed++) {
      await app.inject({
        method: 'POST',
        url: `/api/v1/sessions/${sid}/answers`,
        payload: {
          skillId: 'm5-tables',
          level: 1,
          seed,
          variant: false,
          response: perfect(generate('m5-tables', 1, seed)),
          durationMs: 2000,
        },
      });
    }
    const summary = (
      await app.inject({ method: 'POST', url: `/api/v1/sessions/${sid}/finish` })
    ).json<SessionSummary>();
    expect(summary.perfect).toBe(true);
    expect(summary.chest).toEqual({ rarity: 'commun', items: {}, coins: 25, rubies: 0, hero: null });

    // Pièces du sans-faute et du coffre : de quoi acheter un indice.
    const buy = await app.inject({ method: 'POST', url: '/api/v1/shop', payload: { profileId, item: 'indice' } });
    expect(buy.statusCode).toBe(200);
    expect(buy.json<{ inventory: { indice: number } }>().inventory.indice).toBe(1);

    const b = (await startBattle()).json<BattleView>();
    expect(b.equipped).toEqual([]);
    const use = (item: string) =>
      app.inject({ method: 'POST', url: `/api/v1/battles/${b.id}/items`, payload: { item } });
    // L'indice acheté reste en réserve : il n'est pas équipé.
    expect((await use('indice')).json<{ error: string }>().error).toMatch(/pas équipé/);
  });

  it('une session de boss ne passe pas par les routes d’entraînement', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'boss', subject: 'maths', chapterId: CHAPTER, skillId: null },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('équipement et objets en combat', () => {
  /** Donne des objets au profil (comme un coffre) sans passer par l'entraînement. */
  const stock = async (items: Partial<Record<'bouclier' | 'soin' | 'indice', number>>) => {
    for (const [item, count] of Object.entries(items)) {
      await t.database.db.insert(inventory).values({ profileId, item: item as 'soin', count });
    }
  };
  const equip = (items: string[]) =>
    app.inject({ method: 'PUT', url: `/api/v1/profiles/${profileId}/equipment`, payload: { items } });

  it('équipe jusqu’à 3 objets couverts par la réserve, refuse le reste', async () => {
    await stock({ bouclier: 1, indice: 2 });
    const ok = await equip(['indice', 'bouclier', 'indice']);
    expect(ok.statusCode).toBe(200);
    expect(ok.json<BossOverview>().equipped).toEqual(['indice', 'bouclier', 'indice']);
    expect((await equip(['soin'])).statusCode).toBe(400);
    expect((await equip(['indice', 'indice', 'indice', 'indice'])).statusCode).toBe(400);
    expect((await equip([])).json<BossOverview>().equipped).toEqual([]);
    const unknown = await app.inject({
      method: 'PUT',
      url: '/api/v1/profiles/00000000-0000-4000-8000-000000000000/equipment',
      payload: { items: [] },
    });
    expect(unknown.statusCode).toBe(404);
  });

  it('utilise un objet équipé : consommé de la réserve et de l’équipement, pas deux fois l’indice', async () => {
    await stock({ indice: 2, soin: 1 });
    await equip(['indice', 'indice', 'soin']);
    const b = (await startBattle()).json<BattleView>();
    expect(b.equipped).toEqual(['indice', 'indice', 'soin']);
    const use = (item: string) =>
      app.inject({ method: 'POST', url: `/api/v1/battles/${b.id}/items`, payload: { item } });
    const first = await use('indice');
    expect(first.statusCode).toBe(200);
    expect(first.json<BattleView>()).toMatchObject({ hintShown: true, inventory: { indice: 1 } });
    // Indice déjà affiché pour cette question : refusé.
    expect((await use('indice')).statusCode).toBe(409);
    // Soin à cœurs pleins : refusé (rien n'est consommé).
    expect((await use('soin')).statusCode).toBe(409);
    expect((await overview()).inventory.soin).toBe(1);
    // Réponse juste avec l'indice affiché : enregistrée comme réussite avec aide.
    await reply(first.json<BattleView>(), true);
    const rows = await t.database.db.select().from(attempts).where(eq(attempts.sessionId, b.id));
    expect(rows.map((r) => [r.correct, r.hinted])).toEqual([[true, true]]);
  });

  it('combat inconnu ou terminé : 404 / 409', async () => {
    const unknown = '00000000-0000-4000-8000-000000000000';
    expect((await app.inject({ method: 'POST', url: `/api/v1/battles/${unknown}/finish` })).statusCode).toBe(404);
    expect(
      (await app.inject({ method: 'POST', url: `/api/v1/battles/${unknown}/items`, payload: { item: 'soin' } }))
        .statusCode,
    ).toBe(404);
    const noProfile = await app.inject({
      method: 'POST',
      url: '/api/v1/battles',
      payload: { profileId: unknown, chapterId: CHAPTER },
    });
    expect(noProfile.statusCode).toBe(404);
  });

  describe('combat commencé avant une mise à jour du format de son état', () => {
    /** Remplace l'état stocké du combat par `stored` (comme l'aurait écrit une autre version). */
    async function staleBattle(stored: unknown) {
      const b = (
        await app.inject({ method: 'POST', url: '/api/v1/battles', payload: { profileId, chapterId: CHAPTER } })
      ).json<BattleView>();
      await t.database.db.update(sessions).set({ battle: stored }).where(eq(sessions.id, b.id));
      return b;
    }
    const session = async (id: string) => (await t.database.db.select().from(sessions).where(eq(sessions.id, id)))[0];
    const wallet = async () => (await t.database.db.select().from(profiles).where(eq(profiles.id, profileId)))[0];

    it('réponse : 410, combat clos sans récompense ni pénalité', async () => {
      const before = await wallet();
      const b = await staleBattle({ status: 'fighting', hearts: 3 }); // ancien format, sans version
      const q = b.question;
      if (!q) throw new Error('question attendue');
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/battles/${b.id}/answers`,
        payload: {
          skillId: q.skillId,
          level: q.level,
          seed: q.seed,
          response: { kind: 'text', text: '1' },
          durationMs: 1000,
        },
      });
      expect(res.statusCode).toBe(410);
      const body = res.json<{ code: string; error: string }>();
      expect(body.code).toBe('GONE');
      expect(body.error).toMatch(/expiré/);
      const s = await session(b.id);
      expect(s?.finishedAt).not.toBeNull();
      expect(s?.xp).toBe(0);
      expect(await wallet()).toMatchObject({ xp: before?.xp, coins: before?.coins });
    });

    it('objet et fin de combat : 410 aussi', async () => {
      const b = await staleBattle({ v: 999, state: {} });
      const item = await app.inject({
        method: 'POST',
        url: `/api/v1/battles/${b.id}/items`,
        payload: { item: 'soin' },
      });
      expect(item.statusCode).toBe(410);
      expect((await app.inject({ method: 'POST', url: `/api/v1/battles/${b.id}/finish` })).statusCode).toBe(410);
    });
  });
});
