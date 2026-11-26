import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { ordre } from '../st/outils.ts';
import { PROGRAMME } from './donnees-terre.ts';
import { qcm } from './kit.ts';
import { associer, document, ecrire, variantes } from './terre-kit.ts';

// ——— Histoire de la Terre : échelle des temps, ères géologiques, fossiles, crises ———

type Ere = 'Précambrien' | 'Paléozoïque' | 'Mésozoïque' | 'Cénozoïque';
const ERES: readonly Ere[] = ['Précambrien', 'Paléozoïque', 'Mésozoïque', 'Cénozoïque'];

const BORNES: Readonly<Record<Ere, string>> = {
  Précambrien: 'des origines de la Terre à environ 540 millions d’années',
  Paléozoïque: 'd’environ 540 à 252 millions d’années (ère primaire)',
  Mésozoïque: 'de 252 à environ 66 millions d’années (ère secondaire)',
  Cénozoïque: 'depuis environ 66 millions d’années (ères tertiaire et quaternaire)',
};

const REPERES: readonly { readonly texte: string; readonly ere: Ere }[] = [
  {
    texte: 'cette division se termine par la plus grande extinction connue, il y a 252 millions d’années',
    ere: 'Paléozoïque',
  },
  {
    texte: 'cette division s’achève il y a environ 66 millions d’années, quand les dinosaures disparaissent',
    ere: 'Mésozoïque',
  },
  { texte: 'cette division contient le Quaternaire, la période la plus récente', ere: 'Cénozoïque' },
  { texte: 'cette division précède l’ère primaire : elle a plus de 540 millions d’années', ere: 'Précambrien' },
  { texte: 'le Trias, entre 252 et 201 millions d’années, appartient à cette division', ere: 'Mésozoïque' },
];

const ereQcm = (rng: Rng, texte: string, ere: Ere, seconds: number) =>
  qcm(
    rng,
    {
      prompt: `Quelle grande division des temps géologiques est décrite : ${texte} ?`,
      bonne: ere,
      fausses: ERES.filter((e) => e !== ere).map((e) => [e, `${e} : ${BORNES[e]}.`]),
      indice:
        'Place la date sur la frise : avant 540, entre 540 et 252, entre 252 et 66, ou après 66 millions d’années.',
      explication: [`${ere} : ${BORNES[ere]}.`],
    },
    seconds,
  );

const CHRONOLOGIE = [
  'Formation de la Terre, il y a environ 4,5 milliards d’années',
  'Début de l’ère primaire, il y a environ 540 millions d’années',
  'Plus grande extinction connue, il y a 252 millions d’années',
  'Disparition des dinosaures, il y a environ 66 millions d’années',
  'Quaternaire : le genre Homo se répand en Eurasie',
];

const DEFS = {
  fossile: 'un vestige, une empreinte ou une trace d’un être vivant conservé dans les couches sédimentaires',
  ère: 'une grande division de l’histoire de la Terre',
  paléontologie: 'la science qui étudie les êtres vivants des temps géologiques disparus, connus par leurs fossiles',
} as const;
type Terme = keyof typeof DEFS;

/** Pourquoi : trace, durée ou science. */
const POURQUOI: Readonly<Record<Terme, string>> = {
  fossile: 'On parle d’une trace laissée dans la roche, pas d’une durée ni d’une science.',
  ère: 'On parle d’une durée : une grande tranche de l’histoire de la Terre.',
  paléontologie: 'On parle d’une science ; « paléo » veut dire « ancien ».',
};

