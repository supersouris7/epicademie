import type { Server } from 'socket.io';
import type { FastifyBaseLogger } from 'fastify';
import { z } from 'zod';
import {
  ArenaAnswerSchema,
  ArenaCreateSchema,
  ArenaRespondSchema,
  chatText,
  ChatSendSchema,
  REALTIME_REFUSALS,
  RealtimeAuthSchema,
  type ChatMessage,
  type ClientToServerEvents,
  type Profile,
  type ServerToClientEvents,
} from '@questeo/shared';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import type { ErrorReporter } from '../../core/observability/error-reporter.ts';
import type { Metrics } from '../../core/observability/metrics.ts';
import { createArenas } from './arena.ts';
import type { Presence, SocketData } from './presence.ts';
import { tokenBucket } from './rate-limiter.ts';

/**
 * Passerelle temps réel (socket.io) : authentifie la connexion, valide chaque message avec les
 * schémas de @questeo/shared, limite le débit, puis délègue à la présence et à l'arène.
 *
 * - Présence : un profil n'est ouvert que sur un seul appareil (2e connexion refusée).
 * - Messages : prédéfinis ou emoji seulement (pas de texte libre : sûr pour des enfants).
 * - Arène : invitation, puis tour par tour.
 */
export interface RealtimeDeps {
  readonly presence: Presence;
  /** Recherche d'un profil (module profils). */
  readonly findProfile: (id: string) => Promise<Profile | undefined>;
  readonly clock: Clock;
  readonly random: Random;
  readonly logger: FastifyBaseLogger;
  readonly reporter: ErrorReporter;
  readonly metrics?: Metrics;
}

export type RealtimeServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

/** Messages de discussion : 5 d'affilée, puis 1 toutes les 2 s. Autres actions : 20, puis 1 / 250 ms. */
const CHAT_BURST = 5;
const CHAT_REFILL_MS = 2_000;
const ACTION_BURST = 20;
const ACTION_REFILL_MS = 250;

export function attachRealtime(io: RealtimeServer, deps: RealtimeDeps) {
  const { presence, logger, reporter, metrics } = deps;
  const arenas = createArenas({
    presence,
    clock: deps.clock,
    random: deps.random,
    onBusyChange: () => broadcastPresence(),
    onCountChange: (n) => metrics?.openArenas.set(n),
  });

  const broadcastPresence = () => {
    io.emit('presence', presence.players(arenas.isBusy));
    metrics?.onlinePlayers.set(presence.count());
  };

  // Authentification de la connexion : profil existant et pas déjà ouvert ailleurs.
  io.use((socket, next) => {
    const auth = RealtimeAuthSchema.safeParse(socket.handshake.auth);
    if (!auth.success) {
      next(new Error(REALTIME_REFUSALS.unknownProfile));
      return;
    }
    deps
      .findProfile(auth.data.profileId)
      .then((profile) => {
        if (!profile) next(new Error(REALTIME_REFUSALS.unknownProfile));
        else if (presence.isOnline(profile.id)) next(new Error(REALTIME_REFUSALS.alreadyConnected));
        else {
          socket.data.profile = profile;
          next();
        }
      })
      .catch((err: unknown) => {
        reporter.capture(err, { source: 'realtime' });
        next(new Error('Connexion impossible pour le moment'));
      });
  });

  io.on('connection', (socket) => {
    const profile = socket.data.profile;
    // Deux connexions simultanées ont pu passer l'authentification : la seconde est refusée.
    if (presence.isOnline(profile.id)) {
      socket.disconnect(true);
      return;
    }
    presence.join(socket, profile);
    broadcastPresence();
    const current = arenas.viewOf(profile.id);
    if (current) socket.emit('arena', current);

    const chatLimit = tokenBucket(CHAT_BURST, CHAT_REFILL_MS);
    const actionLimit = tokenBucket(ACTION_BURST, ACTION_REFILL_MS);

    /** Valide le message et le débit, puis exécute ; toute erreur est journalisée, jamais fatale. */
    const on = <S extends z.ZodType>(
      event: keyof ClientToServerEvents,
      schema: S | null,
      handler: (msg: z.output<S>) => void,
      limit = actionLimit,
    ) => {
      socket.on(event, (raw?: unknown) => {
        if (!limit.take()) return;
        const parsed = schema ? schema.safeParse(raw) : { success: true as const, data: undefined };
        if (!parsed.success) {
          logger.debug({ event }, 'message temps réel invalide ignoré');
          return;
        }
        try {
          handler(parsed.data as z.output<S>);
        } catch (err) {
          reporter.capture(err, { source: 'realtime', event });
        }
      });
    };

    on(
      'chat',
      ChatSendSchema,
      ({ to, payload }) => {
        const text = chatText(payload);
        if (!text || to === profile.id || !presence.isOnline(to)) return;
        const out: ChatMessage = {
          from: { id: profile.id, name: profile.name, hero: profile.hero },
          text,
          at: Date.now(),
        };
        presence.emit(to, 'chat', out);
      },
      chatLimit,
    );
    on('arena:create', ArenaCreateSchema, (msg) => arenas.create(profile, msg));
    on('arena:respond', ArenaRespondSchema, ({ arenaId, accept }) => arenas.respond(profile.id, arenaId, accept));
    on('arena:start', null, () => arenas.start(profile.id));
    on('arena:answer', ArenaAnswerSchema, ({ response }) => arenas.answer(profile.id, response));
    on('arena:leave', null, () => arenas.leave(profile.id));

    socket.on('disconnect', () => {
      presence.leave(socket, profile.id);
      arenas.leave(profile.id);
      broadcastPresence();
    });
  });

  return {
    /** Arrêt propre : minuteurs coupés, connexions fermées. */
    async close(): Promise<void> {
      arenas.dispose();
      await io.close();
    },
  };
}
