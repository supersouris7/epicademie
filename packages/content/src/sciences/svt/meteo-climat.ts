import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Skill } from '../../types.ts';
import { association, ordre, saisie } from '../st/outils.ts';
import { ECO_CLIMAT, MF_HEXAGONE, MF_METEO, MF_OUTREMER, MF_SYSTEME, MF_VENT, PROGRAMME } from './donnees.ts';
import { qcm, type Qcm } from './kit.ts';

// ——— Météo et climat : le temps d'un jour, la moyenne sur des décennies, le vent, l'effet de serre ———

type Genre = 'meteo' | 'climat';

/** Phrases inventées : seul compte le fait de parler d'un instant ou d'une longue moyenne. */
const PHRASES: readonly (readonly [string, Genre])[] = [
  ['Ce matin, il neige sur la ville.', 'meteo'],
  ['Demain après-midi, des orages sont annoncés.', 'meteo'],
  ['En ce moment, le vent souffle fort sur le port.', 'meteo'],
  ['Ce week-end, il fera plus froid que cette semaine.', 'meteo'],
  ['Sur 30 ans, les hivers de cette région sont doux en moyenne.', 'climat'],
  ['Depuis plusieurs décennies, il pleut en moyenne beaucoup dans cette région.', 'climat'],
  ['En moyenne sur 30 ans, les étés y sont chauds et secs.', 'climat'],
  ['La température moyenne calculée sur 30 ans est élevée toute l’année sur cette île.', 'climat'],
];

const phrase = ([texte, genre]: readonly [string, Genre]): Qcm => {
  const meteo = genre === 'meteo';
  return {
    prompt: `« ${texte} » Cette phrase parle de…`,
    bonne: meteo ? 'la météo' : 'le climat',
    fausses: [
      [
        meteo ? 'le climat' : 'la météo',
        meteo
          ? 'Le climat est une moyenne sur plusieurs décennies ; ici on parle d’un moment précis.'
          : 'La météo est le temps à un instant donné ; ici on parle d’une moyenne sur une longue période.',
      ],
      ['la géologie', 'La géologie étudie les roches et le sous-sol, pas le temps qu’il fait.'],
    ],
    indice: 'Un moment précis, ou une moyenne sur des dizaines d’années ?',
    explication: [
      'La météo décrit le temps à un instant et à un endroit ; le climat est une moyenne sur plusieurs décennies.',
      meteo ? 'La phrase parle d’un moment précis.' : 'La phrase parle d’une moyenne sur une longue période.',
    ],
  };
};

const DEFINITIONS: Record<string, string> = {
  météo: 'le temps qu’il fait à un instant et à un endroit donnés',
  climat: 'la moyenne des conditions météorologiques sur plusieurs décennies',
  vent: 'le mouvement horizontal de l’air',
  'effet de serre': 'le phénomène par lequel certains gaz retiennent une partie du rayonnement émis par la Terre',
};
const NOMS = Object.keys(DEFINITIONS);

/** Ce qui distingue chaque mot des trois autres. */
const REPERES: Record<string, string> = {
  météo: 'Elle porte sur un moment précis, pas sur une longue période.',
  climat: 'Il résume de nombreuses années d’observations, pas un seul jour.',
  vent: 'Il s’agit d’air qui se déplace.',
  'effet de serre': 'Il s’agit de chaleur retenue par des gaz de l’atmosphère.',
};

const definition = (nom: string): Qcm => ({
  prompt: `Quelle définition correspond à « ${nom} » ?`,
  bonne: DEFINITIONS[nom] ?? '',
  fausses: NOMS.filter((n) => n !== nom).map((n) => [
    DEFINITIONS[n] ?? '',
    `Cette définition est celle de « ${n} », pas celle de « ${nom} ».`,
  ]),
  indice: 'Demande-toi si on parle d’un instant, d’une longue moyenne, de l’air en mouvement ou de chaleur retenue.',
  explication: [`On cherche le sens précis du mot « ${nom} ». ${REPERES[nom] ?? ''}`],
});

const CHAINE = [
  'Les activités humaines émettent des gaz à effet de serre',
  'La quantité de ces gaz augmente dans l’atmosphère',
  'Une partie plus grande du rayonnement émis par la Terre est retenue',
  'La température de la surface terrestre augmente',
];

