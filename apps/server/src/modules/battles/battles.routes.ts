import type { FastifyInstance } from 'fastify';
import { api } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { BillingService } from '../billing/index.ts';
import { BATTLE_NOT_FOUND, type BattlesService } from './battles.service.ts';

/**
 * Routes HTTP des combats de boss : vérifient que le profil ou le combat désignés appartiennent
 * à la famille connectée, puis appellent le service (aucune règle métier ici).
 */
export function battlesRoutes(service: BattlesService, owns: Ownership, billing: BillingService) {
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
      await billing.requireChapter(actor().familyId, body.chapterId);
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
    route(app, api.battleHint, async ({ params, actor }) => {
      await owns.game(actor(), params.id, BATTLE_NOT_FOUND);
      return service.hint(params.id);
    });
    route(app, api.finishBattle, async ({ params, actor }) => {
      await owns.game(actor(), params.id, BATTLE_NOT_FOUND);
      return service.finish(params.id);
    });
  };
}
