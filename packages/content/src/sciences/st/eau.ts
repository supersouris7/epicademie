import { choice } from '../../build.ts';
import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre } from './outils.ts';

// ——— L'eau et ses changements d'état (programme du cycle 3 : « en particulier ceux de l'eau ») ———

type Etat = 'solide' | 'liquide' | 'gazeux';
const ETATS: readonly Etat[] = ['solide', 'liquide', 'gazeux'];

/** L'eau sous ses trois états (exemples du quotidien). */
const EAU: Record<Etat, readonly string[]> = {
  solide: ['la glace d’un glaçon', 'la neige', 'la glace d’une patinoire'],
  liquide: ['l’eau d’un lac', 'l’eau du robinet', 'la pluie'],
  gazeux: ['la vapeur d’eau au-dessus d’une casserole qui bout'],
};

interface Changement {
  readonly de: Etat;
  readonly vers: Etat;
  readonly situations: readonly string[];
}

const FONTE: Changement = {
  de: 'solide',
  vers: 'liquide',
  situations: ['Un glaçon posé sur la table fond', 'La neige fond au soleil'],
};
const GEL: Changement = {
  de: 'liquide',
  vers: 'solide',
  situations: ['De l’eau mise au congélateur devient de la glace', 'Une flaque gèle pendant une nuit très froide'],
};
const EBULLITION: Changement = {
  de: 'liquide',
  vers: 'gazeux',
  situations: [
    'L’eau d’une casserole qui bout se transforme en vapeur',
    'Le linge mouillé sèche au soleil : son eau s’évapore',
  ],
};
const CONDENSATION: Changement = {
  de: 'gazeux',
  vers: 'liquide',
  situations: [
    'De la vapeur d’eau touche un couvercle froid et devient des gouttes',
    'De la buée se forme sur un miroir froid : la vapeur d’eau devient des gouttelettes',
  ],
};
const CHANGEMENTS: readonly Changement[] = [FONTE, GEL, EBULLITION, CONDENSATION];

const sens = (c: Pick<Changement, 'de' | 'vers'>) => `${c.de} → ${c.vers}`;
const SANS_CHANGEMENT = 'Pas de changement d’état : l’eau reste liquide';

/** Explication d'une mauvaise direction `choisi` quand la bonne est `vrai`. */
function pourquoi(vrai: Changement, choisi: Pick<Changement, 'de' | 'vers'>): string {
  if (choisi.de === vrai.vers && choisi.vers === vrai.de)
    return `C’est le contraire ! Ici, l’eau part de l’état ${vrai.de} pour aller vers l’état ${vrai.vers}.`;
  if (choisi.de !== vrai.de) return `Ici, l’eau part de l’état ${vrai.de}, pas de l’état ${choisi.de}.`;
  return `Ici, l’eau arrive à l’état ${vrai.vers}, pas à l’état ${choisi.vers}.`;
}

const memeChangement = (a: Pick<Changement, 'de' | 'vers'>, b: Pick<Changement, 'de' | 'vers'>) =>
  a.de === b.de && a.vers === b.vers;

