import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { maj } from './outils.ts';
import { compter, document, ecrit, formes, liste, notion, paires, qcm, ranger, type Faux } from './vivant-kit.ts';

// ——— Classer le vivant : types de classification, groupes emboîtés, arbres de parenté (6e) ———

const PARTAGE = 'La classification de parenté réunit les êtres vivants selon les attributs qu’ils possèdent en commun.';
const EMBOITE = 'Les groupes sont emboîtés : un grand groupe en contient de plus petits.';
const PROCHE = 'Plus la plus petite boîte commune à deux espèces est petite, plus elles sont apparentées.';

type Type = 'utilitaire' | 'écologique' | 'phylogénétique';
const TYPES: Record<Type, string> = {
  utilitaire: 'l’usage qu’en fait l’être humain',
  écologique: 'le milieu de vie et la façon d’y vivre',
  phylogénétique: 'les liens de parenté',
};
const NOMS = Object.keys(TYPES) as Type[];

const EXEMPLES: readonly { texte: string; type: Type }[] = [
  { texte: 'ranger des champignons en « comestibles » et « toxiques »', type: 'utilitaire' },
  { texte: 'ranger des plantes selon qu’on les mange, qu’on s’en habille ou qu’elles soignent', type: 'utilitaire' },
  { texte: 'ranger des arbres selon l’usage que l’on fait de leur bois', type: 'utilitaire' },
  { texte: 'ranger des animaux en « habitants de la mare » et « habitants de la forêt »', type: 'écologique' },
  { texte: 'ranger les êtres d’un étang selon qu’ils vivent au fond, en pleine eau ou en surface', type: 'écologique' },
  { texte: 'ranger des plantes selon qu’elles poussent au soleil ou à l’ombre', type: 'écologique' },
  { texte: 'réunir des espèces selon les attributs hérités d’un ancêtre commun', type: 'phylogénétique' },
  {
    texte: 'construire des groupes emboîtés pour montrer qui est le plus proche parent de qui',
    type: 'phylogénétique',
  },
  { texte: 'dessiner un arbre qui montre les parentés entre des espèces', type: 'phylogénétique' },
];

const autres = (t: Type): Faux[] =>
  NOMS.filter((x) => x !== t).map((x) => [x, `Une classification ${x} repose sur ${TYPES[x]}.`]);

const niveau1 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(EXEMPLES);
  return qcm(rng, {
    prompt: `Un élève choisit de ${e.texte}. De quel type de classification s’agit-il ?`,
    bon: e.type,
    faux: autres(e.type),
    hint: 'Quel critère a été choisi : l’usage, le milieu ou la parenté ?',
    pourquoi: [`Critère retenu ici : ${TYPES[e.type]}.`],
  });
};

const CHAINES: readonly (readonly string[])[] = [
  ['vertébrés', 'mammifères', 'primates', 'hominidés'],
  ['arthropodes', 'arachnides', 'araignées'],
  ['vertébrés', 'mammifères', 'primates'],
  ['arthropodes', 'insectes', 'abeilles'],
  ['vertébrés', 'oiseaux', 'pigeons'],
  ['vertébrés', 'mammifères', 'chats'],
];

