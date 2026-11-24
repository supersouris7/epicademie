import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { BODY, CLOTHES, FAMILY, PLURALS } from './famille-faits.ts';
import { COLOURS, type Word } from './temps-faits.ts';
import { at, others, pairs, pickEnglish, shuffledOther, some, understand, write } from './temps.ts';

/**
 * Anglais CM1 — « Famille, corps, vêtements » (lot an-cm1-04, docs/adr/0034). Programme : cycle 3, langues
 * vivantes (la famille ; le corps humain, les vêtements ; les possessifs et le génitif). Mots et règles :
 * British Council (voir famille-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes, CM1';
const source = (detail: string) => `${PROGRAMME} — famille, corps humain, vêtements ; possessifs et génitif. ${detail}`;

/** « de » élidé devant un prénom qui commence par une voyelle. */
const de = (name: string) => (/^[AEIOU]/.test(name) ? `d’${name}` : `de ${name}`);
const word = (list: readonly Word[], en: string): Word => {
  const w = list.find((x) => x.en === en);
  if (!w) throw new Error(`mot inconnu : ${en}`);
  return w;
};
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);

// ——— 1. La famille ———

/** « mère » et « maman » ne sont jamais proposés ensemble : l’élève ne saurait pas les départager. */
const FORMAL = FAMILY.filter((w) => w.en !== 'mum' && w.en !== 'dad');
const FAMILIAR = FAMILY.filter((w) => w.en !== 'mother' && w.en !== 'father');
const FEMALE = ['Ana', 'Yuna', 'Lisa'];
const MALE = ['Emir', 'Paul', 'Tom'];

/** Lien de famille deviné : « le frère de ta mère » → uncle. */
const LINKS: readonly {
  readonly fr: string;
  /** Lien cherché, vu de la personne du milieu : « le frère ». */
  readonly role: string;
  readonly good: string;
  readonly bad: readonly string[];
  readonly chain: readonly [string, string];
  /** Prénoms possibles (fille ou garçon) de la personne du milieu et de la personne cherchée. */
  readonly names: readonly [readonly string[], readonly string[]];
}[] = [
  {
    fr: 'le frère de ta mère',
    role: 'le frère',
    good: 'uncle',
    bad: ['brother', 'grandfather'],
    chain: ['mum', 'brother'],
    names: [FEMALE, MALE],
  },
  {
    fr: 'la sœur de ton père',
    role: 'la sœur',
    good: 'auntie',
    bad: ['sister', 'grandmother'],
    chain: ['dad', 'sister'],
    names: [MALE, FEMALE],
  },
  {
    fr: 'la mère de ta mère',
    role: 'la mère',
    good: 'grandmother',
    bad: ['mother', 'auntie'],
    chain: ['mum', 'mum'],
    names: [FEMALE, FEMALE],
  },
  {
    fr: 'le père de ton père',
    role: 'le père',
    good: 'grandfather',
    bad: ['father', 'uncle'],
    chain: ['dad', 'dad'],
    names: [MALE, MALE],
  },
  {
    fr: 'le fils de ton oncle',
    role: 'le fils',
    good: 'cousin',
    bad: ['son', 'brother'],
    chain: ['uncle', 'son'],
    names: [MALE, MALE],
  },
];

