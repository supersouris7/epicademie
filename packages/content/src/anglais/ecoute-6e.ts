import type { Chapter, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { digital, next, timeEn, timeForms, type Time } from './ecoute-cm2.ts';
import { numberWord } from './ecoute-faits.ts';
import {
  CULTURE,
  DETAILS,
  FORMS,
  GISTS,
  STORIES,
  THEMES,
  UPDATES,
  type Culture,
  type Detail,
  type Form,
} from './ecoute-6e-donnees.ts';
import { spellings } from './presentation-faits.ts';
import { at, shuffledOther, some } from './temps.ts';

/**
 * Anglais 6e — « Écouter et comprendre » (lot an-6e-08, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) : compréhension de l'oral et de l'écrit, nombres jusqu'à 100, heure, dates, cinq axes culturels.
 * Faits : voir ecoute-6e-faits.ts. Les deux premières notions mêlent des questions d'écoute et des questions à lire
 * (alternative quand l'appareil n'a pas de voix anglaise).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string) => `${PROGRAMME} — ${detail}.`;
const EN = 'en-GB';
const ABOUT = 'Écrit pour l’exercice.';

const doc = (title: string, lines: readonly string[]) => ({
  kind: 'document' as const,
  title,
  lines: [...lines],
  credit: ABOUT,
});

/** Message entendu, ou affiché (une question sur trois) quand la voix anglaise manque. */
function heard(
  rng: Rng,
  lines: readonly string[],
  context: string,
  question: string,
): Pick<QuestionDraft, 'prompt' | 'audio' | 'figure'> {
  if (rng.int(0, 2) === 0) return { prompt: `${context} Lis le message. ${question}`, figure: doc('Message', lines) };
  return { prompt: `${context} Écoute le message. ${question}`, audio: { text: lines.join(' '), lang: EN } };
}

/** Réponse saisie en français : avec ou sans article, avec ou sans point. */
const french = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);

// ——— 1. Comprendre un message court ———

const GIST_HOW = 'Cherche les **mots-clés** : plusieurs mots du même domaine donnent le thème du message.';

/** Niveaux 1 et 2 (thème) : 3 thèmes éloignés. */
function gist(rng: Rng): QuestionDraft {
  const m = rng.pick(GISTS);
  const wrong = some(
    rng,
    THEMES.filter((t) => t !== m.theme && !(m.not ?? []).includes(t)),
    2,
  );
  const { answer, traps } = choice(
    rng,
    m.theme,
    wrong.map((t) => ({ label: t, why: `Aucun mot du message ne parle de ce thème : « ${t} ». Repère ${m.keys}.` })),
  );
  return {
    ...heard(rng, m.lines, m.context, 'De quoi parle-t-il ?'),
    answer,
    traps,
    hint: 'Ne traduis pas tout : retiens deux ou trois mots que tu connais, puis demande-toi ce qui les relie.',
    steps: [GIST_HOW, `Ici : ${m.keys}.`, `Réponse : **${m.theme}**`],
  };
}

/** Niveau 2 : un détail précis parmi 4 propositions entendues ou voisines. */
function detail(rng: Rng): QuestionDraft {
  const d: Detail = rng.pick(DETAILS);
  const { answer, traps } = choice(rng, d.good, d.wrong);
  return {
    ...heard(rng, d.lines, d.context, d.question),
    answer,
    traps,
    hint: 'Plusieurs mots proposés peuvent être dans le message. Écoute les petits mots qui les relient : « not », « but », « after ».',
    steps: [`La phrase utile : « ${d.key} »`, d.why, `Réponse : **${d.good}**`],
  };
}

type Field = 'day' | 'place' | 'bring';
const FIELDS: readonly Field[] = ['day', 'place', 'bring'];
const ASK: Readonly<Record<Field, string>> = {
  day: 'Quel jour a lieu le rendez-vous ? Écris-le en français.',
  place: 'Où est le rendez-vous ? Écris le lieu en français.',
  bring: 'Quel objet faut-il apporter ? Écris-le en français.',
};
const LABEL: Readonly<Record<Field, string>> = { day: 'le jour', place: 'le lieu', bring: 'l’objet à apporter' };
const CLUE: Readonly<Record<Field, string>> = {
  day: 'Les jours anglais finissent tous par « day ». Lequel concerne le rendez-vous ?',
  place: 'Cherche la phrase qui commence par « Meet me » : le lieu suit « at » ou « in ».',
  bring: 'Cherche le verbe « bring » (apporter) : l’objet vient juste après.',
};

