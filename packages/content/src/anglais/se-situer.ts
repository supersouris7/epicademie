import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import {
  COUNTED_PLACES,
  FIXED_PLACES,
  HOUSE,
  HOUSE_RIDDLES,
  LOOSE_THINGS,
  MAP_PLACES,
  PREPOSITIONS,
  ROOMS,
  SCENES,
  SPOTS,
  TOWN,
  TOWN_RIDDLES,
  type Countable,
  type Preposition,
} from './se-situer-faits.ts';
import type { Word } from './temps-faits.ts';
import { at, others, pairs, pickEnglish, shuffledOther, some, understand, write } from './temps.ts';

/**
 * Anglais CM2 — « Se situer » (lot an-cm2-02, docs/adr/0034). Programme : cycle 3, langues vivantes
 * (prépositions de lieu ; environnement urbain et habitat ; décrire des lieux). Le programme de 2026 ne
 * s'applique au CM2 qu'à la rentrée 2027. Règles et mots : British Council (voir se-situer-faits.ts : chaque
 * fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes';
const source = (detail: string) => `${PROGRAMME} — se situer. ${detail}`;

/** Réponses avec ou sans point final. */
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
const KIDS = ['Emir', 'Ana', 'Yuna', 'Paul'];
const NUMBERS = [
  [2, 'two'],
  [3, 'three'],
  [4, 'four'],
] as const;
const of = (name: string) => (/^[AEIOU]/.test(name) ? `d’${name}` : `de ${name}`);

// ——— 1. there is / there are ———
const THERE_ONE = ['There is', 'There’s'];
const THERE_MANY = ['There are', 'There’re'];
const NOT_ONE = ['There isn’t', 'There is not', 'There’s not'];
const NOT_MANY = ['There aren’t', 'There are not'];
const ONE_WHY = 'Une seule chose (singulier) : on dit « there is ».';
const MANY_WHY = 'Plusieurs choses (pluriel) : on dit « there are ».';

const drawScene = (rng: Rng) => {
  const scene = rng.pick(SCENES);
  return { scene, item: rng.pick(scene.things) };
};

function thereLevel1(rng: Rng): QuestionDraft {
  const { scene, item } = drawScene(rng);
  const one = rng.int(0, 1) === 0;
  const [, number] = rng.pick(NUMBERS);
  const good = one ? 'is' : 'are';
  const { answer, traps } = choice(rng, good, [
    { label: one ? 'are' : 'is', why: one ? ONE_WHY : MANY_WHY },
    { label: 'am', why: '« am » va seulement avec « I » (je).' },
  ]);
  const group = one ? `a ${item.one}` : `${number} ${item.many}`;
  return {
    prompt: `Complète pour dire « il y a » : « There … ${group} ${scene.en}. »`,
    answer,
    traps,
    hint: 'Compte les choses : une seule, ou plusieurs ?',
    steps: [one ? ONE_WHY : MANY_WHY, `Réponse : **There ${good} ${group} ${scene.en}.**`],
  };
}

function thereLevel2(rng: Rng): QuestionDraft {
  const { scene, item } = drawScene(rng);
  const one = rng.int(0, 1) === 0;
  const [n, number] = rng.pick(NUMBERS);
  const good = one ? `There is a ${item.one} ${scene.en}.` : `There are ${number} ${item.many} ${scene.en}.`;
  const wrong = one
    ? [
        { label: `There are a ${item.one} ${scene.en}.`, why: ONE_WHY },
        { label: `There is ${item.one} ${scene.en}.`, why: 'Il manque « a » devant le nom au singulier.' },
        { label: `There is a ${item.many} ${scene.en}.`, why: '« a » va avec un seul : le nom ne prend pas de s.' },
      ]
    : [
        { label: `There is ${number} ${item.many} ${scene.en}.`, why: MANY_WHY },
        { label: `There are ${number} ${item.one} ${scene.en}.`, why: 'Au pluriel, le nom prend un s.' },
        { label: `There is ${number} ${item.one} ${scene.en}.`, why: MANY_WHY },
      ];
  const { answer, traps } = choice(rng, good, wrong);
  const fr = one ? item.fr : `${n} ${item.frMany}`;
  return {
    prompt: `Quelle phrase dit « Il y a ${fr} ${scene.fr} » ?`,
    answer,
    traps,
    hint: 'Regarde deux choses : « is » ou « are », puis la fin du nom.',
    steps: [one ? ONE_WHY : MANY_WHY, `Réponse : **${good}**`],
  };
}

