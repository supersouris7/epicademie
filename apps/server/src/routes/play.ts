import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AnswerSubmitSchema, SessionCreateSchema } from '@questeo/shared';
import { PlayError, type PlayRepo } from '../db/play-repo.ts';

const IdParams = z.object({ id: z.uuid() });

function handle<T>(reply: FastifyReply, fn: () => T) {
  try {
    return fn();
  } catch (err) {
    if (err instanceof PlayError) return reply.code(err.status).send({ error: err.message });
    throw err;
  }
}

export const playRoutes =
  (repo: PlayRepo): FastifyPluginAsync =>
  async (app) => {
    app.get('/profiles/:id/skills', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Profil introuvable' });
      return repo.skills(params.data.id);
    });

    app.post('/sessions', async (req, reply) => {
      const body = SessionCreateSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return handle(reply, () => reply.code(201).send(repo.start(body.data)));
    });

    app.post('/sessions/:id/answers', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Partie introuvable' });
      const body = AnswerSubmitSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return handle(reply, () => repo.answer(params.data.id, body.data));
    });

    app.post('/sessions/:id/finish', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Partie introuvable' });
      return handle(reply, () => repo.finish(params.data.id));
    });
  };
