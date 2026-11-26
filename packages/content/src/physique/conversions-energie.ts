import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { association, ordre, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesEnergie } from './donnees-energie.ts';
import type { FormeEnergie } from './formes-energie.ts';

// ——— Conversions d'énergie (5e) ———

export interface Convertisseur {
  readonly nom: string;
  /** Début de phrase : « Dans … ». */
  readonly dans: string;
  readonly entree: FormeEnergie;
  readonly sortie: FormeEnergie;
}

/** Dispositifs dont la conversion principale est dite par les textes cités. */
export const CONVERTISSEURS: readonly Convertisseur[] = [
  { nom: 'une pile', dans: 'une pile', entree: 'chimique', sortie: 'électrique' },
  { nom: 'une photopile', dans: 'une photopile', entree: 'lumineuse', sortie: 'électrique' },
  { nom: 'une éolienne', dans: 'une éolienne', entree: 'cinétique', sortie: 'électrique' },
  { nom: 'une lampe électrique', dans: 'une lampe électrique', entree: 'électrique', sortie: 'lumineuse' },
  { nom: 'un moteur électrique', dans: 'un moteur électrique', entree: 'électrique', sortie: 'cinétique' },
  { nom: 'un radiateur électrique', dans: 'un radiateur électrique', entree: 'électrique', sortie: 'thermique' },
  { nom: 'un moteur à essence', dans: 'un moteur à essence', entree: 'chimique', sortie: 'cinétique' },
  { nom: 'une centrale nucléaire', dans: 'une centrale nucléaire', entree: 'nucléaire', sortie: 'électrique' },
];