function thereLevel3(rng: Rng): QuestionDraft {
  const { scene, item } = drawScene(rng);
  const one = rng.int(0, 1) === 0;
  const [, number] = rng.pick(NUMBERS);
  const group = one ? `a ${item.one}` : `${number} ${item.many}`;
  const good = one ? 'There is' : 'There are';
  return {
    prompt: `Écris « There is » ou « There are » : « … ${group} ${scene.en}. »`,
    answer: { kind: 'text', accepted: one ? THERE_ONE : THERE_MANY },
    traps: [
      { text: one ? 'There are' : 'There is', why: one ? ONE_WHY : MANY_WHY },
      { text: 'They are', why: '« They are » veut dire « ils sont ». Pour « il y a », commence par « There ».' },
      { text: 'It is', why: '« It is » veut dire « c’est ». Pour « il y a », commence par « There ».' },
    ],
    hint: 'Le nom est-il seul ou à plusieurs ? Choisis la forme qui va avec.',
    steps: [one ? ONE_WHY : MANY_WHY, `Réponse : **${good} ${group} ${scene.en}.**`],
  };
}

function thereNegative(rng: Rng, one: boolean): QuestionDraft {
  const { scene, item } = drawScene(rng);
  const rest = one ? `a ${item.one}` : `any ${item.many}`;
  const good = one ? 'There isn’t' : 'There aren’t';
  const why = one
    ? 'Un nom au singulier : « there isn’t a… ».'
    : 'Un nom au pluriel après « any » : « there aren’t any… ».';
  return {
    prompt: `Dis qu’il n’y en a pas. Complète : « … ${rest} ${scene.en}. »`,
    answer: { kind: 'text', accepted: one ? NOT_ONE : NOT_MANY },
    traps: [
      { text: one ? 'There aren’t' : 'There isn’t', why },
      { text: one ? 'There is' : 'There are', why: 'Cette phrase dit qu’il y en a. Il faut la négation.' },
    ],
    hint: 'Il faut « there », le verbe, puis la marque du « ne… pas ». Singulier ou pluriel ?',
    steps: [why, `Réponse : **${good} ${rest} ${scene.en}.**`],
  };
}

function thereQuestion(rng: Rng, one: boolean): QuestionDraft {
  const { scene, item } = drawScene(rng);
  const rest = one ? `a ${item.one}` : `any ${item.many}`;
  const good = one ? 'Is there' : 'Are there';
  const why = one ? 'Question au singulier : « Is there…? ».' : 'Question au pluriel : « Are there…? ».';
  return {
    prompt: `Pose la question. Complète : « … ${rest} ${scene.en}? »`,
    answer: { kind: 'text', accepted: [good] },
    traps: [
      { text: one ? 'Are there' : 'Is there', why },
      { text: one ? 'There is' : 'There are', why: 'Dans une question, le verbe passe avant « there ».' },
    ],
    hint: 'Dans une question, les deux mots changent de place. Singulier ou pluriel ?',
    steps: [why, `Réponse : **${good} ${rest} ${scene.en}?**`],
  };
}

function thereShortAnswer(rng: Rng, one: boolean): QuestionDraft {
  const { scene, item } = drawScene(rng);
  const yes = rng.int(0, 1) === 0;
  const rest = one ? `a ${item.one}` : `any ${item.many}`;
  const verb = one ? 'Is there' : 'Are there';
  const accepted = yes
    ? [one ? 'there is' : 'there are']
    : one
      ? ['there isn’t', 'there is not', 'there’s not']
      : ['there aren’t', 'there are not'];
  const good = at(accepted, 0);
  const why = 'La réponse courte reprend « there » et le verbe de la question.';
  return {
    prompt: `Réponds ${yes ? 'oui' : 'non'}. « ${verb} ${rest} ${scene.en}? » — « ${yes ? 'Yes' : 'No'}, … . »`,
    answer: { kind: 'text', accepted: full(accepted) },
    traps: [
      ...(yes && one ? [{ text: 'there’s', why: 'Après « Yes », on ne raccourcit pas : « Yes, there is ».' }] : []),
      { text: one ? 'there are' : 'there is', why },
      { text: yes ? 'it is' : 'it isn’t', why: 'La question commence avec « there » : la réponse le reprend.' },
    ],
    hint: 'Reprends les deux mots du début de la question, remis dans l’ordre normal.',
    steps: [why, `Réponse : **${yes ? 'Yes' : 'No'}, ${good}.**`],
  };
}

