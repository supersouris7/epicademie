import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { ENGLISH_COUNTRIES, FESTIVALS, OTHER_COUNTRIES, QUESTIONS, type Festival } from './ecoute-faits.ts';
import { MONTHS } from './temps-faits.ts';
import { wordOf } from './presentation-faits.ts';
import { at, de, shuffledOther, some } from './temps.ts';

/**
 * Anglais CM2 — « Écouter et comprendre » (lot an-cm2-06, docs/adr/0034). Programme : cycle 3 (2020, modifié
 * 2023 : comprendre un message oral court, horaire, prix, fêtes et traditions, repères culturels), en vigueur au
 * CM2 jusqu'à la rentrée 2027. Faits : British Council, Union européenne et TLFi (voir ecoute-faits.ts : chaque
 * fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3, CM2 (BOEN n° 31 du 30 juillet 2020 et BOEN n° 25 du 22 juin 2023)';
const source = (detail: string) => `${PROGRAMME} — comprendre l’oral, prix, horaires, repères culturels. ${detail}`;
const PROGRAMMES = ['cycle3-2020'];
const EN = 'en-GB';

/** Réponses avec ou sans point final. */
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ——— Scènes : le contexte de l'énoncé dépend de la réponse (un même énoncé = une même réponse) ———

const WHO = ['Mia', 'Leo', 'Zoé', 'Sam', 'Nina', 'Hugo'] as const;
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
const EVENTS = ['le film', 'le match', 'la fête', 'le cours de piano', 'le spectacle', 'le pique-nique'] as const;
/** Prénom, jour et événement tirés de l'indice de la réponse (252 scènes distinctes). */
const scene = (i: number) => ({
  who: at(WHO, i % 6),
  day: at(JOURS, Math.floor(i / 6) % 7),
  event: at(EVENTS, Math.floor(i / 42) % 6),
});

/** « du film », « de la fête ». */
const du = (event: string) => event.replace(/^le /, 'du ').replace(/^la /, 'de la ');

/**
 * Écoute, ou lecture quand la voix anglaise manque (une question sur trois). La version lue finit par la question
 * (`ask`) et peut écrire les nombres en lettres (`written`) pour ne pas souffler la réponse en chiffres.
 */
function listenOrRead(
  rng: Rng,
  text: string,
  listen: string,
  read: string,
  { ask, written = text }: { ask?: string; written?: string } = {},
): Pick<QuestionDraft, 'prompt' | 'audio'> {
  if (rng.int(0, 2) === 0) return { prompt: [`${read} « ${written} »`, ask].filter(Boolean).join(' ') };
  return { prompt: listen, audio: { text, lang: EN } };
}

// ——— 1. L'heure entendue ———

interface Time {
  readonly h: number;
  readonly m: number;
}
const next = (h: number) => (h === 12 ? 1 : h + 1);
const prev = (h: number) => (h === 1 ? 12 : h - 1);
const hourWord = (h: number) => wordOf(h) ?? String(h);
/** Nombre en lettres, dizaine et unité réunies par un tiret au-delà des mots cités (thirty-five). */
const numberWord = (n: number) => wordOf(n) ?? `${wordOf(n - (n % 10))}-${wordOf(n % 10)}`;
const minuteWord = (m: number) => (m === 15 ? 'quarter' : (wordOf(m) ?? String(m)));
/** L'heure dite en anglais (British Council, « How to tell the time »). */
function timeEn(t: Time): string {
  if (t.m === 0) return `${hourWord(t.h)} o’clock`;
  if (t.m === 30) return `half past ${hourWord(t.h)}`;
  if (t.m < 30) return `${minuteWord(t.m)} past ${hourWord(t.h)}`;
  return `${minuteWord(60 - t.m)} to ${hourWord(next(t.h))}`;
}
const pad = (m: number) => String(m).padStart(2, '0');
const digital = (t: Time) => `${t.h}:${pad(t.m)}`;
const digitalForms = (t: Time): string[] => {
  const mm = pad(t.m);
  const base = [`${t.h}:${mm}`, `${t.h}.${mm}`, `${t.h}h${mm}`, `${t.h} h ${mm}`];
  const zero = t.h < 10 ? [`0${t.h}:${mm}`, `0${t.h}h${mm}`] : [];
  const pile = t.m === 0 ? [`${t.h}h`, `${t.h} h`] : [];
  return [...base, ...zero, ...pile];
};
/** Formes anglaises acceptées : avec ou sans « It’s », « a quarter », « minutes », « fifteen », tiret ou espace. */
function timeForms(t: Time): string[] {
  const said = timeEn(t);
  const variants = [said];
  if (t.m !== 0 && t.m !== 30) {
    const before = t.m > 30;
    const n = before ? 60 - t.m : t.m;
    const tail = `${before ? 'to' : 'past'} ${hourWord(before ? next(t.h) : t.h)}`;
    variants.push(`${numberWord(n)} minutes ${tail}`);
    if (n === 15) variants.push(`${numberWord(n)} ${tail}`);
  }
  variants.push(...variants.map((v) => v.replaceAll('-', ' ')));
  if (t.m === 15 || t.m === 45) variants.push(`a ${said}`);
  if (t.m === 0) variants.push(`${hourWord(t.h)} o'clock`);
  const unique = [...new Set(variants)];
  return full(unique.flatMap((v) => [v, `It’s ${v}`, `It is ${v}`]));
}