const formLines = (f: Form): readonly string[] => [
  `Hi, it’s ${f.from}.`,
  f.other,
  `${f.event} is on ${f.day.en}.`,
  `Meet me ${f.place.en}.`,
  `Please bring ${f.bring.en}.`,
  'Bye!',
];

/** Niveau 3 : écrire une information relevée dans un message. */
function writeInfo(rng: Rng): QuestionDraft {
  const f = rng.pick(FORMS);
  const field = rng.pick(FIELDS);
  const value = f[field];
  const lines = formLines(f);
  const traps: Trap[] = f.traps[field].map((t) => ({ text: t.fr, why: t.why }));
  const key = at(lines, field === 'day' ? 2 : field === 'place' ? 3 : 4);
  return {
    ...heard(rng, lines, `${f.from} laisse un message : ${f.topic}.`, ASK[field]),
    answer: { kind: 'text', accepted: french(value.accepted) },
    traps,
    hint: CLUE[field],
    steps: [
      `On cherche ${LABEL[field]}.`,
      `La phrase utile : « ${key} »`,
      `« ${value.en} » se traduit par « ${at(value.accepted, 0)} ».`,
      `Réponse : **${at(value.accepted, 0)}**`,
    ],
  };
}

/** Niveau 4 : remplir toute la fiche, sans propositions. */
function fillForm(rng: Rng): QuestionDraft {
  const f = rng.pick(FORMS);
  const lines = formLines(f);
  return {
    ...heard(rng, lines, `${f.from} laisse un message : ${f.topic}.`, 'Complète la fiche en français.'),
    answer: {
      kind: 'cloze',
      parts: ['Jour : ', ' · Lieu : ', ' · À apporter : ', ''],
      blanks: FIELDS.map((k) => ({ mode: 'text' as const, accepted: french(f[k].accepted) })),
    },
    hint: 'Une information à la fois : le jour, puis « Meet me… », puis « bring… ».',
    steps: [
      `Les phrases utiles : « ${lines.slice(2, 5).join(' ')} »`,
      `${FIELDS.map((k) => `« ${f[k].en} » = ${at(f[k].accepted, 0)}`).join(' ; ')}.`,
      'Attention : au début du message, un autre jour est cité ; il ne sert pas à la fiche.',
      `Réponse : **${FIELDS.map((k) => at(f[k].accepted, 0)).join(', ')}**`,
    ],
  };
}

/** Niveau 4 : relier cinq messages courts à un titre. */
function titles(rng: Rng): QuestionDraft {
  const picked: (typeof GISTS)[number][] = [];
  for (const m of rng.shuffle(GISTS))
    if (picked.length < 5 && picked.every((p) => p.theme !== m.theme && p.title !== m.title)) picked.push(m);
  const left = picked.map((m) => m.lines.join(' '));
  const right = shuffledOther(
    rng,
    picked.map((m) => m.title),
  );
  return {
    prompt: 'Associe chaque message à son titre.',
    figure: doc('Cinq messages', left),
    answer: { kind: 'match', left, right, pairs: picked.map((m) => right.indexOf(m.title)) },
    hint: 'Dans chaque message, entoure un mot-clé, puis cherche le titre qui lui correspond.',
    steps: [
      GIST_HOW,
      ...picked.slice(0, 2).map((m) => `« ${m.lines.join(' ')} » : ${m.keys}.`),
      `Réponse : **${picked.map((m) => m.title).join(', ')}**`,
    ],
  };
}

/** Niveau 5 : remettre un récit dans l'ordre des événements (first, then, finally ; be + ing). */
function story(rng: Rng): QuestionDraft {
  const s = rng.pick(STORIES);
  const items = shuffledOther(rng, s.actions);
  return {
    ...heard(rng, s.lines, `${s.from} raconte ses projets : ${s.topic}.`, 'Remets les actions dans l’ordre.'),
    answer: { kind: 'order', items, correct: s.actions.map((a) => items.indexOf(a)) },
    hint: 'Les actions ne sont pas toujours dites dans l’ordre : repère « first », « before that », « then », « finally ».',
    steps: [`Le message : « ${s.lines.join(' ')} »`, s.how, `Réponse : **${s.actions.join(', ')}**`],
  };
}

/** Niveau 5 : un message corrige une information (impératif négatif). */
function update(rng: Rng): QuestionDraft {
  const u = rng.pick(UPDATES);
  const { answer, traps } = choice(rng, u.good, u.wrong);
  return {
    ...heard(rng, u.lines, u.context, u.question),
    answer,
    traps,
    hint: 'Une information change en cours de route : écoute ce qui suit « not », « don’t » ou « but ».',
    steps: [`La phrase utile : « ${u.key} »`, u.why, `Réponse : **${u.good}**`],
  };
}

