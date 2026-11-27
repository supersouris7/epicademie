import { randomUUID } from 'node:crypto';
import { check, generate, type Level } from '@epicademie/content';
import {
  endShootoutRound,
  nextShootoutRound,
  shoot,
  startShootout,
  stopShootout,
  type ShootoutSide,
} from '@epicademie/engine';
import {
  DUEL_INVITE_TTL_MS,
  DUEL_QUESTION_SECONDS,
  DUEL_REMATCH_TTL_MS,
  DUEL_ROUND_BREAK_SECONDS,
  DUEL_ROUND_SECONDS,
  MATCH_GRACE_MS,
  type DuelAnswer,
  type DuelChallenge,
  type DuelView,
  type Profile,
  type ServerToClientEvents,
  type SubjectId,
} from '@epicademie/shared';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { classPool, commonSubjects, drawFromPool } from './class-pool.ts';
import { duelPlayer, duelView, type Duel, type DuelPlayer } from './duel-view.ts';
import type { Presence } from './presence.ts';

/**
 * Duel à distance (docs/adr/0040) : un joueur défie un joueur lié, en ligne et libre ; après
 * acceptation, chacun répond à sa propre file de questions (sa classe, les chapitres de sa
 * famille). Les règles (vies, boucliers, manches) sont dans @epicademie/engine ; ici,
 * l'orchestration, la correction et les minuteurs. État en mémoire : rien n'est écrit en base,
 * aucune récompense ni maîtrise enregistrée.
 */

export interface DuelDeps {
  readonly presence: Presence;
  readonly clock: Pick<Clock, 'now'>;
  readonly random: Pick<Random, 'seed'>;
  /** La famille peut-elle jouer ce chapitre (gratuit, ou abonnement) ? */
  readonly canPlayChapter: (familyId: string, chapterId: string) => Promise<boolean>;
  /** Joueur déjà occupé par un autre mode (arène en cours). */
  readonly isBusyElsewhere: (profileId: string) => boolean;
  /** Un duel démarre : ses joueurs quittent les salons des autres modes. */
  readonly onStart?: (playerIds: readonly string[]) => void;
  /** La liste des joueurs occupés a changé (diffusion de la présence). */
  readonly onBusyChange: () => void;
  readonly onCountChange?: (open: number) => void;
}

/** Premières questions de chaque joueur au niveau 1, ensuite niveau 2. */
const WARMUP_QUESTIONS = 4;

const SIDES: readonly ShootoutSide[] = [0, 1];

type Emit = <E extends keyof ServerToClientEvents>(
  profileId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
) => void;

const sideOf = (d: Duel, profileId: string): ShootoutSide => (d.players[0].profile.id === profileId ? 0 : 1);
const idsOf = (d: Duel) => d.players.map((p) => p.profile.id);
/** Partie commencée et pas finie. */
const running = (d: Duel) => d.game !== null && d.end === null;

/** Coupe la question en cours d'un joueur et son minuteur. */
const clearQuestion = (p: DuelPlayer) => {
  clearTimeout(p.timer);
  p.question = null;
};

/** Registre des duels en mémoire : recherche par joueur, diffusion des vues, effacement. */
function createRegistry({ presence, onBusyChange, onCountChange }: DuelDeps) {
  const duels = new Map<string, Duel>();
  const emit: Emit = (profileId, event, ...args) => presence.emit(profileId, event, ...args);

  /** Duels où ce joueur est encore présent. */
  const of = (profileId: string) =>
    [...duels.values()].filter((d) => d.players.some((p) => p.profile.id === profileId && !p.gone));

  /** Chacun sa vue ; une invitation en attente n'est montrée qu'à celui qui l'a envoyée. */
  const push = (d: Duel) => {
    for (const side of d.game ? SIDES : [0 as const]) {
      const p = d.players[side];
      if (!p.gone) emit(p.profile.id, 'duel', duelView(d, side));
    }
  };

  const add = (d: Duel) => {
    duels.set(d.id, d);
    onCountChange?.(duels.size);
  };

  const remove = (d: Duel) => {
    clearTimeout(d.timer);
    for (const p of d.players) {
      clearTimeout(p.timer);
      clearTimeout(p.away);
    }
    duels.delete(d.id);
    onCountChange?.(duels.size);
  };

  /** Efface le duel pour ses joueurs (invitation refusée ou expirée, liaison retirée). */
  const closeAll = (d: Duel) => {
    for (const p of d.players) if (!p.gone) emit(p.profile.id, 'duel:closed', d.id);
    remove(d);
    onBusyChange();
  };

  return { duels, emit, of, push, add, remove, closeAll };
}

