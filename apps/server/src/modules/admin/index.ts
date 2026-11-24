/**
 * Module « administration » : consultation des comptes par l'opérateur du frontal de pilotage,
 * mot de passe temporaire, journal d'audit (docs/adr/0033-…). API publique du module.
 */
export { createAdminService } from './admin.service.ts';
export { adminRoutes } from './admin.routes.ts';
