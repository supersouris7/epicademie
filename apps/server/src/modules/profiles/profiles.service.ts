import type { Profile, ProfileCreate, ProfileUpdate } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import { notFound } from '../../core/errors.ts';
import { profilesRepo, toProfile } from './profiles.repo.ts';

/** Rubis offerts à la création d'un profil. */
export const STARTING_RUBIES = 2;

export const PROFILE_NOT_FOUND = 'Profil introuvable';

/** Règles métier des profils. */
export function createProfilesService(db: Db) {
  const repo = profilesRepo(db);
  return {
    list: (): Promise<Profile[]> => repo.list(),

    async get(id: string): Promise<Profile> {
      const row = await repo.find(id);
      if (!row) throw notFound(PROFILE_NOT_FOUND);
      return toProfile(row);
    },

    /** Profil ou `undefined` (temps réel : refus de connexion plutôt qu'erreur). */
    async find(id: string): Promise<Profile | undefined> {
      const row = await repo.find(id);
      return row && toProfile(row);
    },

    async create(input: ProfileCreate): Promise<Profile> {
      return toProfile(await repo.insert({ ...input, rubies: STARTING_RUBIES }));
    },

    async update(id: string, patch: ProfileUpdate): Promise<Profile> {
      // Corps vide : rien à changer, on renvoie le profil tel quel.
      const row = Object.keys(patch).length === 0 ? await repo.find(id) : await repo.update(id, patch);
      if (!row) throw notFound(PROFILE_NOT_FOUND);
      return toProfile(row);
    },

    async remove(id: string): Promise<void> {
      if (!(await repo.remove(id))) throw notFound(PROFILE_NOT_FOUND);
    },
  };
}

export type ProfilesService = ReturnType<typeof createProfilesService>;