const family: Skill = {
  id: 'acm1-famille',
  title: 'La famille',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La famille : mother (mum) = mère, father (dad) = père, sister = sœur, brother = frère, baby = bébé.',
      'Les grands-parents sont les **parents** de tes parents : grandmother (grandma) et grandfather (grandad).',
      'Aussi : uncle (oncle), auntie (tante), cousin (cousin ou cousine), son (fils).',
    ],
    source: source('Mots : British Council, « Family flashcards » et chanson « What is a family? ».'),
    sources: ['cycle3-2020', 'bck-flashcards-family', 'bck-song-family', 'bc-possessive-s'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        FAMILY.slice(0, 7),
        'la famille',
        'Imagine cette personne dans une famille. Quel mot as-tu entendu en classe ?',
      );
    if (level === 2) return understand(rng, rng.int(0, 1) === 0 ? FORMAL : FAMILIAR, 'la famille');
    if (level === 3) return write(rng, FORMAL, 'la famille');
    if (level === 4) {
      if (rng.int(0, 1) === 0) return pairs(rng, FORMAL, 5);
      const link = rng.pick(LINKS);
      const good = word(FAMILY, link.good);
      return {
        prompt: `Qui est ${link.fr} pour toi ? Écris le mot anglais.`,
        answer: { kind: 'text', accepted: [good.en, ...(good.alt ?? [])] },
        traps: [
          ...link.bad.map((b) => ({
            text: b,
            why: `« ${b} » veut dire « ${word(FAMILY, b).fr} ». Suis le lien pas à pas.`,
          })),
          { text: good.typo, why: `La bonne personne, mais regarde les lettres : « ${good.en} ».` },
        ],
        hint: 'Dessine un petit arbre : toi, puis tes parents, puis la personne cherchée.',
        steps: [
          `On suit le lien : ${link.fr}.`,
          `Le mot français pour cette personne est « ${good.fr} ».`,
          `Réponse : **${good.en}**`,
        ],
      };
    }
    const link = rng.pick(LINKS);
    const good = word(FAMILY, link.good);
    const me = rng.pick([...FEMALE, ...MALE]);
    const mid = rng.pick(link.names[0].filter((n) => n !== me));
    const who = rng.pick(link.names[1].filter((n) => n !== me && n !== mid));
    const [first, second] = link.chain;
    return {
      prompt: `Lis le message ${de(me)}. Qui est ${who} pour ${me} ? Écris le mot anglais.`,
      figure: {
        kind: 'document',
        title: 'My family',
        lines: [`Hello! I’m ${me}.`, `${mid} is my ${first}.`, `${who} is ${mid}’s ${second}.`],
        credit: 'Écrit pour l’exercice.',
      },
      answer: { kind: 'text', accepted: [good.en, ...(good.alt ?? [])] },
      traps: [
        ...[first, second, ...link.bad]
          .filter((b, i, all) => b !== good.en && all.indexOf(b) === i)
          .map((b) => ({ text: b, why: `« ${b} » n’est pas le lien entre ${me} et ${who}. Suis les deux phrases.` })),
        { text: good.typo, why: `La bonne personne, mais regarde les lettres : « ${good.en} ».` },
      ],
      hint: `« ${mid}’s » veut dire « ${de(mid)} ». Trouve d’abord qui est ${mid}.`,
      steps: [
        `${mid} est le « ${first} » ${de(me)}. ${who} est le « ${second} » ${de(mid)}.`,
        `${who} est ${link.role} ${de(mid)} : pour ${me}, le mot français est « ${good.fr} ».`,
        `Réponse : **${good.en}**`,
      ],
    };
  },
};

// ——— 2. Have got ———

/** Sujet anglais, français, et forme de « have got » qui va avec. */
const SUBJECTS: readonly { readonly en: string; readonly has: 'have' | 'has' }[] = [
  { en: 'I', has: 'have' },
  { en: 'You', has: 'have' },
  { en: 'We', has: 'have' },
  { en: 'They', has: 'have' },
  { en: 'He', has: 'has' },
  { en: 'She', has: 'has' },
  { en: 'My sister', has: 'has' },
  { en: 'My brother', has: 'has' },
];
const OWNED = ['a rabbit', 'a skateboard', 'a new phone', 'brown eyes', 'long hair', 'a puppet', 'a cat', 'a bike'];
const SHORT: Readonly<Record<string, string>> = {
  I: 'I’ve',
  You: 'You’ve',
  We: 'We’ve',
  They: 'They’ve',
  He: 'He’s',
  She: 'She’s',
};
const wrongHave = (has: 'have' | 'has') => (has === 'have' ? 'has' : 'have');
const whyHave = (s: { en: string; has: string }) =>
  s.has === 'has'
    ? `Avec « ${s.en} » (il ou elle), on dit « has got ».`
    : `Avec « ${s.en} », on dit « have got ». « has » va avec he, she, it.`;

function haveGotWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const o = rng.pick(OWNED);
  return {
    prompt: `Complète avec « have » ou « has » : « ${s.en} … got ${o}. »`,
    answer: { kind: 'text', accepted: [s.has] },
    traps: [
      { text: wrongHave(s.has), why: whyHave(s) },
      { text: 'is', why: '« is » est le verbe « être ». Pour « avoir », on utilise have ou has.' },
      { text: 'got', why: 'Le mot « got » est déjà écrit. Il manque le petit mot devant.' },
    ],
    hint: 'Regarde le sujet. Peux-tu le remplacer par « he » ou « she » ?',
    steps: [
      s.has === 'has' ? `« ${s.en} » = une seule personne (he ou she).` : `Avec « ${s.en} », on prend « have ».`,
      `Réponse : **${s.has}**`,
    ],
  };
}

function haveGotShort(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS.filter((x) => SHORT[x.en]));
  const o = rng.pick(OWNED);
  const short = SHORT[s.en] ?? '';
  const good = `${short} got ${o}`;
  return {
    prompt: `Écris avec la forme courte : « ${s.en} ${s.has} got ${o}. »`,
    answer: { kind: 'text', accepted: full([good]) },
    traps: [
      {
        text: `${short.replace('’', '')} got ${o}.`,
        why: 'Il manque l’apostrophe : elle remplace les lettres enlevées.',
      },
      { text: `${s.en} got ${o}.`, why: `Il manque « ${s.has} » sous sa forme courte.` },
      { text: `${s.en}${s.has === 'has' ? '’ve' : '’s'} got ${o}.`, why: whyHave(s) },
    ],
    hint: 'Colle le sujet et le petit verbe. Une apostrophe prend la place des lettres enlevées.',
    steps: [`« ${s.en} ${s.has} » devient « ${short} ».`, `Réponse : **${good}.**`],
  };
}

function haveGotNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const o = rng.pick(['a dog', 'a bike', 'a skateboard', 'a rabbit']);
  const neg = s.has === 'has' ? 'hasn’t' : 'haven’t';
  const good = `${s.en} ${neg} got ${o}`;
  return {
    prompt: `Écris à la forme négative : « ${s.en} ${s.has} got ${o}. »`,
    answer: {
      kind: 'text',
      accepted: full([
        good,
        `${s.en} ${s.has} not got ${o}`,
        ...(SHORT[s.en] ? [`${SHORT[s.en] ?? ''} not got ${o}`] : []),
      ]),
    },
    traps: [
      { text: `${s.en} ${s.has === 'has' ? 'haven’t' : 'hasn’t'} got ${o}.`, why: whyHave(s) },
      { text: `${s.en} don’t got ${o}.`, why: 'Avec « have got », on ajoute « not » après have ou has.' },
      { text: `${s.en} ${s.has} got not ${o}.`, why: '« not » se place juste après have ou has.' },
    ],
    hint: 'Ajoute « not » juste après le premier petit verbe.',
    steps: [`On place « not » après « ${s.has} » : ${neg}.`, `Réponse : **${good}.**`],
  };
}

function haveGotOrder(rng: Rng): QuestionDraft {
  const [aux, subject] = rng.pick([
    ['Have', 'you'],
    ['Has', 'she'],
    ['Has', 'he'],
    ['Have', 'they'],
  ] as const);
  const o = rng.pick(['a skateboard', 'a rabbit', 'a bike', 'any pets']);
  const right = [aux, subject, 'got', o];
  const items = shuffledOther(rng, right);
  return {
    prompt: `Remets les mots dans l’ordre pour poser une question : ${items.join(' / ')} ?`,
    answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
    hint: 'Dans une question, le petit verbe passe devant la personne.',
    steps: [`Pour une question, « ${aux} » vient avant « ${subject} ».`, `Réponse : **${right.join(' ')} ?**`],
  };
}

