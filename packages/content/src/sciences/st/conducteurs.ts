import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Conducteurs et isolants électriques (programme : « fin de sixième ») ———

interface Objet {
  readonly nom: string;
  readonly conducteur: boolean;
  readonly why: string;
}

const conducteur = (nom: string, why: string): Objet => ({ nom, conducteur: true, why });
const isolant = (nom: string, why: string): Objet => ({ nom, conducteur: false, why });

const CONDUCTEURS: readonly Objet[] = [
  conducteur('un fil de cuivre', 'Le cuivre est un métal bon conducteur de l’électricité.'),
  conducteur('une cuillère en argent', 'L’argent est un métal bon conducteur de l’électricité.'),
  conducteur('un clou en fer', 'Le fer est un métal : les métaux sont généralement bons conducteurs.'),
  conducteur('une plaque d’aluminium', 'L’aluminium est un métal : les métaux sont généralement bons conducteurs.'),
];
const ISOLANTS: readonly Objet[] = [
  isolant('une tige de verre', 'Le verre s’oppose au passage du courant : c’est un isolant.'),
  isolant('une pièce en porcelaine', 'La porcelaine sert à faire des isolateurs : elle isole.'),
  isolant('une feuille de mica', 'Le mica est un minéral isolant.'),
  isolant('une pièce en bakélite', 'La bakélite est une matière plastique utilisée comme isolant.'),
];
const TOUS = [...CONDUCTEURS, ...ISOLANTS];
const MOT = (o: Objet) => (o.conducteur ? 'conducteur' : 'isolant');
const AUTRE = (o: Objet) => (o.conducteur ? 'isolant' : 'conducteur');

const niveau1 = (rng: Rng): QuestionDraft => {
  const cherche = rng.int(0, 1) === 0;
  const bon = rng.pick(cherche ? CONDUCTEURS : ISOLANTS);
  const faux = rng.shuffle(cherche ? ISOLANTS : CONDUCTEURS).slice(0, 2);
  const { answer, traps: tr } = choice(
    rng,
    bon.nom,
    faux.map((f) => ({ label: f.nom, why: f.why })),
  );
  return {
    prompt: `Lequel de ces objets est ${cherche ? 'conducteur' : 'isolant'} ?`,
    answer,
    traps: tr,
    hint: cherche
      ? 'Le courant passe facilement dans une certaine famille de matériaux.'
      : 'Pense au matériau de chaque objet : lequel empêche le courant de passer ?',
    steps: ['Un conducteur laisse passer le courant ; un isolant s’y oppose.', bon.why, `Réponse : **${bon.nom}**.`],
    targetSeconds: 20,
  };
};