const message: Skill = {
  id: 'a6-message-court',
  title: 'Comprendre un message court',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Écoute d’abord pour le sens général, puis relève les **mots-clés** : qui, quoi, où, quand.',
      '« First », « then », « finally » sont des **connecteurs** : ils donnent l’ordre. « Before that » = avant cela ; « after » = après.',
      '« Don’t come on Monday » veut dire : ne viens pas lundi.',
    ],
    source: source('compréhension de l’oral et de l’écrit : sens général, mots-clés, informations, chronologie'),
    sources: ['anglais-college-2025'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return gist(rng);
    if (level === 2) return detail(rng);
    if (level === 3) return writeInfo(rng);
    if (level === 4) return rng.int(0, 1) === 0 ? titles(rng) : fillForm(rng);
    return rng.int(0, 1) === 0 ? story(rng) : update(rng);
  },
};

// ——— 2. Nombres, dates, heures ———

const MONTHS_FR: Readonly<Record<string, string>> = {
  January: 'janvier',
  February: 'février',
  March: 'mars',
  April: 'avril',
  May: 'mai',
  June: 'juin',
  July: 'juillet',
  August: 'août',
  September: 'septembre',
  October: 'octobre',
  November: 'novembre',
  December: 'décembre',
};
const MONTHS = Object.keys(MONTHS_FR);
const suffix = (d: number) => {
  if (d >= 11 && d <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][d % 10] ?? 'th';
};
interface Day {
  readonly d: number;
  readonly m: string;
}
/** Date écrite en anglais : 25th of June (la voix la lit « the twenty-fifth of June »). */
const dateEn = (x: Day) => `${x.d}${suffix(x.d)} of ${x.m}`;
const dateFr = (x: Day) => `${x.d === 1 ? '1er' : x.d} ${MONTHS_FR[x.m]}`;
const dateForms = (x: Day): string[] => {
  const month = MONTHS.indexOf(x.m) + 1;
  const mm = String(month).padStart(2, '0');
  const dd = String(x.d).padStart(2, '0');
  const days = x.d === 1 ? ['1er', '1', 'premier'] : [String(x.d)];
  const written = days.flatMap((d) => [`${d} ${MONTHS_FR[x.m]}`, `le ${d} ${MONTHS_FR[x.m]}`]);
  return french([...written, `${dd}/${mm}`, `${x.d}/${month}`, `${x.d}/${mm}`]);
};

/** Nombres que l'oreille confond : -teen / -ty. */
const TWINS: Readonly<Record<number, number>> = {
  13: 30,
  14: 40,
  15: 50,
  16: 60,
  17: 70,
  18: 80,
  19: 90,
  30: 13,
  40: 14,
  50: 15,
  60: 16,
  70: 17,
  80: 18,
  90: 19,
};
const TWIN_WHY = (heardN: number, other: number) =>
  `« ${numberWord(heardN)} » = ${heardN} ; « ${numberWord(other)} » = ${other}. La fin du mot change : -teen ou -ty.`;
const swapDigits = (n: number) => (n % 10) * 10 + Math.floor(n / 10);

/** Les nombres sont dits en lettres : la version lue ne souffle pas la réponse en chiffres. */
/** Contextes : la phrase entendue et sa question, choisis d'après le nombre (un énoncé = une réponse). */
const NUMBER_SCENES = [
  { who: 'au guichet', say: (n: string) => `Your ticket is number ${n}.`, ask: 'Quel est le numéro du billet ?' },
  { who: 'à la gare', say: (n: string) => `Take bus number ${n}.`, ask: 'Quel bus faut-il prendre ?' },
  { who: 'en classe', say: (n: string) => `Open your books at page ${n}.`, ask: 'Quelle page faut-il ouvrir ?' },
  { who: 'au zoo', say: (n: string) => `There are ${n} birds here.`, ask: 'Combien y a-t-il d’oiseaux ?' },
  {
    who: 'au magasin',
    say: (n: string) => `That’s ${n} pounds, please.`,
    ask: 'Quel prix faut-il payer, en livres anglaises (£) ?',
  },
] as const;
const WHO = ['Mia', 'Leo', 'Zoé', 'Sam', 'Nina', 'Hugo', 'Emma', 'Tom', 'Lisa', 'Paul'] as const;
const DAYS_FR = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
const MOMENTS = ['matin', 'midi', 'après-midi', 'soir', 'à la récréation', 'après les cours'] as const;
/**
 * Contexte tiré de l'indice de la réponse (420 contextes distincts) : un énoncé d'écoute n'attend qu'une réponse,
 * sans la souffler.
 */
