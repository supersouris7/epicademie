import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesEnergie } from './donnees-energie.ts';

// ——— Circuits en série et en dérivation (5e) ———

const L = ['A', 'B', 'C'] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      texte: 'Deux lampes sont placées l’une à la suite de l’autre sur une seule boucle avec la pile',
      bon: 'En série',
      pourquoi: 'Les lampes sont à la suite et parcourues par le même courant.',
    },
    {
      texte: 'Chaque lampe est sur sa propre branche, les deux branches reliant les deux mêmes points du circuit',
      bon: 'En dérivation',
      pourquoi: 'Chaque lampe est sur une branche annexe entre deux points du circuit.',
    },
    {
      texte: 'Une boucle est coupée : un fil est débranché et le courant ne peut pas circuler',
      bon: 'En circuit ouvert',
      pourquoi: 'Une interruption empêche le passage du courant.',
    },
  ]);
  const { answer, traps: t } = choice(
    rng,
    cas.bon,
    ['En série', 'En dérivation', 'En circuit ouvert']
      .filter((x) => x !== cas.bon)
      .map((label) => ({
        label,
        why:
          label === 'En série'
            ? 'En série, les éléments sont à la suite les uns des autres sur une même boucle.'
            : label === 'En dérivation'
              ? 'En dérivation, il y a plusieurs branches entre les mêmes points.'
              : 'Un circuit ouvert est interrompu : ici, regarde si le courant peut passer.',
      })),
  );
  return {
    prompt: `${cas.texte}. Comment décrire ce montage ?`,
    answer,
    traps: t,
    hint: 'Compte les chemins possibles pour le courant : un seul, plusieurs, ou aucun.',
    steps: [cas.pourquoi, `Réponse : **${cas.bon.toLowerCase()}**.`],
    targetSeconds: 30,
  };
};

