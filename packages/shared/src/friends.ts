import { z } from 'zod';
import { AvatarConfigSchema, HEROES } from './profile.ts';

/**
 * Amis d'autres familles (décision du 21/11/2026). Chaque joueur a un code ami, à se donner en
 * vrai. Une amitié devient active quand l'ami a accepté ET qu'un parent de chaque famille l'a
 * validée dans l'Espace parent. Un ami actif est traité comme un joueur de la famille en temps
 * réel : présence, messages prédéfinis (jamais de texte libre), invitations dans l'arène.
 */

/** Code ami : 6 caractères sans ambiguïté (pas de 0/O, 1/I/L). */
export const FRIEND_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const FriendCodeSchema = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .pipe(z.string().length(6, 'Un code ami a 6 caractères.'));

/**
 * Où en est l'amitié, vue par un joueur :
 * - `envoyee` : j'ai demandé, l'ami n'a pas encore accepté ;
 * - `recue` : on me demande, à moi d'accepter ;
 * - `parents` : acceptée, en attente de la validation des parents ;
 * - `active` : amis.
 */
export const FRIEND_STATUSES = ['envoyee', 'recue', 'parents', 'active'] as const;
export type FriendStatus = (typeof FRIEND_STATUSES)[number];

export const FriendSchema = z.object({
  id: z.string(),
  name: z.string(),
  hero: z.enum(HEROES),
  avatar: AvatarConfigSchema,
  status: z.enum(FRIEND_STATUSES),
  /** Le parent de ce joueur a déjà validé (utile tant que le statut est `parents`). */
  myParentOk: z.boolean(),
});
export type Friend = z.infer<typeof FriendSchema>;

export const FriendsViewSchema = z.object({
  code: z.string(),
  friends: z.array(FriendSchema).readonly(),
});
export type FriendsView = z.infer<typeof FriendsViewSchema>;

export const FriendRequestSchema = z.object({ code: FriendCodeSchema });

/** Espace parent : les amitiés des enfants de la famille. */
export const FamilyFriendSchema = FriendSchema.extend({
  /** Enfant de la famille concerné. */
  profileId: z.string(),
  profileName: z.string(),
});
export type FamilyFriend = z.infer<typeof FamilyFriendSchema>;
