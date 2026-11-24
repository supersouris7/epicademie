import type { FastifyInstance } from 'fastify';
import { api } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { EvaluationService } from './evaluation.service.ts';

/**
 * Routes HTTP de l'Arène d'évaluation : chaque route vérifie que le profil (ou l'épreuve, via son
 * profil) appartient à la famille connectée (autre famille : 404), puis appelle le service.
 */
export function evaluationRoutes(service: EvaluationService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.evaluationHome, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.home(params.id, params.subject);
    });
    route(app, api.evaluationHistory, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.history(params.id, params.subject);
    });
    route(app, api.studiedChapters, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.studied(params.id, params.subject);
    });
    route(app, api.saveStudiedChapters, async ({ params, body, actor }) => {
      await owns.profile(actor(), params.id);
      await service.saveStudied(params.id, params.subject, body);
    });
    route(app, api.evaluationSummary, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.summary(params.id);
    });
    route(app, api.startEvaluation, async ({ body, actor }) => {
      await owns.profile(actor(), body.profileId);
      return service.start(body);
    });
    route(app, api.evaluationNext, async ({ params, actor }) => {
      await owns.evaluation(actor(), params.id);
      return service.next(params.id);
    });
    route(app, api.answerEvaluation, async ({ params, body, actor }) => {
      await owns.evaluation(actor(), params.id);
      return service.answer(params.id, body);
    });
    route(app, api.chooseAdvanced, async ({ params, body, actor }) => {
      await owns.evaluation(actor(), params.id);
      await service.chooseAdvanced(params.id, body.accept);
    });
    route(app, api.finishEvaluation, async ({ params, actor }) => {
      await owns.evaluation(actor(), params.id);
      return service.finish(params.id);
    });
    route(app, api.evaluationResult, async ({ params, actor }) => {
      await owns.evaluation(actor(), params.id);
      return service.result(params.id);
    });
    route(app, api.evaluationReview, async ({ params, actor }) => {
      await owns.evaluation(actor(), params.id);
      return service.review(params.id);
    });
  };
}
