import {
  FRIEND_CODE_ALPHABET,
  type FamilyFriend,
  type Friend,
  type FriendsView,
  type FriendStatus,
} from '@epicademie/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { badRequest, conflict, notFound } from '../../core/errors.ts';
import { friendsRepo, type FriendshipRow } from './friends.repo.ts';

export interface FriendsDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly random: Random;
  /** Appelé quand les amitiés actives de ces profils changent (présence en temps réel). */
  readonly onChange?: (profileIds: readonly string[]) => void;
}

const NOT_FOUND = 'Aucun joueur avec ce code. Vérifie-le avec ton ami !';

/** L'autre profil d'une amitié. */
const otherOf = (row: FriendshipRow, me: string) => (row.profileA === me ? row.profileB : row.profileA);
/** Validation parentale du côté de ce profil. */
const parentOkOf = (row: FriendshipRow, me: string) => (row.profileA === me ? row.parentAAt : row.parentBAt) !== null;
export const isActive = (row: FriendshipRow) =>
  row.acceptedAt !== null && row.parentAAt !== null && row.parentBAt !== null;

function statusOf(row: FriendshipRow, me: string): FriendStatus {
  if (isActive(row)) return 'active';
  if (row.acceptedAt !== null) return 'parents';
  return row.requestedBy === me ? 'envoyee' : 'recue';
}

/**
 * Amis d'autres familles (décision du 21/11/2026) : code ami, demande, acceptation par l'ami,
 * puis validation par un parent de chaque famille. Les joueurs d'une même famille se voient déjà.
 */
export function createFriendsService({ db, clock, random, onChange }: FriendsDeps) {
  const repo = friendsRepo(db);

  /** Code ami du profil, créé à la première demande. */
  const codeOf = async (profileId: string): Promise<string> => {
    const me = await repo.profile(profileId);
    if (!me) throw notFound('Profil introuvable');
    if (me.friendCode) return me.friendCode;
    for (let tries = 0; tries < 20; tries++) {
      const code = Array.from(
        { length: 6 },
        () => FRIEND_CODE_ALPHABET[Math.floor(random.float() * FRIEND_CODE_ALPHABET.length)],
      ).join('');
      if (await repo.setCode(profileId, code)) return (await repo.profile(profileId))?.friendCode ?? code;
    }
    throw conflict('Impossible de créer un code ami pour le moment.');
  };

  const friendsOf = async (profileId: string): Promise<Friend[]> => {
    const rows = await repo.of([profileId]);
    const out: Friend[] = [];
    for (const row of rows) {
      const other = await repo.profile(otherOf(row, profileId));
      if (!other) continue;
      out.push({
        id: other.id,
        name: other.name,
        hero: other.hero,
        avatar: other.avatar,
        status: statusOf(row, profileId),
        myParentOk: parentOkOf(row, profileId),
      });
    }
    return out.sort((x, y) => x.name.localeCompare(y.name, 'fr'));
  };

  const view = async (profileId: string): Promise<FriendsView> => ({
    code: await codeOf(profileId),
    friends: await friendsOf(profileId),
  });

  /** Amitié existante entre les deux, sinon erreur. */
  const existing = async (me: string, friendId: string) => {
    const row = await repo.find(me, friendId);
    if (!row) throw notFound('Ce joueur n’est pas dans ta liste d’amis.');
    return row;
  };

  const familyView = async (familyId: string): Promise<FamilyFriend[]> => {
    const kids = await repo.profilesOfFamily(familyId);
    const out: FamilyFriend[] = [];
    for (const kid of kids) {
      for (const f of await friendsOf(kid.id)) out.push({ ...f, profileId: kid.id, profileName: kid.name });
    }
    return out;
  };

  return {
    view,
    familyView,

    async request(profileId: string, code: string): Promise<FriendsView> {
      const me = await repo.profile(profileId);
      if (!me) throw notFound('Profil introuvable');
      const target = await repo.byCode(code);
      if (!target) throw notFound(NOT_FOUND);
      if (target.id === profileId) throw badRequest('C’est ton propre code : donne-le à ton ami !');
      if (target.familyId === me.familyId)
        throw badRequest('Ce joueur est de ta famille : il est déjà dans tes joueurs connectés.');
      if (await repo.find(profileId, target.id)) throw conflict('Vous êtes déjà amis, ou la demande est en cours.');
      await repo.insert(profileId, target.id, clock.now());
      return view(profileId);
    },

    async accept(profileId: string, friendId: string): Promise<FriendsView> {
      const row = await existing(profileId, friendId);
      if (row.requestedBy === profileId) throw badRequest('C’est à ton ami d’accepter ta demande.');
      if (row.acceptedAt === null) await repo.update(profileId, friendId, { acceptedAt: clock.now() });
      return view(profileId);
    },

    async remove(profileId: string, friendId: string): Promise<FriendsView> {
      const row = await existing(profileId, friendId);
      await repo.remove(profileId, friendId);
      if (isActive(row)) onChange?.([profileId, friendId]);
      return view(profileId);
    },

    /** Validation par un parent de la famille de `profileId` (l'appelant a vérifié l'accès). */
    async approve(familyId: string, profileId: string, friendId: string): Promise<FamilyFriend[]> {
      const row = await existing(profileId, friendId);
      if (row.acceptedAt === null) throw badRequest('L’ami doit d’abord accepter la demande.');
      await repo.update(
        profileId,
        friendId,
        row.profileA === profileId ? { parentAAt: clock.now() } : { parentBAt: clock.now() },
      );
      const after = await repo.find(profileId, friendId);
      if (after && isActive(after)) onChange?.([profileId, friendId]);
      return familyView(familyId);
    },

    /** Joueurs avec qui se comparer : sa famille (lui compris) et ses amis actifs. */
    async peersOf(profileId: string, familyId: string): Promise<{ id: string; friend: boolean }[]> {
      const family = (await repo.profilesOfFamily(familyId)).map((p) => ({ id: p.id, friend: false }));
      const rows = (await repo.of([profileId])).filter(isActive);
      return [...family, ...rows.map((r) => ({ id: otherOf(r, profileId), friend: true }))];
    },

    /** Amis actifs d'un profil (présence, messages, invitations). */
    async activeIds(profileId: string): Promise<string[]> {
      return (await repo.of([profileId])).filter(isActive).map((r) => otherOf(r, profileId));
    },
  };
}

export type FriendsService = ReturnType<typeof createFriendsService>;