const haveGot: Skill = {
  id: 'acm1-have-got',
  title: 'Have got : avoir',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Have got** veut dire « avoir » : pour tes objets, ta famille ou ton corps. I have got a sister.',
      'I, you, we, they + **have** got. He, she, it + **has** got. Forme courte : I’ve got, she’s got.',
      'Non : I haven’t got, she hasn’t got. Question : Have you got…? Has she got…? Réponse : Yes, I have. / No, she hasn’t.',
    ],
    source: source('Formes : British Council, LearnEnglish Kids, « Have got ».'),
    sources: ['cycle3-2020', 'bck-have-got'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1 || level === 2) {
      const s = rng.pick(level === 1 ? SUBJECTS.slice(0, 6) : SUBJECTS);
      const o = rng.pick(OWNED);
      if (level === 1) {
        const { answer, traps } = choice(rng, s.has, [
          { label: wrongHave(s.has), why: whyHave(s) },
          { label: 'is', why: '« is » est le verbe « être ». Pour « avoir », on prend have ou has.' },
        ]);
        return {
          prompt: `Complète : « ${s.en} … got ${o}. »`,
          answer,
          traps,
          hint: 'Peux-tu remplacer le sujet par « he » ou « she » ? Sinon, prends l’autre forme.',
          steps: [whyHave(s), `Réponse : **${s.has}**`],
        };
      }
      const good = `${s.has} got`;
      const { answer, traps } = choice(rng, good, [
        { label: `${wrongHave(s.has)} got`, why: whyHave(s) },
        { label: 'is got', why: '« is » est le verbe « être ». On ne dit jamais « is got ».' },
        { label: 'got', why: 'Il manque have ou has devant « got ».' },
      ]);
      return {
        prompt: `Quel groupe de mots complète « ${s.en} … ${o}. » ?`,
        answer,
        traps,
        hint: 'Il faut deux mots. Le premier dépend du sujet.',
        steps: [whyHave(s), `Réponse : **${good}**`],
      };
    }
    if (level === 3) return haveGotWrite(rng);
    if (level === 4) {
      const form = rng.int(0, 2);
      return form === 0 ? haveGotShort(rng) : form === 1 ? haveGotNegative(rng) : haveGotOrder(rng);
    }
    // Niveau 5 : lire deux messages, puis répondre à une question par une réponse courte.
    const [kid, he] = rng.pick([
      ['Emir', 'he'],
      ['Paul', 'he'],
      ['Ana', 'she'],
      ['Yuna', 'she'],
    ] as const);
    const [has, hasNot] = some(rng, ['dog', 'rabbit', 'bike', 'skateboard'], 2) as [string, string];
    const yes = rng.int(0, 1) === 0;
    const asked = yes ? has : hasNot;
    const good = yes ? `Yes, ${he} has` : `No, ${he} hasn’t`;
    const forms = yes ? [good, `Yes ${he} has`] : [good, `No ${he} hasn’t`, `No, ${he} has not`, `No ${he} has not`];
    const other = he === 'he' ? 'she' : 'he';
    const pronoun = he === 'he' ? 'He' : 'She';
    return {
      prompt: `Lis le message. Réponds en anglais par une réponse courte : « Has ${kid} got a ${asked}? »`,
      figure: {
        kind: 'document',
        title: `${kid}’s things`,
        lines: rng.shuffle([`${pronoun} has got a ${has}.`, `${pronoun} hasn’t got a ${hasNot}.`]),
        credit: 'Écrit pour l’exercice.',
      },
      answer: { kind: 'text', accepted: full(forms) },
      traps: [
        {
          text: yes ? `No, ${he} hasn’t.` : `Yes, ${he} has.`,
          why: `Relis la phrase avec « ${asked} » : y a-t-il « hasn’t » ?`,
        },
        {
          text: yes ? `Yes, ${he} is.` : `No, ${he} isn’t.`,
          why: 'La question commence par « Has » : réponds avec « has ».',
        },
        { text: yes ? `Yes, ${other} has.` : `No, ${other} hasn’t.`, why: `Pour ${kid}, on dit « ${he} ».` },
        { text: yes ? 'Yes' : 'No', why: 'Fais une réponse courte complète : Yes ou No, le pronom, puis have ou has.' },
      ],
      hint: 'Cherche la phrase qui parle de cet objet. Répète le verbe de la question dans ta réponse.',
      steps: [
        `On cherche « ${asked} » : « ${pronoun} ${yes ? 'has' : 'hasn’t'} got a ${asked}. »`,
        `La question commence par « Has » : on répond avec « ${yes ? 'has' : 'hasn’t'} ».`,
        `Réponse : **${good}.**`,
      ],
    };
  },
};

// ——— 3. Le corps ———

/** Mots à écrire : l’article est accepté (« la tête » → head, the head). */
const withArticle = (w: Word): Word => {
  // « les cheveux » : pas de « a hair » ; devant une voyelle, « an » (an eye, an ear, an arm).
  const one = w.en === 'hair' ? [] : [`${/^[aeiou]/.test(w.en) ? 'an' : 'a'} ${w.en}`];
  return { ...w, alt: [...(w.alt ?? []), `the ${w.en}`, ...one] };
};

const NUMBERS = ['two', 'three', 'four', 'five'] as const;

