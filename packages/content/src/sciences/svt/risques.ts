import type { Skill } from '../../types.ts';
import { association, ordre, saisie } from '../st/outils.ts';
import {
  ECO_CLIMAT,
  ECO_MAJEURS,
  ECO_SEISMES,
  GEO_ALEA,
  GEO_PREVENTION,
  GEO_VULNERABILITE,
  PROGRAMME,
} from './donnees.ts';
import { qcm, type Qcm } from './kit.ts';

// ——— Risques et prévention : aléa, enjeux, vulnérabilité, mesures ———

const DEFS = {
  aléa: 'la possibilité qu’un événement perturbateur se produise (séisme, inondation, éruption…)',
  enjeux: 'les personnes, les biens et l’environnement exposés',
  vulnérabilité: 'le niveau d’effet prévisible d’un aléa sur les enjeux, c’est-à-dire leur fragilité',
  risque: 'la rencontre d’un aléa avec des enjeux vulnérables',
  prévention: 'les actions qui anticipent un risque pour limiter ses effets',
} as const;
type Terme = keyof typeof DEFS;
const TERMES = Object.keys(DEFS) as Terme[];

const mot = (t: Terme, autres: readonly Terme[]): Qcm => ({
  prompt: `Quel mot désigne ${DEFS[t]} ?`,
  bonne: t,
  fausses: autres.map((a) => [a, `« ${a} » désigne ${DEFS[a]}.`]),
  indice: 'Demande-toi : l’événement, ce qui est exposé, la fragilité, la rencontre, ou l’action ?',
  explication: ['On distingue l’événement, ce qui est exposé, sa fragilité et les actions menées.'],
});

/** Scènes inventées : un phénomène et des éléments exposés. */
const SCENES = [
  { phenomene: 'Une crue de la rivière', expose: 'les maisons du village', aleaMot: 'la crue' },
  { phenomene: 'Un séisme', expose: 'le collège de la ville', aleaMot: 'le séisme' },
  {
    phenomene: 'Une éruption volcanique',
    expose: 'les champs et les habitants au pied du volcan',
    aleaMot: 'l’éruption',
  },
  { phenomene: 'Un cyclone', expose: 'le port et les pêcheurs', aleaMot: 'le cyclone' },
] as const;

const scene = (s: (typeof SCENES)[number], demande: 'alea' | 'enjeu'): Qcm => {
  const alea = demande === 'alea';
  const reponse = alea ? s.aleaMot : s.expose;
  return {
    prompt: `${s.phenomene} menace ${s.expose}. Quel élément est ${alea ? 'l’aléa' : 'un enjeu'} ?`,
    bonne: reponse,
    fausses: [
      [
        alea ? s.expose : s.aleaMot,
        alea ? 'Ce qui est exposé est un enjeu, pas l’aléa.' : 'L’événement possible est l’aléa, pas un enjeu.',
      ],
      [
        'le panneau d’information de la mairie',
        'Informer fait partie de la prévention : ce n’est ni l’événement ni ce qui est exposé ici.',
      ],
    ],
    indice: alea ? 'L’aléa est l’événement qui peut se produire.' : 'Un enjeu est ce qui peut être touché.',
    explication: [
      alea ? 'L’aléa est le phénomène qui peut se produire.' : 'Les enjeux sont les personnes et les biens exposés.',
    ],
  };
};

/** [mesure inventée, famille] : familles du programme (prévention, protection, adaptation, atténuation). */
const MESURES = [
  ['Construire une digue pour mettre un quartier à l’abri de la montée de l’eau', 'protection'],
  ['Informer et sensibiliser les habitants aux consignes à suivre', 'prévention'],
  ['Réduire les émissions de gaz à effet de serre', 'atténuation'],
  ['Choisir des cultures qui supportent mieux la sécheresse à venir', 'adaptation'],
] as const;
const FAMILLES = {
  prévention: 'anticiper un risque, par exemple en informant, pour limiter ses effets',
  protection: 'placer un obstacle ou un abri entre le danger et les enjeux',
  atténuation: 'diminuer la cause du changement climatique',
  adaptation: 's’ajuster aux changements déjà en cours ou attendus',
} as const;
type Famille = keyof typeof FAMILLES;
const NOMS_FAMILLES = Object.keys(FAMILLES) as Famille[];

const famille = ([texte, f]: (typeof MESURES)[number]): Qcm => ({
  prompt: `« ${texte}. » C’est surtout une mesure…`,
  bonne: `de ${f}`,
  fausses: NOMS_FAMILLES.filter((n) => n !== f).map((n) => [`de ${n}`, `La mesure de ${n} consiste à ${FAMILLES[n]}.`]),
  indice: 'Cause du climat, ajustement, barrière ou action en amont ?',
  explication: [`La mesure de ${f} consiste à ${FAMILLES[f]}.`],
});