const scene = (i: number) => `${at(WHO, i % 10)}, ${at(DAYS_FR, i % 7)} (${at(MOMENTS, Math.floor(i / 70) % 6)})`;

/** Niveau 1 : un nombre jusqu'à 20 ou une heure simple, 3 propositions éloignées. */
function discover(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const n = rng.int(1, 20);
    const s = at(NUMBER_SCENES, n % NUMBER_SCENES.length);
    const { answer, traps } = choice(
      rng,
      String(n),
      [(n % 20) + 5, ((n + 10) % 20) + 1]
        .filter((x) => x !== n)
        .map((x) => ({ label: String(x), why: `${x} se dit « ${numberWord(x)} ». Écoute bien le nombre.` })),
    );
    const said = s.say(numberWord(n));
    return {
      ...heard(rng, [said], `Message ${s.who} pour ${scene(n)}.`, s.ask),
      answer,
      traps,
      hint: 'Compte dans ta tête en anglais jusqu’au mot entendu.',
      steps: [`La phrase dit : « ${said} »`, `« ${numberWord(n)} » = ${n}.`, `Réponse : **${n}**`],
    };
  }
  const h = rng.int(1, 12);
  const t: Time = { h, m: rng.int(0, 1) * 30 };
  const said = `It’s ${timeEn(t)}.`;
  const other: Time = { h, m: 30 - t.m };
  const far: Time = { h: h > 6 ? h - 5 : h + 5, m: t.m };
  const { answer, traps } = choice(rng, digital(t), [
    { label: digital(other), why: '« o’clock » = heure pile ; « half past » = et demie.' },
    { label: digital(far), why: 'Écoute bien le nombre qui donne l’heure.' },
  ]);
  return {
    ...heard(rng, [said], `Une horloge parlante renseigne ${scene(t.h * 2 + t.m / 30)}.`, 'Quelle heure est-il ?'),
    answer,
    traps,
    hint: 'Repère le nombre, puis le petit mot : « o’clock » ou « half past » ?',
    steps: [
      `La phrase dit : « ${said} »`,
      '« o’clock » = pile ; « half past » = et demie.',
      `Réponse : **${digital(t)}**`,
    ],
  };
}

/** Niveau 2 : cas proches (-teen / -ty, quarter past / to, dates voisines). */
function recognise(rng: Rng): QuestionDraft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const n = rng.pick(Object.keys(TWINS).map(Number));
    const twin = TWINS[n] ?? n;
    const s = at(NUMBER_SCENES, n % NUMBER_SCENES.length);
    const wrong = [
      { label: String(twin), why: TWIN_WHY(n, twin) },
      { label: String(n + 1), why: `${n + 1} se dit « ${numberWord(n + 1)} ».` },
      { label: String(twin + 1), why: `${twin + 1} se dit « ${numberWord(twin + 1)} ».` },
    ];
    const { answer, traps } = choice(rng, String(n), wrong);
    const said = s.say(numberWord(n));
    return {
      ...heard(rng, [said], `Annonce ${s.who} pour ${scene(n)}.`, s.ask),
      answer,
      traps,
      hint: 'Écoute la fin du nombre : le son long de « -teen » ou le son bref de « -ty ».',
      steps: [`La phrase dit : « ${said} »`, TWIN_WHY(n, twin), `Réponse : **${n}**`],
    };
  }
  if (kind === 1) {
    const h = rng.int(1, 12);
    const t: Time = { h, m: rng.int(0, 1) === 0 ? 15 : 45 };
    const said = `The film starts at ${timeEn(t)}.`;
    const shown: Time = t.m === 15 ? { h, m: 45 } : { h: next(h), m: 15 };
    const { answer, traps } = choice(rng, digital(t), [
      { label: digital(shown), why: '« quarter past » = et quart ; « quarter to » = moins le quart.' },
      {
        label: digital({ h: next(t.h), m: t.m }),
        why:
          t.m === 15
            ? `« past » : l’heure nommée est passée, on est après ${t.h} h.`
            : `« to » : on va vers ${next(h)} h, on n’y est pas encore.`,
      },
      { label: digital({ h, m: 30 }), why: '« half past » = et demie. Ici on entend « quarter ».' },
    ]);
    return {
      ...heard(
        rng,
        [said],
        `Au cinéma avec ${scene(h * 2 + (t.m === 45 ? 1 : 0))}.`,
        'À quelle heure commence le film ?',
      ),
      answer,
      traps,
      hint: '« past » veut dire après l’heure, « to » avant l’heure.',
      steps: [
        `La phrase dit : « ${said} »`,
        t.m === 15 ? `« quarter past » = ${t.h} h et quart.` : `« quarter to » = ${next(t.h)} h moins le quart.`,
        `Réponse : **${digital(t)}**`,
      ],
    };
  }
  const mi = rng.int(0, MONTHS.length - 1);
  const x: Day = { d: rng.pick([2, 3, 5]), m: at(MONTHS, mi) };
  const nearMonth = at(MONTHS, (mi + 1) % 12);
  const { answer, traps } = choice(rng, dateFr(x), [
    { label: dateFr({ d: x.d + 10, m: x.m }), why: `On entend le ${x.d}, pas le ${x.d + 10}.` },
    { label: dateFr({ d: x.d + 20, m: x.m }), why: `On entend le ${x.d}, pas le ${x.d + 20}.` },
    { label: dateFr({ d: x.d, m: nearMonth }), why: `« ${nearMonth} » = ${MONTHS_FR[nearMonth]}. Écoute le mois.` },
  ]);
  const said = `The party is on the ${dateEn(x)}.`;
  return {
    ...heard(rng, [said], `Une invitation pour ${scene(mi * 6 + x.d)}.`, 'Quelle est la date de la fête ?'),
    answer,
    traps,
    hint: 'Deux informations : le numéro du jour, puis le mois.',
    steps: [
      `La phrase dit : « ${said} »`,
      'La date se dit avec un **nombre ordinal**, puis le mois.',
      `Réponse : **${dateFr(x)}**`,
    ],
  };
}

