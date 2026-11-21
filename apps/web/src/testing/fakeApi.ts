import { battlePools, check, generate } from '@questeo/content';
import {
  answerBattle,
  applyItem,
  badgeProgress,
  battleXp,
  createBattle,
  itemRefusal,
  levelFromXp,
  type BattleDice,
  type BattleState,
} from '@questeo/engine';
import {
  API_PREFIX,
  api,
  type AnyEndpoint,
  type BattleView,
  type BossOverview,
  type Inventory,
  type LearningReport,
  type ItemId,
  type Profile,
  type SkillProgress,
  STARTING_HEROES,
} from '@questeo/shared';

/**
 * Faux serveur pour les tests du front : répond aux appels `fetch` de l'API v1 à partir d'un
 * état en mémoire, avec les VRAIES règles du jeu (correction par @questeo/content, combat par
 * @questeo/engine). Chaque réponse est validée par le schéma du contrat : le faux serveur ne
 * peut pas dériver de l'API réelle sans que les tests échouent.
 *
 * Usage : `const server = createFakeApi(); vi.stubGlobal('fetch', server.fetch);`
 */

type Input = { readonly params: Record<string, string>; readonly body: unknown };
type Handler = (input: Input) => unknown;
type Reply = { readonly status: number; readonly body?: unknown };

/** Réponse d'erreur au format du contrat. */
export class FakeError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const EMPTY_INVENTORY: Inventory = { bouclier: 0, soin: 0, indice: 0 };

export function makeProfile(over: Partial<Profile> = {}): Profile {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Léa',
    avatar: { style: 'portrait', seed: '07' },
    gender: 'fille',
    birthDate: '2014-03-09',
    hero: 'lina',
    grade: '5e',
    xp: 120,
    coins: 40,
    rubies: 3,
    soundOn: false,
    musicOn: false,
    createdAt: '2026-11-01T10:00:00.000Z',
    ...over,
  };
}

interface Battle {
  readonly profileId: string;
  readonly chapterId: string;
  state: BattleState;
  finished: boolean;
}

export interface FakeApiOptions {
  /** Code PIN parent déjà choisi (null : aucun). */
  readonly pin?: string | null;
  readonly profiles?: readonly Profile[];
  readonly skills?: readonly SkillProgress[];
  readonly inventory?: Inventory;
  /** Toutes les réponses aux combats sont jugées justes (true) ou fausses (false) ; absent : vraie correction. */
  readonly battleAnswers?: boolean;
  /** Appareil connecté au compte familial (par défaut : oui). */
  readonly loggedIn?: boolean;
  /** Actions parent déverrouillées (par défaut : oui). */
  readonly parent?: boolean;
  /** Notions désactivées (en maintenance). */
  readonly disabled?: readonly string[];
  /** Le compte connecté est administrateur. */
  readonly admin?: boolean;
  /** Rapport de suivi renvoyé pour chaque profil (par défaut : vide). */
  readonly learning?: LearningReport;
  /** Abonnement familial en cours (par défaut : oui, tous les chapitres jouables). */
  readonly premium?: boolean;
}

/** Rapport de suivi vide (nouveau joueur). */
export const emptyLearning = (): LearningReport => ({
  day: '2026-11-20',
  tally: { answered: 0, autonomous: 0, helped: 0, hints: 0, collective: 0 },
  lastActivity: null,
  subjects: [],
  chapters: [],
  skills: [],
  toRework: [],
  dueReviews: [],
  weeks: [],
});

/** Mot de passe du compte du faux serveur. */
export const FAKE_PASSWORD = 'mot de passe parent';

/** Point d'accès du contrat correspondant à la requête, avec ses paramètres de chemin. */
function route(
  method: string,
  path: string,
): { name: keyof typeof api; endpoint: AnyEndpoint; params: Record<string, string> } | null {
  for (const [name, endpoint] of Object.entries(api) as [keyof typeof api, AnyEndpoint][]) {
    if (endpoint.method !== method) continue;
    const keys: string[] = [];
    const pattern = endpoint.path.replace(/:(\w+)/g, (_, key: string) => {
      keys.push(key);
      return '([^/]+)';
    });
    const m = new RegExp(`^${pattern}$`).exec(path);
    if (m) return { name, endpoint, params: Object.fromEntries(keys.map((k, i) => [k, m[i + 1] ?? ''])) };
  }
  return null;
}