const CHAINE = [
  'Connaître l’aléa et les enjeux',
  'Préparer des mesures et informer les habitants',
  'Surveiller le phénomène et alerter',
  'Se mettre à l’abri ou évacuer en suivant les consignes',
];

const SAISIES: readonly { readonly t: Terme; readonly accepted: readonly string[]; readonly autre: Terme }[] = [
  { t: 'aléa', accepted: ['aléa', 'alea', 'un aléa', 'l’aléa'], autre: 'risque' },
  { t: 'enjeux', accepted: ['enjeux', 'les enjeux', 'enjeu', 'des enjeux'], autre: 'aléa' },
  { t: 'vulnérabilité', accepted: ['vulnérabilité', 'vulnerabilite', 'la vulnérabilité'], autre: 'enjeux' },
  { t: 'risque', accepted: ['risque', 'un risque', 'le risque'], autre: 'aléa' },
  { t: 'prévention', accepted: ['prévention', 'prevention', 'la prévention'], autre: 'aléa' },
];

export const risques: Skill = {
  id: 'v5-risques',
  title: 'Risques naturels et prévention',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **aléa** est un événement possible ; il devient un **risque** quand des **enjeux** (personnes, biens, environnement) **vulnérables** sont exposés.',
      'On réduit un risque par la **prévision**, la **prévention** et la **protection** : surveiller, construire solide, informer, s’entraîner. Pour le climat : **atténuation** et **adaptation**.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Les phénomènes naturels : risques et enjeux pour l’être humain » ; « Notions d’aléas, de vulnérabilité et de risque en lien avec les phénomènes naturels ; prévisions ».`,
    sources: [PROGRAMME, GEO_ALEA, GEO_VULNERABILITE, GEO_PREVENTION, ECO_MAJEURS, ECO_SEISMES, ECO_CLIMAT],
  },
  generate: (rng, level) => {
    if (level === 1) return qcm(rng, scene(rng.pick(SCENES), rng.int(0, 1) === 0 ? 'alea' : 'enjeu'), 30);
    if (level === 2) {
      if (rng.int(0, 1) === 0) return qcm(rng, famille(rng.pick(MESURES)), 35);
      const t = rng.pick(TERMES);
      const autres = rng.shuffle(TERMES.filter((x) => x !== t)).slice(0, 3);
      return qcm(rng, mot(t, autres), 35);
    }
    if (level === 3) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        return {
          prompt: 'Remets dans l’ordre les étapes de la gestion d’un risque, de la préparation à l’événement.',
          answer: ordre(rng, CHAINE),
          hint: 'On connaît avant de préparer, on alerte avant de se mettre à l’abri.',
          steps: [
            'La connaissance vient en premier, puis la préparation, la surveillance et enfin l’action.',
            `Pour finir : **${CHAINE[CHAINE.length - 1]}**.`,
          ],
          targetSeconds: 45,
        };
      }
      if (forme === 1) {
        const s = rng.pick(SCENES);
        const options = ['aléa', 'enjeu', 'vulnérabilité'];
        return {
          prompt: `${s.phenomene} menace ${s.expose}. Complète avec les bons mots.`,
          answer: {
            kind: 'cloze',
            parts: [`Ici, ${s.aleaMot} est l’`, ` et ${s.expose} est un `, '.'],
            blanks: [
              { mode: 'list', options, correct: 0 },
              { mode: 'list', options, correct: 1 },
            ],
          },
          hint: 'L’un est le phénomène, l’autre ce qui peut être touché.',
          steps: [
            'On sépare ce qui peut se produire de ce qui peut être touché.',
            'Le phénomène est l’**aléa**, ce qui est exposé est un **enjeu**.',
          ],
          targetSeconds: 30,
        };
      }
      return {
        prompt: 'Complète la règle qui définit le risque.',
        answer: {
          kind: 'cloze',
          parts: ['Un aléa devient un ', ' quand des ', ' vulnérables sont présents.'],
          blanks: [
            { mode: 'list', options: ['risque', 'climat', 'magma'], correct: 0 },
            { mode: 'list', options: ['aléas', 'enjeux', 'prévisions'], correct: 1 },
          ],
        },
        hint: 'Sans personne ni bien exposé, l’événement ne pose pas le même problème.',
        steps: [
          'Il faut un événement possible et des enjeux exposés.',
          'On parle alors de **risque** quand des **enjeux** vulnérables sont là.',
        ],
        targetSeconds: 30,
      };
    }
    if (level === 4) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        const serie = rng.int(0, 1);
        const exemples = [
          [
            ['un cyclone peut se produire', 'aléa'],
            ['les habitants du littoral', 'enjeux'],
            ['des toitures fragiles', 'vulnérabilité'],
            ['une digue autour d’un quartier', 'protection'],
            ['moins de gaz à effet de serre émis', 'atténuation'],
          ],
          [
            ['un volcan peut entrer en éruption', 'aléa'],
            ['les champs au pied du volcan', 'enjeux'],
            ['des maisons peu résistantes', 'vulnérabilité'],
            ['des exercices d’évacuation dans un collège', 'prévention'],
            ['des cultures choisies pour un climat plus sec', 'adaptation'],
          ],
        ] as const;
        const paires = exemples[serie] ?? exemples[0];
        return {
          prompt: `Associe chaque exemple à la bonne notion (série ${serie + 1}).`,
          answer: association(rng, paires),
          hint: 'Repère d’abord ce qui est un phénomène, ce qui est exposé et ce qui est fragile.',
          steps: [
            'Les trois premières notions décrivent le risque, les autres sont des actions.',
            `Par exemple, « ${paires[0][0]} » : **${paires[0][1]}**.`,
          ],
          targetSeconds: 60,
        };
      }
      if (forme === 1) return qcm(rng, famille(rng.pick(MESURES)), 30);
      const s = rng.pick(SAISIES);
      const { answer, traps } = saisie(s.accepted, [[s.autre, `« ${s.autre} » désigne ${DEFS[s.autre]}.`]]);
      return {
        prompt: `Écris le mot du vocabulaire des risques qui désigne ${DEFS[s.t]}.`,
        answer,
        traps,
        hint: `Il commence par la lettre « ${s.t.charAt(0)} ».`,
        steps: [`La définition décrit : ${DEFS[s.t]}.`, `C’est le mot **${s.t}**.`],
        targetSeconds: 30,
      };
    }
    // Niveau 5 : dossier d'une commune inventée.
    const commune = rng.pick(['Valmont', 'Rivebelle', 'Saint-Amel']);
    const classes = rng.int(3, 8);
    const lines = [
      `Commune inventée de ${commune}, au bord d’une rivière qui peut déborder.`,
      `Un collège de ${classes} classes est installé sur la rive basse ; les caves sont fragiles.`,
      'La mairie veut réduire le risque sans pouvoir empêcher la rivière de monter.',
    ];
    const figure = {
      kind: 'document' as const,
      title: `Dossier : ${commune}`,
      lines,
      credit: 'Document écrit pour l’exercice',
    };
    if (rng.int(0, 1) === 0) {
      const q = qcm(
        rng,
        {
          prompt: `À ${commune} (collège de ${classes} classes sur la rive basse), quelle décision évite d’augmenter les enjeux exposés ?`,
          bonne: 'Ne plus construire de logements sur la rive basse',
          fausses: [
            [
              'Construire un nouveau lotissement sur la rive basse',
              'On augmenterait les enjeux exposés dans la zone à risque.',
            ],
            [
              'Supprimer les repères des anciennes crues',
              'Ces repères entretiennent la mémoire du danger : les supprimer n’enlève rien à l’aléa.',
            ],
            [
              'Considérer que la crue n’arrivera plus',
              'Un événement rare reste possible : l’ignorer ne réduit ni l’aléa ni les enjeux.',
            ],
          ],
          indice: 'Moins de personnes et de biens dans la zone exposée, moins de risque.',
          explication: ['L’aléa ne peut pas être supprimé ici : on évite d’ajouter des enjeux dans la zone à risque.'],
        },
        50,
      );
      return { ...q, figure };
    }
    const q = qcm(
      rng,
      {
        prompt: `À ${commune}, la mairie organise des exercices d’évacuation du collège de ${classes} classes. Que cherche-t-elle à faire ?`,
        bonne: 'Réduire la vulnérabilité des personnes en les préparant à agir',
        fausses: [
          [
            'Diminuer l’aléa en empêchant la rivière de monter',
            'Un exercice ne change pas le phénomène : la rivière peut toujours déborder.',
          ],
          [
            'Supprimer les enjeux, puisque les élèves ne seront plus concernés',
            'Les personnes restent des enjeux : on les prépare, on ne les fait pas disparaître.',
          ],
          [
            'Prévoir la date exacte de la prochaine crue',
            'Un exercice ne sert pas à prévoir : la surveillance et la prévision le font.',
          ],
        ],
        indice: 'L’exercice agit sur la préparation des personnes, pas sur la rivière.',
        explication: ['Savoir quoi faire diminue les effets prévisibles sur les personnes : la vulnérabilité baisse.'],
      },
      50,
    );
    return { ...q, figure };
  },
};
