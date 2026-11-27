import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Circulation sanguine : le sang approvisionne les organes (programme du cycle 3, CNRTL, Académie française) ———

type Cle = 'coeur' | 'artere' | 'capillaire' | 'veine';

interface Partie {
  readonly nom: string;
  readonly role: string;
  readonly why: string;
  readonly accepte: readonly string[];
}

const PARTIES: Record<Cle, Partie> = {
  coeur: {
    nom: 'le cœur',
    role: 'pousse le sang dans les vaisseaux',
    why: 'Le cœur est le principal moteur de la circulation : il pousse le sang.',
    accepte: ['cœur', 'coeur', 'le cœur', 'le coeur'],
  },
  artere: {
    nom: 'une artère',
    role: 'part du cœur et distribue le sang dans le corps',
    why: 'Une artère part du cœur et distribue le sang dans toutes les parties du corps.',
    accepte: [
      'artère',
      'artere',
      'une artère',
      'une artere',
      'l’artère',
      'l’artere',
      'artères',
      'arteres',
      'les artères',
      'les arteres',
      'des artères',
    ],
  },
  capillaire: {
    nom: 'un capillaire',
    role: 'très fin, permet les échanges entre le sang et le corps',
    why: 'Un capillaire est très fin : c’est là que se font les échanges entre le sang et le corps.',
    accepte: [
      'capillaire',
      'un capillaire',
      'le capillaire',
      'capillaires',
      'les capillaires',
      'des capillaires',
      'capillaire sanguin',
      'capillaires sanguins',
      'les capillaires sanguins',
    ],
  },
  veine: {
    nom: 'une veine',
    role: 'ramène le sang vers le cœur',
    why: 'Une veine ramène le sang vers le cœur.',
    accepte: ['veine', 'une veine', 'la veine', 'veines', 'les veines', 'des veines'],
  },
};
const CLES = Object.keys(PARTIES) as Cle[];

const autres = (bon: Cle) =>
  CLES.filter((k) => k !== bon).map((k) => ({
    label: PARTIES[k].nom,
    why: `${PARTIES[k].why} ${PARTIES[bon].why}`,
  }));

const ORGANES = ['aux muscles', 'au cerveau', 'à l’estomac', 'à la peau'];

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      q: 'Qu’est-ce qui pousse le sang dans ton corps ?',
      bon: 'le cœur',
      why: 'Le cœur est le principal moteur de la circulation du sang.',
      faux: ['les cheveux', 'les ongles'],
      hint: 'Cherche ce qui bat dans ta poitrine, jour et nuit.',
    },
    {
      q: `Qu’est-ce qui apporte ${rng.pick(ORGANES)} ce qu’il faut pour fonctionner ?`,
      bon: 'le sang',
      why: 'Le sang approvisionne les organes : il leur apporte ce qu’il faut.',
      faux: ['la salive', 'les larmes'],
      hint: 'Pense au liquide qui voyage dans tout le corps.',
    },
    {
      q: 'Dans quoi le sang circule-t-il ?',
      bon: 'dans des vaisseaux sanguins',
      why: 'Le sang reste enfermé dans des tuyaux du corps : les vaisseaux sanguins.',
      faux: ['dans l’œsophage', 'sur la peau'],
      hint: 'Pense à des tuyaux à l’intérieur du corps.',
    },
  ]);
  const { answer, traps } = choice(
    rng,
    cas.bon,
    cas.faux.map((label) => ({ label, why: cas.why })),
  );
  return {
    prompt: cas.q,
    answer,
    traps,
    hint: cas.hint,
    steps: ['On pense au voyage du sang dans le corps.', cas.why, `La réponse est **${cas.bon}**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trio = rng.shuffle(CLES).slice(0, 3);
    return {
      prompt: `Associe chaque élément à son rôle : ${trio
        .map((k) => PARTIES[k].nom)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        trio.map((k) => [PARTIES[k].nom, PARTIES[k].role] as const),
      ),
      hint: 'Repère le sens du trajet : ce qui part, ce qui revient, ce qui pousse.',
      steps: [
        'Chaque élément joue un rôle dans la circulation.',
        trio.map((k) => PARTIES[k].why).join(' '),
        'Chaque élément est relié à **son** rôle.',
      ],
      targetSeconds: 50,
    };
  }
  const bon = rng.pick(CLES);
  const p = PARTIES[bon];
  const { answer, traps } = choice(rng, p.nom, autres(bon));
  return {
    prompt: `Circulation du sang : quel élément correspond à ceci : « ${p.role} » ?`,
    answer,
    traps,
    hint: 'Artère, veine, capillaire ou cœur : suis le sens du sang.',
    steps: ['On cherche qui joue ce rôle.', p.why, `La réponse est **${p.nom}**.`],
    targetSeconds: 35,
  };
};

