import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { maj } from './outils.ts';
import {
  compter,
  completer,
  document,
  ecrit,
  formes,
  liste,
  notion,
  paires,
  qcm,
  ranger,
  type Faux,
} from './vivant-kit.ts';

// ——— Développement : cycles de vie, métamorphose, développement humain dans l'utérus, puberté (6e) ———

const PLACENTA = 'Le placenta assure les échanges nutritifs et gazeux entre la mère et le fœtus.';
const SEMAINES = 'Dans l’espèce humaine, on parle d’embryon jusqu’à la 8e semaine, puis de fœtus.';

const MOTS: readonly (readonly [string, string])[] = [
  ['ovipare', 'animal qui pond des œufs, lesquels éclosent après la ponte'],
  ['vivipare', 'animal dont l’embryon se développe dans le corps de la mère'],
  ['la métamorphose', 'transformation profonde de la forme après le développement dans l’œuf'],
  ['la nymphe', 'stade d’un insecte entre la larve et l’adulte'],
  ['le placenta', 'organe d’échanges entre la mère et le fœtus'],
  ['le cordon ombilical', 'ce qui relie le fœtus au placenta'],
  ['la grossesse', 'état de la femme enceinte, jusqu’à l’accouchement'],
  ['la puberté', 'période où les organes reproducteurs deviennent fonctionnels'],
];

const autresMots = (m: string, n: number, rng: Rng): Faux[] =>
  rng
    .shuffle(MOTS.filter((x) => x[0] !== m))
    .slice(0, n)
    .map(([mot, d]) => [mot, `${maj(mot)} : ${d}.`]);

const niveau1 = (rng: Rng): QuestionDraft => {
  const [mot, def] = rng.pick(MOTS);
  return qcm(rng, {
    prompt: `Quel terme correspond à : « ${def} » ?`,
    bon: mot,
    faux: autresMots(mot, 2, rng),
    hint: 'Élimine d’abord les termes qui ne parlent pas du même sujet.',
    pourquoi: [`${maj(mot)} : ${def}.`],
  });
};

const ANIMAUX = [
  { nom: 'la poule, qui pond des œufs où se développent les poussins', type: 'ovipare' },
  { nom: 'une tortue, qui pond des œufs qui éclosent ensuite dans le sable', type: 'ovipare' },
  { nom: 'la grenouille, qui pond des œufs dans l’eau, d’où sortent des têtards', type: 'ovipare' },
  { nom: 'la chatte, dont les petits se développent dans son corps avant la naissance', type: 'vivipare' },
  { nom: 'la baleine, dont le petit se développe dans le corps de la mère', type: 'vivipare' },
  { nom: 'l’être humain, dont l’enfant se développe dans l’utérus', type: 'vivipare' },
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) return paires(rng, MOTS, 3, 'Associe chaque terme à son sens');
  if (t === 1) {
    const a = rng.pick(ANIMAUX);
    return qcm(rng, {
      prompt: `Observe ${a.nom}. Comment qualifier ce mode de développement ?`,
      bon: a.type,
      faux: [
        [
          a.type === 'ovipare' ? 'vivipare' : 'ovipare',
          'Regarde où se développe le petit : dans un œuf pondu ou dans le corps de la mère.',
        ],
        ['unicellulaire', 'Cet animal est formé d’un très grand nombre de cellules.'],
        ['pollinisateur', 'Ce terme concerne le transport du pollen.'],
      ],
      hint: 'Le petit se développe-t-il dans un œuf pondu ou dans le corps de sa mère ?',
      pourquoi: ['Ovipare : des œufs pondus. Vivipare : développement dans le corps de la mère.'],
    });
  }
  const c = rng.pick([
    { m: 'les règles (écoulement sanguin d’origine utérine)', type: 'physiologique' },
    { m: 'la production de spermatozoïdes par les testicules', type: 'physiologique' },
    { m: 'le début de la libération d’ovules par les ovaires', type: 'physiologique' },
    { m: 'l’apparition de poils sur le corps', type: 'morphologique' },
    { m: 'la modification de la silhouette', type: 'morphologique' },
    { m: 'une nouvelle façon de se comporter avec les autres', type: 'comportementale' },
    { m: 'une nouvelle façon d’agir avec son entourage', type: 'comportementale' },
  ]);
  const sens: Record<string, string> = {
    morphologique: 'elle concerne la forme du corps',
    physiologique: 'elle concerne le fonctionnement du corps',
    comportementale: 'elle concerne la façon de se conduire',
  };
  return qcm(rng, {
    prompt: `Puberté : de quel type est cette modification : « ${c.m} » ?`,
    bon: c.type,
    faux: Object.keys(sens)
      .filter((k) => k !== c.type)
      .map((k): Faux => [k, `Une modification ${k} : ${sens[k]}.`]),
    hint: 'Forme du corps, fonctionnement du corps ou façon de se conduire ?',
    pourquoi: [`Une modification ${c.type} : ${sens[c.type]}.`],
  });
};

