/**
 * Module « recommandations » : un parent recommande une notion à son enfant (avec un petit mot) ;
 * l'enfant la voit à l'accueil ; l'entraînement fait la marque « faite ».
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export {
  completeRecommendation,
  createRecommendationsService,
  type RecommendationsService,
} from './recommendations.service.ts';
export { recommendationsRoutes } from './recommendations.routes.ts';