function thereLevel5(rng: Rng): QuestionDraft {
  const [a, b, c] = some(rng, COUNTED_PLACES, 3) as [Countable, Countable, Countable];
  const [n, number] = rng.pick(NUMBERS);
  const kid = rng.pick(KIDS);
  const lines = rng.shuffle([`${a.one}: 1`, `${b.one}: ${n}`, `${c.one}: 0`]);
  return {
    prompt: `Lis les notes ${of(kid)} sur sa rue (0 = aucun). Complète son message en anglais.`,
    figure: { kind: 'document', title: 'My street', lines, credit: 'Écrit pour l’exercice.' },
    answer: {
      kind: 'cloze',
      parts: ['In my street, ', ` a ${a.one}. `, ` ${number} `, '. But ', ` a ${c.one}.`],
      blanks: [
        { mode: 'text', accepted: THERE_ONE },
        { mode: 'text', accepted: THERE_MANY },
        { mode: 'text', accepted: [b.many] },
        { mode: 'text', accepted: NOT_ONE },
      ],
    },
    hint: 'Lis le nombre de chaque ligne : un, plusieurs ou aucun. Puis pense au pluriel du nom.',
    steps: [
      `« ${a.one}: 1 » : une seule chose, donc « there is ».`,
      `« ${b.one}: ${n} » : plusieurs, donc « there are », et le nom devient « ${b.many} ».`,
      `« ${c.one}: 0 » : aucun, donc « there isn’t ».`,
      `Réponse : **there is, there are, ${b.many}, there isn’t**`,
    ],
  };
}

const thereIs: Skill = {
  id: 'acm2-there-is',
  title: 'there is / there are',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour dire « il y a » : **there is** (une seule chose) ou **there are** (plusieurs). There’s = there is.',
      'Question : Is there…? Are there…? Pour « il n’y a pas » : There isn’t a…, There aren’t any….',
      'Exemple : There is a park. There are two parks.',
    ],
    source: source('Règles : British Council, LearnEnglish, « Using there is and there are ».'),
    sources: ['cycle3-2020', 'bc-there-is'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return thereLevel1(rng);
    if (level === 2) return thereLevel2(rng);
    if (level === 3) return thereLevel3(rng);
    if (level === 4) {
      const one = rng.int(0, 1) === 0;
      return rng.pick([thereNegative, thereQuestion, thereShortAnswer])(rng, one);
    }
    return thereLevel5(rng);
  },
};

// ——— 2. Les prépositions de lieu ———
const meaning = (p: Preposition) => `« ${p.en} » veut dire « ${p.fr} ».`;
const gap = (p: Preposition) => `${p.sentence[0]} … ${p.sentence[1]}`;
const solved = (p: Preposition) => `${p.sentence[0]} ${p.en} ${p.sentence[1]}`;

function prepositionLevel1(rng: Rng): QuestionDraft {
  const p = rng.pick(PREPOSITIONS);
  const { answer, traps } = choice(
    rng,
    p.fr,
    others(rng, PREPOSITIONS, p, 2).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
  );
  return {
    prompt: `Que veut dire la préposition « ${p.en} » ?`,
    answer,
    traps,
    hint: 'Imagine un chat et une boîte. Où se met le chat avec ce mot ?',
    steps: [meaning(p), `Réponse : **${p.fr}**`],
  };
}

function prepositionLevel2(rng: Rng): QuestionDraft {
  const p = rng.pick(PREPOSITIONS);
  const { answer, traps } = choice(
    rng,
    p.en,
    others(rng, PREPOSITIONS, p, 3).map((o) => ({ label: o.en, why: meaning(o) })),
  );
  return {
    prompt: `« ${p.sentenceFr} » Choisis le bon mot : « ${gap(p)} »`,
    answer,
    traps,
    hint: 'Repère dans la phrase française le mot qui dit où est la chose.',
    steps: [meaning(p), `Réponse : **${solved(p)}**`],
  };
}

