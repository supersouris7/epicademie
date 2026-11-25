import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { association, ordre, saisie } from '../st/outils.ts';
import { ECO_MAJEURS, ECO_NATURELS, GEO_VOLCAN, PROGRAMME, TLF_LAVE, TLF_VOLCAN } from './donnees.ts';
import { qcm, type Qcm } from './kit.ts';

// ——— Volcans : magma, lave, cratère, éruptions effusives et explosives ———

const DEFS = {
  magma: 'la matière en fusion produite en profondeur',
  lave: 'la matière en fusion qui s’écoule du volcan pendant une éruption',
  cratère: 'l’ouverture du volcan où débouche la cheminée',
  cheminée: 'le conduit par lequel les produits montent vers le cratère',
  cendres: 'les fragments les plus fins projetés lors d’une éruption (moins de 2 mm)',
  'éruption effusive': 'une éruption où une lave fluide s’épanche en coulées',
  'éruption explosive': 'une éruption où un magma riche en gaz est projeté en fragments',
} as const;
type Terme = keyof typeof DEFS;
const TERMES = Object.keys(DEFS) as Terme[];

const mot = (t: Terme, autres: readonly Terme[]): Qcm => ({
  prompt: `Quel terme désigne ${DEFS[t]} ?`,
  bonne: t,
  fausses: autres.map((a) => [a, `« ${a} » désigne ${DEFS[a]}.`]),
  indice: 'Repère si on parle d’une matière, d’une partie du volcan ou d’un type d’éruption.',
  explication: [`La définition décrit : ${DEFS[t]}.`],
});

const CONFUSIONS: Record<'magma' | 'lave' | 'cratère' | 'cendres', readonly [Terme, Terme]> = {
  magma: ['lave', 'cendres'],
  lave: ['magma', 'cratère'],
  cratère: ['cheminée', 'cendres'],
  cendres: ['lave', 'cratère'],
};

type Type = 'effusive' | 'explosive';

/** Observations inventées d'éruptions : les indices (fluidité, gaz, projections) viennent des faits cités. */
const OBSERVATIONS: readonly (readonly [string, Type])[] = [
  ['Une lave très fluide s’écoule en longues coulées sur la pente', 'effusive'],
  ['La lave s’épanche calmement hors du cratère en rivière brûlante', 'effusive'],
  ['Un magma riche en gaz est projeté en fragments au-dessus du volcan', 'explosive'],
  ['Une explosion projette des cendres et des blocs très loin du cratère', 'explosive'],
];

const typeQcm = ([texte, type]: readonly [string, Type]): Qcm => {
  const effusive = type === 'effusive';
  return {
    prompt: `« ${texte}. » De quel phénomène s’agit-il ?`,
    bonne: `une éruption ${type}`,
    fausses: [
      [
        `une éruption ${effusive ? 'explosive' : 'effusive'}`,
        effusive
          ? 'Une éruption explosive projette des fragments d’un magma riche en gaz ; ici la lave coule.'
          : 'Une éruption effusive donne des coulées de lave fluide ; ici il y a des projections.',
      ],
      ['un séisme', 'Un séisme est une rupture le long d’une faille : il ne produit pas de lave.'],
      ['une dépression', 'Une dépression est une zone de basses pressions dans l’atmosphère.'],
    ],
    indice: 'La matière coule-t-elle ou est-elle projetée ?',
    explication: [
      'Effusive : lave fluide en coulées. Explosive : magma riche en gaz, projeté en fragments.',
      effusive ? 'Ici, la lave coule.' : 'Ici, la matière est projetée.',
    ],
  };
};

const TRAJET = [
  'Du magma se forme en profondeur',
  'Le magma remonte vers la surface',
  'Il emprunte la cheminée du volcan',
  'Il sort par le cratère pendant l’éruption',
  'La matière sortie se dépose et forme peu à peu un relief',
];

const SAISIES: readonly { readonly t: Terme; readonly accepted: readonly string[]; readonly autre: Terme }[] = [
  { t: 'magma', accepted: ['magma', 'le magma', 'un magma'], autre: 'lave' },
  { t: 'lave', accepted: ['lave', 'la lave', 'de la lave'], autre: 'magma' },
  { t: 'cratère', accepted: ['cratère', 'cratere', 'le cratère'], autre: 'cheminée' },
  { t: 'cheminée', accepted: ['cheminée', 'cheminee', 'la cheminée'], autre: 'cratère' },
  { t: 'cendres', accepted: ['cendres', 'les cendres', 'des cendres', 'cendre'], autre: 'lave' },
];

