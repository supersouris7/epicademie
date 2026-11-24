import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice, num, traps as valueTraps } from '../build.ts';
import { r } from '../rational.ts';
import {
  AGES,
  CITIES,
  NAMES,
  PHRASES,
  QUESTIONS,
  ROLES,
  spellings,
  wordOf,
  type Phrase,
} from './presentation-faits.ts';

/**
 * Anglais CM1 — « Se présenter et saluer » (lot an-cm1-01, docs/adr/0034). Programme : cycle 3, Réagir et dialoguer
 * (« Établir un contact social (saluer, se présenter, présenter quelqu’un, etc.) »). Formes : British Council
 * (voir presentation-faits.ts : chaque fait y porte sa source et sa citation).
 */

const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes, CM1';
const source = (detail: string) => `${PROGRAMME} — « Établir un contact social (saluer, se présenter…) ». ${detail}`;

const otherOf = <T>(rng: Rng, list: readonly T[], not: readonly T[]): T =>
  rng.pick(list.filter((x) => !not.includes(x)));
/** Élément d'une liste à un indice valide (erreur de programmation sinon). */
const at = <T>(list: readonly T[], i: number): T => {
  const x = list[i];
  if (x === undefined) throw new Error(`indice ${i} hors liste`);
  return x;
};
const word = (n: number): string => wordOf(n) ?? String(n);
const withEnd = (core: string, end: string): string[] => [core, `${core}${end}`];

/** Mélange une liste jusqu'à ce qu'elle ne soit plus dans l'ordre de départ. */
function shuffledOther<T>(rng: Rng, list: readonly T[]): T[] {
  let out = rng.shuffle(list);
  while (out.every((x, i) => x === list[i])) out = rng.shuffle(list);
  return out;
}

/** Question de type texte à trous avec un seul trou saisi. */
const gap = (before: string, accepted: readonly string[], after: string) => ({
  parts: [before, after],
  blanks: [{ mode: 'text' as const, accepted }],
});