/** Niveau 3 : écrire en chiffres (nombre, heure) ou en français (date). */
function write(rng: Rng): QuestionDraft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const n = rng.int(21, 99);
    const s = at(NUMBER_SCENES, n % NUMBER_SCENES.length);
    const said = s.say(numberWord(n));
    const traps: Trap[] = [];
    if (n % 10 !== 0 && swapDigits(n) !== n)
      traps.push({
        text: String(swapDigits(n)),
        why: `L’anglais dit d’abord la dizaine, puis l’unité : « ${numberWord(n)} » = ${n}.`,
      });
    const twin = TWINS[n];
    if (twin) traps.push({ text: String(twin), why: TWIN_WHY(n, twin) });
    traps.push({
      text: String(n > 89 ? n - 10 : n + 10),
      why: `Vérifie la dizaine : « ${numberWord(n)} » = ${n}.`,
    });
    return {
      ...heard(rng, [said], `Information donnée ${s.who} à ${scene(n)}.`, `${s.ask} Écris le nombre en chiffres.`),
      answer: { kind: 'text', accepted: [String(n), `${n}.`] },
      traps,
      hint: 'Repère la dizaine (twenty, thirty…), puis l’unité qui suit.',
      steps: [`La phrase dit : « ${said} »`, `« ${numberWord(n)} » = ${n}.`, `Réponse : **${n}**`],
    };
  }
  if (kind === 1) {
    const h = rng.int(1, 12);
    const t: Time = { h, m: rng.pick([15, 30, 45]) };
    const said = `See you at ${timeEn(t)}.`;
    const wrong: Time = t.m === 45 ? { h: next(h), m: 45 } : { h: next(h), m: t.m };
    const wrong2: Time = t.m === 45 ? { h: next(h), m: 15 } : { h, m: t.m === 15 ? 45 : 15 };
    const accepted = [`${t.h}:${t.m}`, `${t.h}.${t.m}`, `${t.h}h${t.m}`, `${t.h} h ${t.m}`];
    if (t.h < 10) accepted.push(`0${t.h}:${t.m}`, `0${t.h}h${t.m}`);
    return {
      ...heard(
        rng,
        [said],
        `Un rendez-vous donné par ${scene(h * 4 + t.m / 15)}.`,
        'À quelle heure ? Écris-la en chiffres (exemple : 4:30).',
      ),
      answer: { kind: 'text', accepted: french(accepted) },
      traps: [
        { text: digital(wrong), why: '« past » = après l’heure nommée ; « to » = avant cette heure.' },
        { text: digital(wrong2), why: 'Ne confonds pas « quarter past » (et quart), « half past » et « quarter to ».' },
      ],
      hint: 'D’abord le petit mot : « past » ou « to » ? Puis l’heure nommée juste après.',
      steps: [
        `La phrase dit : « ${said} »`,
        '« past » = après l’heure ; « to » = avant l’heure.',
        `Réponse : **${digital(t)}**`,
      ],
    };
  }
  const x: Day = { d: rng.int(1, 31), m: at(MONTHS, rng.pick([0, 2, 4, 6, 7, 9, 11])) };
  const said = `My birthday is on the ${dateEn(x)}.`;
  const otherMonth = at(MONTHS, (MONTHS.indexOf(x.m) + 1) % 12);
  const otherDay: Day = { d: x.d > 21 ? x.d - 10 : x.d + 10, m: x.m };
  return {
    ...heard(
      rng,
      [said],
      `Un camarade parle de son anniversaire avec ${scene(MONTHS.indexOf(x.m) * 31 + x.d)}.`,
      'Écris la date en français (exemple : 4 avril).',
    ),
    answer: { kind: 'text', accepted: dateForms(x) },
    traps: [
      { text: dateFr(otherDay), why: `Réécoute le numéro du jour : c’est le ${x.d}.` },
      { text: dateFr({ d: Math.min(x.d, 28), m: otherMonth }), why: `« ${x.m} » = ${MONTHS_FR[x.m]}.` },
    ],
    hint: 'Le numéro vient d’abord, le mois ensuite.',
    steps: [`La phrase dit : « ${said} »`, `« ${x.m} » = ${MONTHS_FR[x.m]}.`, `Réponse : **${dateFr(x)}**`],
  };
}