const conversion = (c: Convertisseur) => `énergie ${c.entree} → énergie ${c.sortie}`;
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const sansAccent = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');
const variantes = (f: FormeEnergie): string[] => {
  const base = [f, `énergie ${f}`, ...(f === 'potentielle' ? ['de pesanteur', 'énergie de pesanteur'] : [])];
  return [...new Set([...base, ...base.map(sansAccent)])];
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CONVERTISSEURS);
  const entree = rng.int(0, 1) === 0;
  const bon = entree ? c.entree : c.sortie;
  const autre = entree ? c.sortie : c.entree;
  // Jamais « thermique » en leurre : presque tout dispositif chauffe aussi un peu.
  const leurre = rng.pick(
    (['chimique', 'lumineuse', 'cinétique', 'électrique', 'nucléaire'] as const).filter(
      (f) => f !== bon && f !== autre,
    ),
  );
  const { answer, traps: t } = choice(rng, `Énergie ${bon}`, [
    {
      label: `Énergie ${autre}`,
      why: entree
        ? `C’est l’énergie fournie par ${c.nom}, pas celle qu’il reçoit.`
        : `C’est l’énergie reçue par ${c.nom}, pas celle qu’il fournit.`,
    },
    {
      label: `Énergie ${leurre}`,
      why: `${maj(c.nom)} n’utilise pas et ne produit pas cette forme comme énergie principale.`,
    },
  ]);
  return {
    prompt: entree
      ? `Quelle forme d’énergie est convertie dans ${c.dans} (celle qu’on lui apporte) ?`
      : `Quelle forme d’énergie utile fournit ${c.nom} ?`,
    answer,
    traps: t,
    hint: 'Un convertisseur reçoit une forme d’énergie et en fournit une autre : repère l’entrée et la sortie.',
    steps: [`Dans ${c.dans} : ${conversion(c)}.`, `Réponse : **énergie ${bon}**.`],
    targetSeconds: 30,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(CONVERTISSEURS).slice(0, 3);
    return {
      prompt: `Associe chaque dispositif à sa conversion principale : ${trois
        .map((c) => c.nom)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        trois.map((c) => [maj(c.nom), conversion(c)] as const),
      ),
      hint: 'La flèche part de ce que le dispositif reçoit et va vers ce qu’il fournit.',
      steps: [
        'Pour chaque dispositif, on cherche l’énergie reçue puis l’énergie fournie.',
        `Réponse : **${trois.map((c) => `${c.nom} : ${conversion(c)}`).join(' ; ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const c = rng.pick(CONVERTISSEURS);
  const inverse = `énergie ${c.sortie} → énergie ${c.entree}`;
  // Une sortie « thermique » ne sert pas de leurre : une lampe ou un moteur chauffent aussi.
  const autres = rng.shuffle(
    CONVERTISSEURS.filter((x) => x !== c && x.sortie !== 'thermique' && conversion(x) !== inverse),
  );
  const { answer, traps: t } = choice(rng, conversion(c), [
    { label: inverse, why: 'La flèche est inversée : on écrit d’abord l’énergie reçue, puis l’énergie fournie.' },
    ...autres.slice(0, 2).map((x) => ({ label: conversion(x), why: `C’est la conversion réalisée par ${x.nom}.` })),
  ]);
  return {
    prompt: `Quelle conversion réalise ${c.nom} ?`,
    answer,
    traps: t,
    hint: 'Demande-toi ce que le dispositif reçoit, puis ce qu’il fournit.',
    steps: [`Dans ${c.dans}, l’énergie ${c.entree} est convertie.`, `Réponse : **${conversion(c)}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CONVERTISSEURS);
  return {
    prompt: `Complète avec les adjectifs justes : que fait ${c.nom} ?`,
    answer: {
      kind: 'cloze',
      parts: [`Dans ${c.dans}, l’énergie `, ' est convertie en énergie ', '.'],
      blanks: [
        { mode: 'text', accepted: [c.entree, sansAccent(c.entree)] },
        { mode: 'text', accepted: [c.sortie, sansAccent(c.sortie)] },
      ],
    },
    hint: 'Premier trou : ce que le dispositif reçoit. Second trou : ce qu’il fournit.',
    steps: [
      `On repère l’entrée puis la sortie : ${conversion(c)}.`,
      `Réponse : **${c.entree}**, puis **${c.sortie}**.`,
    ],
    targetSeconds: 45,
  };
};

const EMET = ['Un moteur à essence en marche', 'Une chaudière à gaz qui chauffe'] as const;
const SANS_COMBUSTION = [
  'Une éolienne qui tourne',
  'Une photopile éclairée',
  'Une lampe branchée sur une pile',
] as const;

const CHAINES: readonly { titre: string; etapes: readonly string[] }[] = [
  {
    titre: 'du vent à la lumière d’une lampe',
    etapes: [
      'Le vent apporte de l’énergie cinétique',
      'L’éolienne convertit cette énergie en énergie électrique',
      'Les câbles transfèrent l’énergie électrique',
      'La lampe convertit l’énergie électrique en énergie lumineuse',
    ],
  },
  {
    titre: 'de la pile au ventilateur qui tourne',
    etapes: [
      'La pile contient de l’énergie chimique',
      'La pile convertit l’énergie chimique en énergie électrique',
      'Les fils transfèrent l’énergie électrique au moteur',
      'Le moteur convertit l’énergie électrique en énergie cinétique',
    ],
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const cas = rng.int(0, 2);
  if (cas === 0) {
    const bon = rng.pick(EMET);
    const { answer, traps: t } = choice(
      rng,
      bon,
      SANS_COMBUSTION.map((label) => ({
        label,
        why: 'Ce dispositif ne brûle aucun carburant pendant son fonctionnement.',
      })),
    );
    return {
      prompt: 'Parmi ces dispositifs, lequel émet du dioxyde de carbone pendant son fonctionnement ?',
      answer,
      traps: t,
      hint: 'Cherche celui qui brûle un combustible, comme le gaz ou un carburant tiré du pétrole.',
      steps: [
        'La combustion de gaz ou de pétrole libère du dioxyde de carbone.',
        `Réponse : **${bon.toLowerCase()}**.`,
      ],
      targetSeconds: 40,
    };
  }
  if (cas === 1) {
    const c = rng.pick(CHAINES);
    return {
      prompt: `Remets dans l’ordre la chaîne d’énergie : ${c.titre}.`,
      answer: ordre(rng, c.etapes),
      hint: 'Commence par la réserve ou la source, termine par ce que l’on observe.',
      steps: [
        'L’énergie part de la source, passe dans le convertisseur, circule, puis est convertie à nouveau.',
        `Réponse : **${c.etapes.join(' → ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const c = rng.pick([
    {
      sujet: 'Une pierre tombe d’un pont',
      entree: 'potentielle' as const,
      sortie: 'cinétique' as const,
      pourquoi: 'Sa hauteur diminue et sa vitesse augmente.',
    },
    {
      sujet: 'L’eau d’un barrage descend en prenant de la vitesse',
      entree: 'potentielle' as const,
      sortie: 'cinétique' as const,
      pourquoi: 'Sa hauteur diminue et sa vitesse augmente.',
    },
  ]);
  const demandeSortie = rng.int(0, 1) === 0;
  const bon = demandeSortie ? c.sortie : c.entree;
  const { answer, traps: t } = saisie(variantes(bon), [
    [
      demandeSortie ? c.entree : c.sortie,
      'Tu as inversé le départ et l’arrivée : regarde ce qui diminue et ce qui augmente.',
    ],
    ['électrique', 'Rien ne fait circuler de courant ici.'],
  ]);
  return {
    prompt: `${c.sujet}. Quelle forme d’énergie ${demandeSortie ? 'apparaît grâce à la conversion (écris l’adjectif)' : 'est convertie (écris l’adjectif)'} ?`,
    answer,
    traps: t,
    hint: 'En hauteur : énergie qui dépend de la position. En mouvement : énergie liée à la vitesse.',
    steps: [c.pourquoi, `La conversion est énergie potentielle → énergie cinétique : **énergie ${bon}**.`],
    targetSeconds: 50,
  };
};

const convertisseur = (nom: string): Convertisseur => {
  const c = CONVERTISSEURS.find((x) => x.nom === nom);
  if (!c) throw new Error(`Convertisseur inconnu : ${nom}`);
  return c;
};

const MONTAGES: readonly {
  lignes: readonly string[];
  /** Conversions successives, dans l'ordre du document. */
  chaine: readonly Convertisseur[];
}[] = [
  {
    lignes: [
      'Une photopile reçoit la lumière du Soleil.',
      'Un fil la relie à un moteur électrique.',
      'Le moteur fait tourner une petite hélice.',
    ],
    chaine: [convertisseur('une photopile'), convertisseur('un moteur électrique')],
  },
  {
    lignes: [
      'Le vent fait tourner les pales d’une éolienne.',
      'Un câble relie l’éolienne à un radiateur électrique.',
      'Le radiateur chauffe une pièce.',
    ],
    chaine: [convertisseur('une éolienne'), convertisseur('un radiateur électrique')],
  },
  {
    lignes: [
      'Une pile neuve est placée dans un jouet.',
      'Elle alimente un moteur électrique.',
      'Le moteur fait avancer le jouet.',
    ],
    chaine: [convertisseur('une pile'), convertisseur('un moteur électrique')],
  },
  {
    lignes: [
      'Une centrale nucléaire alimente le réseau.',
      'Dans une salle, un câble alimente une lampe électrique.',
      'La lampe éclaire la table.',
    ],
    chaine: [convertisseur('une centrale nucléaire'), convertisseur('une lampe électrique')],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MONTAGES);
  const [premier, second] = m.chaine as [Convertisseur, Convertisseur];
  if (rng.int(0, 1) === 0) {
    const { answer, traps: t } = choice(
      rng,
      `énergie ${premier.entree} → énergie ${premier.sortie} → énergie ${second.sortie}`,
      [
        {
          label: `énergie ${premier.sortie} → énergie ${premier.entree} → énergie ${second.sortie}`,
          why: `La première conversion est inversée : ${premier.nom} reçoit de l’énergie ${premier.entree}.`,
        },
        {
          label: `énergie ${second.sortie} → énergie ${premier.sortie} → énergie ${premier.entree}`,
          why: 'La chaîne est écrite à l’envers : elle commence à la source.',
        },
        {
          label: `énergie ${premier.entree} → énergie ${second.sortie} → énergie ${premier.sortie}`,
          why: 'Les deux dernières étapes sont échangées : l’électricité passe d’un dispositif à l’autre.',
        },
      ],
    );
    return {
      prompt: 'Lis la description. Quelle est la chaîne d’énergie complète, de la source à l’effet observé ?',
      figure: { kind: 'document', title: 'Montage (situation inventée)', lines: m.lignes },
      answer,
      traps: t,
      hint: 'Traite chaque dispositif l’un après l’autre : entrée, puis sortie.',
      steps: [
        `${maj(premier.nom)} : ${conversion(premier)}.`,
        `${maj(second.nom)} : ${conversion(second)}.`,
        `Réponse : **énergie ${premier.entree} → énergie ${premier.sortie} → énergie ${second.sortie}**.`,
      ],
      targetSeconds: 90,
    };
  }
  const { answer, traps: t } = saisie(variantes(premier.entree), [
    [premier.sortie, `C’est l’énergie fournie par ${premier.nom}, pas celle qu’il reçoit.`],
    [second.sortie, 'C’est l’effet obtenu à la fin de la chaîne, pas l’énergie de départ.'],
  ]);
  return {
    prompt: `Lis la description. Quelle forme d’énergie reçoit le premier convertisseur (écris l’adjectif) ?`,
    figure: { kind: 'document', title: 'Montage (situation inventée)', lines: m.lignes },
    answer,
    traps: t,
    hint: 'Repère d’abord le premier dispositif qui change la forme de l’énergie, puis ce qui lui arrive.',
    steps: [
      `Le premier convertisseur est ${premier.nom} : ${conversion(premier)}.`,
      `Il reçoit de l’**énergie ${premier.entree}**.`,
    ],
    targetSeconds: 80,
  };
};

export const conversionsEnergie: Skill = {
  id: 'p5-conversions-energie',
  title: 'Les conversions d’énergie',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **conversion d’énergie** change la forme de l’énergie : une lampe reçoit de l’**énergie électrique** et fournit de l’**énergie lumineuse**.',
      'Convertir n’est pas transférer : l’énergie électrique sert à un transfert, un fil la transporte jusqu’à la lampe sans changer sa forme.',
      'Brûler du gaz ou un carburant tiré du pétrole émet du **dioxyde de carbone**.',
    ],
    ...referencesEnergie(
      'conversion',
      'co2-programme',
      'transferts',
      'chute',
      'moteur-pile',
      'essence',
      'lampe-transfert',
      'constituants',
      'pile',
      'photopile',
      'eolienne',
      'lampe',
      'moteur',
      'radiateur',
      'centrale-nucleaire',
      'essence-petrole',
      'co2-combustion',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