/** Erreurs typiques autour d'une heure (ordre : la plus fréquente d'abord). */
function timeTraps(t: Time): { t: Time; why: string }[] {
  const h = hourWord(t.h);
  if (t.m === 0)
    return [
      { t: { h: t.h, m: 30 }, why: '« o’clock » veut dire heure pile : 0 minute.' },
      { t: { h: t.h > 6 ? t.h - 5 : t.h + 5, m: 0 }, why: `Écoute bien le nombre : « ${h} » = ${t.h}.` },
      { t: { h: t.h, m: 15 }, why: '« quarter » n’est pas dans la phrase : c’est une heure pile.' },
    ];
  if (t.m === 30)
    return [
      { t: { h: next(t.h), m: 30 }, why: `« half past ${h} » : on a passé ${t.h} heures, pas ${next(t.h)}.` },
      { t: { h: t.h, m: 15 }, why: '« half » = la moitié de l’heure : 30 minutes. « quarter » = 15.' },
      { t: { h: t.h, m: 0 }, why: '« half past » ajoute une demi-heure : ce n’est pas une heure pile.' },
    ];
  if (t.m < 30)
    return [
      { t: { h: prev(t.h), m: 60 - t.m }, why: '« past » veut dire « après » : on ajoute les minutes à l’heure.' },
      { t: { h: next(t.h), m: t.m }, why: `« past ${h} » : l’heure est ${t.h}, pas la suivante.` },
      {
        t: { h: t.h, m: t.m === 15 ? 45 : t.m + 30 },
        why: `« ${minuteWord(t.m)} » = ${t.m} minutes après l’heure.`,
      },
    ];
  const left = 60 - t.m;
  const to = hourWord(next(t.h));
  return [
    {
      t: { h: next(t.h), m: left },
      why: `« to » veut dire « avant » : il manque ${left} minutes pour arriver à ${next(t.h)} h.`,
    },
    { t: { h: next(t.h), m: t.m }, why: `« to ${to} » : on n’est pas encore à ${next(t.h)} heures, mais juste avant.` },
    { t: { h: t.h, m: left }, why: `Avec « to », on compte les minutes avant l’heure : 60 − ${left} = ${t.m}.` },
  ];
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const POOL_1: readonly Time[] = HOURS.flatMap((h) => [0, 30].map((m) => ({ h, m })));
const POOL_2: readonly Time[] = HOURS.flatMap((h) => [15, 30, 45].map((m) => ({ h, m })));
const POOL_3: readonly Time[] = HOURS.flatMap((h) => [5, 10, 15, 20, 25, 35, 40, 45, 50, 55].map((m) => ({ h, m })));
const HOW =
  'Le nombre après « past » ou « to » est l’heure. « past » = après cette heure ; « to » = avant cette heure.';

/** Niveaux 1 et 2 : entendre l'heure, la choisir parmi 3 ou 4 horloges. */
function timeChoice(rng: Rng, level: 1 | 2): QuestionDraft {
  const pool = level === 1 ? POOL_1 : POOL_2;
  const i = rng.int(0, pool.length - 1);
  const t = at(pool, i);
  const s = scene(i);
  const traps = timeTraps(t).slice(0, level === 1 ? 2 : 3);
  const { answer, traps: tr } = choice(
    rng,
    digital(t),
    traps.map((x) => ({ label: digital(x.t), why: x.why })),
  );
  const said = `It’s ${timeEn(t)}.`;
  return {
    ...listenOrRead(
      rng,
      said,
      `Écoute l’horloge parlante de ${s.who}, ${s.day}. Quelle heure est-il ?`,
      `${s.who} lit l’heure, ${s.day} :`,
      { ask: 'Quelle heure est-il ?' },
    ),
    answer,
    traps: tr,
    hint: level === 1 ? 'Repère le nombre, puis le petit mot : « o’clock » ou « half past » ?' : HOW,
    steps: [
      `La phrase dit : « ${said} »`,
      t.m === 0 ? '« o’clock » = heure pile.' : HOW,
      `Réponse : **${digital(t)}**`,
    ],
  };
}

/** Niveau 3 : écrire en chiffres l'heure entendue. */
function timeWrite(rng: Rng): QuestionDraft {
  const i = rng.int(0, POOL_3.length - 1);
  const t = at(POOL_3, i);
  const s = scene(i);
  const heard = `The ${eventEn(s.event)} starts at ${timeEn(t)}.`;
  return {
    ...listenOrRead(
      rng,
      heard,
      `Écoute ${s.who}, ${s.day}. À quelle heure commence ${s.event} ? Écris l’heure en chiffres (exemple : 4:30).`,
      `Lis le message de ${s.who}, ${s.day}, et écris l’heure en chiffres (exemple : 4:30) :`,
    ),
    answer: { kind: 'text', accepted: digitalForms(t) },
    traps: timeTraps(t)
      .slice(0, 2)
      .map((x) => ({ text: digital(x.t), why: x.why })),
    hint: HOW,
    steps: [`La phrase dit : « ${heard} »`, HOW, `Réponse : **${digital(t)}**`],
  };
}
const EVENT_EN: Readonly<Record<(typeof EVENTS)[number], string>> = {
  'le film': 'film',
  'le match': 'match',
  'la fête': 'party',
  'le cours de piano': 'piano lesson',
  'le spectacle': 'show',
  'le pique-nique': 'picnic',
};
const eventEn = (e: (typeof EVENTS)[number]) => EVENT_EN[e];

/** Niveau 4 : dire en anglais l'heure d'une horloge, sans propositions. */
function timeSay(rng: Rng): QuestionDraft {
  const t = rng.pick(POOL_3);
  const said = timeEn(t);
  const wrong: { text: string; why: string }[] =
    t.m < 30
      ? [
          {
            text: `${minuteWord(t.m)} past ${hourWord(next(t.h))}`,
            why: `Avec « past », on dit l’heure qui vient de passer : ${hourWord(t.h)}.`,
          },
          {
            text: `${minuteWord(t.m)} to ${hourWord(t.h)}`,
            why: '« to » veut dire « avant » l’heure. Ici, les minutes viennent après : « past ».',
          },
        ]
      : [
          {
            text: `${minuteWord(60 - t.m)} to ${hourWord(t.h)}`,
            why: `Avec « to », on dit l’heure qui arrive : ${hourWord(next(t.h))}.`,
          },
          {
            text: `${numberWord(t.m)} past ${hourWord(t.h)}`,
            why: 'Après la demie, on ne dit pas « past » : on compte les minutes qui restent avec « to ».',
          },
        ];
  return {
    prompt: `L’horloge affiche ${digital(t)}. Écris cette heure en anglais, avec « past » ou « to ».`,
    answer: { kind: 'text', accepted: timeForms(t) },
    traps: wrong.filter((w) => !timeForms(t).includes(w.text)),
    hint: 'Les minutes sont-elles avant ou après la demie ? Avant : « past ». Après : « to » et l’heure suivante.',
    steps: [
      t.m < 30
        ? `${t.m} minutes, c’est avant la demie : on dit « … past ${hourWord(t.h)} ».`
        : `${t.m} minutes, c’est après la demie : il reste ${60 - t.m} minutes avant ${next(t.h)} h, on dit « … to ${hourWord(next(t.h))} ».`,
      `Réponse : **${said}**`,
    ],
  };
}

/** Niveau 5 : un petit dialogue avec deux heures ; trouver la bonne. */
function timeDialogue(rng: Rng): QuestionDraft {
  const starts = HOURS.filter((h) => h >= 2);
  const kinds = ['start', 'meet'] as const;
  const gaps = [30, 15] as const;
  const i = rng.int(0, starts.length * 4 - 1);
  const start: Time = { h: at(starts, i % starts.length), m: 0 };
  const gap = at(gaps, Math.floor(i / starts.length) % 2);
  const kind = at(kinds, Math.floor(i / (starts.length * 2)));
  const meet: Time = { h: start.h - 1, m: 60 - gap };
  const s = scene(i);
  const ev = eventEn(s.event);
  const lines = [
    `A: What time is the ${ev}?`,
    `B: At ${timeEn(start)}. Let’s meet at ${timeEn(meet)}.`,
    'A: OK. See you later!',
  ];
  const good = kind === 'start' ? start : meet;
  const other = kind === 'start' ? meet : start;
  const question =
    kind === 'start' ? `À quelle heure commence ${s.event} ?` : 'À quelle heure les amis se retrouvent-ils ?';
  const near = timeTraps(good)[0];
  const { answer, traps } = choice(rng, digital(good), [
    {
      label: digital(other),
      why:
        kind === 'start'
          ? '« Let’s meet at… » donne l’heure du rendez-vous, pas le début.'
          : '« At … » répond à « What time is the…? » : c’est le début, pas le rendez-vous.',
    },
    ...(near ? [{ label: digital(near.t), why: near.why }] : []),
    { label: digital({ h: next(good.h), m: good.m }), why: 'Écoute bien le nombre de l’heure.' },
  ]);
  const read = rng.int(0, 2) === 0;
  return {
    prompt: read
      ? `Lis le dialogue de ${s.who} et de son ami, ${s.day}. ${question}`
      : `Écoute ${s.who} et son ami, ${s.day}. ${question}`,
    ...(read
      ? { figure: { kind: 'document' as const, title: 'Plans', lines, credit: 'Écrit pour l’exercice.' } }
      : { audio: { text: lines.map((l) => l.replace(/^[AB]: /, '')).join(' '), lang: EN } }),
    answer,
    traps,
    hint:
      kind === 'start'
        ? 'Cherche la réponse à « What time is the…? ».'
        : 'Cherche « Let’s meet at… » : c’est l’heure du rendez-vous.',
    steps: [
      `« What time is the ${ev}? » → « At ${timeEn(start)} » : début à ${digital(start)}.`,
      `« Let’s meet at ${timeEn(meet)} » : rendez-vous à ${digital(meet)}, un peu avant.`,
      `Réponse : **${digital(good)}**`,
    ],
  };
}

const heardTime: Skill = {
  id: 'acm2-heure-entendue',
  title: 'L’heure entendue',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Heure pile : « o’clock ». Five o’clock = 5:00. Half past five = 5:30.',
      'Avant la demie, on dit **past** (après) : quarter past five = 5:15, ten past six = 6:10.',
      'Après la demie, on dit **to** (avant l’heure suivante) : quarter to six = 5:45.',
    ],
    source: source('Heure : British Council, « How to tell the time » ; dialogue « Inviting someone to the cinema ».'),
    sources: [...PROGRAMMES, 'bck-tell-time', 'bc-teens-cinema'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1 || level === 2) return timeChoice(rng, level);
    if (level === 3) return timeWrite(rng);
    if (level === 4) return timeSay(rng);
    return timeDialogue(rng);
  },
};