function prepositionLevel3(rng: Rng): QuestionDraft {
  const p = rng.pick(PREPOSITIONS);
  const other = at(others(rng, PREPOSITIONS, p, 1), 0);
  return {
    prompt: `Écris la préposition : « ${gap(p)} » (${p.sentenceFr})`,
    answer: { kind: 'text', accepted: [p.en, ...p.alt] },
    traps: [
      { text: p.typo, why: `Presque ! Le mot juste s’écrit « ${p.en} ».` },
      { text: other.en, why: meaning(other) },
    ],
    hint: `La réponse commence par « ${p.en.slice(0, 1)} » et compte ${p.en.split(' ').length === 1 ? 'un seul mot' : `${p.en.split(' ').length} mots`}.`,
    steps: [meaning(p), `Réponse : **${solved(p)}**`],
  };
}

function prepositionLevel4(rng: Rng): QuestionDraft {
  if (rng.int(0, 2) === 0) {
    const rows = some(rng, PREPOSITIONS, 5);
    const left = rows.map((p) => p.en);
    const right = shuffledOther(
      rng,
      rows.map((p) => p.fr),
    );
    return {
      prompt: `Associe chaque préposition à son sens : ${left.join(', ')}.`,
      answer: { kind: 'match', left, right, pairs: rows.map((p) => right.indexOf(p.fr)) },
      hint: 'Commence par les mots les plus courts. Les autres seront plus faciles.',
      steps: [
        'Chaque préposition dit une place différente.',
        ...rows.map((p) => `${p.en} → ${p.fr}`),
        `Réponse : **${rows.map((p) => `${p.en} = ${p.fr}`).join(' ; ')}**`,
      ],
    };
  }
  const f = rng.pick(FIXED_PLACES);
  const [before, after] = f.sentence;
  return {
    prompt: `Écris « at », « in » ou « on » : « ${before} … ${after} » (${f.fr})`,
    answer: { kind: 'text', accepted: [f.en] },
    traps: (['at', 'in', 'on'] as const)
      .filter((x) => x !== f.en)
      .map((x) => ({ text: x, why: `Ici, « ${x} » ne va pas. ${f.why}` })),
    hint: 'Ne traduis pas mot à mot. Pense à l’expression anglaise apprise : maison, travail, mur, étage…',
    steps: [f.why, `Réponse : **${before} ${f.en} ${after}**`],
  };
}

function frPlace(prep: Preposition, spot: (typeof SPOTS)[number]): string {
  return prep.en === 'next to' ? `à côté ${spot.de}` : `${prep.fr} ${spot.fr}`;
}

function prepositionLevel5(rng: Rng): QuestionDraft {
  const [a, b] = some(rng, LOOSE_THINGS, 2) as [Countable, Countable];
  const [x, y] = some(rng, SPOTS, 2) as [(typeof SPOTS)[number], (typeof SPOTS)[number]];
  const pickPrep = (spot: (typeof SPOTS)[number]) => {
    const en = rng.pick(spot.with);
    const p = PREPOSITIONS.find((q) => q.en === en);
    if (!p) throw new Error(`préposition inconnue : ${en}`);
    return p;
  };
  const p = pickPrep(x);
  const q = pickPrep(y);
  const [n, number] = rng.pick(NUMBERS);
  const kid = rng.pick(KIDS);
  return {
    prompt: `Lis les notes ${of(kid)} sur sa chambre. Écris son message en anglais.`,
    figure: {
      kind: 'document',
      title: 'Dans ma chambre',
      lines: [`Il y a ${a.fr} ${frPlace(p, x)}.`, `Il y a ${n} ${b.frMany} ${frPlace(q, y)}.`],
      credit: 'Écrit pour l’exercice.',
    },
    answer: {
      kind: 'cloze',
      parts: ['', ` a ${a.one} `, ` the ${x.en}. `, ` ${number} ${b.many} `, ` the ${y.en}.`],
      blanks: [
        { mode: 'text', accepted: THERE_ONE },
        { mode: 'text', accepted: [p.en, ...p.alt] },
        { mode: 'text', accepted: THERE_MANY },
        { mode: 'text', accepted: [q.en, ...q.alt] },
      ],
    },
    hint: 'Pour chaque phrase : d’abord « il y a » (une ou plusieurs choses ?), puis le mot de la place.',
    steps: [
      `Une seule chose : « There is ». ${meaning(p)}`,
      `Plusieurs choses : « There are ». ${meaning(q)}`,
      `Réponse : **There is, ${p.en}, There are, ${q.en}**`,
    ],
  };
}