/** Vue d'un combat envoyée au client (comme le vrai serveur). */
const view = (id: string, b: Battle, inventory: Inventory): BattleView => ({
  id,
  chapterId: b.chapterId,
  status: b.state.status,
  hearts: b.state.hearts,
  maxHearts: b.state.maxHearts,
  bossLives: b.state.bossLives,
  mobsDefeated: b.state.mobsDefeated,
  turn: b.state.turn,
  shield: b.state.shield,
  hintShown: b.state.hintShown,
  itemsUsed: b.state.itemsUsed,
  equipped: b.state.equipped,
  question: b.state.question,
  inventory,
});

/** Compte familial du faux serveur : session de l'appareil et verrou parent. */
function authHandlers(options: FakeApiOptions) {
  const session = {
    loggedIn: options.loggedIn ?? true,
    parent: options.parent ?? true,
    email: 'parent@famille.test',
    pin: options.pin ?? null,
  };
  const me = () => {
    if (!session.loggedIn) throw new FakeError(401, 'UNAUTHORIZED', 'Connecte-toi pour continuer.');
    return {
      account: {
        id: '22222222-2222-4222-8222-222222222222',
        email: session.email,
        role: options.admin ? 'admin' : 'parent',
      },
      family: { id: '33333333-3333-4333-8333-333333333333' },
      parent: session.parent,
      parentUntil: session.parent ? '2099-01-01T00:00:00.000Z' : null,
      hasPin: session.pin !== null,
    };
  };
  const requireParent = () => {
    if (!session.parent) throw new FakeError(403, 'FORBIDDEN', 'Action réservée au parent.');
  };
  const credentials = (body: unknown) => body as { email: string; password: string };

  const handlers: Partial<Record<keyof typeof api, Handler>> = {
    signup: ({ body }) => {
      Object.assign(session, { loggedIn: true, parent: true, email: credentials(body).email });
      return me();
    },
    login: ({ body }) => {
      if (credentials(body).password !== FAKE_PASSWORD) {
        throw new FakeError(401, 'UNAUTHORIZED', 'E-mail ou mot de passe incorrect.');
      }
      Object.assign(session, { loggedIn: true, parent: true, email: credentials(body).email });
      return me();
    },
    logout: () => {
      session.loggedIn = false;
      return null;
    },
    me,
    setParentPin: ({ body }) => {
      const b = body as { password: string; pin: string };
      if (b.password !== FAKE_PASSWORD) throw new FakeError(401, 'UNAUTHORIZED', 'Mot de passe incorrect.');
      session.pin = b.pin;
      return me();
    },
    unlockParentPin: ({ body }) => {
      if ((body as { pin: string }).pin !== session.pin)
        throw new FakeError(401, 'UNAUTHORIZED', 'Code PIN incorrect.');
      session.parent = true;
      return me();
    },
    lockParent: () => {
      session.parent = false;
      return me();
    },
    confirmParent: ({ body }) => {
      if ((body as { password: string }).password !== FAKE_PASSWORD) {
        throw new FakeError(401, 'UNAUTHORIZED', 'Mot de passe incorrect.');
      }
      session.parent = true;
      return me();
    },
    forgotPassword: () => null,
    resetPassword: () => null,
  };
  return { session, requireParent, handlers };
}