const FIVES = [5, 10, 20, 25, 35, 40, 50, 55] as const;

/** Niveau 4 : dire une heure en anglais, relever une année, ou associer cinq heures (sans aide). */
function master(rng: Rng): QuestionDraft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const t: Time = { h: rng.int(1, 12), m: rng.pick([15, 45, ...FIVES]) };
    const before = t.m > 30;
    const n = before ? 60 - t.m : t.m;
    const word = n === 15 ? 'quarter' : numberWord(n);
    const accepted = timeForms(t);
    const wrong = [
      {
        text: `${word} ${before ? 'past' : 'to'} ${numberWord(t.h)}`,
        why: '« past » = après l’heure ; « to » = avant l’heure suivante.',
      },
      {
        text: `${word} ${before ? 'to' : 'past'} ${numberWord(before ? t.h : next(t.h))}`,
        why: 'Avec « past », on nomme l’heure passée ; avec « to », l’heure qui arrive.',
      },
    ];
    return {
      prompt: `L’horloge affiche ${digital(t)}. Écris cette heure en anglais, avec « past » ou « to ».`,
      answer: { kind: 'text', accepted },
      traps: wrong.filter((w) => !accepted.includes(w.text)),
      hint: 'Avant la demie : minutes + « past » + heure. Après : minutes qui restent + « to » + heure suivante.',
      steps: [
        before
          ? `Il reste ${n} minutes avant ${next(t.h)} h : « to ${numberWord(next(t.h))} ».`
          : `${n} minutes après ${t.h} h : « past ${numberWord(t.h)} ».`,
        `Réponse : **${timeEn(t)}**`,
      ],
    };
  }
  if (kind === 1) {
    const year = rng.int(1950, 2025);
    const said = `The museum opened in ${year}.`;
    const short = year % 100;
    // Écoute seulement : à lire, l'année serait à recopier (les autres questions du niveau se passent de voix).
    return {
      prompt: `Visite guidée avec ${scene(year - 1949)}. Écoute. En quelle année le musée a-t-il ouvert ? Écris-la en chiffres.`,
      audio: { text: said, lang: EN },
      answer: { kind: 'text', accepted: [String(year), `${year}.`, `en ${year}`] },
      traps: [
        { text: String(year + 10), why: 'Vérifie la dizaine de la fin de l’année.' },
        { text: String(short).padStart(2, '0'), why: 'Écris l’année entière, avec ses quatre chiffres.' },
      ],
      hint: 'Une année s’entend souvent en deux morceaux : le début, puis les deux derniers chiffres.',
      steps: [`La phrase dit : « ${said} »`, 'On écrit les quatre chiffres.', `Réponse : **${year}**`],
    };
  }
  const hours = some(
    rng,
    Array.from({ length: 12 }, (_, i) => i + 1),
    5,
  );
  const minutes = some(rng, [0, 15, 30, 45, ...FIVES], 5);
  const times = hours.map((h, i) => ({ h, m: at(minutes, i) }));
  const left = times.map((t) => timeEn(t));
  const right = shuffledOther(
    rng,
    times.map((t) => digital(t)),
  );
  return {
    prompt: 'Associe chaque heure écrite en anglais à l’horloge.',
    figure: doc('Cinq heures', left),
    answer: { kind: 'match', left, right, pairs: times.map((t) => right.indexOf(digital(t))) },
    hint: 'Commence par les « o’clock » et les « half past », puis traite les « to ».',
    steps: [
      '« past » : après l’heure nommée. « to » : avant l’heure nommée.',
      `Réponse : **${times.map((t) => `${timeEn(t)} = ${digital(t)}`).join(', ')}**`,
    ],
  };
}

