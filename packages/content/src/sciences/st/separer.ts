import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Séparer un mélange : tamisage, décantation, filtration (programme du cycle 3, cours moyen) ———

type Technique = 'tamisage' | 'decantation' | 'filtration';
const TECHNIQUES: readonly Technique[] = ['tamisage', 'decantation', 'filtration'];

const NOM: Record<Technique, string> = {
  tamisage: 'le tamisage',
  decantation: 'la décantation',
  filtration: 'la filtration',
};
const MOT: Record<Technique, string> = { tamisage: 'tamisage', decantation: 'décantation', filtration: 'filtration' };
const REGLE: Record<Technique, string> = {
  tamisage: 'un tamis trie des grains de tailles différentes',
  decantation: 'on laisse reposer le mélange et le solide tombe au fond',
  filtration: 'un filtre retient le solide et laisse passer le liquide',
};
const ACCEPTE: Record<Technique, readonly string[]> = {
  tamisage: ['tamisage', 'le tamisage', 'tamiser'],
  decantation: ['décantation', 'la décantation', 'decantation', 'la decantation', 'décanter', 'decanter'],
  filtration: ['filtration', 'la filtration', 'filtrer'],
};

const pas = (t: Technique) => `Ce n’est pas ${NOM[t]}. Rappel : ${REGLE[t]}.`;

const SCENES: readonly { scene: string; t: Technique }[] = [
  { scene: 'Tu secoues un tamis plein de terre : la terre fine tombe, les cailloux restent.', t: 'tamisage' },
  { scene: 'Tu fais passer des graines et du sable fin dans un tamis : les graines restent dessus.', t: 'tamisage' },
  { scene: 'Tu laisses un seau d’eau boueuse sans le toucher : la terre tombe au fond.', t: 'decantation' },
  { scene: 'Tu poses un bocal d’eau et de sable sur la table et tu attends : le sable se dépose.', t: 'decantation' },
  { scene: 'Tu verses de l’eau sableuse dans un entonnoir avec un papier filtre.', t: 'filtration' },
  { scene: 'Tu verses de l’eau pleine de petits morceaux de craie à travers un filtre.', t: 'filtration' },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick(SCENES);
  const { answer, traps } = choice(
    rng,
    NOM[cas.t],
    TECHNIQUES.filter((t) => t !== cas.t).map((t) => ({ label: NOM[t], why: pas(t) })),
  );
  return {
    prompt: `${cas.scene} Comment s’appelle cette technique ?`,
    answer,
    traps,
    hint: 'Repère l’outil ou l’action : un tamis, du repos ou un filtre ?',
    steps: ['On repère ce qui sépare les deux matières.', `Ici, ${REGLE[cas.t]}.`, `C’est **${NOM[cas.t]}**.`],
    targetSeconds: 20,
  };
};

