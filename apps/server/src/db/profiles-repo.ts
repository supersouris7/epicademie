import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import type { Profile, ProfileCreate, ProfileUpdate } from '@questeo/shared';
import type { Db } from './client.ts';
import { profiles, type ProfileRow } from './schema.ts';

const toProfile = (row: ProfileRow): Profile => ({ ...row });

export function createProfilesRepo(db: Db) {
  return {
    list(): Profile[] {
      return db.select().from(profiles).orderBy(asc(profiles.createdAt)).all().map(toProfile);
    },
    get(id: string): Profile | undefined {
      const row = db.select().from(profiles).where(eq(profiles.id, id)).get();
      return row && toProfile(row);
    },
    create(input: ProfileCreate): Profile {
      const row = db
        .insert(profiles)
        // Héros explicite : la valeur par défaut de la colonne date d'avant les nouveaux héros.
        .values({ id: randomUUID(), ...input, hero: input.hero ?? 'nassim' })
        .returning()
        .get();
      return toProfile(row);
    },
    update(id: string, patch: ProfileUpdate): Profile | undefined {
      if (Object.keys(patch).length === 0) return this.get(id);
      const [row] = db.update(profiles).set(patch).where(eq(profiles.id, id)).returning().all();
      return row && toProfile(row);
    },
    remove(id: string): boolean {
      return db.delete(profiles).where(eq(profiles.id, id)).run().changes > 0;
    },
  };
}

export type ProfilesRepo = ReturnType<typeof createProfilesRepo>;
