import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Le peuplement d'un milieu : répartition des êtres vivants et facteurs du milieu (programme du cycle 3) ———
// Tous les relevés sont inventés : la question se résout avec les seules données de l'énoncé.

type Facteur = 'temperature' | 'ensoleillement' | 'humidite';

interface Fiche {
  readonly nom: string;
  readonly accepte: readonly string[];
  readonly outil: string;
  /** Deux valeurs observées, bien différentes. */
  readonly bas: string;
  readonly haut: string;
}

const FACTEURS: Record<Facteur, Fiche> = {
  temperature: {
    nom: 'la température',
    accepte: ['température', 'la température', 'temperature', 'la temperature'],
    outil: 'On lit 12 degrés sur un thermomètre.',
    bas: 'il fait 12 degrés',
    haut: 'il fait 25 degrés',
  },
  ensoleillement: {
    nom: 'l’ensoleillement',
    accepte: ['ensoleillement', 'l’ensoleillement', 'lensoleillement'],
    outil: 'On note que le soleil éclaire l’endroit 6 heures par jour.',
    bas: 'le soleil éclaire l’endroit 1 heure par jour',
    haut: 'le soleil éclaire l’endroit 8 heures par jour',
  },
  humidite: {
    nom: 'l’humidité',
    accepte: ['humidité', 'l’humidité', 'humidite', 'l’humidite'],
    outil: 'On touche le sol : il est tout mouillé.',
    bas: 'le sol est sec',
    haut: 'le sol est mouillé',
  },
};
const CLES = Object.keys(FACTEURS) as Facteur[];

const LIEUX = [
  ['au pied du mur nord', 'au pied du mur sud'],
  ['sous le grand arbre', 'au milieu de la cour'],
  ['près de la mare', 'en haut du talus'],
  ['dans le coin A du jardin', 'dans le coin B du jardin'],
] as const;

const ETRES = ['des cloportes', 'des escargots', 'des fourmis', 'des vers de terre', 'des pâquerettes'] as const;

/** « des escargots » → « d’escargots », « de fourmis ». */
const de = (nom: string) => (/^[aeiouyéè]/.test(nom) ? `d’${nom}` : `de ${nom}`);

/**
 * Valeur du facteur où l'on compte le plus d'individus, pour chaque couple (être, facteur) utilisé dans les relevés
 * chiffrés. Un couple absent n'est jamais tiré.
 */
type Valeur = 'bas' | 'haut';
const ABRITE: Readonly<Record<Facteur, Valeur>> = { temperature: 'bas', ensoleillement: 'bas', humidite: 'haut' };
const PREFERENCES = {
  cloportes: ABRITE,
  escargots: ABRITE,
  'vers de terre': ABRITE,
  pâquerettes: { ensoleillement: 'haut' },
} as const satisfies Record<string, Partial<Record<Facteur, Valeur>>>;
const contraire = (v: Valeur): Valeur => (v === 'bas' ? 'haut' : 'bas');

/** Deux endroits et leur valeur ; pour l'humidité, le premier lieu (nord, arbre, mare) est le plus mouillé. */
const deuxEndroits = (f: Facteur, [a, b]: readonly [string, string]) => {
  const [v, w] = f === 'humidite' ? [FACTEURS[f].haut, FACTEURS[f].bas] : [FACTEURS[f].bas, FACTEURS[f].haut];
  return `${maj(a)}, ${v}. ${maj(b)}, ${w}.`;
};

const autre = (f: Facteur) => CLES.filter((x) => x !== f);
const faux = (x: Facteur) => ({
  label: FACTEURS[x].nom,
  why: `Ici, ${FACTEURS[x].nom} n’est pas ce qui change : relis les deux endroits.`,
});

