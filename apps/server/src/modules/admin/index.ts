/**
 * Module « administration » : connexion de l'équipe et rôles, consultation des comptes, mot de
 * passe temporaire, journal d'audit (docs/adr/0033-… et 0036-…). API publique du module.
 */
export { createAdminService } from './admin.service.ts';
export { adminRoutes } from './admin.routes.ts';
export { createAdminAuthService } from './admin-auth.service.ts';
export { adminAuthRoutes } from './admin-auth.routes.ts';
export { createOidc } from './oidc.ts';