/** Niveau 5 : carnet d’observation inventé. */
function carnet(rng: Rng): QuestionDraft {
  const explosive = rng.int(0, 1) === 0;
  const nom = rng.pick(['Mont Sarel', 'Pic Orvan', 'Cône de Veyrac']);
  const lines = explosive
    ? [
        `Observation au ${nom} (volcan inventé).`,
        'Le magma qui monte contient beaucoup de gaz.',
        'Une explosion projette des fragments ; une pluie de cendres tombe sur le village voisin.',
      ]
    : [
        `Observation au ${nom} (volcan inventé).`,
        'La lave est très fluide.',
        'Une coulée descend lentement la pente vers une route.',
      ];
  const figure = {
    kind: 'document' as const,
    title: `Carnet : ${nom}`,
    lines,
    credit: 'Document écrit pour l’exercice',
  };
  if (rng.int(0, 1) === 0) {
    const q = qcm(
      rng,
      {
        prompt: `Éruption observée au ${nom} : ${explosive ? 'gaz et projections' : 'lave fluide et coulée'}. De quel type est-elle ?`,
        bonne: explosive ? 'explosive' : 'effusive',
        fausses: [
          [
            explosive ? 'effusive' : 'explosive',
            explosive
              ? 'Les projections d’un magma riche en gaz ne correspondent pas à une éruption effusive.'
              : 'Une coulée de lave fluide ne correspond pas à une éruption explosive.',
          ],
          ['sismique', 'Un séisme n’est pas un type d’éruption.'],
          ['climatique', 'Le climat n’est pas un type d’éruption.'],
        ],
        indice: 'Relis ce qui sort du volcan : une coulée ou des projections ?',
        explication: [
          explosive
            ? 'Du gaz et des fragments projetés caractérisent une éruption explosive.'
            : 'Une lave fluide qui coule caractérise une éruption effusive.',
        ],
      },
      45,
    );
    return { ...q, figure };
  }
  const q = qcm(
    rng,
    {
      prompt: `Au ${nom}, ${explosive ? 'des cendres tombent sur le village' : 'une coulée avance vers la route'}. Quelle action protège le mieux les habitants ?`,
      bonne: explosive
        ? 'Suivre la surveillance du volcan et les consignes d’évacuation avant le danger'
        : 'Surveiller le volcan, fermer la route menacée et suivre les consignes des autorités',
      fausses: [
        [
          'Monter au bord du cratère pour mieux observer l’éruption',
          'S’approcher du danger augmente l’exposition des personnes.',
        ],
        [
          'Attendre que l’éruption soit finie pour s’informer',
          'La surveillance permet d’alerter avant et pendant le danger.',
        ],
        [
          'Construire de nouvelles maisons sur le trajet probable des produits du volcan',
          'On augmenterait les enjeux exposés au lieu de les réduire.',
        ],
      ],
      indice: 'Pense à la surveillance, à l’alerte et à la distance avec le danger.',
      explication: [
        'Les volcans sont surveillés et les éruptions sont souvent annoncées : on s’informe et on s’éloigne du danger.',
      ],
    },
    45,
  );
  return { ...q, figure };
}

