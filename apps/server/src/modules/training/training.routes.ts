import type { FastifyInstance } from 'fastify';
import { api } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { BillingService } from '../billing/index.ts';
import type { TrainingService } from './training.service.ts';

/**
 * Routes HTTP de l'entraînement : vérifient que le profil ou la partie désignés appartiennent à
 * la famille connectée, puis appellent le service (aucune règle métier ici).
 */
export function trainingRoutes(service: TrainingService, owns: Ownership, billing: BillingService) {
  return async (app: FastifyInstance) => {
    route(app, api.listSkills, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.skills(params.id);
    });
    route(app, api.chapterTrophies, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.chapterTrophies(params.id);
    });
    route(app, api.startSession, async ({ body, actor }) => {
      await owns.profile(actor(), body.profileId);
      // Chapitre payant : abonnement familial requis (le 1er chapitre de chaque classe est gratuit).
      await billing.requireChapter(actor().familyId, body.chapterId);
      return service.start(body);
    });
    route(app, api.answerSession, async ({ params, body, actor }) => {
      await owns.game(actor(), params.id);
      // Révisions et séances ciblées mêlent des chapitres : contrôle notion par notion.
      await billing.requireSkill(actor().familyId, body.skillId);
      return service.answer(params.id, body);
    });
    route(app, api.markConfused, async ({ params, body, actor }) => {
      await owns.game(actor(), params.id);
      await service.confused(params.id, body.skillId);
    });
    route(app, api.rateSession, async ({ params, body, actor }) => {
      await owns.game(actor(), params.id);
      await service.rate(params.id, body.feeling);
    });
    route(app, api.finishSession, async ({ params, actor }) => {
      await owns.game(actor(), params.id);
      return service.finish(params.id);
    });
  };
}
