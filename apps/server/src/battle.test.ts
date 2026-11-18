import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { chaptersOf, fmt, generate, getChapter, type Question, type Response } from '@questeo/content';
import type {
  BattleAnswerResult,
  BattleSummary,
  BattleView,
  BossOverview,
  Profile,
  SessionSummary,
} from '@questeo/shared';
import { buildApp } from './app.ts';
import { openDb } from './db/client.ts';

const migrationsDir = path.resolve(import.meta.dirname, '../drizzle');
const CHAPTER = 'm5-relatifs';
let app: FastifyInstance;
let close: () => void;
let profileId: string;

beforeEach(async () => {
  const opened = openDb(':memory:', migrationsDir);
  close = opened.close;
  // Hasard à 0 : coffre toujours obtenu, rareté commune, premier objet (bouclier).
  app = await buildApp({
    db: opened.db,
    port: 3000,
    webDir: null,
    publicUrl: null,
    today: () => '2026-11-17',
    random: () => 0,
  });
  const res = await app.inject({
    method: 'POST',
    url: '/api/profiles',
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
afterEach(async () => {
  await app.close();
  close();
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
  app.inject({ method: 'POST', url: '/api/battles', payload: { profileId, chapterId } });

async function reply(b: BattleView, right: boolean) {
  const q = b.question;
  if (!q) throw new Error('pas de question');
  const question = generate(q.skillId, q.level, q.seed);
  const res = await app.inject({
    method: 'POST',
    url: `/api/battles/${b.id}/answers`,
    payload: { ...q, response: right ? perfect(question) : wrong(question), durationMs: 3000 },
  });
  return res.json<BattleAnswerResult>();
}

const overview = async () => (await app.inject(`/api/profiles/${profileId}/bosses`)).json<BossOverview>();

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
    expect(turns).toBe(10);
    expect(b.status).toBe('won');
    const sum = (await app.inject({ method: 'POST', url: `/api/battles/${b.id}/finish` })).json<BattleSummary>();
    expect(sum).toMatchObject({ won: true, firstWin: true, hearts: 3, xpGained: 150, medal: 'diamant', newBest: true });
    expect(sum.items).toEqual({ bouclier: 1, soin: 1, indice: 1 });
    expect((await overview()).records).toMatchObject([
      { chapterId: CHAPTER, wins: 1, bestHearts: 3, bestMedal: 'diamant' },
    ]);

    let b2 = (await startBattle()).json<BattleView>();
    while (b2.status === 'fighting') b2 = (await reply(b2, true)).battle;
    const sum2 = (await app.inject({ method: 'POST', url: `/api/battles/${b2.id}/finish` })).json<BattleSummary>();
    expect(sum2).toMatchObject({ firstWin: false, items: {}, medal: 'diamant', newBest: false });
    expect((await overview()).records[0]?.wins).toBe(2);
  });

  it('3 erreurs : défaite, notion à retravailler, pas de médaille', async () => {
    let b = (await startBattle()).json<BattleView>();
    const first = b.question?.skillId;
    for (let i = 0; i < 3; i++) b = (await reply(b, false)).battle;
    expect(b).toMatchObject({ status: 'lost', hearts: 0, question: null });
    const sum = (await app.inject({ method: 'POST', url: `/api/battles/${b.id}/finish` })).json<BattleSummary>();
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
      url: `/api/battles/${b.id}/answers`,
      payload: { ...q, seed: q.seed + 1, response: { kind: 'number', text: '1' }, durationMs: 1 },
    });
    expect(res.statusCode).toBe(409);
    expect((await app.inject({ method: 'POST', url: `/api/battles/${b.id}/finish` })).statusCode).toBe(409);
  });

  it('objets : gagnés à l’entraînement (sans-faute), achetés en pièces, utilisés en combat', async () => {
    // Série d'entraînement : un coffre au hasard (ici commun : 1 bouclier, 10 pièces).
    const chapter = chaptersOf('maths')[0];
    const s = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: chapter?.id, skillId: 'm5-tables' },
    });
    const sid = s.json<{ id: string }>().id;
    for (let seed = 1; seed <= 5; seed++) {
      await app.inject({
        method: 'POST',
        url: `/api/sessions/${sid}/answers`,
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
    const summary = (await app.inject({ method: 'POST', url: `/api/sessions/${sid}/finish` })).json<SessionSummary>();
    expect(summary.perfect).toBe(true);
    expect(summary.chest).toEqual({ rarity: 'commun', items: { bouclier: 1 }, coins: 10 });

    // Pièces du sans-faute et du coffre : de quoi acheter un indice.
    const buy = await app.inject({ method: 'POST', url: '/api/shop', payload: { profileId, item: 'indice' } });
    expect(buy.statusCode).toBe(200);
    expect(buy.json<{ inventory: { indice: number } }>().inventory.indice).toBe(1);

    // Équipement : seuls les objets équipés (pris dans la réserve, 3 au plus) servent en combat.
    const equip = (items: string[]) =>
      app.inject({ method: 'PUT', url: `/api/profiles/${profileId}/equipment`, payload: { items } });
    expect((await equip(['bouclier', 'bouclier'])).statusCode).toBe(400); // un seul bouclier en réserve
    expect((await equip(['bouclier', 'indice', 'soin', 'soin'])).statusCode).toBe(400); // 3 au plus
    const eq = await equip(['bouclier']);
    expect(eq.json<{ equipped: string[] }>().equipped).toEqual(['bouclier']);

    const b = (await startBattle()).json<BattleView>();
    expect(b.equipped).toEqual(['bouclier']);
    const use = (item: string) => app.inject({ method: 'POST', url: `/api/battles/${b.id}/items`, payload: { item } });
    // L'indice acheté reste en réserve : il n'est pas équipé.
    expect((await use('indice')).json<{ error: string }>().error).toMatch(/pas équipé/);
    const shield = await use('bouclier');
    expect(shield.json<BattleView>()).toMatchObject({ shield: true, itemsUsed: 1, equipped: [] });
    expect(shield.json<BattleView>().inventory.bouclier).toBe(0);
    expect((await use('bouclier')).statusCode).toBe(409);
    const r = await reply(shield.json<BattleView>(), false);
    expect(r.outcome).toBe('blocked');
    expect(r.battle.hearts).toBe(3);
    expect(r.battle.inventory.indice).toBe(1);
    // L'objet utilisé a quitté l'équipement.
    const overview = await app.inject({ method: 'GET', url: `/api/profiles/${profileId}/bosses` });
    expect(overview.json<{ equipped: string[] }>().equipped).toEqual([]);
  });

  it('une session de boss ne passe pas par les routes d’entraînement', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { profileId, mode: 'boss', subject: 'maths', chapterId: CHAPTER, skillId: null },
    });
    expect(res.statusCode).toBe(400);
  });
});
