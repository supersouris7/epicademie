import type { Login, Me, Signup, StudentSignup } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { AppError, conflict } from '../../core/errors.ts';
import { AUTONOMOUS_MESSAGE, type Actor } from '../../core/http/auth.ts';
import { dummyHash, hashPassword, verifyPassword } from '../../core/auth/password.ts';
import { newToken, tokenHash } from '../../core/auth/tokens.ts';
import type { Mailer } from '../../core/mail/mailer.ts';
import { accountsRepo } from './accounts.repo.ts';
import { createStudentService, type OpenedSession } from './student.service.ts';

/**
 * Comptes familiaux : inscription, connexion, sessions d'appareil, déverrouillage parent,
 * réinitialisation du mot de passe. Voir docs/adr/0012-comptes-familiaux.md.
 */

/** Durée du déverrouillage parent après confirmation du mot de passe. */
export const PARENT_UNLOCK_MINUTES = 10;
/** Code PIN parent : erreurs d'affilée permises avant blocage, et durée du blocage. */
const PIN_MAX_FAILURES = 5;
const PIN_LOCK_MINUTES = 15;
/** Session d'administration : durée après confirmation du mot de passe. */
const ADMIN_SESSION_MINUTES = 15;
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
  /** Crée le profil de l'élève (module « profils ») dans la famille autonome. */
  readonly createStudentProfile: (
    input: Pick<StudentSignup, 'name' | 'avatar' | 'grade'>,
    familyId: string,
  ) => Promise<unknown>;
}

export type { OpenedSession };