const BOUCLE = [
  'le cœur pousse le sang',
  'le sang suit des artères',
  'les échanges se font dans les capillaires',
  'le sang revient par des veines',
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const n = rng.pick([3, 4]);
    const suite = BOUCLE.slice(0, n);
    return {
      prompt: `Range les étapes dans l’ordre, en partant du cœur : ${[...suite].sort().join(', ')}.`,
      answer: ordre(rng, suite),
      hint: 'On part du cœur. Les vaisseaux très fins sont au milieu du voyage.',
      steps: ['Cœur, puis artères, puis capillaires, puis veines.', `Ordre : **${suite.join(' → ')}**.`],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Complète le voyage du sang.',
      answer: {
        kind: 'cloze',
        parts: ['Le sang part du cœur par des ', '. Il revient au cœur par des ', '.'],
        blanks: [
          { mode: 'list', options: ['veines', 'artères', 'dents'], correct: 1 },
          { mode: 'text', accepted: ['veines', 'veine'] },
        ],
      },
      hint: 'Le second mot désigne les vaisseaux du retour. Il commence par « ve ».',
      steps: ['Aller : les artères. Retour : les veines.', 'Mots : **artères** et **veines**.'],
      targetSeconds: 40,
    };
  }
  const bon = rng.pick(['coeur', 'veine', 'artere'] as const);
  const p = PARTIES[bon];
  const questions = {
    coeur: 'Quel organe est le principal moteur de la circulation du sang ?',
    veine: 'Comment s’appelle un vaisseau qui ramène le sang vers le cœur ?',
    artere: 'Comment s’appelle un vaisseau qui part du cœur pour distribuer le sang ?',
  };
  const { answer, traps } = saisie(
    p.accepte,
    CLES.filter((k) => k !== bon).map(
      (k) => [PARTIES[k].nom.replace(/^(le|une|un) /, ''), `${PARTIES[k].why} ${p.why}`] as const,
    ),
  );
  return {
    prompt: `${questions[bon]} Écris son nom.`,
    answer,
    traps,
    hint:
      bon === 'coeur'
        ? 'Il bat dans ta poitrine.'
        : 'Pense au sens du trajet : ce vaisseau part-il du cœur, ou y revient-il ?',
    steps: ['On cherche le nom exact.', p.why, `La réponse est **${p.nom}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Relie chaque mot à sa définition.',
      answer: association(rng, [
        ['cœur', 'organe qui pousse le sang'],
        ['artère', 'vaisseau qui part du cœur'],
        ['veine', 'vaisseau qui retourne au cœur'],
        ['capillaire', 'vaisseau très fin des échanges'],
        ['sang', 'liquide qui circule dans les vaisseaux'],
      ]),
      hint: 'Commence par les mots dont tu es sûr, puis termine par élimination.',
      steps: ['Chaque mot a un seul sens ici.', 'Chaque mot est relié à **sa** définition.'],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const organe = rng.pick(['un muscle de la jambe', 'le cerveau', 'la peau du pied']);
    const p = PARTIES.capillaire;
    const { answer, traps } = saisie(p.accepte, [
      ['artère', `L’artère apporte le sang de loin. ${p.why}`],
      ['veine', `La veine ramène le sang au cœur. ${p.why}`],
    ]);
    return {
      prompt: `Dans ${organe}, comment s’appellent les vaisseaux très fins où se font les échanges avec le sang ? Écris un mot.`,
      answer,
      traps,
      hint: 'Ce sont les plus petits vaisseaux, entre les artères et les veines.',
      steps: ['On cherche les vaisseaux les plus fins.', p.why, 'La réponse est le **capillaire**.'],
      targetSeconds: 40,
    };
  }
  const bon = 'Le sang, qui y circule dans des vaisseaux';
  const organe = rng.pick(['un muscle du bras', 'le cerveau', 'la peau du pied']);
  const { answer, traps } = choice(rng, bon, [
    {
      label: 'Les aliments, qui y vont tout droit depuis l’estomac',
      why: 'Aucun conduit ne mène les aliments de l’estomac à cet organe. C’est le sang qui l’approvisionne.',
    },
    {
      label: 'Le sang, qui reste immobile à côté de lui',
      why: 'Le sang ne reste pas sur place : il circule, poussé par le cœur.',
    },
    {
      label: 'La salive, qui y circule dans des vaisseaux',
      why: 'La salive mouille la bouche. C’est le sang qui circule dans les vaisseaux.',
    },
  ]);
  return {
    prompt: `Piège possible ! Qu’est-ce qui approvisionne ${organe} ?`,
    answer,
    traps,
    hint: 'Demande-toi quel liquide circule, et par où il passe.',
    steps: [
      'Le cœur pousse le sang dans les vaisseaux.',
      'La circulation du sang approvisionne ainsi chaque organe.',
      `La réponse est : **${bon}**.`,
    ],
    targetSeconds: 35,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const organe = rng.pick([
    { nom: 'un muscle de la jambe', court: 'le muscle', a: 'au muscle' },
    { nom: 'le cerveau', court: 'le cerveau', a: 'au cerveau' },
    { nom: 'un muscle du bras', court: 'le muscle du bras', a: 'au muscle du bras' },
  ]);
  const figure = {
    kind: 'document' as const,
    title: `Un voyage vers ${organe.nom}`,
    lines: [
      'Après le repas, une partie des aliments digérés passe de l’intestin grêle dans le sang.',
      'Un moteur pousse le sang.',
      `Le sang suit d’abord un gros vaisseau qui part de ce moteur vers ${organe.court}.`,
      `Là, dans des vaisseaux très fins, le sang fait des échanges avec ${organe.court}.`,
      'Le sang repart ensuite par un autre vaisseau, vers le moteur.',
    ],
  };
  const cas = rng.pick([
    { ligne: 2, q: 'Quel organe est le moteur de la ligne 2 ?', cle: 'coeur' as Cle },
    { ligne: 3, q: 'Quel vaisseau est décrit à la ligne 3 ?', cle: 'artere' as Cle },
    { ligne: 4, q: 'Quel type de vaisseau est décrit à la ligne 4 ?', cle: 'capillaire' as Cle },
    { ligne: 5, q: 'Quel vaisseau est décrit à la ligne 5 ?', cle: 'veine' as Cle },
    { ligne: 1, q: `D’après le texte, d’où vient ce que le sang porte ${organe.a} après le repas ?`, cle: null },
  ]);
  const cle = cas.cle;
  const bon = cle ? PARTIES[cle].nom : 'des aliments digérés, par l’intestin grêle';
  const why = cle
    ? PARTIES[cle].why
    : 'La ligne 1 le dit : une partie des aliments digérés passe de l’intestin grêle au sang.';
  const faux = cle
    ? autres(cle)
    : [
        { label: 'des cheveux', why: `Les cheveux n’apportent rien au sang. ${why}` },
        { label: 'de la salive restée dans la bouche', why: `Le texte ne parle pas de la salive. ${why}` },
        {
          label: 'du cœur lui-même, qui fabrique les aliments',
          why: `Le cœur pousse le sang, sans fabriquer d’aliments. ${why}`,
        },
      ];
  const { answer, traps } = choice(rng, bon, faux);
  return {
    prompt: `Lis le texte. ${cas.q}`,
    figure,
    answer,
    traps,
    hint: `Relis la ligne ${cas.ligne} : cherche le sens du trajet ou le mot qui le dit.`,
    steps: [`La ligne ${cas.ligne} donne l’indice.`, why, `Réponse : **${maj(bon)}**.`],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const circulation: Skill = {
  id: 'vcm2-circulation',
  title: 'Le sang nourrit les organes',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **circulation sanguine** approvisionne chaque **organe** : elle lui apporte ce qu’il faut. Le cœur pousse le sang dans des **vaisseaux sanguins**.',
      'Les **artères** partent du cœur, les **veines** y reviennent. Entre les deux, les **capillaires**, très fins, permettent les échanges. Aller par artère, retour par veine !',
    ],
    source: `${PROGRAMME} : « Identifier le rôle de la circulation sanguine dans l’approvisionnement des organes ». Académie française, « capillaire » : « permettent les échanges nutritifs et gazeux entre le sang et les cellules ».`,
    sources: [
      PROGRAMME,
      'cnrtl-sang',
      'cnrtl-coeur',
      'cnrtl-artere',
      'cnrtl-veine',
      'academie-capillaire',
      'cnrtl-chyle',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