// ——— 2. Prix et dates ———

interface Price {
  readonly pounds: number;
  readonly pence: number;
}
const priceEn = (p: Price) => (p.pence === 0 ? `£${p.pounds}` : `£${p.pounds}.${pad(p.pence)}`);
const priceFr = (p: Price) => (p.pence === 0 ? `${p.pounds} £` : `${p.pounds},${pad(p.pence)} £`);
const priceForms = (p: Price): string[] => {
  const d = p.pence === 0 ? [`${p.pounds}`, `${p.pounds}.00`, `${p.pounds},00`] : [];
  const n = [`${p.pounds}.${pad(p.pence)}`, `${p.pounds},${pad(p.pence)}`, ...d];
  return n.flatMap((x) => [x, `£${x}`, `${x}£`, `${x} £`]);
};
/** Le prix dit en toutes lettres (version lue : la réponse en chiffres n'est pas à recopier). */
const priceWords = (p: Price) => `${numberWord(p.pounds)} pounds ${numberWord(p.pence)}`;
const ITEMS = ['cake', 'juice', 'book', 'ticket', 'sandwich', 'pencil case'] as const;
const ITEMS_FR: Readonly<Record<(typeof ITEMS)[number], string>> = {
  cake: 'le gâteau',
  juice: 'le jus',
  book: 'le livre',
  ticket: 'le billet',
  sandwich: 'le sandwich',
  'pencil case': 'la trousse',
};

/** Prix « piège » : 3 et 13 (three / thirteen), 50 et 15 (fifty / fifteen). */
const PRICE_POOL: readonly Price[] = [3, 4, 5, 6, 7, 8, 9].flatMap((pounds) =>
  [30, 40, 50, 60, 70, 80, 90].filter((pence) => pence / 10 !== pounds).map((pence) => ({ pounds, pence })),
);
function priceTraps(p: Price): { p: Price; why: string }[] {
  return [
    {
      p: { pounds: p.pounds, pence: p.pence / 10 + 10 },
      why: `« ${wordOf(p.pence) ?? p.pence} » (${p.pence}) finit par -ty ; « ${wordOf(p.pence / 10 + 10) ?? ''} » (${p.pence / 10 + 10}) finit par -teen.`,
    },
    {
      p: { pounds: p.pounds + 10, pence: p.pence },
      why: `« ${hourWord(p.pounds)} » = ${p.pounds}. Treize, quatorze… finissent par -teen.`,
    },
    {
      p: { pounds: p.pence / 10, pence: p.pounds * 10 },
      why: 'On dit d’abord les pounds (livres), puis les pence : l’ordre ne change pas.',
    },
  ];
}

const suffix = (d: number) => {
  if (d >= 11 && d <= 13) return 'th';
  if (d % 10 === 1) return 'st';
  if (d % 10 === 2) return 'nd';
  if (d % 10 === 3) return 'rd';
  return 'th';
};
const ord = (d: number) => `${d}${suffix(d)}`;
const monthFr = (en: string) => MONTHS.find((m) => m.en === en)?.fr ?? en;
/** Jours faciles à confondre à l'oral : thirteenth / thirtieth, twelfth / twentieth… */
const TWIN_DAY: Readonly<Record<number, number>> = {
  13: 30,
  30: 13,
  12: 20,
  20: 12,
  3: 23,
  23: 3,
  2: 22,
  22: 2,
  1: 21,
  21: 1,
};
const TWIN_MONTH: Readonly<Record<string, string>> = {
  June: 'July',
  July: 'June',
  March: 'May',
  May: 'March',
  January: 'June',
  April: 'August',
  August: 'April',
};
const DATE_DAYS = Object.keys(TWIN_DAY).map(Number);
const DATE_MONTHS = Object.keys(TWIN_MONTH);
const dateFr = (d: number, m: string) => `${d === 1 ? '1er' : d} ${monthFr(m)}`;
/**
 * Jours dits en lettres : « second » et « twenty-first » sont cités (ecoute-faits.ts) ; « first » et
 * « twenty-second » en reprennent les deux parties. Le niveau 3 ne tire que ces jours.
 */