type Registry = ReturnType<typeof createRegistry>;

/** Déroulé d'une partie : files de questions, tirs, manches, fin. */
function createMatch({ clock, random, onBusyChange }: DuelDeps, { push, remove }: Registry) {
  const nextQuestion = (d: Duel, side: ShootoutSide) => {
    const p = d.players[side];
    clearQuestion(p);
    const level: Level = p.seq < WARMUP_QUESTIONS ? 1 : 2;
    const ref = drawFromPool(p.pool, random.seed(), level);
    if (!ref) return;
    const ms = DUEL_QUESTION_SECONDS * 1000;
    p.seq += 1;
    p.question = { ...ref, seq: p.seq, deadline: clock.now().getTime() + ms };
    p.timer = setTimeout(() => resolve(d, side, false), ms);
  };

  const beginRound = (d: Duel) => {
    const ms = DUEL_ROUND_SECONDS * 1000;
    clearTimeout(d.timer);
    d.deadline = clock.now().getTime() + ms;
    d.timer = setTimeout(() => {
      if (!d.game) return;
      d.game = endShootoutRound(d.game);
      endRound(d);
      // La fin de partie a déjà diffusé son état.
      if (d.end === null) push(d);
    }, ms);
    for (const side of SIDES) nextQuestion(d, side);
  };

  /** Fin de partie : bilan consultable le temps de proposer la revanche, puis effacement. */
  const finish = (d: Duel, end: NonNullable<DuelView['end']>) => {
    clearTimeout(d.timer);
    d.players.forEach(clearQuestion);
    d.end = end;
    d.deadline = null;
    d.rematchDeadline = end === 'match' ? clock.now().getTime() + DUEL_REMATCH_TTL_MS : null;
    d.timer = setTimeout(() => {
      d.rematchDeadline = null;
      push(d);
      remove(d);
    }, DUEL_REMATCH_TTL_MS);
    push(d);
    onBusyChange();
  };

  /** La manche vient de se terminer : pause avant la suivante, ou fin du match. */
  const endRound = (d: Duel) => {
    if (d.game?.phase === 'over') {
      finish(d, 'match');
      return;
    }
    const ms = DUEL_ROUND_BREAK_SECONDS * 1000;
    clearTimeout(d.timer);
    d.players.forEach(clearQuestion);
    d.deadline = clock.now().getTime() + ms;
    d.timer = setTimeout(() => {
      if (!d.game) return;
      d.game = nextShootoutRound(d.game);
      beginRound(d);
      push(d);
    }, ms);
  };

  /** Réponse corrigée ou temps écoulé : le tir part, puis la question suivante du joueur. */
  const resolve = (d: Duel, side: ShootoutSide, correct: boolean) => {
    if (d.game?.phase !== 'playing') return;
    d.game = shoot(d.game, side, correct);
    if (d.game.phase === 'playing') nextQuestion(d, side);
    else endRound(d);
    // La fin de partie a déjà diffusé son état.
    if (d.end === null) push(d);
  };

  return { beginRound, finish, resolve };
}

