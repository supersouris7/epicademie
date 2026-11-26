import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { ordre } from '../st/outils.ts';
import { PROGRAMME } from './donnees-terre.ts';
import { qcm, type Qcm } from './kit.ts';
import { associer, document, ecrire, termeQcm, variantes } from './terre-kit.ts';

// ——— Tectonique des plaques : dorsales, subduction, collision ———

const DEFS = {
  dorsale: 'une chaîne volcanique sous-marine où se forme un nouveau plancher océanique',
  subduction: 'l’enfoncement d’une plaque dans le manteau sous une autre plaque',
  collision: 'la rencontre de deux continents qui fait naître des montagnes',
  rift: 'une région longue et étroite où la lithosphère amincie se casse en failles et fossés',
  'plaque lithosphérique': 'un morceau rigide de la lithosphère qui se déplace sur l’asthénosphère',
  orogenèse: 'l’ensemble des processus qui forment les reliefs d’une chaîne de montagnes',
} as const;
type Terme = keyof typeof DEFS;
const TERMES = Object.keys(DEFS) as Terme[];

const INDICE = 'Les plaques s’écartent, se rapprochent, ou une région s’étire : lequel est décrit ?';

type Mouvement = 'dorsale' | 'subduction' | 'collision';

/** Observations (inventées) d'un mouvement de plaques. */
const OBSERVATIONS: readonly (readonly [string, Mouvement])[] = [
  ['Au fond de l’océan, deux plaques s’écartent et un nouveau plancher se forme', 'dorsale'],
  ['Des laves sortent au fond de l’océan sur une longue chaîne où les plaques se séparent', 'dorsale'],
  ['Une plaque océanique ancienne et dense s’enfonce dans le manteau', 'subduction'],
  ['Une plaque plonge sous une autre au bord d’un océan', 'subduction'],
  ['Un océan s’est refermé et deux continents se heurtent, soulevant des montagnes', 'collision'],
  ['Deux masses continentales se poussent l’une contre l’autre et un relief se forme', 'collision'],
];

const POURQUOI: Readonly<Record<Mouvement, string>> = {
  dorsale: 'Sur une dorsale, les plaques se séparent et un plancher océanique se forme.',
  subduction: 'En subduction, une plaque plonge dans le manteau sous une autre.',
  collision: 'La collision rapproche deux continents après la fermeture d’un océan.',
};

const phenomene = ([texte, type]: readonly [string, Mouvement]): Qcm => ({
  prompt: `« ${texte}. » Quel phénomène est décrit ?`,
  bonne: type,
  fausses: [
    ...(['dorsale', 'subduction', 'collision'] as const)
      .filter((x) => x !== type)
      .map((x) => [x, POURQUOI[x]] as const),
    ['érosion', 'L’érosion use les reliefs à la surface : elle ne déplace pas les plaques.'],
  ],
  indice: 'Regarde dans quel sens bougent les plaques ou les continents.',
  explication: [POURQUOI[type]],
});

const CYCLE = [
  'Un océan s’ouvre',
  'Des sédiments se déposent au fond de l’océan',
  'L’océan se referme',
  'Les continents entrent en collision',
  'Une chaîne de montagnes apparaît',
];

const FOND = [
  'Une plaque se forme sur la dorsale',
  'Elle s’éloigne peu à peu de la dorsale',
  'En vieillissant, elle devient plus dense',
  'Elle plonge dans le manteau en subduction',
];

const SAISIES: readonly {
  readonly t: Terme;
  readonly accepted: readonly string[];
  readonly erreurs: readonly Terme[];
}[] = [
  {
    t: 'dorsale',
    accepted: [...variantes('dorsale', 'la', 'une'), 'dorsale océanique', 'une dorsale océanique'],
    erreurs: ['rift', 'subduction'],
  },
  { t: 'subduction', accepted: variantes('subduction', 'la', 'une'), erreurs: ['collision', 'dorsale'] },
  { t: 'collision', accepted: variantes('collision', 'la', 'une'), erreurs: ['subduction'] },
  { t: 'rift', accepted: variantes('rift', 'le', 'un'), erreurs: ['dorsale'] },
  { t: 'orogenèse', accepted: variantes('orogenèse', 'l’', 'une'), erreurs: ['collision'] },
];

