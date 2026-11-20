import { chapterOfAnySkill } from '@questeo/content';
import { learningReport } from '@questeo/engine';
import type { LearningReport } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { trainingRepo } from '../training/index.ts';
import { learningRepo } from './learning.repo.ts';

/** Profondeur de l'historique lu pour le suivi. */
const HISTORY_DAYS = 365;

/**
 * Suivi des apprentissages d'un joueur : rassemble ses réponses et sa répétition espacée, puis
 * calcule le rapport (règles pures dans @questeo/engine/learning).
 */
export function createLearningService({ db, clock, timeZone }: { db: Db; clock: Clock; timeZone: string }) {
  return {
    async report(profileId: string): Promise<LearningReport> {
      const since = new Date(clock.now().getTime() - HISTORY_DAYS * 86_400_000);
      const [facts, states] = await Promise.all([
        learningRepo(db).facts(profileId, since, timeZone),
        trainingRepo(db).skillStates(profileId),
      ]);
      return learningReport({
        facts,
        reviews: new Map(states.map((s) => [s.skillId, { stage: s.stage, due: s.due }])),
        placeOf: (skillId) => {
          const chapter = chapterOfAnySkill(skillId);
          return chapter && { chapterId: chapter.id, subject: chapter.subject };
        },
        today: clock.today(),
      });
    },
  };
}

export type LearningService = ReturnType<typeof createLearningService>;
