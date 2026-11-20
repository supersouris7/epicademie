import { eq } from 'drizzle-orm';
import type { HqLayout } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { hqLayouts, ownedCosmetics } from '../../db/schema.ts';

/** Accès au QG : cosmétiques achetés et aménagement. */
export function hqRepo(db: Executor) {
  return {
    async owned(profileId: string): Promise<string[]> {
      const rows = await db
        .select({ cosmetic: ownedCosmetics.cosmetic })
        .from(ownedCosmetics)
        .where(eq(ownedCosmetics.profileId, profileId));
      return rows.map((r) => r.cosmetic);
    },
    /** false si déjà possédé. */
    async add(profileId: string, cosmetic: string): Promise<boolean> {
      const rows = await db
        .insert(ownedCosmetics)
        .values({ profileId, cosmetic })
        .onConflictDoNothing()
        .returning({ c: ownedCosmetics.cosmetic });
      return rows.length > 0;
    },
    async layout(profileId: string): Promise<HqLayout | undefined> {
      const [row] = await db.select().from(hqLayouts).where(eq(hqLayouts.profileId, profileId));
      return row?.layout;
    },
    async saveLayout(profileId: string, layout: HqLayout, at: Date): Promise<void> {
      await db
        .insert(hqLayouts)
        .values({ profileId, layout, updatedAt: at })
        .onConflictDoUpdate({ target: hqLayouts.profileId, set: { layout, updatedAt: at } });
    },
  };
}