/** Niveau 5 : relevés inventés de balises GPS posées de part et d'autre d'une frontière de plaques. */
function releve(rng: Rng): QuestionDraft {
  const lieu = rng.pick(['Ardel', 'Bresmont', 'Cairn']);
  const forme = rng.int(0, 1);
  if (forme === 0) {
    const vitesse = rng.int(2, 7);
    const ecarte = rng.int(0, 1) === 0;
    const metres = vitesse * 10;
    const lines = [
      `Réseau de balises « ${lieu} » (inventé) : deux balises placées de part et d’autre d’une frontière.`,
      `La distance entre elles ${ecarte ? 'augmente' : 'diminue'} de ${vitesse} cm par an.`,
      'On suppose que cette vitesse reste constante.',
    ];
    const q = qcm(
      rng,
      {
        prompt: `D’après le relevé « ${lieu} » (${vitesse} cm par an), de combien la distance ${ecarte ? 'augmente' : 'diminue'}-t-elle en 1 000 ans ?`,
        bonne: `${metres} m`,
        fausses: [
          [`${vitesse} 000 m`, 'Les centimètres n’ont pas été convertis : 100 cm valent 1 m.'],
          [`${vitesse} m`, 'C’est la distance parcourue en 100 ans, pas en 1 000 ans.'],
          [`${vitesse} 000 km`, 'Les centimètres ont été pris pour des kilomètres.'],
        ],
        indice: 'Multiplie par 1 000, puis convertis les centimètres en mètres.',
        explication: [`${vitesse} cm × 1 000 = ${vitesse} 000 cm, soit ${metres} m.`],
      },
      60,
    );
    return { ...q, figure: document(`Relevé : ${lieu}`, lines) };
  }
  const [observation, type] = rng.pick([
    ['la distance entre les balises augmente et des laves sortent au fond de l’eau', 'dorsale'],
    ['une plaque s’enfonce sous l’autre et des séismes se produisent en profondeur', 'subduction'],
    ['les deux continents se rapprochent et le relief s’élève', 'collision'],
  ] as const);
  const q = qcm(
    rng,
    {
      prompt: `Au site « ${lieu} », ${observation}. Quel type de frontière de plaques est le plus probable ?`,
      bonne: type,
      fausses: [
        ...(['dorsale', 'subduction', 'collision'] as const)
          .filter((x) => x !== type)
          .map((x) => [x, POURQUOI[x]] as const),
        ['séisme', 'Un séisme est un événement (une rupture), pas un type de frontière.'],
      ],
      indice: 'Les plaques s’éloignent-elles, plongent-elles ou se heurtent-elles ?',
      explication: [POURQUOI[type], 'Les séismes et le volcanisme sont fréquents aux limites des plaques.'],
    },
    45,
  );
  return {
    ...q,
    figure: document(`Carnet : ${lieu}`, [`Site « ${lieu} » (inventé).`, `Observation : ${observation}.`]),
  };
}