const DEFINITIONS: readonly { mot: string; def: string }[] = [
  { mot: 'Circuit fermé', def: 'Le courant peut circuler' },
  { mot: 'Circuit ouvert', def: 'Une interruption empêche le courant de passer' },
  { mot: 'Montage en série', def: 'Éléments à la suite, parcourus par le même courant' },
  { mot: 'Montage en dérivation', def: 'Branches annexes entre deux points du circuit' },
  { mot: 'Interrupteur', def: 'Sert à couper ou rétablir le courant' },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(DEFINITIONS).slice(0, 3);
    return {
      prompt: `Associe chaque mot à sa description : ${trois
        .map((d) => d.mot)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        trois.map((d) => [d.mot, d.def] as const),
      ),
      hint: 'Repère les mots-clés : même courant, branches, interruption, couper.',
      steps: [
        'Chaque mot décrit soit le passage du courant, soit la place des éléments, soit l’appareil qui commande.',
        `Réponse : **${trois.map((d) => `${d.mot.toLowerCase()} → ${d.def.toLowerCase()}`).join(' ; ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const d = rng.pick(DEFINITIONS);
  const { answer, traps: t } = choice(
    rng,
    d.mot,
    rng
      .shuffle(DEFINITIONS.filter((x) => x.mot !== d.mot))
      .slice(0, 3)
      .map((x) => ({ label: x.mot, why: `« ${x.mot} » veut dire : ${x.def.toLowerCase()}.` })),
  );
  return {
    prompt: `Quel mot correspond à cette description : « ${d.def} » ?`,
    answer,
    traps: t,
    hint: 'Pense à ce qui change entre les quatre mots : le courant, la disposition ou la commande.',
    steps: [`« ${d.def} » définit ce mot.`, `Réponse : **${d.mot.toLowerCase()}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const serie = rng.int(0, 1) === 0;
  const [x, y] = rng.shuffle(L).slice(0, 2) as [string, string];
  const montage = serie
    ? `Les lampes ${x} et ${y} sont montées en série avec une pile`
    : `Les lampes ${x} et ${y} sont montées en dérivation, chacune sur sa branche, avec une pile`;
  if (rng.int(0, 1) === 0) {
    const mot = serie ? 'éteinte' : 'allumée';
    const { answer, traps: t } = saisie(serie ? ['éteinte', 'eteinte'] : ['allumée', 'allumee'], [
      [
        serie ? 'allumée' : 'éteinte',
        serie
          ? 'En série, une seule boucle : retirer une lampe l’ouvre, plus rien ne passe.'
          : 'L’autre branche reste fermée : le courant continue d’y passer.',
      ],
    ]);
    return {
      prompt: `${montage}. On dévisse la lampe ${x}. La lampe ${y} est-elle allumée ou éteinte ? Écris le mot.`,
      answer,
      traps: t,
      hint: 'Cherche s’il reste un chemin fermé qui passe par la lampe restante.',
      steps: [
        serie
          ? 'En série, la lampe retirée ouvre la seule boucle.'
          : 'En dérivation, la branche de l’autre lampe reste un chemin fermé.',
        `La lampe ${y} est **${mot}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const bon = serie ? 'série' : 'dérivation';
  const { answer, traps: t } = saisie(
    serie
      ? ['série', 'en série', 'serie', 'en serie']
      : [
          'dérivation',
          'en dérivation',
          'derivation',
          'en derivation',
          'parallèle',
          'en parallèle',
          'parallele',
          'en parallele',
        ],
    [
      [
        serie ? 'dérivation' : 'série',
        serie ? 'En dérivation, la lampe restante resterait allumée.' : 'En série, la lampe restante s’éteindrait.',
      ],
    ],
  );
  return {
    prompt: `Deux lampes ${x} et ${y} brillent avec une pile. On dévisse ${x} : ${y} ${serie ? 's’éteint' : 'reste allumée'}. Les lampes sont montées en série ou en dérivation ? Écris le mot.`,
    answer,
    traps: t,
    hint: 'Combien de chemins reste-t-il au courant pour la lampe restante ?',
    steps: [
      serie
        ? 'Si l’autre s’éteint, il n’y avait qu’une seule boucle.'
        : 'Si l’autre reste allumée, elle a sa propre branche.',
      `Montage en **${bon}**.`,
    ],
    targetSeconds: 45,
  };
};

/** Circuit : interrupteur principal K0 dans la boucle de la pile, puis deux branches en dérivation. */
export interface Reseau {
  /** Lampes de la branche 1 (en série avec K1) et de la branche 2 (en série avec K2). */
  readonly branches: readonly [readonly string[], readonly string[]];
}
/** Interrupteur (« K0 », « K1 », « K2 ») ou lettre d’une lampe retirée. */
export type Coupure = string;

/** Lampes allumées quand les interrupteurs ou lampes de `coupures` sont ouverts ou retirés (tous les autres fermés). */
export function allumees(reseau: Reseau, coupures: readonly Coupure[]): string[] {
  if (coupures.includes('K0')) return [];
  return reseau.branches.flatMap((lampes, i) =>
    coupures.includes(`K${i + 1}`) || lampes.some((l) => coupures.includes(l)) ? [] : [...lampes],
  );
}

const lignesReseau = (rs: Reseau) => [
  'La pile est reliée à l’interrupteur K0, sur la boucle principale.',
  'Après K0, le circuit se sépare en deux branches en dérivation, qui reviennent ensemble à la pile.',
  `Branche 1 : l’interrupteur K1 puis ${rs.branches[0].map((l) => `la lampe ${l}`).join(' et ')}, en série.`,
  `Branche 2 : l’interrupteur K2 puis ${rs.branches[1].map((l) => `la lampe ${l}`).join(' et ')}, en série.`,
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const cas = rng.int(0, 1);
  if (cas === 0) {
    const k = rng.pick(['K0', 'K1', 'K2'] as const);
    const eteintes = k === 'K0' ? 'Les deux lampes' : k === 'K1' ? 'La lampe A seule' : 'La lampe B seule';
    const { answer, traps: t } = choice(
      rng,
      eteintes,
      ['Les deux lampes', 'La lampe A seule', 'La lampe B seule', 'Aucune lampe']
        .filter((x) => x !== eteintes)
        .map((label) => ({
          label,
          why:
            k === 'K0'
              ? 'K0 est sur la boucle principale : il commande toutes les branches.'
              : `${k} est sur une seule branche : il ne commande que la lampe de cette branche.`,
        })),
    );
    return {
      prompt: `Tous les interrupteurs sont fermés, puis on ouvre ${k}. Quelles lampes s’éteignent ?`,
      figure: {
        kind: 'document',
        title: 'Montage (situation inventée)',
        lines: lignesReseau({ branches: [['A'], ['B']] }),
      },
      answer,
      traps: t,
      hint: 'Regarde si l’interrupteur est avant la séparation ou dans une seule branche.',
      steps: [
        k === 'K0' ? 'K0 ouvre la boucle principale.' : `${k} ouvre uniquement sa branche ; l’autre reste fermée.`,
        `Réponse : **${eteintes.toLowerCase()}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const cinq = [
    ['Deux lampes : on en dévisse une et l’autre s’éteint', 'Les deux lampes sont en série'],
    ['Deux lampes : on en dévisse une et l’autre reste allumée', 'Les deux lampes sont en dérivation'],
    ['Un interrupteur est placé sur la boucle principale, avant les branches', 'Il commande toutes les lampes'],
    ['Un interrupteur est placé dans une seule des branches', 'Il commande seulement les lampes de sa branche'],
    ['Un fil seul relie les deux bornes de la pile', 'Court-circuit : danger d’échauffement'],
  ] as const;
  return {
    prompt: 'Associe chacune des cinq observations à ce qu’il faut en conclure.',
    answer: association(rng, cinq),
    hint: 'Commence par la situation dangereuse, puis cherche s’il reste un chemin fermé.',
    steps: [
      'Chaque situation se juge au chemin qui reste au courant.',
      `Réponse : **${cinq.map((p) => p[1].toLowerCase()).join(' ; ')}**.`,
    ],
    targetSeconds: 80,
  };
};

const RESEAUX: readonly Reseau[] = [
  { branches: [['A'], ['B', 'C']] },
  { branches: [['A', 'B'], ['C']] },
  { branches: [['B'], ['A', 'C']] },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const rs = rng.pick(RESEAUX);
  const lampes = rs.branches.flat();
  const coupure: Coupure = rng.pick(['K0', 'K1', 'K2', ...lampes]);
  const restent = allumees(rs, [coupure]);
  const action = coupure.startsWith('K') ? `on ouvre l’interrupteur ${coupure}` : `on dévisse la lampe ${coupure}`;
  const figure = { kind: 'document' as const, title: 'Montage (situation inventée)', lines: lignesReseau(rs) };
  const explication = `Les lampes qui restent sur un chemin fermé : ${restent.length ? [...restent].sort().join(', ') : 'aucune'}.`;
  if (rng.int(0, 1) === 0) {
    const nombre = restent.length;
    return {
      prompt: `Tout est fermé et vissé, puis ${action}. Combien de lampes restent allumées ?`,
      figure,
      answer: num(nombre),
      traps: traps(r(nombre), [
        [3, 'Au moins une branche est coupée : toutes les lampes ne restent pas allumées.'],
        [2, 'Suis chaque branche : une lampe en série avec la coupure s’éteint.'],
        [1, 'Suis chaque branche lampe par lampe : compte toutes celles qui restent sur un chemin fermé.'],
        [0, 'Au moins une branche reste fermée.'],
      ]),
      hint: 'Pour chaque lampe, cherche un chemin fermé depuis la pile jusqu’à elle.',
      steps: [explication, `Réponse : **${nombre}**.`],
      targetSeconds: 100,
    };
  }
  const libelle = (ls: readonly string[]) =>
    ls.length ? `${ls.length === 1 ? 'Lampe' : 'Lampes'} ${[...ls].sort().join(', ')}` : 'Aucune lampe';
  const autres = [[], ['A'], ['B'], ['C'], ['A', 'B'], ['A', 'C'], ['B', 'C'], ['A', 'B', 'C']]
    .map(libelle)
    .filter((x) => x !== libelle(restent));
  const { answer, traps: t } = choice(
    rng,
    libelle(restent),
    rng
      .shuffle(autres)
      .slice(0, 3)
      .map((label) => ({
        label,
        why: 'Suis chaque branche : une coupure éteint toutes les lampes en série avec elle.',
      })),
  );
  return {
    prompt: `Tout est fermé et vissé, puis ${action}. Quelles lampes restent allumées ?`,
    figure,
    answer,
    traps: t,
    hint: 'Pour chaque lampe, cherche un chemin fermé depuis la pile jusqu’à elle.',
    steps: [explication, `Réponse : **${libelle(restent)}**.`],
    targetSeconds: 100,
  };
};

export const circuitsSerieDerivation: Skill = {
  id: 'p5-circuits-serie-derivation',
  title: 'Circuits en série et en dérivation',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Le courant ne circule que dans un **circuit fermé**. Un interrupteur ouvert, ou une lampe dévissée, fait un **circuit ouvert**.',
      '**En série** : les éléments sont à la suite, sur une seule boucle. **En dérivation** : chacun a sa branche entre deux mêmes points ; dévisser une lampe laisse les autres branches allumées.',
      'Un **court-circuit** (les bornes de la pile reliées par un fil seul) fait chauffer dangereusement les fils : ne le fais jamais.',
    ],
    ...referencesEnergie(
      'dipoles',
      'circuits-5e',
      'securite',
      'circuit',
      'circuit-ouvert',
      'circuit-ferme',
      'interrupteur',
      'serie',
      'parallele',
      'derivation',
      'court-circuit',
      'generateur',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
