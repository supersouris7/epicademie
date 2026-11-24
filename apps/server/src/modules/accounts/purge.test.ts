import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { accounts, families } from '../../db/schema.ts';
import { createTestApp } from '../../testing/harness.ts';
import { purgeUnverifiedAccounts } from './purge.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-24' });
});
afterAll(() => t.close());

describe('purge des inscriptions non validées', () => {
  it('supprime après 7 jours les familles jamais validées, en cascade, et garde le reste', async () => {
    const { db } = t.database;
    const now = new Date('2026-11-24T12:00:00Z');
    const old = new Date('2026-11-10T12:00:00Z');
    const recent = new Date('2026-11-22T12:00:00Z');
    const make = async (email: string, createdAt: Date, verified: boolean) => {
      const me = await t.signup(email);
      await db
        .update(accounts)
        .set({ createdAt, emailVerifiedAt: verified ? createdAt : null })
        .where(eq(accounts.id, me.me.account.id));
      return me.me.account.id;
    };
    const stale = await make('ancien@famille.test', old, false);
    const young = await make('recent@famille.test', recent, false);
    const valid = await make('valide@famille.test', old, true);
    const before = (await db.select().from(families)).length;

    expect(await purgeUnverifiedAccounts(db, now)).toBe(1);
    const left = (await db.select({ id: accounts.id }).from(accounts)).map((a) => a.id);
    expect(left).not.toContain(stale);
    expect(left).toEqual(expect.arrayContaining([young, valid]));
    expect((await db.select().from(families)).length).toBe(before - 1);
    expect(await purgeUnverifiedAccounts(db, now)).toBe(0);
  });
});
