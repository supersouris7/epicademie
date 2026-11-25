import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Digestion : le trajet des aliments et leurs changements (programme du cycle 3, définitions CNRTL) ———

type Cle = 'bouche' | 'oesophage' | 'estomac' | 'grele' | 'gros';

interface Etape {
  readonly nom: string;
  readonly role: string;
  readonly why: string;
  readonly accepte: readonly string[];
}

const TRAJET: Record<Cle, Etape> = {
  bouche: {
    nom: 'la bouche',
    role: 'les dents broient les aliments, mouillés par la salive',
    why: 'Dans la bouche, les dents broient les aliments et la salive les mouille.',
    accepte: ['bouche', 'la bouche', 'dans la bouche'],
  },
  oesophage: {
    nom: 'l’œsophage',
    role: 'les aliments avalés sont conduits vers l’estomac',
    why: 'L’œsophage est le conduit qui amène les aliments avalés jusqu’à l’estomac.',
    accepte: ['œsophage', 'oesophage', 'l’œsophage', 'l’oesophage', 'dans l’œsophage'],
  },
  estomac: {
    nom: 'l’estomac',
    role: 'les aliments sont brassés dans une poche',
    why: 'L’estomac est une poche : les aliments y sont brassés et transformés.',
    accepte: ['estomac', 'l’estomac', 'dans l’estomac'],
  },
  grele: {
    nom: 'l’intestin grêle',
    role: 'une partie des aliments digérés passe dans le sang',
    why: 'C’est la paroi de l’intestin grêle qui absorbe des produits de la digestion vers le sang.',
    accepte: ['intestin grêle', 'intestin grele', 'l’intestin grêle', 'l’intestin grele'],
  },
  gros: {
    nom: 'le gros intestin',
    role: 'c’est la dernière partie du tube digestif',
    why: 'Le gros intestin vient en dernier, après l’intestin grêle.',
    accepte: ['gros intestin', 'le gros intestin', 'dans le gros intestin'],
  },
};
const CLES = Object.keys(TRAJET) as Cle[];

/** Erreurs possibles quand on attend `bon` : les autres étapes, avec leur rôle. */
const autres = (bon: Cle) =>
  CLES.filter((k) => k !== bon).map((k) => ({
    label: TRAJET[k].nom,
    why: `${TRAJET[k].why} ${TRAJET[bon].why}`,
  }));

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      q: 'Tu croques dans une pomme. Où commence la digestion ?',
      bon: 'dans la bouche',
      why: 'La digestion commence dès que les dents broient la pomme, dans la bouche.',
      faux: ['dans le cœur', 'dans les cheveux'],
    },
    {
      q: 'Qu’est-ce qui sert à broyer un morceau de carotte ?',
      bon: 'les dents',
      why: 'Les dents saisissent, retiennent et broient les aliments.',
      faux: ['les oreilles', 'les ongles'],
    },
    {
      q: 'Quel liquide mouille la bouchée de pain dans ta bouche ?',
      bon: 'la salive',
      why: 'La salive mouille la bouche et participe à la digestion.',
      faux: ['les larmes', 'la sueur'],
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
    hint: 'Imagine ce qui se passe au moment où tu manges.',
    steps: ['On suit l’aliment dès le début de son trajet.', cas.why, `La réponse est **${cas.bon}**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trio = rng.shuffle(CLES).slice(0, 3);
    return {
      prompt: `Associe chaque partie à ce qui s’y passe : ${trio
        .map((k) => TRAJET[k].nom)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        trio.map((k) => [TRAJET[k].nom, TRAJET[k].role] as const),
      ),
      hint: 'Pense au trajet : on broie, on avale, on brasse, puis on absorbe.',
      steps: [
        'Chaque partie du tube digestif a son rôle.',
        trio.map((k) => TRAJET[k].why).join(' '),
        'Chaque partie est reliée à **son** rôle.',
      ],
      targetSeconds: 50,
    };
  }
  const bon = rng.pick(CLES);
  const { answer, traps } = choice(rng, TRAJET[bon].nom, rng.shuffle(autres(bon)).slice(0, 3));
  return {
    prompt: `Dans le tube digestif, à quel endroit se passe ceci : « ${TRAJET[bon].role} » ?`,
    answer,
    traps,
    hint: 'Suis la bouchée depuis les dents : à quel moment du voyage es-tu ?',
    steps: ['On cherche la partie qui joue ce rôle.', TRAJET[bon].why, `La réponse est **${TRAJET[bon].nom}**.`],
    targetSeconds: 30,
  };
};