const SAISIES: readonly {
  readonly prompt: string;
  readonly accepted: readonly string[];
  readonly erreurs: readonly (readonly [string, string])[];
  readonly explication: string;
}[] = [
  {
    prompt: `Écris le terme qui désigne ${DEFS.fossile}.`,
    accepted: variantes('fossile', 'un', 'le'),
    erreurs: [['sédiment', 'Le sédiment est le dépôt qui peut renfermer des restes, pas la trace elle-même.']],
    explication: `La définition décrit ${DEFS.fossile}.`,
  },
  {
    prompt: `Écris le terme qui désigne ${DEFS.paléontologie}.`,
    accepted: variantes('paléontologie', 'la'),
    erreurs: [['archéologie', 'L’archéologie étudie les traces laissées par les sociétés humaines.']],
    explication: `La définition décrit ${DEFS.paléontologie}.`,
  },
  {
    prompt: 'Écris le nom de l’ère aussi appelée « ère primaire ».',
    accepted: [...variantes('Paléozoïque', 'le', 'l’ère', 'ère'), 'paléozoique'],
    erreurs: [
      ['Mésozoïque', 'Le Mésozoïque est l’ère secondaire.'],
      ['Précambrien', 'Le Précambrien précède l’ère primaire.'],
    ],
    explication: 'L’ère primaire porte aussi un nom qui signifie « vie ancienne ».',
  },
  {
    prompt: 'Écris le nom de l’ère aussi appelée « ère secondaire ».',
    accepted: [...variantes('Mésozoïque', 'le', 'l’ère', 'ère'), 'mésozoique'],
    erreurs: [
      ['Paléozoïque', 'Le Paléozoïque est l’ère primaire.'],
      ['Cénozoïque', 'Le Cénozoïque regroupe le tertiaire et le quaternaire.'],
    ],
    explication: 'L’ère secondaire est l’ère « du milieu ».',
  },
  {
    prompt: 'Écris le nom de l’ère qui commence il y a environ 66 millions d’années et dure encore.',
    accepted: [...variantes('Cénozoïque', 'le', 'l’ère', 'ère'), 'cénozoique'],
    erreurs: [
      ['Mésozoïque', 'Le Mésozoïque s’est achevé il y a environ 66 millions d’années.'],
      ['tertiaire', 'Le tertiaire n’est qu’une partie de cette ère : il manque le quaternaire.'],
    ],
    explication: 'C’est l’ère la plus récente.',
  },
];

/** Niveau 5 : coupe géologique inventée (couches non retournées). */
function coupe(rng: Rng): QuestionDraft {
  const lieu = rng.pick(['Montsel', 'Brécourt', 'Combelle']);
  const lines = [
    `Coupe de ${lieu} (lieu inventé). Les couches n’ont pas été retournées.`,
    'Couche 1 (en bas) : calcaire avec des coquilles d’ammonites.',
    'Couche 2 (au milieu) : argile.',
    'Couche 3 (en haut) : sable avec des restes d’un mammifère.',
  ];
  const figure = document(`Coupe : ${lieu}`, lines);
  const forme = rng.int(0, 2);
  if (forme === 0) {
    const plusAncienne = rng.int(0, 1) === 0;
    const q = qcm(
      rng,
      {
        prompt: `Sur la coupe de ${lieu}, quelle couche s’est déposée ${plusAncienne ? 'en premier' : 'en dernier'} ?`,
        bonne: plusAncienne ? 'la couche 1' : 'la couche 3',
        fausses: [
          [
            plusAncienne ? 'la couche 3' : 'la couche 1',
            'Dans un empilement non retourné, le bas s’est déposé avant le haut.',
          ],
          ['la couche 2', 'La couche du milieu s’est déposée entre les deux autres.'],
          ['les trois en même temps', 'Les sédiments s’accumulent les uns au-dessus des autres, couche après couche.'],
        ],
        indice: 'Les sédiments s’empilent : le premier dépôt est dessous.',
        explication: ['Dans un empilement non retourné, la couche du bas est la plus ancienne.'],
      },
      45,
    );
    return { ...q, figure };
  }
  if (forme === 1) {
    const q = qcm(
      rng,
      {
        prompt: `Sur la coupe de ${lieu}, les ammonites de la couche 1 indiquent des terrains de quelle ère ?`,
        bonne: 'l’ère secondaire (Mésozoïque)',
        fausses: [
          [
            'l’ère primaire (Paléozoïque)',
            'Les ammonites sont des fossiles caractéristiques des terrains secondaires.',
          ],
          ['le Précambrien', 'Les ammonites sont caractéristiques de l’ère secondaire, bien plus récente.'],
          ['le Quaternaire', 'Le Quaternaire est la période la plus récente ; les ammonites sont bien plus anciennes.'],
        ],
        indice: 'Un fossile caractéristique permet de dater les terrains qui le contiennent.',
        explication: ['Les ammonites sont caractéristiques des terrains secondaires.'],
      },
      45,
    );
    return { ...q, figure };
  }
  const q = qcm(
    rng,
    {
      prompt: `Sur la coupe de ${lieu}, comment les géologues peuvent-ils comparer ces couches à des couches d’une autre région ?`,
      bonne: 'En comparant les fossiles qu’elles contiennent',
      fausses: [
        [
          'En comparant seulement leur épaisseur',
          'L’épaisseur dépend de la quantité de dépôts : elle ne date pas la couche.',
        ],
        [
          'En comparant la température actuelle du sol',
          'La température d’aujourd’hui ne renseigne pas sur l’âge du dépôt.',
        ],
        [
          'En comptant les maisons construites dessus',
          'L’occupation actuelle du sol ne dit rien de l’histoire géologique.',
        ],
      ],
      indice: 'Les divisions du temps géologique reposent sur des traces de vie.',
      explication: ['Les subdivisions géologiques du temps sont basées sur les formes de vie fossiles des couches.'],
    },
    45,
  );
  return { ...q, figure };
}

