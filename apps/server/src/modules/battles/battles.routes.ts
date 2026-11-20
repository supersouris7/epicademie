import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import { BATTLE_NOT_FOUND, type BattlesService } from './battles.service.ts';

/**
 * Routes HTTP des combats de boss : vérifient que le profil ou le combat désignés appartiennent
 * à la famille connectée, puis appellent le service (aucune règle métier ici).
 */
export function battlesRoutes(service: BattlesService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.bossOverview, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.overview(params.id);
    });
    route(app, api.setEquipment, async ({ params, body, actor }) => {
      await owns.profile(actor(), params.id);
      return service.equip(params.id, body.items);
    });
    route(app, api.startBattle, async ({ body, actor }) => {
      await owns.profile(actor(), body.profileId);
      return service.start(body.profileId, body.chapterId);
    });
    route(app, api.answerBattle, async ({ params, body, actor }) => {
      await owns.game(actor(), params.id, BATTLE_NOT_FOUND);
      return service.answer(params.id, body);
    });
    route(app, api.useBattleItem, async ({ params, body, actor }) => {
      await owns.game(actor(), params.id, BATTLE_NOT_FOUND);
      return service.useItem(params.id, body.item);
    });
    route(app, api.finishBattle, async ({ params, actor }) => {
      await owns.game(actor(), params.id, BATTLE_NOT_FOUND);
      return service.finish(params.id);
    });
  };
}
