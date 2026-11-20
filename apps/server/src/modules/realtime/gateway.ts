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
  /**
   * Profil demandé, s'il appartient à la famille de la session portée par les cookies de la
   * connexion (module comptes + profils) ; `null` sinon.
   */
  readonly authorize: (
    cookieHeader: string | undefined,
    profileId: string,
  ) => Promise<{ readonly profile: Profile; readonly familyId: string } | null>;
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

  /** Chaque famille reçoit la liste de ses joueurs connectés (jamais celle des autres). */
  const broadcastPresence = () => {
    for (const familyId of presence.families()) {
      const players = presence.players(familyId, arenas.isBusy);
      for (const p of players) presence.emit(p.id, 'presence', players);
    }
    metrics?.onlinePlayers.set(presence.count());
  };

  // Authentification de la connexion : session de la famille (cookie), profil de cette famille,
  // pas déjà ouvert ailleurs.
  io.use((socket, next) => {
    const auth = RealtimeAuthSchema.safeParse(socket.handshake.auth);
    if (!auth.success) {
      next(new Error(REALTIME_REFUSALS.unknownProfile));
      return;
    }
    deps
      .authorize(socket.handshake.headers.cookie, auth.data.profileId)
      .then((found) => {
        if (!found) next(new Error(REALTIME_REFUSALS.unknownProfile));
        else if (presence.isOnline(found.profile.id)) next(new Error(REALTIME_REFUSALS.alreadyConnected));
        else {
          socket.data.profile = found.profile;
          socket.data.familyId = found.familyId;
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
    presence.join(socket, profile, socket.data.familyId);
    broadcastPresence();
    // Reconnexion pendant une arène : le joueur reprend sa place et reçoit l'état en cours.
    arenas.reconnected(profile.id);
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
        if (!text || to === profile.id || !presence.sameFamily(profile.id, to)) return;
        const out: ChatMessage = {
          from: { id: profile.id, name: profile.name, hero: profile.hero },
          text,
          at: Date.now(),
        };
        presence.emit(to, 'chat', out);
      },
      chatLimit,
    );
    // On n'invite que des joueurs de sa famille.
    on('arena:create', ArenaCreateSchema, (msg) =>
      arenas.create(profile, { ...msg, invite: msg.invite.filter((id) => presence.sameFamily(profile.id, id)) }),
    );
    on('arena:respond', ArenaRespondSchema, ({ arenaId, accept }) => arenas.respond(profile.id, arenaId, accept));
    on('arena:start', null, () => arenas.start(profile.id));
    on('arena:answer', ArenaAnswerSchema, ({ response }) => arenas.answer(profile.id, response));
    on('arena:leave', null, () => arenas.leave(profile.id));

    socket.on('disconnect', () => {
      presence.leave(socket, profile.id);
      // Pas d'élimination immédiate : quelques secondes pour revenir (voir ARENA_GRACE_MS).
      arenas.disconnected(profile.id);
      metrics?.realtimeDisconnects.inc();
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