export function createAccountsService({ db, clock, mailer, appUrl, sessionDays, createStudentProfile }: AccountsDeps) {
  const repo = accountsRepo(db);
  const later = (ms: number) => new Date(clock.now().getTime() + ms);

  const meOf = (
    a: {
      id: string;
      email: string | null;
      role: Me['account']['role'];
      familyId: string;
      autonomous: boolean;
      parentPinHash?: string | null;
    },
    parentUntil: Date | null,
    adminUntil: Date | null = null,
  ): Me => {
    const parent = parentUntil !== null && parentUntil > clock.now();
    const admin = a.role === 'admin' && adminUntil !== null && adminUntil > clock.now();
    return {
      account: { id: a.id, email: a.email, role: a.role },
      family: { id: a.familyId, autonomous: a.autonomous },
      parent,
      parentUntil: parent ? parentUntil.toISOString() : null,
      hasPin: Boolean(a.parentPinHash),
      adminUntil: admin ? adminUntil.toISOString() : null,
    };
  };

  /** Ouvre une session d'appareil. Après saisie du mot de passe, le parent est déverrouillé. */
  const open = async (a: Parameters<typeof meOf>[0]): Promise<OpenedSession> => {
    const token = newToken();
    // Élève autonome : jamais de déverrouillage parent (aucun parent n'est rattaché).
    const parentUntil = a.autonomous ? null : later(PARENT_UNLOCK_MINUTES * MINUTE);
    await repo.createSession({
      tokenHash: tokenHash(token),
      accountId: a.id,
      expiresAt: later(sessionDays * DAY),
      parentUntil,
    });
    return { token, me: meOf(a, parentUntil) };
  };

  /** Vrai si le mot de passe correspond ; faux pour un compte sans mot de passe (élève autonome). */
  const passwordMatches = async (hash: string | null, password: string): Promise<boolean> =>
    hash !== null && (await verifyPassword(password, hash));

  /** Les actions parent n'existent pas tant qu'aucun parent n'a rattaché le compte. */
  const refuseAutonomous = (actor: Actor): void => {
    if (actor.autonomous) throw new AppError('FORBIDDEN', AUTONOMOUS_MESSAGE);
  };

  const student = createStudentService({ db, clock, createStudentProfile, open });

  return {
    ...student,
    async signup({ email, password }: Signup): Promise<OpenedSession> {
      if (await repo.findByEmail(email)) throw conflict('Un compte existe déjà avec cette adresse : connecte-toi.');
      const hash = await hashPassword(password);
      const account = await db.transaction((tx) => accountsRepo(tx).createFamilyAccount(email, hash));
      return open({ ...account, autonomous: false });
    },

    async login({ email, password }: Login): Promise<OpenedSession> {
      const account = await repo.findByEmail(email);
      // Même travail si le compte n'existe pas : le temps de réponse ne trahit rien.
      const ok = await verifyPassword(password, account?.passwordHash ?? (await dummyHash()));
      if (!account?.passwordHash || !ok) throw new AppError('UNAUTHORIZED', BAD_CREDENTIALS);
      return open({ ...account, autonomous: false });
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
        autonomous: s.autonomous,
        role: s.role,
        parentUntil: s.parentUntil,
        parent: s.parentUntil !== null && s.parentUntil > now,
        adminUntil: s.adminUntil,
        admin: s.role === 'admin' && s.adminUntil !== null && s.adminUntil > now,
        sessionHash: s.tokenHash,
      };
    },

    async me(actor: Actor): Promise<Me> {
      const account = await repo.findById(actor.accountId);
      return meOf(
        {
          id: actor.accountId,
          email: actor.email,
          role: actor.role,
          familyId: actor.familyId,
          autonomous: actor.autonomous,
          ...account,
        },
        actor.parentUntil,
        actor.adminUntil,
      );
    },

    /** Choisit ou change le code PIN parent : le mot de passe du compte est demandé. */
    async setParentPin(actor: Actor, password: string, pin: string): Promise<Me> {
      refuseAutonomous(actor);
      const account = await repo.findById(actor.accountId);
      if (!account || !(await passwordMatches(account.passwordHash, password))) {
        throw new AppError('UNAUTHORIZED', 'Mot de passe incorrect.');
      }
      await repo.setParentPin(account.id, await hashPassword(pin));
      return meOf({ ...account, autonomous: false, parentPinHash: 'défini' }, actor.parentUntil);
    },

    /** Ouvre l'Espace parent avec le PIN ; 5 erreurs d'affilée bloquent le PIN 15 minutes. */
    async unlockParentPin(actor: Actor, pin: string): Promise<Me> {
      refuseAutonomous(actor);
      const account = await repo.findById(actor.accountId);
      if (!account?.parentPinHash)
        throw new AppError('CONFLICT', 'Aucun code PIN : utilise le mot de passe du compte.');
      if (account.pinLockedUntil && account.pinLockedUntil > clock.now()) {
        throw new AppError('UNAUTHORIZED', 'Trop d’erreurs : réessaie dans 15 minutes, ou utilise le mot de passe.');
      }
      if (!(await verifyPassword(pin, account.parentPinHash))) {
        const failures = account.pinFailures + 1;
        const locked = failures >= PIN_MAX_FAILURES ? later(PIN_LOCK_MINUTES * MINUTE) : null;
        await repo.setPinFailures(account.id, locked ? 0 : failures, locked);
        throw new AppError(
          'UNAUTHORIZED',
          locked ? 'Trop d’erreurs : le code PIN est bloqué 15 minutes.' : 'Code PIN incorrect.',
        );
      }
      await repo.setPinFailures(account.id, 0, null);
      const until = later(PARENT_UNLOCK_MINUTES * MINUTE);
      await repo.setParentUntil(actor.sessionHash, until);
      return meOf({ ...account, autonomous: false }, until);
    },

    /** Ouvre une session d'administration (compte admin) : mot de passe redemandé, 15 minutes. */
    async openAdmin(actor: Actor, password: string): Promise<Me> {
      const account = await repo.findById(actor.accountId);
      if (account?.role !== 'admin') throw new AppError('FORBIDDEN', 'Accès réservé à l’administration.');
      if (!(await passwordMatches(account.passwordHash, password))) {
        throw new AppError('UNAUTHORIZED', 'Mot de passe incorrect.');
      }
      const until = later(ADMIN_SESSION_MINUTES * MINUTE);
      await repo.setAdminUntil(actor.sessionHash, until);
      return meOf({ ...account, autonomous: false }, actor.parentUntil, until);
    },

    /** Ferme la session d'administration. */
    async closeAdmin(actor: Actor): Promise<Me> {
      await repo.setAdminUntil(actor.sessionHash, null);
      return this.me({ ...actor, admin: false, adminUntil: null });
    },

    /** Quitte l'Espace parent : les actions parent sont de nouveau verrouillées sur cet appareil. */
    async lockParent(actor: Actor): Promise<Me> {
      await repo.setParentUntil(actor.sessionHash, null);
      return this.me({ ...actor, parentUntil: null, parent: false });
    },

    /** Le parent confirme son mot de passe : actions parent permises quelques minutes. */
    async confirmParent(actor: Actor, password: string): Promise<Me> {
      refuseAutonomous(actor);
      const account = await repo.findById(actor.accountId);
      if (!account || !(await passwordMatches(account.passwordHash, password))) {
        throw new AppError('UNAUTHORIZED', 'Mot de passe incorrect.');
      }
      const until = later(PARENT_UNLOCK_MINUTES * MINUTE);
      await repo.setParentUntil(actor.sessionHash, until);
      return meOf({ ...account, autonomous: false }, until);
    },

    /** Envoie un lien de réinitialisation ; ne dit jamais si l'adresse existe. */
    async forgotPassword(email: string): Promise<void> {
      const account = await repo.findByEmail(email);
      if (!account?.email) return;
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
