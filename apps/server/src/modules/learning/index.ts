/**
 * Module « learning » (suivi des apprentissages) : progression par matière, chapitre et notion,
 * erreurs récurrentes, aides utilisées, évolution par semaine.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createLearningService } from './learning.service.ts';
export { learningRoutes } from './learning.routes.ts';
