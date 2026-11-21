/**
 * Module « inventaire » : objets de combat possédés, équipement, boutique.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { inventoryRepo } from './inventory.repo.ts';
export { createShopService } from './shop.service.ts';
export { inventoryRoutes } from './inventory.routes.ts';
export { grantChest } from './chests.ts';
