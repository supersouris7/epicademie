import type { FastifyInstance } from 'fastify';
import { api } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import { badRequest } from '../../core/errors.ts';
import type { BillingService } from './billing.service.ts';
import { verifyStripeEvent } from './stripe.ts';

/** Routes de l'abonnement (contrat) et notification du prestataire de paiement. */
export function billingRoutes(service: BillingService, webhookSecret: string | null) {
  return async (app: FastifyInstance) => {
    route(app, api.billing, ({ actor }) => service.status(actor().familyId));
    route(app, api.checkout, ({ actor }) => service.checkout(actor().familyId));
    route(app, api.simulatePayment, ({ params, body, actor }) =>
      service.simulate(actor().familyId, params.id, body.outcome),
    );

    // Webhook Stripe : corps brut (la signature porte sur les octets reçus), hors contrat JSON.
    await app.register(async (hook) => {
      hook.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => done(null, body));
      hook.post('/billing/webhook/stripe', { schema: { hide: true } }, async (request, reply) => {
        if (!webhookSecret) return reply.code(404).send();
        const signature = request.headers['stripe-signature'];
        const event = verifyStripeEvent(
          String(request.body),
          typeof signature === 'string' ? signature : undefined,
          webhookSecret,
          Math.floor(Date.now() / 1000),
        );
        if (!event) throw badRequest('Signature de paiement invalide');
        await service.stripeEvent(event);
        return reply.code(200).send({ received: true });
      });
    });
  };
}
