import type { Chapter, Level, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { CONJUGAISONS } from './conjugaisons.generated.ts';
import { PERSONS, PRONOUN, type Person } from './present-reguliers-faits.ts';
import { capital, dotted, matching, noAccent, options } from './present-reguliers.ts';

/**
 * Espagnol 5e — « Ser, estar, hay » (lot es-5e-03, docs/adr/0034). Programme : annexe 9 de l'arrêté du 5 mai 2025
 * (présent des verbes irréguliers ser et estar ; estar + gérondif ; obligation impersonnelle « hay que »). Formes et
 * règles : Real Academia Española et Instituto Cervantes (voir ser-estar-hay-faits.ts).
 */

type Copula = 'ser' | 'estar';
const form = (v: Copula, p: Person): string => CONJUGAISONS[v].present[p];
const table = (v: Copula) => PERSONS.map((p) => `${PRONOUN[p]} ${form(v, p)}`).join(', ');
/** Pronom cité dans les étapes : la 3e personne vaut aussi pour le féminin. */
const subjectOf = (p: Person) => (p === 'el' ? 'él / ella' : p === 'ellos' ? 'ellos / ellas' : PRONOUN[p]);
const other = (v: Copula): Copula => (v === 'ser' ? 'estar' : 'ser');

/** Phrase à compléter : « before … after ». */
interface Phrase {
  readonly before: string;
  readonly after: string;
  readonly verb: Copula;
  readonly person: Person;
  /** Pourquoi ce verbe (et, le cas échéant, cette personne). */
  readonly why: string;
}

const phrase = (before: string, after: string, verb: Copula, person: Person, why: string): Phrase => ({
  before,
  after,
  verb,
  person,
  why,
});
/** Pas d'espace après « ¿ » ni avant la ponctuation. */
const sentence = (s: Pick<Phrase, 'before' | 'after'>) => {
  const start = s.before === '' || s.before === '¿' ? s.before : `${s.before} `;
  return `${start}…${/^[?!.,]/.test(s.after) ? '' : ' '}${s.after}`;
};
const right = (s: Phrase) => form(s.verb, s.person);
/** Réponse affichée : majuscule quand le verbe ouvre la phrase. */
const shown = (s: Phrase) => (s.before === '' || s.before === '¿' ? capital(right(s)) : right(s));

const ORIGIN = '« ser » dit d’où vient quelqu’un.';
const IDENTITY = '« ser » dit qui est quelqu’un (nom, famille, métier).';
const NATION = '« ser » dit la nationalité.';

const SER_BASE: readonly Phrase[] = [
  phrase('Yo', 'Elena.', 'ser', 'yo', IDENTITY),
  phrase('Yo', 'de Sevilla.', 'ser', 'yo', ORIGIN),
  phrase('Tú', 'estudiante.', 'ser', 'tu', IDENTITY),
  phrase('Tú', 'de Bilbao.', 'ser', 'tu', ORIGIN),
  phrase('Inés', 'española.', 'ser', 'el', NATION),
  phrase('Mi padre', 'francés.', 'ser', 'el', NATION),
  phrase('Javier', 'el primo de Alicia.', 'ser', 'el', IDENTITY),
];

const SER_PLURAL: readonly Phrase[] = [
  phrase('Clara y yo', 'estudiantes.', 'ser', 'nosotros', IDENTITY),
  phrase('Antonio y yo', 'de Cádiz.', 'ser', 'nosotros', ORIGIN),
  phrase('En España, tú y Gonzalo', 'de Málaga.', 'ser', 'vosotros', ORIGIN),
  phrase('Inés y Javier', 'españoles.', 'ser', 'ellos', NATION),
  phrase('Mis padres', 'de Málaga.', 'ser', 'ellos', ORIGIN),
];

const HOUR = 'L’heure se dit avec « ser »';
const OWNER = '« ser de » dit à qui appartient quelque chose.';

const SER_HARD: readonly Phrase[] = [
  phrase('', 'las doce en punto.', 'ser', 'ellos', `${HOUR} : « las doce » est un pluriel.`),
  phrase('', 'la una y media.', 'ser', 'el', `${HOUR} : « la una » est un singulier.`),
  phrase('', 'las tres.', 'ser', 'ellos', `${HOUR} : « las tres » est un pluriel.`),
  phrase('Hoy', 'martes.', 'ser', 'el', '« ser » nomme le jour : « Hoy es martes ».'),
  phrase('Este libro', 'de Inés.', 'ser', 'el', OWNER),
  phrase('Estos libros', 'de Javier.', 'ser', 'ellos', OWNER),
  phrase('Usted', 'profesor, ¿no?', 'ser', 'el', '« usted » se conjugue à la 3e personne du singulier.'),
  phrase('Ustedes', 'de México, ¿no?', 'ser', 'ellos', '« ustedes » se conjugue à la 3e personne du pluriel.'),
  phrase('¿De dónde', 'tú?', 'ser', 'tu', ORIGIN),
  phrase('Mi hermana y yo no', 'de aquí.', 'ser', 'nosotros', ORIGIN),
  phrase('¿Vosotros', 'los primos de Javier?', 'ser', 'vosotros', IDENTITY),
];

const PLACE = '« estar » dit où se trouve quelqu’un ou quelque chose.';
const STATE = '« estar » dit un état : une situation à un moment donné.';
const ONGOING = '« estar » + gérondif montre une action en cours.';

const ESTAR_BASE: readonly Phrase[] = [
  phrase('Yo', 'en casa.', 'estar', 'yo', PLACE),
  phrase('Yo', 'en clase.', 'estar', 'yo', PLACE),
  phrase('Tú', 'en el instituto.', 'estar', 'tu', PLACE),
  phrase('María', 'en el cine.', 'estar', 'el', PLACE),
  phrase('Mi padre', 'en Madrid.', 'estar', 'el', PLACE),
  phrase('Antonio', 'contento.', 'estar', 'el', STATE),
];

const ESTAR_PLURAL: readonly Phrase[] = [
  phrase('Clara y yo', 'en el instituto.', 'estar', 'nosotros', PLACE),
  phrase('En España, tú y Alicia', 'en la plaza.', 'estar', 'vosotros', PLACE),
  phrase('Inés y Javier', 'en el jardín.', 'estar', 'ellos', PLACE),
  phrase('Mis padres', 'en casa.', 'estar', 'ellos', PLACE),
  phrase('Gonzalo y yo', 'contentos.', 'estar', 'nosotros', STATE),
];

const ESTAR_HARD: readonly Phrase[] = [
  phrase('Mi padre', 'durmiendo.', 'estar', 'el', ONGOING),
  phrase('Yo', 'estudiando.', 'estar', 'yo', ONGOING),
  phrase('Clara y yo', 'cantando.', 'estar', 'nosotros', ONGOING),
  phrase('En España, tú y Gonzalo', 'comiendo.', 'estar', 'vosotros', ONGOING),
  phrase('Gonzalo, ¿tú', 'contento?', 'estar', 'tu', STATE),
  phrase('Hola, Inés, ¿cómo', '?', 'estar', 'tu', 'On demande des nouvelles avec « estar » : « ¿Cómo estás? ».'),
  phrase('Hoy', 'a lunes, 22 de octubre.', 'estar', 'nosotros', 'Pour la date, on dit « estamos a ».'),
  phrase('Ahora', 'en primavera.', 'estar', 'nosotros', 'Pour la saison, on dit « estamos en ».'),
  phrase('Usted', 'en la fila de arriba.', 'estar', 'el', '« usted » se conjugue à la 3e personne.'),
  phrase('Los alumnos', 'escuchando música.', 'estar', 'ellos', ONGOING),
];

/** Choisir : le contexte ne laisse qu'un des deux verbes. */
const CHOICE_BASE: readonly Phrase[] = [
  phrase('Inés', 'de Sevilla.', 'ser', 'el', ORIGIN),
  phrase('Inés', 'en el cine.', 'estar', 'el', PLACE),
  phrase('Mi madre', 'profesora.', 'ser', 'el', IDENTITY),
  phrase('El libro', 'en la mesa.', 'estar', 'el', PLACE),
  phrase('Javier', 'el hermano de Clara.', 'ser', 'el', IDENTITY),
  phrase('Antonio', 'muy satisfecho.', 'estar', 'el', STATE),
  phrase('Mi amigo', 'francés.', 'ser', 'el', NATION),
  phrase('El jarrón', 'roto.', 'estar', 'el', 'Le vase a changé : il a été cassé. C’est un état, donc « estar ».'),
];

const CHOICE_PLURAL: readonly Phrase[] = [
  phrase('Mis primos', 'de México.', 'ser', 'ellos', ORIGIN),
  phrase('Mis primos', 'en México.', 'estar', 'ellos', PLACE),
  phrase('Clara y yo', 'españolas.', 'ser', 'nosotros', NATION),
  phrase('Clara y yo', 'en España.', 'estar', 'nosotros', PLACE),
  phrase('Los abuelos', 'contentos.', 'estar', 'ellos', STATE),
  phrase('Los abuelos', 'de Cádiz.', 'ser', 'ellos', ORIGIN),
];

const CHOICE_HARD: readonly Phrase[] = [
  phrase('', 'las doce en punto.', 'ser', 'ellos', `${HOUR}.`),
  phrase('Hoy', 'a lunes, 22 de octubre.', 'estar', 'nosotros', 'Avec « a » devant le jour, on dit « estamos a ».'),
  phrase('Hoy', 'martes.', 'ser', 'el', 'Sans « a », « ser » nomme le jour : « Hoy es martes ».'),
  phrase(
    'El concierto',
    'en mi instituto, a las nueve.',
    'ser',
    'el',
    'Un concert a lieu : pour un événement, « ser ».',
  ),
  phrase('Mi instituto', 'cerca del puerto.', 'estar', 'el', PLACE),
  phrase('Este libro', 'de Inés.', 'ser', 'el', OWNER),
  phrase('Mi hermano', 'durmiendo.', 'estar', 'el', ONGOING),
  phrase('Alicia, ¿ya', 'lista para salir?', 'estar', 'tu', '« estar listo » veut dire « être prêt ».'),
  phrase('Los diccionarios', 'en la clase.', 'estar', 'ellos', PLACE),
  phrase('Gonzalo y yo', 'primos.', 'ser', 'nosotros', IDENTITY),
];

// ——— Erreurs typiques ———

const ACCENT_WHY: Readonly<Record<string, string>> = {
  estas: 'Sans accent écrit, « estas » veut dire « ces » : le verbe s’écrit « estás ».',
  esta: 'Sans accent écrit, « esta » veut dire « cette » : le verbe s’écrit « está ».',
  estais: 'Il manque l’accent écrit : on écrit « estáis ».',
  estan: 'Il manque l’accent écrit : on écrit « están ».',
};

/** Erreurs de saisie : autre verbe, autre personne, accent oublié, infinitif. */
function typedTraps(s: Phrase) {
  const good = right(s);
  const bare = noAccent(good);
  const confused = form(other(s.verb), s.person);
  const list = [
    ...(bare === good ? [] : [{ text: bare, why: ACCENT_WHY[bare] ?? `On écrit « ${good} ».` }]),
    { text: confused, why: `« ${confused} » vient de « ${other(s.verb)} ». ${s.why}` },
    ...PERSONS.filter((q) => q !== s.person).map((q) => ({
      text: form(s.verb, q),
      why: `« ${form(s.verb, q)} » va avec « ${PRONOUN[q]} », pas avec le sujet de cette phrase.`,
    })),
    { text: s.verb, why: 'C’est l’infinitif : il faut conjuguer le verbe.' },
  ];
  return list.filter((t, i) => t.text !== good && list.findIndex((u) => u.text === t.text) === i);
}

const answerStep = (value: string) => `Réponse : **${value}**`;

/** Niveau 1 d'une notion de conjugaison : la forme parmi trois. */
function recognise(v: Copula, rng: Rng): QuestionDraft {
  const s = rng.pick(v === 'ser' ? SER_BASE : ESTAR_BASE);
  const good = right(s);
  const wrong = rng.shuffle(['nosotros', 'vosotros', 'ellos'] as const).slice(0, 2);
  const { answer, traps } = options(
    rng,
    good,
    wrong.map((q) => [form(v, q), `« ${form(v, q)} » va avec « ${PRONOUN[q]} ».`]),
  );
  return {
    prompt: `Complète avec « ${v} » : « ${sentence(s)} »`,
    answer,
    traps,
    hint: 'Trouve d’abord le pronom qui peut remplacer le sujet.',
    steps: [`Le sujet correspond à « ${subjectOf(s.person)} ».`, s.why, answerStep(good)],
  };
}

/** Niveau 2 : association pronom ↔ forme, ou phrase à quatre propositions. */
function distinguish(v: Copula, rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const chosen = new Set<Person>(rng.shuffle(PERSONS).slice(0, 3));
    const persons = PERSONS.filter((p) => chosen.has(p));
    const shuffled = rng.shuffle(persons);
    return {
      prompt: `Associe chaque pronom à sa forme de « ${v} » : ${shuffled.map((p) => PRONOUN[p]).join(', ')}.`,
      answer: matching(
        rng,
        shuffled.map((p) => [PRONOUN[p], form(v, p)]),
      ),
      hint: 'Commence par la forme dont tu es le plus sûr.',
      steps: [
        `« ${v} » est irrégulier : ses formes s’apprennent par cœur.`,
        answerStep(shuffled.map((p) => `${PRONOUN[p]} ${form(v, p)}`).join(' ; ')),
      ],
    };
  }
  const s = rng.pick(v === 'ser' ? SER_PLURAL : ESTAR_PLURAL);
  const good = right(s);
  const wrong = rng.shuffle(PERSONS.filter((q) => q !== s.person)).slice(0, 3);
  const { answer, traps } = options(
    rng,
    good,
    wrong.map((q) => [form(v, q), `« ${form(v, q)} » va avec « ${PRONOUN[q]} ».`]),
  );
  return {
    prompt: `Choisis la bonne forme de « ${v} » : « ${sentence(s)} »`,
    answer,
    traps,
    hint: 'Le sujet contient-il « moi » ou « toi » ? Remplace-le par un pronom.',
    steps: [`Le sujet correspond à « ${subjectOf(s.person)} ».`, s.why, answerStep(good)],
  };
}

