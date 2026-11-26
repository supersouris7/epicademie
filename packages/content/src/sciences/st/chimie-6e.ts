import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-matiere.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Transformations chimiques, produits ménagers et pictogrammes de danger (6e) ———

interface Picto {
  /** Dessin décrit en mots (aucune information portée par la seule couleur). */
  readonly dessin: string;
  readonly danger: string;
  readonly mot: string;
  readonly accepte: readonly string[];
}

const PICTOS: readonly Picto[] = [
  {
    dessin: 'une flamme',
    danger: 'produit qui peut prendre feu',
    mot: 'inflammable',
    accepte: ['inflammable'],
  },
  {
    dessin: 'une flamme posée sur un cercle',
    danger: 'produit qui peut provoquer ou aggraver un incendie',
    mot: 'comburant',
    accepte: ['comburant'],
  },
  {
    dessin: 'des gouttes qui rongent une main et une surface',
    danger: 'produit qui peut brûler la peau et les yeux et attaquer les métaux',
    mot: 'corrosif',
    accepte: ['corrosif', 'corrosive'],
  },
  {
    dessin: 'une tête de mort sur deux os croisés',
    danger: 'produit qui peut être mortel s’il est avalé, touché ou respiré',
    mot: 'toxique',
    accepte: ['toxique', 'mortel'],
  },
  {
    dessin: 'un point d’exclamation',
    danger: 'produit qui peut irriter la peau et les yeux ou être nocif',
    mot: 'irritant',
    accepte: ['irritant', 'nocif', 'irritant ou nocif'],
  },
  {
    dessin: 'un arbre sans feuilles et un poisson mort',
    danger: 'produit toxique pour les êtres vivants dans l’eau',
    mot: 'dangereux pour l’environnement',
    accepte: ['dangereux pour l’environnement', 'dangereux pour l’eau'],
  },
  {
    dessin: 'une bombe qui explose',
    danger: 'produit explosif',
    mot: 'explosif',
    accepte: ['explosif'],
  },
];

function parMot(mot: string): Picto {
  const p = PICTOS.find((x) => x.mot === mot);
  if (!p) throw new Error(`Pictogramme inconnu : ${mot}`);
  return p;
}

const niveau1 = (rng: Rng): QuestionDraft => {
  const trois = ['inflammable', 'toxique', 'explosif'].map(parMot);
  const p = rng.pick(trois);
  const { answer, traps } = choice(
    rng,
    maj(p.danger),
    trois.filter((x) => x !== p).map((x) => ({ label: maj(x.danger), why: `Ce danger est signalé par ${x.dessin}.` })),
  );
  return {
    prompt: `Sur l’étiquette d’un produit, un pictogramme montre ${p.dessin}. Quel danger signale-t-il ?`,
    answer,
    traps,
    hint: 'Imagine ce que le dessin représente.',
    steps: ['Le dessin évoque le risque.', `Il signale un **${p.danger}**.`],
    targetSeconds: 20,
  };
};