const ATTRIBUTS: readonly (readonly [string, string])[] = [
  ['les vertébrés', 'des vertèbres'],
  ['les mammifères', 'des mamelles'],
  ['les oiseaux', 'des plumes'],
  ['les insectes', 'trois paires de pattes'],
  ['les arachnides', 'huit pattes'],
  ['les arthropodes', 'un squelette externe articulé'],
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) return paires(rng, ATTRIBUTS, 3, 'Associe chaque groupe à un attribut de ses membres');
  const t = rng.pick(NOMS);
  return qcm(rng, {
    prompt: `Quel est le but d’une classification ${t} ?`,
    bon: `ranger les êtres vivants selon ${TYPES[t]}`,
    faux: [
      ...NOMS.filter((x) => x !== t).map((x): Faux => [
        `ranger les êtres vivants selon ${TYPES[x]}`,
        `C’est le but d’une classification ${x}.`,
      ]),
      ['ranger les êtres vivants selon l’ordre alphabétique de leur nom', 'Un nom ne dit rien de l’être vivant.'],
    ],
    hint: 'Le nom du type indique son critère.',
    pourquoi: ['Chaque classification répond à un objectif.', `La classification ${t} s’appuie sur ${TYPES[t]}.`],
  });
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const c = rng.pick(CHAINES);
    return ranger(rng, {
      prompt: `Range ces groupes emboîtés, du plus grand au plus petit : ${liste(c)}.`,
      enOrdre: c,
      hint: 'Le plus grand groupe contient tous les autres.',
      pourquoi: [EMBOITE],
    });
  }
  if (t === 1) {
    const [groupe, attribut] = rng.pick(ATTRIBUTS.filter((a) => a[0] !== 'les arthropodes'));
    const nom = groupe.replace('les ', '');
    return ecrit({
      prompt: `Un animal possède ${attribut}. Écris le nom du groupe le plus précis que définit cet attribut.`,
      accepte: formes(nom, 'les').concat(formes(nom.replace(/s$/, ''), 'un')),
      faux: ATTRIBUTS.filter((a) => a[0] !== groupe).map(([g, a]): Faux => [
        g.replace('les ', ''),
        `Ce groupe se définit par un autre attribut (${a}) : ce n’est pas le groupe demandé.`,
      ]),
      hint: 'Retrouve le groupe défini par cet attribut.',
      pourquoi: [PARTAGE],
    });
  }
  const type = rng.pick(NOMS);
  const e = rng.pick(EXEMPLES.filter((x) => x.type === type));
  return ecrit({
    prompt: `On décide de ${e.texte}. Écris l’adjectif qui nomme ce type de classification : utilitaire, écologique ou phylogénétique.`,
    accepte: formes(type),
    faux: autres(type),
    hint: 'Quel critère a servi à ranger ?',
    pourquoi: [`Critère retenu ici : ${TYPES[type]}.`],
  });
};

