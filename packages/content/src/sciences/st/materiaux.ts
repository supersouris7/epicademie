import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { AnswerSpec, QuestionDraft, Skill, Trap } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Propriétés des matériaux : origine et passage de la lumière (programme du cycle 3, cours moyen) ———

interface Materiau {
  readonly nom: string;
  readonly origine: string;
  readonly naturel: boolean;
}

/** Origines reprises des définitions citées dans `donnees.ts`. */
const MATERIAUX: readonly Materiau[] = [
  { nom: 'le bois d’un arbre', origine: 'c’est la matière du tronc et des branches d’un arbre', naturel: true },
  { nom: 'le sable de la plage', origine: 'ce sont de petits fragments venus de roches', naturel: true },
  { nom: 'l’argile du sol', origine: 'c’est une terre glaise', naturel: true },
  { nom: 'le coton sur la plante', origine: 'c’est le duvet qui entoure les graines du cotonnier', naturel: true },
  { nom: 'la laine sur le mouton', origine: 'ce sont les poils doux de certains mammifères', naturel: true },
  { nom: 'la pierre dans le sol', origine: 'c’est une matière minérale qu’on rencontre dans le sol', naturel: true },
  {
    nom: 'le verre d’une bouteille',
    origine: 'on l’obtient en faisant fondre du sable avec un autre produit',
    naturel: false,
  },
  { nom: 'la brique d’un mur', origine: 'c’est de l’argile moulée, séchée puis cuite au four', naturel: false },
  { nom: 'l’acier d’une clé', origine: 'on le fabrique avec un alliage de fer et de carbone', naturel: false },
  {
    nom: 'le papier d’un cahier',
    origine: 'on le fait avec des fibres réduites en pâte, étalée puis séchée',
    naturel: false,
  },
  { nom: 'le nylon d’un fil', origine: 'c’est une matière synthétique, fabriquée', naturel: false },
];

const NATUREL = 'directement disponible dans la nature';
const TRANSFORME = 'fabriqué ou transformé par l’être humain';
const categorie = (m: Materiau) => (m.naturel ? NATUREL : TRANSFORME);
const pourquoiMateriau = (m: Materiau) => `${maj(m.nom)} : ${m.origine}. Ce matériau est ${categorie(m)}.`;

type Optique = 'transparent' | 'translucide' | 'opaque';
const OPTIQUES: readonly Optique[] = ['transparent', 'translucide', 'opaque'];

const OBSERVE: Record<Optique, string> = {
  transparent: 'La lumière passe et tu vois nettement à travers.',
  translucide: 'La lumière passe, mais tu ne distingues pas nettement ce qui est derrière.',
  opaque: 'La lumière ne passe pas, donc tu ne vois rien à travers.',
};

const OBJETS: Record<Optique, readonly string[]> = {
  transparent: [
    'une vitre lisse et bien propre',
    'de l’eau claire dans un bocal',
    'une bouteille en verre lisse et vide',
  ],
  translucide: ['un carreau en verre dépoli', 'une feuille de papier huilé', 'une tasse en porcelaine très fine'],
  opaque: ['une planche de bois', 'un mur de briques', 'une plaque d’acier', 'un gros caillou'],
};

const ACCEPTE: Record<Optique, readonly string[]> = {
  transparent: ['transparent', 'transparente'],
  translucide: ['translucide'],
  opaque: ['opaque'],
};