const body: Skill = {
  id: 'acm1-corps',
  title: 'Le corps',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le haut : head (tête), face (visage), eye (œil), ear (oreille), nose (nez), mouth (bouche), hair (cheveux), neck (cou).',
      'Le corps : arm (bras), hand (main), leg (jambe), foot (pied), knee (genou), back (dos).',
      'Au **pluriel** : eye → eyes. Attention aux surprises : foot → feet, tooth → teeth !',
    ],
    source: source('Mots : British Council, « Body flashcards », « Head flashcards » et chansons.'),
    sources: ['cycle3-2020', 'bck-flashcards-body', 'bck-flashcards-head', 'bck-song-trousers', 'bck-song-tooth'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        BODY.slice(0, 7),
        'le corps',
        'Touche cette partie de ton corps et pense au mot entendu en classe ou en chanson.',
      );
    if (level === 2) return understand(rng, BODY, 'le corps');
    if (level === 3) return write(rng, BODY.slice(0, 14).map(withArticle), 'le corps');
    if (level === 4) {
      if (rng.int(0, 2) === 0) return pairs(rng, BODY, 5);
      const p = rng.pick(PLURALS);
      return {
        prompt: `Écris le pluriel en anglais : « one ${p.one} » → « two … » (${p.fr}).`,
        answer: { kind: 'text', accepted: [p.many, `two ${p.many}`] },
        traps: p.wrong.map((w) => ({ text: w, why: `Le pluriel de « ${p.one} » est « ${p.many} ».` })),
        hint: 'Certains pluriels ajoutent un s. D’autres changent les lettres du milieu.',
        steps: [
          `Il y en a deux : on met « ${p.one} » au pluriel.`,
          p.many === `${p.one}s`
            ? 'Ce pluriel est régulier : on ajoute un s.'
            : 'Ce pluriel est irrégulier : les lettres du milieu changent, sans s.',
          `Réponse : **${p.many}**`,
        ],
      };
    }
    // Niveau 5 : un monstre imaginaire à décrire (have got + nombres).
    const parts = some(rng, ['eyes', 'arms', 'legs', 'ears'], 3);
    const nums = some(rng, [...NUMBERS], 3);
    const i = rng.int(0, 2);
    const asked = at(parts, i);
    const n = at(nums, i);
    const fr: Readonly<Record<string, string>> = {
      eyes: 'd’yeux',
      arms: 'de bras',
      legs: 'de jambes',
      ears: 'd’oreilles',
    };
    const otherIndex = (i + 1) % 3;
    const good = `It’s got ${n} ${asked}`;
    return {
      prompt: `Lis la fiche du monstre. Combien ${fr[asked] ?? ''} a-t-il ? Réponds en anglais : commence par « It’s got ».`,
      figure: {
        kind: 'document',
        title: 'My monster',
        lines: parts.map((p, j) => `My monster has got ${at(nums, j)} ${p}.`),
        credit: 'Écrit pour l’exercice.',
      },
      answer: { kind: 'text', accepted: full([good, `It has got ${n} ${asked}`]) },
      traps: [
        {
          text: `It’s got ${at(nums, otherIndex)} ${asked}.`,
          why: 'Ce nombre est écrit pour une autre partie du corps.',
        },
        {
          text: `It’s got ${n} ${at(parts, otherIndex)}.`,
          why: 'Le nombre est bon, mais pas la partie du corps demandée.',
        },
        { text: `${n} ${asked}`, why: 'Fais une phrase : commence par « It’s got ».' },
        { text: `It’s got ${n} ${asked.slice(0, -1)}.`, why: `Il y en a plusieurs : écris « ${asked} » avec un s.` },
      ],
      hint: 'Trouve la ligne qui parle de cette partie du corps. Recopie son nombre.',
      steps: [
        `La ligne dit : « My monster has got ${n} ${asked}. »`,
        'Dans la réponse, « it » remplace « my monster ». « It has got » devient « It’s got ».',
        `Réponse : **${good}.**`,
      ],
    };
  },
};

// ——— 4. Les vêtements ———

/** Vêtements au singulier (avec « a ») et au pluriel (sans « a »). */
const ONE_CLOTHES = ['t-shirt', 'skirt', 'dress', 'shirt', 'jumper', 'jacket', 'coat', 'cardigan'];
const MANY_CLOTHES = ['trousers', 'shorts', 'jeans', 'socks', 'shoes', 'trainers', 'boots', 'slippers', 'sandals'];
/** Couleurs sans « an » devant (orange écarté). */
const PLAIN_COLOURS = COLOURS.filter((c) => c.en !== 'orange' && c.en !== 'purple');

