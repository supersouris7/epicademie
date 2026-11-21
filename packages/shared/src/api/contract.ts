import { z } from 'zod';
import {
  BattleAnswerResultSchema,
  BattleAnswerSchema,
  BattleCreateSchema,
  BattleItemSchema,
  BattleSummarySchema,
  BattleViewSchema,
  BossOverviewSchema,
} from '../battle.ts';
import { BuySchema, EquipmentSchema, PurchaseSchema } from '../items.ts';
import {
  AnswerResultSchema,
  AnswerSubmitSchema,
  ConfusedSchema,
  SessionCreatedSchema,
  SessionCreateSchema,
  SessionSummarySchema,
  SkillProgressSchema,
} from '../play.ts';
import { HEROES, ProfileCreateSchema, ProfileSchema, ProfileUpdateSchema } from '../profile.ts';
import {
  LoginSchema,
  MeSchema,
  PasswordConfirmSchema,
  PasswordForgotSchema,
  PasswordResetSchema,
  SignupSchema,
} from '../account.ts';
import { BadgeProgressSchema, LearningReportSchema } from '../learning.ts';
import { BillingSchema, CheckoutSchema, SimulatePaymentSchema } from '../billing.ts';
import { AdminErrorSchema, AdminStatsSchema, AnomalySchema, WeakSkillStatSchema } from '../insights.ts';
import { FamilyFriendSchema, FriendRequestSchema, FriendsViewSchema } from '../friends.ts';
import {
  ContentEventSchema,
  ContentSkillSchema,
  ContentUpdateSchema,
  DisabledContentSchema,
  REPORT_STATUSES,
  ReportCreateSchema,
  ReportSchema,
  ReportUpdateSchema,
} from '../pedagogy.ts';

/**
 * Contrat de l'API HTTP v1 — source unique de vérité, partagée par le serveur et le client.
 *
 * Chaque point d'accès décrit sa méthode, son chemin (paramètres `:nom` à la Fastify), ses schémas
 * d'entrée (paramètres, corps) et de sortie. Le serveur s'en sert pour valider les entrées ET les
 * sorties et pour générer la documentation OpenAPI ; le client web en tire ses types.
 *
 * Règles d'évolution (voir docs/adr/0004-api-versionnee.md) :
 * - ajouter un champ optionnel ou un point d'accès : compatible, reste en v1 ;
 * - retirer ou renommer un champ, changer un type : nouvelle version (`/api/v2`).
 */

export const API_PREFIX = '/api/v1';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Qui peut appeler un point d'accès (vérifié par le serveur avant le gestionnaire) :
 * - `public` : tout le monde (connexion, inscription, télémétrie) ;
 * - `family` : un appareil connecté au compte de la famille (les enfants y jouent) ;
 * - `parent` : idem, mot de passe confirmé récemment (actions réservées au parent) ;
 * - `admin` : compte administrateur.
 * Les données d'une autre famille restent invisibles : le serveur vérifie aussi l'appartenance
 * de chaque profil, partie ou combat désigné (réponse 404 sinon).
 */
export const ACCESS_LEVELS = ['public', 'family', 'parent', 'admin'] as const;
export type Access = (typeof ACCESS_LEVELS)[number];

/** Point d'accès : `response` vaut `null` pour une réponse sans corps (204). */
export interface Endpoint<
  TParams extends z.ZodObject | undefined = z.ZodObject | undefined,
  TBody extends z.ZodType | undefined = z.ZodType | undefined,
  TResponse extends z.ZodType | null = z.ZodType | null,
> {
  readonly method: HttpMethod;
  readonly path: `/${string}`;
  /** Groupe de la documentation OpenAPI (= module serveur). */
  readonly tag: ApiTag;
  readonly summary: string;
  readonly access: Access;
  readonly status: 200 | 201 | 204;
  readonly params?: TParams;
  readonly body?: TBody;
  readonly response: TResponse;
}

export const API_TAGS = [
  'systeme',
  'comptes',
  'profils',
  'suivi',
  'contenus',
  'abonnement',
  'admin',
  'entrainement',
  'combats',
  'inventaire',
  'amis',
  'telemetrie',
] as const;
export type ApiTag = (typeof API_TAGS)[number];

const endpoint = <
  TParams extends z.ZodObject | undefined = undefined,
  TBody extends z.ZodType | undefined = undefined,
  TResponse extends z.ZodType | null = null,