/** Invitations : défi, lancement, revanche. */
function createInvitations(deps: DuelDeps, registry: Registry, match: ReturnType<typeof createMatch>) {
  const { presence, isBusyElsewhere, canPlayChapter, onBusyChange } = deps;
  const { duels, emit, of, push, remove, closeAll } = registry;

  const isBusy = (profileId: string) => of(profileId).some((d) => d.end === null && (running(d) || d.starting));
  const free = (profileId: string) => presence.isOnline(profileId) && !isBusy(profileId) && !isBusyElsewhere(profileId);
  const gradeOf = (profileId: string) => presence.profile(profileId)?.grade ?? null;
  const subjectsFor = (a: string, b: string): SubjectId[] => commonSubjects([gradeOf(a), gradeOf(b)]);

  /** Le joueur quitte un bilan de fin de partie : plus de revanche pour l'autre. */
  const quitOver = (d: Duel, side: ShootoutSide) => {
    const p = d.players[side];
    clearTimeout(p.away);
    p.away = undefined;
    p.gone = true;
    d.rematchDeadline = null;
    if (d.players.every((x) => x.gone)) remove(d);
    else push(d);
  };

  /** Départ (volontaire, ou reconnexion manquée) : fin propre, sans vainqueur. */
  const drop = (d: Duel, side: ShootoutSide) => {
    if (!d.game) {
      closeAll(d);
      return;
    }
    if (d.end !== null) {
      quitOver(d, side);
      return;
    }
    const p = d.players[side];
    clearTimeout(p.away);
    p.away = undefined;
    p.gone = true;
    d.game = stopShootout(d.game);
    match.finish(d, 'opponent-left');
  };

  /** Bilans que le joueur quitte pour passer à autre chose. */
  const leaveOver = (profileId: string) => {
    for (const d of of(profileId)) {
      if (d.end === null) continue;
      emit(profileId, 'duel:closed', d.id);
      quitOver(d, sideOf(d, profileId));
    }
  };

  /** Les deux joueurs peuvent-ils (encore) jouer ensemble ? */
  const canMeet = (a: string, b: string) =>
    presence.linked(a, b) && [a, b].every((id) => presence.isOnline(id) && !isBusyElsewhere(id));

  /** Prépare les questions de chacun (sa classe, sa famille), puis lance la première manche. */
  const begin = async (d: Duel) => {
    const ids = idsOf(d);
    d.starting = true;
    clearTimeout(d.timer);
    for (const id of ids) {
      for (const x of of(id)) if (x !== d && !x.game) closeAll(x);
      leaveOver(id);
    }
    deps.onStart?.(ids);
    onBusyChange();
    try {
      const pools = await Promise.all(
        d.players.map((p) =>
          classPool(d.subject, p.profile.grade ?? null, (chapterId) => canPlayChapter(p.familyId, chapterId)),
        ),
      );
      // Un départ ou un retrait de liaison a pu survenir pendant l'attente.
      if (duels.get(d.id) !== d) return;
      const [a = '', b = ''] = ids;
      if (!canMeet(a, b) || pools.some((pool) => pool.length === 0)) {
        closeAll(d);
        return;
      }
      d.players.forEach((p, i) => (p.pool = pools[i] ?? []));
      d.starting = false;
      d.game = startShootout();
      match.beginRound(d);
      push(d);
      onBusyChange();
    } catch (err) {
      if (duels.get(d.id) === d) closeAll(d);
      throw err;
    }
  };

  /** Joueur tel que connecté à cet instant (classe et famille du moment). */
  const player = (p: Profile) => duelPlayer(presence.profile(p.id) ?? p, presence.familyOf(p.id) ?? '');

  const newDuel = (subject: SubjectId, a: Profile, b: Profile): Duel => ({
    id: randomUUID(),
    subject,
    players: [player(a), player(b)],
    game: null,
    starting: false,
    deadline: null,
    end: null,
    rematchDeadline: null,
  });

  const invite = (d: Duel) => {
    const [{ profile }, guest] = d.players;
    emit(guest.profile.id, 'duel:invite', {
      duelId: d.id,
      from: { id: profile.id, name: profile.name, hero: profile.hero },
      subject: d.subject,
    });
  };

  return { isBusy, free, subjectsFor, drop, leaveOver, begin, newDuel, invite };
}