const prepositions: Skill = {
  id: 'acm2-prepositions',
  title: 'Les prépositions de lieu',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **préposition** de lieu dit où est une chose : in (dans), on (sur), under (sous), next to (à côté de).',
      'Aussi : in front of (devant), behind (derrière), between (entre deux choses), opposite (en face de).',
      'Pièges : at home (à la maison), at work (au travail), on the wall (au mur), on the fifth floor (au cinquième étage).',
    ],
    source: source(
      'Règles : British Council, LearnEnglish, « Prepositions of place » ; LearnEnglish Kids, « Prepositions of place » et fiches.',
    ),
    sources: ['cycle3-2020', 'bc-prepositions-place', 'bck-prepositions-place', 'bck-flashcards-prepositions'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return prepositionLevel1(rng);
    if (level === 2) return prepositionLevel2(rng);
    if (level === 3) return prepositionLevel3(rng);
    if (level === 4) return prepositionLevel4(rng);
    return prepositionLevel5(rng);
  },
};

// ——— Vocabulaire : questions communes à la maison et à la ville ———
const wordIn = (list: readonly Word[], en: string): Word => {
  const x = list.find((y) => y.en === en);
  if (!x) throw new Error(`mot inconnu : ${en}`);
  return x;
};
/** Mot seul ou précédé de son article. */
const withArticle = (x: Word) =>
  [x.en, ...(x.alt ?? [])].flatMap((f) => full([f, `${/^[aeiou]/.test(f) ? 'an' : 'a'} ${f}`, `the ${f}`]));

function riddle(
  rng: Rng,
  list: readonly Word[],
  riddles: readonly { readonly en: string; readonly clue: string }[],
): QuestionDraft {
  const r = rng.pick(riddles);
  const good = wordIn(list, r.en);
  const [x, y] = others(rng, riddles, r, 2).map((o) => wordIn(list, o.en)) as [Word, Word];
  return {
    prompt: `Devine et écris le mot en anglais. ${r.clue}`,
    answer: { kind: 'text', accepted: withArticle(good) },
    traps: [
      { text: good.typo, why: `Tu as la bonne idée ! Le mot s’écrit « ${good.en} ».` },
      { text: x.en, why: `« ${x.en} » veut dire « ${x.fr} ».` },
      { text: y.en, why: `« ${y.en} » veut dire « ${y.fr} ».` },
    ],
    hint: 'Trouve d’abord le mot en français. Puis cherche son nom anglais.',
    steps: [`On devine : « ${good.fr} ».`, `Réponse : **${good.en}**`],
  };
}

/** Niveau 4 d'un lexique : 5 paires ou une devinette. */
const hardWords = (rng: Rng, list: readonly Word[], riddles: Parameters<typeof riddle>[2]): QuestionDraft =>
  rng.int(0, 2) === 0 ? pairs(rng, list, 5) : riddle(rng, list, riddles);

/** Niveau 3 : les mots d'un seul tenant (l'indice compte les lettres). */
const oneWord = (list: readonly Word[]) => list.filter((x) => !x.en.includes(' '));

// ——— 3. La maison ———
function houseLevel5(rng: Rng): QuestionDraft {
  const room = rng.pick(ROOMS);
  const good = wordIn(HOUSE, room.en);
  const kid = rng.pick(KIDS);
  const wrong = others(rng, ROOMS, room, 3).map((o) => wordIn(HOUSE, o.en));
  return {
    prompt: `Lis le message ${of(kid)}. De quel endroit de la maison parle ce message ? Écris-le en anglais.`,
    figure: {
      kind: 'document',
      title: 'Guess the place!',
      lines: rng.shuffle(room.lines),
      credit: 'Écrit pour l’exercice.',
    },
    answer: { kind: 'text', accepted: withArticle(good) },
    traps: wrong.map((o) => ({
      text: o.en,
      why: `« ${o.en} » (${o.fr}) ne va pas avec tous les indices. Relis chaque ligne.`,
    })),
    hint: 'Cherche les objets et les actions. Qu’est-ce qu’on fait à cet endroit ?',
    steps: [
      'On repère les objets et ce qu’on fait là.',
      `Tout correspond à « ${good.fr} ».`,
      `Réponse : **${good.en}**`,
    ],
  };
}