export const tectonique: Skill = {
  id: 'v4-tectonique-plaques',
  title: 'La tectonique des plaques',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La lithosphère est découpée en **plaques tectoniques** rigides qui glissent lentement sur l’asthénosphère, de quelques centimètres par an. Séismes et volcans se concentrent souvent à leurs limites.',
      'Sur une **dorsale**, les plaques s’écartent ; en **subduction**, une plaque plonge dans le manteau ; la **collision** de continents élève des montagnes.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « dynamique interne et tectonique des plaques lithosphériques ».`,
    sources: [
      PROGRAMME,
      'academie-plaque',
      'academie-rift',
      'academie-orogenese',
      'insu-tectonique-debut',
      'insu-dorsale',
      'insu-subduction-carbone',
      'insu-antilles',
      'insu-moho',
      'brgm-roches-alpes',
      'brgm-mayotte',
    ],
  },
  generate: (rng, level) => {
    if (level === 1) {
      const t = rng.pick(['dorsale', 'subduction', 'collision'] as const);
      return qcm(
        rng,
        termeQcm(
          DEFS,
          t,
          (['dorsale', 'subduction', 'collision'] as const).filter((x) => x !== t),
          INDICE,
        ),
        30,
      );
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) return qcm(rng, phenomene(rng.pick(OBSERVATIONS)), 35);
      const t = rng.pick(TERMES);
      // « Collision » et « orogenèse » parlent toutes deux de montagnes : jamais proposées ensemble.
      const voisin: Partial<Record<Terme, Terme>> = { collision: 'orogenèse', orogenèse: 'collision' };
      const autres = rng.shuffle(TERMES.filter((x) => x !== t && x !== voisin[t])).slice(0, 3);
      return qcm(rng, termeQcm(DEFS, t, autres, INDICE), 40);
    }
    if (level === 3) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        const montagne = rng.int(0, 1) === 0;
        const suite = montagne ? CYCLE : FOND;
        return {
          prompt: montagne
            ? 'Remets dans l’ordre le cycle qui mène à une chaîne de montagnes.'
            : 'Remets dans l’ordre la vie d’une plaque océanique.',
          answer: ordre(rng, suite),
          hint: montagne ? 'La montagne apparaît à la fin du cycle.' : 'La plaque naît à la dorsale.',
          steps: [
            montagne
              ? 'Un océan s’ouvre, se remplit de sédiments puis se referme.'
              : 'La plaque naît, s’éloigne, vieillit puis plonge.',
            `Dernière étape : **${suite[suite.length - 1]}**.`,
          ],
          targetSeconds: 60,
        };
      }
      if (forme === 1) {
        const s = rng.int(0, 1) === 0;
        return {
          prompt: `Complète la phrase sur ${s ? 'les dorsales' : 'la subduction'}.`,
          answer: s
            ? {
                kind: 'cloze',
                parts: ['Sur une dorsale, les plaques ', ' et un nouveau plancher ', ' se forme.'],
                blanks: [
                  { mode: 'list', options: ['s’écartent', 'se rapprochent', 'restent soudées'], correct: 0 },
                  { mode: 'list', options: ['continental', 'océanique', 'atmosphérique'], correct: 1 },
                ],
              }
            : {
                kind: 'cloze',
                parts: ['En vieillissant, une plaque devient plus ', ' et plonge dans le ', '.'],
                blanks: [
                  { mode: 'list', options: ['légère', 'dense', 'chaude'], correct: 1 },
                  { mode: 'list', options: ['manteau', 'noyau', 'ciel'], correct: 0 },
                ],
              },
          hint: s ? 'Une dorsale fabrique du fond marin.' : 'Une plaque qui plonge est devenue lourde.',
          steps: [
            s ? POURQUOI.dorsale : 'La densité augmente avec l’âge : la plaque s’enfonce.',
            s ? 'Les plaques **s’écartent**.' : 'Elle plonge dans le **manteau**.',
          ],
          targetSeconds: 35,
        };
      }
      return {
        prompt: 'Complète : sur quoi se déplacent les plaques ?',
        answer: {
          kind: 'cloze',
          parts: ['Les plaques de la ', ' rigide se déplacent sur l’', '.'],
          blanks: [
            { mode: 'list', options: ['lithosphère', 'graine', 'atmosphère'], correct: 0 },
            { mode: 'list', options: ['hydrosphère', 'asthénosphère', 'écorce'], correct: 1 },
          ],
        },
        hint: 'Souviens-toi des deux enveloppes empilées.',
        steps: [
          'Les plaques sont des morceaux de l’enveloppe rigide, posés sur une couche déformable.',
          'Ce sont la **lithosphère** et l’**asthénosphère**.',
        ],
        targetSeconds: 30,
      };
    }
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        const serie = rng.int(0, 1);
        const paires: readonly (readonly [string, string])[] =
          serie === 0
            ? TERMES.filter((t) => t !== 'orogenèse').map((t) => [t, DEFS[t]] as const)
            : [
                ['Dorsale', 'les plaques s’écartent'],
                ['Rift', 'la lithosphère amincie se casse en failles et fossés'],
                ['Pyrénées', 'issues de la collision de la plaque Europe avec une autre plaque'],
                ['Petites Antilles', 'des plaques s’enfoncent sous la plaque des Caraïbes'],
                ['Madagascar', 's’est séparée de l’Afrique en se déplaçant'],
              ];
        return associer(
          rng,
          paires,
          {
            prompt:
              serie === 0
                ? 'Associe chaque terme de la tectonique à sa définition.'
                : 'Associe chaque exemple à ce qui lui correspond.',
            indice: 'Commence par les paires dont tu es sûr.',
            explication: 'On relie chaque terme ou lieu au mouvement de plaques qui le définit.',
          },
          75,
        );
      }
      const s = rng.pick(SAISIES);
      return ecrire(
        {
          prompt: `Écris le terme qui désigne ${DEFS[s.t]}.`,
          accepted: s.accepted,
          erreurs: s.erreurs.map((e) => [e, `« ${e} » désigne ${DEFS[e]}.`]),
          indice: INDICE,
          explication: `La définition décrit ${DEFS[s.t]}.`,
        },
        35,
      );
    }
    return releve(rng);
  },
};
