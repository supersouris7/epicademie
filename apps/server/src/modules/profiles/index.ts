/**
 * Module « profils » : création, lecture, modification, suppression des profils joueurs.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createProfilesService, PROFILE_NOT_FOUND, STARTING_RUBIES, type ProfilesService } from './profiles.service.ts';
export { profilesRoutes } from './profiles.routes.ts';
export { profilesRepo, type ProfilesRepo, type Rewards } from './profiles.repo.ts';
