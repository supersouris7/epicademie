import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { PedagogyService } from './pedagogy.service.ts';

/** Signalements par une famille : quelques-uns par minute suffisent. */
const REPORT_LIMIT = { rateLimit: { max: 10, timeWindow: '1 minute' } };

/** Routes des contenus (familles) et de leur administration (rôle administrateur, contrat). */
export function pedagogyRoutes(service: PedagogyService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(
      app,
      api.reportQuestion,
      async ({ body, actor }) => {
        await owns.profile(actor(), body.profileId);
        return service.report(body, actor().familyId);
      },
      { config: REPORT_LIMIT },
    );
    route(app, api.reportGeneral, ({ body, actor }) => service.reportGeneral(body, actor().familyId), {
      config: REPORT_LIMIT,
    });
    route(app, api.disabledContent, () => service.disabled());

    route(app, api.adminReports, ({ params }) => service.reports(params.status));
    route(app, api.adminUpdateReport, ({ params, body }) =>
      service.updateReport(params.id, body.status, body.adminNote),
    );
    route(app, api.adminContent, () => service.content());
    route(app, api.adminUpdateContent, ({ params, body, operator }) =>
      service.updateContent(params.skillId, body, operator()),
    );
    route(app, api.adminContentHistory, ({ params }) => service.history(params.skillId));
  };
}