// ——— 1. Saluer et prendre congé ———
const saluer: Skill = {
  id: 'acm1-saluer',
  title: 'Saluer et prendre congé',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour **saluer**, tu dis « Hello! » ou « Hi! ». Quand tu rencontres quelqu’un : « Nice to meet you. », et il répond « You too. ».',
      'Pour **prendre congé** (partir), tu dis « Bye for now! ».',
    ],
    source: source('Expressions : British Council, LearnEnglish, Speaking A1 « Meeting new people ».'),
    sources: ['cycle3-2020', 'bc-meeting-new-people'],
  },
  generate: (rng, level): QuestionDraft => {
    const p: Phrase = PHRASES[rng.pick(ROLES)];
    const wrongWhy = (o: Phrase) => ({
      label: o.en,
      why: `« ${o.en} » veut dire « ${o.fr} » : ça ne va pas dans cette situation.`,
    });
    const steps = (extra: string) => [
      `On cherche quelle phrase va avec la situation : ${p.situation}`,
      extra,
      `Réponse : **${p.en}**`,
    ];
    if (level === 1) {
      const others = rng.shuffle(ROLES.filter((r) => r !== p.role)).slice(0, 2);
      const { answer, traps } = choice(
        rng,
        p.en,
        others.map((r) => wrongWhy(PHRASES[r])),
      );
      return {
        prompt: `${p.situation} Quelle phrase dis-tu ?`,
        answer,
        traps,
        hint: 'Imagine la scène : tu arrives, tu rencontres, tu réponds ou tu pars ?',
        steps: steps(`« ${p.en} » veut dire « ${p.fr} ».`),
      };
    }
    if (level === 2) {
      const roles = rng.shuffle(ROLES).slice(0, 3);
      const left = roles.map((r) => PHRASES[r].en);
      const right = shuffledOther(
        rng,
        roles.map((r) => PHRASES[r].fr),
      );
      return {
        prompt: `Associe chaque phrase anglaise à son sens en français : ${left.map((l) => `« ${l} »`).join(', ')}.`,
        answer: {
          kind: 'match',
          left,
          right,
          pairs: roles.map((r) => right.indexOf(PHRASES[r].fr)),
        },
        hint: 'Repère d’abord la phrase que tu connais le mieux, puis élimine les sens déjà pris.',
        steps: [
          'On relie chaque phrase à son sens, une par une.',
          ...roles.map((r) => `« ${PHRASES[r].en} » veut dire « ${PHRASES[r].fr} ».`),
          `Réponse : **${roles.map((r) => `${PHRASES[r].en} = ${PHRASES[r].fr}`).join(' ; ')}**`,
        ],
      };
    }
    if (level === 3) {
      if (rng.int(0, 1) === 0) {
        const base = ROLES.map((r) => PHRASES[r].en);
        const items = shuffledOther(rng, base);
        return {
          prompt: 'Remets ce petit dialogue dans l’ordre, de la rencontre jusqu’au départ.',
          answer: { kind: 'order', items, correct: base.map((b) => items.indexOf(b)) },
          hint: 'Une rencontre commence par un bonjour et finit par un au revoir.',
          steps: [
            'On commence par saluer, puis on dit qu’on est content, on répond, et enfin on part.',
            `Réponse : **${base.join(' → ')}**`,
          ],
        };
      }
      return {
        prompt: 'Ana te dit : « Nice to meet you. ». Écris ta réponse en anglais (2 mots) pour dire « moi aussi ».',
        answer: { kind: 'text', accepted: PHRASES.repondre.accepted },
        traps: [
          { text: 'Hello', why: '« Hello » sert à saluer. Ici on répond « moi aussi ».' },
          { text: 'Bye', why: '« Bye » sert à partir. Ici on vient de se rencontrer.' },
        ],
        hint: 'C’est la réponse de Emir dans la vidéo : 2 petits mots, « toi » et « aussi ».',
        steps: ['Ana est contente de te rencontrer. Tu réponds « moi aussi ».', 'Réponse : **You too.**'],
      };
    }
    if (level === 4) {
      const others = ROLES.filter((r) => r !== p.role);
      return {
        prompt: `${p.situation} Écris la phrase en anglais.`,
        answer: { kind: 'text', accepted: p.accepted },
        traps: others.slice(0, 2).map((r) => ({
          text: PHRASES[r].en,
          why: `« ${PHRASES[r].en} » veut dire « ${PHRASES[r].fr} » : ça ne va pas dans cette situation.`,
        })),
        hint: 'Retrouve la phrase de la rencontre : bonjour, enchanté, moi aussi ou au revoir ?',
        steps: steps(`On l’écrit sans aide : « ${p.en} » veut dire « ${p.fr} ».`),
      };
    }
    // Niveau 5 : dialogue de lecture avec une réplique manquante.
    const g1 = rng.pick(['Hello!', 'Hi!']);
    const g2 = g1 === 'Hello!' ? 'Hi!' : 'Hello!';
    const slots = [
      { line: 3, role: 'rencontre' as const, desc: 'Ana dit qu’elle est contente de rencontrer Emir.' },
      { line: 4, role: 'repondre' as const, desc: 'Emir répond « moi aussi ».' },
      { line: 5, role: 'conge' as const, desc: 'Ana s’en va.' },
    ];
    const slot = rng.pick(slots);
    const full = [
      `Ana : ${g1}`,
      `Emir : ${g2}`,
      `Ana : ${PHRASES.rencontre.en}`,
      `Emir : ${PHRASES.repondre.en}`,
      `Ana : ${PHRASES.conge.en}`,
    ];
    const lines = full.map((l, i) => (i === slot.line - 1 ? `${l.split(':')[0]}: …` : l));
    const right = PHRASES[slot.role].en;
    const { answer, traps } = choice(
      rng,
      right,
      [PHRASES.rencontre.en, PHRASES.repondre.en, PHRASES.conge.en, g1 === 'Hello!' ? 'Hello!' : 'Hi!'].map((en) => ({
        label: en,
        why: `« ${en} » ne va pas ici : lis bien ce que dit la ligne ${slot.line} (${slot.desc}).`,
      })),
    );
    return {
      prompt: `Lis le dialogue d’Ana et d’Emir. Quelle phrase manque à la ligne ${slot.line} ? (${slot.desc})`,
      figure: {
        kind: 'document',
        title: 'Ana et Emir se rencontrent',
        lines,
        credit:
          'Dialogue écrit pour l’exercice, avec les expressions de la vidéo « Meeting new people » (British Council).',
      },
      answer,
      traps,
      hint: 'Regarde la ligne d’avant et celle d’après, puis la phrase qu’on te décrit.',
      steps: [
        `La ligne ${slot.line} : ${slot.desc}`,
        'On cherche la phrase qui va avec cette situation.',
        `Réponse : **${right}**`,
      ],
    };
  },
};

