import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import {
  AVANT_SUJET,
  GROUPES_SUJETS,
  NOMS_VERBES,
  PHRASES_DOUBLES,
  PHRASES_INFINITIF,
  PHRASES_NEGATIVES,
  PHRASES_SIMPLES,
  SUJETS,
  SUJETS_PIEGES,
  TYPE_LABEL,
  VERBES_IRREGULIERS,
  VERBES_REGULIERS,
  faitVs,
  sentence,
  type GroupeSujet,
  type Mot,
  type NomVerbe,
  type Sujet,
  type TypeSujet,
} from './verbe-sujet.donnees.ts';
import { at, document, lowerFirst, pickN, same, textTrap } from './outils.ts';

/**
 * Chapitre « Le verbe et le sujet » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Analyser une phrase simple ».
 */
const PROGRAMME = 'francais-cycle3-2025';
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitVs(id).citation} »`;

const NEGATION = ['ne', 'n’', 'pas', 'plus', 'jamais'];
const verbOf = (phrase: readonly Mot[]): Mot => {
  const v = phrase.find((m) => m.tag === 'v');
  if (!v) throw new Error('phrase sans verbe conjugué');
  return v;
};
const withDot = (phrase: readonly Mot[]) => `${sentence(phrase)}.`;

// ───────────────────────── 1. Trouver le verbe conjugué ─────────────────────────

/** Pourquoi ce mot n'est pas le verbe conjugué. */
function whyNotVerb(m: Mot): string {
  const t = m.text;
  if (NEGATION.includes(t.toLowerCase()))
    return `« ${t} » fait partie de la négation : il entoure le verbe, mais ce n’est pas le verbe.`;
  switch (m.tag) {
    case 'n':
      return `« ${t} » est un nom : il nomme une personne, un animal ou une chose. Le verbe dit ce qu’on fait.`;
    case 'd':
      return `« ${t} » est un déterminant : un petit mot qui accompagne un nom, il ne dit pas ce qu’on fait.`;
    case 'p':
      return `« ${t} » est un pronom : il dit qui fait l’action. Le verbe dit l’action.`;
    case 'i':
      return `« ${t} » est un verbe à l’infinitif : il ne change pas avec le sujet. Le verbe conjugué est l’autre verbe.`;
    default:
      return `« ${t} » ne dit pas ce que fait quelqu’un : ce n’est pas le verbe.`;
  }
}

/** Les mots qui ne sont pas le verbe, dans l'ordre de priorité des étiquettes, sans doublon. */
function otherWords(phrase: readonly Mot[], order: readonly string[]): Mot[] {
  const out: Mot[] = [];
  for (const tag of order)
    for (const m of phrase)
      if (
        m.tag === tag &&
        !out.some((o) => same(o.text, m.text)) &&
        !phrase.some((v) => v.tag === 'v' && same(v.text, m.text))
      )
        out.push(m);
  return out;
}

const textTraps = (words: readonly Mot[], n: number): Trap[] =>
  words.slice(0, n).map((m) => textTrap(m.text, whyNotVerb(m)));

const STEPS_VERBE = [
  'Le verbe dit ce que fait quelqu’un. C’est le mot qui change avec le sujet et le temps.',
  'Pour le repérer, je mets la phrase au passé avec « hier » : le mot qui change, c’est le verbe.',
];

function verbeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const phrase = rng.pick(PHRASES_SIMPLES);
      const verbe = verbOf(phrase);
      const noun = otherWords(phrase, ['n'])[0] ?? at(otherWords(phrase, ['p', 'd']), 0);
      const other = rng.pick(otherWords(phrase, ['d', 'p', 'a']).filter((m) => !same(m.text, noun.text)));
      const { answer, traps } = choice(
        rng,
        verbe.text,
        [noun, other].map((m) => ({ label: m.text, why: whyNotVerb(m) })),
      );
      return {
        prompt: `Quel mot est le verbe de cette phrase ? « ${withDot(phrase)} »`,
        answer,
        traps,
        hint: 'Cherche le mot qui dit ce que fait quelqu’un. Il change si tu commences la phrase par « hier ».',
        steps: [...STEPS_VERBE, `Ici, c’est **${verbe.text}**.`],
      };
    }
    case 2: {
      const phrase = rng.pick(PHRASES_SIMPLES);
      const verbe = verbOf(phrase);
      const wrong = [...otherWords(phrase, ['n']).slice(0, 2), ...rng.shuffle(otherWords(phrase, ['d', 'p', 'a']))]
        .filter((m, i, all) => all.findIndex((x) => same(x.text, m.text)) === i)
        .slice(0, 3);
      const { answer, traps } = choice(
        rng,
        verbe.text,
        wrong.map((m) => ({ label: m.text, why: whyNotVerb(m) })),
      );
      return {
        prompt: `Trouve le verbe conjugué de cette phrase : « ${withDot(phrase)} »`,
        answer,
        traps,
        hint: 'Ajoute « hier » au début de la phrase : un seul mot change.',
        steps: [...STEPS_VERBE, `Le verbe conjugué est **${verbe.text}**.`],
      };
    }
    case 3: {
      const phrase = rng.pick(PHRASES_SIMPLES);
      const verbe = verbOf(phrase);
      return {
        prompt: `Écris le verbe conjugué de cette phrase : « ${withDot(phrase)} »`,
        answer: { kind: 'text', accepted: [verbe.text] },
        traps: textTraps(otherWords(phrase, ['n', 'p', 'd', 'a']), 2),
        hint: 'Cherche le mot qui change quand tu commences la phrase par « hier ».',
        steps: [...STEPS_VERBE, `Le verbe conjugué est **${verbe.text}**.`],
      };
    }
    case 4: {
      const negative = rng.int(0, 1) === 1;
      const phrase = rng.pick(negative ? PHRASES_NEGATIVES : PHRASES_INFINITIF);
      const verbe = verbOf(phrase);
      return {
        prompt: `Dans cette phrase, quel est le verbe conjugué ? Écris-le. « ${withDot(phrase)} »`,
        answer: { kind: 'text', accepted: [verbe.text] },
        traps: textTraps(otherWords(phrase, negative ? ['a', 'n', 'p'] : ['i', 'n', 'p']), 2),
        hint: negative
          ? 'Dans une phrase négative, le verbe est entouré de deux petits mots, mais il ne se confond pas avec eux.'
          : 'Il y a deux verbes. Un seul change avec le sujet : l’autre garde toujours la même forme.',
        steps: negative
          ? [
              'Dans une phrase négative, deux petits mots entourent le verbe : « ne » avant, « pas » (ou « plus », « jamais ») après.',
              'Je les mets de côté : le verbe est le mot qui reste entre les deux.',
              `Le verbe conjugué est **${verbe.text}**.`,
            ]
          : [
              'Il y a deux verbes. Un seul est conjugué : il change avec le sujet.',
              'L’autre est à l’infinitif : il ne change jamais.',
              `Le verbe conjugué est **${verbe.text}**.`,
            ],
      };
    }
    default: {
      const lines = pickN(rng, [...PHRASES_SIMPLES, ...PHRASES_INFINITIF, ...PHRASES_NEGATIVES, ...PHRASES_DOUBLES], 4);
      const count = (tag: Mot['tag']) => lines.reduce((n, l) => n + l.filter((m) => m.tag === tag).length, 0);
      const k = count('v');
      return {
        prompt: 'Lis ce texte. Combien de verbes conjugués contient-il en tout ?',
        figure: document('Quelques phrases', lines.map(withDot)),
        answer: num(k),
        traps: numTraps(r(k), [
          [k + count('i'), 'Tu as compté aussi les verbes à l’infinitif. Seuls les verbes conjugués comptent.'],
          [lines.length, 'Tu as compté une phrase = un verbe. Certaines phrases ont deux verbes conjugués.'],
          [k - 1, 'Il t’en manque un : relis chaque ligne et cherche tous les mots qui changent avec le sujet.'],
        ]),
        hint: 'Compte les verbes ligne par ligne. Dans « Je veux manger », un seul verbe est conjugué.',
        steps: [
          'Je lis chaque ligne et je cherche les mots qui changent avec le sujet.',
          'Je ne compte pas les verbes à l’infinitif : ils ne sont pas conjugués.',
          `Je compte les verbes conjugués : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Trouver l'infinitif ─────────────────────────

