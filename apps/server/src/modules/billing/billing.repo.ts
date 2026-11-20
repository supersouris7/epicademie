import { and, desc, eq, gte } from 'drizzle-orm';
import type { Executor } from '../../db/client.ts';
import { subscriptions } from '../../db/schema.ts';

/** Accès aux paiements de l'abonnement familial. */
export function billingRepo(db: Executor) {
  return {
    history: (familyId: string) =>
      db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.familyId, familyId))
        .orderBy(desc(subscriptions.createdAt)),

    /** Fin d'accès payé la plus lointaine encore valable aujourd'hui (AAAA-MM-JJ), ou undefined. */
    async activeUntil(familyId: string, today: string): Promise<string | undefined> {
      const [row] = await db
        .select({ end: subscriptions.periodEnd })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.familyId, familyId),
            eq(subscriptions.status, 'payee'),
            gte(subscriptions.periodEnd, today),
          ),
        )
        .orderBy(desc(subscriptions.periodEnd))
        .limit(1);
      return row?.end;
    },

    async create(s: typeof subscriptions.$inferInsert): Promise<string> {
      const [row] = await db.insert(subscriptions).values(s).returning({ id: subscriptions.id });
      if (!row) throw new Error('paiement sans retour');
      return row.id;
    },

    async setProviderRef(id: string, providerRef: string): Promise<void> {
      await db.update(subscriptions).set({ providerRef }).where(eq(subscriptions.id, id));
    },

    /** Paiement verrouillé jusqu'à la fin de la transaction (deux notifications simultanées). */
    async findForUpdate(id: string) {
      const [row] = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).for('update');
      return row;
    },

    async settle(id: string, status: 'payee' | 'echouee', at: Date): Promise<void> {
      await db
        .update(subscriptions)
        .set({ status, paidAt: status === 'payee' ? at : null })
        .where(eq(subscriptions.id, id));
    },
  };
}