// ——— 2. What's your name? ———
const askName = QUESTIONS.name.en;
const questionOptions = (rng: Rng, right: string, wrong: readonly (readonly [string, string])[]) =>
  choice(
    rng,
    right,
    wrong.map(([label, why]) => ({ label, why })),
  );

const yourName: Skill = {
  id: 'acm1-your-name',
  title: 'What’s your name?',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour demander un prénom : « What’s your name? ». « What’s » est une **contraction** de « What is », et « your » est l’**adjectif possessif** de « you ».',
      'Pour répondre, tu dis « I’m Ana. » (je suis Ana).',
    ],
    source: source('Formes : British Council, LearnEnglish (Question forms ; Verb be ; Possessives: adjectives).'),
    sources: ['cycle3-2020', 'bc-meeting-new-people', 'bc-question-forms', 'bc-verb-be', 'bc-possessives-adjectives'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const { answer, traps } = questionOptions(rng, askName, [
        [QUESTIONS.age.en, '« How old are you? » demande l’âge, pas le prénom.'],
        [QUESTIONS.live.en, '« Where do you live? » demande où tu habites, pas ton prénom.'],
      ]);
      return {
        prompt: 'Tu veux savoir comment s’appelle un nouveau copain. Quelle question poses-tu ?',
        answer,
        traps,
        hint: 'Cherche le mot qui veut dire « name » (le prénom) dans la question.',
        steps: ['On cherche la question qui parle du prénom : le mot « name ».', `Réponse : **${askName}**`],
      };
    }
    if (level === 2) {
      const { answer, traps } = questionOptions(rng, askName, [
        ['What’s you name?', 'Avec « name », il faut « your » (ton), pas « you » (toi).'],
        ['What your name?', 'Il manque le petit « ’s » : What’s = What is.'],
        ['Where’s your name?', '« Where » demande un lieu. Pour un prénom, on commence par « What ».'],
      ]);
      return {
        prompt: 'Quelle est la bonne façon de demander son prénom à quelqu’un ?',
        answer,
        traps,
        hint: 'La question commence par « What » et se termine par « your name ».',
        steps: [
          'La question commence par un mot interrogatif : « What ».',
          'Puis vient « ’s » (is), puis « your » (ton) et « name » (prénom).',
          `Réponse : **${askName}**`,
        ],
      };
    }
    if (level === 3) {
      const slot = rng.int(0, 2);
      const spec = at(
        [
          gap('Ana : ', ['What’s', 'What is'], ' your name?'),
          gap('Ana : What’s ', ['your'], ' name?'),
          gap('Ana : What’s your ', ['name'], '?'),
        ],
        slot,
      );
      const missing = at(['What’s', 'your', 'name'], slot);
      return {
        prompt: `Complète la question pour demander son prénom : « ${['… your name?', 'What’s … name?', 'What’s your …?'][slot]} »`,
        answer: { kind: 'cloze', ...spec },
        hint: 'Relis la question en entier : What’s … ? Il faut le mot qui manque.',
        steps: ['La question complète est « What’s your name? ».', `Le mot qui manque est **${missing}**.`],
      };
    }
    if (level === 4) {
      if (rng.int(0, 1) === 0) {
        return {
          prompt: 'Écris en anglais la question pour demander son prénom à un copain.',
          answer: {
            kind: 'text',
            accepted: [...withEnd('What’s your name', '?'), ...withEnd('What is your name', '?')],
          },
          traps: [
            { text: 'What’s you name?', why: 'Il faut « your » (ton) avant « name ».' },
            { text: 'What your name?', why: 'Il manque « ’s » : What’s = What is.' },
          ],
          hint: 'Quatre mots : le mot interrogatif, le petit « ’s », « your », « name ».',
          steps: ['On commence par « What », puis « ’s », puis « your name ».', `Réponse : **${askName}**`],
        };
      }
      const n = rng.pick(NAMES);
      return {
        prompt: `Tu t’appelles ${n}. Quelqu’un te demande « What’s your name? ». Écris ta réponse en commençant par « I’m ».`,
        answer: {
          kind: 'text',
          accepted: [...withEnd(`I’m ${n}`, '.'), ...withEnd(`I am ${n}`, '.'), ...withEnd(`My name is ${n}`, '.')],
        },
        traps: [
          { text: n, why: 'Un seul mot, ce n’est pas une phrase : commence par « I’m ».' },
          { text: `Im ${n}`, why: 'N’oublie pas l’apostrophe : I’m = I am.' },
        ],
        hint: 'I’m veut dire « je suis » : ajoute ton prénom derrière.',
        steps: [`« I’m » veut dire « je suis ». Tu ajoutes ton prénom : ${n}.`, `Réponse : **I’m ${n}.**`],
      };
    }
    const [a, b] = rng.shuffle(NAMES).slice(0, 2) as [string, string];
    const right = `I’m ${b}.`;
    const { answer, traps } = questionOptions(rng, right, [
      [`I’m ${a}.`, `C’est le prénom de ${a}, qui pose la question. ${b} donne son propre prénom.`],
      [askName, 'C’est la question, pas la réponse.'],
      ['Nice to meet you.', 'Cette phrase dit qu’on est content de se rencontrer : elle ne donne pas de prénom.'],
    ]);
    return {
      prompt: `Lis le dialogue. Quelle phrase manque à la ligne 2 ? (${b} donne son prénom.)`,
      figure: {
        kind: 'document',
        title: `${a} et ${b} se rencontrent`,
        lines: [`${a} : Hello! What’s your name?`, `${b} : …`, `${a} : Nice to meet you.`, `${b} : You too.`],
        credit:
          'Dialogue écrit pour l’exercice, avec les expressions de la vidéo « Meeting new people » (British Council).',
      },
      answer,
      traps,
      hint: '« I’m » veut dire « je suis » : il faut le prénom de celui qui répond.',
      steps: [
        `${a} demande « What’s your name? » : c’est ${b} qui répond avec son propre prénom.`,
        `Pour se présenter, on dit « I’m » + son prénom.`,
        `Réponse : **${right}**`,
      ],
    };
  },
};