/** Niveau 3 : écrire la forme dans une phrase simple, verbe donné. */
function write(v: Copula, rng: Rng): QuestionDraft {
  const s = rng.pick(v === 'ser' ? [...SER_BASE, ...SER_PLURAL] : [...ESTAR_BASE, ...ESTAR_PLURAL]);
  const good = right(s);
  return {
    prompt: `Écris le verbe « ${v} » au présent : « ${sentence(s)} »`,
    answer: {
      kind: 'cloze',
      parts: [`${s.before} `, ` ${s.after}`],
      blanks: [{ mode: 'text', accepted: [good] }],
    },
    hint: 'Remplace le sujet par un pronom, puis récite le présent jusqu’à lui. Pense aux accents écrits.',
    steps: [`Le sujet correspond à « ${subjectOf(s.person)} ».`, `${v} au présent : ${table(v)}.`, answerStep(good)],
  };
}

/** Niveau 4 : saisie sans propositions, cas moins fréquents. */
function master(prompt: string, s: Phrase): QuestionDraft {
  return {
    prompt: `${prompt} « ${sentence(s)} »`,
    answer: { kind: 'text', accepted: dotted(right(s)) },
    traps: typedTraps(s),
    hint: 'Demande-toi ce que dit la phrase (qui, quoi, quand, où, en train de quoi), puis cherche le sujet.',
    steps: [s.why, `La forme à employer correspond à « ${subjectOf(s.person)} ».`, answerStep(shown(s))],
  };
}

