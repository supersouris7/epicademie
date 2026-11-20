/**
 * Module « pilotage » : statistiques agrégées, anomalies de récompenses, erreurs récentes
 * (administration). API publique du module (les autres modules n'importent que ce fichier).
 */
export { createInsightsService } from './insights.service.ts';
export { insightsRoutes } from './insights.routes.ts';