// ——— 3. How old are you? ———
const askAge = QUESTIONS.age.en;

const howOld: Skill = {
  id: 'acm1-how-old',
  title: 'How old are you?',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour demander l’âge : « How old are you? ». Pour répondre, tu utilises le **verbe be** : « I’m nine. » (je suis neuf).',
      'En anglais, on ne dit pas « I have nine » : on dit « I am nine ».',
    ],
    source: source(
      'Formes : British Council, LearnEnglish (Possessives: adjectives ; Verb be) ; nombres : LearnEnglish Kids.',
    ),
    sources: ['cycle3-2020', 'bc-possessives-adjectives', 'bc-verb-be', 'bc-question-forms', 'bck-flashcards-1-12'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const { answer, traps } = questionOptions(rng, askAge, [
        [QUESTIONS.name.en, '« What’s your name? » demande le prénom, pas l’âge.'],
        [QUESTIONS.live.en, '« Where do you live? » demande où tu habites, pas ton âge.'],
      ]);
      return {
        prompt: 'Tu veux savoir quel âge a un copain. Quelle question poses-tu ?',
        answer,
        traps,
        hint: 'Cherche le petit mot « old » (âgé) dans la question.',
        steps: ['On cherche la question qui parle de l’âge : « old ».', `Réponse : **${askAge}**`],
      };
    }
    if (level === 2) {
      const wrong: [string, string][] = rng
        .shuffle([
          ['How are you old?', 'L’ordre est faux : « old » se place juste après « How ».'],
          ['How old you are?', 'Dans la question, « are » se place avant « you ».'],
          ['What old are you?', 'Pour l’âge, on commence par « How », pas « What ».'],
          ['How many years are you?', 'En anglais, on ne compte pas les années : on dit « How old ».'],
        ] as [string, string][])
        .slice(0, 3);
      const { answer, traps } = questionOptions(rng, askAge, wrong);
      return {
        prompt: 'Quelle est la bonne façon de demander son âge à quelqu’un ?',
        answer,
        traps,
        hint: 'Le début est « How old », et ensuite « are you ».',
        steps: [
          'La question commence par « How old » (quel âge).',
          'Puis on met « are » avant « you » : c’est le verbe be.',
          `Réponse : **${askAge}**`,
        ],
      };
    }
    if (level === 3) {
      const slot = rng.int(0, 2);
      const spec = at(
        [
          gap('Emir : How ', ['old'], ' are you?'),
          gap('Emir : How old ', ['are'], ' you?'),
          gap('Emir : How old are ', ['you'], '?'),
        ],
        slot,
      );
      const missing = at(['old', 'are', 'you'], slot);
      return {
        prompt: `Complète la question pour demander l’âge : « ${['How … are you?', 'How old … you?', 'How old are …?'][slot]} »`,
        answer: { kind: 'cloze', ...spec },
        hint: 'Relis la question en entier : How old are you?',
        steps: ['La question complète est « How old are you? ».', `Le mot qui manque est **${missing}**.`],
      };
    }
    if (level === 4) {
      const age = rng.pick(AGES);
      const w = word(age);
      return {
        prompt: `Tu as ${age} ans. On te demande « How old are you? ». Écris ta réponse avec « I’m » et ton âge en lettres.`,
        answer: { kind: 'text', accepted: [...withEnd(`I’m ${w}`, '.'), ...withEnd(`I am ${w}`, '.')] },
        traps: [
          { text: `I have ${w}`, why: 'En anglais on utilise be (I am), pas « have » comme en français (j’ai).' },
          { text: `I’m ${age}`, why: `On demande l’âge en lettres : ${age} s’écrit « ${w} ».` },
        ],
        hint: `Commence par « I’m ». Ensuite, écris ${age} en anglais, en lettres.`,
        steps: [`« I’m » veut dire « je suis » ; ${age} s’écrit « ${w} ».`, `Réponse : **I’m ${w}.**`],
      };
    }
    const [a, b] = rng.shuffle(NAMES).slice(0, 2) as [string, string];
    const [ageA, ageB] = rng.shuffle(AGES).slice(0, 2) as [number, number];
    return {
      prompt: `Lis le dialogue. Quel âge a ${b} ? Écris-le en chiffres.`,
      figure: {
        kind: 'document',
        title: `${a} et ${b} parlent de leur âge`,
        lines: [
          `${a} : How old are you, ${b}?`,
          `${b} : I’m ${word(ageB)}. How old are you, ${a}?`,
          `${a} : I’m ${word(ageA)}.`,
        ],
        credit: 'Dialogue écrit pour l’exercice. Nombres : LearnEnglish Kids (British Council).',
      },
      answer: num(ageB),
      traps: [],
      hint: `${b} répond à la question de ${a} : cherche la ligne qui commence par ${b}.`,
      steps: [
        `${a} demande son âge à ${b}, et c’est ${b} qui répond « I’m ${word(ageB)} ».`,
        `« ${word(ageB)} » s’écrit ${ageB} en chiffres.`,
        `Réponse : **${ageB}**`,
      ],
    };
  },
};

