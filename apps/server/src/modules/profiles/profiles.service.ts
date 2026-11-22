import { STARTING_HEROES, type Profile, type ProfileCreate, type ProfileUpdate } from '@questeo/shared';
import type { Actor } from '../../core/http/auth.ts';
import type { Db } from '../../db/client.ts';
import { AppError, conflict, notFound } from '../../core/errors.ts';
import { profilesRepo, toProfile } from './profiles.repo.ts';

/** Rubis offerts à la création d'un profil. */
export const STARTING_RUBIES = 2;

export const PROFILE_NOT_FOUND = 'Profil introuvable';

/** Champs d'identité d'un enfant : seul le parent les change (prénom, naissance, classe, genre). */
const IDENTITY_FIELDS = ['name', 'birthDate', 'grade', 'gender'] as const;

/** Règles métier des profils. */
export function createProfilesService(db: Db) {
  const repo = profilesRepo(db);
  const createWithHeroes = (
    input: Omit<ProfileCreate, 'gender' | 'birthDate'> & Partial<Pick<ProfileCreate, 'gender' | 'birthDate'>>,
    familyId: string,
  ): Promise<Profile> =>
    db.transaction(async (tx) => {
      const r = profilesRepo(tx);
      const row = await r.insert({ ...input, rubies: STARTING_RUBIES, familyId });
      for (const hero of new Set([row.hero, ...STARTING_HEROES])) await r.addHero(row.id, hero, 'depart');
      return toProfile(row);
    });
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

    /** Nouveau profil : Alex et Lina débloqués d'emblée ; Lina portée par défaut pour une fille. */
    create: (input: ProfileCreate, familyId: string): Promise<Profile> => createWithHeroes(input, familyId),

    /** Profil d'un élève autonome (moins de 15 ans) : pseudo, avatar, classe ; ni genre ni naissance. */
    createStudent: (input: Pick<ProfileCreate, 'name' | 'avatar' | 'grade'>, familyId: string): Promise<Profile> =>
      createWithHeroes(input, familyId),

    heroes: (profileId: string) => repo.heroes(profileId),

    /**
     * Modifie un profil. L'enfant peut changer ses réglages (son, héros…) ; l'identité (prénom,
     * date de naissance, classe, genre) demande le déverrouillage parent.
     */
    async update(id: string, patch: ProfileUpdate, actor: Actor): Promise<Profile> {
      if (!actor.parent && IDENTITY_FIELDS.some((f) => patch[f] !== undefined)) {
        throw new AppError('FORBIDDEN', 'Action réservée au parent : confirme le mot de passe du compte.');
      }
      // Un Acad-Héros se porte seulement s'il est dans la collection (trouvé dans un coffre).
      if (patch.hero !== undefined && !(await repo.heroes(id)).includes(patch.hero)) {
        throw conflict('Ce héros n’est pas encore dans ta collection : trouve-le dans un coffre !');
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