/** Administration du faux serveur : signalements reçus et quelques notions. */
function adminHandlers(
  reports: Record<string, unknown>[],
  disabled: Set<string>,
): Partial<Record<keyof typeof api, Handler>> {
  const skill = (skillId: string) => ({
    skillId,
    title: skillId === 'm5-tables' ? 'Tables de multiplication' : skillId,
    chapterId: 'm5-calcul',
    subject: 'maths',
    grade: '5e',
    boss: false,
    version: 1,
    source: 'Programme de mathématiques',
    state: disabled.has(skillId) ? 'desactivee' : 'validee-auto',
    disabled: disabled.has(skillId),
    reviewedVersion: null,
    openReports: reports.filter((r) => r.skillId === skillId && r.status === 'nouveau').length,
    autoIssues: [],
  });
  return {
    adminReports: ({ params }) => reports.filter((r) => r.status === params.status),
    adminUpdateReport: ({ params, body }) => {
      const r = reports.find((x) => x.id === params.id);
      if (!r) throw new FakeError(404, 'NOT_FOUND', 'Signalement introuvable');
      Object.assign(r, body);
      return r;
    },
    adminContent: () => ['m5-tables', 'm5-priorites'].map(skill),
    adminStats: () => ({
      day: '2026-11-20',
      families: 12,
      profiles: 19,
      activeProfiles7d: 8,
      finishedSeries7d: 64,
      answers7d: 300,
      autonomousRate7d: 0.72,
      answersBySubject7d: [{ subject: 'maths', answers: 300 }],
      bossWins: 21,
      premiumFamilies: 5,
      payments: [{ status: 'payee', count: 5, amountCents: 12495 }],
      openReports: 1,
    }),
    adminAnomalies: () => [
      {
        rule: 'reponses-eclair',
        profileId: '00000000-0000-4000-8000-000000000042',
        detail: '18 réponses sur 20 en moins de 1.5 s (7 jours)',
        at: null,
      },
    ],
    adminErrors: () => [
      {
        source: 'client',
        message: 'Cannot read properties of undefined',
        route: '/hub',
        count: 3,
        firstAt: '2026-11-20T08:00:00.000Z',
        lastAt: '2026-11-20T09:00:00.000Z',
      },
    ],
    adminUpdateContent: ({ params, body }) => {
      const id = params.skillId ?? '';
      if ((body as { disabled?: boolean }).disabled === true) disabled.add(id);
      if ((body as { disabled?: boolean }).disabled === false) disabled.delete(id);
      return skill(id);
    },
    adminContentHistory: () => [],
  };
}

/** Abonnement du faux serveur : simulateur de paiement, historique. */
function billingHandlers(premium: boolean, uuid: () => string): Partial<Record<keyof typeof api, Handler>> {
  const state = { premium, history: [] as Record<string, unknown>[] };
  const status = () => ({
    premium: state.premium,
    until: state.premium ? '2027-08-31' : null,
    priceCents: 2499,
    currency: 'eur',
    wouldEnd: '2027-08-31',
    available: true,
    simulated: true,
    history: state.history,
  });
  return {
    billing: status,
    checkout: () => {
      const id = uuid();
      state.history.unshift({
        id,
        offer: 'famille-annee',
        status: 'en-attente',
        amountCents: 2499,
        currency: 'eur',
        periodEnd: '2027-08-31',
        createdAt: '2026-11-20T10:00:00.000Z',
        paidAt: null,
      });
      return { url: `/abonnement/simulateur?paiement=${id}` };
    },
    simulatePayment: ({ params, body }) => {
      const sub = state.history.find((h) => h.id === params.id);
      if (!sub) throw new FakeError(404, 'NOT_FOUND', 'Paiement introuvable');
      const ok = (body as { outcome: string }).outcome === 'succes';
      Object.assign(sub, ok ? { status: 'payee', paidAt: '2026-11-20T10:01:00.000Z' } : { status: 'echouee' });
      if (ok) state.premium = true;
      return status();
    },
  };
}

