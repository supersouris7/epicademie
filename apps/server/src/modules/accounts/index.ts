/**
 * Module « comptes » : familles, comptes parents, sessions d'appareil, déverrouillage parent,
 * réinitialisation du mot de passe, isolation des familles (`ownership`).
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createAccountsService, type AccountsService } from './accounts.service.ts';
export { accountsRoutes } from './accounts.routes.ts';
export { attachOrphanProfiles, setAccountRole } from './accounts.repo.ts';
export { createOwnership, type Ownership } from './ownership.ts';
