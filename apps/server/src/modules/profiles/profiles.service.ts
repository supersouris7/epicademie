import type { Profile, ProfileCreate, ProfileUpdate } from '@questeo/shared';
import type { Actor } from '../../core/http/auth.ts';
import type { Db } from '../../db/client.ts';
import { AppError, notFound } from '../../core/errors.ts';
import { profilesRepo, toProfile } from './profiles.repo.ts';

/** Rubis offerts à la création d'un profil. */
export const STARTING_RUBIES = 2;

export const PROFILE_NOT_FOUND = 'Profil introuvable';

/** Champs d'identité d'un enfant : seul le parent les change (prénom, naissance, classe, genre). */
const IDENTITY_FIELDS = ['name', 'birthDate', 'grade', 'gender'] as const;

/** Règles métier des profils. */
export function createProfilesService(db: Db) {
  const repo = profilesRepo(db);
  return {
    list: (familyId: string): Promise<Profile[]> => repo.list(familyId),

    async get(id: string): Promise<Profile> {
      const row = await repo.find(id);
      if (!row) throw notFound(PROFILE_NOT_FOUND);
      return toProfile(row);
    },

    /** Profil s'il appartient à la famille (temps réel : refus plutôt qu'erreur). */
    async findInFamily(id: string, familyId: string): Promise<Profile | undefined> {
      const row = await repo.find(id);
      return row?.familyId === familyId ? toProfile(row) : undefined;
    },

    async create(input: ProfileCreate, familyId: string): Promise<Profile> {
      return toProfile(await repo.insert({ ...input, rubies: STARTING_RUBIES, familyId }));
    },

    /**
     * Modifie un profil. L'enfant peut changer ses réglages (son, héros…) ; l'identité (prénom,
     * date de naissance, classe, genre) demande le déverrouillage parent.
     */
    async update(id: string, patch: ProfileUpdate, actor: Actor): Promise<Profile> {
      if (!actor.parent && IDENTITY_FIELDS.some((f) => patch[f] !== undefined)) {
        throw new AppError('FORBIDDEN', 'Action réservée au parent : confirme le mot de passe du compte.');
      }
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