const MOTS = [
  {
    mot: 'anticyclone',
    accepted: ['anticyclone', 'un anticyclone', 'l’anticyclone'],
    indice: 'C’est une zone de hautes pressions.',
    question: 'Comment appelle-t-on une zone de hautes pressions atmosphériques ?',
    autre: 'dépression',
    pourquoi: 'La dépression est au contraire une zone de basses pressions.',
  },
  {
    mot: 'dépression',
    accepted: ['dépression', 'depression', 'une dépression', 'la dépression'],
    indice: 'C’est une zone de basses pressions.',
    question: 'Comment appelle-t-on une zone de basses pressions atmosphériques ?',
    autre: 'anticyclone',
    pourquoi: 'L’anticyclone est au contraire une zone de hautes pressions.',
  },
  {
    mot: 'vent',
    accepted: ['vent', 'le vent'],
    indice: 'On le sent sur son visage quand l’air se déplace.',
    question: 'Comment nomme-t-on, en météorologie, le mouvement horizontal de l’air ?',
    autre: 'courant marin',
    pourquoi: 'Un courant marin est un déplacement d’eau dans l’océan, pas d’air.',
  },
  {
    mot: 'effet de serre',
    accepted: ['effet de serre', 'l’effet de serre'],
    indice: 'Pense à l’abri vitré où un jardinier garde ses plantes au chaud : l’expression compte trois mots.',
    question: 'Quel phénomène permet à certains gaz de retenir une partie du rayonnement émis par la Terre ?',
    autre: 'météo',
    pourquoi: 'La météo est le temps qu’il fait : ce n’est pas le phénomène qui retient la chaleur.',
  },
  {
    mot: 'climat',
    accepted: ['climat', 'le climat'],
    indice: 'Il se calcule avec des moyennes sur des dizaines d’années.',
    question: 'Quel mot désigne la moyenne des conditions météorologiques sur plusieurs décennies ?',
    autre: 'météo',
    pourquoi: 'La météo est le temps à un instant donné, pas une moyenne sur des décennies.',
  },
] as const;

const PAIRES = [
  ['la météo', 'le temps à un instant et un endroit donnés'],
  ['le climat', 'une moyenne sur plusieurs décennies'],
  ['le vent', 'le mouvement horizontal de l’air'],
  ['l’anticyclone', 'une zone de hautes pressions'],
  ['la dépression', 'une zone de basses pressions'],
  ['les courants marins', 'des déplacements d’eau qui redistribuent la chaleur'],
] as const;

