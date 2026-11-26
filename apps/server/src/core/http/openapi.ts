import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { API_TAGS } from '@epicademie/shared';

/**
 * Documentation OpenAPI générée à partir du contrat (schémas Zod de `@epicademie/shared`).
 * - /api/openapi.json : la spécification (toujours disponible, utile aux outils) ;
 * - /api/docs : interface Swagger UI (activée par API_DOCS, par défaut hors production).
 */
const TAG_DESCRIPTIONS: Record<(typeof API_TAGS)[number], string> = {
  systeme: 'Santé, réseau, présence',
  comptes: 'Comptes familiaux, sessions, mot de passe',
  suivi: 'Suivi des apprentissages',
  contenus: 'Signalements de questions, notions désactivées',
  abonnement: 'Abonnement familial et paiements',
  admin: 'Administration (équipe, selon le rôle)',
  profils: 'Profils des joueurs',
  recommandations: 'Recommandations de travail d’un parent à son enfant',
  evaluation: 'Arène d’évaluation (épreuves, bilans, chapitres vus en classe)',
  entrainement: 'Parties d’entraînement et progression par notion',
  combats: 'Mode Histoire (combats de boss)',
  inventaire: 'Équipement et boutique',
  amis: 'Amis d’autres familles : code ami, demandes, validation par les parents',
  telemetrie: 'Erreurs remontées par le navigateur',
};

export async function registerOpenApi(app: FastifyInstance, options: { ui: boolean; version: string }): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Épicadémie — API',
        description:
          'API HTTP de Épicadémie. Erreurs : corps `{ code, error, requestId }`. ' +
          'Contrat source : packages/shared/src/api/contract.ts.',
        version: options.version,
      },
      tags: API_TAGS.map((name) => ({ name, description: TAG_DESCRIPTIONS[name] })),
    },
    transform: jsonSchemaTransform,
  });
  app.get('/api/openapi.json', { schema: { hide: true } }, () => app.swagger());
  if (options.ui) await app.register(swaggerUi, { routePrefix: '/api/docs', staticCSP: true });
}
