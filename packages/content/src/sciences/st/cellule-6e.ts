import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { maj } from './outils.ts';
import { compter, completer, document, ecrit, formes, notion, paires, qcm, ranger, type Faux } from './vivant-kit.ts';

// ——— La cellule : unité des êtres vivants, observation au microscope, unicellulaires et pluricellulaires (6e) ———

const UNITE = 'La cellule est l’unité de structure commune à tous les êtres vivants.';
const UNI = 'Unicellulaire : une seule cellule. Pluricellulaire : plusieurs cellules.';

const PARTIES = [
  { nom: 'membrane', art: 'la membrane', role: 'la limite extérieure de la cellule' },
  { nom: 'noyau', art: 'le noyau', role: 'le corps arrondi observé dans presque toutes les cellules' },
  { nom: 'cytoplasme', art: 'le cytoplasme', role: 'la partie comprise entre le noyau et la membrane' },
] as const;

const UNICELLULAIRES = ['la paramécie', 'une levure', 'une bactérie'] as const;
const MULTI = ['un être humain', 'un chien', 'un chêne'] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const p = rng.pick(PARTIES);
    return qcm(rng, {
      prompt: `Dans une cellule, comment appelle-t-on ${p.role} ?`,
      bon: p.art,
      faux: PARTIES.filter((x) => x !== p).map((x): Faux => [x.art, `${maj(x.art)}, c’est ${x.role}.`]),
      hint: 'Imagine le schéma d’une cellule, du bord vers le centre.',
      pourquoi: ['On repère chaque partie par sa place.', `${maj(p.art)} : ${p.role}.`],
    });
  }
  const vivant = rng.pick(['un chat', 'un rosier', 'une paramécie', 'une levure', 'un être humain']);
  return qcm(rng, {
    prompt: `On étudie ${vivant}. De quelle unité de base cet être vivant est-il formé ?`,
    bon: 'la cellule',
    faux: [
      ['l’organe', 'Un organe est déjà un ensemble organisé : il n’est pas présent chez tous les êtres vivants.'],
      ['l’appareil digestif', 'Un appareil réunit plusieurs organes : ce n’est pas l’unité de base.'],
    ],
    hint: 'C’est la plus petite unité commune à tous les êtres vivants.',
    pourquoi: [UNITE],
  });
};

const OBSERVATIONS = [
  { q: 'Quel instrument à très fort grossissement permet d’observer des cellules ?', bon: 'le microscope' },
  {
    q: 'Des cellules sont invisibles à l’œil nu. Avec quel instrument les observe-t-on en classe ?',
    bon: 'le microscope',
  },
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0)
    return paires(
      rng,
      [...PARTIES.map((p) => [p.art, p.role] as const), ['le microscope', 'l’instrument à très fort grossissement']],
      3,
      'Associe chaque mot à sa description',
    );
  if (t === 1) {
    const o = rng.pick(OBSERVATIONS);
    return qcm(rng, {
      prompt: o.q,
      bon: o.bon,
      faux: [
        ['la règle graduée', 'Une règle mesure des longueurs : elle ne grossit rien.'],
        ['la balance', 'Une balance mesure une masse.'],
        ['le thermomètre', 'Un thermomètre mesure une température.'],
      ],
      hint: 'L’instrument grossit ce que l’on regarde.',
      pourquoi: ['Les cellules s’observent avec un fort grossissement.'],
    });
  }
  const u = rng.pick(UNICELLULAIRES);
  return qcm(rng, {
    prompt: `Un élève étudie ${u}. Quelle description convient ?`,
    bon: 'un être vivant formé d’une seule cellule',
    faux: [
      ['un être vivant formé de plusieurs organes', 'Un organisme d’une seule cellule n’a pas d’organes.'],
      ['un objet non vivant, car il n’a qu’une cellule', 'Une seule cellule suffit pour former un être vivant.'],
      ['un être vivant qui ne contient aucune cellule', UNITE],
    ],
    hint: 'Pense au mot « unicellulaire ».',
    pourquoi: [`${maj(u)} est unicellulaire.`, UNI],
  });
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0) {
    const p = rng.pick(PARTIES);
    return ecrit({
      prompt: `Écris le nom de cette partie de la cellule : ${p.role}.`,
      accepte: formes(p.nom, p.art.split(' ')[0] ?? 'le', p.nom === 'membrane' ? 'une' : 'un').concat(
        p.nom === 'membrane' ? ['membrane plasmique', 'membrane cellulaire', 'la membrane plasmique'] : [],
      ),
      faux: PARTIES.filter((x) => x !== p).map((x): Faux => [x.nom, `${maj(x.art)}, c’est ${x.role}.`]),
      hint: 'Les trois noms à connaître : un au bord, un arrondi, un qui remplit l’espace entre les deux.',
      pourquoi: [`${maj(p.art)} : ${p.role}.`],
    });
  }
  if (t === 1)
    return ranger(rng, {
      prompt:
        'Dans une cellule à noyau, range ces trois parties de l’extérieur vers le centre : cytoplasme, membrane, noyau.',
      enOrdre: ['membrane', 'cytoplasme', 'noyau'],
      hint: 'Commence par la limite de la cellule.',
      pourquoi: ['La membrane limite la cellule.', 'Le cytoplasme est compris entre le noyau et la membrane.'],
    });
  if (t === 2) {
    const u = rng.pick(UNICELLULAIRES);
    return ecrit({
      prompt: `${maj(u)} est un être vivant formé d’une seule cellule. Quel adjectif le qualifie ?`,
      accepte: ['unicellulaire', 'uni-cellulaire', 'monocellulaire'],
      faux: [
        ['pluricellulaire', 'Pluricellulaire désigne un être formé de plusieurs cellules.'],
        ['microscope', 'Le microscope est l’instrument, pas un adjectif.'],
      ],
      hint: 'L’adjectif commence par le préfixe qui veut dire « un ».',
      pourquoi: [UNI],
    });
  }
  const m = rng.pick(MULTI);
  const u = rng.pick(UNICELLULAIRES);
  return completer(rng, {
    prompt: `Complète au sujet de ces deux êtres vivants : ${u} et ${m}.`,
    parts: [`${maj(u)} est `, `, tandis que ${m} est `, '.'],
    trous: [
      ['unicellulaire', 'pluricellulaire'],
      ['pluricellulaire', 'unicellulaire'],
    ],
    hint: 'Compte les cellules : une seule, ou un très grand nombre ?',
    pourquoi: [UNI],
  });
};