>(
  e: Endpoint<TParams, TBody, TResponse>,
) => e;

export const IdParamsSchema = z.object({ id: z.uuid() });
export const FriendParamsSchema = z.object({ id: z.uuid(), friendId: z.uuid() });

/** Codes d'erreur stables (le message, lui, est destiné à l'affichage et peut changer). */
export const ERROR_CODES = [
  'BAD_REQUEST',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'GONE',
  'PREMIUM_REQUIRED',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
  'UNAUTHORIZED',
  'INTERNAL',
  'UNAVAILABLE',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

/** Corps de toute réponse d'erreur. */
export const ErrorBodySchema = z.object({
  code: z.enum(ERROR_CODES),
  /** Message en français, affichable tel quel à l'enfant ou au parent. */
  error: z.string(),
  /** Identifiant de la requête (à citer au support ; retrouvable dans les journaux). */
  requestId: z.string().optional(),
});
export type ErrorBody = z.infer<typeof ErrorBodySchema>;

/** Erreur côté navigateur remontée au serveur (aucune donnée personnelle). */
export const ClientErrorSchema = z.object({
  message: z.string().max(500),
  stack: z.string().max(4000).optional(),
  /** Chemin de la page (sans domaine ni paramètres). */
  path: z.string().max(200),
  release: z.string().max(40).optional(),
});
export type ClientError = z.infer<typeof ClientErrorSchema>;

export const api = {
  // ——— Comptes ———
  signup: endpoint({
    method: 'POST',
    path: '/auth/signup',
    tag: 'comptes',
    summary: 'Crée un compte parent et sa famille, et ouvre la session',
    access: 'public',
    status: 201,
    body: SignupSchema,
    response: MeSchema,
  }),
  login: endpoint({
    method: 'POST',
    path: '/auth/login',
    tag: 'comptes',
    summary: 'Ouvre une session (cookie HttpOnly)',
    access: 'public',
    status: 200,
    body: LoginSchema,
    response: MeSchema,
  }),
  logout: endpoint({
    method: 'POST',
    path: '/auth/logout',
    tag: 'comptes',
    summary: 'Ferme la session de cet appareil',
    access: 'public',
    status: 204,
    response: null,
  }),
  me: endpoint({
    method: 'GET',
    path: '/auth/me',
    tag: 'comptes',
    summary: 'Session courante (401 si aucune)',
    access: 'family',
    status: 200,
    response: MeSchema,
  }),
  confirmParent: endpoint({
    method: 'POST',
    path: '/auth/parent',
    tag: 'comptes',
    summary: 'Confirme le mot de passe : déverrouille les actions parent pour quelques minutes',
    access: 'family',
    status: 200,
    body: PasswordConfirmSchema,
    response: MeSchema,
  }),
  forgotPassword: endpoint({
    method: 'POST',
    path: '/auth/password/forgot',
    tag: 'comptes',
    summary: 'Envoie un lien de réinitialisation (réponse identique que l’adresse existe ou non)',
    access: 'public',
    status: 204,
    body: PasswordForgotSchema,
    response: null,
  }),
  resetPassword: endpoint({
    method: 'POST',
    path: '/auth/password/reset',
    tag: 'comptes',
    summary: 'Change le mot de passe avec le lien reçu ; ferme les autres sessions',
    access: 'public',
    status: 204,
    body: PasswordResetSchema,
    response: null,
  }),

  // ——— Système ———
  network: endpoint({
    method: 'GET',
    path: '/network',
    tag: 'systeme',
    summary: 'Adresse publique du serveur (QR code de connexion des appareils)',
    access: 'family',
    status: 200,
    response: z.object({ publicUrl: z.string().nullable() }),
  }),
  presence: endpoint({
    method: 'GET',
    path: '/presence',
    tag: 'systeme',
    summary: 'Profils ouverts sur un appareil (non sélectionnables ailleurs)',
    access: 'family',
    status: 200,
    response: z.object({ online: z.array(z.uuid()) }),
  }),

  // ——— Profils ———
  listProfiles: endpoint({
    method: 'GET',
    path: '/profiles',
    tag: 'profils',
    summary: 'Liste des profils, du plus ancien au plus récent',
    access: 'family',
    status: 200,
    response: z.array(ProfileSchema),
  }),
  getProfile: endpoint({
    method: 'GET',
    path: '/profiles/:id',
    tag: 'profils',
    summary: 'Un profil',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: ProfileSchema,
  }),
  createProfile: endpoint({
    method: 'POST',
    path: '/profiles',
    tag: 'profils',
    summary: 'Crée un profil',
    access: 'parent',
    status: 201,
    body: ProfileCreateSchema,
    response: ProfileSchema,
  }),
  updateProfile: endpoint({
    method: 'PATCH',
    path: '/profiles/:id',
    tag: 'profils',
    summary: 'Modifie un profil (champs fournis seulement)',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    body: ProfileUpdateSchema,
    response: ProfileSchema,
  }),
  deleteProfile: endpoint({
    method: 'DELETE',
    path: '/profiles/:id',
    tag: 'profils',
    summary: 'Supprime un profil et toute sa progression',
    access: 'parent',
    status: 204,
    params: IdParamsSchema,
    response: null,
  }),

  friends: endpoint({
    method: 'GET',
    path: '/profiles/:id/friends',
    tag: 'amis',
    summary: 'Code ami du joueur et ses amitiés (demandes, attente des parents, amis)',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: FriendsViewSchema,
  }),
  requestFriend: endpoint({
    method: 'POST',
    path: '/profiles/:id/friends',
    tag: 'amis',
    summary: 'Demande d’ami avec le code d’un joueur d’une autre famille',
    access: 'family',
    status: 201,
    params: IdParamsSchema,
    body: FriendRequestSchema,
    response: FriendsViewSchema,
  }),
  acceptFriend: endpoint({
    method: 'POST',
    path: '/profiles/:id/friends/:friendId/accept',
    tag: 'amis',
    summary: 'Accepte une demande d’ami reçue',
    access: 'family',
    status: 200,
    params: FriendParamsSchema,
    response: FriendsViewSchema,
  }),
  removeFriend: endpoint({
    method: 'DELETE',
    path: '/profiles/:id/friends/:friendId',
    tag: 'amis',
    summary: 'Refuse une demande ou retire un ami',
    access: 'family',
    status: 200,
    params: FriendParamsSchema,
    response: FriendsViewSchema,
  }),
  familyFriends: endpoint({
    method: 'GET',
    path: '/family/friends',
    tag: 'amis',
    summary: 'Espace parent : amitiés des enfants de la famille',
    access: 'parent',
    status: 200,
    response: z.array(FamilyFriendSchema),
  }),
  approveFriend: endpoint({
    method: 'POST',
    path: '/profiles/:id/friends/:friendId/approve',
    tag: 'amis',
    summary: 'Espace parent : valide une amitié de son enfant',
    access: 'parent',
    status: 200,
    params: FriendParamsSchema,
    response: z.array(FamilyFriendSchema),
  }),

  ownedHeroes: endpoint({
    method: 'GET',
    path: '/profiles/:id/heroes',
    tag: 'profils',
    summary: 'Acad-Héros de la collection du joueur (départ, puis trouvés dans les coffres)',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: z.object({ heroes: z.array(z.enum(HEROES)) }),
  }),

  // ——— Suivi des apprentissages ———
  learningReport: endpoint({
    method: 'GET',
    path: '/profiles/:id/learning',
    tag: 'suivi',
    summary: 'Suivi des apprentissages : états des notions, chapitres, matières, semaines',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: LearningReportSchema,
  }),

  badges: endpoint({
    method: 'GET',
    path: '/profiles/:id/badges',
    tag: 'suivi',
    summary: 'Badges du joueur : grade atteint et prochain objectif',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: z.array(BadgeProgressSchema),
  }),

  // ——— Entraînement ———
  listSkills: endpoint({
    method: 'GET',
    path: '/profiles/:id/skills',
    tag: 'entrainement',
    summary: 'Progression du profil par notion (répétition espacée, médailles)',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: z.array(SkillProgressSchema),
  }),
  startSession: endpoint({
    method: 'POST',
    path: '/sessions',
    tag: 'entrainement',
    summary: 'Commence une partie (hors combat de boss)',
    access: 'family',
    status: 201,
    body: SessionCreateSchema,
    response: SessionCreatedSchema,
  }),
  answerSession: endpoint({
    method: 'POST',
    path: '/sessions/:id/answers',
    tag: 'entrainement',
    summary: 'Corrige une réponse (le serveur régénère la question et fait foi)',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    body: AnswerSubmitSchema,
    response: AnswerResultSchema,
  }),
  markConfused: endpoint({
    method: 'POST',
    path: '/sessions/:id/confused',
    tag: 'entrainement',
    summary: '« Je n’ai pas compris » : la notion repassera « à revoir »',
    access: 'family',
    status: 204,
    params: IdParamsSchema,
    body: ConfusedSchema,
    response: null,
  }),
  finishSession: endpoint({
    method: 'POST',
    path: '/sessions/:id/finish',
    tag: 'entrainement',
    summary: 'Termine la partie : répétition espacée, XP, pièces, coffre',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: SessionSummarySchema,
  }),

  // ——— Combats de boss ———
  bossOverview: endpoint({
    method: 'GET',
    path: '/profiles/:id/bosses',
    tag: 'combats',
    summary: 'Boss vaincus, inventaire et équipement du profil',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: BossOverviewSchema,
  }),
  startBattle: endpoint({
    method: 'POST',
    path: '/battles',
    tag: 'combats',
    summary: 'Lance un combat de boss',
    access: 'family',
    status: 201,
    body: BattleCreateSchema,
    response: BattleViewSchema,
  }),
  answerBattle: endpoint({
    method: 'POST',
    path: '/battles/:id/answers',
    tag: 'combats',
    summary: 'Répond à la question en cours du combat',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    body: BattleAnswerSchema,
    response: BattleAnswerResultSchema,
  }),
  useBattleItem: endpoint({
    method: 'POST',
    path: '/battles/:id/items',
    tag: 'combats',
    summary: 'Utilise un objet équipé pendant le combat',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    body: BattleItemSchema,
    response: BattleViewSchema,
  }),
  finishBattle: endpoint({
    method: 'POST',
    path: '/battles/:id/finish',
    tag: 'combats',
    summary: 'Termine le combat : XP, pièces, médaille, coffre de 1re victoire',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    response: BattleSummarySchema,
  }),

  // ——— Inventaire ———
  setEquipment: endpoint({
    method: 'PUT',
    path: '/profiles/:id/equipment',
    tag: 'combats',
    summary: 'Équipe jusqu’à 3 objets de la réserve pour les prochains combats',
    access: 'family',
    status: 200,
    params: IdParamsSchema,
    body: EquipmentSchema,
    response: BossOverviewSchema,
  }),
  buy: endpoint({
    method: 'POST',
    path: '/shop',
    tag: 'inventaire',
    summary: 'Achète un objet ou un rubis avec des pièces',
    access: 'family',
    status: 200,
    body: BuySchema,
    response: PurchaseSchema,
  }),

  // ——— Contenus : signalements, désactivations ———
  reportQuestion: endpoint({
    method: 'POST',
    path: '/reports',
    tag: 'contenus',
    summary: 'Signale un problème sur une question (lu par l’administration)',
    access: 'family',
    status: 201,
    body: ReportCreateSchema,
    response: z.object({ id: z.uuid() }),
  }),
  disabledContent: endpoint({
    method: 'GET',
    path: '/content/disabled',
    tag: 'contenus',
    summary: 'Notions désactivées (le jeu ne les propose plus)',
    access: 'family',
    status: 200,
    response: DisabledContentSchema,
  }),

  // ——— Abonnement ———
  billing: endpoint({
    method: 'GET',
    path: '/billing',
    tag: 'abonnement',
    summary: 'Abonnement de la famille : accès, prix, historique des paiements',
    access: 'family',
    status: 200,
    response: BillingSchema,
  }),
  checkout: endpoint({
    method: 'POST',
    path: '/billing/checkout',
    tag: 'abonnement',
    summary: 'Commence le paiement de l’année scolaire (page du prestataire ou simulateur)',
    access: 'parent',
    status: 201,
    response: CheckoutSchema,
  }),
  simulatePayment: endpoint({
    method: 'POST',
    path: '/billing/simulate/:id',
    tag: 'abonnement',
    summary: 'Simulateur de paiement (hors production) : paiement accepté ou refusé',
    access: 'parent',
    status: 200,
    params: IdParamsSchema,
    body: SimulatePaymentSchema,
    response: BillingSchema,
  }),

  // ——— Administration ———
  adminStats: endpoint({
    method: 'GET',
    path: '/admin/stats',
    tag: 'admin',
    summary: 'Statistiques agrégées (aucune donnée personnelle)',
    access: 'admin',
    status: 200,
    response: AdminStatsSchema,
  }),
  adminWeakSkills: endpoint({
    method: 'GET',
    path: '/admin/weak-skills',
    tag: 'admin',
    summary: 'Notions les plus ratées (90 jours, anonyme : aucun nom d’enfant)',
    access: 'admin',
    status: 200,
    response: z.array(WeakSkillStatSchema),
  }),
  adminErrors: endpoint({
    method: 'GET',
    path: '/admin/errors',
    tag: 'admin',
    summary: 'Erreurs récentes regroupées (serveur, navigateur, temps réel)',
    access: 'admin',
    status: 200,
    response: z.array(AdminErrorSchema),
  }),
  adminAnomalies: endpoint({
    method: 'GET',
    path: '/admin/anomalies',
    tag: 'admin',
    summary: 'Anomalies de récompenses à vérifier (gains impossibles, rythme suspect)',
    access: 'admin',
    status: 200,
    response: z.array(AnomalySchema),
  }),
  adminReports: endpoint({
    method: 'GET',
    path: '/admin/reports/:status',
    tag: 'admin',
    summary: 'Signalements d’un état (du plus récent au plus ancien)',
    access: 'admin',
    status: 200,
    params: z.object({ status: z.enum(REPORT_STATUSES) }),
    response: z.array(ReportSchema),
  }),
  adminUpdateReport: endpoint({
    method: 'PATCH',
    path: '/admin/reports/:id',
    tag: 'admin',
    summary: 'Change l’état d’un signalement',
    access: 'admin',
    status: 200,
    params: IdParamsSchema,
    body: ReportUpdateSchema,
    response: ReportSchema,
  }),
  adminContent: endpoint({
    method: 'GET',
    path: '/admin/content',
    tag: 'admin',
    summary: 'Toutes les notions avec leur état de validation',
    access: 'admin',
    status: 200,
    response: z.array(ContentSkillSchema),
  }),
  adminUpdateContent: endpoint({
    method: 'PUT',
    path: '/admin/content/:skillId',
    tag: 'admin',
    summary: 'Désactive, réactive ou marque comme relue une notion (historique conservé)',
    access: 'admin',
    status: 200,
    params: z.object({ skillId: z.string().min(1).max(80) }),
    body: ContentUpdateSchema,
    response: ContentSkillSchema,
  }),
  adminContentHistory: endpoint({
    method: 'GET',
    path: '/admin/content/:skillId/history',
    tag: 'admin',
    summary: 'Historique pédagogique d’une notion (désactivations, relectures)',
    access: 'admin',
    status: 200,
    params: z.object({ skillId: z.string().min(1).max(80) }),
    response: z.array(ContentEventSchema),
  }),

  // ——— Télémétrie ———
  reportClientError: endpoint({
    method: 'POST',
    path: '/telemetry/errors',
    tag: 'telemetrie',
    summary: 'Remonte une erreur survenue dans le navigateur',
    access: 'public',
    status: 204,
    body: ClientErrorSchema,
    response: null,
  }),
} as const;

export type Api = typeof api;
export type EndpointName = keyof Api;
export type AnyEndpoint = Api[EndpointName];

type Present<S> = Exclude<S, undefined>;
type Input<S> = [Present<S>] extends [never]
  ? undefined
  : Present<S> extends z.ZodType
    ? z.input<Present<S>>
    : undefined;

/** Paramètres de chemin attendus par un point d'accès (`undefined` s'il n'en a pas). */
export type ParamsOf<E extends AnyEndpoint> = Input<E['params']>;
/** Corps attendu par un point d'accès (`undefined` s'il n'en a pas). */
export type BodyOf<E extends AnyEndpoint> = Input<E['body']>;
/** Réponse d'un point d'accès (`undefined` pour 204). */
export type ResponseOf<E extends AnyEndpoint> = E['response'] extends z.ZodType ? z.output<E['response']> : undefined;

/** Remplit les paramètres `:nom` d'un chemin. */
export function buildPath(path: string, params: Record<string, string> | undefined): string {
  return path.replace(/:([A-Za-z]+)/g, (_, key: string) => {
    const value = params?.[key];
    if (value === undefined) throw new Error(`Paramètre de chemin manquant : ${key}`);
    return encodeURIComponent(value);
  });
}