const house: Skill = {
  id: 'acm2-maison',
  title: 'La maison',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Les **pièces** : bedroom (chambre), bathroom (salle de bains), kitchen (cuisine), living room (salon), dining room (salle à manger).',
      'Les **meubles** : bed (lit), wardrobe (armoire), sofa (canapé), armchair (fauteuil), bookcase (meuble à livres), chair (chaise). Et fridge (frigo), oven (four).',
      'Autour : garden (jardin), door (porte), window (fenêtre), stairs (escalier), roof (toit). Exemple : There is a bed in the bedroom.',
    ],
    source: source('Mots : British Council, LearnEnglish Kids, fiches « Home » et « Furniture ».'),
    sources: ['cycle3-2020', 'bck-flashcards-home', 'bck-flashcards-furniture'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(rng, HOUSE.slice(0, 9), 'la maison', 'Fais le tour de ta maison et dis les mots anglais.');
    if (level === 2) return understand(rng, HOUSE, 'la maison');
    if (level === 3) return write(rng, oneWord(HOUSE), 'la maison');
    if (level === 4) return hardWords(rng, HOUSE, HOUSE_RIDDLES);
    return houseLevel5(rng);
  },
};

// ——— 4. La ville ———
function townLevel5(rng: Rng): QuestionDraft {
  const [a, middle, b, across, back] = some(rng, MAP_PLACES, 5) as [string, string, string, string, string];
  const opposite = rng.int(0, 1) === 0;
  const target = wordIn(TOWN, opposite ? across : back);
  const relation = opposite ? 'en face de' : 'derrière';
  const lines = rng.shuffle([
    `The ${middle} is between the ${a} and the ${b}.`,
    `The ${across} is opposite the ${middle}.`,
    `The ${back} is behind the ${middle}.`,
  ]);
  return {
    prompt: `Lis le plan. Un lieu est entre « the ${a} » et « the ${b} ». Quel lieu est ${relation} lui ? Écris-le en anglais.`,
    figure: { kind: 'document', title: 'In my town', lines, credit: 'Écrit pour l’exercice.' },
    answer: { kind: 'text', accepted: withArticle(target) },
    traps: [middle, opposite ? back : across, a].map((en) => ({
      text: en,
      why:
        en === middle
          ? 'C’est le lieu du milieu. Il reste une étape : cherche ce qui est autour de lui.'
          : `« ${en} » n’est pas le lieu cherché. Relis la phrase avec « ${opposite ? 'opposite' : 'behind'} ».`,
    })),
    hint: 'Deux étapes. D’abord, trouve le lieu du milieu (between). Puis cherche la phrase qui parle de lui.',
    steps: [
      `Entre « ${a} » et « ${b} » : c’est « ${middle} ».`,
      `${opposite ? '« opposite » veut dire « en face de »' : '« behind » veut dire « derrière »'}.`,
      `Réponse : **${target.en}**`,
    ],
  };
}

const town: Skill = {
  id: 'acm2-ville',
  title: 'La ville',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'En ville : school (école), library, cinema, theatre, bank (banque), town hall (mairie), park (parc), street (rue).',
      'Aussi : sports centre, stadium (stade), train station (gare), airport, factory (usine), bridge (pont).',
      'Un **faux ami** : library veut dire « bibliothèque ». Une librairie, c’est a bookshop.',
    ],
    source: source('Mots : British Council, LearnEnglish Kids, fiches « Places in a town ».'),
    sources: ['cycle3-2020', 'bck-flashcards-town', 'bc-prepositions-place'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(rng, TOWN.slice(0, 7), 'la ville', 'Pense aux lieux près de ton école et à leur nom anglais.');
    if (level === 2) return understand(rng, TOWN, 'la ville');
    if (level === 3) return write(rng, oneWord(TOWN), 'la ville');
    if (level === 4) return hardWords(rng, TOWN, TOWN_RIDDLES);
    return townLevel5(rng);
  },
};

export const ENGLISH_PLACES_CHAPTER: Chapter = {
  id: 'acm2-se-situer',
  subject: 'anglais',
  grade: 'cm2',
  domain: 'langue',
  title: 'Se situer',
  skills: [thereIs, prepositions, house, town],
};