export function createDuels(deps: DuelDeps) {
  const { presence, isBusyElsewhere } = deps;
  const registry = createRegistry(deps);
  const { duels, emit, of, push, add, remove, closeAll } = registry;
  const match = createMatch(deps, registry);
  const { isBusy, free, subjectsFor, drop, leaveOver, begin, newDuel, invite } = createInvitations(
    deps,
    registry,
    match,
  );

  return {
    /** Le joueur est-il en duel (non invitable) ? */
    isBusy,
    count: () => duels.size,

    /** Matières communes avec un joueur lié ; sinon aucune réponse. */
    subjects(profileId: string, to: string): void {
      if (to === profileId || !presence.linked(profileId, to)) return;
      emit(profileId, 'duel:subjects', { to, subjects: subjectsFor(profileId, to) });
    },

    /** Défi vers un joueur lié, en ligne et libre ; il remplace l'invitation précédente. */
    challenge(profile: Profile, { to, subject }: DuelChallenge): void {
      const from = profile.id;
      if (to === from || !presence.linked(from, to) || !free(from) || !free(to)) return;
      const target = presence.profile(to);
      if (!target || !subjectsFor(from, to).includes(subject)) return;
      const sent = of(from).find((d) => !d.game && d.players[0].profile.id === from);
      // Même défi déjà en attente : l'autre n'est pas sollicité une seconde fois.
      if (sent?.players[1].profile.id === to && sent.subject === subject) {
        push(sent);
        return;
      }
      if (sent) closeAll(sent);
      leaveOver(from);
      const d = newDuel(subject, profile, target);
      d.timer = setTimeout(() => closeAll(d), DUEL_INVITE_TTL_MS);
      add(d);
      invite(d);
      push(d);
    },

    /** Réponse de l'invité à une invitation. */
    async respond(profileId: string, duelId: string, accept: boolean): Promise<void> {
      const d = duels.get(duelId);
      if (d?.players[1].profile.id !== profileId || d.game || d.starting) return;
      if (!accept) {
        closeAll(d);
        return;
      }
      // Invité occupé ailleurs : l'invitation reste en attente.
      if (!free(profileId)) return;
      if (!free(d.players[0].profile.id)) {
        closeAll(d);
        return;
      }
      await begin(d);
    },

    /** Réponse à sa question en cours (corrigée ici ; en retard ou illisible : ignorée). */
    answer(profileId: string, { seq, response }: DuelAnswer): void {
      const d = of(profileId).find(running);
      if (!d) return;
      const side = sideOf(d, profileId);
      const q = d.players[side].question;
      if (q?.seq !== seq) return;
      const result = check(generate(q.skillId, q.level, q.seed), response);
      if (result.invalid) return;
      match.resolve(d, side, result.correct);
    },

    /** « Revanche ? » : une nouvelle partie démarre quand les deux ont accepté. */
    async rematch(profileId: string): Promise<void> {
      const d = of(profileId).find((x) => x.rematchDeadline !== null);
      if (!d) return;
      d.players[sideOf(d, profileId)].rematch = true;
      const [a, b] = d.players;
      const ids = idsOf(d);
      if (!a.rematch || !b.rematch || !ids.every(free)) {
        push(d);
        return;
      }
      for (const id of ids) emit(id, 'duel:closed', d.id);
      remove(d);
      const next = newDuel(d.subject, a.profile, b.profile);
      add(next);
      await begin(next);
    },

    /** Départ volontaire : la partie en cours, sinon son invitation, sinon le bilan affiché. */
    leave(profileId: string): void {
      const mine = of(profileId);
      const d =
        mine.find(running) ??
        mine.find((x) => !x.game && (x.starting || x.players[0].profile.id === profileId)) ??
        mine.find((x) => x.end !== null);
      if (!d) return;
      if (d.game) emit(profileId, 'duel:closed', d.id);
      drop(d, sideOf(d, profileId));
    },

    /**
     * Connexion perdue : le joueur garde sa place `MATCH_GRACE_MS` (l'autre le voit
     * « déconnecté ») ; le temps continue de s'écouler.
     */
    disconnected(profileId: string): void {
      for (const d of of(profileId)) {
        const side = sideOf(d, profileId);
        const p = d.players[side];
        if (p.away) continue;
        p.away = setTimeout(() => {
          p.away = undefined;
          drop(d, side);
        }, MATCH_GRACE_MS);
        push(d);
      }
    },

    /** Nouvelle connexion du joueur : il reprend sa place et reçoit l'état en cours. */
    reconnected(profileId: string): void {
      for (const d of of(profileId)) {
        const side = sideOf(d, profileId);
        clearTimeout(d.players[side].away);
        d.players[side].away = undefined;
        if (d.game || side === 0) push(d);
        else if (!d.starting) invite(d);
      }
    },

    /** Liaison retirée, ou joueur pris par un autre mode : les duels concernés sont effacés. */
    prune(): void {
      for (const d of [...duels.values()]) {
        if (d.end !== null) continue;
        const [a = '', b = ''] = idsOf(d);
        const unlinked = presence.isOnline(a) && presence.isOnline(b) && !presence.linked(a, b);
        const taken = !d.game && (isBusyElsewhere(a) || isBusyElsewhere(b));
        if (unlinked || taken) closeAll(d);
      }
    },

    /** Arrêt du serveur : plus aucun minuteur actif. */
    dispose(): void {
      for (const d of [...duels.values()]) remove(d);
    },
  };
}

export type Duels = ReturnType<typeof createDuels>;
