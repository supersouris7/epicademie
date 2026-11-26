import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesEnergie } from './donnees-energie.ts';

// ——— Sources et formes d'énergie (5e) ———

export type FormeEnergie =
  'cinétique' | 'potentielle' | 'thermique' | 'électrique' | 'chimique' | 'nucléaire' | 'lumineuse';

export const FORMES: Record<FormeEnergie, { regle: string; scenes: readonly string[] }> = {
  cinétique: {
    regle: 'c’est l’énergie liée au mouvement',
    scenes: ['un ballon qui roule sur un terrain plat', 'un vélo lancé sur une route plate'],
  },
  potentielle: {
    regle: 'elle dépend de la position, par exemple de l’altitude',
    scenes: ['une pierre immobile au bord d’une haute falaise', 'l’eau immobile retenue en haut d’un barrage'],
  },
  thermique: {
    regle: 'c’est l’énergie liée à la température, celle d’un corps chaud',
    scenes: ['l’eau très chaude d’une bouillotte', 'une plaque de métal brûlante sortie d’un four'],
  },
  électrique: {
    regle: 'c’est celle que transporte le courant électrique',
    scenes: ['le courant qui circule dans un câble', 'le courant qui arrive à un chargeur par un fil'],
  },
  chimique: {
    regle: 'elle est stockée dans la matière, par exemple dans une pile ou un carburant',
    scenes: ['la réserve d’énergie d’une pile neuve', 'la réserve d’énergie d’un bidon d’essence'],
  },
  nucléaire: {
    regle: 'elle vient du noyau des atomes, par exemple de l’uranium',
    scenes: ['la réserve d’énergie de l’uranium d’une centrale', 'l’énergie libérée par les noyaux d’uranium'],
  },
  lumineuse: {
    regle: 'c’est celle que transporte la lumière',
    scenes: ['la lumière d’une lampe de bureau', 'la lumière du Soleil qui éclaire un jardin'],
  },
};
const CLES = Object.keys(FORMES) as FormeEnergie[];
const nom = (f: FormeEnergie) => `Énergie ${f}`;
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pourquoiPas = (f: FormeEnergie) => `Ce n’est pas l’énergie ${f} : ${FORMES[f].regle}.`;
const accepte = (f: FormeEnergie): string[] => {
  const base = [f, `énergie ${f}`, `l’énergie ${f}`];
  const alt = f === 'potentielle' ? ['de pesanteur', 'énergie de pesanteur', 'l’énergie de pesanteur'] : [];
  const tous = [...base, ...alt];
  return [...new Set([...tous, ...tous.map((x) => x.normalize('NFD').replace(/\p{M}/gu, ''))])];
};