const DAY_WORDS: Readonly<Record<number, string>> = {
  1: 'first',
  2: 'second',
  21: 'twenty-first',
  22: 'twenty-second',
};
const SPELLED_DAYS = Object.keys(DAY_WORDS).map(Number);

/** Niveau 1 : un prix rond ou un mois, 3 propositions très différentes. */
function priceDateDiscover(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const values = [1, 2, 5, 10, 20, 50];
    const i = rng.int(0, values.length - 1);
    const v = at(values, i);
    const s = scene(i);
    const others = some(
      rng,
      values.filter((x) => x !== v),
      2,
    );
    const { answer, traps } = choice(
      rng,
      `${v} £`,
      others.map((o) => ({ label: `${o} £`, why: `${o} se dit « ${hourWord(o)} ». Écoute bien le nombre.` })),
    );
    const said = `That’s £${v}, please.`;
    return {
      ...listenOrRead(
        rng,
        said,
        `Écoute le vendeur, au marché de ${s.who}. Combien ça coûte ?`,
        `${s.who} lit le prix :`,
        { ask: 'Combien ça coûte ?' },
      ),
      answer,
      traps,
      hint: 'Le prix, c’est le nombre juste avant « please ».',
      steps: [`La phrase dit : « ${said} »`, `£ = la monnaie anglaise. Réponse : **${v} £**`],
    };
  }
  const mi = rng.int(0, MONTHS.length - 1);
  const m = at(MONTHS, mi);
  const s = scene(mi);
  const others = some(
    rng,
    MONTHS.filter((x) => x !== m),
    2,
  );
  const { answer, traps } = choice(
    rng,
    m.fr,
    others.map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
  );
  const said = `My birthday is in ${m.en}.`;
  return {
    ...listenOrRead(
      rng,
      said,
      `Écoute ${s.who}, ${s.day}. En quel mois est son anniversaire ?`,
      `${s.who} dit, ${s.day} :`,
      { ask: 'Quel mois ?' },
    ),
    answer,
    traps,
    hint: 'Le mois est le dernier mot de la phrase.',
    steps: [`La phrase dit : « ${said} »`, `« ${m.en} » = ${m.fr}. Réponse : **${m.fr}**`],
  };
}

/** Niveau 2 : prix ou date proches (thirteen / thirty, June / July). */
function priceDateRecognise(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const i = rng.int(0, PRICE_POOL.length - 1);
    const p = at(PRICE_POOL, i);
    const s = scene(i);
    const item = at(ITEMS, i % ITEMS.length);
    const { answer, traps } = choice(
      rng,
      priceFr(p),
      priceTraps(p).map((x) => ({ label: priceFr(x.p), why: x.why })),
    );
    const said = `The ${item} is ${priceEn(p)}.`;
    return {
      ...listenOrRead(
        rng,
        said,
        `Écoute ${s.who}, ${s.day}. Combien coûte ${ITEMS_FR[item]} ?`,
        `${s.who} lit l’étiquette, ${s.day} :`,
        { ask: 'Combien ça coûte ?', written: `The ${item} is ${priceWords(p)}.` },
      ),
      answer,
      traps,
      hint: 'D’abord les pounds (livres), puis les pence. -teen ou -ty ?',
      steps: [
        `La phrase dit : « ${said} »`,
        'On dit les pounds (livres), puis les pence.',
        `Réponse : **${priceFr(p)}**`,
      ],
    };
  }
  const di = rng.int(0, DATE_DAYS.length * DATE_MONTHS.length - 1);
  const d = at(DATE_DAYS, di % DATE_DAYS.length);
  const m = at(DATE_MONTHS, Math.floor(di / DATE_DAYS.length));
  const s = scene(di);
  const twinD = TWIN_DAY[d] ?? d + 10;
  const twinM = TWIN_MONTH[m] ?? m;
  const { answer, traps } = choice(rng, dateFr(d, m), [
    { label: dateFr(twinD, m), why: `${ord(d)} et ${ord(twinD)} se ressemblent : écoute bien la fin du nombre.` },
    { label: dateFr(d, twinM), why: `« ${twinM} » = ${monthFr(twinM)} : ce n’est pas le mois entendu.` },
    { label: dateFr(twinD, twinM), why: 'Le jour et le mois sont faux.' },
  ]);
  const said = `The ${eventEn(s.event)} is on the ${ord(d)} of ${m}.`;
  return {
    ...listenOrRead(
      rng,
      said,
      `Écoute ${s.who}, ${s.day}. Quelle est la date ${du(s.event)} ?`,
      `${s.who} écrit la date, ${s.day} :`,
      { ask: 'Quelle date ?' },
    ),
    answer,
    traps,
    hint: 'Une date : « the », le jour (1st, 2nd, 3rd, 4th…), « of », puis le mois.',
    steps: [
      `La phrase dit : « ${said} »`,
      `Le jour : ${ord(d)} = ${d}. Le mois : ${m} = ${monthFr(m)}.`,
      `Réponse : **${dateFr(d, m)}**`,
    ],
  };
}