/** Combats du faux serveur : vraies règles du moteur, dés déterministes. */
function battleHandlers(ctx: {
  readonly battles: Map<string, Battle>;
  readonly overview: { inventory: Inventory; equipped: readonly ItemId[] };
  readonly dice: BattleDice;
  readonly profile: (id: string | undefined) => Profile;
  readonly battleOf: (id: string | undefined) => Battle;
  readonly uuid: () => string;
  readonly battleAnswers: boolean | undefined;
}): Partial<Record<keyof typeof api, Handler>> {
  const { battles, overview, dice, profile, battleOf, uuid } = ctx;
  const options = { battleAnswers: ctx.battleAnswers };
  return {
    startBattle: ({ body }) => {
      const { profileId, chapterId } = body as { profileId: string; chapterId: string };
      profile(profileId);
      const pools = battlePools(chapterId);
      if (!pools) throw new FakeError(400, 'BAD_REQUEST', 'Ce chapitre n’a pas encore de boss');
      const id = uuid();
      const b: Battle = {
        profileId,
        chapterId,
        state: createBattle(pools, dice, [], overview.equipped),
        finished: false,
      };
      battles.set(id, b);
      return view(id, b, overview.inventory);
    },
    answerBattle: ({ params, body }) => {
      const b = battleOf(params.id);
      const q = b.state.question;
      if (!q || b.state.status !== 'fighting') throw new FakeError(409, 'CONFLICT', 'Combat terminé');
      const result = check(
        generate(q.skillId, q.level, q.seed),
        (body as { response: Parameters<typeof check>[1] }).response,
      );
      if (result.invalid)
        return { correct: false, invalid: true, outcome: null, battle: view(params.id ?? '', b, overview.inventory) };
      const correct = options.battleAnswers ?? result.correct;
      const pools = battlePools(b.chapterId);
      if (!pools) throw new Error('réserves introuvables');
      const next = answerBattle(b.state, pools, correct, dice);
      b.state = next.state;
      return { correct, invalid: false, outcome: next.outcome, battle: view(params.id ?? '', b, overview.inventory) };
    },
    useBattleItem: ({ params, body }) => {
      const b = battleOf(params.id);
      const item = (body as { item: ItemId }).item;
      const refusal = itemRefusal(b.state, item);
      if (refusal) throw new FakeError(409, 'CONFLICT', refusal);
      overview.inventory = { ...overview.inventory, [item]: overview.inventory[item] - 1 };
      b.state = applyItem(b.state, item);
      return view(params.id ?? '', b, overview.inventory);
    },
    finishBattle: ({ params }) => {
      const b = battleOf(params.id);
      if (b.finished) throw new FakeError(409, 'CONFLICT', 'Combat déjà terminé');
      b.finished = true;
      const won = b.state.status === 'won';
      const xp = profile(b.profileId).xp;
      const gained = battleXp(b.state);
      return {
        won,
        firstWin: won,
        xpGained: gained,
        coinsGained: Math.floor(gained / 10),
        hearts: b.state.hearts,
        medal: won ? 'or' : null,
        newBest: won,
        chest: won ? { rarity: 'epique', items: { soin: 1 }, coins: 40, rubies: 1, hero: null } : null,
        weakSkill: won ? null : (b.state.misses[0] ?? null),
        skills: [],
        levelBefore: levelFromXp(xp).level,
        levelAfter: levelFromXp(xp + gained).level,
      };
    },
  };
}