// ——— 4. Les nombres de 1 à 31 ———
/** Mot d'un nombre ou, à défaut, son écriture en chiffres. */
const confusers = (n: number): number[] => {
  const out: number[] = [];
  if (n >= 13 && n <= 19) out.push((n - 10) * 10);
  if (n === 20) out.push(12);
  if (n >= 21 && n <= 29) out.push(n - 10);
  if (n === 30 || n === 31) out.push(13);
  out.push(n - 1, n + 1, n - 2, n + 2);
  return out.filter((x, i, a) => x > 0 && x !== n && wordOf(x) !== undefined && a.indexOf(x) === i);
};

const MISSPELLED: Readonly<Record<number, string>> = {
  12: 'twelf',
  13: 'threeteen',
  14: 'forteen',
  15: 'fiveteen',
  18: 'eightteen',
};

const numbers: Skill = {
  id: 'acm1-nombres-1-31',
  title: 'Les nombres de 1 à 31',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'De 13 à 19, les nombres finissent par -teen : thirteen, fourteen… Les **dizaines** finissent par -ty : twenty, thirty.',
      'À partir de 21, on met un **tiret** entre la dizaine et l’unité : twenty-one, twenty-two… thirty-one.',
    ],
    source: source('Nombres : British Council, LearnEnglish Kids (cartes 1-12 et 13-24, fiche « Numbers 10-100 »).'),
    sources: ['cycle3-2020', 'bck-flashcards-1-12', 'bck-flashcards-13-24', 'bck-worksheet-10-100'],
  },
  generate: (rng, level): QuestionDraft => {
    const lo = at([1, 1, 1, 21, 13], level - 1);
    if (level === 1) {
      const n = rng.int(lo, 12);
      const pool = rng.shuffle(Array.from({ length: 12 }, (_, i) => i + 1).filter((x) => Math.abs(x - n) >= 3));
      const { answer, traps } = choice(
        rng,
        String(n),
        pool.slice(0, 2).map((x) => ({ label: String(x), why: `« ${word(x)} » veut dire ${x}, pas ${n}.` })),
      );
      return {
        prompt: `Quel nombre s’écrit « ${word(n)} » ?`,
        answer,
        traps,
        hint: 'Dis le mot à voix haute dans ta tête et pense à la comptine « one, two, three… ».',
        steps: [`« ${word(n)} » est le nombre ${n} (on compte one, two, three…).`, `Réponse : **${n}**`],
      };
    }
    if (level === 2) {
      const n = rng.int(13, 20);
      const wrong = confusers(n).slice(0, 3);
      if (rng.int(0, 1) === 0) {
        const { answer, traps } = choice(
          rng,
          String(n),
          wrong.map((x) => ({ label: String(x), why: `« ${word(x)} » veut dire ${x}, pas ${n}.` })),
        );
        return {
          prompt: `Quel nombre s’écrit « ${word(n)} » ?`,
          answer,
          traps,
          hint: 'Regarde la fin du mot : -teen (de 13 à 19) ou -ty (les dizaines) ?',
          steps: [
            `La fin du mot est ${n === 20 ? '-ty : une dizaine' : '-teen : entre 13 et 19'}.`,
            `Réponse : **${n}**`,
          ],
        };
      }
      const { answer, traps } = choice(
        rng,
        word(n),
        wrong.map((x) => ({ label: word(x), why: `« ${word(x)} » veut dire ${x}, pas ${n}.` })),
      );
      return {
        prompt: `Comment s’écrit ${n} en anglais ?`,
        answer,
        traps,
        hint: 'De 13 à 19, le mot finit par -teen ; pour une dizaine, par -ty.',
        steps: [`${n} est ${n === 20 ? 'une dizaine : -ty' : 'entre 13 et 19 : -teen'}.`, `Réponse : **${word(n)}**`],
      };
    }
    if (level === 3) {
      const n = rng.int(1, 24);
      const bad = confusers(n)[0];
      const trapList = [
        ...(bad ? [{ text: word(bad), why: `« ${word(bad)} » veut dire ${bad}, pas ${n}.` }] : []),
        ...(MISSPELLED[n]
          ? [{ text: MISSPELLED[n] ?? '', why: `Attention à l’orthographe : ${n} s’écrit « ${word(n)} ».` }]
          : []),
      ];
      return {
        prompt: `Écris en lettres, en anglais, le nombre ${n}.`,
        answer: { kind: 'text', accepted: spellings(word(n)) },
        traps: trapList,
        hint: n >= 13 && n <= 19 ? 'Entre 13 et 19, le mot finit par -teen.' : 'Pense à la comptine one, two, three…',
        steps: [`On écrit le nombre ${n} en lettres.`, `Réponse : **${word(n)}**`],
      };
    }
    if (level === 4) {
      const n = rng.int(21, 31);
      const w = word(n);
      if (rng.int(0, 1) === 0) {
        const bad = at(confusers(n), 0);
        return {
          prompt: `Écris en lettres, en anglais, le nombre ${n}.`,
          answer: { kind: 'text', accepted: spellings(w) },
          traps: [
            ...(w.includes('-')
              ? [{ text: w.replace('-', ''), why: 'Entre la dizaine et l’unité, il faut un tiret : twenty-one.' }]
              : []),
            { text: word(bad), why: `« ${word(bad)} » veut dire ${bad}, pas ${n}.` },
          ],
          hint: 'Dizaine, tiret, unité : « twenty-… » pour 21 à 29 ; pour 31, « thirty-… ».',
          steps: [`${n} = ${n >= 30 ? 'thirty' : 'twenty'} + ${n % 10 === 0 ? '0' : n % 10}.`, `Réponse : **${w}**`],
        };
      }
      const bad = at(confusers(n), 0);
      return {
        prompt: `Écris en chiffres le nombre « ${w} ».`,
        answer: num(n),
        traps: valueTraps(r(n), [[bad, `« ${word(bad)} » veut dire ${bad}. Ici le mot est « ${w} ».`]]),
        hint: 'Repère la dizaine (twenty = 20, thirty = 30), puis ajoute l’unité.',
        steps: [
          `« ${w} » : dizaine ${n >= 30 ? 'thirty = 30' : 'twenty = 20'}, unité ${n % 10}.`,
          `Réponse : **${n}**`,
        ],
      };
    }
    const s = rng.int(lo, 27);
    const a = rng.pick(NAMES);
    const b = otherOf(rng, NAMES, [a]);
    return {
      prompt: `${a} et ${b} comptent à voix haute. Quel nombre cache « … » ? Écris-le en chiffres.`,
      figure: {
        kind: 'document',
        title: 'On compte !',
        lines: [`${a} : ${word(s)}, ${word(s + 1)}, …`, `${b} : ${word(s + 3)}, ${word(s + 4)}`],
        credit: 'Écrit pour l’exercice. Nombres : LearnEnglish Kids (British Council).',
      },
      answer: num(s + 2),
      traps: valueTraps(r(s + 2), [
        [s + 1, `${s + 1} est le nombre juste avant : ${a} l’a déjà dit.`],
        [s + 3, `${s + 3} est le nombre juste après : ${b} le dit ensuite.`],
      ]),
      hint: `Lis les nombres un par un : ${word(s + 1)} puis … puis ${word(s + 3)}.`,
      steps: [
        `On compte de 1 en 1 : ${word(s + 1)}, puis le nombre caché, puis ${word(s + 3)}.`,
        `Entre ${s + 1} et ${s + 3}, il y a ${s + 2}.`,
        `Réponse : **${s + 2}**`,
      ],
    };
  },
};

