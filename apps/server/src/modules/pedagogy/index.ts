/**
 * Module « pedagogy » (fiabilité pédagogique) : signalements de questions, état de validation
 * des notions, désactivation et relecture par l'administration, historique des décisions.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createPedagogyService } from './pedagogy.service.ts';
export { pedagogyRoutes } from './pedagogy.routes.ts';
export { disabledSkills } from './pedagogy.repo.ts';