const niveau1 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(CLES);
  const lieux = rng.pick(LIEUX);
  const { answer, traps: tr } = choice(rng, FACTEURS[f].nom, autre(f).map(faux));
  return {
    prompt: `${deuxEndroits(f, lieux)} Qu’est-ce qui est différent ?`,
    answer,
    traps: tr,
    hint: 'Compare les deux phrases : parlent-elles de chaleur, de soleil ou d’eau ?',
    steps: ['On compare deux endroits proches.', `La phrase change sur un seul point : **${FACTEURS[f].nom}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cles = rng.shuffle(CLES);
    return {
      prompt: `Associe chaque observation à ce qu’elle nous apprend : ${cles.map((f) => FACTEURS[f].outil).join(' ')}`,
      answer: association(
        rng,
        cles.map((f) => [FACTEURS[f].outil, maj(FACTEURS[f].nom)] as const),
      ),
      hint: 'Pour chaque phrase, demande-toi : chaleur, soleil ou eau ?',
      steps: [
        'Chaque observation renseigne sur un seul facteur du milieu.',
        'Chaque phrase est reliée à **son** facteur.',
      ],
      targetSeconds: 45,
    };
  }
  const f = rng.pick(CLES);
  const etre = rng.pick(ETRES);
  const { answer, traps: tr } = choice(rng, FACTEURS[f].nom, [
    ...autre(f).map(faux),
    {
      label: `la présence ${de(etre.replace('des ', ''))}`,
      why: 'C’est ce qu’on compte, pas un facteur physique du milieu.',
    },
  ]);
  return {
    prompt: `On compte ${etre} à deux endroits. Dans l’un, ${FACTEURS[f].bas} ; dans l’autre, ${FACTEURS[f].haut}. Quel facteur du milieu compare-t-on ?`,
    answer,
    traps: tr,
    hint: 'Le facteur du milieu, c’est ce qui n’est pas vivant et qui change.',
    steps: [
      'On sépare les êtres vivants comptés et les facteurs du milieu.',
      `Le facteur comparé : **${FACTEURS[f].nom}**.`,
    ],
    targetSeconds: 40,
  };
};

const ETAPES = [
  'Choisir deux milieux proches',
  'Mesurer un facteur et compter les êtres vivants dans chaque milieu',
  'Comparer et relier le facteur à la répartition',
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const etre = rng.pick(ETRES);
    return {
      prompt: `Tu veux savoir où vivent ${etre} près de l’école. Remets l’enquête dans l’ordre.`,
      answer: ordre(rng, ETAPES),
      hint: 'On choisit les endroits, puis on fait le relevé, et on conclut à la fin.',
      steps: ['On observe, on mesure, puis on compare.', `Ordre : **${ETAPES.join(' → ')}**.`],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Complète la phrase sur le peuplement d’un milieu.',
      answer: {
        kind: 'cloze',
        parts: ['La répartition des êtres ', ' peut changer avec la température, l’', ' ou l’humidité.'],
        blanks: [
          { mode: 'text', accepted: ['vivants'] },
          { mode: 'text', accepted: ['ensoleillement'] },
        ],
      },
      hint: 'Le second mot vient du mot « soleil ».',
      steps: [
        'La répartition des êtres vivants dépend de facteurs du milieu.',
        'On écrit **vivants** et **ensoleillement**.',
      ],
      targetSeconds: 40,
    };
  }
  const f = rng.pick(CLES);
  const lieux = rng.pick(LIEUX);
  const { answer, traps: tr } = saisie(
    FACTEURS[f].accepte,
    autre(f).map((x) => [FACTEURS[x].accepte[0] ?? '', faux(x).why] as const),
  );
  return {
    prompt: `${deuxEndroits(f, lieux)} Écris le nom du facteur qui change.`,
    answer,
    traps: tr,
    hint: 'Pense aux trois facteurs du mémo.',
    steps: ['On cherche le point qui diffère.', `Le facteur qui change est **${FACTEURS[f].nom}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const f = rng.pick(CLES);
    const [x, y] = autre(f) as [Facteur, Facteur];
    const etre = rng.pick(
      (Object.keys(PREFERENCES) as (keyof typeof PREFERENCES)[]).filter((e) => f in PREFERENCES[e]),
    );
    const favorable: Valeur = (PREFERENCES[etre] as Partial<Record<Facteur, Valeur>>)[f] ?? 'haut';
    const peu = rng.pick([1, 2, 3]);
    const beaucoup = rng.pick([11, 13, 16]);
    const meme = rng.pick([`${FACTEURS[x].bas} et ${FACTEURS[y].haut}`, `${FACTEURS[x].haut} et ${FACTEURS[y].bas}`]);
    const { answer, traps: tr } = saisie(
      FACTEURS[f].accepte,
      [x, y].map((k) => [FACTEURS[k].accepte[0] ?? '', `Ce point est pareil aux deux endroits : ${meme}.`] as const),
    );
    return {
      prompt: `Zone A : ${meme} ; ${FACTEURS[f][contraire(favorable)]} ; des ${etre} : ${peu}. Zone B : ${meme} ; ${FACTEURS[f][favorable]} ; des ${etre} : ${beaucoup}. Quel facteur peut expliquer l’écart ? Écris-le.`,
      answer,
      traps: tr,
      hint: 'Barre ce qui est pareil dans les deux zones.',
      steps: ['On cherche la seule différence entre les deux zones.', `Seul ce point change : **${FACTEURS[f].nom}**.`],
      targetSeconds: 60,
    };
  }
  const paires = [
    ['Un thermomètre affiche 18 degrés', 'La température'],
    ['Le sol est tout mouillé', 'L’humidité'],
    ['La zone reste à l’ombre toute la journée', 'L’ensoleillement'],
    ['Un escargot avance sur une pierre', 'Un animal du milieu'],
    ['Une fougère pousse au bord du chemin', 'Un végétal du milieu'],
  ] as const;
  const choisies = rng.shuffle(paires);
  return {
    prompt: `Tu fais un relevé : associe chaque note à sa catégorie (${choisies.map((p) => p[0]).join(' ; ')}).`,
    answer: association(rng, choisies),
    hint: 'Sépare d’abord les êtres vivants des facteurs du milieu.',
    steps: ['Un milieu a des êtres vivants et des facteurs physiques.', 'Chaque note est reliée à **sa** catégorie.'],
    targetSeconds: 70,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const etre = rng.pick(['cloportes', 'escargots', 'vers de terre'] as const);
  const f = rng.pick(CLES);
  const favorable = PREFERENCES[etre][f];
  const plus = FACTEURS[f][favorable];
  const moins = FACTEURS[f][contraire(favorable)];
  const [x, y] = autre(f) as [Facteur, Facteur];
  const a = rng.int(2, 6);
  const b = a + rng.int(6, 12);
  const meme = `${FACTEURS[x].bas} ; ${FACTEURS[y].haut}`;
  const figure = {
    kind: 'document' as const,
    title: 'Relevé de sortie (exemple inventé)',
    lines: [
      `Zone A : ${meme} ; ${moins}. Nombre ${de(etre)} : ${a}.`,
      `Zone B : ${meme} ; ${plus}. Nombre ${de(etre)} : ${b}.`,
      `Zone C : ${FACTEURS[x].haut} ; ${FACTEURS[y].bas} ; ${plus}. Nombre ${de(etre)} : ${rng.int(0, 20)}.`,
      'Chaque zone a la même taille. Les comptages sont faits le même jour.',
    ],
  };
  const sujet = `Lis le relevé sur les ${etre} (zone A : ${a}, zone B : ${b}).`;
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: `${sujet} Combien ${de(etre)} de plus compte-t-on en zone B qu’en zone A ?`,
      figure,
      answer: num(b - a),
      traps: traps(r(b - a), [
        [a + b, 'On cherche l’écart entre deux zones : il faut soustraire.'],
        [b, 'C’est le nombre de la zone B. Retire celui de la zone A.'],
      ]),
      hint: 'Fais une soustraction avec les nombres des zones A et B.',
      steps: [`${b} − ${a}.`, `En zone B, on compte **${b - a}** ${etre} de plus.`],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    const bon = 'A et B';
    const { answer, traps: tr } = choice(rng, bon, [
      { label: 'A et C', why: 'Entre A et C, plusieurs facteurs changent à la fois : on ne sait pas lequel compte.' },
      { label: 'B et C', why: 'Entre B et C, deux facteurs changent : on ne peut pas séparer leurs effets.' },
    ]);
    return {
      prompt: `${sujet} Quelles zones faut-il comparer pour étudier seulement ${FACTEURS[f].nom} ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Une bonne comparaison ne change qu’un seul facteur.',
      steps: [
        'Pour étudier un facteur, il doit être le seul à changer.',
        `Entre les zones **${bon}**, seul le facteur étudié change.`,
      ],
      targetSeconds: 60,
    };
  }
  const bon = `Entre les zones A et B, il y a plus ${de(etre)} là où ${plus}.`;
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: `Entre les zones A et B, il y a plus ${de(etre)} là où ${moins}.`,
      why: `Compare les nombres : la zone A en a ${a}, la zone B en a ${b}.`,
    },
    {
      label: `${maj(FACTEURS[x].nom)} explique l’écart entre A et B.`,
      why: 'Ce facteur est pareil en A et en B : il ne peut pas expliquer la différence.',
    },
    {
      label: `Partout sur la Terre, les ${etre} ne vivent que là où ${plus}.`,
      why: 'Un seul relevé sur deux petites zones ne permet pas de généraliser à toute la Terre.',
    },
  ]);
  return {
    prompt: `${sujet} Quelle conclusion est la plus juste en comparant A et B ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Reste prudent : dis seulement ce que ce relevé montre.',
    steps: ['On compare les zones A et B, où un seul facteur change.', `Conclusion : **${bon}**`],
    targetSeconds: 70,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const peuplement: Skill = {
  id: 'vcm2-peuplement',
  title: 'Le peuplement d’un milieu',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **milieu de vie** abrite des êtres vivants. Leur **répartition** change d’un endroit à l’autre.',
      'Pour comprendre pourquoi, mesure un **facteur du milieu** : la température, l’**ensoleillement** ou l’**humidité**. Puis compare deux endroits proches !',
    ],
    source: `${PROGRAMME} : « Comparer, à partir d’observations ou d’expériences, la répartition des êtres vivants dans des milieux proches pour relier les facteurs abiotiques (physico-chimiques) et cette répartition » ; « Temps pendant lequel un lieu est ensoleillé » (Académie française) ; « vit dans les lieux sombres et humides » (cloporte, Académie française) ; « vit en milieu humide » (lombric, TLFi).`,
    sources: [PROGRAMME, 'academie-ensoleillement', 'academie-humidite', 'academie-cloporte', 'cnrtl-lombric'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