const ENONCES: readonly { texte: string; juste: boolean; pourquoi: string }[] = [
  { texte: 'Les végétaux aussi sont formés de cellules.', juste: true, pourquoi: UNITE },
  { texte: 'Seuls les animaux sont formés de cellules.', juste: false, pourquoi: UNITE },
  { texte: 'Un être vivant peut être formé d’une seule cellule.', juste: true, pourquoi: UNI },
  { texte: 'Tout être vivant possède forcément des milliers de cellules.', juste: false, pourquoi: UNI },
  { texte: 'Une bactérie est un micro-organisme formé d’une seule cellule.', juste: true, pourquoi: UNI },
  { texte: 'Une levure est un champignon formé d’une seule cellule.', juste: true, pourquoi: UNI },
  {
    texte: 'Le cytoplasme entoure la membrane, à l’extérieur de la cellule.',
    juste: false,
    pourquoi: 'La membrane est la limite extérieure : le cytoplasme est à l’intérieur.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0)
    return paires(
      rng,
      [
        ...PARTIES.map((p) => [p.art, p.role] as const),
        ['le microscope', 'l’instrument à très fort grossissement'],
        ['un tissu végétal', 'un ensemble de cellules semblables ayant la même fonction'],
        ['la paramécie', 'un être vivant dont le corps est une seule cellule'],
      ],
      5,
      'Sans aide, associe les cinq éléments à leur description',
    );
  if (t === 1) {
    const e = rng.pick(ENONCES);
    const exact = 'C’est exact';
    const inexact = 'C’est faux';
    return qcm(rng, {
      prompt: `Un élève écrit : « ${e.texte} » Que lui répondre ?`,
      bon: e.juste ? exact : inexact,
      faux: [
        [e.juste ? inexact : exact, e.pourquoi],
        [
          'On ne peut rien dire : les cellules ne s’observent pas',
          `Les cellules s’observent au microscope. ${e.pourquoi}`,
        ],
      ],
      hint: 'Méfie-toi des mots « seuls » et « forcément », et vérifie la place de chaque partie.',
      pourquoi: [e.pourquoi],
    });
  }
  if (t === 2)
    return ecrit({
      prompt: 'Chez un végétal, comment nomme-t-on un ensemble de cellules semblables qui ont la même fonction ?',
      accepte: formes('tissu', 'un', 'le'),
      faux: [
        ['organe', 'Un organe réunit plusieurs tissus.'],
        ['cellule', 'La cellule est l’unité : on cherche le nom de l’ensemble.'],
        ['noyau', 'Le noyau est une partie d’une cellule.'],
      ],
      hint: 'C’est le niveau d’organisation entre la cellule et l’organe.',
      pourquoi: ['Des cellules semblables, de même fonction, forment un ensemble.'],
    });
  return ecrit({
    prompt: 'Les êtres vivants sont très divers. Quelle unité de structure ont-ils pourtant tous en commun ?',
    accepte: formes('cellule', 'la', 'une'),
    faux: [
      ['noyau', 'Le noyau n’est observé que dans « presque » toutes les cellules : l’unité commune est la cellule.'],
      ['organe', 'Les êtres d’une seule cellule n’ont pas d’organes.'],
      ['squelette', 'Beaucoup d’êtres vivants n’ont pas de squelette.'],
    ],
    hint: 'On l’observe au microscope chez les animaux comme chez les végétaux.',
    pourquoi: [UNITE],
  });
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const lettres = rng.shuffle(['A', 'B', 'C', 'D', 'E', 'F']);
  const uni = rng.int(2, 4);
  const fiches = lettres.slice(0, 6).map((l, i) => ({
    l,
    nb: i < uni ? 1 : rng.pick([200, 450, 800, 1200]),
  }));
  const rangees = [...fiches].sort((a, b) => a.l.localeCompare(b.l));
  const figure = document(
    'Relevés au microscope (organismes entiers, données de l’exercice)',
    rangees.map((f) =>
      f.nb === 1
        ? `Organisme ${f.l} : 1 cellule observée, qui constitue tout l’organisme.`
        : `Organisme ${f.l} : ${f.nb} cellules comptées dans un petit fragment de l’organisme.`,
    ),
  );
  const code = rangees.map((f) => `${f.l} ${f.nb}`).join(', ');
  const t = rng.int(0, 2);
  if (t === 0)
    return compter({
      prompt: `Lis les relevés (${code}). Combien d’organismes sont unicellulaires ?`,
      figure,
      valeur: uni,
      faux: [
        [6, 'Tous sont faits de cellules, mais tous ne sont pas faits d’une seule.'],
        [
          6 - uni === uni ? uni + 1 : 6 - uni,
          'Vérifie chaque ligne : seules celles qui indiquent « 1 cellule » comptent.',
        ],
      ],
      hint: 'Cherche les organismes constitués d’une seule cellule.',
      pourquoi: [UNI, `On compte les lignes « 1 cellule » : il y en a ${uni}.`],
    });
  if (t === 1) {
    const bon = 'Les six organismes sont formés de cellules';
    return qcm(rng, {
      prompt: `Lis les relevés (${code}). Quelle conclusion les six observations permettent-elles ?`,
      figure,
      bon,
      faux: [
        ['Tous les organismes observés ont le même nombre de cellules', 'Les nombres relevés sont différents.'],
        [
          'Les organismes à une seule cellule ne sont pas vivants',
          'Une seule cellule suffit pour former un être vivant.',
        ],
        [
          'Seuls les plus grands relevés concernent des cellules',
          'Un relevé d’une cellule concerne aussi une cellule.',
        ],
      ],
      hint: 'Qu’observe-t-on sur toutes les lignes sans exception ?',
      pourquoi: ['Chaque ligne mentionne au moins une cellule.', UNITE],
    });
  }
  const cible = rng.pick(fiches);
  const bon = cible.nb === 1 ? 'unicellulaire' : 'pluricellulaire';
  return ecrit({
    prompt: `Lis les relevés (${code}). Quel adjectif qualifie l’organisme ${cible.l} ?`,
    figure,
    accepte:
      cible.nb === 1
        ? ['unicellulaire', 'uni-cellulaire', 'monocellulaire']
        : ['pluricellulaire', 'multicellulaire', 'pluri-cellulaire'],
    faux: [[cible.nb === 1 ? 'pluricellulaire' : 'unicellulaire', UNI]],
    hint: 'Relis la ligne de cet organisme : une seule cellule, ou plusieurs ?',
    pourquoi: [UNI, `L’organisme ${cible.l} est ${bon}.`],
  });
};

export const cellule = notion({
  id: 'v6-cellule',
  title: 'La cellule',
  memo: [
    'La **cellule** est l’unité commune à tous les êtres vivants. On l’observe au **microscope**. On y repère la **membrane** (la limite), le **cytoplasme** et, presque toujours, le **noyau**.',
    'Un être **unicellulaire** est fait d’une seule cellule (paramécie, levure, bactérie). Un être **pluricellulaire** en a plusieurs (l’être humain) ; chez un végétal, des cellules semblables forment un **tissu**.',
  ],
  faits: [
    'observations',
    'unite',
    'cellule',
    'microscope',
    'membrane',
    'cytoplasme',
    'noyau',
    'unicellulaire',
    'paramecie',
    'pluricellulaire',
    'levure',
    'bacterie',
    'tissu',
  ],
  niveaux: [niveau1, niveau2, niveau3, niveau4, niveau5],
});
