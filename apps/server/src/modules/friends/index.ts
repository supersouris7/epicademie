/**
 * Module « amis » : codes amis et amitiés entre familles (double validation : ami + parents).
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createFriendsService, type FriendsService } from './friends.service.ts';
export { friendsRoutes } from './friends.routes.ts';