const BESOINS: readonly { besoin: string; t: Technique; pourquoi: string }[] = [
  {
    besoin: 'Tu as du sable fin et de gros graviers, secs. Tu veux les séparer.',
    t: 'tamisage',
    pourquoi: 'Il n’y a pas de liquide : les tailles sont différentes, un tamis suffit.',
  },
  {
    besoin: 'Tu as de la farine et des haricots secs mélangés. Tu veux les séparer.',
    t: 'tamisage',
    pourquoi: 'Il n’y a pas de liquide : la farine passe dans le tamis, les haricots restent.',
  },
  {
    besoin:
      'Tu as de l’eau avec de la terre. Tu n’as ni tamis ni filtre, seulement deux bocaux. Tu veux séparer la terre de l’eau.',
    t: 'decantation',
    pourquoi: 'Sans outil, on attend : la terre tombe au fond, puis on verse l’eau.',
  },
  {
    besoin:
      'Après un long repos, de l’eau reste trouble à cause de grains très fins. Tu as un entonnoir et un papier filtre. Tu veux retirer ces grains.',
    t: 'filtration',
    pourquoi: 'Le papier filtre arrête les grains fins et laisse passer l’eau.',
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(BESOINS);
  const { answer, traps } = choice(rng, NOM[b.t], [
    ...TECHNIQUES.filter((t) => t !== b.t).map((t) => ({ label: NOM[t], why: `${pas(t)} ${b.pourquoi}` })),
    {
      label: 'l’évaporation',
      why: 'L’évaporation fait partir l’eau en vapeur : elle sert surtout à récupérer un solide dissous.',
    },
  ]);
  return {
    prompt: `${b.besoin} Quelle technique choisis-tu ?`,
    answer,
    traps,
    hint: 'Regarde s’il y a un liquide, puis les outils dont tu disposes.',
    steps: [
      'On regarde ce qu’il y a dans le mélange et les outils disponibles.',
      b.pourquoi,
      `On choisit **${NOM[b.t]}**.`,
    ],
    targetSeconds: 30,
  };
};

const ETAPES: readonly { titre: string; items: readonly string[]; why: string }[] = [
  {
    titre: 'séparer de l’eau et de la terre par décantation',
    items: [
      'Verser le mélange d’eau et de terre dans un bocal',
      'Laisser le bocal sans le toucher jusqu’à ce que la terre soit au fond',
      'Vérifier que l’eau du dessus est devenue plus claire',
      'Verser doucement l’eau du dessus dans un autre bocal',
    ],
    why: 'On attend que la terre soit au fond et on vérifie l’eau avant de la verser, sinon la terre repart avec elle.',
  },
  {
    titre: 'séparer de l’eau et du sable par filtration',
    items: [
      'Préparer un entonnoir garni d’un papier filtre au-dessus d’un verre',
      'Verser le mélange dans l’entonnoir',
      'Laisser l’eau traverser le papier',
      'Retirer le papier avec le sable qu’il a retenu',
    ],
    why: 'Le filtre doit être en place avant de verser ; on le retire quand l’eau est passée.',
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const e = rng.pick(ETAPES);
    return {
      prompt: `Remets les étapes dans l’ordre pour ${e.titre}.`,
      answer: ordre(rng, e.items),
      hint: 'Que dois-tu préparer ou attendre avant de verser ?',
      steps: [e.why, `Ordre : **${e.items.join(' → ')}**.`],
      targetSeconds: 45,
    };
  }
  const cas = rng.pick(SCENES);
  const { answer, traps } = saisie(
    ACCEPTE[cas.t],
    TECHNIQUES.filter((t) => t !== cas.t).map((t) => [MOT[t], pas(t)] as const),
  );
  return {
    prompt: `${cas.scene} Écris le nom de la technique.`,
    answer,
    traps,
    hint: 'Le nom ressemble au mot de l’outil ou de l’action.',
    steps: ['On repère l’outil ou l’action.', `Ici, ${REGLE[cas.t]}.`, `La technique est **${NOM[cas.t]}**.`],
    targetSeconds: 30,
  };
};

const MOTS: readonly (readonly [string, string])[] = [
  ['un tamis', 'un cadre percé de trous qui sépare des grains de tailles différentes'],
  ['un filtre', 'un objet percé de tout petits trous qui retient les solides d’un liquide'],
  ['le tamisage', 'on fait passer un mélange de solides à travers un tamis'],
  ['la décantation', 'on laisse reposer pour que le solide tombe au fond'],
  ['la filtration', 'on verse un mélange avec un liquide à travers un filtre'],
];

interface Reste {
  readonly question: string;
  readonly accepte: readonly [string, ...string[]];
  readonly erreurs: readonly (readonly [string, string])[];
  readonly why: string;
}

const RESTES: readonly Reste[] = [
  {
    question: 'Tu tamises du sable fin et des graviers. Qu’est-ce qui reste sur le tamis ? Écris la réponse.',
    accepte: ['les graviers', 'graviers', 'le gravier', 'gravier', 'des graviers', 'du gravier'],
    why: 'Le sable fin passe à travers les trous. Les gros morceaux restent dessus.',
    erreurs: [
      ['le sable', 'Le sable fin passe à travers les trous. Les gros morceaux restent dessus.'],
      ['sable', 'Le sable fin passe à travers les trous. Les gros morceaux restent dessus.'],
    ],
  },
  {
    question: 'Tu filtres de l’eau pleine de sable. Qu’est-ce qui traverse le filtre ? Écris la réponse.',
    accepte: ['l’eau', 'eau', 'de l’eau'],
    why: 'Le sable est retenu par le filtre : ses grains ne passent pas.',
    erreurs: [
      ['le sable', 'Le sable est retenu par le filtre : ses grains ne passent pas.'],
      ['sable', 'Le sable est retenu par le filtre : ses grains ne passent pas.'],
    ],
  },
  {
    question: 'Tu laisses reposer de l’eau boueuse. Qu’est-ce qui tombe au fond du bocal ? Écris la réponse.',
    accepte: ['la terre', 'terre', 'la boue', 'boue', 'de la terre'],
    why: 'L’eau reste au-dessus. C’est la terre, solide, qui tombe au fond.',
    erreurs: [
      ['l’eau', 'L’eau reste au-dessus. C’est la terre, solide, qui tombe au fond.'],
      ['eau', 'L’eau reste au-dessus. C’est la terre, solide, qui tombe au fond.'],
    ],
  },
  {
    question: 'Tu filtres de l’eau salée. Le sel dissous reste-t-il sur le filtre ? Écris oui ou non.',
    accepte: ['non'],
    why: 'Le sel dissous traverse le filtre avec l’eau. Pour le récupérer, il faut évaporer l’eau.',
    erreurs: [['oui', 'Le sel dissous traverse le filtre avec l’eau. Pour le récupérer, il faut évaporer l’eau.']],
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 3) === 0) {
    return {
      prompt: 'Associe chaque mot à ce qu’il veut dire.',
      answer: association(rng, MOTS),
      hint: 'Distingue d’abord les outils (tamis, filtre) des techniques.',
      steps: [
        'Un outil est un objet ; une technique est une façon de faire.',
        `Réponse : **${MOTS.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const cas = rng.pick(RESTES);
  const { answer, traps } = saisie(cas.accepte, cas.erreurs);
  return {
    prompt: cas.question,
    answer,
    traps,
    hint: 'Pense à ce que chaque outil laisse passer, et à ce qui est dissous.',
    steps: ['On imagine l’expérience : qui passe, qui reste ?', cas.why, `Réponse : **${cas.accepte[0]}**.`],
    targetSeconds: 35,
  };
};

type Etape = readonly [string, Technique];

interface Mission {
  readonly titre: string;
  readonly lines: readonly string[];
  readonly etapes: readonly [Etape, Etape, Etape];
}

const MISSIONS: readonly Mission[] = [
  {
    titre: 'Mission : l’expérience du seau',
    lines: [
      'On a de la terre sèche mêlée à de gros cailloux, et un seau d’eau propre. But : retrouver de l’eau claire.',
      'Étape 1 : on passe la terre sèche sur une grille à trous, qui retient les gros cailloux.',
      'Étape 2 : on verse la terre fine dans le seau, on remue, puis on attend, sans toucher, qu’elle se dépose.',
      'Étape 3 : on verse l’eau du dessus, encore un peu trouble, à travers un papier filtre.',
    ],
    etapes: [
      ['Pour retirer les cailloux', 'tamisage'],
      ['Pour laisser la terre tomber', 'decantation'],
      ['Pour arrêter les derniers grains', 'filtration'],
    ],
  },
  {
    titre: 'Mission : le bac à sable de l’école',
    lines: [
      'Le bac contient du sable, des brindilles et de l’eau de pluie.',
      'Étape 1 : le sable mouillé se dépose pendant qu’on attend sans rien toucher.',
      'Étape 2 : on verse l’eau du dessus dans un entonnoir garni de papier.',
      'Étape 3 : une fois le sable sec, on le passe dans une passoire fine pour ôter les brindilles.',
    ],
    etapes: [
      ['Pendant l’attente', 'decantation'],
      ['Avec l’entonnoir et le papier', 'filtration'],
      ['Avec la passoire fine, sur le sable sec', 'tamisage'],
    ],
  },
  {
    titre: 'Mission : le jardinier',
    lines: [
      'Le jardinier veut de la terre fine, puis de l’eau claire.',
      'Étape 1 : il secoue la terre sèche dans une passoire à trous fins.',
      'Étape 2 : il laisse reposer un arrosoir d’eau boueuse.',
      'Étape 3 : il verse l’eau obtenue à travers un tissu fin qui arrête les petits grains.',
    ],
    etapes: [
      ['Pour la terre sèche', 'tamisage'],
      ['Pour l’arrosoir au repos', 'decantation'],
      ['Avec le tissu fin', 'filtration'],
    ],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MISSIONS);
  const options = TECHNIQUES.map((t) => NOM[t]);
  const [premiere, deuxieme, troisieme] = m.etapes;
  return {
    prompt: `Lis la mission « ${m.titre} » et complète le nom de chaque technique.`,
    figure: { kind: 'document', title: m.titre, lines: m.lines },
    answer: {
      kind: 'cloze',
      parts: [`${premiere[0]} : `, `. ${deuxieme[0]} : `, `. ${troisieme[0]} : `, '.'],
      blanks: m.etapes.map(([, t]) => ({ mode: 'list' as const, options, correct: TECHNIQUES.indexOf(t) })),
    },
    hint: 'Pour chaque étape, cherche dans le texte le geste : tamis ou passoire, attente, filtre.',
    steps: [
      ...m.etapes.map(([debut, t]) => `${debut} : ${REGLE[t]}.`),
      `Réponse : **${m.etapes.map(([, t]) => NOM[t]).join(', puis ')}**.`,
    ],
    targetSeconds: 75,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const separer: Skill = {
  id: 'pcm2-separer',
  title: 'Séparer un mélange',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour séparer un **mélange**, choisis la bonne technique ! Le **tamisage** trie des grains de tailles différentes.',
      'La **décantation** laisse le solide tomber au fond. La **filtration** le retient dans un filtre. Parfois, on enchaîne plusieurs techniques !',
    ],
    source: `${PROGRAMME} : « Séparer les constituants d’un mélange de solides ou d’un mélange solide-liquide par tamisage, décantation, filtration ».`,
    sources: [PROGRAMME, 'cnrtl-tamis', 'cnrtl-filtre'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