const PIEGES: readonly { q: string; bon: string; faux: readonly Faux[]; pourquoi: string }[] = [
  {
    q: 'Pourquoi le groupe « les animaux sans vertèbres » n’a-t-il pas de sens dans une classification de parenté ?',
    bon: 'parce que l’on ne réunit que selon des attributs présents',
    faux: [
      ['parce que ces animaux ne sont pas des êtres vivants', 'Ils sont bien vivants.'],
      ['parce que ces animaux sont trop petits', 'La taille n’est pas le problème.'],
      ['parce que ces animaux n’ont aucun attribut', 'Ils ont des attributs : il faut les utiliser.'],
    ],
    pourquoi: 'Dans une classification, seules les présences d’attributs ont du sens.',
  },
  {
    q: 'La chauve-souris vole comme le pigeon, mais elle a des mamelles comme le chat. De qui est-elle la plus proche parente ?',
    bon: 'du chat, car elle partage avec lui les mamelles',
    faux: [
      ['du pigeon, car tous deux volent', 'Une ressemblance de mode de vie peut tromper : on regarde les attributs.'],
      [
        'des deux à égalité',
        'Le chat et la chauve-souris sont réunis dans une boîte plus petite, celle des mammifères.',
      ],
      [
        'd’aucun des deux, car les êtres vivants n’ont pas de parenté',
        'Tous les êtres vivants ont un lien de parenté.',
      ],
    ],
    pourquoi: 'La chauve-souris et le chat sont des mammifères.',
  },
  {
    q: 'L’araignée est-elle un insecte ?',
    bon: 'non : elle a huit pattes et se range parmi les arachnides',
    faux: [
      ['oui : tous les petits animaux à pattes sont des insectes', 'La taille ne définit pas un groupe.'],
      ['oui : elle a trois paires de pattes', 'L’araignée a huit pattes locomotrices.'],
      ['non : elle n’appartient pas aux arthropodes', 'Les araignées font partie des arthropodes.'],
    ],
    pourquoi: 'Les insectes ont trois paires de pattes ; les araignées ne sont pas des insectes.',
  },
  {
    q: 'Une clé de détermination et une classification servent-elles à la même chose ?',
    bon: 'non : la clé sert à identifier, la classification à regrouper selon la parenté',
    faux: [
      [
        'oui : les deux servent seulement à trouver un nom',
        'Une classification regroupe, elle ne sert pas à nommer un individu.',
      ],
      ['non : la clé montre la parenté, la classification donne un nom', 'Les deux rôles sont inversés.'],
      ['oui : les deux rangent les êtres vivants selon leur usage', 'L’usage concerne la classification utilitaire.'],
    ],
    pourquoi: 'Identifier un être vivant et le classer sont deux activités différentes.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) return paires(rng, ATTRIBUTS, 5, 'Sans aide, relie les cinq groupes à leur attribut');
  if (t === 1) {
    const p = rng.pick(PIEGES);
    return qcm(rng, {
      prompt: p.q,
      bon: p.bon,
      faux: p.faux,
      hint: 'Raisonne sur les attributs présents, pas sur l’apparence ni le mode de vie.',
      pourquoi: [p.pourquoi],
    });
  }
  return ecrit({
    prompt: 'Quel type de classification cherche à montrer les liens de parenté entre les êtres vivants ?',
    accepte: formes('phylogénétique').concat(['classification phylogénétique', 'phylogénique']),
    faux: [
      ['utilitaire', 'La classification utilitaire repose sur l’usage.'],
      ['écologique', 'La classification écologique repose sur le milieu de vie.'],
    ],
    hint: 'Cet adjectif s’oppose à « utilitaire » et à « écologique ».',
    pourquoi: ['Un arbre de parenté traduit ce type de classification.'],
  });
};

interface Espece {
  readonly nom: string;
  readonly a: readonly string[];
}
const V = 'vertèbres';
const M = 'mamelles';
const E = 'squelette externe articulé';
/** Deux espèces proches (même petit groupe) et une troisième plus éloignée. */
const TRIOS: readonly { proches: readonly [Espece, Espece]; autre: Espece; commun: string; large: string }[] = [
  {
    proches: [
      { nom: 'le chat', a: [V, M] },
      { nom: 'la chauve-souris', a: [V, M] },
    ],
    autre: { nom: 'la truite', a: [V] },
    commun: M,
    large: V,
  },
  {
    proches: [
      { nom: 'le hérisson', a: [V, M] },
      { nom: 'la baleine', a: [V, M] },
    ],
    autre: { nom: 'le pigeon', a: [V, 'plumes'] },
    commun: M,
    large: V,
  },
  {
    proches: [
      { nom: 'l’abeille', a: [E, 'six pattes'] },
      { nom: 'la coccinelle', a: [E, 'six pattes'] },
    ],
    autre: { nom: 'l’araignée', a: [E, 'huit pattes'] },
    commun: 'six pattes',
    large: E,
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const trio = rng.pick(TRIOS);
  const [x, y] = rng.shuffle(trio.proches) as [Espece, Espece];
  const especes = rng.shuffle([x, y, trio.autre]);
  const figure = document(
    'Tableau des attributs (extrait choisi pour l’exercice)',
    especes.map((s) => `${maj(s.nom)} : ${s.a.join(', ')}.`),
  );
  const noms = liste(especes.map((s) => s.nom));
  const t = rng.int(0, 3);
  if (t === 0)
    return qcm(rng, {
      prompt: `Lis le tableau (${noms}). Quelle espèce est la plus proche parente de ${x.nom}, parmi les deux autres ?`,
      figure,
      bon: y.nom,
      faux: [
        [trio.autre.nom, `${maj(trio.autre.nom)} ne partage pas l’attribut « ${trio.commun} » avec ${x.nom}.`],
        ['les deux autres à égalité', PROCHE],
      ],
      hint: 'Compte les attributs partagés et repère la plus petite boîte commune.',
      pourquoi: [`${maj(x.nom)} et ${y.nom} partagent « ${trio.commun} ».`, PROCHE],
    });
  if (t === 1)
    return compter({
      prompt: `Lis le tableau (${noms}). Combien de ces espèces entrent dans la plus petite boîte, celle que définit l’attribut « ${trio.commun} » ?`,
      figure,
      valeur: 2,
      faux: [
        [3, `Les trois lignes partagent « ${trio.large} », mais pas « ${trio.commun} ».`],
        [1, 'Relis chaque ligne : l’attribut revient plus d’une fois.'],
      ],
      hint: 'Cherche cet attribut ligne par ligne.',
      pourquoi: [EMBOITE, `Seuls ${x.nom} et ${y.nom} portent « ${trio.commun} ».`],
    });
  if (t === 2)
    return qcm(rng, {
      prompt: `Lis le tableau (${noms}). Quel arbre de parenté, écrit avec des parenthèses, convient ? (les parenthèses réunissent les plus proches parents)`,
      figure,
      bon: `((${x.nom}, ${y.nom}), ${trio.autre.nom})`,
      faux: [
        [`((${x.nom}, ${trio.autre.nom}), ${y.nom})`, `${maj(x.nom)} partage plus d’attributs avec ${y.nom}.`],
        [`((${y.nom}, ${trio.autre.nom}), ${x.nom})`, `${maj(y.nom)} partage plus d’attributs avec ${x.nom}.`],
      ],
      hint: 'La parenthèse intérieure réunit les deux espèces de la plus petite boîte.',
      pourquoi: [`L’attribut « ${trio.commun} » réunit ${x.nom} et ${y.nom}.`, PROCHE],
    });
  return ecrit({
    prompt: `Lis le tableau (${noms}). Écris l’attribut qui réunit ${x.nom} et ${y.nom} dans une boîte plus petite.`,
    figure,
    accepte: [...formes(trio.commun, 'les', 'des'), ...(trio.commun === 'six pattes' ? ['6 pattes'] : [])],
    faux: [[trio.large, `L’attribut « ${trio.large} » est partagé par les trois : il forme la grande boîte.`]],
    hint: 'Cherche l’attribut que deux lignes seulement ont en commun.',
    pourquoi: [EMBOITE, `Seuls ${x.nom} et ${y.nom} portent « ${trio.commun} ».`],
  });
};

export const classification = notion({
  id: 'v6-classification',
  title: 'Classer le vivant : groupes emboîtés et parentés',
  memo: [
    'On classe selon un objectif : classification **utilitaire** (l’usage), **écologique** (le milieu de vie) ou **phylogénétique** (la parenté).',
    'La classification de **parenté** regroupe selon les attributs présents, en **groupes emboîtés** : les mammifères sont dans les **vertébrés**. Un **arbre de parenté** montre que deux espèces réunies dans la plus petite boîte sont les plus proches.',
  ],
  faits: [
    'types-classification',
    'arbres',
    'utilitaire',
    'caracteres-communs',
    'presence',
    'invertebres',
    'cle',
    'vertebres-mamelles',
    'plume',
    'insecte-pattes',
    'araignee-pattes',
    'araignee-pas-insecte',
    'araignee-arachnide',
    'arthropode-exosquelette',
    'emboitement',
    'boite-parente',
    'primate-mammiferes',
    'hominides',
    'arbre-role',
    'attribut-ancetre',
    'ressemblance',
    'tous-parents',
  ],
  niveaux: [niveau1, niveau2, niveau3, niveau4, niveau5],
});
