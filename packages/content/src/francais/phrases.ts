import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import {
  AMORCES,
  DECLARATIVES,
  EXCLAMATIVES,
  IMPERATIVES,
  INTERROGATIVES,
  LIGNES_NEGATION,
  NEGATIONS,
  QUESTIONS,
  TRIPLETS,
  fait,
} from './phrases.donnees.ts';

/**
 * Chapitre « Types et formes de phrases » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Connaître les trois types de phrases et leurs formes ».
 */
const PROGRAMME = 'francais-cycle3-2025';
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${fait(id).citation} »`;

type TypeId = 'declarative' | 'interrogative' | 'imperative';
const TYPES: readonly TypeId[] = ['declarative', 'interrogative', 'imperative'];
const LABEL: Record<TypeId, string> = {
  declarative: 'phrase déclarative',
  interrogative: 'phrase interrogative',
  imperative: 'phrase impérative',
};
const REASON: Record<TypeId, string> = {
  declarative: 'elle donne une information',
  interrogative: 'elle pose une question',
  imperative: 'elle donne un ordre ou un conseil',
};
const NAMES: Record<TypeId, readonly string[]> = {
  declarative: ['déclarative', 'declarative', 'phrase déclarative', 'phrase declarative', 'déclaratif', 'declaratif'],
  interrogative: ['interrogative', 'phrase interrogative', 'interrogatif'],
  imperative: [
    'impérative',
    'imperative',
    'phrase impérative',
    'phrase imperative',
    'impératif',
    'imperatif',
    'injonctive',
    'injonctif',
  ],
};

/** Signe de fin de chaque type, avec l'espace avant « ? » et « ! ». */
const SIGN = { declarative: '.', interrogative: ' ?', imperative: '.', exclamative: ' !' } as const;
const withSign = (text: string, kind: keyof typeof SIGN) => `${text}${SIGN[kind]}`;

/** Écritures acceptées d'une phrase : avec le signe collé ou espacé, ou sans signe. */
const variants = (text: string, signs: readonly string[]): string[] => [
  ...new Set([...signs.map((s) => `${text}${s}`), text]),
];

/** Élément d'une liste à un indice valide (échec franc sinon). */
function at<T>(items: readonly T[], i: number): T {
  const v = items[i];
  if (v === undefined) throw new RangeError(`indice hors liste : ${i}`);
  return v;
}
const first = <T>(items: readonly T[]): T => at(items, 0);

const pickN = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle(items).slice(0, n);

/** Permutation de 0..n-1 qui n'est pas l'identité (les colonnes ne sont jamais déjà en face). */
function shuffledIndices(rng: Rng, n: number): number[] {
  const id = Array.from({ length: n }, (_, i) => i);
  let p = rng.shuffle(id);
  while (p.every((v, i) => v === i)) p = rng.shuffle(id);
  return p;
}

const document = (title: string, lines: readonly string[]) => ({ kind: 'document' as const, title, lines });
const textTrap = (text: string, why: string): Trap => ({ text, why });

// ───────────────────────── 1. Les trois types de phrases ─────────────────────────

function phraseOf(rng: Rng, type: TypeId): string {
  const bank = type === 'declarative' ? DECLARATIVES : type === 'interrogative' ? INTERROGATIVES : IMPERATIVES;
  return rng.pick(bank);
}

const whyNotType = (wrong: TypeId, actual: TypeId) => `Ce n’est pas une ${LABEL[wrong]} : ici, ${REASON[actual]}.`;

function typesDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const type = rng.pick(TYPES);
      const phrase = withSign(phraseOf(rng, type), type);
      const { answer, traps } = choice(
        rng,
        LABEL[type],
        TYPES.filter((t) => t !== type).map((t) => ({ label: LABEL[t], why: whyNotType(t, type) })),
      );
      return {
        prompt: `De quel type est cette phrase ? « ${phrase} »`,
        answer,
        traps,
        hint: 'Demande-toi : la phrase donne une information, pose une question ou donne un ordre ?',
        steps: [
          'On cherche ce que la phrase fait : informer, questionner ou ordonner.',
          `Ici, ${REASON[type]}.`,
          `C’est une **${LABEL[type]}**.`,
        ],
      };
    }
    case 2: {
      const t = rng.pick(TRIPLETS);
      const rows = rng.shuffle([
        { text: withSign(t.declarative, 'declarative'), type: 'declarative' as const },
        { text: withSign(t.interrogative, 'interrogative'), type: 'interrogative' as const },
        { text: withSign(t.imperative, 'imperative'), type: 'imperative' as const },
      ]);
      let right = rng.shuffle(TYPES);
      while (rows.every((x, i) => right.indexOf(x.type) === i)) right = rng.shuffle(TYPES);
      return {
        prompt: `Ces trois phrases parlent de la même chose (${t.declarative.toLowerCase()}). Associe chaque phrase à son type.`,
        answer: {
          kind: 'match',
          left: rows.map((x) => x.text),
          right: right.map((x) => LABEL[x]),
          pairs: rows.map((x) => right.indexOf(x.type)),
        },
        hint: 'Cherche la phrase qui pose une question, puis celle qui donne un ordre (le verbe est au début, sans sujet).',
        steps: [
          'Les trois phrases se ressemblent : regarde ce que chacune fait.',
          `La phrase « ${withSign(t.interrogative, 'interrogative')} » pose une question.`,
          `La phrase « ${withSign(t.imperative, 'imperative')} » donne un ordre : le verbe est en premier, sans sujet.`,
          `La phrase « ${withSign(t.declarative, 'declarative')} » donne une information.`,
          'Chaque phrase a donc son type : **déclarative, interrogative, impérative**.',
        ],
      };
    }
    case 3: {
      const t = rng.pick(TRIPLETS);
      const type = rng.pick(TYPES);
      const phrase = withSign(t[type], type);
      return {
        prompt: `Écris le type de cette phrase (déclarative, interrogative ou impérative) : « ${phrase} »`,
        answer: { kind: 'text', accepted: NAMES[type] },
        traps: TYPES.filter((x) => x !== type).map((x) => textTrap(first(NAMES[x]), whyNotType(x, type))),
        hint: 'Que fait cette phrase : elle informe, elle questionne ou elle ordonne ?',
        steps: [
          'Je lis la phrase et je me demande ce qu’elle fait.',
          `Ici, ${REASON[type]}.`,
          `Le type est : **${NAMES[type][0]}**.`,
        ],
      };
    }
    case 4: {
      const t = rng.pick(TRIPLETS);
      return {
        prompt: `Transforme cette phrase déclarative en phrase impérative : « ${t.declarative}. »`,
        answer: { kind: 'text', accepted: variants(t.imperative, ['.', ' !', '!']) },
        traps: [
          textTrap(
            `${t.declarative}.`,
            'Tu as recopié la phrase déclarative. Pour donner un ordre, il faut changer la phrase : le verbe passe au début.',
          ),
          textTrap(`${t.interrogative} ?`, 'Cette phrase pose une question. Il fallait donner un ordre.'),
        ],
        hint: 'Imagine que tu donnes un ordre à quelqu’un : le verbe se place au début.',
        steps: [
          'Une phrase impérative donne un ordre ou un conseil.',
          'On place le verbe au début, on ne dit plus le sujet.',
          `La phrase devient : **${t.imperative}.**`,
        ],
      };
    }
    default: {
      const k = rng.int(1, 3);
      const q = k === 3 ? 1 : rng.int(1, 2);
      const d = 5 - k - q;
      const lines = rng.shuffle([
        ...pickN(rng, IMPERATIVES, k).map((x) => withSign(x, 'imperative')),
        ...pickN(rng, INTERROGATIVES, q).map((x) => withSign(x, 'interrogative')),
        ...pickN(rng, DECLARATIVES, d).map((x) => withSign(x, 'declarative')),
      ]);
      return {
        prompt: 'Lis ce texte. Combien de phrases impératives contient-il ?',
        figure: document('Dans la classe', lines),
        answer: num(k),
        traps: numTraps(r(k), [
          [q, 'Tu as compté les phrases interrogatives : ce sont les questions, elles se terminent par « ? ».'],
          [d, 'Tu as compté les phrases déclaratives : elles donnent une information.'],
          [k + 1, 'Tu en as compté une de trop. Une phrase impérative donne un ordre : relis chaque ligne.'],
        ]),
        hint: 'Cherche les phrases qui donnent un ordre ou un conseil.',
        steps: [
          'Je lis chaque ligne et je me demande ce qu’elle fait.',
          'Une phrase impérative donne un ordre : le verbe est au début, sans sujet.',
          `Je compte les ordres : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Poser une question ─────────────────────────