// ——— 5. Where do you live? ———
const askLive = QUESTIONS.live.en;

const whereLive: Skill = {
  id: 'acm1-where-live',
  title: 'Where do you live?',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour demander où quelqu’un habite : « Where do you live? ». Le mot **do** aide à poser la question.',
      'Pour répondre : « I live in Glasgow. ». Attention : « Where are you from? » demande d’où tu viens, pas où tu habites.',
    ],
    source: source(
      'Formes : British Council, LearnEnglish (Question forms) et Speaking A1 « Talking about where you’re from ».',
    ),
    sources: ['cycle3-2020', 'bc-question-forms', 'bc-where-from'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const { answer, traps } = questionOptions(rng, askLive, [
        [QUESTIONS.name.en, '« What’s your name? » demande le prénom, pas le lieu où on habite.'],
        [QUESTIONS.age.en, '« How old are you? » demande l’âge, pas le lieu où on habite.'],
      ]);
      return {
        prompt: 'Tu veux savoir où habite un copain. Quelle question poses-tu ?',
        answer,
        traps,
        hint: 'Cherche le mot « live » (habiter) dans la question.',
        steps: ['On cherche la question qui parle de l’endroit où on habite : « live ».', `Réponse : **${askLive}**`],
      };
    }
    if (level === 2) {
      const wrong: [string, string][] = rng
        .shuffle([
          ['Where are you from?', 'Cette question demande d’où tu viens (from), pas où tu habites (live).'],
          ['Where you live?', 'Il manque « do » : Where do you live?'],
          ['Where do you lives?', 'Après « do », le verbe ne change pas : « live », sans -s.'],
          ['What do you live?', '« What » demande une chose. Pour un lieu, on dit « Where ».'],
        ] as [string, string][])
        .slice(0, 3);
      const { answer, traps } = questionOptions(rng, askLive, wrong);
      return {
        prompt: 'Quelle est la bonne façon de demander où habite quelqu’un ?',
        answer,
        traps,
        hint: 'La question suit le modèle « Where do you work? », avec le verbe habiter.',
        steps: [
          '« Where » demande un lieu et ouvre la question.',
          'Puis « do you » aide à poser la question, et on termine par le verbe « live ».',
          `Réponse : **${askLive}**`,
        ],
      };
    }
    if (level === 3) {
      const slot = rng.int(0, 2);
      const city = rng.pick(CITIES);
      const spec = at(
        [
          gap('Ana : Where ', ['do'], ' you live?'),
          gap('Ana : Where do you ', ['live'], '?'),
          {
            parts: [`Ana : Where do you live? Emir : I `, ` in ${city}.`],
            blanks: [{ mode: 'text' as const, accepted: ['live'] }],
          },
        ],
        slot,
      );
      const missing = at(['do', 'live', 'live'], slot);
      return {
        prompt:
          slot === 2
            ? `Complète la réponse d’Emir : « I … in ${city}. »`
            : `Complète la question pour demander où on habite : « ${['Where … you live?', 'Where do you …?'][slot]} »`,
        answer: { kind: 'cloze', ...spec },
        hint:
          slot === 2
            ? 'Emir dit où il habite : quel verbe veut dire « habiter » ?'
            : 'Relis la question en entier : Where do you live?',
        steps: [
          slot === 2 ? 'Emir répond avec le verbe « live ».' : 'La question complète est « Where do you live? ».',
          `Le mot qui manque est **${missing}**.`,
        ],
      };
    }
    if (level === 4) {
      if (rng.int(0, 1) === 0) {
        return {
          prompt: 'Écris en anglais la question pour demander où habite un copain.',
          answer: { kind: 'text', accepted: withEnd('Where do you live', '?') },
          traps: [
            { text: 'Where you live?', why: 'Il manque « do » : Where do you live?' },
            { text: 'Where are you from?', why: 'Cette question demande d’où tu viens, pas où tu habites.' },
          ],
          hint: 'Quatre mots : le mot interrogatif des lieux, « do », « you » et le verbe habiter.',
          steps: ['On commence par « Where », puis « do you », puis « live ».', `Réponse : **${askLive}**`],
        };
      }
      const city = rng.pick(CITIES);
      return {
        prompt: `Tu habites à ${city}. Écris ta réponse à « Where do you live? » en commençant par « I live in ».`,
        answer: { kind: 'text', accepted: withEnd(`I live in ${city}`, '.') },
        traps: [
          { text: `I live ${city}`, why: 'Il manque « in » avant le nom de la ville.' },
          { text: `I’m from ${city}`, why: '« I’m from » dit d’où tu viens. Ici on te demande où tu habites.' },
        ],
        hint: 'Trois petits mots, puis la ville : « I », le verbe habiter, « in ».',
        steps: [`On dit où on habite avec « I live in » + la ville : ${city}.`, `Réponse : **I live in ${city}.**`],
      };
    }
    const [from, home] = rng.shuffle(CITIES).slice(0, 2) as [string, string];
    const { answer, traps } = choice(
      rng,
      home,
      CITIES.filter((c) => c !== home).map((c) => ({
        label: c,
        why:
          c === from
            ? `${c} est la ville d’où elle vient (« I’m from »), pas celle où elle habite.`
            : `${c} n’est pas dans le dialogue.`,
      })),
    );
    return {
      prompt: 'Lis le dialogue. Dans quelle ville Ana habite-t-elle maintenant ?',
      figure: {
        kind: 'document',
        title: 'Ana et Emir parlent de leur ville',
        lines: ['Emir : Where are you from, Ana?', `Ana : I’m from ${from}. I live in ${home} now.`],
        credit:
          'Dialogue écrit pour l’exercice, avec les expressions de la vidéo « Talking about where you’re from » (British Council).',
      },
      answer,
      traps,
      hint: 'Cherche « I live in » : la ville juste après dit où elle habite.',
      steps: [
        '« I’m from … » dit d’où elle vient. « I live in … » dit où elle habite.',
        `Après « I live in », on lit ${home}.`,
        `Réponse : **${home}**`,
      ],
    };
  },
};

export const ENGLISH_PRESENTATION_CHAPTER: Chapter = {
  id: 'acm1-se-presenter',
  subject: 'anglais',
  grade: 'cm1',
  domain: 'langue',
  title: 'Se présenter et saluer',
  skills: [saluer, yourName, howOld, numbers, whereLive],
};