/** Niveau 3 : écrire le prix entendu, ou compléter la date entendue. */
function priceDateWrite(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const i = rng.int(0, PRICE_POOL.length - 1);
    const p = at(PRICE_POOL, i);
    const s = scene(i);
    const said = `That’s ${priceEn(p)}, please.`;
    return {
      ...listenOrRead(
        rng,
        said,
        `Écoute le vendeur, ${s.day}, au café de ${s.who}. Écris le prix en chiffres (exemple : 2.50).`,
        `Au café de ${s.who}, le vendeur dit le prix. Écris-le en chiffres (exemple : 2.50) :`,
        { written: `That’s ${priceWords(p)}, please.` },
      ),
      answer: { kind: 'text', accepted: priceForms(p) },
      traps: priceTraps(p)
        .slice(0, 2)
        .map((x) => ({ text: priceEn(x.p).replace('£', ''), why: x.why })),
      hint: 'Le premier nombre, ce sont les pounds (livres). Le second, ce sont les pence.',
      steps: [`La phrase dit : « ${said} »`, `Réponse : **${priceEn(p)}**`],
    };
  }
  const di = rng.int(0, SPELLED_DAYS.length * DATE_MONTHS.length - 1);
  const d = at(SPELLED_DAYS, di % SPELLED_DAYS.length);
  const m = at(DATE_MONTHS, Math.floor(di / SPELLED_DAYS.length));
  const s = scene(di);
  const options = shuffledOther(rng, [
    m,
    TWIN_MONTH[m] ?? 'June',
    ...some(rng, ['September', 'October', 'November', 'December'], 2),
  ]);
  const said = `The ${eventEn(s.event)} is on the ${ord(d)} of ${m}.`;
  return {
    ...listenOrRead(
      rng,
      said,
      `Écoute ${s.who}, ${s.day}, et complète la date ${du(s.event)} : le jour en chiffres, puis le mois.`,
      `${s.who} dit la date ${du(s.event)}, ${s.day}. Complète : le jour en chiffres, puis le mois.`,
      { written: `The ${eventEn(s.event)} is on the ${DAY_WORDS[d]} of ${m}.` },
    ),
    answer: {
      kind: 'cloze',
      parts: ['Date: ', ' ', ''],
      blanks: [
        { mode: 'text', accepted: [String(d), ord(d)] },
        { mode: 'list', options, correct: options.indexOf(m) },
      ],
    },
    hint: 'Le jour vient après « the », le mois après « of ».',
    steps: [`La phrase dit : « ${said} »`, `${ord(d)} = ${d} ; ${m} = ${monthFr(m)}.`, `Réponse : **${d} ${m}**`],
  };
}

/** Niveau 4 : écrire une date en anglais (1st, 2nd, 3rd, 11th, 12th, 13th…), sans aide. */
function dateWrite(rng: Rng): QuestionDraft {
  const d = rng.pick([1, 2, 3, 11, 12, 13, 21, 22, 23, 31]);
  const m = rng.pick(d === 31 ? ['January', 'March', 'May', 'July', 'October', 'December'] : MONTHS.map((x) => x.en));
  const o = ord(d);
  const accepted = full([
    `the ${o} of ${m}`,
    `${o} of ${m}`,
    `${o} ${m}`,
    `the ${o} ${m}`,
    `${m} ${o}`,
    `${m} the ${o}`,
  ]);
  const wrongSuffix = d >= 11 && d <= 13 ? `${d}${['st', 'nd', 'rd'][d - 11]}` : `${d}th`;
  return {
    prompt: `Écris en anglais la date du ${dateFr(d, m)}, comme on la dit : « the … of … » (le jour en chiffres).`,
    answer: { kind: 'text', accepted },
    traps: [
      {
        text: `the ${wrongSuffix} of ${m}`,
        why:
          d >= 11 && d <= 13
            ? '11, 12 et 13 sont des exceptions : ils finissent tous par -th (11th, 12th, 13th).'
            : `${d} finit par ${d % 10} : on écrit ${o} (1st, 2nd, 3rd).`,
      },
      { text: `the ${d} of ${m}`, why: `Dans une date, le jour est un nombre ordinal : ${o}.` },
      { text: `the ${o} of ${monthFr(m)}`, why: `Le mois s’écrit en anglais, avec une majuscule : ${m}.` },
    ],
    hint: 'Pense à la fin du nombre : 1st, 2nd, 3rd… mais attention à 11, 12 et 13.',
    steps: [`Le jour : ${d} → ${o}. Le mois : ${monthFr(m)} → ${m}.`, `Réponse : **the ${o} of ${m}**`],
  };
}

/** Niveau 5 : un message d'invitation (date, heure, prix) ; choisir le bon résumé en français. */
function invitation(rng: Rng): QuestionDraft {
  const di = rng.int(0, DATE_DAYS.length - 1);
  const d = at(DATE_DAYS, di);
  const m = rng.pick(DATE_MONTHS);
  const p = rng.pick(PRICE_POOL);
  const who = rng.pick(WHO);
  const lines = [
    `Hi, it’s ${who}!`,
    `Our school fair is on the ${ord(d)} of ${m}.`,
    `Tickets are ${priceEn(p)}.`,
    'See you there!',
  ];
  const twinD = TWIN_DAY[d] ?? d;
  const twinM = TWIN_MONTH[m] ?? m;
  const [teen] = priceTraps(p);
  const sum = (dd: number, mm: string, pp: Price) => `${dateFr(dd, mm)} — ${priceFr(pp)}`;
  const { answer, traps } = choice(rng, sum(d, m, p), [
    { label: sum(twinD, m, p), why: `${ord(d)} et ${ord(twinD)} se ressemblent : relis le jour.` },
    { label: sum(d, twinM, p), why: `« ${twinM} » = ${monthFr(twinM)} : ce n’est pas le mois du message.` },
    ...(teen ? [{ label: sum(d, m, teen.p), why: teen.why }] : []),
  ]);
  const read = rng.int(0, 2) === 0;
  return {
    prompt: read
      ? 'Lis l’invitation et choisis le bon résumé pour ta famille : la date et le prix du billet.'
      : 'Écoute l’invitation et choisis le bon résumé pour ta famille : la date et le prix du billet.',
    ...(read
      ? { figure: { kind: 'document' as const, title: 'School fair', lines, credit: 'Écrit pour l’exercice.' } }
      : { audio: { text: lines.join(' '), lang: EN } }),
    answer,
    traps,
    hint: 'Repère deux informations : la date (« on the … of … ») et le prix (« £ »).',
    steps: [
      `Date : « the ${ord(d)} of ${m} » = ${dateFr(d, m)}.`,
      `Prix : « ${priceEn(p)} » = ${priceFr(p)}.`,
      `Réponse : **${sum(d, m, p)}**`,
    ],
  };
}