export const eau: Skill = {
  id: 'pcm1-eau',
  title: 'L’eau et ses changements d’état',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’eau existe sous trois **états physiques** : la glace (solide), l’eau (liquide) et la vapeur d’eau (gaz).',
      'Un **changement d’état** est **réversible** : la glace fond en eau, et l’eau peut regeler en glace. Rien ne se perd, l’eau change juste d’état !',
    ],
    source: `${PROGRAMME} : « Identifier les différents états physiques de la matière dans la nature, en particulier ceux de l’eau » ; « Observer des changements d’état physique et leur réversibilité ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => {
    if (level === 1) {
      const vrai = rng.pick(ETATS);
      const exemple = rng.pick(EAU[vrai]);
      const { answer, traps } = choice(
        rng,
        vrai,
        ETATS.filter((e) => e !== vrai).map((e) => ({
          label: e,
          why: `${e === 'gazeux' ? 'L’eau à l’état gazeux, c’est la vapeur d’eau' : e === 'solide' ? 'L’eau à l’état solide, c’est la glace' : 'L’eau à l’état liquide, c’est l’eau qui coule'} : ce n’est pas le cas ici.`,
        })),
      );
      return {
        prompt: `« ${maj(exemple)} » : c’est de l’eau. À quel état physique ?`,
        answer,
        traps,
        hint: 'L’eau a trois visages : la glace, l’eau qui coule et la vapeur.',
        steps: [
          'L’eau existe sous trois états : glace (solide), eau (liquide), vapeur d’eau (gaz).',
          `Ici, on reconnaît l’état ${vrai}.`,
          `État physique : **${vrai}**.`,
        ],
        targetSeconds: 15,
      };
    }
    const vrai = rng.pick(CHANGEMENTS);
    const situation = rng.pick(vrai.situations);
    if (level === 2) {
      const bonne = sens(vrai);
      const { answer, traps } = choice(
        rng,
        bonne,
        CHANGEMENTS.filter((c) => !memeChangement(c, vrai)).map((c) => ({ label: sens(c), why: pourquoi(vrai, c) })),
      );
      return {
        prompt: `${situation}. Quel changement d’état de l’eau a lieu ?`,
        answer,
        traps,
        hint: 'Cherche l’état de l’eau au début, puis son état à la fin.',
        steps: [
          'On repère l’état de l’eau au départ, puis à l’arrivée.',
          `Au départ : ${vrai.de}. À l’arrivée : ${vrai.vers}.`,
          `Changement d’état : **${bonne}**.`,
        ],
        targetSeconds: 25,
      };
    }
    if (level === 3) {
      if (rng.int(0, 1) === 0) {
        const options = [...ETATS];
        const d = options.indexOf(vrai.de);
        const v = options.indexOf(vrai.vers);
        return {
          prompt: `${situation}. Complète la phrase.`,
          answer: {
            kind: 'cloze',
            parts: ['L’eau passe de l’état ', ' à l’état ', '.'],
            blanks: [
              { mode: 'list', options, correct: d },
              { mode: 'list', options, correct: v },
            ],
          },
          hint: 'Quel est l’état de l’eau avant ? Et après ?',
          steps: [
            'Avant, puis après : on regarde les deux états.',
            `Avant : ${vrai.de}. Après : ${vrai.vers}.`,
            `L’eau passe de l’état **${vrai.de}** à l’état **${vrai.vers}**.`,
          ],
          targetSeconds: 25,
        };
      }
      const chauffe = rng.int(0, 1) === 0;
      const ligne = ['la glace (solide)', 'l’eau (liquide)', 'la vapeur d’eau (gaz)'];
      const juste = chauffe ? ligne : [...ligne].reverse();
      return {
        prompt: chauffe
          ? 'On chauffe de la glace de plus en plus fort. Remets dans l’ordre les formes de l’eau qui apparaissent.'
          : 'On refroidit de la vapeur d’eau de plus en plus fort. Remets dans l’ordre les formes de l’eau qui apparaissent.',
        answer: ordre(rng, juste),
        hint: chauffe
          ? 'Chauffer, c’est donner de la chaleur : le solide devient liquide, puis gaz.'
          : 'Refroidir, c’est le contraire de chauffer.',
        steps: [
          chauffe
            ? 'Quand on chauffe, l’eau passe de solide à liquide, puis à gaz.'
            : 'Quand on refroidit, l’eau fait le chemin inverse : gaz, liquide, solide.',
          `Ordre : **${juste.join(' → ')}**.`,
        ],
        targetSeconds: 30,
      };
    }
    if (level === 4) {
      // Une série de situations par énoncé : un même énoncé attend toujours les mêmes paires.
      const serie = rng.int(0, 1);
      const paires = [
        ...CHANGEMENTS.map((c) => [c.situations[serie] ?? '', sens(c)] as const),
        ['L’eau chaude d’un bain refroidit sans geler', SANS_CHANGEMENT] as const,
      ];
      return {
        prompt: `Associe chaque situation au changement d’état de l’eau (série ${serie + 1}).`,
        answer: association(rng, paires),
        hint: 'Pour chaque situation, note l’état de l’eau au début et à la fin. Un cas ne change pas d’état !',
        steps: [
          'Pour chaque situation : état au début, état à la fin.',
          'Attention : l’eau d’un bain qui refroidit reste liquide, donc il n’y a pas de changement d’état.',
          `Le cas du bain est le seul sans changement : **${SANS_CHANGEMENT}**.`,
        ],
        targetSeconds: 60,
      };
    }
    // Niveau 5 : histoire en deux étapes, à analyser.
    const [a, b] = rng.pick<readonly [Changement, Changement]>([
      [FONTE, EBULLITION],
      [CONDENSATION, GEL],
      [GEL, FONTE],
    ]);
    const RECITS: Record<string, readonly string[]> = {
      '0-2': [
        'On pose un glaçon dans une casserole.',
        'On chauffe : le glaçon devient de l’eau.',
        'On chauffe encore : l’eau bout et part dans l’air sous forme de vapeur.',
      ],
      '3-1': [
        'De la vapeur d’eau touche un couvercle froid.',
        'Elle se transforme en gouttes d’eau.',
        'On verse ces gouttes dans un bac, puis on met le bac au congélateur : l’eau devient de la glace.',
      ],
      '1-0': [
        'Une flaque d’eau gèle pendant une nuit très froide.',
        'Au matin, le soleil se lève.',
        'La glace de la flaque fond : la flaque est de nouveau liquide.',
      ],
    };
    const cle = `${CHANGEMENTS.indexOf(a)}-${CHANGEMENTS.indexOf(b)}`;
    const texte = (x: Changement, y: Changement) => `${sens(x)}, puis ${sens(y)}`;
    const contraire = (c: Changement) => CHANGEMENTS.find((k) => k.de === c.vers && k.vers === c.de) ?? c;
    const bonne = texte(a, b);
    const { answer, traps } = choice(rng, bonne, [
      { label: texte(b, a), why: 'Les deux changements sont dans le désordre : relis l’histoire dans l’ordre.' },
      {
        label: texte(contraire(a), contraire(b)),
        why: 'Ce sont les changements contraires : dans l’histoire, l’eau fait le chemin inverse.',
      },
      {
        label: texte(a, contraire(b)),
        why: `Le premier changement est juste, mais le deuxième est à l’envers : l’eau passe de ${b.de} à ${b.vers}.`,
      },
    ]);
    return {
      prompt: 'Lis l’histoire. Quels changements d’état l’eau subit-elle, dans l’ordre ?',
      figure: { kind: 'document', title: 'Une histoire d’eau', lines: RECITS[cle] ?? [] },
      answer,
      traps,
      hint: 'Suis l’eau pas à pas : pour chaque phrase, note son état au début et à la fin.',
      steps: [
        `Premier changement : l’eau passe de ${a.de} à ${a.vers}.`,
        `Deuxième changement : l’eau passe de ${b.de} à ${b.vers}.`,
        `Dans l’ordre : **${bonne}**.`,
      ],
      targetSeconds: 50,
    };
  },
};
