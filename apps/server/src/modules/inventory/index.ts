/**
 * Module « inventaire » : objets de combat possédés, équipement, boutique.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { inventoryRepo, type InventoryRepo } from './inventory.repo.ts';
export { createShopService, type ShopService } from './shop.service.ts';
export { inventoryRoutes } from './inventory.routes.ts';
