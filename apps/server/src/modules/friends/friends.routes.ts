import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { FriendsService } from './friends.service.ts';

/** Routes des amis (contrat : `api.*Friend*`). Le joueur doit être de la famille connectée. */
export function friendsRoutes(service: FriendsService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.friends, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.view(params.id);
    });
    route(app, api.requestFriend, async ({ params, body, actor }) => {
      await owns.profile(actor(), params.id);
      return service.request(params.id, body.code);
    });
    route(app, api.acceptFriend, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.accept(params.id, params.friendId);
    });
    route(app, api.removeFriend, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.remove(params.id, params.friendId);
    });
    // Espace parent (accès « parent » imposé par le contrat).
    route(app, api.familyFriends, ({ actor }) => service.familyView(actor().familyId));
    route(app, api.approveFriend, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.approve(actor().familyId, params.id, params.friendId);
    });
  };
}