const pricesDates: Skill = {
  id: 'acm2-prix-dates',
  title: 'Prix et dates',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un prix : d’abord les **pounds** (livres, la monnaie anglaise, signe £), puis les **pence**. « That’s £8.37, please. »',
      'Une date se dit avec un nombre **ordinal** : on the twenty-first of June = le 21 juin.',
      'Écoute la fin des nombres : thirteen (13) ou thirty (30) ? Et 1st, 2nd, 3rd, mais 11th, 12th, 13th.',
    ],
    source: source(
      'Prix : British Council, « Ordering food in a café » ; monnaie : TLFi, « pence ». Dates : « At nine o’clock on Monday », « Understanding numbers », « Prepositions of time ».',
    ),
    sources: [
      ...PROGRAMMES,
      'bc-teens-cafe',
      'bck-chant-nine-oclock',
      'bc-teens-numbers',
      'bc-prepositions-time',
      'cnrtl-pence',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return priceDateDiscover(rng);
    if (level === 2) return priceDateRecognise(rng);
    if (level === 3) return priceDateWrite(rng);
    if (level === 4) return dateWrite(rng);
    return invitation(rng);
  },
};

// ——— 3. Dialogue court ———

const DRINKS = ['an apple juice', 'an orange juice', 'a milkshake', 'some water'] as const;
const DRINKS_FR: Readonly<Record<(typeof DRINKS)[number], string>> = {
  'an apple juice': 'un jus de pomme',
  'an orange juice': 'un jus d’orange',
  'a milkshake': 'un milk-shake',
  'some water': 'de l’eau',
};
const FOODS = [
  ['a cheeseburger', 'a double cheeseburger'],
  ['a pizza', 'a salad'],
  ['a sandwich', 'a banana cake'],
] as const;
const FOODS_FR: Readonly<Record<string, string>> = {
  'a cheeseburger': 'un cheeseburger',
  'a double cheeseburger': 'un double cheeseburger',
  'a pizza': 'une pizza',
  'a salad': 'une salade',
  'a sandwich': 'un sandwich',
  'a banana cake': 'un gâteau à la banane',
};

/** Niveau 1 : entendre une question et dire ce qu'elle demande. */
function dialogueQuestion(rng: Rng): QuestionDraft {
  const i = rng.int(0, QUESTIONS.length - 1);
  const q = at(QUESTIONS, i);
  const s = scene(i);
  const others = some(
    rng,
    QUESTIONS.filter((x) => x !== q),
    2,
  );
  const { answer, traps } = choice(
    rng,
    q.topic,
    others.map((o) => ({ label: o.topic, why: `Pour demander ${o.topic}, on dit « ${o.en} ».` })),
  );
  return {
    ...listenOrRead(
      rng,
      q.en,
      `Écoute la question posée à ${s.who}. Que veut savoir la personne ?`,
      `On demande à ${s.who} :`,
      { ask: 'Que veut savoir la personne ?' },
    ),
    answer,
    traps,
    hint: 'Repère le premier mot de la question : How much, What time, What…, Would you like…',
    steps: [`La question est « ${q.en} ».`, `Elle demande ${q.topic}. Réponse : **${q.topic}**`],
  };
}

/** Questions et réponses du dialogue (transcriptions du British Council). */
const REPLIES = [
  { q: 'How much is that?', a: 'That’s £8.37, please.' },
  { q: 'What time is the film?', a: 'At eight o’clock.' },
  { q: 'What’s your table number?', a: 'Table 3.' },
  { q: 'Would you like a drink?', a: 'Yes, an apple juice, please.' },
] as const;

/** Niveau 2 : associer 3 questions et leurs réponses. */
function dialogueMatch(rng: Rng): QuestionDraft {
  const rows = some(rng, REPLIES, 3);
  const left = rows.map((r) => r.q);
  const right = shuffledOther(
    rng,
    rows.map((r) => r.a),
  );
  return {
    prompt: `Associe chaque question à sa réponse : ${left.join(' / ')}`,
    answer: { kind: 'match', left, right, pairs: rows.map((r) => right.indexOf(r.a)) },
    hint: 'Repère much, time, table, drink, puis cherche la réponse qui parle de la même chose.',
    steps: [...rows.map((r) => `${r.q} → ${r.a}`), `Réponse : **${rows.map((r) => `${r.q} → ${r.a}`).join(' ; ')}**`],
  };
}

/** Niveau 3 : remettre un dialogue dans l'ordre. */
function dialogueOrder(rng: Rng): QuestionDraft {
  const cafe = rng.int(0, 1) === 0;
  // Le contexte de l'énoncé (prénom, jour) dépend des valeurs du dialogue.
  const i = cafe ? rng.int(0, 17) : rng.int(0, 4);
  const s = scene(cafe ? i : i * 6);
  const right = cafe
    ? [
        'Waiter: Next, please! What would you like?',
        `${s.who}: Can I have ${at(FOODS, Math.floor(i / 6))[0]}, please?`,
        'Waiter: Here you are. Anything else?',
        `${s.who}: No, thanks. How much is that?`,
        `Waiter: That’s ${priceEn(at(PRICE_POOL, i))}, please.`,
      ]
    : [
        'Jack: Hi! Would you like to come to the cinema tonight?',
        'Lily: Yes! What time is the film?',
        `Jack: At ${hourWord(i + 5)} o’clock.`,
        'Lily: OK. See you later!',
      ];
  const items = shuffledOther(rng, right);
  return {
    prompt: cafe
      ? `Remets dans l’ordre le dialogue de ${s.who} au café, ${s.day}.`
      : `Remets le dialogue dans l’ordre : Jack invite Lily au cinéma, ${s.day}.`,
    answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
    hint: cafe
      ? 'Le serveur parle en premier. Le prix vient à la fin, après « How much…? ».'
      : 'On salue et on invite d’abord ; on se dit au revoir à la fin.',
    steps: [
      'Une question vient toujours avant sa réponse.',
      ...right,
      `Réponse : **${right.map((l) => l.split(':')[0]).join(' → ')}**`,
    ],
  };
}

/** Niveau 4 : compléter les questions d'un dialogue, sans propositions. */
function dialogueCloze(rng: Rng): QuestionDraft {
  const all = [
    { before: 'Waiter: What would you ', words: ['like', 'want'], after: '?', topic: 'demander ce que l’on veut' },
    { before: 'Customer: Can I ', words: ['have', 'get'], after: ' a burger, please?', topic: 'commander' },
    { before: 'Customer: How ', words: ['much'], after: ' is that?', topic: 'demander le prix' },
    { before: 'Jack: What ', words: ['time'], after: ' is the film?', topic: 'demander l’heure' },
  ];
  const rows = some(rng, [0, 1, 2, 3], 3)
    .sort((a, b) => a - b)
    .map((i) => at(all, i));
  const parts: string[] = [];
  let carry = '';
  rows.forEach((r, i) => {
    parts.push(`${carry}${i === 0 ? '' : ' / '}${r.before}`);
    carry = r.after;
  });
  parts.push(carry);
  return {
    prompt: `Complète ces questions, un mot par trou. Elles servent à : ${rows.map((r) => r.topic).join(', ')}.`,
    answer: { kind: 'cloze', parts, blanks: rows.map((r) => ({ mode: 'text' as const, accepted: r.words })) },
    traps: [],
    hint: 'Pense aux questions apprises : What would you…? Can I…? How… is that? What… is the film?',
    steps: [
      'What would you like? = Que veux-tu ? Can I have…? = Puis-je avoir… ?',
      'How much is that? = Combien ça coûte ? What time…? = À quelle heure… ?',
      `Réponse : **${rows.map((r) => r.words[0]).join(', ')}**`,
    ],
  };
}