// ——— Documents (niveau 5) ———

interface Scene<T> {
  readonly title: string;
  readonly lines: readonly string[];
  readonly items: readonly (T & { readonly line: number })[];
}

/** Texte à trous sur un document : trois phrases reformulées. */
function document<T extends { readonly before: string; readonly after: string }>(
  rng: Rng,
  scene: Scene<T>,
  {
    instruction,
    value,
    why,
    hint,
  }: {
    readonly instruction: string;
    readonly value: (item: T) => string;
    readonly why: (item: T) => string;
    readonly hint: string;
  },
): QuestionDraft {
  const picked = new Set(rng.shuffle(scene.items).slice(0, 3));
  const items = scene.items.filter((i) => picked.has(i));
  return {
    prompt: `${instruction} ${items.map((i) => `« ${sentence(i)} »`).join(' ')}`,
    figure: { kind: 'document', title: scene.title, lines: [...scene.lines], credit: 'Texte écrit pour l’exercice.' },
    answer: {
      kind: 'cloze',
      parts: [
        ...items.map((i, k) => `${k === 0 ? '' : ` ${items[k - 1]?.after ?? ''} `}${i.before} `),
        ` ${items.at(-1)?.after ?? ''}`,
      ],
      blanks: items.map((i) => ({ mode: 'text' as const, accepted: [value(i)] })),
    },
    hint,
    steps: [...items.map((i) => `Ligne ${i.line} : ${why(i)}`), answerStep(items.map((i) => value(i)).join(' ; '))],
  };
}