const lastWord = (form: string) => at(form.split(' '), form.split(' ').length - 1);
const ending = (inf: string) => (inf.endsWith('er') ? '-er' : '-ir');

/** Le participe passé d'un verbe régulier (chanté, fini) : l'erreur la plus courante. */
const participe = (inf: string) => inf.slice(0, -2) + (inf.endsWith('er') ? 'é' : 'i');

const whyBare = (bare: string) =>
  `« ${bare} » est le verbe conjugué, comme dans la phrase. L’infinitif ne change jamais avec le sujet.`;
const whyOtherVerb = (other: string, form: string) => `« ${other} » est un autre verbe : « ${form} » n’en vient pas.`;

const STEPS_INF = (inf: string) => [
  'L’infinitif, c’est le nom du verbe : celui qu’on cherche dans le dictionnaire.',
  `Pour le retrouver, je dis « il faut… » devant : il faut ${inf}.`,
  `L’infinitif est **${inf}**.`,
];

function infinitifDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(VERBES_REGULIERS);
      const form = rng.pick(v.formes);
      const others = pickN(
        rng,
        VERBES_REGULIERS.filter((o) => o.inf !== v.inf),
        2,
      );
      const { answer, traps } = choice(
        rng,
        v.inf,
        others.map((o) => ({ label: o.inf, why: whyOtherVerb(o.inf, form) })),
      );
      return {
        prompt: `Quel est l’infinitif du verbe dans « ${form} » ?`,
        answer,
        traps,
        hint: 'Dis « il faut… » devant le verbe, puis cherche la forme qui va avec.',
        steps: STEPS_INF(v.inf),
      };
    }
    case 2: {
      const v = rng.pick(VERBES_REGULIERS);
      const form = rng.pick(v.formes);
      const bare = lastWord(form);
      const others = pickN(
        rng,
        VERBES_REGULIERS.filter((o) => o.inf !== v.inf),
        2,
      );
      const { answer, traps } = choice(rng, v.inf, [
        { label: bare, why: whyBare(bare) },
        ...others.map((o) => ({ label: o.inf, why: whyOtherVerb(o.inf, form) })),
      ]);
      return {
        prompt: `Retrouve l’infinitif de « ${form} » : choisis la bonne proposition.`,
        answer,
        traps,
        hint: 'L’infinitif ne change pas avec le sujet. Il se termine souvent par -er ou -ir.',
        steps: STEPS_INF(v.inf),
      };
    }
    case 3: {
      const v = rng.pick(VERBES_REGULIERS);
      const form = rng.pick(v.formes);
      const bare = lastWord(form);
      return {
        prompt: `Écris l’infinitif de « ${form} ».`,
        answer: { kind: 'text', accepted: [v.inf] },
        traps: [
          textTrap(bare, whyBare(bare)),
          textTrap(
            participe(v.inf),
            `« ${participe(v.inf)} » ressemble à l’infinitif, mais ce n’est pas lui : l’infinitif de ce verbe se termine par ${ending(v.inf)}.`,
          ),
        ],
        hint: 'Dis « il faut… » devant : le verbe se termine par -er ou -ir.',
        steps: STEPS_INF(v.inf),
      };
    }
    case 4: {
      const v = rng.pick(VERBES_IRREGULIERS);
      const form = rng.pick(v.formes);
      const bare = lastWord(form);
      const other = rng.pick(VERBES_IRREGULIERS.filter((o) => o.inf !== v.inf));
      return {
        prompt: `Quel est l’infinitif de « ${form} » ? Écris-le.`,
        answer: { kind: 'text', accepted: [v.inf] },
        traps: [textTrap(bare, whyBare(bare)), textTrap(other.inf, whyOtherVerb(other.inf, form))],
        hint: 'Même quand le verbe change beaucoup, tu peux dire « il faut… » devant pour retrouver l’infinitif.',
        steps: STEPS_INF(v.inf),
      };
    }
    default: {
      const phrase = rng.pick([...PHRASES_SIMPLES, ...PHRASES_NEGATIVES]);
      const verbe = verbOf(phrase);
      const inf = verbe.inf ?? '';
      const noun = at(otherWords(phrase, ['n', 'p', 'd', 'a']), 0);
      return {
        prompt: `Trouve le verbe conjugué de cette phrase, puis écris son infinitif : « ${withDot(phrase)} »`,
        answer: { kind: 'text', accepted: [inf] },
        traps: [
          textTrap(
            verbe.text,
            `« ${verbe.text} » est le verbe conjugué, tel qu’il est écrit dans la phrase. On demande son infinitif.`,
          ),
          textTrap(noun.text, whyNotVerb(noun)),
        ],
        hint: 'D’abord, trouve le mot qui change avec le sujet. Ensuite, dis « il faut… » devant.',
        steps: [
          `Je cherche le verbe conjugué : c’est « ${verbe.text} ».`,
          `Je dis « il faut… » devant : il faut ${inf}.`,
          `L’infinitif est **${inf}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Trouver le groupe sujet ─────────────────────────

/** « Qui est-ce qui » appelle un verbe à la 3e personne du singulier : « qui est-ce qui habite… ? ». */
const SINGULIER: Record<string, string> = {
  mangeons: 'mange',
  cours: 'court',
  lis: 'lit',
  partez: 'part',
  partent: 'part',
  dorment: 'dort',
};
const quiReste = (reste: string): string => {
  const [mot = '', ...suite] = reste.split(' ');
  const sing = SINGULIER[mot] ?? (mot.endsWith('ent') ? mot.slice(0, -1) : mot);
  return [sing, ...suite].join(' ');
};

const phraseGs = (g: GroupeSujet, pre?: string) =>
  pre ? `${pre} ${lowerFirst(g.gs)} ${g.reste}.` : `${g.gs} ${g.reste}.`;

const stepsGs = (g: GroupeSujet) => [
  'Le sujet dit qui fait l’action. Je pose la question « Qui est-ce qui… ? » devant le verbe.',
  `Qui est-ce qui ${quiReste(g.reste)} ? C’est ${lowerFirst(g.gs)}.`,
  `Le groupe sujet est **${g.gs}**.`,
];

const whyNoyau = (g: GroupeSujet) =>
  `« ${g.noyau} » est seulement le nom principal. Le groupe sujet comprend aussi les mots qui l’accompagnent.`;
const whyReste = (g: GroupeSujet) =>
  `« ${g.reste} » commence par le verbe : c’est ce qu’on dit du sujet, pas le sujet.`;
const whyAvecVerbe = (g: GroupeSujet) =>
  `Le groupe sujet s’arrête avant le verbe : « ${g.verbe} » n’en fait pas partie.`;

function sujetDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const g = rng.pick(GROUPES_SUJETS);
      const { answer, traps } = choice(rng, g.gs, [
        { label: g.reste, why: whyReste(g) },
        { label: g.verbe, why: `« ${g.verbe} » est le verbe, pas le sujet. Le sujet dit qui fait l’action.` },
      ]);
      return {
        prompt: `Quel est le groupe sujet de cette phrase ? « ${phraseGs(g)} »`,
        answer,
        traps,
        hint: 'Demande-toi « Qui est-ce qui… ? » en citant le verbe.',
        steps: stepsGs(g),
      };
    }
    case 2: {
      const g = rng.pick(GROUPES_SUJETS);
      const { answer, traps } = choice(rng, g.gs, [
        { label: g.noyau, why: whyNoyau(g) },
        { label: `${g.gs} ${g.verbe}`, why: whyAvecVerbe(g) },
        { label: g.reste, why: whyReste(g) },
      ]);
      return {
        prompt: `Choisis le groupe sujet complet de la phrase : « ${phraseGs(g)} »`,
        answer,
        traps,
        hint: 'Le groupe sujet contient le nom noyau et tous les mots qui l’accompagnent, mais pas le verbe.',
        steps: stepsGs(g),
      };
    }
    case 3: {
      const g = rng.pick(GROUPES_SUJETS);
      return {
        prompt: `Écris le groupe sujet de cette phrase : « ${phraseGs(g)} »`,
        answer: { kind: 'text', accepted: [g.gs] },
        traps: [
          textTrap(g.noyau, whyNoyau(g)),
          textTrap(`${g.gs} ${g.verbe}`, whyAvecVerbe(g)),
          textTrap(g.reste, whyReste(g)),
        ],
        hint: 'Pose la question « Qui est-ce qui… ? » devant le verbe, ou encadre avec « c’est… qui ».',
        steps: stepsGs(g),
      };
    }
    case 4: {
      const g = rng.pick(GROUPES_SUJETS);
      const pre = rng.pick(AVANT_SUJET);
      const preSansVirgule = pre.slice(0, -1);
      return {
        prompt: `Dans cette phrase, quel est le groupe sujet ? Écris-le. « ${phraseGs(g, pre)} »`,
        answer: { kind: 'text', accepted: [g.gs, lowerFirst(g.gs)] },
        traps: [
          textTrap(
            preSansVirgule,
            `« ${preSansVirgule} » dit quand. On peut le supprimer : « ${phraseGs(g)} » reste une phrase complète. Ce n’est pas le sujet.`,
          ),
          textTrap(g.noyau, whyNoyau(g)),
        ],
        hint: 'Un groupe placé avant le sujet, avec une virgule, dit quand. Supprime-le pour voir ce qui reste.',
        steps: [
          `« ${preSansVirgule} » dit quand : je peux le supprimer, ce n’est pas le sujet.`,
          `Il reste : ${phraseGs(g)} Qui est-ce qui ${quiReste(g.reste)} ? C’est ${lowerFirst(g.gs)}.`,
          `Le groupe sujet est **${g.gs}**.`,
        ],
      };
    }
    default: {
      const gs = pickN(rng, GROUPES_SUJETS, 3);
      const pres = gs.map(() => (rng.int(0, 1) === 0 ? undefined : rng.pick(AVANT_SUJET)));
      const t = rng.int(0, 2);
      const g = at(gs, t);
      const autre = at(gs, (t + 1 + rng.int(0, 1)) % 3);
      return {
        prompt: `Lis ce texte. Écris le groupe sujet de la ligne ${t + 1}.`,
        figure: document(
          'Un petit texte',
          gs.map((x, i) => phraseGs(x, pres[i])),
        ),
        answer: { kind: 'text', accepted: [g.gs, lowerFirst(g.gs)] },
        traps: [
          textTrap(g.noyau, whyNoyau(g)),
          textTrap(autre.gs, 'C’est le sujet d’une autre ligne. Relis bien la ligne demandée.'),
        ],
        hint: 'Lis seulement la bonne ligne, puis pose la question « Qui est-ce qui… ? » devant son verbe.',
        steps: [
          `Je lis la ligne ${t + 1} : « ${phraseGs(g, pres[t])} »`,
          `Qui est-ce qui ${quiReste(g.reste)} ? C’est ${lowerFirst(g.gs)}.`,
          `Le groupe sujet est **${g.gs}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Pronom, groupe nominal ou plusieurs noms ─────────────────────────

const OPTION_LABEL: Record<TypeSujet, string> = {
  pronom: 'un pronom personnel (il, elle, nous…)',
  gn: 'un groupe nominal (un nom avec son déterminant)',
  noms: 'plusieurs noms (reliés par « et » ou une virgule)',
};
const ACCEPTED_TYPE: Record<TypeSujet, readonly string[]> = {
  pronom: ['pronom personnel', 'pronom', 'un pronom', 'un pronom personnel'],
  gn: ['groupe nominal', 'un groupe nominal', 'gn'],
  noms: ['plusieurs noms', 'des noms', 'noms'],
};
const TYPES: readonly TypeSujet[] = ['pronom', 'gn', 'noms'];

/** Pourquoi le sujet n'est pas de ce type (faux) alors qu'il est de l'autre (vrai). */
const WHY_TYPE: Record<TypeSujet, Record<TypeSujet, string>> = {
  pronom: {
    pronom: '',
    gn: 'Il n’y a aucun nom ici : le sujet est un petit mot qui remplace un nom.',
    noms: 'Il n’y a aucun nom ici : le sujet est un petit mot qui remplace un nom.',
  },
  gn: {
    pronom: 'Le sujet n’est pas un petit mot comme il, elle, nous : il contient un nom.',
    gn: '',
    noms: 'Il n’y a qu’un seul nom, avec son déterminant : c’est un groupe nominal.',
  },
  noms: {
    pronom: 'Le sujet n’est pas un petit mot comme il, elle, nous : il contient des noms.',
    gn: 'Il y a plusieurs noms reliés par « et » (ou une virgule), pas un seul.',
    noms: '',
  },
};
const whyType = (s: Sujet, wrong: TypeSujet) =>
  `Le sujet « ${s.s} » n’est pas ${TYPE_LABEL[wrong]}. ${WHY_TYPE[s.type][wrong]}`;
const phraseS = (s: Sujet, pre?: string) => (pre ? `${pre} ${lowerFirst(s.s)} ${s.reste}.` : `${s.s} ${s.reste}.`);
const byType = (type: TypeSujet) => SUJETS.filter((s) => s.type === type);

const stepsType = (s: Sujet) => [
  `Je trouve le sujet : qui est-ce qui ${quiReste(s.reste)} ? C’est « ${lowerFirst(s.s)} ».`,
  s.type === 'pronom'
    ? 'C’est un petit mot qui remplace un nom (il, elle, nous…) : un pronom personnel.'
    : s.type === 'gn'
      ? 'Il y a un seul nom, avec son déterminant : un groupe nominal.'
      : 'Il y a plusieurs noms reliés par « et » ou une virgule.',
  `Le sujet est **${TYPE_LABEL[s.type]}**.`,
];

function typesSujetsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const s = rng.pick(SUJETS);
      const { answer, traps } = choice(
        rng,
        OPTION_LABEL[s.type],
        TYPES.filter((t) => t !== s.type).map((t) => ({ label: OPTION_LABEL[t], why: whyType(s, t) })),
      );
      return {
        prompt: `Dans « ${phraseS(s)} », le sujet est « ${s.s} ». De quelle sorte de sujet s’agit-il ?`,
        answer,
        traps,
        hint: 'Cherche s’il y a un nom, et combien. Un pronom, lui, remplace un nom.',
        steps: stepsType(s),
      };
    }
    case 2: {
      const target = rng.pick(TYPES);
      const good = rng.pick(byType(target));
      const wrong = pickN(
        rng,
        SUJETS.filter((s) => s.type !== target),
        3,
      );
      const options = rng.shuffle([good, ...wrong]);
      const label: Record<TypeSujet, string> = {
        pronom: 'est un pronom personnel',
        gn: 'est un groupe nominal',
        noms: 'est formé de plusieurs noms',
      };
      return {
        prompt: `Dans quelle phrase le sujet ${label[target]} ?`,
        answer: { kind: 'choice', options: options.map((s) => phraseS(s)), correct: options.indexOf(good) },
        traps: options.flatMap((s, i) =>
          s === good
            ? []
            : [
                {
                  option: i,
                  why: `Dans cette phrase, le sujet « ${s.s} » est ${TYPE_LABEL[s.type]}, pas ${TYPE_LABEL[target]}.`,
                },
              ],
        ),
        hint: 'Pour chaque phrase, trouve le sujet avec « Qui est-ce qui… ? », puis regarde s’il contient un nom, plusieurs ou aucun.',
        steps: [
          'Je cherche le sujet de chaque phrase avec « Qui est-ce qui… ? ».',
          `Je garde celui qui ${label[target]}.`,
          `La bonne phrase est : **${phraseS(good)}**`,
        ],
      };
    }
    case 3: {
      const s = rng.pick(SUJETS);
      return {
        prompt: `Trouve le sujet de cette phrase, puis écris sa sorte (pronom personnel, groupe nominal ou plusieurs noms) : « ${phraseS(s)} »`,
        answer: { kind: 'text', accepted: ACCEPTED_TYPE[s.type] },
        traps: TYPES.filter((t) => t !== s.type).map((t) => textTrap(at(ACCEPTED_TYPE[t], 0), whyType(s, t))),
        hint: 'Trouve d’abord le sujet. Compte ensuite les noms : aucun, un seul, ou plusieurs.',
        steps: stepsType(s),
      };
    }
    case 4: {
      const type = rng.pick(TYPES);
      const s = type === 'gn' ? rng.pick(SUJETS_PIEGES) : rng.pick(byType(type));
      const pre = rng.pick(AVANT_SUJET);
      const piege = s.piege;
      const wrongs = TYPES.filter((t) => t !== type);
      return {
        prompt: `Quelle est la sorte du sujet (pronom personnel, groupe nominal ou plusieurs noms) ? Écris-la. « ${phraseS(s, pre)} »`,
        answer: { kind: 'text', accepted: ACCEPTED_TYPE[type] },
        traps: wrongs.map((t) =>
          textTrap(at(ACCEPTED_TYPE[t], 0), t === 'noms' && piege ? `${whyType(s, t)} ${piege}` : whyType(s, t)),
        ),
        hint: 'Supprime d’abord le groupe qui dit quand. Puis compte les noms du sujet : un nom qui en complète un autre ne compte pas à part.',
        steps: [
          `Je mets de côté « ${pre.slice(0, -1)} » : il dit quand, ce n’est pas le sujet.`,
          ...stepsType(s).slice(0, 2),
          `Le sujet est **${TYPE_LABEL[type]}**.`,
        ],
      };
    }
    default: {
      const k = rng.int(1, 2);
      const piege = rng.pick(SUJETS_PIEGES);
      const rest = pickN(
        rng,
        SUJETS.filter((s) => s.type !== 'noms'),
        3 - k,
      );
      const lines = rng.shuffle<Sujet>([...pickN(rng, byType('noms'), k), piege, ...rest]);
      const p = lines.filter((s) => s.type === 'pronom').length;
      const g = lines.filter((s) => s.type === 'gn').length;
      return {
        prompt: 'Lis ce texte. Dans combien de phrases le sujet est-il formé de plusieurs noms ?',
        figure: document(
          'Quelques phrases',
          lines.map((s) => phraseS(s)),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [g, 'Tu as compté les groupes nominaux : ils n’ont qu’un seul nom noyau.'],
          ...(p > 0
            ? [[p, 'Tu as compté les pronoms : un pronom remplace un nom, ce n’est pas « plusieurs noms ».'] as const]
            : []),
          [
            k + 1,
            `Tu en as compté un de trop. Dans « ${piege.s} », ${piege.piege ?? ''} C’est un seul groupe nominal.`,
          ],
        ]),
        hint: 'Cherche les sujets où des noms sont reliés par « et » ou par une virgule.',
        steps: [
          'Pour chaque ligne, je trouve le sujet avec « Qui est-ce qui… ? ».',
          'Je garde ceux où plusieurs noms sont reliés par « et » ou par une virgule.',
          `Je compte : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. Nom ou verbe ─────────────────────────

const words = (text: string): string[] => text.replace(/\.$/, '').split(' ');
const nSg = (e: NomVerbe) => `${e.det} ${e.mot}`;
const nPl = (e: NomVerbe) => `des ${e.mot}s`;
const vSg = (e: NomVerbe) => `${e.sujet} ${e.mot}`;
const vPl = (e: NomVerbe) => `${e.sujet}s ${e.mot}nt`;

function nomVerbeDraft(rng: Rng, level: Level): QuestionDraft {
  const e = rng.pick(NOMS_VERBES);
  const isVerb = rng.int(0, 1) === 1;
  const text = isVerb ? e.verbe : e.nom;
  switch (level) {
    case 1: {
      const correct = isVerb ? 'un verbe' : 'un nom';
      const { answer, traps } = choice(
        rng,
        correct,
        [
          {
            label: 'un nom',
            why: `Ici, « ${e.mot} » dit ce que fait quelqu’un et change avec le sujet (${vSg(e)}, ${vPl(e)}) : c’est un verbe.`,
          },
          {
            label: 'un verbe',
            why: `Ici, on peut dire « ${nSg(e)} » et « ${nPl(e)} » : c’est un nom. Il ne change pas avec un sujet.`,
          },
          {
            label: 'un adjectif',
            why: `Un adjectif décrit un nom (un chat noir). Ici, « ${e.mot} » ne décrit aucun nom.`,
          },
        ].filter((o) => o.label !== correct),
        true,
      );
      return {
        prompt: `Dans « ${text} », quelle est la nature du mot « ${e.mot} » ?`,
        answer,
        traps,
        hint: 'Essaie de mettre « un » ou « une » devant le mot, ou de changer le sujet de la phrase.',
        steps: isVerb
          ? [
              `Je change le sujet : « ${vSg(e)} » devient « ${vPl(e)} ». Le mot change.`,
              'Un mot qui change avec le sujet est un verbe.',
              `Ici, « ${e.mot} » est **un verbe**.`,
            ]
          : [
              `Je mets le mot au pluriel : « ${nSg(e)} » devient « ${nPl(e)} ».`,
              'Un mot qui prend un déterminant et un -s au pluriel est un nom.',
              `Ici, « ${e.mot} » est **un nom**.`,
            ],
      };
    }
    case 2: {
      const verb = isVerb ? e.mot : e.verbeDuNom;
      const others = words(text).filter((w) => !same(w, verb));
      const noun = !isVerb ? others.filter((w) => same(w, e.mot)) : [];
      const wrong = [...noun, ...rng.shuffle(others.filter((w) => !noun.includes(w)))].slice(0, 3);
      const { answer, traps } = choice(
        rng,
        verb,
        wrong.map((w) => ({
          label: w,
          why: same(w, e.mot)
            ? `Ici, « ${e.mot} » est un nom : on peut dire « ${nSg(e)} », « ${nPl(e)} ». Le verbe est « ${verb} ».`
            : `« ${w} » ne dit pas ce que fait ou ce qu’est le sujet : ce n’est pas le verbe.`,
        })),
      );
      return {
        prompt: `Dans cette phrase, quel mot est le verbe ? « ${text} »`,
        answer,
        traps,
        hint: 'Attention : un mot de la phrase peut ressembler à un verbe alors que c’est un nom. Change le sujet pour voir quel mot bouge.',
        steps: [
          'Un verbe change quand on change le sujet ; un nom, lui, prend un déterminant.',
          isVerb
            ? `« ${vSg(e)} » devient « ${vPl(e)} » : le mot bouge, c’est le verbe.`
            : `« ${e.mot} » est un nom (${nSg(e)}, ${nPl(e)}). Le vrai verbe est « ${verb} ».`,
          `Le verbe est **${verb}**.`,
        ],
      };
    }
    case 3: {
      const sg = isVerb ? vSg(e) : nSg(e);
      const pl = isVerb ? vPl(e) : nPl(e);
      return {
        prompt: `Mets au pluriel : « ${sg} ».`,
        answer: { kind: 'text', accepted: [pl] },
        traps: isVerb
          ? [
              textTrap(
                `${e.sujet}s ${e.mot}`,
                'Avec « ils » ou « elles », le verbe prend la terminaison -nt : il faut le changer.',
              ),
              textTrap(
                `${e.sujet}s ${e.mot}s`,
                'Le -s est la marque du pluriel des noms. Un verbe écrit avec « ils » ou « elles » finit par -nt.',
              ),
            ]
          : [
              textTrap(`des ${e.mot}`, 'Un nom prend un -s au pluriel : des ' + e.mot + 's.'),
              textTrap(`des ${e.mot}nt`, 'La terminaison -nt est celle des verbes. Un nom prend un -s au pluriel.'),
            ],
        hint: isVerb
          ? 'Pour un verbe, c’est le sujet qui change. Ajoute la terminaison qui va avec « ils » ou « elles ».'
          : 'Pour un nom, on change le déterminant et on ajoute la marque du pluriel.',
        steps: isVerb
          ? [
              `« ${e.mot} » est ici un verbe : il s’accorde avec son sujet.`,
              `Avec « ${e.sujet}s », le verbe prend -nt.`,
              `Au pluriel : **${pl}**.`,
            ]
          : [
              `« ${e.mot} » est ici un nom : il prend un déterminant.`,
              'Au pluriel, le déterminant devient « des » et le nom prend un -s.',
              `Au pluriel : **${pl}**.`,
            ],
      };
    }
    case 4: {
      const verb = isVerb ? e.mot : e.verbeDuNom;
      const ws = words(text);
      const sujet = at(ws, 0);
      const autres = ws.filter((w) => !same(w, verb) && !same(w, e.mot));
      const last = at(autres, autres.length - 1);
      return {
        prompt: `Écris le verbe conjugué de cette phrase : « ${text} »`,
        answer: { kind: 'text', accepted: [verb] },
        traps: isVerb
          ? [
              textTrap(
                sujet,
                `« ${sujet} » est le pronom sujet : il dit qui fait l’action, mais ce n’est pas le verbe.`,
              ),
              textTrap(last, `« ${last} » est un autre mot de la phrase : ce n’est pas lui qui change avec le sujet.`),
            ]
          : [
              textTrap(
                e.mot,
                `Ici, « ${e.mot} » est un nom : on peut dire « ${nSg(e)} », « ${nPl(e)} ». Ce n’est pas le verbe.`,
              ),
              textTrap(last, `« ${last} » est un autre mot de la phrase : ce n’est pas lui qui change avec le sujet.`),
            ],
        hint: 'Change le sujet (ou mets la phrase au passé avec « hier ») : le mot qui change est le verbe.',
        steps: [
          'Un verbe change avec le sujet et le temps. Un nom ne dit pas ce que fait le sujet.',
          isVerb
            ? `« ${e.mot} » change : « ${vSg(e)} », « ${vPl(e)} ». C’est le verbe.`
            : `« ${e.mot} » est ici un nom (${nSg(e)}, ${nPl(e)}). Le verbe est un autre mot.`,
          `Le verbe conjugué est **${verb}**.`,
        ],
      };
    }
    default: {
      const k = rng.int(1, 3);
      const entries = pickN(rng, NOMS_VERBES, 4);
      const flags = rng.shuffle([0, 1, 2, 3].map((i) => i < k));
      const lines = entries.map((x, i) => `${flags[i] ? x.verbe : x.nom} (mot à étudier : ${x.mot})`);
      return {
        prompt: 'Lis ce texte. Dans combien de phrases le mot à étudier est-il un verbe ?',
        figure: document('Quelques phrases', lines),
        answer: num(k),
        traps: numTraps(r(k), [
          [4 - k, 'Tu as compté les noms au lieu des verbes.'],
          [k + 1, 'Tu en as compté un de trop : pour chaque mot, essaie « un / une » devant, puis change le sujet.'],
          [k - 1, 'Il t’en manque un : un mot qui change avec le sujet est un verbe, même s’il ressemble à un nom.'],
        ]),
        hint: 'Pour chaque ligne, essaie de mettre « un » ou « une » devant le mot : si c’est possible, c’est un nom.',
        steps: [
          'Pour chaque ligne, je regarde le mot à étudier.',
          'Si je peux dire « un / une » devant, c’est un nom. S’il change avec le sujet, c’est un verbe.',
          `Je compte les verbes : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── Notions du chapitre ─────────────────────────

interface Notion {
  readonly id: string;
  readonly title: string;
  readonly memo: readonly string[];
  readonly factId: string;
  readonly generate: Skill['generate'];
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: { memo: n.memo, source: programme(n.factId), sources: [PROGRAMME] },
  generate: n.generate,
});

export const FCM1_VERBE_SUJET: readonly Skill[] = [
  skill({
    id: 'fcm1-verbe-conjugue',
    title: 'Trouver le verbe conjugué',
    memo: [
      'Le **verbe conjugué** dit ce que fait quelqu’un. Il change avec le sujet et le temps : « Je mange », « Hier, je mangeais ».',
      'Astuce : commence la phrase par « hier ». Le mot qui change, c’est le verbe conjugué.',
      'Un verbe à l’**infinitif** ne change pas : dans « Je veux manger », le verbe conjugué est « veux ».',
    ],
    factId: 'verbe-conjugue',
    generate: verbeDraft,
  }),
  skill({
    id: 'fcm1-infinitif',
    title: 'Trouver l’infinitif',
    memo: [
      'L’**infinitif** est le nom du verbe, celui du dictionnaire : chanter, finir, prendre.',
      'Pour le retrouver, dis « il faut… » devant. « Nous chantons » : il faut chanter.',
      'Attention : le verbe conjugué (« chantons ») n’est pas l’infinitif.',
    ],
    factId: 'infinitif',
    generate: infinitifDraft,
  }),
  skill({
    id: 'fcm1-groupe-sujet',
    title: 'Trouver le groupe sujet',
    memo: [
      'Le **groupe sujet** dit qui fait l’action. Pose la question « Qui est-ce qui… ? » devant le verbe.',
      'Tu peux aussi l’encadrer : « C’est le petit chat qui dort. »',
      'Le groupe sujet contient tous les mots autour du **nom noyau**. Ici, le nom noyau est « chat ».',
    ],
    factId: 'groupe-sujet',
    generate: sujetDraft,
  }),
  skill({
    id: 'fcm1-types-sujets',
    title: 'Sujet pronom, groupe nominal ou plusieurs noms',
    memo: [
      'Le sujet peut être un **pronom personnel** : « Elle chante. » Il remplace un nom.',
      'Il peut être un **groupe nominal** : « Le petit chat dort. » Un seul nom, avec son déterminant.',
      'Il peut être formé de plusieurs noms : « Mon père et ma mère cuisinent. »',
    ],
    factId: 'types-sujets',
    generate: typesSujetsDraft,
  }),
  skill({
    id: 'fcm1-nom-ou-verbe',
    title: 'Nom ou verbe : une élève, il élève',
    memo: [
      'Certains mots s’écrivent pareil, mais n’ont pas la même nature. « Une élève » : c’est un **nom**. « Il élève des lapins » : c’est un verbe.',
      'Un nom prend un déterminant et un -s au pluriel : des élèves. Un verbe change avec le sujet : il élève, ils élèvent.',
    ],
    factId: 'variations',
    generate: nomVerbeDraft,
  }),
];
