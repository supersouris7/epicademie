import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ProfileCreateSchema, ProfileUpdateSchema } from '@questeo/shared';
import type { ProfilesRepo } from '../db/profiles-repo.ts';

const IdParams = z.object({ id: z.uuid() });

export const profileRoutes =
  (repo: ProfilesRepo): FastifyPluginAsync =>
  async (app) => {
    app.get('/profiles', async () => repo.list());

    app.get('/profiles/:id', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      const profile = params.success ? repo.get(params.data.id) : undefined;
      return profile ?? reply.code(404).send({ error: 'Profil introuvable' });
    });

    app.post('/profiles', async (req, reply) => {
      const body = ProfileCreateSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return reply.code(201).send(repo.create(body.data));
    });

    app.patch('/profiles/:id', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Profil introuvable' });
      const body = ProfileUpdateSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return repo.update(params.data.id, body.data) ?? reply.code(404).send({ error: 'Profil introuvable' });
    });

    app.delete('/profiles/:id', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      const removed = params.success && repo.remove(params.data.id);
      return removed ? reply.code(204).send() : reply.code(404).send({ error: 'Profil introuvable' });
    });
  };
