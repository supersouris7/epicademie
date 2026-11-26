import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-mouvement-energie.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Circuit électrique à une boucle : éléments, circuit ouvert ou fermé, courant qui ne s'use pas (6e) ———

const RECEPTEURS = [
  { nom: 'la lampe', un: 'une lampe', effet: 'brille', neg: 'reste éteinte' },
  { nom: 'le moteur', un: 'un moteur', effet: 'tourne', neg: 'reste immobile' },
] as const;
const REGLE =
  'Le courant passe dans un circuit fermé ; une interruption dans un seul élément empêche le passage du courant.';

const niveau1 = (rng: Rng): QuestionDraft => {
  const rec = rng.pick(RECEPTEURS);
  const ferme = rng.int(0, 1) === 0;
  const bon = maj(`${rec.nom} ${ferme ? rec.effet : rec.neg}`);
  const { answer, traps } = choice(rng, bon, [
    { label: maj(`${rec.nom} ${ferme ? rec.neg : rec.effet}`), why: REGLE },
    { label: 'La pile se remplit d’énergie', why: 'La pile fournit de l’énergie électrique : elle ne se remplit pas.' },
  ]);
  return {
    prompt: `Une boucle réunit une pile neuve, un interrupteur et ${rec.un}, bien branchés. L’interrupteur est ${ferme ? 'fermé' : 'ouvert'}. Qu’observe-t-on ?`,
    answer,
    traps,
    hint: 'Le parcours est-il interrompu quelque part ?',
    steps: [REGLE, `Ici le circuit est ${ferme ? 'fermé' : 'ouvert'}.`, `**${bon}**.`],
    targetSeconds: 25,
  };
};