export const volcans: Skill = {
  id: 'v5-volcans',
  title: 'Les volcans',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **magma** se forme en profondeur et monte par la **cheminée** jusqu’au **cratère** ; quand il sort et s’écoule, on parle de **lave**.',
      'Éruption **effusive** : lave fluide en coulées. Éruption **explosive** : magma riche en gaz, projeté en fragments (dont les **cendres**). Les volcans sont surveillés en permanence.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « dynamique interne et tectonique des plaques lithosphériques ; séismes, éruptions volcaniques ».`,
    sources: [PROGRAMME, TLF_VOLCAN, TLF_LAVE, GEO_VOLCAN, ECO_NATURELS, ECO_MAJEURS],
  },
  generate: (rng, level) => {
    if (level === 1) {
      const t = rng.pick(['magma', 'lave', 'cratère', 'cendres'] as const);
      return qcm(rng, mot(t, CONFUSIONS[t]), 25);
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) return qcm(rng, typeQcm(rng.pick(OBSERVATIONS)), 30);
      const t = rng.pick(TERMES);
      const autres = rng.shuffle(TERMES.filter((x) => x !== t)).slice(0, 3);
      return qcm(rng, mot(t, autres), 35);
    }
    if (level === 3) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        return {
          prompt: 'Remets dans l’ordre le trajet du magma lors d’une éruption.',
          answer: ordre(rng, TRAJET),
          hint: 'Pars des profondeurs et remonte jusqu’à ce qui se dépose à la surface.',
          steps: [
            'Le magma naît en profondeur, monte, passe par la cheminée et sort par le cratère.',
            `Dernière étape : **${TRAJET[TRAJET.length - 1]}**.`,
          ],
          targetSeconds: 50,
        };
      }
      if (forme === 1) {
        const explosive = rng.int(0, 1) === 0;
        return {
          prompt: `Complète la description d’une éruption ${explosive ? 'explosive' : 'effusive'}.`,
          answer: {
            kind: 'cloze',
            parts: ['Le magma ', ' ; il sort sous forme de ', '.'],
            blanks: [
              { mode: 'list', options: ['est fluide', 'est riche en gaz'], correct: explosive ? 1 : 0 },
              { mode: 'list', options: ['coulées de lave', 'fragments projetés'], correct: explosive ? 1 : 0 },
            ],
          },
          hint: 'Les gaz favorisent les projections, la fluidité favorise l’écoulement.',
          steps: [
            explosive
              ? 'Un magma enrichi en gaz est propulsé en fragments.'
              : 'Un magma fluide donne des laves qui s’épanchent.',
            `Éruption **${explosive ? 'explosive' : 'effusive'}**.`,
          ],
          targetSeconds: 30,
        };
      }
      const autour = rng.int(0, 1) === 0;
      return {
        prompt: autour
          ? 'Complète : de la matière profonde à la matière sortie.'
          : 'Complète : le nom de la matière avant et après sa sortie.',
        answer: {
          kind: 'cloze',
          parts: ['En profondeur, on parle de ', ' ; quand la matière s’écoule du volcan, on parle de ', '.'],
          blanks: [
            { mode: 'list', options: ['magma', 'lave', 'cendres'], correct: 0 },
            { mode: 'list', options: ['magma', 'lave', 'cendres'], correct: 1 },
          ],
        },
        hint: 'Un mot désigne la matière avant sa sortie, l’autre après.',
        steps: [
          'La matière en fusion change de nom selon qu’elle est encore en profondeur ou qu’elle s’écoule.',
          'Profondeur : **magma** ; écoulement : **lave**.',
        ],
        targetSeconds: 30,
      };
    }
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        const serie = rng.int(0, 1);
        const termes: readonly Terme[] =
          serie === 0
            ? ['magma', 'lave', 'cratère', 'cheminée', 'cendres']
            : ['cratère', 'cendres', 'lave', 'éruption effusive', 'éruption explosive'];
        return {
          prompt: `Associe chaque terme à sa définition : ${termes.join(', ')}.`,
          answer: association(
            rng,
            termes.map((t) => [t, DEFS[t]] as const),
          ),
          hint: 'Classe : la matière, les parties du volcan, les types d’éruption.',
          steps: [
            'On associe d’abord les matières, puis les parties et les éruptions.',
            `Par exemple, la lave : **${DEFS.lave}**.`,
          ],
          targetSeconds: 60,
        };
      }
      const s = rng.pick(SAISIES);
      const { answer, traps } = saisie(s.accepted, [[s.autre, `« ${s.autre} » désigne ${DEFS[s.autre]}.`]]);
      return {
        prompt: `Écris le terme qui désigne ${DEFS[s.t]}.`,
        answer,
        traps,
        hint: `Il commence par la lettre « ${s.t.charAt(0)} ».`,
        steps: [`La définition décrit : ${DEFS[s.t]}.`, `C’est le terme **${s.t}**.`],
        targetSeconds: 30,
      };
    }
    return carnet(rng);
  },
};
