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
  /** Famille de la session portée par les cookies (écran TV), ou null. */
  readonly authorizeFamily: (cookieHeader: string | undefined) => Promise<string | null>;
  readonly clock: Clock;
  readonly random: Random;
  /** Amis actifs d'un profil (amitié acceptée et validée par les parents). */
  readonly friendsOf: (profileId: string) => Promise<string[]>;
  /** La famille peut-elle jouer ce chapitre (gratuit, ou abonnement) ? */
  readonly canPlayChapter: (familyId: string, chapterId: string) => Promise<boolean>;
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
    onView: (view, playerIds) => {
      // Écran TV : la famille des joueurs (connus de la présence, ou dernière famille vue).
      const family = playerIds.map((id) => presence.familyOf(id)).find(Boolean) ?? arenaFamily.get(view.id);
      if (!family) return;
      arenaFamily.set(view.id, family);
      io.to(tvRoom(family)).emit('arena', view);
      if (view.phase === 'over') arenaFamily.delete(view.id);
    },
  });
  const arenaFamily = new Map<string, string>();
  const tvRoom = (familyId: string) => `tv:${familyId}`;

  /** Chaque joueur reçoit la liste de ses connectés : sa famille et ses amis actifs (jamais les autres). */
  const broadcastPresence = () => {
    for (const id of presence.allIds()) presence.emit(id, 'presence', presence.visibleTo(id, arenas.isBusy));
    metrics?.onlinePlayers.set(presence.count());
  };
  presence.onChanged(broadcastPresence);

  // Authentification de la connexion : session de la famille (cookie), profil de cette famille,
  // pas déjà ouvert ailleurs.
  io.use((socket, next) => {
    const auth = RealtimeAuthSchema.safeParse(socket.handshake.auth);
    if (!auth.success) {
      next(new Error(REALTIME_REFUSALS.unknownProfile));
      return;
    }
    if ('tv' in auth.data) {
      deps
        .authorizeFamily(socket.handshake.headers.cookie)
        .then((familyId) => {
          if (!familyId) {
            next(new Error(REALTIME_REFUSALS.unknownProfile));
            return;
          }
          socket.data.familyId = familyId;
          socket.data.tv = true;
          next();
        })
        .catch((err: unknown) => {
          reporter.capture(err, { source: 'realtime' });
          next(new Error('Connexion impossible pour le moment'));
        });
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
          return deps.friendsOf(found.profile.id).then((ids) => {
            socket.data.friendIds = ids;
            next();
          });
        }
      })
      .catch((err: unknown) => {
        reporter.capture(err, { source: 'realtime' });
        next(new Error('Connexion impossible pour le moment'));
      });
  });

  io.on('connection', (socket) => {
    if (socket.data.tv) {
      // Écran TV : rejoint la diffusion de sa famille et reçoit la partie en cours, s'il y en a.
      const familyId = socket.data.familyId;
      void socket.join(tvRoom(familyId));
      const current = presence
        .onlineIds(familyId)
        .map((id) => arenas.viewOf(id))
        .find((v) => v !== null);
      if (current) socket.emit('arena', current);
      return;
    }
    const profile = socket.data.profile;
    // Deux connexions simultanées ont pu passer l'authentification : la seconde est refusée.
    if (presence.isOnline(profile.id)) {
      socket.disconnect(true);
      return;
    }
    presence.join(socket, profile, socket.data.familyId, socket.data.friendIds);
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
        if (!text || to === profile.id || !presence.linked(profile.id, to)) return;
        const out: ChatMessage = {
          from: { id: profile.id, name: profile.name, hero: profile.hero },
          text,
          at: Date.now(),
        };
        presence.emit(to, 'chat', out);
      },
      chatLimit,
    );
    // On n'invite que des joueurs de sa famille ou ses amis, sur un chapitre que la famille peut jouer.
    on('arena:create', ArenaCreateSchema, (msg) => {
      deps
        .canPlayChapter(socket.data.familyId, msg.chapterId)
        .then((ok) => {
          if (ok)
            arenas.create(profile, { ...msg, invite: msg.invite.filter((id) => presence.linked(profile.id, id)) });
        })
        .catch((err: unknown) => reporter.capture(err, { source: 'realtime', event: 'arena:create' }));
    });
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