const ELEMENTS: readonly { nom: string; role: string }[] = [
  { nom: 'La pile', role: 'fournit de l’énergie électrique à partir de l’énergie chimique' },
  { nom: 'L’interrupteur', role: 'coupe ou rétablit le passage du courant' },
  { nom: 'La lampe', role: 'convertit l’énergie électrique en lumière' },
  { nom: 'Le moteur', role: 'produit un mouvement' },
  { nom: 'La photopile', role: 'produit de l’électricité à partir de l’énergie solaire' },
  { nom: 'Le capteur', role: 'transforme un phénomène physique en signal' },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const paires = rng
      .shuffle(ELEMENTS)
      .slice(0, 3)
      .map((e) => [e.nom, e.role] as const);
    return {
      prompt: `Associe chaque élément à son rôle : ${paires
        .map((p) => p[0].toLowerCase())
        .sort()
        .join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Demande-toi quel élément fournit, lequel commande et lequel reçoit.',
      steps: [
        'Chaque élément a un rôle précis.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const e = rng.pick(ELEMENTS);
  const faux = rng.shuffle(ELEMENTS.filter((x) => x.nom !== e.nom)).slice(0, 3);
  const { answer, traps } = choice(
    rng,
    e.nom,
    faux.map((f) => ({ label: f.nom, why: `${f.nom} : ${f.role}.` })),
  );
  return {
    prompt: `Quel élément d’un montage ${e.role} ?`,
    answer,
    traps,
    hint: 'Associe d’abord à chaque proposition ce qu’elle fait.',
    steps: ['On identifie le rôle de chaque élément.', `Réponse : **${e.nom}**.`],
    targetSeconds: 30,
  };
};

const COUPURES: readonly { texte: string; ferme: boolean }[] = [
  { texte: 'Un fil est débranché d’une borne de la pile.', ferme: false },
  { texte: 'L’interrupteur est ouvert.', ferme: false },
  { texte: 'La lampe est dévissée : le parcours est coupé à cet endroit.', ferme: false },
  { texte: 'Tous les éléments sont reliés et l’interrupteur est fermé.', ferme: true },
  { texte: 'Le fil coupé a été remplacé par un fil entier, et il n’y a plus aucune interruption.', ferme: true },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(COUPURES);
  const bon = c.ferme ? 'fermé' : 'ouvert';
  if (rng.int(0, 1) === 0) {
    const { answer, traps } = saisie(c.ferme ? ['fermé', 'ferme', 'circuit fermé'] : ['ouvert', 'circuit ouvert'], [
      [c.ferme ? 'ouvert' : 'fermé', REGLE],
    ]);
    return {
      prompt: `Dans un circuit à une boucle : « ${c.texte} » Le circuit est-il ouvert ou fermé ?`,
      answer,
      traps,
      hint: 'Suis la boucle du doigt : peux-tu revenir au départ sans interruption ?',
      steps: [REGLE, `Le circuit est **${bon}**.`],
      targetSeconds: 30,
    };
  }
  return {
    prompt: `Dans un circuit à une boucle : « ${c.texte} » Complète.`,
    answer: {
      kind: 'cloze',
      parts: ['Le circuit est ', ' : le courant ', '.'],
      blanks: [
        { mode: 'list', options: ['ouvert', 'fermé'], correct: c.ferme ? 1 : 0 },
        { mode: 'list', options: ['peut passer', 'ne passe pas'], correct: c.ferme ? 0 : 1 },
      ],
    },
    hint: 'Cherche une interruption dans la boucle.',
    steps: [REGLE, `Réponse : circuit **${bon}**, le courant **${c.ferme ? 'peut passer' : 'ne passe pas'}**.`],
    targetSeconds: 35,
  };
};

const MOTS: readonly { q: string; accepte: readonly string[]; faux: readonly (readonly [string, string])[] }[] = [
  {
    q: 'Comment nomme-t-on, dans un circuit, un élément comme la pile, qui fournit le courant ?',
    accepte: ['générateur', 'un générateur', 'le générateur', 'generateur', 'un generateur'],
    faux: [['récepteur', 'Un récepteur reçoit l’énergie électrique et la convertit.']],
  },
  {
    q: 'Comment nomme-t-on un élément, comme une ampoule ou un moteur, qui convertit l’énergie électrique reçue ?',
    accepte: ['récepteur', 'un récepteur', 'le récepteur', 'recepteur', 'un recepteur'],
    faux: [['générateur', 'Un générateur fournit l’énergie électrique.']],
  },
  {
    q: 'Quel dispositif sert à couper ou à rétablir le passage du courant dans un circuit ?',
    accepte: ['interrupteur', 'un interrupteur', 'l’interrupteur'],
    faux: [
      ['générateur', 'Le générateur fournit le courant, il ne sert pas à le commander.'],
      ['capteur', 'Un capteur transforme un phénomène physique en signal.'],
    ],
  },
  {
    q: 'Quel dispositif photovoltaïque produit de l’électricité à partir de l’énergie solaire ?',
    accepte: [
      'photopile',
      'une photopile',
      'la photopile',
      'cellule photovoltaïque',
      'une cellule photovoltaïque',
      'cellule photovoltaique',
    ],
    faux: [
      ['lampe', 'La lampe fait l’inverse : elle reçoit de l’électricité et éclaire.'],
      ['moteur', 'Le moteur produit un mouvement.'],
    ],
  },
  {
    q: 'Quel appareil, sensible à un phénomène physique, le transforme en un signal ?',
    accepte: ['capteur', 'un capteur', 'le capteur'],
    faux: [
      ['interrupteur', 'L’interrupteur coupe ou rétablit le courant.'],
      ['moteur', 'Le moteur produit un mouvement.'],
    ],
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const paires = rng
      .shuffle(ELEMENTS)
      .slice(0, 5)
      .map((e) => [e.nom, e.role] as const);
    return {
      prompt: `Associe les cinq éléments à leur rôle : ${paires
        .map((p) => p[0].toLowerCase())
        .sort()
        .join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Place d’abord les éléments qui fournissent de l’électricité.',
      steps: [
        'Chaque élément a un rôle précis.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  if (t === 1) {
    const avant = rng.int(0, 1) === 0;
    const rec = rng.pick(RECEPTEURS);
    const bon = maj(`${rec.nom} ${rec.neg}`);
    const { answer, traps } = choice(rng, bon, [
      {
        label: maj(`${rec.nom} ${rec.effet}, car l’interrupteur est placé ${avant ? 'après' : 'avant'} sur la boucle`),
        why: `La place de l’interrupteur ne change rien. ${REGLE}`,
      },
      {
        label: maj(`${rec.nom} ${rec.effet} un moment avec le courant qui reste dans les fils`),
        why: `Le courant n’est pas une réserve dans les fils. ${REGLE}`,
      },
      { label: maj(`${rec.nom} ${rec.effet} deux fois plus fort`), why: REGLE },
    ]);
    return {
      prompt: `Dans une boucle, on lit dans cet ordre : borne d’une pile, ${avant ? `interrupteur ouvert, ${rec.nom}` : `${rec.nom}, interrupteur ouvert`}, autre borne. Qu’observe-t-on ?`,
      answer,
      traps,
      hint: 'La boucle est-elle complète ? La place de la coupure compte-t-elle ?',
      steps: [REGLE, `La boucle est interrompue : **${bon}**.`],
      targetSeconds: 50,
    };
  }
  const m = rng.pick(MOTS);
  const { answer, traps } = saisie(m.accepte, m.faux);
  return {
    prompt: m.q,
    answer,
    traps,
    hint: 'Pense au rôle décrit : fournir, recevoir, commander ou détecter.',
    steps: ['On relie un rôle à un nom.', `Réponse : **${m.accepte[0]}**.`],
    targetSeconds: 35,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const source = rng.pick(['une pile', 'une photopile éclairée par le Soleil']);
  const lampeAvant = rng.int(0, 1) === 0;
  const ordreBoucle = lampeAvant ? 'une lampe, puis un moteur' : 'un moteur, puis une lampe';
  const figure = {
    kind: 'document' as const,
    title: 'Montage d’un élève (données de l’exercice)',
    lines: [
      `La boucle contient ${source}, un interrupteur, ${ordreBoucle}.`,
      'Essai 1, interrupteur fermé : la lampe brille et le moteur tourne.',
      'Essai 2 : l’élève débranche un seul fil, entre la lampe et le moteur, sans rien rebrancher.',
      `L’élève écrit : « Le courant est usé par ${lampeAvant ? 'la lampe' : 'le moteur'}, il en reste moins pour la suite. »`,
    ],
  };
  const t = rng.int(0, 2);
  if (t === 0) {
    const bon = 'La lampe s’éteint et le moteur s’arrête';
    const { answer, traps } = choice(rng, bon, [
      { label: 'Seule la lampe s’éteint', why: `La boucle est unique : toute la boucle est coupée. ${REGLE}` },
      { label: 'Seul le moteur s’arrête', why: `La boucle est unique : toute la boucle est coupée. ${REGLE}` },
      { label: 'La lampe brille et le moteur tourne comme à l’essai 1', why: REGLE },
    ]);
    return {
      prompt: 'Lis le document. Qu’observe-t-on à l’essai 2 ?',
      figure,
      answer,
      traps,
      hint: 'Combien de chemins reste-t-il au courant après le débranchement ?',
      steps: ['Il n’y a qu’une seule boucle, et elle est coupée.', REGLE, `**${bon}**.`],
      targetSeconds: 65,
    };
  }
  if (t === 1) {
    const bon = 'Non : le courant ne s’use pas ; les récepteurs convertissent de l’énergie électrique';
    const { answer, traps } = choice(rng, bon, [
      {
        label: 'Oui : le premier récepteur consomme le courant et le second reçoit le reste',
        why: 'C’est une idée fausse : le courant ne s’épuise pas. C’est l’énergie qui est convertie.',
      },
      {
        label: 'Oui : le courant disparaît entièrement dans le dernier récepteur',
        why: 'Le courant ne disparaît pas : il ne peut passer que dans une boucle fermée.',
      },
      {
        label: 'Non : aucun élément de ce montage ne convertit d’énergie',
        why: 'La lampe et le moteur sont des récepteurs : ils convertissent de l’énergie électrique.',
      },
    ]);
    return {
      prompt: 'Lis le document. L’élève a-t-il raison ?',
      figure,
      answer,
      traps,
      hint: 'Distingue le courant, qui passe dans la boucle, et l’énergie, qui est convertie.',
      steps: [
        'Le courant ne s’épuise pas en traversant un élément.',
        'La lampe et le moteur convertissent de l’énergie électrique.',
        `**${bon}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const { answer, traps } = saisie(
    ['ouvert', 'circuit ouvert'],
    [['fermé', 'Un fil est débranché : la boucle est interrompue.']],
  );
  return {
    prompt: 'Lis le document. À l’essai 2, le circuit est-il ouvert ou fermé ? Écris le bon mot.',
    figure,
    answer,
    traps,
    hint: 'Regarde ce que l’élève a fait à la boucle.',
    steps: ['Le fil débranché interrompt la boucle.', 'Le circuit est **ouvert**.'],
    targetSeconds: 45,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const circuitElectrique: Skill = {
  id: 'p6-circuit',
  title: 'Le circuit électrique',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **circuit électrique** à une boucle réunit un **générateur** (pile ou **photopile**), des fils, un **récepteur** (lampe, moteur) et souvent un **interrupteur**. Un **capteur** peut y transformer un phénomène en signal.',
      'Le courant passe si le circuit est **fermé**. Une seule interruption (circuit **ouvert**) arrête tout. Le courant ne s’use pas en traversant un récepteur : c’est l’énergie qui est convertie.',
    ],
    ...references(
      'boucle',
      'elements',
      'circuit',
      'circuit-ouvert',
      'interrupteur',
      'generateur',
      'pile',
      'photopile',
      'recepteur',
      'moteur',
      'capteur',
      'usure',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
