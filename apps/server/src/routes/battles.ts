import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { z } from 'zod';
import { BattleAnswerSchema, BattleCreateSchema, BattleItemSchema, BuySchema, EquipmentSchema } from '@questeo/shared';
import type { BattleRepo } from '../db/battle-repo.ts';
import { PlayError } from '../db/play-repo.ts';

const IdParams = z.object({ id: z.uuid() });

function handle<T>(reply: FastifyReply, fn: () => T) {
  try {
    return fn();
  } catch (err) {
    if (err instanceof PlayError) return reply.code(err.status).send({ error: err.message });
    throw err;
  }
}

/** Combat de boss : l'état vit sur le serveur, le client affiche et envoie les réponses. */
export const battleRoutes =
  (repo: BattleRepo): FastifyPluginAsync =>
  async (app) => {
    app.get('/profiles/:id/bosses', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Profil introuvable' });
      return repo.overview(params.data.id);
    });

    app.put('/profiles/:id/equipment', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Profil introuvable' });
      const body = EquipmentSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return handle(reply, () => repo.equip(params.data.id, body.data.items));
    });

    app.post('/shop', async (req, reply) => {
      const body = BuySchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return handle(reply, () => repo.buy(body.data.profileId, body.data.item));
    });

    app.post('/battles', async (req, reply) => {
      const body = BattleCreateSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return handle(reply, () => reply.code(201).send(repo.start(body.data.profileId, body.data.chapterId)));
    });

    app.post('/battles/:id/answers', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Combat introuvable' });
      const body = BattleAnswerSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return handle(reply, () => repo.answer(params.data.id, body.data));
    });

    app.post('/battles/:id/items', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Combat introuvable' });
      const body = BattleItemSchema.safeParse(req.body);
      if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
      return handle(reply, () => repo.useItem(params.data.id, body.data.item));
    });

    app.post('/battles/:id/finish', async (req, reply) => {
      const params = IdParams.safeParse(req.params);
      if (!params.success) return reply.code(404).send({ error: 'Combat introuvable' });
      return handle(reply, () => repo.finish(params.data.id));
    });
  };