const clothes: Skill = {
  id: 'acm1-vetements',
  title: 'Les vêtements',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Les habits : jumper (pull), coat (manteau), skirt (jupe), dress (robe), shirt (chemise).',
      'Souvent au pluriel : trousers (pantalon), jeans, shorts, socks (chaussettes), shoes (chaussures).',
      'La couleur se place avant le nom : a red jumper. Au **pluriel**, sans « a » : red socks.',
    ],
    source: source('Mots : British Council, « Clothes flashcards » (séries 1 et 2) ; « Adjectives ».'),
    sources: ['cycle3-2020', 'bck-flashcards-clothes-1', 'bck-flashcards-clothes-2', 'bck-adjectives', 'bck-have-got'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        ['skirt', 'dress', 'jumper', 'socks', 'shoes', 'coat', 'jeans'].map((en) => word(CLOTHES, en)),
        'un vêtement',
        'Regarde tes habits. Quel mot anglais as-tu entendu pour celui-ci ?',
      );
    if (level === 2) {
      if (rng.int(0, 2) === 0) {
        const w = rng.pick(CLOTHES.slice(0, 8));
        const { answer, traps } = choice(
          rng,
          w.fr,
          others(rng, CLOTHES.slice(0, 8), w, 3).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
        );
        return {
          prompt: 'Écoute. De quel vêtement parle-t-on ?',
          audio: { text: `Look at my ${w.en}.`, lang: 'en-GB' },
          answer,
          traps,
          hint: 'Écoute bien le dernier mot de la phrase.',
          steps: [`On entend « Look at my ${w.en}. »`, `Réponse : **${w.fr}**`],
        };
      }
      return understand(rng, CLOTHES, 'un vêtement');
    }
    if (level === 3)
      return write(
        rng,
        CLOTHES.map((w) => (ONE_CLOTHES.includes(w.en) ? { ...w, alt: [`a ${w.en}`, ...(w.alt ?? [])] } : w)),
        'un vêtement',
      );
    if (level === 4) {
      const many = rng.int(0, 1) === 0;
      const w = word(CLOTHES, rng.pick(many ? MANY_CLOTHES : ONE_CLOTHES));
      const c = rng.pick(PLAIN_COLOURS);
      const good = many ? `${c.en} ${w.en}` : `a ${c.en} ${w.en}`;
      const forms = [c.en, ...(c.alt ?? [])].map((col) => (many ? `${col} ${w.en}` : `a ${col} ${w.en}`));
      const frPhrase = `${w.fr} de couleur « ${c.fr} »`;
      return {
        prompt: `Écris en anglais : ${frPhrase}${many ? ' (sans « a »)' : ' (avec « a »)'}.`,
        answer: { kind: 'text', accepted: full(forms) },
        traps: [
          {
            text: many ? `${w.en} ${c.en}` : `a ${w.en} ${c.en}`,
            why: 'En anglais, la couleur se place avant le nom.',
          },
          {
            text: many ? `a ${c.en} ${w.en}` : `${c.en} ${w.en}`,
            why: many ? `« ${w.en} » est au pluriel : pas de « a ».` : 'Il manque le petit mot « a » au début.',
          },
          ...(many ? [{ text: `${c.en}s ${w.en}`, why: 'Un adjectif anglais ne prend jamais de s.' }] : []),
        ],
        hint: 'Dans l’ordre : (a), la couleur, puis le vêtement.',
        steps: [
          `La couleur « ${c.fr} » se dit « ${c.en} », le vêtement « ${w.en} ».`,
          'La couleur se place avant le nom.',
          `Réponse : **${good}**`,
        ],
      };
    }
    // Niveau 5 : deux valises, un seul vêtement en commun.
    const [common, a, b, c, d] = some(rng, ['jumper', 'coat', 'skirt', 'dress', 'jacket', 'shirt', 'cardigan'], 5) as [
      string,
      string,
      string,
      string,
      string,
    ];
    const [first, second, third] = some(rng, ['Ana', 'Emir', 'Yuna', 'Paul', 'Lisa', 'Tom'], 3) as [
      string,
      string,
      string,
    ];
    const list = (x: string, y: string) => {
      const [p, q] = rng.shuffle([x, y]) as [string, string];
      return `a ${p} and a ${q}`;
    };
    const lines = rng.shuffle([
      `${first}: I’ve got ${list(common, a)}.`,
      `${second}: I’ve got ${list(common, b)}.`,
      `${third}: I’ve got ${list(c, d)}.`,
    ]);
    const w = word(CLOTHES, common);
    return {
      prompt: `Lis les messages. Quel vêtement trouve-t-on chez ${first} et aussi chez ${second} ? Écris-le en anglais avec « a ».`,
      figure: { kind: 'document', title: 'In my bag', lines, credit: 'Écrit pour l’exercice.' },
      answer: { kind: 'text', accepted: full([`a ${common}`]) },
      traps: [
        { text: common, why: 'Le bon vêtement ! Ajoute le petit mot « a » devant.' },
        { text: `a ${a}`, why: `Ce vêtement est écrit pour ${first}, mais pas pour ${second}.` },
        { text: `a ${b}`, why: `Ce vêtement est écrit pour ${second}, mais pas pour ${first}.` },
        { text: w.fr, why: 'C’est la traduction française. Écris le mot anglais.' },
      ],
      hint: 'Lis les deux lignes de ces enfants. Quel mot revient dans les deux ?',
      steps: [
        `${first} : « ${common} » et « ${a} ». ${second} : « ${common} » et « ${b} ».`,
        `Le vêtement commun est « ${common} » (${w.fr}).`,
        `Réponse : **a ${common}**`,
      ],
    };
  },
};

// ——— 5. Le génitif 's ———

const OWNERS: readonly { readonly en: string; readonly fr: string }[] = [
  { en: 'Tom', fr: 'de Tom' },
  { en: 'Lisa', fr: 'de Lisa' },
  { en: 'Ana', fr: 'd’Ana' },
  { en: 'Emir', fr: 'd’Emir' },
  { en: 'my sister', fr: 'de ma sœur' },
  { en: 'my brother', fr: 'de mon frère' },
  { en: 'my mum', fr: 'de ma mère' },
];
const THINGS: readonly { readonly en: string; readonly fr: string }[] = [
  { en: 'dog', fr: 'Le chien' },
  { en: 'cat', fr: 'Le chat' },
  { en: 'bike', fr: 'Le vélo' },
  { en: 'bag', fr: 'Le sac' },
  { en: 'jumper', fr: 'Le pull' },
  { en: 'coat', fr: 'Le manteau' },
];
const phrase = (owner: string, thing: string) => `${owner}’s ${thing}`;

