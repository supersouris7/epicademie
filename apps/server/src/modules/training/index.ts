/**
 * Module « entraînement » : parties hors boss, correction serveur, répétition espacée,
 * médailles par notion, gains de fin de partie.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createTrainingService, SESSION_NOT_FOUND, type TrainingService } from './training.service.ts';
export { trainingRoutes } from './training.routes.ts';
export { trainingRepo, type TrainingRepo } from './training.repo.ts';
