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
import { ProfileCreateSchema, ProfileSchema, ProfileUpdateSchema } from '../profile.ts';

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
  readonly status: 200 | 201 | 204;
  readonly params?: TParams;
  readonly body?: TBody;
  readonly response: TResponse;
}

export const API_TAGS = ['systeme', 'profils', 'entrainement', 'combats', 'inventaire', 'telemetrie'] as const;
export type ApiTag = (typeof API_TAGS)[number];

const endpoint = <
  TParams extends z.ZodObject | undefined = undefined,
  TBody extends z.ZodType | undefined = undefined,
  TResponse extends z.ZodType | null = null,
>(
  e: Endpoint<TParams, TBody, TResponse>,
) => e;

export const IdParamsSchema = z.object({ id: z.uuid() });

/** Codes d'erreur stables (le message, lui, est destiné à l'affichage et peut changer). */
export const ERROR_CODES = [
  'BAD_REQUEST',
  'NOT_FOUND',
  'CONFLICT',
  'GONE',
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
  // ——— Système ———
  network: endpoint({
    method: 'GET',
    path: '/network',
    tag: 'systeme',
    summary: 'Adresse publique du serveur (QR code de connexion des appareils)',
    status: 200,
    response: z.object({ publicUrl: z.string().nullable() }),
  }),
  presence: endpoint({
    method: 'GET',
    path: '/presence',
    tag: 'systeme',
    summary: 'Profils ouverts sur un appareil (non sélectionnables ailleurs)',
    status: 200,
    response: z.object({ online: z.array(z.uuid()) }),
  }),

  // ——— Profils ———
  listProfiles: endpoint({
    method: 'GET',
    path: '/profiles',
    tag: 'profils',
    summary: 'Liste des profils, du plus ancien au plus récent',
    status: 200,
    response: z.array(ProfileSchema),
  }),
  getProfile: endpoint({
    method: 'GET',
    path: '/profiles/:id',
    tag: 'profils',
    summary: 'Un profil',
    status: 200,
    params: IdParamsSchema,
    response: ProfileSchema,
  }),
  createProfile: endpoint({
    method: 'POST',
    path: '/profiles',
    tag: 'profils',
    summary: 'Crée un profil',
    status: 201,
    body: ProfileCreateSchema,
    response: ProfileSchema,
  }),
  updateProfile: endpoint({
    method: 'PATCH',
    path: '/profiles/:id',
    tag: 'profils',
    summary: 'Modifie un profil (champs fournis seulement)',
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
    status: 204,
    params: IdParamsSchema,
    response: null,
  }),

  // ——— Entraînement ———
  listSkills: endpoint({
    method: 'GET',
    path: '/profiles/:id/skills',
    tag: 'entrainement',
    summary: 'Progression du profil par notion (répétition espacée, médailles)',
    status: 200,
    params: IdParamsSchema,
    response: z.array(SkillProgressSchema),
  }),
  startSession: endpoint({
    method: 'POST',
    path: '/sessions',
    tag: 'entrainement',
    summary: 'Commence une partie (hors combat de boss)',
    status: 201,
    body: SessionCreateSchema,
    response: SessionCreatedSchema,
  }),
  answerSession: endpoint({
    method: 'POST',
    path: '/sessions/:id/answers',
    tag: 'entrainement',
    summary: 'Corrige une réponse (le serveur régénère la question et fait foi)',
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
    status: 200,
    params: IdParamsSchema,
    response: BossOverviewSchema,
  }),
  startBattle: endpoint({
    method: 'POST',
    path: '/battles',
    tag: 'combats',
    summary: 'Lance un combat de boss',
    status: 201,
    body: BattleCreateSchema,
    response: BattleViewSchema,
  }),
  answerBattle: endpoint({
    method: 'POST',
    path: '/battles/:id/answers',
    tag: 'combats',
    summary: 'Répond à la question en cours du combat',
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
    status: 200,
    body: BuySchema,
    response: PurchaseSchema,
  }),

  // ——— Télémétrie ———
  reportClientError: endpoint({
    method: 'POST',
    path: '/telemetry/errors',
    tag: 'telemetrie',
    summary: 'Remonte une erreur survenue dans le navigateur',
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