const EVENTS = [
  { en: 'The carnival', fr: 'Le carnaval', place: 'outside the city hall' },
  { en: 'The school show', fr: 'Le spectacle de l’école', place: 'in the sports hall' },
  { en: 'The book fair', fr: 'La foire aux livres', place: 'in the library' },
  { en: 'The picnic', fr: 'Le pique-nique', place: 'in the park' },
] as const;

/** Heure saisie dans une fiche : 4:30, 4.30, 4h30, 4 h 30 ; « 3h » pour une heure pile. */
const clockForms = (t: Time): string[] => {
  const mm = String(t.m).padStart(2, '0');
  const pile = t.m === 0 ? [`${t.h}h`, `${t.h} h`] : [];
  return [digital(t), `${t.h}.${mm}`, `${t.h}h${mm}`, `${t.h} h ${mm}`, ...pile];
};

/** Niveau 5 : une annonce complète (date, horaires, prix) ; relever plusieurs informations. */
function announcement(rng: Rng): QuestionDraft {
  // Tout découle d'un seul indice : un contexte désigne une seule annonce.
  const i = rng.int(0, 419);
  const e = at(EVENTS, i % 4);
  const x: Day = { d: 2 + (i % 27), m: at(['April', 'May', 'June', 'July'], Math.floor(i / 4) % 4) };
  const start = 1 + (Math.floor(i / 3) % 4);
  const startT: Time = { h: start, m: i % 2 === 0 ? 0 : 30 };
  const endT: Time = { h: start + 2 + (Math.floor(i / 5) % 2), m: Math.floor(i / 7) % 2 === 0 ? 15 : 45 };
  const price = 2 + (Math.floor(i / 11) % 8);
  const lines = [
    `${e.en} is on the ${dateEn(x)}.`,
    `It starts at ${timeEn(startT)} ${e.place}.`,
    `It finishes at ${timeEn(endT)}.`,
    `Entry costs ${numberWord(price)} pounds, but it’s free for children.`,
  ];
  return {
    ...heard(
      rng,
      lines,
      `${e.fr} : une annonce pour ${scene(i)}.`,
      'Complète la fiche en chiffres (heures comme 4:30).',
    ),
    answer: {
      kind: 'cloze',
      parts: ['Jour du mois : ', ' · Début : ', ' · Fin : ', ' · Prix pour un adulte : ', ' £'],
      blanks: [
        { mode: 'text', accepted: [String(x.d)] },
        { mode: 'text', accepted: clockForms(startT) },
        { mode: 'text', accepted: clockForms(endT) },
        { mode: 'text', accepted: [String(price)] },
      ],
    },
    hint: 'Une information par phrase : la date, le début, la fin, puis le prix.',
    steps: [
      `L’annonce dit : « ${lines.join(' ')} »`,
      '« starts » = commence, « finishes » = finit ; « free for children » : gratuit pour les enfants seulement.',
      `Réponse : **${x.d}, ${digital(startT)}, ${digital(endT)}, ${price}**`,
    ],
  };
}

const numbers: Skill = {
  id: 'a6-nombres-dates-heures',
  title: 'Nombres, dates, heures',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Écoute la fin des nombres : **-teen** (thirteen, 13) ou **-ty** (thirty, 30). La date se dit avec un **nombre ordinal** : the 25th of June.',
      'Heure : **o’clock** (pile), half past (et demie), quarter **past** five = 5:15, quarter **to** six = 5:45.',
    ],
    source: source('compter jusqu’à 100, exprimer l’heure, les dates et l’année'),
    sources: [
      'anglais-college-2025',
      'bck-flashcards-1-12',
      'bck-flashcards-13-24',
      'bck-flashcards-10-1000',
      'bck-worksheet-10-100',
      'bck-tell-time',
      'bc-teens-numbers',
      'bck-chant-nine-oclock',
      'bc-prepositions-time',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return discover(rng);
    if (level === 2) return recognise(rng);
    if (level === 3) return write(rng);
    if (level === 4) return master(rng);
    return announcement(rng);
  },
};

// ——— 3. Repères culturels ———

const THEME_HINT: Readonly<Record<Culture['theme'], string>> = {
  fête: 'Pense à la saison, à ce que l’on mange ou à la couleur que l’on porte.',
  lieu: 'Pense à la carte du monde anglophone : quel pays, quel paysage ?',
  histoire: 'Pense aux livres et aux légendes que tu connais : de qui ou de quoi parle l’histoire ?',
};

const cultureStep = (c: Culture) => `À retenir : ${c.fact}`;