const at = (line: number, s: Phrase) => ({ ...s, line });

const SER_SCENES: readonly Scene<Phrase>[] = [
  {
    title: 'Clara se présente',
    lines: [
      'Clara : Hola, soy Clara. Soy de Cádiz.',
      'Clara : Soy la hermana de Fede.',
      'Clara : Fede y yo somos españoles.',
    ],
    items: [
      at(1, phrase('Clara', 'de Cádiz.', 'ser', 'el', ORIGIN)),
      at(2, phrase('Clara', 'la hermana de Fede.', 'ser', 'el', IDENTITY)),
      at(3, phrase('Clara y Fede', 'españoles.', 'ser', 'ellos', NATION)),
      at(1, phrase('Clara, tú', 'de Cádiz, ¿no?', 'ser', 'tu', ORIGIN)),
    ],
  },
  {
    title: 'Javier se présente',
    lines: [
      'Javier : Encantado, soy Javier. Soy el primo de Alicia.',
      'Javier : Alicia y yo somos de Gijón.',
      'Javier : Alicia es muy simpática.',
    ],
    items: [
      at(1, phrase('Javier', 'el primo de Alicia.', 'ser', 'el', IDENTITY)),
      at(1, phrase('Javier, tú', 'el primo de Alicia, ¿no?', 'ser', 'tu', IDENTITY)),
      at(2, phrase('Javier y Alicia', 'de Gijón.', 'ser', 'ellos', ORIGIN)),
      at(2, phrase('Alicia, tú y Javier', 'de Gijón, ¿no?', 'ser', 'vosotros', ORIGIN)),
    ],
  },
];

const ESTAR_SCENES: readonly Scene<Phrase>[] = [
  {
    title: 'La foto de Inés',
    lines: [
      'Inés : Mira esta foto. Estoy en la fila de arriba.',
      'Inés : Mi hermano y yo estamos muy contentos.',
      'Inés : Ahora estoy preparando la tarta.',
    ],
    items: [
      at(1, phrase('Inés', 'en la fila de arriba.', 'estar', 'el', PLACE)),
      at(2, phrase('Inés y su hermano', 'muy contentos.', 'estar', 'ellos', STATE)),
      at(2, phrase('Inés, tú y tu hermano', 'muy contentos, ¿no?', 'estar', 'vosotros', STATE)),
      at(3, phrase('Inés, tú', 'preparando la tarta, ¿no?', 'estar', 'tu', ONGOING)),
    ],
  },
  {
    title: 'El mensaje de Gonzalo',
    lines: [
      'Gonzalo : ¡Hola! Estoy en casa de mis abuelos.',
      'Gonzalo : Mi primo y yo estamos en el jardín.',
      'Gonzalo : Ahora estoy escuchando música.',
    ],
    items: [
      at(1, phrase('Gonzalo, ¿tú', 'en casa de tus abuelos?', 'estar', 'tu', PLACE)),
      at(2, phrase('Gonzalo y su primo', 'en el jardín.', 'estar', 'ellos', PLACE)),
      at(2, phrase('Gonzalo, tú y tu primo', 'en el jardín, ¿no?', 'estar', 'vosotros', PLACE)),
      at(3, phrase('Gonzalo', 'escuchando música.', 'estar', 'el', ONGOING)),
    ],
  },
];

