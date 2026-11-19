import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { BattlesService } from './battles.service.ts';

export function battlesRoutes(service: BattlesService) {
  return async (app: FastifyInstance) => {
    route(app, api.bossOverview, ({ params }) => service.overview(params.id));
    route(app, api.setEquipment, ({ params, body }) => service.equip(params.id, body.items));
    route(app, api.startBattle, ({ body }) => service.start(body.profileId, body.chapterId));
    route(app, api.answerBattle, ({ params, body }) => service.answer(params.id, body));
    route(app, api.useBattleItem, ({ params, body }) => service.useItem(params.id, body.item));
    route(app, api.finishBattle, ({ params }) => service.finish(params.id));
  };
}