/** Pluriels (réguliers et irréguliers) et deux propriétaires. */
const HARD: readonly {
  readonly fr: string;
  readonly good: readonly string[];
  /** Mots anglais donnés à l’élève (ordre alphabétique) : la question porte sur l’apostrophe. */
  readonly words: string;
  /** La règle qui explique la réponse. */
  readonly rule: string;
  readonly traps: readonly (readonly [string, string])[];
}[] = [
  {
    fr: 'La maison de mes parents',
    words: 'house, my, parents',
    good: ['my parents’ house'],
    rule: 'Le propriétaire est un pluriel qui finit par s : on ajoute seulement l’apostrophe.',
    traps: [
      ['my parents’s house', '« parents » finit déjà par s : ajoute seulement l’apostrophe.'],
      ['my parents house', 'Sans apostrophe, le s ne montre que le pluriel.'],
    ],
  },
  {
    fr: 'Le chien de mes grands-parents',
    words: 'dog, grandparents, my',
    good: ['my grandparents’ dog'],
    rule: 'Le propriétaire est un pluriel qui finit par s : on ajoute seulement l’apostrophe.',
    traps: [
      ['my grandparents’s dog', 'Pluriel en s : ajoute seulement l’apostrophe.'],
      ['my grandparents dog', 'Sans apostrophe, le s ne montre que le pluriel.'],
    ],
  },
  {
    fr: 'L’école de nos enfants',
    words: 'children, our, school',
    good: ['our children’s school'],
    rule: 'Le propriétaire est un pluriel sans s : on ajoute ’s.',
    traps: [
      ['our childrens’ school', '« children » est déjà un pluriel : écris « children’s ».'],
      ['our childrens school', 'Il faut une apostrophe : « children’s ».'],
    ],
  },
  {
    fr: 'Le fils d’Anne et Gary',
    words: 'and, Anne, Gary, son',
    good: ['Anne and Gary’s son'],
    rule: 'Il y a deux propriétaires ensemble : ’s va après le dernier nom.',
    traps: [
      ['Anne’s and Gary son', 'Pour deux propriétaires ensemble, ’s va après le dernier nom.'],
      ['Anne and Gary son', 'Il manque le ’s après le dernier nom.'],
    ],
  },
  {
    fr: 'La voiture de mes cousins',
    words: 'car, cousins, my',
    good: ['my cousins’ car'],
    rule: 'Le propriétaire est un pluriel qui finit par s : on ajoute seulement l’apostrophe.',
    traps: [
      ['my cousins’s car', '« cousins » finit déjà par s : ajoute seulement l’apostrophe.'],
      ['my cousins car', 'Sans apostrophe, le s ne montre que le pluriel.'],
    ],
  },
  {
    fr: 'Les chaussures des femmes',
    words: 'shoes, the, women',
    good: ['the women’s shoes', 'women’s shoes'],
    rule: 'Le propriétaire est un pluriel sans s : on ajoute ’s.',
    traps: [
      ['the womens’ shoes', '« women » est déjà un pluriel : écris « women’s ».'],
      ['the womens shoes', 'Il faut une apostrophe : « women’s ».'],
    ],
  },
  {
    fr: 'Le sac de James',
    words: 'bag, James',
    good: ['James’ bag', 'James’s bag'],
    rule: 'Le prénom finit par s : on peut ajouter l’apostrophe seule, ou ’s.',
    traps: [
      ['Jame’s bag', 'Le prénom est « James » : garde le s, puis ajoute l’apostrophe.'],
      ['James bag', 'Il manque l’apostrophe.'],
    ],
  },
];

