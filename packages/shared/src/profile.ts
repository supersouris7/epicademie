import { z } from 'zod';

/** Styles DiceBear autorisés (licences libres, voir docs/CREDITS.md). */
export const AVATAR_STYLES = ['fun-emoji', 'adventurer-neutral', 'pixelbot'] as const;
export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AvatarConfigSchema = z.object({
  style: z.enum(AVATAR_STYLES),
  seed: z.string().min(1).max(64),
});
export type AvatarConfig = z.infer<typeof AvatarConfigSchema>;

export const THEMES = ['auto', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const ProfileNameSchema = z.string().trim().min(1, 'Le prénom est obligatoire').max(20, '20 caractères maximum');

export const ProfileSchema = z.object({
  id: z.string(),
  name: ProfileNameSchema,
  avatar: AvatarConfigSchema,
  xp: z.number().int().nonnegative(),
  coins: z.number().int().nonnegative(),
  theme: z.enum(THEMES),
  soundOn: z.boolean(),
  musicOn: z.boolean(),
  createdAt: z.string(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileCreateSchema = z.object({
  name: ProfileNameSchema,
  avatar: AvatarConfigSchema,
});
export type ProfileCreate = z.infer<typeof ProfileCreateSchema>;

export const ProfileUpdateSchema = z
  .object({
    name: ProfileNameSchema,
    avatar: AvatarConfigSchema,
    theme: z.enum(THEMES),
    soundOn: z.boolean(),
    musicOn: z.boolean(),
  })
  .partial();
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
