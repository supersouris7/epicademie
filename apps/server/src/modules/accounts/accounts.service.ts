import type { Me, Signup, Login } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { AppError, conflict } from '../../core/errors.ts';
import type { Actor } from '../../core/http/auth.ts';
import { dummyHash, hashPassword, verifyPassword } from '../../core/auth/password.ts';
import { newToken, tokenHash } from '../../core/auth/tokens.ts';
import type { Mailer } from '../../core/mail/mailer.ts';
import { accountsRepo } from './accounts.repo.ts';

/**
 * Comptes familiaux : inscription, connexion, sessions d'appareil, déverrouillage parent,
 * réinitialisation du mot de passe. Voir docs/adr/0012-comptes-familiaux.md.
 */

/** Durée du déverrouillage parent après confirmation du mot de passe. */
export const PARENT_UNLOCK_MINUTES = 10;
/** Validité d'un lien de réinitialisation. */
export const RESET_LINK_MINUTES = 60;
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export const BAD_CREDENTIALS = 'E-mail ou mot de passe incorrect.';

export interface AccountsDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly mailer: Mailer;
  /** Adresse publique du site (liens envoyés par e-mail). */
  readonly appUrl: () => string;
  readonly sessionDays: number;
}

/** Session ouverte : jeton à poser en cookie (jamais renvoyé dans le corps) et vue « me ». */
export interface OpenedSession {
  readonly token: string;
  readonly me: Me;
}

export function createAccountsService({ db, clock, mailer, appUrl, sessionDays }: AccountsDeps) {
  const repo = accountsRepo(db);
  const later = (ms: number) => new Date(clock.now().getTime() + ms);

  const meOf = (
    a: { id: string; email: string; role: Me['account']['role']; familyId: string },
    parentUntil: Date | null,
  ): Me => {
    const parent = parentUntil !== null && parentUntil > clock.now();
    return {
      account: { id: a.id, email: a.email, role: a.role },
      family: { id: a.familyId },
      parent,
      parentUntil: parent ? parentUntil.toISOString() : null,
    };
  };

  /** Ouvre une session d'appareil. Après saisie du mot de passe, le parent est déverrouillé. */
  const open = async (a: Parameters<typeof meOf>[0]): Promise<OpenedSession> => {
    const token = newToken();
    const parentUntil = later(PARENT_UNLOCK_MINUTES * MINUTE);
    await repo.createSession({
      tokenHash: tokenHash(token),
      accountId: a.id,
      expiresAt: later(sessionDays * DAY),
      parentUntil,
    });
    return { token, me: meOf(a, parentUntil) };
  };

  return {
    async signup({ email, password }: Signup): Promise<OpenedSession> {
      if (await repo.findByEmail(email)) throw conflict('Un compte existe déjà avec cette adresse : connecte-toi.');
      const hash = await hashPassword(password);
      const account = await db.transaction((tx) => accountsRepo(tx).createFamilyAccount(email, hash));
      return open(account);
    },

    async login({ email, password }: Login): Promise<OpenedSession> {
      const account = await repo.findByEmail(email);
      // Même travail si le compte n'existe pas : le temps de réponse ne trahit rien.
      const ok = await verifyPassword(password, account?.passwordHash ?? (await dummyHash()));
      if (!account || !ok) throw new AppError('UNAUTHORIZED', BAD_CREDENTIALS);
      return open(account);
    },

    async logout(token: string | null): Promise<void> {
      if (token) await repo.deleteSession(tokenHash(token));
    },

    /**
     * Acteur d'un jeton de session, ou `null`. Session glissante : prolongée au plus une fois par
     * jour (pas une écriture par requête).
     */
    async resolve(token: string): Promise<Actor | null> {
      const now = clock.now();
      const s = await repo.findSession(tokenHash(token), now);
      if (!s) return null;
      const renewed = later(sessionDays * DAY);
      if (renewed.getTime() - s.expiresAt.getTime() > DAY) await repo.extendSession(s.tokenHash, renewed);
      return {
        accountId: s.accountId,
        familyId: s.familyId,
        email: s.email,
        role: s.role,
        parentUntil: s.parentUntil,
        parent: s.parentUntil !== null && s.parentUntil > now,
        sessionHash: s.tokenHash,
      };
    },

    me: (actor: Actor): Me =>
      meOf({ id: actor.accountId, email: actor.email, role: actor.role, familyId: actor.familyId }, actor.parentUntil),

    /** Le parent confirme son mot de passe : actions parent permises quelques minutes. */
    async confirmParent(actor: Actor, password: string): Promise<Me> {
      const account = await repo.findById(actor.accountId);
      if (!account || !(await verifyPassword(password, account.passwordHash))) {
        throw new AppError('UNAUTHORIZED', 'Mot de passe incorrect.');
      }
      const until = later(PARENT_UNLOCK_MINUTES * MINUTE);
      await repo.setParentUntil(actor.sessionHash, until);
      return meOf(account, until);
    },

    /** Envoie un lien de réinitialisation ; ne dit jamais si l'adresse existe. */
    async forgotPassword(email: string): Promise<void> {
      const account = await repo.findByEmail(email);
      if (!account) return;
      const token = newToken();
      await repo.createReset({
        tokenHash: tokenHash(token),
        accountId: account.id,
        expiresAt: later(RESET_LINK_MINUTES * MINUTE),
      });
      await mailer.send({
        to: account.email,
        subject: 'Academy Fighters : nouveau mot de passe',
        text:
          `Bonjour,\n\nPour choisir un nouveau mot de passe, ouvre ce lien (valable ${RESET_LINK_MINUTES} minutes) :\n` +
          `${appUrl()}/mot-de-passe/nouveau?jeton=${token}\n\n` +
          'Si tu n’as rien demandé, ignore ce message : ton mot de passe ne change pas.',
      });
    },

    /** Nouveau mot de passe par lien (usage unique) ; toutes les sessions du compte sont fermées. */
    async resetPassword(token: string, password: string): Promise<void> {
      const hash = await hashPassword(password);
      await db.transaction(async (tx) => {
        const r = accountsRepo(tx);
        const reset = await r.findResetForUpdate(tokenHash(token), clock.now());
        if (!reset) throw new AppError('BAD_REQUEST', 'Ce lien n’est plus valable : demande-en un nouveau.');
        await r.setPassword(reset.accountId, hash);
        await r.markResetUsed(reset.tokenHash, clock.now());
        await r.deleteSessionsOf(reset.accountId);
      });
    },
  };
}

export type AccountsService = ReturnType<typeof createAccountsService>;