const pourquoiOptique = (choisi: Optique, vrai: Optique) =>
  `« ${maj(choisi)} » veut dire : ${OBSERVE[choisi].toLowerCase()} Ici : ${OBSERVE[vrai].toLowerCase()}`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const naturel = rng.int(0, 1) === 0;
  const bon = rng.pick(MATERIAUX.filter((m) => m.naturel === naturel));
  const autres = rng.shuffle(MATERIAUX.filter((m) => m.naturel !== naturel)).slice(0, 2);
  const { answer, traps } = choice(
    rng,
    bon.nom,
    autres.map((m) => ({ label: m.nom, why: pourquoiMateriau(m) })),
  );
  return {
    prompt: `Quel matériau est ${naturel ? NATUREL : TRANSFORME} ?`,
    answer,
    traps,
    hint: 'Demande-toi : peut-on le trouver tel quel dans la nature, ou faut-il le fabriquer ?',
    steps: ['On cherche d’où vient chaque matériau.', pourquoiMateriau(bon), `La bonne réponse est **${bon.nom}**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const objets = OPTIQUES.map((o) => ({ o, nom: rng.pick(OBJETS[o]) }));
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Associe chaque objet au bon mot : ${objets.map((x) => x.nom).join(' ; ')}.`,
      answer: association(
        rng,
        objets.map((x) => [x.nom, x.o] as const),
      ),
      hint: 'Pour chaque objet : la lumière passe-t-elle ? Voit-on nettement à travers ?',
      steps: [
        'On teste deux choses : la lumière passe-t-elle, puis voit-on nettement ?',
        `Transparent : on voit nettement. Translucide : la lumière passe, mais c’est flou. Opaque : rien ne passe.`,
        `Réponse : **${objets.map((x) => `${x.nom} → ${x.o}`).join(' ; ')}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const cible = rng.pick(OPTIQUES);
  const bon = rng.pick(OBJETS[cible]);
  const autres = rng.shuffle(OPTIQUES.filter((o) => o !== cible).flatMap((o) => OBJETS[o].map((nom) => ({ o, nom }))));
  // Une proposition par catégorie fausse, puis une troisième au hasard.
  const un = OPTIQUES.filter((o) => o !== cible).flatMap((o) => autres.filter((x) => x.o === o).slice(0, 1));
  const trois = [...un, ...autres.filter((x) => !un.includes(x)).slice(0, 1)];
  const { answer, traps } = choice(
    rng,
    bon,
    trois.map((x) => ({ label: x.nom, why: `${maj(x.nom)} : objet ${x.o}. ${OBSERVE[x.o]}` })),
  );
  return {
    prompt: `Quel objet est ${cible} ?`,
    answer,
    traps,
    hint: 'Imagine une lampe derrière chaque objet. Que vois-tu devant ?',
    steps: [
      `Avec un objet ${cible} : ${OBSERVE[cible].toLowerCase()}`,
      'On compare chaque objet avec cette idée.',
      `La bonne réponse est **${bon}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const vrai = rng.pick(OPTIQUES);
    const objet = rng.pick(OBJETS[vrai]);
    const { answer, traps } = saisie(
      ACCEPTE[vrai],
      OPTIQUES.filter((o) => o !== vrai).map((o) => [o, pourquoiOptique(o, vrai)] as const),
    );
    return {
      prompt: `Tu observes ${objet}. ${OBSERVE[vrai]} Écris le mot : transparent, translucide ou opaque.`,
      answer,
      traps,
      hint: 'Un seul mot dit à la fois si la lumière passe et si l’on voit nettement.',
      steps: ['On regarde si la lumière passe, puis si l’image est nette.', OBSERVE[vrai], `L’objet est **${vrai}**.`],
      targetSeconds: 30,
    };
  }
  const a = rng.pick(MATERIAUX.filter((m) => m.naturel));
  const b = rng.pick(MATERIAUX.filter((m) => !m.naturel));
  const [x, y] = rng.int(0, 1) === 0 ? [a, b] : [b, a];
  const options = [NATUREL, TRANSFORME];
  return {
    prompt: `Complète : ${x.nom}, puis ${y.nom}.`,
    answer: {
      kind: 'cloze',
      parts: [`${maj(x.nom)} : ce matériau est `, `. ${maj(y.nom)} : ce matériau est `, '.'],
      blanks: [x, y].map((m) => ({ mode: 'list' as const, options, correct: m.naturel ? 0 : 1 })),
    },
    hint: 'Pour chacun, demande-toi si quelqu’un a dû le fabriquer.',
    steps: [pourquoiMateriau(x), pourquoiMateriau(y), `Réponse : **${categorie(x)}**, puis **${categorie(y)}**.`],
    targetSeconds: 40,
  };
};

const FABRICATIONS: readonly (readonly [string, string])[] = [
  ['le verre', 'du sable fondu avec un autre produit'],
  ['la brique', 'de l’argile moulée, séchée puis cuite au four'],
  ['l’acier', 'un alliage de fer et de carbone'],
  ['le papier', 'des fibres réduites en pâte, étalée puis séchée'],
  ['le nylon', 'une matière synthétique'],
];

const NATURES: readonly (readonly [string, string])[] = [
  ['le bois', 'la matière du tronc et des branches d’un arbre'],
  ['le sable', 'de petits fragments venus de roches'],
  ['le coton', 'le duvet autour des graines d’une plante'],
  ['la laine', 'les poils doux de certains mammifères'],
  ['l’argile', 'une terre glaise'],
];

/** Pièges d'origine : une matière naturelle peut devenir un matériau transformé. */
const ORIGINES: readonly { scene: string; naturel: boolean; why: string }[] = [
  {
    scene: 'La brique vient de l’argile du sol, qu’on a moulée puis cuite au four.',
    naturel: false,
    why: 'L’argile est naturelle, mais la brique a été moulée et cuite : elle est transformée.',
  },
  {
    scene: 'Le verre est obtenu en faisant fondre du sable avec un autre produit.',
    naturel: false,
    why: 'Le sable est naturel, mais le verre a été fabriqué en le faisant fondre.',
  },
  {
    scene: 'Le papier est fait avec des fibres réduites en pâte, étalée puis séchée.',
    naturel: false,
    why: 'Les fibres peuvent venir de plantes, mais le papier a été fabriqué.',
  },
  {
    scene: 'On ramasse un galet au bord de la rivière et on ne le change pas.',
    naturel: true,
    why: 'Le galet est pris tel quel dans la nature : personne ne l’a transformé.',
  },
  {
    scene: 'On prend une poignée de sable sur la plage, sans rien lui faire.',
    naturel: true,
    why: 'Le sable est pris tel quel dans la nature : il n’est pas transformé.',
  },
];

const MOT_NATUREL = ['naturel', 'naturelle'];
const MOT_TRANSFORME = ['transformé', 'transformée', 'transforme', 'transformee'];

const niveau4 = (rng: Rng): QuestionDraft => {
  const choix = rng.int(0, 2);
  if (choix < 2) {
    const naturel = choix === 0;
    const paires = naturel ? NATURES : FABRICATIONS;
    return {
      prompt: naturel
        ? 'Associe chaque matière naturelle à ce qu’elle est.'
        : 'Associe chaque matériau fabriqué à ce qui le compose ou à la façon de l’obtenir.',
      answer: association(rng, paires),
      hint: 'Commence par ceux dont tu es sûr, puis termine par élimination.',
      steps: [
        naturel ? 'Chacune de ces matières existe dans la nature.' : 'Chacun de ces matériaux a été fabriqué.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const cas = rng.pick(ORIGINES);
  const { answer, traps } = saisie(cas.naturel ? MOT_NATUREL : MOT_TRANSFORME, [
    [cas.naturel ? 'transformé' : 'naturel', cas.why],
    [cas.naturel ? 'fabriqué' : 'brut', cas.why],
  ]);
  return {
    prompt: `${cas.scene} Ce matériau est-il naturel ou transformé ? Écris un seul de ces deux mots.`,
    answer,
    traps,
    hint: 'Regarde ce que l’être humain a fait à la matière.',
    steps: [
      'On se demande si quelqu’un a changé la matière.',
      cas.why,
      `Réponse : **${cas.naturel ? 'naturel' : 'transformé'}**.`,
    ],
    targetSeconds: 40,
  };
};

interface Echantillon {
  readonly nom: string;
  readonly origine: 'naturel' | 'transformé';
  readonly optique: Optique;
}

/** Un échantillon par case de tri : chaque case n'en reçoit qu'un. */
const CASES: readonly (readonly Echantillon[])[] = [
  [
    { nom: 'un galet de rivière', origine: 'naturel', optique: 'opaque' },
    { nom: 'un morceau de tronc d’arbre', origine: 'naturel', optique: 'opaque' },
  ],
  [
    { nom: 'une brique', origine: 'transformé', optique: 'opaque' },
    { nom: 'une plaque d’acier', origine: 'transformé', optique: 'opaque' },
  ],
  [{ nom: 'une vitre en verre lisse', origine: 'transformé', optique: 'transparent' }],
  [{ nom: 'un carreau en verre dépoli', origine: 'transformé', optique: 'translucide' }],
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const lot = rng.shuffle(CASES.map((c) => rng.pick(c)));
  const cible = rng.pick(lot);
  const lettres = ['A', 'B', 'C', 'D'];
  const label = (i: number) => `Échantillon ${lettres[i]}`;
  const rang = lot.indexOf(cible);
  const bon = label(rang);
  // Propositions rangées A, B, C, D : la position de la bonne réponse suit le tirage des échantillons.
  const answer: AnswerSpec = { kind: 'choice', options: lot.map((_, i) => label(i)), correct: rang };
  const traps: Trap[] = lot.flatMap((e, i) =>
    i === rang
      ? []
      : [
          {
            option: i,
            why: `L’échantillon ${lettres[i]} est ${e.nom} : matériau ${e.origine} et ${e.optique}. Il ne va pas dans ce bac.`,
          },
        ],
  );
  return {
    prompt: `Mission tri ! Quel échantillon va dans le bac « matériau ${cible.origine} et ${cible.optique} » ?`,
    figure: {
      kind: 'document',
      title: 'Les quatre échantillons',
      lines: lot.map((e, i) => `${label(i)} : ${e.nom}.`),
    },
    answer,
    traps,
    hint: 'Il faut vérifier les deux propriétés. Élimine d’abord sur la première, puis sur la seconde.',
    steps: [
      `On cherche un matériau ${cible.origine}, puis on vérifie qu’il est ${cible.optique}.`,
      `${maj(cible.nom)} : matériau ${cible.origine} et ${cible.optique}. ${OBSERVE[cible.optique]}`,
      `La bonne réponse est **${bon}**.`,
    ],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

const SOURCES = [
  PROGRAMME,
  'cnrtl-bois',
  'cnrtl-sable',
  'cnrtl-argile',
  'cnrtl-coton',
  'cnrtl-laine',
  'cnrtl-pierre',
  'cnrtl-verre',
  'cnrtl-brique',
  'cnrtl-acier',
  'cnrtl-papier',
  'cnrtl-nylon',
  'cnrtl-transparent',
  'cnrtl-opaque',
  'cnrtl-translucide',
];

export const materiaux: Skill = {
  id: 'pcm2-materiaux',
  title: 'Les propriétés des matériaux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **matériau** peut être pris dans la nature (le bois, le sable) ou fabriqué et **transformé** par l’être humain (le verre, la brique).',
      'Face à la lumière, il est **transparent** (on voit nettement), **translucide** (la lumière passe, mais c’est flou) ou **opaque** (rien ne passe). Pratique pour trier !',
    ],
    source: `${PROGRAMME} : « Distinguer les matériaux fabriqués ou transformés par l’être humain des matériaux directement disponibles dans la nature » ; « Observer et classer des objets selon qu’ils sont transparents, opaques à la lumière ou translucides » ; « Utiliser les propriétés physiques des matériaux pour les classer, notamment à des fins de tri ».`,
    sources: SOURCES,
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