const CYCLES: readonly { nom: string; etapes: readonly string[] }[] = [
  {
    nom: 'd’une grenouille',
    etapes: ['œuf', 'embryon dans l’œuf', 'têtard', 'jeune grenouille', 'adulte qui se reproduit'],
  },
  { nom: 'd’un papillon', etapes: ['œuf', 'chenille', 'chrysalide', 'papillon'] },
  {
    nom: 'd’une plante à fleurs',
    etapes: ['graine', 'germination', 'plantule', 'plante fleurie', 'fruit avec des graines'],
  },
  {
    nom: 'humain avant la naissance puis après',
    etapes: ['fécondation', 'embryon', 'fœtus', 'nouveau-né', 'adolescent'],
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const c = rng.pick(CYCLES);
    return ranger(rng, {
      prompt: `Remets dans l’ordre le développement ${c.nom} : ${liste(c.etapes)}.`,
      enOrdre: c.etapes,
      hint: 'Commence par le tout début de la vie.',
      pourquoi: ['Un cycle de vie enchaîne des formes dans un ordre précis.'],
    });
  }
  if (t === 1)
    return completer(rng, {
      prompt: 'Complète le développement humain avant la naissance.',
      parts: ['Jusqu’à la 8e semaine on parle d’', ', puis de ', ' ; les échanges avec la mère passent par le ', '.'],
      trous: [
        ['embryon', 'adulte', 'œuf pondu'],
        ['fœtus', 'têtard', 'larve'],
        ['placenta', 'pistil', 'noyau'],
      ],
      hint: 'Trois mots du développement dans l’utérus.',
      pourquoi: [SEMAINES, PLACENTA],
    });
  const m = rng.pick([
    {
      q: 'l’organe qui assure les échanges entre la mère et le fœtus',
      mot: 'placenta',
      art: ['le', 'un'],
      faux: ['utérus', 'cordon ombilical'],
    },
    {
      q: 'ce qui relie le fœtus au placenta',
      mot: 'cordon ombilical',
      art: ['le', 'un'],
      faux: ['placenta', 'utérus'],
    },
    {
      q: 'l’ensemble des transformations qui font passer un têtard à la forme adulte',
      mot: 'métamorphose',
      art: ['la', 'une'],
      faux: ['germination', 'puberté'],
    },
  ]);
  return ecrit({
    prompt: `Écris le nom de ${m.q}.`,
    accepte: formes(m.mot, ...m.art).concat(m.mot === 'cordon ombilical' ? ['cordon'] : []),
    faux: m.faux.map((f): Faux => [f, `Ce terme ne désigne pas ${m.q}.`]),
    hint: 'Pense au rôle décrit.',
    pourquoi: [m.mot === 'métamorphose' ? 'La grenouille et le papillon se métamorphosent.' : PLACENTA],
  });
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0) return paires(rng, MOTS, 5, 'Sans aide, associe les cinq termes à leur sens');
  if (t === 1) {
    const cas = rng.pick([
      {
        q: 'Pendant la grossesse, comment le fœtus reçoit-il les nutriments dont il a besoin ?',
        bon: 'par des échanges au niveau du placenta, relié à lui par le cordon ombilical',
        faux: [
          'en mangeant par la bouche les aliments de sa mère',
          'en utilisant les réserves d’un œuf pondu',
          'en respirant l’air dans l’utérus',
        ],
        pourquoi: PLACENTA,
      },
      {
        q: 'Deux élèves du même âge n’ont pas les mêmes signes de puberté. Quelle affirmation est correcte ?',
        bon: 'la puberté est une période : elle ne se résume pas à un instant ni à un âge unique',
        faux: [
          'l’un des deux n’aura jamais de puberté',
          'la puberté se produit en une seule journée',
          'la puberté commence à la naissance et finit à un an',
        ],
        pourquoi: 'La puberté est une période de la croissance, pas un moment précis.',
      },
      {
        q: 'Quel changement annonce que le corps devient capable de se reproduire ?',
        bon: 'les organes reproducteurs deviennent fonctionnels',
        faux: ['les dents de lait apparaissent', 'l’enfant apprend à marcher', 'le placenta se forme chez l’enfant'],
        pourquoi: 'À la puberté, les glandes génitales deviennent fonctionnelles.',
      },
    ]);
    return qcm(rng, {
      prompt: cas.q,
      bon: cas.bon,
      faux: cas.faux.map((f): Faux => [f, cas.pourquoi]),
      hint: 'Rappelle-toi le rôle de chaque organe et ce qu’est la puberté.',
      pourquoi: [cas.pourquoi],
    });
  }
  if (t === 2) {
    const semaine = rng.int(3, 7);
    const tard = rng.int(12, 35);
    const s = rng.int(0, 1) === 0 ? semaine : tard;
    const bon = s <= 8 ? 'embryon' : 'fœtus';
    return ecrit({
      prompt: `Espèce humaine : à la ${s}e semaine de développement dans l’utérus, quel nom donne-t-on au futur bébé ?`,
      accepte:
        bon === 'embryon'
          ? formes('embryon', 'l’', 'un')
          : ['fœtus', 'foetus', 'le fœtus', 'un fœtus', 'le foetus', 'un foetus'],
      faux: [
        [bon === 'embryon' ? 'fœtus' : 'embryon', SEMAINES],
        ['larve', 'Le développement humain ne passe pas par une larve.'],
      ],
      hint: 'La limite se situe à la huitième semaine.',
      pourquoi: [SEMAINES],
    });
  }
  return ecrit({
    prompt:
      'Chez les êtres humains, quel nom porte la période de la croissance où le corps devient capable de se reproduire ?',
    accepte: formes('puberté', 'la'),
    faux: [
      ['grossesse', 'La grossesse est l’état de la femme enceinte.'],
      ['métamorphose', 'Ce terme s’emploie pour des animaux comme la grenouille ou le papillon.'],
      ['germination', 'La germination concerne la graine.'],
    ],
    hint: 'Ses signes sont morphologiques, physiologiques et comportementaux.',
    pourquoi: ['La puberté rend les organes reproducteurs fonctionnels.'],
  });
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 2) {
    const espece = rng.pick(['la grenouille verte', 'le crapaud', 'la grenouille rousse']);
    const j1 = rng.pick([8, 10, 12]);
    const j2 = j1 + rng.pick([30, 35, 40]);
    const j3 = j2 + rng.pick([25, 28, 33]);
    return compter({
      prompt: `Lis l’élevage de ${espece} (jours ${j1}, ${j2}, ${j3}). Combien de jours séparent la sortie des têtards de l’apparition des pattes arrière ?`,
      figure: document('Journal d’élevage (données inventées pour l’exercice)', [
        'Jour 0 : des œufs sont observés dans l’eau.',
        `Jour ${j1} : des têtards sortent des œufs.`,
        `Jour ${j2} : les pattes arrière apparaissent.`,
        `Jour ${j3} : la queue a presque disparu : la métamorphose s’achève.`,
      ]),
      valeur: j2 - j1,
      unite: 'jours',
      faux: [
        [j2, 'Tu as compté depuis la ponte : on part de la sortie des têtards.'],
        [j3 - j1, 'Tu es allé jusqu’à la fin de la métamorphose.'],
      ],
      hint: 'Repère les deux dates utiles, puis soustrais.',
      pourquoi: [`${j2} − ${j1} = ${j2 - j1}.`],
    });
  }
  const s1 = rng.int(4, 7);
  const s2 = 16;
  const s3 = 32;
  const m1 = rng.pick([11, 12, 13]);
  const gain = rng.pick([28, 29, 30]);
  const figure = document('Suivi d’une grossesse (données inventées pour l’exercice)', [
    `Semaine ${s1} : la grossesse est confirmée.`,
    `Semaine ${s2} : taille estimée ${m1} cm.`,
    `Semaine ${s3} : taille estimée ${m1 + gain} cm.`,
  ]);
  const code = `semaines ${s1}, ${s2}, ${s3} ; ${m1} cm puis ${m1 + gain} cm`;
  if (t === 0) {
    const s = rng.pick([s1, s2, s3]);
    const bon = s <= 8 ? 'un embryon' : 'un fœtus';
    return qcm(rng, {
      prompt: `Lis le suivi (${code}). À la semaine ${s}, comment nomme-t-on l’être qui se développe ?`,
      figure,
      bon,
      faux: [
        [s <= 8 ? 'un fœtus' : 'un embryon', SEMAINES],
        ['une larve', 'Le développement humain ne comporte pas de stade larvaire.'],
        ['un nouveau-né', 'Le nouveau-né est l’enfant après la naissance.'],
      ],
      hint: 'Compare la semaine à la limite des huit semaines.',
      pourquoi: [SEMAINES],
    });
  }
  return compter({
    prompt: `Lis le suivi (${code}). De combien de centimètres le fœtus a-t-il grandi entre les semaines ${s2} et ${s3} ?`,
    figure,
    valeur: gain,
    unite: 'cm',
    faux: [
      [m1 + gain, 'C’est la taille finale : on demande l’écart.'],
      [2 * m1 + gain, 'Pour trouver la croissance, on soustrait.'],
    ],
    hint: 'Repère les deux tailles, puis soustrais.',
    pourquoi: [`${m1 + gain} − ${m1} = ${gain}.`],
  });
};

export const developpementEtPuberte = notion({
  id: 'v6-developpement',
  title: 'Le développement et la puberté',
  memo: [
    'Un animal **ovipare** pond des œufs ; chez un **vivipare**, le petit se développe dans le corps de la mère. Certains changent beaucoup de forme : c’est la **métamorphose** (la **nymphe** précède l’insecte adulte).',
    'Humain : l’**embryon** (jusqu’à la 8e semaine) devient **fœtus**. Le **placenta**, relié par le **cordon ombilical**, assure les échanges. À la **puberté**, le corps change (forme, fonctionnement, comportement) et devient capable de se reproduire.',
  ],
  faits: [
    'cycle',
    'interne-vivipare',
    'puberte-programme',
    'metamorphose',
    'nymphe',
    'ovipare',
    'vivipare',
    'embryon-humain',
    'foetus',
    'placenta',
    'cordon',
    'gestation',
    'puberte',
    'menstruation',
    'mue',
    'adolescence',
  ],
  niveaux: [niveau1, niveau2, niveau3, niveau4, niveau5],
});
