import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-matiere.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Transformations chimiques, produits ménagers et pictogrammes de danger (6e) ———

interface Picto {
  /** Symbole nommé comme à l’annexe V du règlement CLP (aucune information portée par la seule couleur). */
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
    dessin: 'une flamme au-dessus d’un cercle',
    danger: 'produit qui peut provoquer ou aggraver un incendie',
    mot: 'comburant',
    accepte: ['comburant'],
  },
  {
    dessin: 'le symbole « corrosion »',
    danger: 'produit qui peut brûler la peau et les yeux et attaquer les métaux',
    mot: 'corrosif',
    accepte: ['corrosif', 'corrosive'],
  },
  {
    dessin: 'une tête de mort sur deux tibias',
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
    dessin: 'le symbole « environnement »',
    danger: 'produit toxique pour les êtres vivants dans l’eau',
    mot: 'dangereux pour l’environnement',
    accepte: ['dangereux pour l’environnement', 'dangereux pour l’eau'],
  },
  {
    dessin: 'une bombe explosant',
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

const SYMBOLES_PARLANTS: readonly string[] = ['corrosif', 'dangereux pour l’environnement'];

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
    situation: 'on écrase un morceau de craie en poudre',
    chimique: false,
    why: 'La poudre est toujours de la craie : seule sa forme change.',
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
    // Sans les symboles dont le nom donne la réponse (« corrosion », « environnement »).
    const quatre = rng.shuffle(PICTOS.filter((x) => !SYMBOLES_PARLANTS.includes(x.mot))).slice(0, 4);
    return {
      prompt: `Associe chaque mot de danger à son dessin : ${quatre
        .map((p) => p.mot)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        quatre.map((p) => [maj(p.mot), maj(p.dessin)]),
      ),
      hint: 'Imagine ce que chaque dessin montre : quel risque annonce-t-il ?',
      steps: [
        'Chaque mot de danger correspond à un seul dessin.',
        `Réponse : **${quatre.map((p) => `${p.mot} → ${p.dessin}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  if (k === 1) {
    const p = rng.pick(PICTOS.filter((x) => !SYMBOLES_PARLANTS.includes(x.mot) && x.mot !== 'explosif'));
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

interface Geste {
  readonly geste: string;
  /** Danger auquel le geste répond : sert à expliquer pourquoi il ne convient pas ailleurs. */
  readonly contre: string;
}

const GESTES = {
  inflammable: { geste: 'Le tenir loin des flammes et des surfaces chaudes', contre: 'le risque qu’il prenne feu' },
  comburant: {
    geste: 'Le tenir à l’écart des vêtements et des autres matières qui peuvent brûler',
    contre: 'le risque qu’il provoque ou aggrave un incendie au contact de ces matières',
  },
  corrosif: { geste: 'Le conserver uniquement dans son récipient d’origine', contre: 'les erreurs de récipient' },
  toxique: { geste: 'Ne pas manger ni boire pendant qu’on le manipule', contre: 'le risque d’en avaler' },
  irritant: { geste: 'L’utiliser dehors ou dans une pièce bien aérée', contre: 'le risque lié à ce qu’on respire' },
  'dangereux pour l’environnement': {
    geste: 'Éviter de le rejeter dans la nature',
    contre: 'la pollution du milieu naturel',
  },
} satisfies Record<string, Geste>;

type Danger = keyof typeof GESTES;

interface Situation {
  /** Les deux pictogrammes de l’étiquette. */
  readonly etiquette: readonly [Danger, Danger];
  readonly situation: string;
  /** Celui des deux dangers que la situation met en jeu. */
  readonly enJeu: Danger;
  /** Gestes prudents, adaptés à un autre danger. */
  readonly autres: readonly [Danger, Danger, Danger];
}

const SITUATIONS: readonly Situation[] = [
  {
    etiquette: ['inflammable', 'irritant'],
    situation: 'Une bougie est allumée sur la table où l’on veut ouvrir le flacon.',
    enJeu: 'inflammable',
    autres: ['irritant', 'corrosif', 'dangereux pour l’environnement'],
  },
  {
    etiquette: ['corrosif', 'dangereux pour l’environnement'],
    situation: 'Pour gagner de la place, on veut transvaser le produit dans une bouteille de jus vide.',
    enJeu: 'corrosif',
    autres: ['dangereux pour l’environnement', 'inflammable', 'toxique'],
  },
  {
    etiquette: ['comburant', 'corrosif'],
    situation: 'On veut poser le produit sur une pile de chiffons et de vieux vêtements.',
    enJeu: 'comburant',
    autres: ['corrosif', 'toxique', 'dangereux pour l’environnement'],
  },
  {
    etiquette: ['irritant', 'dangereux pour l’environnement'],
    situation: 'On veut vaporiser le produit dans une petite salle de bains fermée.',
    enJeu: 'irritant',
    autres: ['dangereux pour l’environnement', 'corrosif', 'inflammable'],
  },
  {
    etiquette: ['toxique', 'dangereux pour l’environnement'],
    situation: 'La personne qui prépare le produit veut prendre son goûter en même temps.',
    enJeu: 'toxique',
    autres: ['dangereux pour l’environnement', 'inflammable', 'comburant'],
  },
  {
    etiquette: ['toxique', 'dangereux pour l’environnement'],
    situation: 'Après usage, on pense rincer le bidon dans la mare du jardin.',
    enJeu: 'dangereux pour l’environnement',
    autres: ['toxique', 'corrosif', 'inflammable'],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SITUATIONS);
  const etiquette = rng.shuffle(s.etiquette).map(parMot);
  const p = parMot(s.enJeu);
  const figure = {
    kind: 'document' as const,
    title: 'Étiquette et situation (données de l’exercice)',
    lines: [
      `Étiquette du flacon, premier pictogramme : ${etiquette[0]?.dessin}.`,
      `Second pictogramme : ${etiquette[1]?.dessin}.`,
      `Situation : ${s.situation}`,
    ],
  };
  const annonce = `L’étiquette annonce : ${etiquette.map((x) => x.danger).join(' ; ')}.`;
  if (rng.int(0, 1) === 0) {
    const bon = GESTES[s.enJeu].geste;
    const { answer, traps } = choice(
      rng,
      bon,
      s.autres.map((d) => ({
        label: GESTES[d].geste,
        why: `Ce geste est prudent contre ${GESTES[d].contre}, mais il ne répond pas à la situation, qui met en jeu un ${p.danger}.`,
      })),
    );
    return {
      prompt: 'Lis l’étiquette et la situation. Quel geste répond au risque de cette situation ?',
      figure,
      answer,
      traps,
      hint: 'Cherche ce que chaque pictogramme annonce, puis lequel est concerné par la situation.',
      steps: [annonce, `La situation met en jeu ce danger : ${p.danger}.`, `Geste adapté : **${bon.toLowerCase()}**.`],
      targetSeconds: 70,
    };
  }
  const presents = etiquette.filter((x) => x !== p);
  const absents = rng.shuffle(PICTOS.filter((x) => !s.etiquette.some((d) => d === x.mot))).slice(0, 2);
  const { answer, traps } = choice(rng, maj(p.danger), [
    ...presents.map((x) => ({
      label: maj(x.danger),
      why: `Ce danger est bien sur l’étiquette (${x.dessin}), mais la situation ne le met pas d’abord en jeu.`,
    })),
    ...absents.map((x) => ({
      label: maj(x.danger),
      why: `L’étiquette ne porte pas le pictogramme de ce danger (${x.dessin}).`,
    })),
  ]);
  return {
    prompt: 'Lis l’étiquette et la situation. Quel danger faut-il surtout prendre en compte ici ?',
    figure,
    answer,
    traps,
    hint: 'La réponse doit être sur l’étiquette et correspondre à ce que l’on s’apprête à faire.',
    steps: [annonce, `Situation : ${s.situation}`, `Le danger à prendre en compte : **${p.danger}**.`],
    targetSeconds: 70,
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
      'Avant d’utiliser un produit, lis son **pictogramme de danger** : flamme (**inflammable**), flamme au-dessus d’un cercle (**comburant**), symbole « corrosion » (**corrosif**), tête de mort sur deux tibias (toxique), point d’exclamation (irritant ou nocif), bombe explosant (explosif), symbole « environnement » (dangereux pour l’environnement).',
      'Adapte le geste au danger : loin des flammes (inflammable), loin des vêtements et des matières qui brûlent (comburant), dans son récipient d’origine (corrosif), sans manger ni boire (toxique), dehors ou dans une pièce aérée (irritant), jamais dans la nature (dangereux pour l’environnement).',
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
      'conseil-comburant',
      'conseil-aeration',
      'symbole-flamme',
      'symbole-comburant',
      'symbole-corrosion',
      'symbole-toxique',
      'symbole-exclamation',
      'symbole-environnement',
      'symbole-explosif',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
