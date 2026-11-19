import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { TrainingService } from './training.service.ts';

export function trainingRoutes(service: TrainingService) {
  return async (app: FastifyInstance) => {
    route(app, api.listSkills, ({ params }) => service.skills(params.id));
    route(app, api.startSession, ({ body }) => service.start(body));
    route(app, api.answerSession, ({ params, body }) => service.answer(params.id, body));
    route(app, api.markConfused, ({ params, body }) => service.confused(params.id, body.skillId));
    route(app, api.finishSession, ({ params }) => service.finish(params.id));
  };
}
