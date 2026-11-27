import { CHAPTERS, chapterOfAnySkill } from '@epicademie/content';
import { badgeProgress, learningReport } from '@epicademie/engine';
import type { BadgeProgress, LearningReport } from '@epicademie/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { trainingRepo } from '../training/index.ts';
import { learningRepo } from './learning.repo.ts';

/** Profondeur de l'historique lu pour le suivi. */
const HISTORY_DAYS = 365;

/**
 * Suivi des apprentissages d'un joueur : rassemble ses réponses et sa répétition espacée, puis
 * calcule le rapport (règles pures dans @epicademie/engine/learning).
 */
export function createLearningService({ db, clock, timeZone }: { db: Db; clock: Clock; timeZone: string }) {
  const service = {
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

    /** Badges : grade atteint et prochain objectif (conditions dans @epicademie/engine). */
    async badges(profileId: string): Promise<BadgeProgress[]> {
      const c = await learningRepo(db).badgeCounters(profileId, timeZone);
      const bronze = new Set(c.medals.filter((m) => m.best >= 3).map((m) => m.skillId));
      // Chapitre terminé : une médaille (bronze au moins) sur chacune de ses notions.
      const chapters = CHAPTERS.filter((ch) => ch.skills.length > 0 && ch.skills.every((s) => bronze.has(s.id))).length;
      return badgeProgress({
        boss: c.boss,
        parfait: c.perfect,
        perseverance: c.retries,
        chapitres: chapters,
        consolidees: c.medals.filter((m) => m.stage === 3).length,
        coffres: c.chests,
      });
    },
  };
  return service;
}

export type LearningService = ReturnType<typeof createLearningService>;