const TRANSFORMATIONS: readonly { situation: string; chimique: boolean; why: string }[] = [
  {
    situation: 'un glaçon fond dans un verre',
    chimique: false,
    why: 'La glace devient de l’eau liquide : c’est la même substance.',
  },
  {
    situation: 'de l’eau bout dans une casserole',
    chimique: false,
    why: 'L’eau devient vapeur : c’est toujours de l’eau.',
  },
  {
    situation: 'du bois brûle et laisse des cendres et des gaz',
    chimique: true,
    why: 'La combustion forme de nouvelles substances.',
  },
  {
    situation: 'du vinaigre versé sur de la craie fait apparaître de nombreuses bulles d’un gaz nouveau',
    chimique: true,
    why: 'Un nouveau gaz se forme : la composition chimique change.',
  },
  {
    situation: 'un clou en fer laissé à l’humidité se couvre de rouille',
    chimique: true,
    why: 'La rouille est une nouvelle substance, différente du fer.',
  },
  {
    situation: 'on mélange du sable et du gravier',
    chimique: false,
    why: 'Les deux solides restent ce qu’ils étaient.',
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(PICTOS).slice(0, 3);
    return {
      prompt: `Associe chaque dessin de pictogramme à son danger : ${trois
        .map((p) => p.mot)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        trois.map((p) => [maj(p.dessin), maj(p.danger)]),
      ),
      hint: 'Regarde bien ce que chaque dessin représente.',
      steps: [
        'Chaque dessin avertit d’un danger précis.',
        `Réponse : **${trois.map((p) => `${p.dessin} → ${p.danger}`).join(' ; ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const p = rng.pick(PICTOS);
  const { answer, traps } = choice(
    rng,
    maj(p.dessin),
    rng
      .shuffle(PICTOS.filter((x) => x !== p))
      .slice(0, 3)
      .map((x) => ({ label: maj(x.dessin), why: `Ce dessin signale un ${x.danger}.` })),
  );
  return {
    prompt: `Quel dessin de pictogramme avertit d’un ${p.danger} ?`,
    answer,
    traps,
    hint: 'Le dessin représente souvent ce qui peut arriver.',
    steps: ['On cherche le dessin lié au risque.', `C’est **${p.dessin}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.pick(TRANSFORMATIONS);
  const bon = t.chimique ? 'chimique' : 'physique';
  const { answer, traps } = saisie(
    [bon, `transformation ${bon}`, `une transformation ${bon}`],
    [[t.chimique ? 'physique' : 'chimique', t.why]],
  );
  return {
    prompt: `Quand ${t.situation}, la transformation est-elle physique ou chimique ?`,
    answer,
    traps,
    hint: 'Se forme-t-il une substance nouvelle ?',
    steps: [t.why, `C’est une transformation **${bon}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const k = rng.int(0, 2);
  if (k === 0) {
    const cinq = rng.shuffle(PICTOS).slice(0, 5);
    return {
      prompt: `Associe chaque mot de danger à son dessin : ${cinq
        .map((p) => p.mot)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        cinq.map((p) => [maj(p.mot), maj(p.dessin)]),
      ),
      hint: 'Attention : deux dessins montrent une flamme.',
      steps: [
        'La flamme seule et la flamme sur un cercle ne disent pas la même chose.',
        `Réponse : **${cinq.map((p) => `${p.mot} → ${p.dessin}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  if (k === 1) {
    const p = rng.pick(PICTOS.filter((x) => !['dangereux pour l’environnement', 'explosif'].includes(x.mot)));
    const { answer, traps } = saisie(
      p.accepte,
      PICTOS.filter((x) => x !== p).map((x) => [x.mot, `Ce mot correspond au dessin : ${x.dessin}.`] as const),
    );
    return {
      prompt: `Écris l’adjectif qui correspond au pictogramme montrant ${p.dessin}.`,
      answer,
      traps,
      hint: 'L’adjectif dit ce que le produit risque de faire : relis ta leçon sur les dessins.',
      steps: [`Ce dessin signale un ${p.danger}.`, `Réponse : **${p.mot}**.`],
      targetSeconds: 35,
    };
  }
  const bon = rng.pick([
    {
      prompt:
        'On mélange deux liquides : un gaz se dégage en formant des bulles. Quel mot désigne ce dégagement rapide de bulles ?',
      accepte: ['effervescence', 'une effervescence', 'l’effervescence'],
      faux: [['ébullition', 'L’ébullition est le passage d’un liquide à l’état gazeux sous l’effet de la chaleur.']],
      mot: 'l’effervescence',
    },
    {
      prompt:
        'Un changement de couleur apparaît dans un mélange, et la composition chimique des substances change. Comment appelle-t-on ce type de transformation ?',
      accepte: ['chimique', 'transformation chimique', 'une transformation chimique'],
      faux: [['physique', 'Une transformation physique ne change pas la composition chimique.']],
      mot: 'une transformation chimique',
    },
  ] as const);
  const { answer, traps } = saisie(bon.accepte, bon.faux);
  return {
    prompt: bon.prompt,
    answer,
    traps,
    hint: 'Pense aux indices : bulles, couleur, nouvelle substance.',
    steps: ['On repère l’indice décrit.', `Réponse : **${bon.mot}**.`],
    targetSeconds: 40,
  };
};

interface Etiquette {
  readonly produit: string;
  readonly mot: string;
  readonly geste: string;
  readonly mauvais: readonly (readonly [string, string])[];
}

const ETIQUETTES: readonly Etiquette[] = [
  {
    produit: 'un produit de débouchage',
    mot: 'corrosif',
    geste: 'Le garder dans son récipient d’origine et éviter tout contact avec la peau',
    mauvais: [
      ['Le verser dans une bouteille de jus vide', 'Un produit se conserve dans son récipient d’origine.'],
      ['Le manipuler les mains nues', 'Un produit corrosif brûle la peau.'],
    ],
  },
  {
    produit: 'un dissolvant',
    mot: 'inflammable',
    geste: 'Le tenir loin de la chaleur et des flammes',
    mauvais: [
      ['L’utiliser près d’une bougie allumée', 'Un produit inflammable peut prendre feu.'],
      ['Le laisser sur un radiateur chaud', 'La chaleur augmente le risque d’incendie.'],
    ],
  },
  {
    produit: 'un pesticide',
    mot: 'dangereux pour l’environnement',
    geste: 'Éviter de le rejeter dans la nature',
    mauvais: [
      ['Vider les restes dans une rivière', 'Ce produit est toxique pour les êtres vivants de l’eau.'],
      ['Rincer le bidon dans une mare', 'Les restes polluent l’eau.'],
    ],
  },
  {
    produit: 'un produit portant une tête de mort',
    mot: 'toxique',
    geste: 'Ne pas manger ni boire pendant qu’on le manipule',
    mauvais: [
      ['Goûter le produit pour le reconnaître', 'Un produit toxique peut être mortel s’il est avalé.'],
      ['Grignoter en le manipulant', 'On ne mange pas en manipulant un produit toxique.'],
    ],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(ETIQUETTES);
  const p = parMot(e.mot);
  const figure = {
    kind: 'document' as const,
    title: 'Étiquette relevée à la maison',
    lines: [`Produit : ${e.produit}.`, `Pictogramme : ${p.dessin}.`, 'Un adulte te demande d’expliquer le bon geste.'],
  };
  if (rng.int(0, 1) === 0) {
    const { answer, traps } = choice(
      rng,
      e.geste,
      e.mauvais.map(([label, why]) => ({ label, why })),
    );
    return {
      prompt: 'Lis l’étiquette. Quel geste est prudent ?',
      figure,
      answer,
      traps,
      hint: 'Commence par comprendre le danger annoncé par le dessin.',
      steps: [`Le dessin signale un ${p.danger}.`, `Geste prudent : **${e.geste.toLowerCase()}**.`],
      targetSeconds: 55,
    };
  }
  const { answer, traps } = choice(
    rng,
    maj(p.danger),
    rng
      .shuffle(PICTOS.filter((x) => x !== p))
      .slice(0, 3)
      .map((x) => ({ label: maj(x.danger), why: `Ce danger correspond au dessin : ${x.dessin}.` })),
  );
  return {
    prompt: 'Lis l’étiquette. Quel danger ce produit présente-t-il ?',
    figure,
    answer,
    traps,
    hint: 'Concentre-toi sur la ligne du pictogramme.',
    steps: [`Le dessin est ${p.dessin}.`, `Le produit présente ce danger : **${p.danger}**.`],
    targetSeconds: 55,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const chimieSecurite: Skill = {
  id: 'p6-transformations-securite',
  title: 'Transformations chimiques et sécurité',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **transformation chimique** change la composition des substances : un gaz qui se dégage (**effervescence**) ou une couleur qui change peuvent la signaler. Une **transformation physique**, comme la glace qui fond, ne la change pas.',
      'Avant d’utiliser un produit, lis son **pictogramme de danger** : flamme (**inflammable**), flamme sur un cercle (**comburant**), corrosion (**corrosif**), tête de mort (toxique). Ne le rejette pas dans la nature.',
    ],
    ...references(
      'transformation-programme',
      'transformation-chimique',
      'transformation-physique',
      'effervescence',
      'rouille',
      'combustion',
      'ebullition',
      'menagers',
      'pictogrammes-programme',
      'picto-definition',
      'picto-flamme',
      'picto-comburant',
      'picto-corrosion',
      'picto-toxique',
      'picto-exclamation',
      'picto-environnement',
      'picto-explosif',
      'conseil-flamme',
      'conseil-corrosion',
      'conseil-environnement',
      'conseil-toxique',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