const CHOICE_SCENES: readonly Scene<Phrase>[] = [
  {
    title: 'Alicia escribe desde Gijón',
    lines: [
      'Alicia : Soy Alicia, de Madrid.',
      'Alicia : Ahora me encuentro en Gijón con mi primo Javier.',
      'Alicia : Mi primo Javier sonríe: ¡qué alegría!',
    ],
    items: [
      at(1, phrase('Alicia', 'de Madrid.', 'ser', 'el', ORIGIN)),
      at(2, phrase('Alicia', 'en Gijón.', 'estar', 'el', PLACE)),
      at(2, phrase('Javier', 'el primo de Alicia.', 'ser', 'el', IDENTITY)),
      at(3, phrase('Javier', 'contento.', 'estar', 'el', STATE)),
      at(2, phrase('Alicia y Javier', 'en Gijón.', 'estar', 'ellos', PLACE)),
    ],
  },
  {
    title: 'La fiesta de Antonio',
    lines: [
      'Antonio : La fiesta tiene lugar en mi casa.',
      'Antonio : Mi casa se encuentra cerca del puerto.',
      'Antonio : Mi madre trabaja de profesora y ahora prepara la tarta.',
    ],
    items: [
      at(1, phrase('La fiesta', 'en casa de Antonio.', 'ser', 'el', 'Une fête a lieu : pour un événement, « ser ».')),
      at(2, phrase('La casa de Antonio', 'cerca del puerto.', 'estar', 'el', PLACE)),
      at(3, phrase('La madre de Antonio', 'profesora.', 'ser', 'el', IDENTITY)),
      at(3, phrase('La madre de Antonio', 'preparando la tarta.', 'estar', 'el', ONGOING)),
    ],
  },
];

// ——— Notions ser et estar ———

function conjugationQuestion(v: Copula, rng: Rng, level: Level): QuestionDraft {
  if (level === 1) return recognise(v, rng);
  if (level === 2) return distinguish(v, rng);
  if (level === 3) return write(v, rng);
  if (level === 4)
    return master(`Écris la forme de « ${v} » qui manque :`, rng.pick(v === 'ser' ? SER_HARD : ESTAR_HARD));
  return document(rng, rng.pick(v === 'ser' ? SER_SCENES : ESTAR_SCENES), {
    instruction: `Lis le document, puis complète avec « ${v} » au présent :`,
    value: right,
    why: (i) => `avec « ${i.before.replace('¿', '')} », on emploie « ${right(i)} ». ${i.why}`,
    hint: 'Dans chaque phrase, repère le sujet : il a pu changer par rapport au document.',
  });
}

// ——— Choisir ser ou estar ———

const USES: readonly (readonly [string, Copula, string])[] = [
  ['dire d’où vient quelqu’un', 'ser', 'Soy de Sevilla.'],
  ['dire où l’on se trouve', 'estar', 'Estoy en el cine.'],
  ['dire un métier', 'ser', 'Mi padre es cocinero.'],
  ['dire que l’on est content', 'estar', 'Estoy contento.'],
  ['dire l’heure', 'ser', 'Son las tres.'],
  ['dire une action en cours', 'estar', 'Estoy cantando.'],
];

const USE_RULE =
  '« ser » : qui l’on est, origine, métier, heure. « estar » : lieu, état, action en cours (avec le gérondif).';