export function createFakeApi(options: FakeApiOptions = {}) {
  const profiles = new Map((options.profiles ?? [makeProfile()]).map((p) => [p.id, p]));
  const sessions = new Map<string, { answered: number; correct: number }>();
  const battles = new Map<string, Battle>();
  const overview: { -readonly [K in keyof BossOverview]: BossOverview[K] } = {
    records: [],
    inventory: options.inventory ?? EMPTY_INVENTORY,
    equipped: [],
  };
  /** Signalements reçus. */
  const reports: Record<string, unknown>[] = [];
  const disabledSet = new Set(options.disabled ?? []);
  /** Appels reçus (méthode + chemin), pour vérifier ce que l'écran a envoyé. */
  const calls: { method: string; path: string; body: unknown }[] = [];
  let ids = 0;
  const uuid = () => `00000000-0000-4000-8000-${String(++ids).padStart(12, '0')}`;
  // Dés déterministes : mobs dans l'ordre, graines croissantes.
  let seed = 0;
  const dice: BattleDice = { random: () => 0, seed: () => ++seed };

  const profile = (id: string | undefined) => {
    const p = id ? profiles.get(id) : undefined;
    if (!p) throw new FakeError(404, 'NOT_FOUND', 'Profil introuvable');
    return p;
  };
  const battleOf = (id: string | undefined) => {
    const b = id ? battles.get(id) : undefined;
    if (!b) throw new FakeError(404, 'NOT_FOUND', 'Combat introuvable');
    return b;
  };

  const { session, requireParent, handlers: auth } = authHandlers(options);
  const handlers: Partial<Record<keyof typeof api, Handler>> = {
    ...auth,
    network: () => ({ publicUrl: 'http://questeo.test' }),
    presence: () => ({ online: [] }),
    listProfiles: () => [...profiles.values()],
    getProfile: ({ params }) => profile(params.id),
    createProfile: ({ body }) => {
      requireParent();
      const p = makeProfile({ ...(body as Partial<Profile>), id: uuid(), xp: 0, coins: 0, rubies: 0 });
      profiles.set(p.id, p);
      return p;
    },
    updateProfile: ({ params, body }) => {
      const p = { ...profile(params.id), ...(body as Partial<Profile>) };
      profiles.set(p.id, p);
      return p;
    },
    deleteProfile: ({ params }) => {
      requireParent();
      profiles.delete(profile(params.id).id);
      return null;
    },
    listSkills: () => options.skills ?? [],
    startSession: () => {
      const id = uuid();
      sessions.set(id, { answered: 0, correct: 0 });
      return { id };
    },
    answerSession: ({ params, body }) => {
      const a = body as { skillId: string; level: 1 | 2 | 3; seed: number; response: Parameters<typeof check>[1] };
      const result = check(generate(a.skillId, a.level, a.seed), a.response);
      const s = sessions.get(params.id ?? '');
      // Seule la 1re réponse compte au score (le second essai est « avec aide »).
      if (s && !result.invalid && (body as { attempt?: number }).attempt !== 2) {
        s.answered++;
        if (result.correct) s.correct++;
      }
      return { correct: result.correct, invalid: result.invalid === true, xp: result.correct ? 10 : 0 };
    },
    markConfused: () => null,
    finishSession: ({ params }) => {
      const s = sessions.get(params.id ?? '') ?? { answered: 0, correct: 0 };
      return {
        regular: s,
        variants: { answered: 0, correct: 0 },
        scoreOn20: s.answered ? Math.round((20 * s.correct) / s.answered) : 0,
        xpGained: s.correct * 10,
        coinsGained: s.correct,
        perfect: s.answered > 0 && s.correct === s.answered,
        levelBefore: 1,
        levelAfter: 1,
        skills: [],
        chest: null,
      };
    },
    bossOverview: () => overview,
    setEquipment: ({ body }) => {
      overview.equipped = (body as { items: ItemId[] }).items;
      return overview;
    },
    buy: ({ body }) => {
      const item = (body as { item: ItemId | 'rubis' }).item;
      if (item !== 'rubis') overview.inventory = { ...overview.inventory, [item]: overview.inventory[item] + 1 };
      return { coins: 10, rubies: 1, inventory: overview.inventory };
    },
    ...battleHandlers({ battles, overview, dice, profile, battleOf, uuid, battleAnswers: options.battleAnswers }),
    reportClientError: () => null,
    reportQuestion: ({ body }) => {
      const id = uuid();
      reports.push({
        ...(body as object),
        id,
        skillVersion: 1,
        comment: (body as { comment?: string }).comment ?? null,
        status: 'nouveau',
        adminNote: null,
        createdAt: '2026-11-20T10:00:00.000Z',
        resolvedAt: null,
      });
      return { id };
    },
    disabledContent: () => ({ skills: [...disabledSet] }),
    learningReport: () => options.learning ?? emptyLearning(),
    ...billingHandlers(options.premium ?? true, uuid),
    ownedHeroes: () => ({ heroes: [...STARTING_HEROES] }),
    ...friendHandlers(),
    badges: () => badgeProgress({ boss: 2, parfait: 3, perseverance: 0, chapitres: 0, consolidees: 0, coffres: 1 }),
    ...adminHandlers(reports, disabledSet),
  };

  function reply(method: string, url: string, body: unknown): Reply {
    const path = new URL(url, 'http://localhost').pathname;
    if (!path.startsWith(API_PREFIX)) return { status: 404, body: { code: 'NOT_FOUND', error: 'Hors API' } };
    const apiPath = path.slice(API_PREFIX.length);
    calls.push({ method, path: apiPath, body });
    const match = route(method, apiPath);
    const handler = match && handlers[match.name];
    // Comme le vrai serveur : sans session, seules les routes publiques répondent.
    if (match && match.endpoint.access !== 'public' && !session.loggedIn) {
      return { status: 401, body: { code: 'UNAUTHORIZED', error: 'Connecte-toi pour continuer.' } };
    }
    if (!match || !handler)
      return { status: 404, body: { code: 'NOT_FOUND', error: `Pas de faux ${method} ${apiPath}` } };
    try {
      const out = handler({ params: match.params, body });
      if (match.endpoint.status === 204) return { status: 204 };
      // Le faux serveur respecte le contrat, comme le vrai.
      return { status: match.endpoint.status, body: match.endpoint.response?.parse(out) };
    } catch (err) {
      if (err instanceof FakeError) return { status: err.status, body: { code: err.code, error: err.message } };
      throw err;
    }
  }

  /** Remplaçant de `fetch` : réponses synchrones, sans réseau. */
  const fakeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? 'GET';
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
    // Sons du jeu : fichiers absents des tests.
    if (url.startsWith('/sounds/')) return new Response(new ArrayBuffer(0));
    const r = reply(method, url, body);
    return new Response(r.body === undefined ? null : JSON.stringify(r.body), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return {
    fetch: fakeFetch,
    calls,
    reports,
    profiles,
    battles,
    overview,
    /** Remplace un point d'accès (erreur simulée, réponse particulière). */
    override(name: keyof typeof api, handler: Handler) {
      handlers[name] = handler;
    },
  };
}

export type FakeApi = ReturnType<typeof createFakeApi>;

/** Amis : un copain de l'autre famille, Tom (code TOM234), qui accepte et dont le parent valide. */
function friendHandlers(): Partial<Record<keyof typeof api, Handler>> {
  const tom = { id: '99999999-9999-4999-8999-999999999999', name: 'Tom', hero: 'alex' as const };
  let status: 'none' | 'envoyee' | 'parents' | 'active' = 'none';
  let myParentOk = false;
  const friends = () =>
    status === 'none' ? [] : [{ ...tom, avatar: { style: 'portrait' as const, seed: '07' }, status, myParentOk }];
  const view = () => ({ code: 'LEA7K2', friends: friends() });
  return {
    friends: view,
    requestFriend: ({ body }) => {
      if ((body as { code: string }).code !== 'TOM234')
        throw new FakeError(404, 'NOT_FOUND', 'Aucun joueur avec ce code.');
      status = 'envoyee';
      return view();
    },
    removeFriend: () => {
      status = 'none';
      return view();
    },
    ranking: () => [
      {
        ...tom,
        avatar: { style: 'portrait' as const, seed: '03' },
        me: false,
        friend: true,
        level: 4,
        xp: 900,
        weekXp: 120,
        bosses: 2,
        goldMedals: 1,
        diamondMedals: 0,
        goldSkills: 5,
        badgePoints: 3,
        chrono: 12,
        survie: 7,
      },
      {
        id: makeProfile().id,
        name: 'Léa',
        hero: 'lina' as const,
        avatar: { style: 'portrait' as const, seed: '07' },
        me: true,
        friend: false,
        level: 2,
        xp: 300,
        weekXp: 200,
        bosses: 1,
        goldMedals: 0,
        diamondMedals: 1,
        goldSkills: 2,
        badgePoints: 1,
        chrono: 20,
        survie: 3,
      },
    ],
    familyFriends: () => friends().map((f) => ({ ...f, profileId: makeProfile().id, profileName: 'Léa' })),
    approveFriend: () => {
      myParentOk = true;
      status = 'active';
      return friends().map((f) => ({ ...f, profileId: makeProfile().id, profileName: 'Léa' }));
    },
    /** Raccourci de test : Tom a accepté. */
    acceptFriend: () => {
      status = 'parents';
      return view();
    },
  };
}
