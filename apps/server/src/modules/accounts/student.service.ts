import type { FamilyJoinResult, InviteResult, Me, StudentSignup, StudentSignupResult } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { AppError } from '../../core/errors.ts';
import type { Actor } from '../../core/http/auth.ts';
import { codeHash, newCode } from '../../core/auth/tokens.ts';
import { accountsRepo } from './accounts.repo.ts';

/**
 * Élève de moins de 15 ans : famille autonome sans donnée personnelle, code de récupération,
 * invitation et rattachement à un parent. Voir docs/adr/0026-eleve-autonome.md.
 */

/** Invitation d'un élève autonome : durée de validité (usage unique). */
export const INVITE_HOURS = 24;
/** Rattachement : erreurs de code permises avant blocage du compte, et durée du blocage. */
const JOIN_MAX_FAILURES = 5;
const JOIN_LOCK_HOURS = 1;
export const BAD_CODE = 'Ce code n’est pas valable : vérifie-le ou demande-en un nouveau.';

/** Session ouverte : jeton à poser en cookie (jamais renvoyé dans le corps) et vue « me ». */
export interface OpenedSession {
  readonly token: string;
  readonly me: Me;
}

export interface StudentDeps {
  readonly db: Db;
  readonly clock: Clock;
  /** Crée le profil de l'élève (module « profils ») dans la famille autonome. */
  readonly createStudentProfile: (
    input: Pick<StudentSignup, 'name' | 'avatar' | 'grade'>,
    familyId: string,
  ) => Promise<unknown>;
  /** Ouvre la session d'appareil d'un compte (jeton à poser en cookie). */
  readonly open: (a: {
    id: string;
    email: string | null;
    role: 'parent';
    familyId: string;
    autonomous: boolean;
  }) => Promise<OpenedSession>;
}

export function createStudentService({ db, clock, createStudentProfile, open }: StudentDeps) {
  const repo = accountsRepo(db);
  const later = (ms: number) => new Date(clock.now().getTime() + ms);
  return {
    /**
     * Élève de moins de 15 ans : famille autonome, compte sans e-mail ni mot de passe, profil
     * (pseudo, avatar, classe). L'âge n'est pas conservé. Le code de récupération n'est montré
     * qu'ici ; seule son empreinte est stockée.
     */
    async signupStudent({ name, avatar, grade }: StudentSignup): Promise<OpenedSession & StudentSignupResult> {
      const recoveryCode = newCode(16);
      const account = await db.transaction((tx) => accountsRepo(tx).createAutonomousAccount(codeHash(recoveryCode)));
      try {
        await createStudentProfile({ name, avatar, grade }, account.familyId);
      } catch (err) {
        await repo.deleteFamily(account.familyId);
        throw err;
      }
      const opened = await open({ ...account, autonomous: true });
      return { ...opened, recoveryCode };
    },

    /** Reconnexion d'un élève autonome avec son code de récupération. */
    async recoverStudent(code: string): Promise<OpenedSession> {
      const account = await repo.findByRecovery(codeHash(code));
      if (!account) throw new AppError('UNAUTHORIZED', BAD_CODE);
      return open({ ...account, autonomous: true });
    },

    /** Nouveau code de récupération (l'ancien cesse de fonctionner). */
    async renewRecovery(actor: Actor): Promise<string> {
      if (!actor.autonomous) throw new AppError('FORBIDDEN', 'Réservé aux comptes sans e-mail.');
      const recoveryCode = newCode(16);
      await repo.setRecovery(actor.accountId, codeHash(recoveryCode));
      return recoveryCode;
    },

    /** Code d'invitation (24 h, usage unique) à donner à un parent. Remplace le précédent. */
    async createInvite(actor: Actor): Promise<InviteResult> {
      if (!actor.autonomous) throw new AppError('FORBIDDEN', 'Ton compte est déjà rattaché à un parent.');
      const code = newCode(10);
      const expiresAt = later(INVITE_HOURS * 3_600_000);
      await repo.replaceInvite({ codeHash: codeHash(code), familyId: actor.familyId, expiresAt });
      return { code, expiresAt: expiresAt.toISOString() };
    },

    /**
     * Le parent saisit le code : les profils de la famille autonome rejoignent sa famille avec
     * toute leur progression, puis la famille autonome (compte, sessions) est supprimée.
     */
    async joinFamily(actor: Actor, code: string): Promise<FamilyJoinResult> {
      // Limite par compte parent (en plus de la limite par IP) : 5 erreurs d'affilée, 1 h de blocage.
      const now = clock.now();
      const account = await repo.findById(actor.accountId);
      if (account?.joinLockedUntil && account.joinLockedUntil > now) {
        throw new AppError('RATE_LIMITED', 'Trop d’essais : réessaie plus tard (dans moins d’une heure).');
      }
      const joined = await db.transaction(async (tx) => {
        const r = accountsRepo(tx);
        const invite = await r.findInviteForUpdate(codeHash(code), now);
        if (!invite) return null;
        const names = await r.moveProfiles(invite.familyId, actor.familyId);
        await r.deleteFamily(invite.familyId);
        return names;
      });
      // Hors transaction : le compteur d'échecs doit survivre à l'erreur renvoyée.
      if (!joined) {
        const failures = (account?.joinFailures ?? 0) + 1;
        const locked = failures >= JOIN_MAX_FAILURES ? later(JOIN_LOCK_HOURS * 3_600_000) : null;
        await repo.setJoinFailures(actor.accountId, locked ? 0 : failures, locked);
        throw new AppError('BAD_REQUEST', BAD_CODE);
      }
      await repo.setJoinFailures(actor.accountId, 0, null);
      return { joined };
    },
  };
}