const NOMS_TRAJET = CLES.map((k) => TRAJET[k].nom);

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    // 4 ou 5 parties du trajet, sans changer l’ordre.
    const saute = rng.int(-1, CLES.length - 1);
    const suite = NOMS_TRAJET.filter((_, i) => i !== saute);
    return {
      prompt: `Range dans l’ordre le trajet d’une bouchée : ${[...suite].sort().join(', ')}.`,
      answer: ordre(rng, suite),
      hint: 'Commence là où tu croques. Le « gros » intestin vient après le « grêle ».',
      steps: [
        'La bouchée avance toujours dans le même sens.',
        'Bouche, œsophage, estomac, intestin grêle, gros intestin.',
        `Ordre : **${suite.join(' → ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Complète : le début de la digestion.',
      answer: {
        kind: 'cloze',
        parts: ['Les ', ' broient les aliments. La ', ' les mouille.'],
        blanks: [
          { mode: 'list', options: ['veines', 'dents', 'oreilles'], correct: 1 },
          { mode: 'text', accepted: ['salive'] },
        ],
      },
      hint: 'Le second mot désigne le liquide de la bouche. Il commence par « sa ».',
      steps: ['Tout commence dans la bouche.', 'Mots : **dents** et **salive**.'],
      targetSeconds: 40,
    };
  }
  const bon = rng.pick(['estomac', 'oesophage'] as const);
  const e = TRAJET[bon];
  const { answer, traps } = saisie(e.accepte, [
    [bon === 'estomac' ? 'œsophage' : 'estomac', e.why],
    ['intestin', `L’intestin vient après l’estomac. ${e.why}`],
  ]);
  return {
    prompt:
      bon === 'estomac'
        ? 'Écris le nom de la poche où les aliments sont brassés, après avoir été avalés.'
        : 'Écris le nom du conduit qui amène les aliments avalés jusqu’à l’estomac.',
    answer,
    traps,
    hint: bon === 'estomac' ? 'Son nom commence par « es ».' : 'Son nom commence par la lettre « œ ».',
    steps: ['On cherche une partie du tube digestif.', e.why, `La réponse est **${e.nom}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Relie chaque mot à sa définition.',
      answer: association(rng, [
        ['digestion', 'transformation des aliments dans le tube digestif'],
        ['mastication', 'action de broyer les aliments avec les dents'],
        ['salive', 'liquide qui mouille la bouche'],
        ['œsophage', 'conduit qui mène à l’estomac'],
        ['gros intestin', 'dernière partie du tube digestif'],
      ]),
      hint: 'Commence par les mots dont tu es sûr, puis termine par élimination.',
      steps: ['Chaque mot a un seul sens ici.', 'Chaque mot est relié à **sa** définition.'],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const cas = rng.pick([
      {
        q: 'Comment appelle-t-on l’action de broyer les aliments avec les dents ? Écris un mot.',
        accepte: ['mastication', 'la mastication', 'mastiquer'],
        mot: 'mastication',
        pieges: [
          ['digestion', 'La digestion regroupe toutes les transformations. Ici, on parle seulement des dents.'],
          ['salive', 'La salive est un liquide, pas l’action des dents.'],
        ],
      },
      {
        q: 'Comment appelle-t-on toutes les transformations des aliments dans le tube digestif ? Écris un mot.',
        accepte: ['digestion', 'la digestion'],
        mot: 'digestion',
        pieges: [
          ['mastication', 'La mastication est seulement le travail des dents.'],
          ['circulation', 'La circulation est le trajet du sang.'],
        ],
      },
    ] as const);
    const { answer, traps } = saisie(cas.accepte, cas.pieges);
    return {
      prompt: cas.q,
      answer,
      traps,
      hint: 'Demande-toi : parle-t-on d’un seul geste ou de tout le voyage des aliments ?',
      steps: ['On cherche le mot exact.', `La réponse est **${cas.mot}**.`],
      targetSeconds: 35,
    };
  }
  const cas = rng.pick<{ bon: Cle; q: string }>([
    {
      bon: 'grele',
      q: 'Après la digestion, une partie des aliments digérés passe dans le sang. À travers la paroi de quelle partie ?',
    },
    { bon: 'grele', q: 'Quelle partie du tube digestif se trouve juste entre l’estomac et le gros intestin ?' },
    { bon: 'gros', q: 'Quelle partie du tube digestif vient juste après l’intestin grêle ?' },
    { bon: 'oesophage', q: 'Tu viens d’avaler une bouchée. Quel conduit traverse-t-elle avant l’estomac ?' },
  ]);
  const e = TRAJET[cas.bon];
  const { answer, traps } = saisie(
    e.accepte,
    CLES.filter((k) => k !== cas.bon).map((k) => [TRAJET[k].nom, `${TRAJET[k].why} ${e.why}`] as const),
  );
  return {
    prompt: `${cas.q} Écris son nom.`,
    answer,
    traps,
    hint: 'Récite le trajet dans ta tête, en partant de la bouche.',
    steps: ['On suit le trajet dans l’ordre.', e.why, `La réponse est **${e.nom}**.`],
    targetSeconds: 40,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const aliment = rng.pick([
    { nom: 'une tartine', mot: 'la tartine' },
    { nom: 'un morceau de pomme', mot: 'la pomme' },
    { nom: 'une bouchée de riz', mot: 'le riz' },
  ]);
  const figure = {
    kind: 'document' as const,
    title: 'Le voyage d’une bouchée',
    lines: [
      `Sami mange ${aliment.nom}.`,
      'Ses dents broient la bouchée et un liquide la mouille.',
      'Il avale : la bouchée descend par un long conduit.',
      'La bouchée arrive dans une poche qui la brasse.',
      'Plus loin, une partie passe dans le sang à travers la paroi d’un long tuyau.',
    ],
  };
  const q = rng.pick<{ ligne: number; quoi: string; bon: string; cle: Cle | null }>([
    { ligne: 2, quoi: 'Comment s’appelle le liquide de la ligne 2 ?', bon: 'la salive', cle: null },
    { ligne: 3, quoi: 'Comment s’appelle le conduit de la ligne 3 ?', bon: '', cle: 'oesophage' },
    { ligne: 4, quoi: 'Comment s’appelle la poche de la ligne 4 ?', bon: '', cle: 'estomac' },
    { ligne: 5, quoi: 'Comment s’appelle le tuyau de la ligne 5 ?', bon: '', cle: 'grele' },
  ]);
  const cle = q.cle;
  const bon = cle ? TRAJET[cle].nom : q.bon;
  const why = cle ? TRAJET[cle].why : 'La salive mouille la bouche et participe à la digestion.';
  const faux = cle
    ? autres(cle)
    : [
        { label: 'le sang', why: `Le sang circule dans les vaisseaux. ${why}` },
        { label: 'les larmes', why: `Les larmes mouillent les yeux. ${why}` },
        { label: 'la sueur', why: `La sueur sort par la peau. ${why}` },
      ];
  const { answer, traps } = choice(rng, bon, rng.shuffle(faux).slice(0, 3));
  return {
    prompt: `Lis le récit sur ${aliment.mot}. ${q.quoi}`,
    figure,
    answer,
    traps,
    hint: `Relis la ligne ${q.ligne} et les lignes d’avant : où en est la bouchée ?`,
    steps: [`La ligne ${q.ligne} décrit un moment du trajet.`, why, `Réponse : **${maj(bon)}**.`],
    targetSeconds: 55,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const digestion: Skill = {
  id: 'vcm2-digestion',
  title: 'La digestion',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **digestion** transforme les aliments. La **mastication** les broie et la **salive** les mouille. Ils passent par l’**œsophage**, puis l’**estomac**.',
      'Viennent l’**intestin grêle**, où une partie passe dans le sang, puis le **gros intestin**. Retiens : bouche, œsophage, estomac, grêle, gros !',
    ],
    source: `${PROGRAMME} : « Identifier et localiser la transformation des aliments dans l’appareil digestif (mastication par les dents, changements de texture lors du trajet) ». Trésor de la langue française (CNRTL), « chyle » : « absorbé par la paroi de l’intestin grêle pour être conduit dans la circulation sanguine ».`,
    sources: [
      PROGRAMME,
      'cnrtl-digestion',
      'cnrtl-mastication',
      'cnrtl-dent',
      'cnrtl-salive',
      'cnrtl-oesophage',
      'cnrtl-estomac',
      'cnrtl-intestin',
      'cnrtl-chyle',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