/** Niveaux 1 et 2 : QCM à 3 puis 4 propositions. */
function cultureChoice(rng: Rng, level: 1 | 2): QuestionDraft {
  const c = rng.pick(CULTURE);
  const { answer, traps } = choice(rng, c.answer, c.wrong.slice(0, level === 1 ? 2 : 3));
  return {
    prompt: c.question,
    answer,
    traps,
    hint: THEME_HINT[c.theme],
    steps: [cultureStep(c), `Réponse : **${c.answer}**`],
  };
}

/** Saisie courte : réponse en français (niveau 3) ou nom anglais (niveau 4). */
const typedPool = (english: boolean) => CULTURE.filter((c) => c.typed && Boolean(c.typed.english) === english);

function cultureType(c: Culture): QuestionDraft {
  const t = c.typed;
  if (!t) throw new Error(`pas de saisie pour ${c.id}`);
  return {
    prompt: t.prompt,
    answer: { kind: 'text', accepted: french(t.accepted.flatMap(spellings)) },
    traps: t.traps,
    hint: THEME_HINT[c.theme],
    steps: [cultureStep(c), `Réponse : **${at(t.accepted, 0)}**`],
  };
}

function culturePairs(rng: Rng, size: 3 | 5): QuestionDraft {
  const picked: Culture[] = [];
  for (const c of rng.shuffle(CULTURE))
    if (picked.length < size && picked.every((p) => p.pair[1] !== c.pair[1])) picked.push(c);
  const left = picked.map((c) => c.pair[0]);
  const right = shuffledOther(
    rng,
    picked.map((c) => c.pair[1]),
  );
  return {
    prompt: `Associe chaque repère à ce qui lui correspond : ${left.join(', ')}.`,
    answer: { kind: 'match', left, right, pairs: picked.map((c) => right.indexOf(c.pair[1])) },
    hint: 'Commence par le repère que tu connais le mieux : il en restera moins à placer.',
    steps: [
      'Chaque repère a un seul partenaire : une date, un pays ou un détail.',
      `Réponse : **${picked.map((c) => `${c.pair[0]} : ${c.pair[1]}`).join(' ; ')}**`,
    ],
  };
}

/** Niveau 5 : un document en anglais sur un repère ; l'identifier et le nommer. */
function cultureDocument(rng: Rng): QuestionDraft {
  const c = rng.pick(CULTURE.filter((x) => x.document));
  const d = c.document;
  if (!d) throw new Error('document absent');
  const { answer, traps } = choice(rng, d.good, d.wrong);
  return {
    prompt: `Lis ce texte en anglais. ${d.question}`,
    figure: doc(d.title, d.lines),
    answer,
    traps,
    hint: 'Relève les mots que tu reconnais : un lieu, une date, un personnage.',
    steps: [`Indices du texte : ${d.clues}.`, cultureStep(c), `Réponse : **${d.good}**`],
  };
}

const culture: Skill = {
  id: 'a6-reperes-culturels',
  title: 'Repères culturels',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **repère culturel** relie la langue à un pays : Saint Patrick’s Day (17 mars, Irlande, vert), Thanksgiving (novembre, États-Unis, dinde), Halloween (31 octobre), Bonfire Night (5 novembre, Royaume-Uni), Christmas, Pancake Day (crêpes).',
      'Lieux : les Highlands (Écosse), le fleuve Mississippi, le parc national de Nairobi (Kenya, rhinocéros noirs et girafes), Dublin (capitale de l’Irlande, symbole : le trèfle, shamrock).',
      'Histoires : Harry Potter (sorcier britannique, élève à Hogwarts), la **légende** de Finn McCool (géant d’Irlande, Giant’s Causeway vers l’Écosse), le Grinch (il déteste Noël), l’univers poétique et farfelu (plein de fantaisie) du Dr. Seuss.',
    ],
    source: source('repères culturels des cinq axes'),
    sources: [
      'anglais-college-2025',
      'bc-teens-saint-patrick',
      'bc-teens-thanksgiving',
      'bc-teens-halloween',
      'bc-teens-bonfire-night',
      'bc-teens-christmas',
      'bc-teens-pancake-day',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return cultureChoice(rng, level);
    if (level === 2) return rng.int(0, 2) === 0 ? culturePairs(rng, 3) : cultureChoice(rng, level);
    if (level === 3) return cultureType(rng.pick(typedPool(false)));
    if (level === 4) return rng.int(0, 1) === 0 ? culturePairs(rng, 5) : cultureType(rng.pick(typedPool(true)));
    return cultureDocument(rng);
  },
};

export const ENGLISH_LISTENING_6E_CHAPTER: Chapter = {
  id: 'a6-ecouter-comprendre',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Écouter et comprendre',
  skills: [message, numbers, culture],
};