function choiceQuestion(rng: Rng, level: Level): QuestionDraft {
  if (level === 1) {
    const s = rng.pick(CHOICE_BASE.filter((c) => c.person === 'el'));
    const good = right(s);
    const confused = form(other(s.verb), 'el');
    const { answer, traps } = options(rng, good, [
      [confused, `« ${confused} » vient de « ${other(s.verb)} ». ${s.why}`],
      ['tiene', '« tiene » vient de « tener » (avoir) : il ne dit ni qui l’on est ni où l’on est.'],
    ]);
    return {
      prompt: `Quel mot complète la phrase ? « ${sentence(s)} »`,
      answer,
      traps,
      hint: 'La phrase dit-elle qui est la personne ou la chose, ou bien où et dans quel état elle se trouve ?',
      steps: [s.why, answerStep(good)],
    };
  }
  if (level === 2) {
    if (rng.int(0, 1) === 0) {
      // Trois usages dont au moins un par verbe ; la colonne de droite est faite de phrases distinctes.
      const [ser1, ser2] = rng.shuffle(USES.filter((u) => u[1] === 'ser'));
      const [estar1, estar2] = rng.shuffle(USES.filter((u) => u[1] === 'estar'));
      const third = rng.int(0, 1) === 0 ? ser2 : estar2;
      const chosen = rng.shuffle([ser1, estar1, third].filter((u) => u !== undefined));
      return {
        prompt: `Associe chaque intention à sa phrase : ${chosen.map((u) => u[0]).join(' ; ')}.`,
        answer: matching(
          rng,
          chosen.map((u) => [u[0], u[2]]),
        ),
        hint: 'Cherche dans chaque phrase le mot qui indique un lieu, une personne, une heure ou une action.',
        steps: [USE_RULE, answerStep(chosen.map((u) => `${u[0]} : ${u[2]}`).join(' ; '))],
      };
    }
    const s = rng.pick(CHOICE_PLURAL);
    const good = right(s);
    const v = other(s.verb);
    const twin: Person = s.person === 'ellos' ? 'el' : 'vosotros';
    const { answer, traps } = options(rng, good, [
      [form(v, s.person), `« ${form(v, s.person)} » vient de « ${v} ». ${s.why}`],
      [form(s.verb, twin), `Bon verbe, mais « ${form(s.verb, twin)} » va avec « ${PRONOUN[twin]} ».`],
      [form(v, twin), `« ${form(v, twin)} » n’a ni le bon verbe ni la bonne personne.`],
    ]);
    return {
      prompt: `Choisis entre « ser » et « estar », à la bonne personne : « ${sentence(s)} »`,
      answer,
      traps,
      hint: 'Décide d’abord du verbe, puis de la personne.',
      steps: [s.why, `Le sujet correspond à « ${subjectOf(s.person)} ».`, answerStep(good)],
    };
  }
  if (level === 3) {
    const s = rng.pick([...CHOICE_BASE, ...CHOICE_PLURAL]);
    const good = right(s);
    return {
      prompt: `« ser » ou « estar » ? Écris la forme au présent : « ${sentence(s)} »`,
      answer: { kind: 'cloze', parts: [`${s.before} `, ` ${s.after}`], blanks: [{ mode: 'text', accepted: [good] }] },
      hint: 'Dit-on qui est le sujet et d’où il vient, ou bien où il est et dans quel état ?',
      steps: [s.why, `Le sujet correspond à « ${subjectOf(s.person)} ».`, answerStep(good)],
    };
  }
  if (level === 4) return master('« ser » ou « estar » ? Écris la forme qui manque :', rng.pick(CHOICE_HARD));
  return document(rng, rng.pick(CHOICE_SCENES), {
    instruction: 'Lis le document, puis complète avec « ser » ou « estar » au présent :',
    value: right,
    why: (i) => `${i.why} On écrit « ${right(i)} ».`,
    hint: 'Pour chaque phrase, demande-toi : identité, origine, événement ou bien lieu, état, action en cours ?',
  });
}

// ——— Hay ———

type HayForm = 'hay' | 'está' | 'están';
interface Presence {
  readonly before: string;
  readonly after: string;
  readonly good: HayForm;
  readonly why: string;
}
const presence = (before: string, after: string, good: HayForm, why: string): Presence => ({
  before,
  after,
  good,
  why,
});

const A_NOUN = 'On annonce quelque chose avec un article indéfini : « hay » (il y a).';
const NUMBER = 'Après « hay » vient un nombre ; le verbe ne change pas au pluriel.';
const QUANTITY = 'Avec un mot de quantité, ou sans article, on emploie « hay » (il y a).';
const ONE = 'On situe quelque chose de précis (article défini ou possessif), au singulier : « está ».';
const MANY = 'On situe des choses ou des personnes précises (article défini ou possessif), au pluriel : « están ».';
const MUST = '« hay que » + infinitif veut dire « il faut ».';

const HAY_SINGLE: readonly Presence[] = [
  presence('En la clase', 'una pizarra.', 'hay', A_NOUN),
  presence('En mi barrio', 'un parque.', 'hay', A_NOUN),
  presence('En la mesa', 'un cuaderno.', 'hay', A_NOUN),
  presence('La pizarra', 'en la clase.', 'está', ONE),
  presence('El parque', 'en mi barrio.', 'está', ONE),
  presence('El cuaderno', 'en la mesa.', 'está', ONE),
];

const HAY_PLURAL: readonly Presence[] = [
  presence('En la clase', 'dos ventanas.', 'hay', NUMBER),
  presence('En la mesa', 'tres libros.', 'hay', NUMBER),
  presence('En mi barrio', 'unas tiendas.', 'hay', A_NOUN),
  presence('Los libros', 'en la mesa.', 'están', MANY),
  presence('Las ventanas', 'a la derecha.', 'están', MANY),
  presence('Los alumnos', 'en el patio.', 'están', MANY),
];

const HAY_HARD: readonly Presence[] = [
  presence('No', 'leche en la nevera.', 'hay', QUANTITY),
  presence('En la plaza', 'árboles.', 'hay', QUANTITY),
  presence('En la fiesta', 'mucha gente.', 'hay', QUANTITY),
  presence('', 'que salir antes de las dos.', 'hay', MUST),
  presence('Para aprender,', 'que escuchar.', 'hay', MUST),
  presence('¿Dónde', 'mis gafas?', 'están', MANY),
  presence('¿', 'un cine en tu barrio?', 'hay', A_NOUN),
  presence('¿Dónde', 'el cine?', 'está', ONE),
  presence('En mi casa', 'mis primos.', 'están', MANY),
  presence('En la pared,', 'dos mapas.', 'hay', NUMBER),
];