type Tournure = 'intonation' | 'estCeQue' | 'inversion';
const TOURNURES: readonly Tournure[] = ['intonation', 'estCeQue', 'inversion'];
const TOURNURE_LABEL: Record<Tournure, string> = {
  estCeQue: 'avec « est-ce que »',
  inversion: 'avec l’inversion du sujet',
  intonation: 'avec l’intonation seulement',
};
const NEGATIVE_LABEL = 'à la forme négative';

const WHY_TOURNURE: Record<Tournure | 'negative', string> = {
  estCeQue: 'Cherche « est-ce que » au début de la phrase : il n’y est pas.',
  inversion: 'Pour une inversion, le verbe est avant le sujet, relié par un trait d’union : ce n’est pas le cas ici.',
  intonation: 'Ici, « est-ce que » est ajouté ou le sujet change de place : ce n’est pas seulement la voix qui monte.',
  negative: 'Il n’y a pas de « ne… pas » autour du verbe : la phrase n’est pas négative.',
};

function questionDraft(rng: Rng, level: Level): QuestionDraft {
  const item = rng.pick(QUESTIONS);
  switch (level) {
    case 1: {
      const { answer, traps } = choice(rng, `${item.estCeQue} ?`, [
        {
          label: `${item.intonation} ?`,
          why: 'Ici, la question est posée avec la seule intonation : la voix monte à la fin, sans autre mot.',
        },
        {
          label: `${item.inversion} ?`,
          why: 'Ici, le sujet est placé après le verbe : c’est une inversion du sujet, pas « est-ce que ».',
        },
      ]);
      return {
        prompt: 'Ces trois phrases posent la même question. Laquelle utilise « est-ce que » ?',
        answer,
        traps,
        hint: 'Cherche les trois petits mots placés au tout début de la phrase.',
        steps: [
          'On cherche les mots « est-ce que » (ou « est-ce qu’ ») au début de la phrase.',
          'Les autres phrases posent la question autrement : intonation ou inversion.',
          `La bonne phrase est : **${item.estCeQue} ?**`,
        ],
      };
    }
    case 2: {
      const tournure = rng.pick(TOURNURES);
      const { answer, traps } = choice(rng, TOURNURE_LABEL[tournure], [
        ...TOURNURES.filter((t) => t !== tournure).map((t) => ({ label: TOURNURE_LABEL[t], why: WHY_TOURNURE[t] })),
        { label: NEGATIVE_LABEL, why: WHY_TOURNURE.negative },
      ]);
      return {
        prompt: `Comment cette question est-elle posée ? « ${item[tournure]} ? »`,
        answer,
        traps,
        hint: 'Regarde le début de la phrase, puis l’ordre du sujet et du verbe.',
        steps: [
          'Je regarde le début de la phrase : y a-t-il « est-ce que » ?',
          'Sinon, je regarde si le verbe est avant le sujet, avec un trait d’union.',
          `La question est posée **${TOURNURE_LABEL[tournure]}**.`,
        ],
      };
    }
    case 3:
      return {
        prompt: `Pose la question avec « est-ce que » : « ${item.declarative}. »`,
        answer: { kind: 'text', accepted: variants(item.estCeQue, [' ?', '?']) },
        traps: [
          textTrap(
            `${item.inversion} ?`,
            'Cette question est juste, mais elle est posée avec l’inversion du sujet. Ici, il fallait « est-ce que ».',
          ),
          textTrap(
            `${item.intonation} ?`,
            'Cette question est posée avec l’intonation seulement. Ici, il fallait « est-ce que ».',
          ),
        ],
        hint: 'Commence la phrase par « est-ce que », puis recopie le sujet et le verbe sans les déplacer.',
        steps: [
          'Je place « est-ce que » au début de la phrase.',
          'Je garde le sujet et le verbe dans le même ordre.',
          `Je termine par un point d’interrogation : **${item.estCeQue} ?**`,
        ],
      };
    case 4:
      return {
        prompt: `Pose la question avec l’inversion du sujet : « ${item.declarative}. »`,
        answer: { kind: 'text', accepted: variants(item.inversion, [' ?', '?']) },
        traps: [
          textTrap(
            `${item.estCeQue} ?`,
            'Cette question est juste, mais elle est posée avec « est-ce que ». Ici, il fallait l’inversion du sujet.',
          ),
          textTrap(
            `${item.intonation} ?`,
            'Ici, le sujet n’a pas changé de place : c’est la seule intonation. Il fallait inverser le sujet.',
          ),
        ],
        hint: 'Place le verbe avant le sujet, et relie-les par un trait d’union.',
        steps: [
          'Pour inverser, le verbe passe avant le sujet.',
          'On relie le verbe et le sujet par un trait d’union.',
          `On termine par « ? » : **${item.inversion} ?**`,
        ],
      };
    default: {
      const items = pickN(rng, QUESTIONS, 4);
      const forms = items.map(() => rng.pick(TOURNURES));
      const count = (t: Tournure) => forms.filter((f) => f === t).length;
      const k = count('inversion');
      return {
        prompt: 'Lis ces questions. Combien sont posées avec l’inversion du sujet ?',
        figure: document(
          'À la récréation',
          items.map((it, i) => `${it[at(forms, i)]} ?`),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [count('estCeQue'), 'Tu as compté les questions avec « est-ce que ».'],
          [count('intonation'), 'Tu as compté les questions posées avec la seule intonation.'],
          [
            k + 1,
            'Tu en as compté une de trop : l’inversion se reconnaît au trait d’union entre le verbe et le sujet.',
          ],
        ]),
        hint: 'Repère le trait d’union entre le verbe et le sujet.',
        steps: [
          'Pour chaque ligne, je cherche « est-ce que » ou un verbe placé avant son sujet.',
          'L’inversion du sujet : le verbe vient avant le sujet, avec un trait d’union.',
          `Je compte les inversions : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. La forme négative ─────────────────────────

const MARQUES = ['pas', 'jamais', 'plus'] as const;
type Marque = (typeof MARQUES)[number];
const MARQUE_LABEL: Record<Marque | 'rien', string> = {
  pas: 'ne… pas',
  jamais: 'ne… jamais',
  plus: 'ne… plus',
  rien: 'ne… rien',
};

/** Retire le « ne » (ou « n’ ») de la phrase négative : l'oubli le plus courant. */
const withoutNe = (text: string) => text.replace(/ ne /, ' ').replace(/ n’/, ' ');

function negationDraft(rng: Rng, level: Level): QuestionDraft {
  const n = rng.pick(NEGATIONS);
  switch (level) {
    case 1: {
      const others = pickN(
        rng,
        NEGATIONS.filter((x) => x !== n),
        2,
      );
      const { answer, traps } = choice(
        rng,
        `${n.pas}.`,
        others.map((o) => ({
          label: `${o.affirmative}.`,
          why: 'Cette phrase est affirmative : le verbe n’est pas entouré de « ne » et d’un deuxième mot comme « pas ».',
        })),
      );
      return {
        prompt: 'Quelle phrase est à la forme négative ?',
        answer,
        traps,
        hint: 'Cherche une phrase où le verbe est entouré de deux petits mots, « ne » et « pas ».',
        steps: [
          'La forme négative dit que quelque chose n’est pas ou ne se fait pas.',
          'Le verbe est entouré de deux mots : « ne » avant, « pas » après.',
          `La phrase négative est : **${n.pas}.**`,
        ],
      };
    }
    case 2: {
      const m = rng.pick(MARQUES);
      const labels: readonly (Marque | 'rien')[] = ['pas', 'jamais', 'plus', 'rien'];
      const { answer, traps } = choice(
        rng,
        MARQUE_LABEL[m],
        labels
          .filter((l) => l !== m)
          .map((l) => ({
            label: MARQUE_LABEL[l],
            why: `Regarde le deuxième mot de la négation : ici, c’est « ${m} », pas « ${l} ».`,
          })),
        true,
      );
      return {
        prompt: `Quels mots forment la négation dans cette phrase ? « ${n[m]}. »`,
        answer,
        traps,
        hint: 'Repère le petit mot « ne » ou « n’ » avant le verbe, puis le mot qui le suit après le verbe.',
        steps: [
          'La négation s’écrit en deux mots, de chaque côté du verbe.',
          'Le premier est « ne » (ou « n’ »). Je cherche le second, après le verbe.',
          `Ici, la négation est : **${MARQUE_LABEL[m]}**.`,
        ],
      };
    }
    case 3:
      return {
        prompt: `Mets cette phrase à la forme négative avec « ne… pas » : « ${n.affirmative}. »`,
        answer: { kind: 'text', accepted: variants(n.pas, ['.']) },
        traps: [
          textTrap(withoutNe(n.pas), 'Il manque « ne » (ou « n’ ») avant le verbe : la négation a deux mots.'),
          textTrap(`${withoutNe(n.pas)}.`, 'Il manque « ne » (ou « n’ ») avant le verbe : la négation a deux mots.'),
          textTrap(n.pas.replace(' pas', ''), 'Il manque « pas » après le verbe : la négation a deux mots.'),
          textTrap(`${n.pas.replace(' pas', '')}.`, 'Il manque « pas » après le verbe : la négation a deux mots.'),
        ],
        hint: 'Entoure le verbe avec « ne » avant et « pas » après (« n’ » devant une voyelle).',
        steps: [
          'Je trouve le verbe de la phrase.',
          'Je place « ne » (ou « n’ ») avant lui et « pas » juste après.',
          `La phrase devient : **${n.pas}.**`,
        ],
      };
    case 4: {
      const m = rng.pick(['jamais', 'plus'] as const);
      return {
        prompt: `Écris cette phrase à la forme négative avec « ne… ${m} » : « ${n.affirmative}. »`,
        answer: { kind: 'text', accepted: variants(n[m], ['.']) },
        traps: [
          textTrap(`${n.pas}.`, `Tu as écrit « ne… pas ». La consigne demande « ne… ${m} ».`),
          textTrap(`${withoutNe(n[m])}.`, 'Il manque « ne » (ou « n’ ») avant le verbe : la négation a deux mots.'),
        ],
        hint: `La négation garde ses deux mots autour du verbe : « ne » avant, « ${m} » après.`,
        steps: [
          'Je trouve le verbe de la phrase.',
          `Je place « ne » (ou « n’ ») avant le verbe et « ${m} » juste après.`,
          `La phrase devient : **${n[m]}.**`,
        ],
      };
    }
    default: {
      const k = rng.int(1, 3);
      const negatives = LIGNES_NEGATION.filter((l) => l.negative);
      const affirmatives = LIGNES_NEGATION.filter((l) => !l.negative);
      const lines = rng.shuffle([...pickN(rng, negatives, k), ...pickN(rng, affirmatives, 5 - k)]).map((l) => l.text);
      return {
        prompt: 'Lis ce texte. Combien de phrases sont à la forme négative ?',
        figure: document('Le matin', lines),
        answer: num(k),
        traps: numTraps(r(k), [
          [5 - k, 'Tu as compté les phrases affirmatives.'],
          [k + 1, 'Tu en as compté une de trop : cherche « ne » et « pas », « jamais » ou « plus » autour du verbe.'],
          [k - 1, 'Tu en as oublié une : relis chaque ligne. Un ordre peut aussi être négatif.'],
        ]),
        hint: 'Cherche « ne » ou « n’ » avant le verbe, et « pas », « jamais » ou « plus » après.',
        steps: [
          'Je lis chaque ligne et je cherche le verbe.',
          'Une phrase négative entoure le verbe : « ne » avant, « pas », « jamais » ou « plus » après.',
          `Je compte les phrases négatives : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. La forme exclamative ─────────────────────────

function exclamativeDraft(rng: Rng, level: Level): QuestionDraft {
  const e = rng.pick(EXCLAMATIVES);
  const d = rng.pick(DECLARATIVES);
  const q = rng.pick(INTERROGATIVES);
  switch (level) {
    case 1: {
      const { answer, traps } = choice(rng, withSign(e, 'exclamative'), [
        {
          label: withSign(d, 'declarative'),
          why: 'Cette phrase donne une information : elle n’exprime pas une émotion vive et ne finit pas par « ! ».',
        },
        {
          label: withSign(q, 'interrogative'),
          why: 'Cette phrase pose une question : elle finit par un point d’interrogation.',
        },
      ]);
      return {
        prompt: 'Quelle phrase est à la forme exclamative ?',
        answer,
        traps,
        hint: 'Cherche la phrase qui exprime une émotion vive : joie, surprise, admiration…',
        steps: [
          'La forme exclamative exprime une émotion vive.',
          'Elle se termine par un point d’exclamation « ! ».',
          `La phrase exclamative est : **${withSign(e, 'exclamative')}**`,
        ],
      };
    }
    case 2: {
      const i = rng.pick(IMPERATIVES);
      const { answer, traps } = choice(rng, withSign(e, 'exclamative'), [
        {
          label: withSign(d, 'declarative'),
          why: 'Cette phrase donne une information, sans émotion vive.',
        },
        {
          label: withSign(q, 'interrogative'),
          why: 'Cette phrase pose une question : elle finit par un point d’interrogation.',
        },
        {
          label: withSign(i, 'imperative'),
          why: 'Cette phrase donne un ordre : c’est une phrase impérative.',
        },
      ]);
      return {
        prompt: 'Une seule de ces phrases est à la forme exclamative. Laquelle ?',
        answer,
        traps,
        hint: 'Regarde le signe de la fin, puis demande-toi si la phrase exprime une émotion vive.',
        steps: [
          'Je regarde ce que fait chaque phrase : informer, questionner, ordonner ou s’exclamer.',
          'La phrase exclamative exprime une émotion vive et finit par « ! ».',
          `La bonne phrase est : **${withSign(e, 'exclamative')}**`,
        ],
      };
    }
    case 3: {
      const words = `${e} !`.split(' ');
      const perm = shuffledIndices(rng, words.length);
      return {
        prompt: `Remets les mots dans l’ordre pour écrire une phrase exclamative : ${perm.map((i) => words[i]).join(' / ')}`,
        answer: {
          kind: 'order',
          items: perm.map((i) => at(words, i)),
          correct: words.map((_, pos) => perm.indexOf(pos)),
        },
        hint: 'La phrase commence par une majuscule et se termine par « ! ».',
        steps: [
          'Je cherche le mot qui commence la phrase : il a une majuscule.',
          'Le point d’exclamation se place à la fin.',
          `La phrase est : **${withSign(e, 'exclamative')}**`,
        ],
      };
    }
    case 4: {
      const a = rng.pick(AMORCES);
      return {
        prompt: `Complète cette phrase exclamative avec le mot qui manque au début : « … ${a.rest} »`,
        answer: { kind: 'text', accepted: a.accepted },
        traps: a.wrong.map((w) => textTrap(w.text, w.why)),
        hint: 'Le mot du début exprime l’admiration ou la surprise. Regarde s’il y a un nom ensuite, et son genre.',
        steps: [
          'Je lis la fin de la phrase pour voir ce qui suit le mot manquant.',
          'Devant un nom, on écrit Quel (masculin) ou Quelle (féminin). Devant un verbe ou un adjectif, on écrit Comme ou Que.',
          `Le mot qui manque est : **${a.accepted[0]}**.`,
        ],
      };
    }
    default: {
      const lines = rng.shuffle([
        { text: withSign(e, 'exclamative'), kind: 'excl' },
        ...pickN(rng, DECLARATIVES, 2).map((x) => ({ text: withSign(x, 'declarative'), kind: 'decl' })),
        { text: withSign(q, 'interrogative'), kind: 'interr' },
        { text: withSign(rng.pick(IMPERATIVES), 'imperative'), kind: 'imper' },
      ]);
      const position = (kind: string) => lines.findIndex((l) => l.kind === kind) + 1;
      const k = position('excl');
      return {
        prompt: 'Une seule ligne de ce texte est à la forme exclamative. Quel est son numéro ?',
        figure: document(
          'Au zoo',
          lines.map((l) => l.text),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [position('interr'), 'Cette ligne pose une question : elle finit par un point d’interrogation.'],
          [position('imper'), 'Cette ligne donne un ordre : c’est une phrase impérative.'],
          [position('decl'), 'Cette ligne donne une information, sans émotion vive.'],
        ]),
        hint: 'Cherche la ligne qui finit par « ! » et qui exprime une émotion.',
        steps: [
          'Je lis chaque ligne et je regarde le signe de la fin.',
          'La forme exclamative exprime une émotion vive et finit par « ! ».',
          `C’est la ligne numéro **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. La ponctuation de fin de phrase ─────────────────────────

type Fin = 'declarative' | 'interrogative' | 'exclamative';
const FINS: readonly Fin[] = ['declarative', 'interrogative', 'exclamative'];
const MARK: Record<Fin, string> = { declarative: '.', interrogative: '?', exclamative: '!' };
const WHY_MARK: Record<string, string> = {
  '.': 'Le point termine une phrase qui donne une information.',
  '?': 'Le point d’interrogation termine une question.',
  '!': 'Le point d’exclamation termine une phrase qui exprime une émotion vive.',
  ',': 'La virgule sépare des mots dans une phrase : elle ne la termine pas.',
  ';': 'Le point-virgule sépare deux parties d’une phrase : il ne la termine pas.',
};
const FIN_REASON: Record<Fin, string> = {
  declarative: 'cette phrase donne une information',
  interrogative: 'cette phrase pose une question',
  exclamative: 'cette phrase exprime une émotion vive',
};
/** Signes proposés à tort : jamais un signe qui pourrait aussi convenir. */
const WRONG_MARKS: Record<Fin, readonly string[]> = {
  declarative: ['?', ',', ';'],
  interrogative: ['.', ',', ';'],
  exclamative: ['?', ',', ';'],
};
const bankOf = (fin: Fin) =>
  fin === 'declarative' ? DECLARATIVES : fin === 'interrogative' ? INTERROGATIVES : EXCLAMATIVES;
const whyWrongMark = (mark: string, fin: Fin) => `${WHY_MARK[mark]} Ici, ${FIN_REASON[fin]}.`;

function ponctuationDraft(rng: Rng, level: Level): QuestionDraft {
  const fin = rng.pick(FINS);
  const phrase = rng.pick(bankOf(fin));
  const mark = MARK[fin];
  switch (level) {
    case 1: {
      const { answer, traps } = choice(
        rng,
        mark,
        FINS.filter((f) => f !== fin).map((f) => ({ label: MARK[f], why: whyWrongMark(MARK[f], fin) })),
      );
      return {
        prompt: `Quel signe termine cette phrase ? « ${phrase} … »`,
        answer,
        traps,
        hint: 'Demande-toi : la phrase informe, pose une question ou exprime une émotion vive ?',
        steps: [
          'Le signe de fin dépend de ce que la phrase fait.',
          `Ici, ${FIN_REASON[fin]}.`,
          `Le signe qui convient est : **${mark}**`,
        ],
      };
    }
    case 2: {
      const wrongs = WRONG_MARKS[fin];
      const { answer, traps } = choice(
        rng,
        withSign(phrase, fin),
        wrongs.map((w) => ({ label: `${phrase}${w === ',' || w === ';' ? w : ` ${w}`}`, why: whyWrongMark(w, fin) })),
      );
      return {
        prompt: 'Quelle phrase est bien ponctuée ?',
        answer,
        traps,
        hint: 'Lis la phrase à voix haute : que fait-elle ? Cela te donne le signe de fin.',
        steps: [
          'Je me demande ce que fait la phrase : informer, questionner ou exprimer une émotion vive.',
          `Ici, ${FIN_REASON[fin]}, donc elle se termine par « ${mark} ».`,
          `La phrase bien ponctuée est : **${withSign(phrase, fin)}**`,
        ],
      };
    }
    case 3:
      return {
        prompt: `Écris le signe de ponctuation qui termine cette phrase : « ${phrase} … »`,
        answer: { kind: 'text', accepted: [mark] },
        traps: WRONG_MARKS[fin].slice(0, 2).map((w) => textTrap(w, whyWrongMark(w, fin))),
        hint: 'Quel signe termine une phrase qui informe, qui questionne, ou qui exprime une émotion vive ?',
        steps: [
          'Je me demande ce que fait la phrase.',
          `Ici, ${FIN_REASON[fin]}.`,
          `Le signe de fin est : **${mark}**`,
        ],
      };
    case 4: {
      const order = rng.shuffle(FINS);
      const sentences = order.map((f) => rng.pick(bankOf(f)));
      return {
        prompt: 'Lis ces trois phrases sans leur signe de fin, puis complète la ponctuation de chacune.',
        figure: document('Sans ponctuation', sentences),
        answer: {
          kind: 'cloze',
          parts: [`${sentences[0]} `, ` ${sentences[1]} `, ` ${sentences[2]} `, ''],
          blanks: order.map((f) => ({ mode: 'text' as const, accepted: [MARK[f]] })),
        },
        hint: 'Pour chaque phrase, demande-toi si elle informe, pose une question ou exprime une émotion vive.',
        steps: [
          'Je traite les phrases une par une.',
          'Une information finit par « . », une question par « ? », une émotion vive par « ! ».',
          `Les signes sont : **${order.map((f) => MARK[f]).join(' ')}**`,
        ],
      };
    }
    default: {
      const kinds = rng.shuffle([fin, ...pickN(rng, FINS, 3)]).slice(0, 4);
      const target = rng.int(0, 3);
      const lines = kinds.map((f, i) => {
        const text = rng.pick(bankOf(f));
        return i === target ? text : withSign(text, f);
      });
      const targetFin = at(kinds, target);
      const targetMark = MARK[targetFin];
      return {
        prompt: `Un signe de fin manque à la ligne ${target + 1} de ce texte. Écris-le.`,
        figure: document('Une conversation', lines),
        answer: { kind: 'text', accepted: [targetMark] },
        traps: WRONG_MARKS[targetFin].slice(0, 2).map((w) => textTrap(w, whyWrongMark(w, targetFin))),
        hint: 'Lis la ligne : informe-t-elle, pose-t-elle une question, ou exprime-t-elle une émotion vive ?',
        steps: [
          `Je lis la ligne ${target + 1} sans oublier le reste du texte.`,
          `Ici, ${FIN_REASON[targetFin]}.`,
          `Le signe qui manque est : **${targetMark}**`,
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
  readonly sources?: readonly string[];
  readonly generate: Skill['generate'];
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: { memo: n.memo, source: programme(n.factId), sources: [PROGRAMME, ...(n.sources ?? [])] },
  generate: n.generate,
});

export const FCM1_PHRASES: readonly Skill[] = [
  skill({
    id: 'fcm1-types-phrases',
    title: 'Phrase déclarative, interrogative, impérative',
    memo: [
      'Une **phrase déclarative** donne une information : « Le chat dort. »',
      'Une **phrase interrogative** pose une question : « Où dort le chat ? »',
      'Une **phrase impérative** donne un ordre ou un conseil : « Range ta chambre. »',
    ],
    factId: 'types',
    generate: typesDraft,
  }),
  skill({
    id: 'fcm1-poser-question',
    title: 'Poser une question',
    memo: [
      'Pour poser une question, tu as trois façons. Ta voix monte à la fin : « Tu viens ? » C’est l’**intonation**.',
      'Tu ajoutes **est-ce que** au début : « Est-ce que tu viens ? »',
      'Tu fais l’**inversion du sujet** : le verbe passe avant le sujet. « Viens-tu ? »',
    ],
    factId: 'interroger',
    sources: ['cnrtl-interrogation'],
    generate: questionDraft,
  }),
  skill({
    id: 'fcm1-forme-negative',
    title: 'La forme négative',
    memo: [
      'La **forme négative** dit que quelque chose n’est pas ou ne se fait pas.',
      'Le verbe est entouré de deux mots : « ne… pas », « ne… jamais » ou « ne… plus ». Exemple : « Le chien ne dort pas. »',
    ],
    factId: 'formes',
    generate: negationDraft,
  }),
  skill({
    id: 'fcm1-forme-exclamative',
    title: 'La forme exclamative',
    memo: [
      'La **forme exclamative** exprime une **émotion vive** : joie, surprise, admiration.',
      'Elle se termine par un **point d’exclamation**. Exemple : « Quel beau dessin ! »',
    ],
    factId: 'formes',
    sources: ['cnrtl-exclamation'],
    generate: exclamativeDraft,
  }),
  skill({
    id: 'fcm1-ponctuation-fin',
    title: 'La ponctuation de fin de phrase',
    memo: [
      'La **ponctuation** de fin dit ce que fait la phrase.',
      'Le point termine une information : « Il pleut. » Le **point d’interrogation** termine une question : « Il pleut ? »',
      'Le **point d’exclamation** termine une émotion vive : « Il pleut ! »',
    ],
    factId: 'interroger',
    sources: ['cnrtl-interrogation', 'cnrtl-exclamation'],
    generate: ponctuationDraft,
  }),
];
