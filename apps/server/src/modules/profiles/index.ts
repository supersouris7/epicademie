/**
 * Module « profils » : création, lecture, modification, suppression des profils joueurs.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createProfilesService, PROFILE_NOT_FOUND, type ProfilesService } from './profiles.service.ts';
export { profilesRoutes } from './profiles.routes.ts';
export { profilesRepo } from './profiles.repo.ts';
