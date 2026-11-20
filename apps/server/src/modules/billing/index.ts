/**
 * Module « billing » (abonnement familial) : accès premium, paiement par année scolaire
 * (Stripe ou simulateur hors production), historique, contrôle d'accès aux chapitres payants.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { createBillingService, type BillingService } from './billing.service.ts';
export { billingRoutes } from './billing.routes.ts';