export const histoireTerre: Skill = {
  id: 'v4-histoire-terre',
  title: 'L’histoire de la Terre',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La Terre a environ 4,5 milliards d’années. Les traces de vie conservées dans les couches, comme **un fossile** d’ammonite, aident à découper son histoire en **ères géologiques**.',
      'Après le **Précambrien** : Paléozoïque (primaire), Mésozoïque (secondaire), puis Cénozoïque. Des **crises biologiques** (252 et 66 millions d’années) marquent deux limites.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Ères géologiques. »`,
    sources: [
      PROGRAMME,
      'brgm-voyage-temps-geologiques',
      'brgm-temps-geologiques',
      'brgm-roches-alpes',
      'brgm-cycle-roches',
      'insu-extinction-primaire',
      'insu-dinosaures',
      'academie-fossile',
      'academie-ere',
      'academie-paleontologie',
      'academie-paleozoique',
      'cnrtl-mesozoique',
      'cnrtl-cenozoique',
      'academie-ammonite',
    ],
  },
  generate: (rng, level) => {
    if (level === 1) {
      const forme = rng.int(0, 2);
      if (forme === 0)
        return qcm(
          rng,
          {
            prompt: 'Quel est l’âge approximatif de la Terre ?',
            bonne: 'environ 4,5 milliards d’années',
            fausses: [
              [
                'environ 4 500 ans',
                'C’est la durée de quelques millénaires d’histoire humaine, pas celle de la Terre.',
              ],
              ['environ 66 millions d’années', 'C’est la date de la disparition des dinosaures.'],
            ],
            indice: 'Il faut compter en milliards.',
            explication: ['La Terre a une histoire d’environ 4,5 milliards d’années.'],
          },
          25,
        );
      const t: Terme = forme === 1 ? 'fossile' : 'ère';
      const autres: readonly Terme[] = (['fossile', 'ère', 'paléontologie'] as const).filter((x) => x !== t);
      return qcm(
        rng,
        {
          prompt: `Quel terme désigne ${DEFS[t]} ?`,
          bonne: t,
          fausses: autres.map((a) => [a, `Le terme « ${a} » désigne ${DEFS[a]}.`]),
          indice: 'S’agit-il d’une trace, d’une durée ou d’une science ?',
          explication: [`La définition décrit ${DEFS[t]}.`, POURQUOI[t]],
        },
        25,
      );
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) {
        const r = rng.pick(REPERES);
        return ereQcm(rng, r.texte, r.ere, 40);
      }
      const trois = rng.shuffle(ERES).slice(0, 3);
      return associer(
        rng,
        trois.map((e) => [e, BORNES[e]] as const),
        {
          prompt: `Associe chaque division des temps à ses dates : ${trois.join(', ')}.`,
          indice: 'Range les dates de la plus ancienne à la plus récente.',
          explication: 'Les ères se suivent sans se chevaucher.',
        },
        45,
      );
    }
    if (level === 3) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        const [titre, suite] = rng.pick([
          ['de la formation de la Terre au Quaternaire', CHRONOLOGIE],
          ['depuis le début de l’ère primaire', CHRONOLOGIE.slice(1)],
          ['jusqu’à la disparition des dinosaures', CHRONOLOGIE.slice(0, 4)],
        ] as const);
        return {
          prompt: `Classe ces événements, ${titre}, du plus ancien au plus récent.`,
          answer: ordre(rng, suite),
          hint: 'Plus le nombre d’années avant aujourd’hui est grand, plus l’événement est ancien.',
          steps: [
            'Les milliards d’années précèdent les millions d’années.',
            `Le plus récent : **${suite[suite.length - 1]}**.`,
          ],
          targetSeconds: 60,
        };
      }
      if (forme === 1)
        return {
          prompt:
            'Remets les grandes divisions des temps géologiques dans l’ordre, de la plus ancienne à la plus récente.',
          answer: ordre(rng, ERES),
          hint: 'Le Précambrien vient avant toutes les ères.',
          steps: ['Précambrien, puis ère primaire, secondaire et Cénozoïque.', `La plus récente : **Cénozoïque**.`],
          targetSeconds: 40,
        };
      const mez = rng.int(0, 1) === 0;
      return {
        prompt: `Complète la limite ${mez ? 'primaire-secondaire' : 'secondaire-Cénozoïque'}.`,
        answer: {
          kind: 'cloze',
          parts: ['Elle date d’environ ', ' millions d’années et correspond à une ', '.'],
          blanks: [
            { mode: 'list', options: ['540', '252', '66'], correct: mez ? 1 : 2 },
            { mode: 'list', options: ['crise biologique', 'dorsale', 'roche sédimentaire'], correct: 0 },
          ],
        },
        hint: 'Pense aux grandes extinctions.',
        steps: [
          'Les limites des ères correspondent souvent à des changements des formes de vie.',
          `La limite date de **${mez ? '252' : '66'} millions d’années**, avec une **crise biologique**.`,
        ],
        targetSeconds: 35,
      };
    }
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        const serie = rng.int(0, 1);
        const paires: readonly (readonly [string, string])[] =
          serie === 0
            ? [
                ['4,5 milliards d’années', 'formation de la Terre'],
                ['540 millions d’années', 'début de l’ère primaire'],
                ['252 millions d’années', 'plus grande extinction connue'],
                ['201 millions d’années', 'fin du Trias'],
                ['66 millions d’années', 'disparition des dinosaures'],
              ]
            : [
                ['Précambrien', 'avant l’ère primaire'],
                ['Paléozoïque', 'ère primaire'],
                ['Mésozoïque', 'ère secondaire, celle des ammonites'],
                ['Quaternaire', 'période la plus récente, avec des cycles glaciaires'],
                ['fossile', 'trace d’un être vivant dans une couche sédimentaire'],
              ];
        return associer(
          rng,
          paires,
          {
            prompt:
              serie === 0 ? 'Associe chaque date à son événement.' : 'Associe chaque mot à ce qui le caractérise.',
            indice: 'Commence par les repères les plus connus.',
            explication: 'On relie chaque repère à sa place dans l’échelle des temps.',
          },
          75,
        );
      }
      const s = rng.pick(SAISIES);
      return ecrire({ ...s, indice: 'Pense à l’échelle des temps géologiques et aux fossiles.' }, 40);
    }
    return coupe(rng);
  },
};