const genitive: Skill = {
  id: 'acm1-genitif',
  title: 'Le génitif ’s',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour dire à qui est une chose, on utilise le **génitif** : le propriétaire, puis **’s**, puis la chose.',
      'Exemple : Tom’s dog (le chien de Tom). Pluriel en s : my parents’ house. Pluriel sans s : children’s.',
      'Prénom en s : James’ bag ou James’s bag. Deux propriétaires ensemble : Anne and Gary’s son.',
    ],
    source: source('Règles : British Council, LearnEnglish, « Possessive ’s » et « Possessives: nouns ».'),
    sources: ['cycle3-2020', 'bc-possessive-s', 'bc-possessives-nouns'],
  },
  generate: (rng, level): QuestionDraft => {
    const owner = rng.pick(level === 1 ? OWNERS.slice(0, 4) : OWNERS);
    const thing = rng.pick(THINGS);
    const good = phrase(owner.en, thing.en);
    const fr = `${thing.fr} ${owner.fr}`;
    if (level === 1 || level === 2) {
      const wrong = [
        { label: `${thing.en}’s ${owner.en}`, why: 'Ordre inversé : le propriétaire vient en premier.' },
        { label: `${owner.en}s ${thing.en}`, why: 'Sans apostrophe, le s ne montre pas à qui est la chose.' },
        ...(level === 2 ? [{ label: `${owner.en} ${thing.en}`, why: 'Il manque le ’s après le propriétaire.' }] : []),
      ];
      const { answer, traps } = choice(rng, good, wrong);
      return {
        prompt: `Comment dit-on « ${fr} » en anglais ?`,
        answer,
        traps,
        hint: 'Qui possède ? Il se place en premier, avec un petit signe et une lettre.',
        steps: [
          `Le propriétaire est « ${owner.en} » : il vient d’abord, avec ’s.`,
          `Puis la chose : « ${thing.en} ».`,
          `Réponse : **${good}**`,
        ],
      };
    }
    if (level === 3)
      return {
        prompt: `Écris en anglais, avec ’s : « ${fr} ».`,
        answer: { kind: 'text', accepted: full([good]) },
        traps: [
          { text: `${owner.en}s ${thing.en}`, why: 'Il manque l’apostrophe avant le s.' },
          { text: `${owner.en} ${thing.en}`, why: 'Il manque le ’s après le propriétaire.' },
          { text: `${thing.en}’s ${owner.en}`, why: 'Ordre inversé : le propriétaire vient en premier.' },
        ],
        hint: 'Commence par le propriétaire. Ajoute l’apostrophe et un s. Termine par la chose.',
        steps: [`Propriétaire : « ${owner.en}’s ».`, `Chose : « ${thing.en} ».`, `Réponse : **${good}**`],
      };
    if (level === 4) {
      const h = rng.pick(HARD);
      const answer = at(h.good, 0);
      return {
        prompt: `Écris en anglais, avec l’apostrophe : « ${h.fr} ». Mots à utiliser : ${h.words}.`,
        answer: { kind: 'text', accepted: full(h.good) },
        traps: h.traps.map(([text, why]) => ({ text, why })),
        hint: 'Le propriétaire finit-il par un s ? Est-ce un seul nom ou plusieurs ?',
        steps: [
          'On cherche le propriétaire, puis on regarde comment son nom finit.',
          h.rule,
          `Réponse : **${answer}**`,
        ],
      };
    }
    // Niveau 5 : lire des messages, puis trouver le propriétaire (liens de famille).
    const [rel, relFr, names] = rng.pick([
      ['sister', 'la sœur', FEMALE],
      ['brother', 'le frère', MALE],
      ['cousin', 'le cousin ou la cousine', [...FEMALE, ...MALE]],
    ] as const);
    const sibling = rng.pick(names);
    const [boss, third] = some(
      rng,
      [...FEMALE, ...MALE].filter((n) => n !== sibling),
      2,
    ) as [string, string];
    const [g1, g2] = some(rng, ['jumper', 'coat', 'bag', 'bike'], 2) as [string, string];
    const [c1, c2] = some(rng, ['red', 'blue', 'green', 'black'], 2) as [string, string];
    const lines = [
      `${boss}’s ${rel} has got a ${c1} ${g1}.`,
      `${boss}’s ${rel} is ${sibling}.`,
      `${third} has got a ${c2} ${g2}.`,
    ];
    const phraseGood = `${sibling}’s ${g1}`;
    return {
      prompt: `Lis le texte. À qui est « the ${c1} ${g1} » ? Écris en anglais : le prénom, ’s, puis « ${g1} ».`,
      figure: { kind: 'document', title: 'Whose is it?', lines, credit: 'Écrit pour l’exercice.' },
      answer: { kind: 'text', accepted: full([phraseGood, `It’s ${phraseGood}`, `It is ${phraseGood}`]) },
      traps: [
        { text: `${boss}’s ${g1}`, why: `Ce n’est pas ${boss} : la phrase parle de « ${boss}’s ${rel} ».` },
        { text: `${third}’s ${g1}`, why: `${third} a un autre objet.` },
        { text: `${sibling}s ${g1}`, why: 'Il manque l’apostrophe avant le s.' },
        { text: `${g1}’s ${sibling}`, why: 'Ordre inversé : le propriétaire vient en premier.' },
      ],
      hint: 'Cherche qui a cet objet. Puis trouve le prénom de cette personne.',
      steps: [
        `« ${boss}’s ${rel} » veut dire « ${relFr} ${de(boss)} » : c’est ${sibling}.`,
        `Donc l’objet « ${c1} ${g1} » est à ${sibling}.`,
        `Réponse : **${phraseGood}**`,
      ],
    };
  },
};

export const ENGLISH_FAMILY_CHAPTER: Chapter = {
  id: 'acm1-famille-corps',
  subject: 'anglais',
  grade: 'cm1',
  domain: 'langue',
  title: 'Famille, corps, vêtements',
  skills: [family, haveGot, body, clothes, genitive],
};
