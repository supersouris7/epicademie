/**
 * Module « combats » : combats de boss (état tenu par le serveur), boss vaincus, médailles,
 * équipement choisi avant combat.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { BATTLE_NOT_FOUND, createBattlesService, FIRST_WIN_CHEST, type BattlesService } from './battles.service.ts';
export { battlesRoutes } from './battles.routes.ts';