/** Niveau 5 : un dialogue au café entendu en entier ; retrouver un détail. */
function cafeDialogue(rng: Rng): QuestionDraft {
  const fi = rng.int(0, FOODS.length - 1);
  const pair = at(FOODS, fi);
  const pickIdx = rng.int(0, 1);
  const food = at(pair, pickIdx);
  const notFood = at(pair, 1 - pickIdx);
  const di = rng.int(0, DRINKS.length - 1);
  const drink = at(DRINKS, di);
  const pi = rng.int(0, PRICE_POOL.length - 1);
  const price = at(PRICE_POOL, pi);
  const ask = rng.int(0, 2);
  // Le prénom et le jour de l'énoncé dépendent de la réponse demandée (un même énoncé = une même réponse).
  const s = scene([fi * 2 + pickIdx, di, pi][ask] ?? 0);
  const who = s.who;
  // Le serveur propose deux plats : il faut retenir celui qui est choisi.
  const lines = [
    `Waiter: Hello! Would you like ${pair[0]} or ${pair[1]}?`,
    `${who}: ${cap(food)}, please.`,
    'Waiter: Would you like a drink?',
    `${who}: Yes, can I have ${drink}, please?`,
    'Waiter: OK. Anything else?',
    `${who}: No, thanks. How much is that?`,
    `Waiter: That’s ${priceEn(price)}, please.`,
  ];
  const read = rng.int(0, 2) === 0;
  const intro = read ? `Lis le dialogue de ${who} au café, ${s.day}.` : `Écoute ${who} au café, ${s.day}.`;
  let question: string;
  let good: string;
  let wrong: { label: string; why: string }[];
  if (ask === 0) {
    question = `Que mange ${who} ?`;
    good = FOODS_FR[food] ?? food;
    wrong = [
      { label: FOODS_FR[notFood] ?? notFood, why: 'Le serveur le propose, mais ce n’est pas ce qui est choisi.' },
      ...FOODS.filter((_, i) => i !== fi)
        .slice(0, 2)
        .map((p) => ({ label: FOODS_FR[p[0]] ?? p[0], why: 'Ce plat n’est pas dans le dialogue.' })),
    ];
  } else if (ask === 1) {
    question = `Que boit ${who} ?`;
    good = DRINKS_FR[drink];
    wrong = DRINKS.filter((x) => x !== drink).map((x) => ({
      label: DRINKS_FR[x],
      why: `« ${x} » = ${DRINKS_FR[x]} : ce n’est pas la boisson commandée.`,
    }));
  } else {
    question = `Combien doit payer ${who} ?`;
    good = priceFr(price);
    wrong = priceTraps(price).map((x) => ({ label: priceFr(x.p), why: x.why }));
  }
  const { answer, traps } = choice(rng, good, wrong);
  return {
    prompt: `${intro} ${question}`,
    ...(read
      ? { figure: { kind: 'document' as const, title: 'At the café', lines, credit: 'Écrit pour l’exercice.' } }
      : { audio: { text: lines.join(' '), lang: EN } }),
    answer,
    traps,
    hint:
      ask === 0
        ? 'Le serveur propose deux plats. Lequel est répété par le client ?'
        : ask === 1
          ? 'Écoute la réponse à « Would you like a drink? ».'
          : 'Écoute la réponse à « How much is that? ».',
    steps: [
      ask === 0
        ? `« Would you like ${pair[0]} or ${pair[1]}? » — « ${cap(food)}, please. »`
        : ask === 1
          ? `« Would you like a drink? » — « Yes, can I have ${drink}, please? »`
          : `« How much is that? » — « That’s ${priceEn(price)}, please. »`,
      `Réponse : **${good}**`,
    ],
  };
}

const shortDialogue: Skill = {
  id: 'acm2-dialogue',
  title: 'Comprendre un dialogue court',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Dans un **dialogue**, chaque question attend sa réponse. How much is that? → That’s £3, please.',
      'What time is the film? → At 8 o’clock. What would you like? → Can I have a burger, please?',
      'Écoute le premier mot de la question : il te dit quoi chercher (un prix, une heure, une chose).',
    ],
    source: source('Dialogues : British Council, « Ordering food in a café » et « Inviting someone to the cinema ».'),
    sources: [...PROGRAMMES, 'bc-teens-cafe', 'bc-teens-cinema'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return dialogueQuestion(rng);
    if (level === 2) return dialogueMatch(rng);
    if (level === 3) return dialogueOrder(rng);
    if (level === 4) return dialogueCloze(rng);
    return cafeDialogue(rng);
  },
};

// ——— 4. Repères culturels : pays anglophones et fêtes ———

const fixed = FESTIVALS.filter((f) => f.day !== undefined);
const names = (f: Festival) => [f.en, ...(f.alt ?? [])];

/** Niveau 1 : une date, une fête ; ou un pays anglophone parmi 3. */
function cultureDiscover(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const f = rng.pick(fixed);
    const { answer, traps } = choice(
      rng,
      f.en,
      fixed.filter((x) => x !== f).map((x) => ({ label: x.en, why: `${x.en} a lieu le ${x.date}.` })),
    );
    return {
      prompt: `Quelle fête a lieu le ${f.date} ?`,
      answer,
      traps,
      hint: f.clue,
      steps: [`${f.en} : ${f.custom}.`, `Réponse : **${f.en}**`],
    };
  }
  const c = rng.pick(ENGLISH_COUNTRIES);
  const { answer, traps } = choice(
    rng,
    c.fr,
    some(rng, OTHER_COUNTRIES, 2).map((o) => ({ label: o.fr, why: o.why })),
  );
  return {
    prompt: 'Dans lequel de ces pays parle-t-on anglais ?',
    answer,
    traps,
    hint: 'Cherche un pays où l’anglais est la langue de tous les jours.',
    steps: [`${cap(c.fr)} (${c.en}) est un pays anglophone.`, `Réponse : **${c.fr}**`],
  };
}

