import type { Chapter, Level, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { CONJUGAISONS } from './conjugaisons.generated.ts';
import { ENDINGS, PERSONS, PRONOUN, VERBES, type Group, type Person, type Verb } from './present-reguliers-faits.ts';

/**
 * Espagnol 5e — « Le présent des réguliers » (lot es-5e-02, docs/adr/0034). Programme : annexe 9 de l'arrêté du
 * 5 mai 2025 (présent des verbes très usuels et réguliers en -ar, -er, -ir ; pronoms personnels sujets). Formes et
 * règles : Real Academia Española (voir present-reguliers-faits.ts : chaque fait y porte sa source et sa citation).
 */

const PROGRAMME = 'Programme d’espagnol du collège (arrêté du 5 mai 2025, annexe 9), classe de 5e';
const lesson = (memo: readonly string[], detail: string, sources: readonly string[]) => ({
  memo,
  source: `${PROGRAMME} — ${detail}`,
  sources: ['espagnol-college-2025', 'lv-college-2025', ...sources],
});

/** Retire les accents écrits (le ñ est gardé : c'est une autre lettre). */
const noAccent = (s: string) => s.normalize('NFD').replace(/́/g, '').normalize('NFC');
/** Saisie avec ou sans point final. */
const dotted = (...forms: readonly string[]) => [...new Set(forms.flatMap((f) => [f, `${f}.`]))];

const options = (rng: Rng, right: string, wrong: readonly (readonly [string, string])[]) =>
  choice(
    rng,
    right,
    wrong.map(([label, why]) => ({ label, why })),
  );

/** Association : colonne de droite mélangée, jamais dans l'ordre de départ. */
function matching(rng: Rng, pairs: readonly (readonly [string, string])[]) {
  const left = pairs.map(([l]) => l);
  const values = pairs.map(([, r]) => r);
  let right = rng.shuffle(values);
  while (right.every((x, i) => x === values[i])) right = rng.shuffle(values);
  return { kind: 'match' as const, left, right, pairs: values.map((v) => right.indexOf(v)) };
}

// ——— Pronoms sujets ———

const MEANINGS = [
  { es: 'yo', fr: 'je' },
  { es: 'tú', fr: 'tu' },
  { es: 'él', fr: 'il' },
  { es: 'ella', fr: 'elle' },
  { es: 'nosotros', fr: 'nous (des garçons ou un groupe mixte)' },
  { es: 'nosotras', fr: 'nous (uniquement des filles)' },
  { es: 'vosotros', fr: 'vous, en tutoyant plusieurs garçons ou un groupe mixte' },
  { es: 'vosotras', fr: 'vous, en tutoyant plusieurs filles' },
  { es: 'ellos', fr: 'ils' },
  { es: 'ellas', fr: 'elles' },
  { es: 'usted', fr: 'vous, en vouvoyant une seule personne' },
  { es: 'ustedes', fr: 'vous, en vouvoyant plusieurs personnes' },
] as const;

/** Groupes à remplacer par un pronom : réponses admises et explication. */
const REPLACE: readonly { readonly group: string; readonly accepted: readonly string[]; readonly why: string }[] = [
  { group: 'Antonio', accepted: ['él'], why: 'On parle d’un garçon (une seule personne).' },
  { group: 'Inés', accepted: ['ella'], why: 'On parle d’une fille (une seule personne).' },
  { group: 'Javier y Antonio', accepted: ['ellos'], why: 'On parle de deux garçons.' },
  { group: 'Alicia y Clara', accepted: ['ellas'], why: 'On parle de deux filles.' },
  { group: 'Clara y Javier', accepted: ['ellos'], why: 'Un groupe mixte prend le masculin pluriel.' },
  { group: 'Javier y yo', accepted: ['nosotros'], why: 'Le groupe contient « moi » et un garçon.' },
  {
    group: 'Clara y yo',
    accepted: ['nosotros', 'nosotras'],
    why: 'Le groupe contient « moi » : féminin seulement si « moi » est une fille.',
  },
  {
    group: 'tú y Gonzalo (en Espagne)',
    accepted: ['vosotros'],
    why: 'En Espagne : « toi » et un garçon, qu’on tutoie.',
  },
  {
    group: 'tú y Alicia (en Espagne)',
    accepted: ['vosotros', 'vosotras'],
    why: 'En Espagne : féminin seulement si « toi » est une fille.',
  },
];

/** Phrases sans sujet exprimé : la terminaison désigne le pronom. */
const DEDUCE: readonly { readonly rest: string; readonly accepted: readonly string[] }[] = [
  { rest: 'hablo español.', accepted: ['yo'] },
  { rest: 'vivo en España.', accepted: ['yo'] },
  { rest: 'estudias en casa.', accepted: ['tú'] },
  { rest: 'comes una naranja.', accepted: ['tú'] },
  { rest: 'cantamos una canción.', accepted: ['nosotros', 'nosotras'] },
  { rest: 'leemos un libro.', accepted: ['nosotros', 'nosotras'] },
  { rest: 'escucháis música.', accepted: ['vosotros', 'vosotras'] },
  { rest: 'escribís un mensaje.', accepted: ['vosotros', 'vosotras'] },
];

/** Situations de la saisie : vouvoiement et usage d'Amérique, avec les erreurs typiques de chacune. */
const ADDRESS: readonly {
  readonly prompt: string;
  readonly right: string;
  readonly wrong: readonly (readonly [string, string])[];
}[] = [
  {
    prompt: 'En Espagne, tu vouvoies un voisin âgé. Quel pronom sujet emploies-tu pour lui dire « vous » ?',
    right: 'usted',
    wrong: [
      ['tú', '« tú » tutoie : ce n’est pas la forme de politesse.'],
      ['vosotros', '« vosotros » tutoie plusieurs personnes.'],
      ['ustedes', '« ustedes » s’adresse à plusieurs personnes ; ici, il n’y en a qu’une.'],
    ],
  },
  {
    prompt:
      'En Espagne, tu t’adresses poliment à deux professeurs à la fois. Quel pronom sujet traduit ce « vous » de politesse ?',
    right: 'ustedes',
    wrong: [
      ['vosotros', 'En Espagne, « vosotros » tutoie un groupe : ce n’est pas la forme de politesse.'],
      ['usted', '« usted » vouvoie une seule personne ; ici, elles sont deux.'],
      ['ellos', '« ellos » désigne les personnes dont on parle, pas celles à qui l’on parle.'],
    ],
  },
  {
    prompt: 'Au Mexique, tu parles à plusieurs amis à la fois. Quel pronom sujet emploie-t-on pour « vous » ?',
    right: 'ustedes',
    wrong: [
      ['vosotros', '« vosotros » ne s’emploie pas en Amérique.'],
      ['usted', '« usted » s’adresse à une seule personne.'],
      ['nosotros', '« nosotros » veut dire « nous ».'],
    ],
  },
  {
    prompt: 'En Espagne, tu tutoies plusieurs camarades (un groupe mixte). Quel pronom sujet emploies-tu ?',
    right: 'vosotros',
    wrong: [
      ['ustedes', 'En Espagne, « ustedes » vouvoie un groupe ; ici, on tutoie.'],
      ['nosotros', '« nosotros » veut dire « nous ».'],
      ['tú', '« tú » tutoie une seule personne.'],
    ],
  },
];

const accentTraps = (accepted: readonly string[]) =>
  accepted
    .filter((a) => noAccent(a) !== a)
    .map((a) => ({
      text: noAccent(a),
      why:
        a === 'él'
          ? 'Sans accent écrit, « el » est l’article (le) ; le pronom s’écrit avec un accent.'
          : 'Sans accent écrit, « tu » est le possessif (ton) ; le pronom s’écrit avec un accent.',
    }));

interface Scene {
  readonly title: string;
  readonly lines: readonly string[];
  readonly items: readonly {
    readonly line: number;
    readonly before: string;
    readonly after: string;
    readonly accepted: readonly string[];
    readonly why: string;
  }[];
}

const SCENES: readonly Scene[] = [
  {
    title: 'Clara présente ses amis',
    lines: [
      'Clara : Hola, me llamo Clara. Vivo en España.',
      'Clara : Javier estudia en casa. Inés canta.',
      'Clara : Alicia y yo bailamos.',
      'Clara : Antonio y Gonzalo escuchan música.',
    ],
    items: [
      { line: 1, before: '', after: ' vivo en España.', accepted: ['yo'], why: '« vivo » : Clara parle d’elle.' },
      { line: 2, before: '', after: ' estudia en casa.', accepted: ['él'], why: 'Il s’agit de Javier, un garçon.' },
      { line: 2, before: '', after: ' canta.', accepted: ['ella'], why: 'Il s’agit d’Inés, une fille.' },
      {
        line: 3,
        before: '',
        after: ' bailamos.',
        accepted: ['nosotras'],
        why: 'Alicia et Clara : deux filles, dont celle qui parle.',
      },
      {
        line: 4,
        before: '',
        after: ' escuchan música.',
        accepted: ['ellos'],
        why: 'Antonio et Gonzalo : deux garçons.',
      },
    ],
  },
  {
    title: 'Gonzalo écrit à Inés',
    lines: [
      'Gonzalo : Inés, vives en España, ¿no?',
      'Gonzalo : Javier y yo vivimos en México.',
      'Gonzalo : Clara y Alicia estudian español.',
      'Gonzalo : Antonio trabaja en casa.',
    ],
    items: [
      { line: 1, before: '', after: ' vives en España.', accepted: ['tú'], why: 'Gonzalo s’adresse à Inés seule.' },
      {
        line: 2,
        before: '',
        after: ' vivimos en México.',
        accepted: ['nosotros'],
        why: 'Javier et Gonzalo : deux garçons, dont celui qui parle.',
      },
      {
        line: 3,
        before: '',
        after: ' estudian español.',
        accepted: ['ellas'],
        why: 'Clara et Alicia : deux filles.',
      },
      { line: 4, before: '', after: ' trabaja en casa.', accepted: ['él'], why: 'Il s’agit d’Antonio, un garçon.' },
    ],
  },
];

const PRONOUN_LEVELS: Readonly<Record<Level, (rng: Rng) => QuestionDraft>> = {
  1: (rng) => {
    const basic = MEANINGS.filter((m) => ['yo', 'tú', 'él', 'nosotros', 'ellos'].includes(m.es));
    const [m, a, b] = rng.shuffle(basic) as [(typeof basic)[number], (typeof basic)[number], (typeof basic)[number]];
    const { answer, traps } = options(
      rng,
      m.fr,
      [a, b].map((o) => [o.fr, `« ${o.fr} » correspond au pronom « ${o.es} ».`]),
    );
    return {
      prompt: `Que veut dire le pronom « ${m.es} » ?`,
      answer,
      traps,
      hint: 'Demande-toi qui est désigné : celui qui parle, celui à qui on parle, ou celui dont on parle ?',
      steps: ['Un pronom sujet indique qui fait l’action.', `« ${m.es} » veut dire **${m.fr}**.`],
    };
  },
  2: (rng) => {
    const set = rng.pick([
      ['yo', 'nosotros', 'ellos'],
      ['tú', 'él', 'ella'],
      ['nosotras', 'vosotras', 'ellas'],
      ['usted', 'ustedes', 'tú'],
      ['vosotros', 'nosotros', 'ellas'],
    ]);
    const chosen = MEANINGS.filter((m) => set.includes(m.es));
    return {
      prompt: `Associe chaque pronom à son sens : ${rng.shuffle(set).join(', ')}.`,
      answer: matching(
        rng,
        chosen.map((m) => [m.es, m.fr]),
      ),
      hint: 'Repère d’abord le nombre (un ou plusieurs), puis la personne.',
      steps: [
        'Les pronoms changent avec la personne, le nombre et souvent le genre.',
        `Réponse : **${chosen.map((m) => `${m.es} = ${m.fr}`).join(' ; ')}**`,
      ],
    };
  },
  3: (rng) => {
    const r = rng.pick(REPLACE);
    const [first] = r.accepted;
    const wrong = ['él', 'ella', 'ellos', 'ellas', 'nosotros', 'vosotros'].filter((p) => !r.accepted.includes(p));
    const traps = wrong.map((p) => ({ text: p, why: r.why }));
    return {
      prompt: `Remplace « ${r.group} » par un pronom sujet.`,
      answer: { kind: 'text', accepted: dotted(...r.accepted) },
      traps: [...accentTraps(r.accepted), ...traps],
      hint: 'Le groupe contient-il « moi » ou « toi » ? Combien de personnes ? Des filles, des garçons ?',
      steps: [r.why, `Réponse : **${first}**`],
    };
  },
  4: (rng) => {
    if (rng.int(0, 1) === 0) {
      const s = rng.pick(ADDRESS);
      return {
        prompt: s.prompt,
        answer: { kind: 'text', accepted: dotted(s.right) },
        traps: s.wrong.map(([text, why]) => ({ text, why })),
        hint: 'Regarde le pays, le nombre de personnes et le degré de politesse.',
        steps: [
          '« usted(es) » sert à vouvoyer ; « vosotros » tutoie un groupe en Espagne ; en Amérique, « ustedes » sert dans les deux cas.',
          `Réponse : **${s.right}**`,
        ],
      };
    }
    const d = rng.pick(DEDUCE);
    const [first] = d.accepted;
    return {
      prompt: `Quel pronom sujet est sous-entendu ? Écris-le : « … ${d.rest} »`,
      answer: { kind: 'text', accepted: dotted(...d.accepted) },
      traps: [
        ...accentTraps(d.accepted),
        ...['yo', 'tú', 'él', 'nosotros', 'ellos']
          .filter((p) => !d.accepted.includes(p))
          .map((p) => ({ text: p, why: `La terminaison du verbe ne va pas avec « ${p} ».` })),
      ],
      hint: 'Observe la fin du verbe : elle indique qui fait l’action.',
      steps: ['En espagnol, la terminaison du verbe suffit souvent à dire qui agit.', `Réponse : **${first}**`],
    };
  },
  5: (rng) => {
    const scene = rng.pick(SCENES);
    const picked = new Set(rng.shuffle(scene.items).slice(0, 3));
    const items = scene.items.filter((i) => picked.has(i));
    return {
      prompt: `Lis le document. Pour chaque phrase citée, écris le pronom sujet : il remplace le nom ou précise qui agit (${items
        .map((i) => `ligne ${i.line} : « …${i.after} »`)
        .join(' ; ')}).`,
      figure: { kind: 'document', title: scene.title, lines: [...scene.lines], credit: 'Texte écrit pour l’exercice.' },
      answer: {
        kind: 'cloze',
        parts: [
          ...items.map((i, k) => `${k === 0 ? '' : `${items[k - 1]?.after ?? ''} `}Ligne ${i.line} : ${i.before}`),
          items.at(-1)?.after ?? '',
        ],
        blanks: items.map((i) => ({ mode: 'text' as const, accepted: [...i.accepted] })),
      },
      hint: 'Pour chaque phrase, cherche de qui on parle et qui prend la parole.',
      steps: [
        ...items.map((i) => `Ligne ${i.line} : ${i.why}`),
        `Réponse : **${items.map((i) => i.accepted[0]).join(' ; ')}**`,
      ],
    };
  },
};

const pronouns: Skill = {
  id: 'e5-pronoms-sujets',
  title: 'Les pronoms sujets',
  levels: 5,
  version: 1,
  lesson: lesson(
    [
      'Les **pronoms sujets** : yo, tú, él / ella, nosotros / nosotras, vosotros / vosotras, ellos / ellas. Pour le **vouvoiement** : usted (une personne), ustedes (plusieurs), avec le verbe à la 3e personne.',
      'La terminaison du verbe suffit souvent : « Vivo en España. » Ajoute le pronom pour insister, opposer ou lever un doute : « Yo canto y tú bailas. »',
      'Attention à l’accent écrit : tú (tu) et él (il). En Espagne, vosotros tutoie un groupe ; en Amérique, on dit ustedes.',
    ],
    'Pronoms personnels sujets (pour insister, pour lever un doute sur la personne verbale).',
    ['rae-dpd-pronombres-tonicos', 'rae-dpd-usted', 'rae-dpd-vosotros', 'rae-dpd-tilde'],
  ),
  generate: (rng, level) => PRONOUN_LEVELS[level](rng),
};

// ——— Verbes réguliers ———

const present = (v: Verb, p: Person): string => CONJUGAISONS[v].present[p];
const stem = (v: Verb) => v.slice(0, -2);
const table = (v: Verb) => PERSONS.map((p) => `${PRONOUN[p]} ${present(v, p)}`).join(', ');
const how = (g: Group, v: Verb, p: Person) =>
  `On enlève -${g} de « ${v} » (radical « ${stem(v)}- ») et on ajoute « -${ENDINGS[g][p]} » pour « ${PRONOUN[p]} ».`;
const wrongPerson = (v: Verb, q: Person, p: Person) =>
  `« ${present(v, q)} » va avec « ${PRONOUN[q]} », pas avec « ${PRONOUN[p]} ».`;

/** Forme construite avec la terminaison d'un autre groupe, quand elle diffère de toutes les formes du verbe. */
function mixed(g: Group, v: Verb, p: Person): readonly [string, string] | undefined {
  const other: Group = g === 'er' || (g === 'ir' && p !== 'nosotros' && p !== 'vosotros') ? 'ar' : 'er';
  const text = `${stem(v)}${ENDINGS[other][p]}`;
  if (PERSONS.some((q) => present(v, q) === text)) return undefined;
  return [
    text,
    `« -${ENDINGS[other][p]} » est une terminaison du présent des verbes en -${other} ; « ${v} » est en -${g} : « ${present(v, p)} ».`,
  ];
}

/** Sujets des phrases du niveau 4 : groupes nominaux et vouvoiement. */
const SUBJECTS: readonly { readonly text: string; readonly person: Person; readonly why: string }[] = [
  { text: 'Clara y yo', person: 'nosotros', why: '« Clara y yo » = nous.' },
  { text: 'Javier y yo', person: 'nosotros', why: '« Javier y yo » = nous.' },
  { text: 'En España, tú y Gonzalo', person: 'vosotros', why: '« tú y Gonzalo » = vous (tutoiement, en Espagne).' },
  { text: 'Inés y Javier', person: 'ellos', why: '« Inés y Javier » = ils.' },
  { text: 'Mi hermano', person: 'el', why: '« Mi hermano » = il.' },
  { text: 'Usted', person: 'el', why: '« usted » (vous de politesse) se conjugue à la 3e personne du singulier.' },
  { text: 'Ustedes', person: 'ellos', why: '« ustedes » se conjugue à la 3e personne du pluriel.' },
];

interface Message {
  readonly title: string;
  readonly lines: readonly string[];
  /** Reformulations : début de phrase, verbe, personne, fin. */
  readonly items: readonly {
    readonly before: string;
    readonly verb: Verb;
    readonly person: Person;
    readonly after: string;
    readonly line: number;
  }[];
}

const MESSAGES: Readonly<Record<Group, readonly Message[]>> = {
  ar: [
    {
      title: 'Le message de Javier',
      lines: [
        '¡Hola! Me llamo Javier y tengo doce años.',
        'Estudio en casa y canto una canción.',
        'Mi amiga Clara y yo bailamos en la fiesta y escuchamos música.',
      ],
      items: [
        { before: 'Javier', verb: 'estudiar', person: 'el', after: 'en casa.', line: 2 },
        { before: 'Javier', verb: 'cantar', person: 'el', after: 'una canción.', line: 2 },
        { before: 'Javier y Clara', verb: 'bailar', person: 'ellos', after: 'en la fiesta.', line: 3 },
        { before: 'Javier y Clara', verb: 'escuchar', person: 'ellos', after: 'música.', line: 3 },
      ],
    },
    {
      title: 'Le message d’Inés',
      lines: [
        '¡Buenos días! Me llamo Inés.',
        'Hablo español y trabajo en clase.',
        'Antonio y yo cantamos una canción y bailamos en la fiesta.',
      ],
      items: [
        { before: 'Inés', verb: 'hablar', person: 'el', after: 'español.', line: 2 },
        { before: 'Inés', verb: 'trabajar', person: 'el', after: 'en clase.', line: 2 },
        { before: 'Inés y Antonio', verb: 'cantar', person: 'ellos', after: 'una canción.', line: 3 },
        { before: 'Inés y Antonio', verb: 'bailar', person: 'ellos', after: 'en la fiesta.', line: 3 },
      ],
    },
  ],
  er: [
    {
      title: 'Le message de Clara',
      lines: [
        '¡Hola! Me llamo Clara y tengo trece años.',
        'Como una naranja y bebo agua.',
        'Javier y yo aprendemos español y leemos un libro.',
      ],
      items: [
        { before: 'Clara', verb: 'comer', person: 'el', after: 'una naranja.', line: 2 },
        { before: 'Clara', verb: 'beber', person: 'el', after: 'agua.', line: 2 },
        { before: 'Clara y Javier', verb: 'aprender', person: 'ellos', after: 'español.', line: 3 },
        { before: 'Clara y Javier', verb: 'leer', person: 'ellos', after: 'un libro.', line: 3 },
      ],
    },
    {
      title: 'Le message de Gonzalo',
      lines: [
        '¡Buenas tardes! Me llamo Gonzalo.',
        'Aprendo español y leo un libro.',
        'Alicia y yo comemos una naranja y bebemos agua.',
      ],
      items: [
        { before: 'Gonzalo', verb: 'aprender', person: 'el', after: 'español.', line: 2 },
        { before: 'Gonzalo', verb: 'leer', person: 'el', after: 'un libro.', line: 2 },
        { before: 'Gonzalo y Alicia', verb: 'comer', person: 'ellos', after: 'una naranja.', line: 3 },
        { before: 'Gonzalo y Alicia', verb: 'beber', person: 'ellos', after: 'agua.', line: 3 },
      ],
    },
  ],
  ir: [
    {
      title: 'Le message d’Alicia',
      lines: [
        '¡Hola! Me llamo Alicia y tengo doce años.',
        'Vivo en España y escribo un mensaje.',
        'Antonio y yo abrimos la puerta y escribimos en clase.',
      ],
      items: [
        { before: 'Alicia', verb: 'vivir', person: 'el', after: 'en España.', line: 2 },
        { before: 'Alicia', verb: 'escribir', person: 'el', after: 'un mensaje.', line: 2 },
        { before: 'Alicia y Antonio', verb: 'abrir', person: 'ellos', after: 'la puerta.', line: 3 },
        { before: 'Alicia y Antonio', verb: 'escribir', person: 'ellos', after: 'en clase.', line: 3 },
      ],
    },
    {
      title: 'Le message d’Antonio',
      lines: ['¡Buenos días! Me llamo Antonio.', 'Abro la puerta y escribo en casa.', 'Inés y yo vivimos en España.'],
      items: [
        { before: 'Antonio', verb: 'abrir', person: 'el', after: 'la puerta.', line: 2 },
        { before: 'Antonio', verb: 'escribir', person: 'el', after: 'en casa.', line: 2 },
        { before: 'Antonio e Inés', verb: 'vivir', person: 'ellos', after: 'en España.', line: 3 },
      ],
    },
  ],
};

function verbQuestion(g: Group, rng: Rng, level: Level): QuestionDraft {
  const verb = rng.pick<(typeof VERBES)[Group][number]>(VERBES[g]);
  const v: Verb = verb.inf;
  if (level === 1) {
    const p = rng.pick(['yo', 'tu', 'el'] as const);
    const far = rng.shuffle(['nosotros', 'vosotros', 'ellos'] as const).slice(0, 2);
    const right = present(v, p);
    const { answer, traps } = options(
      rng,
      right,
      far.map((q) => [present(v, q), wrongPerson(v, q, p)]),
    );
    return {
      prompt: `Avec « ${PRONOUN[p]} », quelle est la forme de « ${v} » (${verb.fr}) au présent ?`,
      answer,
      traps,
      hint: `Les trois formes ont le même début : compare leur fin avec celle qui va avec « ${PRONOUN[p]} ».`,
      steps: [how(g, v, p), `Réponse : **${right}**`],
    };
  }
  if (level === 2) {
    const p = rng.pick(PERSONS.slice(1));
    const right = present(v, p);
    const odd = mixed(g, v, p);
    const others = rng.shuffle(PERSONS.filter((q) => q !== p)).slice(0, odd ? 2 : 3);
    const { answer, traps } = options(rng, right, [
      ...others.map((q) => [present(v, q), wrongPerson(v, q, p)] as const),
      ...(odd ? [odd] : []),
    ]);
    return {
      prompt: `Choisis la forme correcte du présent : « ${PRONOUN[p]} … » (${v}, ${verb.fr}).`,
      answer,
      traps,
      hint: `Vérifie deux choses : la personne (« ${PRONOUN[p]} ») et la voyelle propre aux verbes en -${g}.`,
      steps: [how(g, v, p), `Réponse : **${right}**`],
    };
  }
  if (level === 3) {
    const p = rng.pick(PERSONS);
    const right = present(v, p);
    return {
      prompt: `Complète au présent avec le verbe « ${v} » (${verb.fr}). Sujet : ${PRONOUN[p]}.`,
      answer: {
        kind: 'cloze',
        parts: [`${capital(PRONOUN[p])} `, ` ${verb.rest}.`],
        blanks: [{ mode: 'text', accepted: [...new Set([right, noAccent(right)])] }],
      },
      hint: `Enlève la fin « -${g} » de l’infinitif, puis ajoute la terminaison de « ${PRONOUN[p]} ».`,
      steps: [how(g, v, p), `${v} au présent : ${table(v)}.`, `Réponse : **${right}**`],
    };
  }
  if (level === 4) {
    const s = rng.pick(SUBJECTS);
    const p = s.person;
    const right = present(v, p);
    const odd = mixed(g, v, p);
    const bare = noAccent(right);
    return {
      prompt: `Écris le verbe au présent, avec ses accents : « ${s.text} … (${v}) ${verb.rest}. »`,
      answer: { kind: 'text', accepted: dotted(right) },
      traps: [
        { text: v, why: 'C’est l’infinitif : le verbe doit s’accorder avec son sujet.' },
        ...PERSONS.filter((q) => present(v, q) !== right).map((q) => ({
          text: present(v, q),
          why: `${s.why} « ${present(v, q)} » va avec « ${PRONOUN[q]} ».`,
        })),
        ...(bare === right ? [] : [{ text: bare, why: `Il manque l’accent écrit : on écrit « ${right} ».` }]),
        ...(odd ? [{ text: odd[0], why: odd[1] }] : []),
      ],
      hint: 'Remplace d’abord le sujet par un pronom, puis choisis la terminaison.',
      steps: [s.why, how(g, v, p), `Réponse : **${right}**`],
    };
  }
  const message = rng.pick(MESSAGES[g]);
  const picked = new Set(rng.shuffle(message.items).slice(0, 2));
  const items = message.items.filter((i) => picked.has(i));
  const [a, b] = items as [Message['items'][number], Message['items'][number]];
  return {
    prompt: `Lis le message, puis raconte-le à la 3e personne : complète « ${a.before} … ${a.after} » et « ${b.before} … ${b.after} »`,
    figure: {
      kind: 'document',
      title: message.title,
      lines: [...message.lines],
      credit: 'Message écrit pour l’exercice.',
    },
    answer: {
      kind: 'cloze',
      parts: [`${a.before} `, ` ${a.after} ${b.before} `, ` ${b.after}`],
      blanks: items.map((i) => ({ mode: 'text' as const, accepted: [present(i.verb, i.person)] })),
    },
    hint: 'Retrouve dans le message le verbe qui va avec chaque fin de phrase, puis change de personne.',
    steps: [
      ...items.map(
        (i) =>
          `Ligne ${i.line} : le verbe est « ${i.verb} » ; avec « ${i.before} » (${PRONOUN[i.person]}) : « ${present(i.verb, i.person)} ».`,
      ),
      `Réponse : **${items.map((i) => present(i.verb, i.person)).join(' ; ')}**`,
    ],
  };
}

const capital = (s: string) => s.replace(/\p{L}/u, (c) => c.toUpperCase());

const verbSkill = (g: Group, id: string, version: number, memo: readonly string[]): Skill => ({
  id,
  title: `Le présent des verbes en -${g}`,
  levels: 5,
  version,
  lesson: lesson(memo, `Présent de l’indicatif : verbes très usuels et réguliers en -${g}.`, [
    'rae-dpd-apendice-1',
    'rae-dpd-pronombres-tonicos',
    'rae-dpd-usted',
    'rae-dpd-vosotros',
    ...VERBES[g].map((v) => `rae-dle-${v.inf}`),
  ]),
  generate: (rng, level) => verbQuestion(g, rng, level),
});

// « e5-present-reguliers » garde son identifiant (progression des élèves) et porte désormais les verbes en -ar.
const verbsAr = verbSkill('ar', 'e5-present-reguliers', 2, [
  'Au présent, enlève -ar de l’**infinitif** pour garder le **radical**, puis ajoute la **terminaison** : -o, -as, -a, -amos, -áis, -an.',
  'hablar : hablo, hablas, habla, hablamos, habláis, hablan. Ne perds pas l’accent écrit de « habláis ».',
]);

const verbsEr = verbSkill('er', 'e5-present-er', 1, [
  'Au présent, enlève -er de l’**infinitif** pour garder le **radical**, puis ajoute la **terminaison** : -o, -es, -e, -emos, -éis, -en.',
  'comer : como, comes, come, comemos, coméis, comen. Ne perds pas l’accent écrit de « coméis ».',
]);

const verbsIr = verbSkill('ir', 'e5-present-ir', 1, [
  'Au présent, enlève -ir de l’**infinitif** pour garder le **radical**, puis ajoute la **terminaison** : -o, -es, -e, -imos, -ís, -en.',
  'vivir : vivo, vives, vive, vivimos, vivís, viven. Les verbes en -er et en -ir ne diffèrent qu’avec nosotros et vosotros.',
]);

export const PRESENT_SKILLS: readonly Skill[] = [pronouns, verbsAr, verbsEr, verbsIr];

/** Identifiant de chapitre conservé ; « ser et estar » y reste jusqu'à son lot. */
export const presentChapter = (extra: readonly Skill[]): Chapter => ({
  id: 'e5-present',
  subject: 'espagnol',
  grade: '5e',
  domain: 'langue',
  title: 'Le présent',
  skills: [...PRESENT_SKILLS, ...extra],
});
