import { z } from 'zod';
import { GRADES } from './grades.ts';
import { MODE_IDS } from './modes.ts';
import { REPORT_REASONS, REPORT_STATUSES } from './pedagogy.ts';
import { HEROES } from './profile.ts';
import { SUBJECT_IDS } from './subjects.ts';

/**
 * Administration par « opérateur » et consultation des comptes (docs/adr/0033-…). Toutes les
 * listes sont paginées côté serveur (25 par page) ; aucune empreinte, jeton ni secret n'y figure.
 */

export const ADMIN_PAGE_SIZE = 25;
/** Plus de 400 pages (10 000 lignes) : affiner la recherche plutôt que parcourir. */
export const ADMIN_MAX_PAGE = 400;

export const AdminSessionSchema = z.object({ operator: z.string() });
export type AdminSession = z.infer<typeof AdminSessionSchema>;

export const ACCOUNT_TYPES = ['tous', 'famille', 'autonome'] as const;
export const ACCOUNT_STATES = ['tous', 'verifie', 'non-verifie', 'abonne'] as const;
export const ACCOUNT_SORTS = ['creation', 'activite'] as const;
export const ACCOUNT_TYPE_LABELS = { tous: 'Tous', famille: 'Famille', autonome: 'Élève autonome' } as const;
export const ACCOUNT_STATE_LABELS = {
  tous: 'Tous',
  verifie: 'E-mail validé',
  'non-verifie': 'E-mail à valider',
  abonne: 'Abonnement actif',
} as const;

export const AccountSearchSchema = z.object({
  /** E-mail, identifiant de famille (début ou entier) ou prénom d'un profil, partiel, sans casse ni accents. */
  q: z.string().trim().max(100).default(''),
  type: z.enum(ACCOUNT_TYPES).default('tous'),
  state: z.enum(ACCOUNT_STATES).default('tous'),
  sort: z.enum(ACCOUNT_SORTS).default('creation'),
  order: z.enum(['desc', 'asc']).default('desc'),
  /** Numéro de page, à partir de 0. */
  page: z.number().int().min(0).max(ADMIN_MAX_PAGE).default(0),
});
export type AccountSearch = z.infer<typeof AccountSearchSchema>;

export const AccountRowSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  email: z.string().nullable(),
  type: z.enum(['famille', 'autonome']),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  lastActivityAt: z.string().nullable(),
  profileCount: z.number().int(),
  /** Trois prénoms au plus (aperçu). */
  profileNames: z.array(z.string()),
});
export type AccountRow = z.infer<typeof AccountRowSchema>;

export const AccountPageSchema = z.object({
  items: z.array(AccountRowSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  hasMore: z.boolean(),
});
export type AccountPage = z.infer<typeof AccountPageSchema>;

export const ADMIN_LOGIN_METHODS = ['mot-de-passe', 'google', 'code-recuperation'] as const;

export const AccountDetailSchema = z.object({
  account: z.object({
    id: z.uuid(),
    familyId: z.uuid(),
    email: z.string().nullable(),
    type: z.enum(['famille', 'autonome']),
    createdAt: z.string(),
    lastLoginAt: z.string().nullable(),
    lastActivityAt: z.string().nullable(),
    emailVerifiedAt: z.string().nullable(),
    /** Méthodes de connexion possibles (jamais d'empreinte ni de jeton). */
    methods: z.array(z.enum(ADMIN_LOGIN_METHODS)),
    hasPin: z.boolean(),
  }),
  profiles: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      hero: z.enum(HEROES),
      grade: z.enum(GRADES).nullable(),
      xp: z.number().int(),
      coins: z.number().int(),
      rubies: z.number().int(),
      createdAt: z.string(),
      lastActivityAt: z.string().nullable(),
      games: z.number().int(),
      answers: z.number().int(),
      correctAnswers: z.number().int(),
      skillsStudied: z.number().int(),
      skillsMastered: z.number().int(),
      heroesOwned: z.number().int(),
      bossWins: z.number().int(),
      /** Objets de combat possédés (résumé). */
      items: z.array(z.object({ item: z.string(), count: z.number().int() })),
    }),
  ),
  recentGames: z.array(
    z.object({
      profileName: z.string(),
      mode: z.enum(MODE_IDS),
      subject: z.enum(SUBJECT_IDS),
      chapterId: z.string(),
      startedAt: z.string(),
      answered: z.number().int(),
      correct: z.number().int(),
    }),
  ),
  reports: z.array(
    z.object({
      id: z.uuid(),
      skillId: z.string().nullable(),
      reason: z.enum(REPORT_REASONS),
      status: z.enum(REPORT_STATUSES),
      comment: z.string().nullable(),
      createdAt: z.string(),
    }),
  ),
  /** Démarches en cours (liens envoyés, rattachement) ; la suppression de compte est immédiate. */
  pending: z.object({
    invitation: z.boolean(),
    passwordReset: z.boolean(),
    emailVerification: z.boolean(),
  }),
  subscriptions: z.array(
    z.object({
      status: z.string(),
      offer: z.string(),
      amountCents: z.number().int(),
      currency: z.string(),
      periodEnd: z.string(),
      paidAt: z.string().nullable(),
      provider: z.string(),
    }),
  ),
});
export type AccountDetail = z.infer<typeof AccountDetailSchema>;

export const TemporaryPasswordSchema = z.object({ password: z.string(), sessionsClosed: z.number().int() });
export type TemporaryPassword = z.infer<typeof TemporaryPasswordSchema>;

export const AuditSearchSchema = z.object({ page: z.number().int().min(0).max(ADMIN_MAX_PAGE).default(0) });
export const AUDIT_ACTIONS = ['consultation', 'reinitialisation-mot-de-passe'] as const;
export const AUDIT_ACTION_LABELS = {
  consultation: 'Consultation de la fiche',
  'reinitialisation-mot-de-passe': 'Mot de passe réinitialisé',
} as const;
export const AuditPageSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int(),
      at: z.string(),
      operator: z.string(),
      action: z.enum(AUDIT_ACTIONS),
      accountId: z.uuid(),
    }),
  ),
  page: z.number().int(),
  hasMore: z.boolean(),
});
export type AuditPage = z.infer<typeof AuditPageSchema>;