/** Niveau 2 : la tradition d'une fête (4 propositions), ou associer 3 fêtes et leur date. */
function cultureRecognise(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const f = rng.pick(FESTIVALS);
    const { answer, traps } = choice(
      rng,
      f.custom,
      FESTIVALS.filter((x) => x !== f).map((x) => ({ label: x.custom, why: `C’est la tradition de ${x.en}.` })),
    );
    return {
      prompt: `Que voit-on pour ${f.en} (${f.date}) ?`,
      answer,
      traps,
      hint: 'Lis bien le nom de la fête, puis écarte les traditions qui vont avec d’autres fêtes.',
      steps: [`${f.en} : ${f.custom}.`, `Réponse : **${f.custom}**`],
    };
  }
  const rows = some(rng, FESTIVALS, 3);
  const left = rows.map((f) => f.en);
  const right = shuffledOther(
    rng,
    rows.map((f) => f.date),
  );
  return {
    prompt: `Associe chaque fête à sa date : ${left.join(', ')}.`,
    answer: { kind: 'match', left, right, pairs: rows.map((f) => right.indexOf(f.date)) },
    hint: 'Commence par la fête dont tu es le plus sûr, puis range les autres dans l’ordre de l’année.',
    steps: [
      ...rows.map((f) => `${f.en} → ${f.date}`),
      `Réponse : **${rows.map((f) => `${f.en} = ${f.date}`).join(' ; ')}**`,
    ],
  };
}

/** Niveau 3 : compléter la date d'une fête (jour en chiffres, mois en anglais). */
function cultureCloze(rng: Rng): QuestionDraft {
  const f = rng.pick(fixed);
  const d = f.day ?? 1;
  const m = f.month ?? 'January';
  const options = shuffledOther(
    rng,
    fixed.map((x) => x.month ?? ''),
  );
  return {
    prompt: `Complète la date de ${f.en} : le jour en chiffres, puis le mois.`,
    answer: {
      kind: 'cloze',
      parts: [`${f.en} is on `, ' ', '.'],
      blanks: [
        { mode: 'text', accepted: [String(d), ord(d), `the ${ord(d)}`] },
        { mode: 'list', options, correct: options.indexOf(m) },
      ],
    },
    hint: f.clue,
    steps: [`${f.en} a lieu le ${f.date}.`, `Réponse : **${f.en} is on ${d} ${m}.**`],
  };
}

/** Niveau 4 : écrire le nom anglais d'une fête d'après sa description. */
function cultureName(rng: Rng): QuestionDraft {
  const f = rng.pick(FESTIVALS);
  const others = FESTIVALS.filter((x) => x !== f);
  return {
    prompt: `Écris le nom anglais de la fête : ${f.date}, ${f.custom}.`,
    answer: { kind: 'text', accepted: names(f) },
    traps: [
      { text: f.typo, why: `Presque ! Vérifie l’orthographe : ${f.en}.` },
      ...others.slice(0, 2).map((x) => ({ text: x.en, why: `${x.en} : ${x.date}, ${x.custom}.` })),
    ],
    hint: 'Relis la date, puis la tradition : quelle fête lui correspond ?',
    steps: [`${f.date}, ${f.custom} : c’est ${f.en}.`, `Réponse : **${f.en}**`],
  };
}

/** Niveau 5 : lire deux messages d'enfants anglophones ; retrouver la date de la fête de l'un. */
function cultureLetter(rng: Rng): QuestionDraft {
  const [a, b] = some(rng, ENGLISH_COUNTRIES, 2) as [
    (typeof ENGLISH_COUNTRIES)[number],
    (typeof ENGLISH_COUNTRIES)[number],
  ];
  const [fa, fb] = some(rng, FESTIVALS, 2) as [Festival, Festival];
  const [na, nb] = some(rng, ['Amy', 'Jack', 'Ella', 'Noah'], 2) as [string, string];
  const lines = [
    `${na}: I live in ${a.en}. My favourite festival is ${fa.en}.`,
    `${nb}: I live in ${b.en}. I love ${fb.en}!`,
  ];
  const { answer, traps } = choice(rng, fa.date, [
    { label: fb.date, why: `C’est la date de ${fb.en}, la fête préférée ${de(nb)}.` },
    ...FESTIVALS.filter((x) => x !== fa && x !== fb).map((x) => ({ label: x.date, why: `C’est la date de ${x.en}.` })),
  ]);
  return {
    prompt: `Lis les messages. Quand a lieu la fête préférée ${de(na)} ?`,
    figure: { kind: 'document', title: 'Pen pals', lines, credit: 'Écrit pour l’exercice.' },
    answer,
    traps,
    hint: `Sur la ligne ${de(na)}, cherche « My favourite festival is… ». Puis souviens-toi de sa date.`,
    steps: [
      `${na} écrit : « My favourite festival is ${fa.en}. »`,
      `${fa.en} : ${fa.date}.`,
      `Réponse : **${fa.date}**`,
    ],
  };
}

const culture: Skill = {
  id: 'acm2-reperes-culturels',
  title: 'Repères culturels : pays anglophones et fêtes',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'On parle anglais au Royaume-Uni, en Irlande, en Australie, au Canada : ce sont des **pays anglophones**.',
      'Halloween : 31 octobre. Bonfire Night : 5 novembre, avec des feux d’artifice. Christmas : 25 décembre.',
      'Pancake Day : un mardi de février ou de mars. On y mange des crêpes : c’est une **tradition**.',
    ],
    source: source(
      'Faits : British Council, LearnEnglish Teens, « Pancake Day », « Halloween », « Bonfire Night », « Christmas ». Langues : Union européenne, « Spain » et « Italy » ; TLFi, « brésilien ».',
    ),
    sources: [
      ...PROGRAMMES,
      'bc-teens-pancake-day',
      'bc-teens-halloween',
      'bc-teens-bonfire-night',
      'bc-teens-christmas',
      'eu-espagne',
      'eu-italie',
      'cnrtl-bresilien',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return cultureDiscover(rng);
    if (level === 2) return cultureRecognise(rng);
    if (level === 3) return cultureCloze(rng);
    if (level === 4) return cultureName(rng);
    return cultureLetter(rng);
  },
};

export const ENGLISH_LISTENING_CHAPTER: Chapter = {
  id: 'acm2-ecouter-comprendre',
  subject: 'anglais',
  grade: 'cm2',
  domain: 'langue',
  title: 'Écouter et comprendre',
  skills: [heardTime, pricesDates, shortDialogue, culture],
};
