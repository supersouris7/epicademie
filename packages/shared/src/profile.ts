import { z } from 'zod';

/** Styles DiceBear autorisés (licences libres, voir docs/CREDITS.md). */
export const AVATAR_STYLES = ['fun-emoji', 'big-ears', 'adventurer-neutral', 'pixelbot'] as const;
export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AvatarConfigSchema = z.object({
  style: z.enum(AVATAR_STYLES),
  seed: z.string().min(1).max(64),
  /** Coiffure (style big-ears uniquement), déduite du choix fille / garçon. */
  hair: z.enum(['long', 'short']).optional(),
});
export type AvatarConfig = z.infer<typeof AvatarConfigSchema>;

/** Héros jouables (illustrations : apps/web/public/assets/characters). Le héros se change à tout moment. */
export const HEROES = ['alex', 'zoe', 'leo', 'mia'] as const;
export type HeroId = (typeof HEROES)[number];
export const HERO_NAMES: Record<HeroId, string> = { alex: 'Alex', zoe: 'Zoé', leo: 'Léo', mia: 'Mia' };

export const ProfileNameSchema = z.string().trim().min(1, 'Le prénom est obligatoire').max(20, '20 caractères maximum');

export const GENDERS = ['fille', 'garcon'] as const;
export type Gender = (typeof GENDERS)[number];

/** Date de naissance AAAA-MM-JJ plausible (de 3 à 100 ans). */
export const BirthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
  .refine((d) => {
    const y = Number(d.slice(0, 4));
    const now = new Date().getFullYear();
    return !Number.isNaN(Date.parse(d)) && y >= now - 100 && y <= now - 3;
  }, 'Date de naissance invalide');

export const ProfileSchema = z.object({
  id: z.string(),
  name: ProfileNameSchema,
  avatar: AvatarConfigSchema,
  gender: z.enum(GENDERS).nullable(),
  birthDate: z.string().nullable(),
  hero: z.enum(HEROES),
  xp: z.number().int().nonnegative(),
  coins: z.number().int().nonnegative(),
  soundOn: z.boolean(),
  musicOn: z.boolean(),
  createdAt: z.string(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileCreateSchema = z.object({
  name: ProfileNameSchema,
  avatar: AvatarConfigSchema,
  gender: z.enum(GENDERS),
  birthDate: BirthDateSchema,
  hero: z.enum(HEROES).optional(),
});
export type ProfileCreate = z.infer<typeof ProfileCreateSchema>;

export const ProfileUpdateSchema = z
  .object({
    name: ProfileNameSchema,
    avatar: AvatarConfigSchema,
    gender: z.enum(GENDERS),
    birthDate: BirthDateSchema,
    hero: z.enum(HEROES),
    soundOn: z.boolean(),
    musicOn: z.boolean(),
  })
  .partial();
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/** Âge en années révolues à une date donnée (AAAA-MM-JJ). */
export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number) as [number, number, number];
  const [ty, tm, td] = today.split('-').map(Number) as [number, number, number];
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** Accord selon le genre du profil (masculin par défaut si non renseigné). */
export const accord = (gender: Gender | null | undefined, masculin: string, feminin: string) =>
  gender === 'fille' ? feminin : masculin;