const HAY_FORMS = ['hay', 'está', 'están', 'es', 'son', 'han'] as const;

function hayWhy(text: string, s: Presence): string {
  if (text === 'han') return `« han » ne sert ni à dire « il y a » ni à situer, même devant un pluriel. ${s.why}`;
  if (text === 'es' || text === 'son')
    return `« ${text} » vient de « ser » : il ne sert pas à dire où se trouve ou ce qu’il y a. ${s.why}`;
  if (text === 'hay') return `« hay » n’accepte pas un nom précis (el, la, los, las, mis…). ${s.why}`;
  if (s.good === 'hay') return `« ${text} » situe quelque chose de précis. ${s.why}`;
  return `« ${text} » n’a pas le bon nombre. ${s.why}`;
}

const hayShown = (s: Presence) => (s.before === '' || s.before === '¿' ? capital(s.good) : s.good);

interface HayScene {
  readonly title: string;
  readonly lines: readonly string[];
  readonly items: readonly (Presence & { readonly line: number })[];
}

const HAY_SCENES: readonly HayScene[] = [
  {
    title: 'Mi habitación',
    lines: [
      'Inés : Mi habitación tiene una cama y una mesa.',
      'Inés : El ordenador se encuentra en la mesa.',
      'Inés : Tengo dos pósteres, a la derecha de la ventana.',
    ],
    items: [
      { ...presence('En la habitación de Inés', 'una cama.', 'hay', A_NOUN), line: 1 },
      { ...presence('El ordenador', 'en la mesa.', 'está', ONE), line: 2 },
      { ...presence('En la habitación', 'dos pósteres.', 'hay', NUMBER), line: 3 },
      { ...presence('Los pósteres', 'a la derecha de la ventana.', 'están', MANY), line: 3 },
    ],
  },
  {
    title: 'El barrio de Javier',
    lines: [
      'Javier : Mi barrio tiene un parque y muchas tiendas.',
      'Javier : El instituto se encuentra cerca del parque.',
      'Javier : Ahora mis abuelos pasean por la plaza.',
    ],
    items: [
      { ...presence('En el barrio de Javier', 'un parque.', 'hay', A_NOUN), line: 1 },
      { ...presence('En el barrio', 'muchas tiendas.', 'hay', QUANTITY), line: 1 },
      { ...presence('El instituto', 'cerca del parque.', 'está', ONE), line: 2 },
      { ...presence('Los abuelos de Javier', 'en la plaza.', 'están', MANY), line: 3 },
    ],
  },
];

function hayQuestion(rng: Rng, level: Level): QuestionDraft {
  if (level === 1 || level === 2) {
    const s = rng.pick(level === 1 ? HAY_SINGLE : HAY_PLURAL);
    const pool =
      level === 1
        ? s.good === 'hay'
          ? (['es', 'son'] as const)
          : (['hay', 'son'] as const)
        : rng.shuffle(HAY_FORMS.filter((f) => f !== s.good)).slice(0, 3);
    const { answer, traps } = options(
      rng,
      s.good,
      pool.map((f) => [f, hayWhy(f, s)]),
    );
    return {
      prompt: `${level === 1 ? 'Quel mot complète la phrase ?' : 'Choisis le mot juste, au singulier ou au pluriel :'} « ${sentence(s)} »`,
      answer,
      traps,
      hint: 'Regarde le petit mot devant le nom : annonce-t-on quelque chose de nouveau ou situe-t-on quelque chose de précis ?',
      steps: [s.why, answerStep(s.good)],
    };
  }
  if (level === 3) {
    const s = rng.pick([...HAY_SINGLE, ...HAY_PLURAL]);
    return {
      prompt: `Complète avec « hay », « está » ou « están » (pense aux accents) : « ${sentence(s)} »`,
      answer: { kind: 'cloze', parts: [`${s.before} `, ` ${s.after}`], blanks: [{ mode: 'text', accepted: [s.good] }] },
      hint: 'Un article défini ou un indéfini ? Une seule chose ou plusieurs ?',
      steps: [s.why, answerStep(s.good)],
    };
  }
  if (level === 4) {
    const s = rng.pick(HAY_HARD);
    const bare = noAccent(s.good);
    return {
      prompt: `Écris sans propositions « hay », « está » ou « están » (pense aux accents) : « ${sentence(s)} »`,
      answer: { kind: 'text', accepted: dotted(s.good) },
      traps: [
        ...(bare === s.good ? [] : [{ text: bare, why: ACCENT_WHY[bare] ?? `On écrit « ${s.good} ».` }]),
        ...HAY_FORMS.filter((f) => f !== s.good).map((f) => ({ text: f, why: hayWhy(f, s) })),
      ],
      hint: 'La phrase annonce-t-elle une présence, une obligation, ou situe-t-elle quelque chose de précis ?',
      steps: [s.why, answerStep(hayShown(s))],
    };
  }
  return document(rng, rng.pick(HAY_SCENES), {
    instruction: 'Lis le document, puis complète avec « hay », « está » ou « están » :',
    value: (i) => i.good,
    why: (i) => `${i.why} On écrit « ${i.good} ».`,
    hint: 'Dans chaque phrase à compléter, regarde le mot placé devant le nom.',
  });
}

