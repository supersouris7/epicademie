import { getSkill } from '@questeo/content';
import {
  RECOMMENDATION_PENDING_MAX,
  type FamilyRecommendation,
  type Recommendation,
  type RecommendationCreate,
  RecommendationCreateSchema,
} from '@questeo/shared';
import type { Db, Executor } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { badRequest, conflict, notFound } from '../../core/errors.ts';
import { disabledSkills } from '../pedagogy/index.ts';
import { recommendationsRepo, type RecommendationRow } from './recommendations.repo.ts';

/** Nombre de recommandations affichées au parent (les plus récentes). */
const FAMILY_LIMIT = 50;

const toRecommendation = (row: RecommendationRow): Recommendation => ({
  id: row.id,
  profileId: row.profileId,
  skillId: row.skillId,
  note: row.note,
  createdAt: row.createdAt.toISOString(),
});

/**
 * Recommandations de travail d'un parent à son enfant (#75). L'appelant (routes) a déjà vérifié que
 * le profil appartient à la famille connectée. Le mot du parent n'est jamais écrit dans les journaux :
 * aucune méthode ne le consigne et les erreurs levées ne le citent pas.
 */
export function createRecommendationsService({ db, clock }: { readonly db: Db; readonly clock: Clock }) {
  return {
    /** Ce que l'enfant voit : ses recommandations en attente, et rien d'autre. */
    async pending(profileId: string): Promise<Recommendation[]> {
      return (await recommendationsRepo(db).pendingOf(profileId)).map(toRecommendation);
    },

    /** Ce que le parent voit : en attente et faites, pour tous les enfants de sa famille. */
    async family(familyId: string): Promise<FamilyRecommendation[]> {
      const rows = await recommendationsRepo(db).ofFamily(familyId, FAMILY_LIMIT);
      return rows.map(({ row, profileName }) => ({
        ...toRecommendation(row),
        profileName,
        status: row.status,
        doneAt: row.status === 'faite' ? (row.closedAt?.toISOString() ?? null) : null,
        correct: row.correct,
        answered: row.answered,
      }));
    },

    async create(profileId: string, input: RecommendationCreate): Promise<Recommendation> {
      const { skillId, note } = RecommendationCreateSchema.parse(input);
      if (!getSkill(skillId)) throw badRequest('Notion inconnue');
      if ((await disabledSkills(db)).includes(skillId)) {
        throw conflict('Cette notion est en maintenance : choisis-en une autre.');
      }
      return db.transaction(async (tx) => {
        const repo = recommendationsRepo(tx);
        if (!(await repo.lockProfile(profileId))) throw notFound('Profil introuvable');
        const pending = await repo.pendingOf(profileId);
        if (pending.length >= RECOMMENDATION_PENDING_MAX) {
          throw conflict(`Déjà ${RECOMMENDATION_PENDING_MAX} recommandations en attente : annulez-en une d’abord.`);
        }
        if (pending.some((p) => p.skillId === skillId)) {
          throw conflict('Cette notion est déjà recommandée à cet enfant.');
        }
        const row = await repo.insert(profileId, skillId, note, clock.now());
        if (!row) throw new Error('insertion sans résultat');
        return toRecommendation(row);
      });
    },

    async cancel(profileId: string, id: string): Promise<void> {
      if (!(await recommendationsRepo(db).cancel(profileId, id, clock.now()))) {
        throw notFound('Recommandation introuvable ou déjà traitée');
      }
    },
  };
}

export type RecommendationsService = ReturnType<typeof createRecommendationsService>;

/**
 * Fin d'une série d'entraînement sur une seule notion : la recommandation en attente de cette notion
 * passe à « faite » avec le score. Appelée dans la transaction de fin de partie.
 */
export function completeRecommendation(
  tx: Executor,
  profileId: string,
  skillId: string,
  result: { readonly correct: number; readonly answered: number },
  now: Date,
): Promise<void> {
  return recommendationsRepo(tx).complete(profileId, skillId, result, now);
}