/** Sources dont le caractère renouvelable ou fossile est dit par les textes cités. */
export const RENOUVELABLES = [
  'le Soleil',
  'le vent',
  'la chaleur de la Terre',
  'les chutes d’eau',
  'les marées',
] as const;
export const FOSSILES = ['le pétrole', 'le charbon', 'le gaz naturel'] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(CLES);
  const scene = rng.pick(FORMES[f].scenes);
  const autres = rng.shuffle(CLES.filter((x) => x !== f)).slice(0, 2);
  const { answer, traps: t } = choice(
    rng,
    nom(f),
    autres.map((x) => ({ label: nom(x), why: pourquoiPas(x) })),
  );
  return {
    prompt: `Quelle forme d’énergie est la plus évidente ici : ${scene} ?`,
    answer,
    traps: t,
    hint: 'Demande-toi : ça bouge, c’est en hauteur, c’est chaud, ça éclaire, c’est un courant ou une réserve dans la matière ?',
    steps: [`Énergie ${f} : ${FORMES[f].regle}.`, `C’est ce que montre la situation : **énergie ${f}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cherche = rng.int(0, 1) === 0;
    const bon = cherche ? rng.pick(RENOUVELABLES) : rng.pick(FOSSILES);
    const autres = rng.shuffle<string>(cherche ? FOSSILES : RENOUVELABLES).slice(0, 3);
    const { answer, traps: t } = choice(
      rng,
      maj(bon),
      autres.map((a) => ({
        label: maj(a),
        why: cherche
          ? `${maj(a)} est une source d’énergie fossile : ses stocks diminuent.`
          : `${maj(a)} : cette source est renouvelable, elle n’est pas fossile.`,
      })),
    );
    return {
      prompt: `Laquelle de ces sources d’énergie est ${cherche ? 'renouvelable' : 'fossile'} ?`,
      answer,
      traps: t,
      hint: 'Les sources fossiles viennent de stocks qui diminuent ; les renouvelables se reconstituent ou sont fournies sans cesse.',
      steps: [
        'Les énergies renouvelables sont alimentées par le Soleil, le vent, la chaleur de la Terre, les chutes d’eau ou les marées ; les fossiles ont des stocks qui diminuent.',
        `Réponse : **${bon}**.`,
      ],
      targetSeconds: 30,
    };
  }
  const trois = rng.shuffle(CLES).slice(0, 3);
  const paires = trois.map((f) => [maj(rng.pick(FORMES[f].scenes)), nom(f)] as const);
  return {
    prompt: `Associe chaque situation à sa forme d’énergie : ${[...paires.map((p) => p[0])].sort().join(' ; ')}.`,
    answer: association(rng, paires),
    hint: 'Commence par la situation qui te paraît la plus évidente, puis termine par élimination.',
    steps: [
      'On repère pour chaque situation ce qui porte l’énergie : mouvement, position, température, courant, matière, lumière…',
      `Réponse : **${paires.map((p) => `${p[0]} → ${p[1].toLowerCase()}`).join(' ; ')}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(CLES);
  const scene = rng.pick(FORMES[f].scenes);
  const proche = rng.shuffle(CLES.filter((x) => x !== f)).slice(0, 2);
  const { answer, traps: t } = saisie(
    accepte(f),
    proche.map((x) => [x, pourquoiPas(x)] as const),
  );
  return {
    prompt: `Écris le nom de la forme d’énergie (un adjectif suffit) associée à : ${scene}.`,
    answer,
    traps: t,
    hint: 'Complète la phrase « énergie… » avec l’adjectif qui décrit ce qui porte l’énergie.',
    steps: [`Énergie ${f} : ${FORMES[f].regle}.`, `C’est ce que montre la situation. Réponse : **énergie ${f}**.`],
    targetSeconds: 40,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cinq = rng.shuffle(CLES).slice(0, 5);
    const paires = cinq.map((f) => [maj(rng.pick(FORMES[f].scenes)), nom(f)] as const);
    return {
      prompt: `Cinq situations, cinq formes d’énergie. Associe-les : ${[...paires.map((p) => p[0])].sort().join(' ; ')}.`,
      answer: association(rng, paires),
      hint: 'Distingue bien une réserve dans la matière, une réserve liée à la position et une énergie transportée.',
      steps: [
        'Chaque forme a son indice : mouvement, position, température, courant, matière, noyau des atomes, lumière.',
        `Réponse : **${paires.map((p) => `${p[0]} → ${p[1].toLowerCase()}`).join(' ; ')}**.`,
      ],
      targetSeconds: 75,
    };
  }
  const cas = rng.pick([
    { source: 'le vent', forme: 'cinétique' as const, texte: 'Le vent fait tourner les pales d’une éolienne.' },
    {
      source: 'le Soleil',
      forme: 'lumineuse' as const,
      texte: 'La lumière du Soleil arrive sur un panneau photovoltaïque.',
    },
    {
      source: 'l’uranium',
      forme: 'nucléaire' as const,
      texte: 'L’uranium alimente le réacteur d’une centrale.',
    },
    {
      source: 'le pétrole',
      forme: 'chimique' as const,
      texte: 'De l’essence, tirée du pétrole, est brûlée dans un moteur.',
    },
    {
      source: 'le charbon',
      forme: 'chimique' as const,
      texte: 'Du charbon est brûlé dans une chaudière.',
    },
  ]);
  const formes = rng.shuffle([cas.forme, ...rng.shuffle(CLES.filter((x) => x !== cas.forme)).slice(0, 2)]);
  const sources = rng.shuffle(['le vent', 'le Soleil', 'l’uranium', 'le pétrole', 'le charbon']);
  const options = rng.shuffle([cas.source, ...sources.filter((s) => s !== cas.source).slice(0, 2)]);
  return {
    prompt: `${cas.texte} Complète : distingue la source et la forme d’énergie.`,
    answer: {
      kind: 'cloze',
      parts: ['La source d’énergie est ', '. L’énergie qu’elle apporte est de forme ', '.'],
      blanks: [
        { mode: 'list', options, correct: options.indexOf(cas.source) },
        { mode: 'list', options: formes, correct: formes.indexOf(cas.forme) },
      ],
    },
    hint: 'La source, c’est ce dont on tire l’énergie ; la forme, c’est la façon dont elle se présente.',
    steps: [
      'Une source est un objet ou un phénomène naturel ; une forme décrit l’énergie elle-même.',
      `Source : **${cas.source}** ; forme : **énergie ${cas.forme}**.`,
    ],
    targetSeconds: 60,
  };
};

const EQUIPEMENTS: readonly { ligne: string; source: string; famille: 'renouvelable' | 'fossile' }[] = [
  { ligne: 'des panneaux sur le toit utilisent la lumière du Soleil', source: 'le Soleil', famille: 'renouvelable' },
  { ligne: 'une petite éolienne utilise le vent', source: 'le vent', famille: 'renouvelable' },
  { ligne: 'une turbine utilise les chutes d’eau d’une rivière', source: 'les chutes d’eau', famille: 'renouvelable' },
  { ligne: 'un système utilise la chaleur de la Terre', source: 'la chaleur de la Terre', famille: 'renouvelable' },
  { ligne: 'une chaudière brûle du gaz naturel', source: 'le gaz naturel', famille: 'fossile' },
  { ligne: 'un poêle brûle du charbon', source: 'le charbon', famille: 'fossile' },
  { ligne: 'un groupe électrogène brûle un carburant tiré du pétrole', source: 'le pétrole', famille: 'fossile' },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const nbRen = rng.int(1, 3);
  const ren = rng.shuffle(EQUIPEMENTS.filter((e) => e.famille === 'renouvelable')).slice(0, nbRen);
  const fos = rng.shuffle(EQUIPEMENTS.filter((e) => e.famille === 'fossile')).slice(0, 4 - nbRen);
  const lignes = rng.shuffle([...ren, ...fos]);
  const demandeRen = rng.int(0, 1) === 0;
  const bon = demandeRen ? ren.length : fos.length;
  return {
    prompt: `Lis la description du hameau. Combien de sources ${demandeRen ? 'renouvelables' : 'fossiles'} différentes y sont utilisées ?`,
    figure: {
      kind: 'document',
      title: 'Un hameau (situation inventée)',
      lines: lignes.map((e) => `Dans une maison, ${e.ligne}.`),
    },
    answer: num(bon),
    traps: traps(r(bon), [
      [
        4 - bon,
        demandeRen
          ? 'Tu as compté les sources fossiles : leurs stocks diminuent, elles ne sont pas renouvelables.'
          : 'Tu as compté les sources renouvelables, et non les fossiles.',
      ],
      [4, 'Les sources n’ont pas toutes le même caractère : trie-les avant de compter.'],
    ]),
    hint: 'Souligne la source de chaque ligne, puis classe-la : renouvelable ou fossile ?',
    steps: [
      `Renouvelables : ${ren.map((e) => e.source).join(', ')} ; fossiles : ${fos.map((e) => e.source).join(', ')}.`,
      `On compte les sources ${demandeRen ? 'renouvelables' : 'fossiles'} : **${bon}**.`,
    ],
    targetSeconds: 90,
  };
};

export const sourcesFormesEnergie: Skill = {
  id: 'p5-sources-formes-energie',
  title: 'Sources et formes d’énergie',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **source d’énergie** est ce dont on tire de l’énergie : **renouvelable** (Soleil, vent, chutes d’eau, marées, chaleur de la Terre) ou **fossile** (pétrole, charbon, gaz naturel).',
      'Les formes : **énergie cinétique** (mouvement), **énergie potentielle** (position), **énergie thermique**, **énergie électrique**, **énergie chimique** (réserve dans la matière), **énergie nucléaire** (uranium) et **énergie lumineuse**.',
      'Exemple : le vent est une source ; l’air en mouvement possède de l’énergie cinétique.',
    ],
    ...referencesEnergie(
      'identifier',
      'formes',
      'ressources',
      'renouvelable-programme',
      'renouvelables-liste',
      'fossiles',
      'gaz-fossile',
      'combustibles-fossiles',
      'renouvelable-definition',
      'cinetique',
      'pesanteur',
      'lumiere',
      'thermique',
      'nucleaire',
      'transferts',
      'photopile',
      'centrale-nucleaire',
      'pile',
      'essence-petrole',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