export const meteoClimat: Skill = {
  id: 'v5-meteo-climat',
  title: 'Météo et climat',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **météo**, c’est le temps à un instant et un endroit donnés ; le **climat**, c’est la moyenne sur plusieurs décennies (souvent 30 ans). Une semaine froide ne change pas le climat.',
      'L’air va des zones de hautes **pressions** (**anticyclones**) vers les zones de basses pressions (**dépressions**) : c’est le **vent**. Les gaz à **effet de serre** ajoutés par les activités humaines réchauffent la planète.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Différence entre météo et climat ; Les grandes zones climatiques de la Terre » ; « Les changements climatiques passés (temps géologiques) et actuels ».`,
    sources: [PROGRAMME, MF_METEO, MF_VENT, MF_SYSTEME, MF_HEXAGONE, MF_OUTREMER, ECO_CLIMAT],
  },
  generate: (rng, level) => {
    if (level === 1) return qcm(rng, phrase(rng.pick(PHRASES)), 20);
    if (level === 2) {
      if (rng.int(0, 1) === 0) return qcm(rng, definition(rng.pick(NOMS)), 30);
      const zones = rng.shuffle([
        ['la France métropolitaine (l’Hexagone)', 'climat tempéré'],
        ['la Martinique', 'climat tropical'],
        ['la Guyane', 'climat équatorial et humide'],
      ] as const);
      return {
        prompt: `Associe chaque territoire à son climat : ${zones.map((z) => z[0]).join(', ')}.`,
        answer: association(rng, zones),
        hint: 'La Guyane est la plus proche de l’équateur, et l’Hexagone est à une latitude moyenne.',
        steps: [
          'Chaque climat dépend notamment de la distance à l’équateur.',
          'Guyane : équatorial ; Martinique : tropical ; Hexagone : **tempéré**.',
        ],
        targetSeconds: 35,
      };
    }
    if (level === 3) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        return {
          prompt: 'Remets dans l’ordre la chaîne qui explique le réchauffement actuel.',
          answer: ordre(rng, CHAINE),
          hint: 'Commence par la cause (les activités humaines) et finis par la conséquence sur la température.',
          steps: [
            'Les activités humaines émettent des gaz, qui s’accumulent, retiennent plus de rayonnement, puis réchauffent.',
            `Fin de la chaîne : **${CHAINE[CHAINE.length - 1]}**.`,
          ],
          targetSeconds: 45,
        };
      }
      if (forme === 1) {
        const options = rng.shuffle(['hautes', 'basses']);
        return {
          prompt: 'Complète la phrase qui explique d’où vient le vent.',
          answer: {
            kind: 'cloze',
            parts: ['L’air s’écoule des zones de ', ' pressions vers les zones de ', ' pressions.'],
            blanks: [
              { mode: 'list', options, correct: options.indexOf('hautes') },
              { mode: 'list', options, correct: options.indexOf('basses') },
            ],
          },
          hint: 'Pense à l’air qui s’échappe d’un ballon gonflé : où la pression est-elle la plus forte ?',
          steps: [
            'L’air se déplace parce que la pression change d’un endroit à l’autre.',
            'Il va des **hautes** vers les **basses** pressions.',
          ],
          targetSeconds: 30,
        };
      }
      return {
        prompt: 'Complète la définition du climat.',
        answer: {
          kind: 'cloze',
          parts: ['Le climat est une ', ' des conditions météorologiques sur plusieurs ', '.'],
          blanks: [
            { mode: 'list', options: ['prévision', 'moyenne', 'mesure du jour'], correct: 1 },
            { mode: 'list', options: ['heures', 'jours', 'décennies'], correct: 2 },
          ],
        },
        hint: 'Le climat résume une très longue période.',
        steps: [
          'Le climat ne décrit pas un jour : il résume beaucoup d’observations.',
          'C’est une **moyenne** sur plusieurs **décennies**.',
        ],
        targetSeconds: 30,
      };
    }
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        const serie = rng.int(0, 1);
        const paires = serie === 0 ? PAIRES.slice(0, 5) : PAIRES.slice(1, 6);
        return {
          prompt: `Associe chaque mot à son sens : ${paires.map((p) => p[0]).join(', ')}.`,
          answer: association(rng, paires),
          hint: 'Sépare ce qui décrit le temps, la pression de l’air et l’océan.',
          steps: [
            'On traite d’abord le temps et le climat, puis l’air et la pression.',
            `Par exemple, ${paires[0]?.[0]} : **${paires[0]?.[1]}**.`,
          ],
          targetSeconds: 60,
        };
      }
      const m = rng.pick(MOTS);
      const { answer, traps: pieges } = saisie(m.accepted, [[m.autre, m.pourquoi]]);
      return {
        prompt: m.question,
        answer,
        traps: pieges,
        hint: m.indice,
        steps: ['On cherche le mot précis du vocabulaire de la météo et du climat.', `C’est : **${m.mot}**.`],
        targetSeconds: 30,
      };
    }
    // Niveau 5 : relevé d'un document inventé.
    const normale = rng.int(16, 24);
    const ecart = rng.int(4, 9);
    const chaud = rng.int(0, 1) === 0;
    const releve = chaud ? normale + ecart : normale - ecart;
    const lines = [
      `Station fictive de Clairval : température habituelle d’un après-midi de juin, appelée « normale » (moyenne sur 30 ans) : ${normale} °C.`,
      `Cette semaine de juin, on a relevé ${releve} °C l’après-midi.`,
    ];
    const figure = {
      kind: 'document' as const,
      title: 'Relevé de station',
      lines,
      credit: 'Document écrit pour l’exercice',
    };
    if (rng.int(0, 1) === 0) {
      const correct = r(ecart);
      return {
        prompt: `De combien de degrés la température relevée (${releve} °C) s’écarte-t-elle de la normale (${normale} °C) ?`,
        figure,
        answer: num(correct, '°C'),
        traps: traps(correct, [
          [releve + normale, 'Un écart se calcule par une soustraction, pas par une addition.'],
          [releve, 'C’est la température relevée, pas l’écart avec la normale.'],
          [normale, 'C’est la normale, pas l’écart.'],
          [
            releve - normale,
            'L’écart demandé est un nombre de degrés, sans signe moins : retire la plus petite valeur de la plus grande.',
          ],
        ]),
        hint: 'Compare le relevé à la moyenne sur 30 ans en faisant une différence.',
        steps: [
          `Écart = ${Math.max(releve, normale)} − ${Math.min(releve, normale)}.`,
          `L’écart avec la normale est de **${ecart} °C**.`,
        ],
        targetSeconds: 40,
      };
    }
    return qcm(
      rng,
      {
        prompt: `Une semaine à ${releve} °C pour une normale de ${normale} °C : que peut-on conclure ?`,
        bonne: 'C’est un épisode de météo : une seule semaine ne suffit pas à décrire le climat',
        fausses: [
          [
            chaud ? 'Le climat de Clairval a changé en une semaine' : 'Le réchauffement climatique n’existe pas',
            'Le climat s’étudie sur de longues périodes : un épisode isolé ne prouve ni ne contredit la tendance.',
          ],
          [
            'La normale sur 30 ans devient la température relevée cette semaine',
            'Une normale est une moyenne sur 30 ans : une semaine ne la remplace pas.',
          ],
          [
            'La température de la semaine donne le climat de toute l’année',
            'Une semaine de juin ne représente ni une année ni des décennies.',
          ],
        ],
        indice: 'Distingue ce qui dure une semaine de ce qui se mesure sur des décennies.',
        explication: [
          'Le relevé ne couvre qu’une semaine : c’est de la météo.',
          'Pour parler de climat, il faut des moyennes sur des dizaines d’années.',
        ],
      },
      45,
    );
  },
};