const DEFINITIONS = [
  {
    q: 'Que fait un matériau conducteur ?',
    bon: 'il peut être parcouru par le courant électrique',
    faux: [
      ['il s’oppose au passage du courant', 'S’opposer au courant, c’est le rôle d’un isolant.'],
      ['il fournit lui-même l’énergie électrique', 'Fournir l’énergie, c’est le rôle d’un générateur, comme la pile.'],
      ['il coupe le circuit en cas d’anomalie', 'Couper en cas d’anomalie, c’est le rôle d’un disjoncteur.'],
    ],
  },
  {
    q: 'Que fait un matériau isolant ?',
    bon: 'il s’oppose au passage du courant électrique',
    faux: [
      ['il laisse facilement passer le courant', 'Laisser passer le courant, c’est le rôle d’un conducteur.'],
      ['il transforme le courant en mouvement', 'Transformer le courant en mouvement, c’est le rôle d’un moteur.'],
      [
        'il fabrique du courant avec la lumière',
        'Fabriquer du courant avec la lumière, c’est le rôle d’une photopile.',
      ],
    ],
  },
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const d = rng.pick(DEFINITIONS);
    const { answer, traps: tr } = choice(
      rng,
      d.bon,
      d.faux.map(([label, why]) => ({ label, why })),
    );
    return {
      prompt: d.q,
      answer,
      traps: tr,
      hint: 'Pense à ce que fait le courant quand il rencontre ce matériau.',
      steps: [
        'On cherche le rôle du matériau face au courant.',
        'Conducteur : il passe. Isolant : il bloque.',
        `**${maj(d.bon)}**.`,
      ],
      targetSeconds: 30,
    };
  }
  const intrus = rng.int(0, 1) === 0;
  const bon = rng.pick(intrus ? ISOLANTS : CONDUCTEURS);
  const faux = rng.shuffle(intrus ? CONDUCTEURS : ISOLANTS).slice(0, 3);
  const { answer, traps: tr } = choice(
    rng,
    bon.nom,
    faux.map((f) => ({ label: f.nom, why: f.why })),
  );
  return {
    prompt: `Trouve l’intrus : un seul de ces quatre objets est ${intrus ? 'isolant' : 'conducteur'}. Lequel ?`,
    answer,
    traps: tr,
    hint: 'Regarde le matériau de chaque objet, pas sa forme.',
    steps: ['On examine le matériau de chaque objet.', bon.why, `L’intrus est **${bon.nom}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const o = rng.pick(TOUS);
  if (rng.int(0, 1) === 0) {
    const { answer, traps: tr } = saisie([MOT(o), `un ${MOT(o)}`], [[AUTRE(o), o.why]]);
    return {
      prompt: `Écris « conducteur » ou « isolant » : ${o.nom}, c’est un objet …`,
      answer,
      traps: tr,
      hint: 'Demande-toi de quel matériau est fait l’objet.',
      steps: ['On repère le matériau.', o.why, `C’est un objet **${MOT(o)}**.`],
      targetSeconds: 25,
    };
  }
  const allume = o.conducteur ? 's’allume' : 'reste éteinte';
  const { answer, traps: tr } = choice(rng, `la lampe ${allume}`, [
    { label: `la lampe ${o.conducteur ? 'reste éteinte' : 's’allume'}`, why: o.why },
  ]);
  return {
    prompt: `Dans un circuit avec une pile et une lampe, on place ${o.nom} entre les deux pinces. Que se passe-t-il ?`,
    answer,
    traps: tr,
    hint: 'La lampe brille seulement si le courant traverse l’objet.',
    steps: [o.why, `Le circuit est ${o.conducteur ? 'fermé' : 'coupé'} : **la lampe ${allume}**.`],
    targetSeconds: 30,
  };
};

const PAIRES: readonly (readonly [string, string])[] = [
  ['un conducteur', 'il peut être parcouru par le courant'],
  ['un isolant', 'il s’oppose au passage du courant'],
  ['la gaine d’un fil', 'l’enveloppe isolante qui entoure le fil'],
  ['le cuivre', 'un métal bon conducteur'],
  ['la porcelaine', 'un matériau des isolateurs'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Relie chaque mot à ce qui le décrit.',
      answer: association(rng, PAIRES),
      hint: 'Commence par les deux familles : celle qui laisse passer et celle qui bloque.',
      steps: [
        'La gaine enveloppe le fil ; le cuivre est un métal ; la porcelaine isole.',
        'Chaque mot est relié à **sa** description.',
      ],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const objets = rng.shuffle([...rng.shuffle(CONDUCTEURS).slice(0, 2), ...rng.shuffle(ISOLANTS).slice(0, 2)]);
    return {
      prompt: `Classe chaque objet : ${objets.map((o) => o.nom).join(', ')}.`,
      answer: {
        kind: 'cloze',
        parts: [...objets.map((o, i) => `${i === 0 ? '' : ' ; '}${maj(o.nom)} : `), '.'],
        blanks: objets.map((o) => ({
          mode: 'list' as const,
          options: ['conducteur', 'isolant'],
          correct: o.conducteur ? 0 : 1,
        })),
      },
      hint: 'Repère d’abord les métaux.',
      steps: [
        'Les métaux sont généralement conducteurs.',
        'Verre, porcelaine, mica et bakélite sont isolants.',
        `Classement : **${objets.map((o) => `${o.nom} (${MOT(o)})`).join(', ')}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const q = rng.pick([
    {
      prompt: 'Comment s’appelle un matériau qui s’oppose au passage du courant électrique ?',
      bon: ['isolant', 'un isolant', 'matériau isolant', 'un matériau isolant'],
      faux: [
        ['conducteur', 'Un conducteur fait le contraire : le courant le parcourt.'],
        ['un conducteur', 'Un conducteur fait le contraire : le courant le parcourt.'],
      ],
      why: 'Un isolant bloque le courant.',
      reponse: 'un isolant',
    },
    {
      prompt: 'Comment s’appelle un matériau qui peut être parcouru par le courant électrique ?',
      bon: ['conducteur', 'un conducteur', 'matériau conducteur', 'un matériau conducteur'],
      faux: [
        ['isolant', 'Un isolant fait le contraire : il bloque le courant.'],
        ['un isolant', 'Un isolant fait le contraire : il bloque le courant.'],
      ],
      why: 'Un conducteur laisse passer le courant.',
      reponse: 'un conducteur',
    },
    {
      prompt: 'Comment s’appelle l’enveloppe isolante qui entoure un fil électrique ?',
      bon: ['gaine', 'la gaine', 'une gaine', 'gaine isolante', 'la gaine isolante', 'une gaine isolante'],
      faux: [
        ['isolateur', 'Un isolateur est une pièce qui soutient un conducteur ; l’enveloppe du fil est la gaine.'],
        ['pile', 'La pile fournit l’énergie électrique ; ce n’est pas une enveloppe.'],
      ],
      why: 'La gaine empêche de toucher directement le métal du fil.',
      reponse: 'la gaine',
    },
  ] as const);
  const { answer, traps: tr } = saisie(q.bon, q.faux);
  return {
    prompt: q.prompt,
    answer,
    traps: tr,
    hint: 'Pense à ce que le courant peut, ou ne peut pas, traverser.',
    steps: [q.why, `C’est **${q.reponse}**.`],
    targetSeconds: 30,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const nbOui = rng.int(1, 3);
  const objets = rng.shuffle([
    ...rng.shuffle(CONDUCTEURS).slice(0, nbOui),
    ...rng.shuffle(ISOLANTS).slice(0, 4 - nbOui),
  ]);
  const figure = {
    kind: 'document' as const,
    title: 'Le testeur de la classe',
    lines: [
      'Notre circuit : une pile, une lampe, des fils et deux pinces.',
      'On ferme le circuit en plaçant un objet entre les pinces.',
      ...objets.map((o, i) => `Essai ${i + 1} : ${o.nom}.`),
    ],
  };
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Lis le compte rendu. Dans combien d’essais la lampe s’allume-t-elle ?',
      figure,
      answer: num(nbOui),
      traps: traps(r(nbOui), [
        [objets.length, 'Tu as compté tous les essais. Avec un isolant, le courant ne passe pas.'],
        [objets.length - nbOui, 'C’est le nombre d’essais où la lampe reste éteinte.'],
      ]),
      hint: 'La lampe brille quand l’objet est conducteur. Cherche les métaux.',
      steps: [
        'La lampe s’allume si le courant traverse l’objet : il faut un conducteur.',
        `Conducteurs : ${objets
          .filter((o) => o.conducteur)
          .map((o) => o.nom)
          .join(', ')}.`,
        `Elle s’allume dans **${nbOui}** ${nbOui > 1 ? 'essais' : 'essai'}.`,
      ],
      targetSeconds: 60,
    };
  }
  const cible = rng.int(0, objets.length - 1);
  const o = objets[cible] ?? rng.pick(TOUS);
  const bon = `la lampe ${o.conducteur ? 's’allume' : 'reste éteinte'}, car l’objet est ${MOT(o)}`;
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: `la lampe ${o.conducteur ? 'reste éteinte' : 's’allume'}, car l’objet est ${AUTRE(o)}`,
      why: o.why,
    },
    {
      label: `la lampe ${o.conducteur ? 'reste éteinte' : 's’allume'}, car l’objet est ${MOT(o)}`,
      why: `La conclusion ne suit pas : un objet ${MOT(o)} ${o.conducteur ? 'laisse passer' : 'bloque'} le courant.`,
    },
  ]);
  return {
    prompt: `Lis le compte rendu. Que prévois-tu à l’essai ${cible + 1} ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Retrouve l’objet de cet essai, puis son matériau.',
    steps: [`À cet essai, on place ${o.nom}.`, o.why, `**${maj(bon)}**.`],
    targetSeconds: 55,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const conducteurs: Skill = {
  id: 'p6-conducteurs-isolants',
  title: 'Conducteurs et isolants',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **conducteur** peut être parcouru par le courant électrique : le cuivre, le fer, l’aluminium et l’argent sont des métaux, généralement bons conducteurs.',
      'Un **isolant** s’oppose au passage du courant : le verre, la porcelaine ou la **gaine** en plastique d’un fil. Dans un circuit, la lampe ne brille que si l’objet testé conduit.',
    ],
    source: `${PROGRAMME} : « comparer et trier différents matériaux sur la base de leurs propriétés physiques (conductivité thermique ou électrique, capacité à interagir avec un aimant) ». Académie française : conducteur, « Susceptible d’être parcouru par le courant électrique ou de transférer la chaleur » ; métal, « généralement bon conducteur de la chaleur et de l’électricité. Le fer, le cuivre […] sont des métaux » ; isoler, « séparer par un isolant des conducteurs ». CNRTL : isolant, « Corps, matériau qui s’oppose au passage du courant électrique » ; « Le verre est considéré depuis longtemps comme un bon diélectrique » ; isolateurs « en porcelaine » ; mica, « isolantes » ; bakélite, « matière plastique, utilisée comme isolant » ; gaine, « Enveloppe isolante d’un fil, d’un câble » ; aluminium, « Métal blanc, très léger ».`,
    sources: [
      PROGRAMME,
      'academie-conducteur',
      'academie-metal',
      'academie-cuivre',
      'academie-argent',
      'academie-isoler',
      'cnrtl-isolant',
      'cnrtl-isolateur',
      'cnrtl-mica',
      'cnrtl-bakelite',
      'cnrtl-gaine',
      'cnrtl-aluminium',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