// ——— Notions ———

const PROGRAMME = 'Programme d’espagnol du collège (arrêté du 5 mai 2025, annexe 9), classe de 5e';
interface Spec {
  readonly id: string;
  readonly title: string;
  readonly version: number;
  readonly memo: readonly string[];
  /** Partie du programme travaillée. */
  readonly detail: string;
  readonly sources: readonly string[];
  readonly generate: (rng: Rng, level: Level) => QuestionDraft;
}

const skill = ({ id, title, version, memo, detail, sources, generate }: Spec): Skill => ({
  id,
  title,
  levels: 5,
  version,
  lesson: {
    memo,
    source: `${PROGRAMME} — ${detail}`,
    sources: ['espagnol-college-2025', 'lv-college-2025', ...sources, 'cervantes-pcic-gramatica-a1-a2'],
  },
  generate,
});

const ser = skill({
  id: 'e5-ser',
  title: 'Ser : dire qui l’on est',
  version: 1,
  memo: [
    '« ser » (être) relie le sujet à un **attribut** : qui il est, son origine, son métier. « Soy Inés. Soy de Sevilla. »',
    'Présent : soy, eres, es, somos, sois, son. Il sert aussi pour l’heure : « Es la una. Son las tres. »',
    'Et pour le jour (« Hoy es martes. ») ou le propriétaire (« Es de Inés. »). Avec « usted », on dit « es ».',
  ],
  detail: 'Présent des verbes irréguliers : ser.',
  sources: ['rae-dle-ser', 'rae-dpd-ser', 'rae-dpd-estar'],
  generate: (rng, level) => conjugationQuestion('ser', rng, level),
});

const estar = skill({
  id: 'e5-estar',
  title: 'Estar : situer et dire un état',
  version: 1,
  memo: [
    '« estar » (être, se trouver) dit un lieu ou un **état** : « Estoy en casa. Estoy contento. » Avec le **gérondif**, il montre une action en cours : « Estoy cantando. »',
    'Présent : estoy, estás, está, estamos, estáis, están. Garde les accents. Pour la date : « Hoy estamos a lunes. »',
    'Pour la saison : « Estamos en primavera. » Pour prendre des nouvelles : « ¿Cómo estás? »',
  ],
  detail: 'Présent des verbes irréguliers : estar ; estar + gérondif.',
  sources: ['rae-dle-estar', 'rae-dpd-estar'],
  generate: (rng, level) => conjugationQuestion('estar', rng, level),
});

// Identifiant historique conservé (progression des élèves) : version 2, à cinq niveaux.
const serOrEstar = skill({
  id: 'e5-ser-estar',
  title: 'Choisir entre ser et estar',
  version: 2,
  memo: [
    'Le français « être » a deux traductions. « ser » : qui l’on est, origine, métier, heure, événement qui a lieu. « estar » : lieu, **état**, action en cours.',
    'Compare : « Inés es de Sevilla » (origine) et « Inés está en Sevilla » (lieu). « Es listo » : il est intelligent ; « Está listo » : il est prêt.',
  ],
  detail: 'Présent des verbes irréguliers : ser et estar.',
  sources: ['rae-dle-ser', 'rae-dpd-ser', 'rae-dle-estar', 'rae-dpd-estar'],
  generate: choiceQuestion,
});

const hay = skill({
  id: 'e5-hay',
  title: 'Hay : dire ce qu’il y a',
  version: 1,
  memo: [
    '« hay » veut dire « il y a » : c’est un **verbe impersonnel**, invariable ici. On l’emploie devant un **article indéfini** (un, unas…), un nombre, une quantité ou un nom seul : « Hay un libro. Hay dos libros. No hay leche. »',
    'Avec un **article défini** (el, la, los, las) ou un **possessif** (mi, tu…), on situe avec « está / están » : « El libro está en la mesa. » « hay que » + infinitif : il faut.',
  ],
  detail: 'Obligation impersonnelle (hay que) ; situer et dénombrer des personnes et des objets.',
  sources: ['rae-dle-haber', 'rae-dpd-haber', 'rae-dle-estar', 'rae-dpd-estar'],
  generate: hayQuestion,
});

export const SER_ESTAR_HAY_SKILLS: readonly Skill[] = [ser, estar, serOrEstar, hay];

export const SER_ESTAR_HAY_CHAPTER: Chapter = {
  id: 'e5-ser-estar-hay',
  subject: 'espagnol',
  grade: '5e',
  domain: 'langue',
  title: 'Ser, estar, hay',
  skills: SER_ESTAR_HAY_SKILLS,
};
