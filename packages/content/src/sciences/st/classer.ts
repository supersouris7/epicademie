import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Classer les êtres vivants : groupes selon les attributs, groupes emboîtés (programme du cycle 3) ———

type Groupe = 'mammifere' | 'oiseau' | 'poisson' | 'batracien' | 'insecte' | 'arachnide' | 'mollusque';

const GROUPES: Record<Groupe, { nom: string; accepte: readonly string[]; attribut: string }> = {
  mammifere: {
    nom: 'les mammifères',
    accepte: ['mammifère', 'mammifères', 'les mammifères', 'un mammifère', 'mammifere', 'mammiferes'],
    attribut: 'des mamelles',
  },
  oiseau: {
    nom: 'les oiseaux',
    accepte: ['oiseau', 'oiseaux', 'les oiseaux', 'un oiseau'],
    attribut: 'des plumes',
  },
  poisson: {
    nom: 'les poissons',
    accepte: ['poisson', 'poissons', 'les poissons', 'un poisson'],
    attribut: 'des nageoires et des vertèbres',
  },
  batracien: {
    nom: 'les batraciens',
    accepte: ['batracien', 'batraciens', 'les batraciens', 'un batracien', 'amphibien', 'amphibiens', 'un amphibien'],
    attribut: 'une peau nue et humide, et des têtards comme petits',
  },
  insecte: {
    nom: 'les insectes',
    accepte: ['insecte', 'insectes', 'les insectes', 'un insecte'],
    attribut: 'six pattes (trois paires)',
  },
  arachnide: {
    nom: 'les arachnides',
    accepte: ['arachnide', 'arachnides', 'les arachnides', 'un arachnide'],
    attribut: 'huit pattes, sans antennes',
  },
  mollusque: {
    nom: 'les mollusques',
    accepte: ['mollusque', 'mollusques', 'les mollusques', 'un mollusque'],
    attribut: 'un corps mou, sans squelette à l’intérieur',
  },
};
const CLES = Object.keys(GROUPES) as Groupe[];

interface Animal {
  readonly nom: string;
  readonly groupe: Groupe;
  readonly fiche: string;
  /** Groupe que l’on pourrait croire à tort (habitat, façon de se déplacer). */
  readonly leurre?: Groupe;
}

const ANIMAUX: readonly Animal[] = [
  { nom: 'le chat', groupe: 'mammifere', fiche: 'Il allaite ses petits avec des mamelles.' },
  {
    nom: 'la chauve-souris',
    groupe: 'mammifere',
    fiche: 'Elle vole, et elle allaite ses petits avec des mamelles.',
    leurre: 'oiseau',
  },
  {
    nom: 'la baleine',
    groupe: 'mammifere',
    fiche: 'Elle vit dans la mer, et elle allaite ses petits avec des mamelles.',
    leurre: 'poisson',
  },
  { nom: 'le pigeon', groupe: 'oiseau', fiche: 'Il a un bec et le corps couvert de plumes.' },
  {
    nom: 'le manchot',
    groupe: 'oiseau',
    fiche: 'Il nage très bien, ne vole pas, et son corps est couvert de plumes.',
    leurre: 'poisson',
  },
  { nom: 'la truite', groupe: 'poisson', fiche: 'Elle a des vertèbres, des nageoires et des écailles.' },
  { nom: 'la grenouille', groupe: 'batracien', fiche: 'Elle a la peau nue et humide. Son petit est un têtard.' },
  { nom: 'la mouche', groupe: 'insecte', fiche: 'Elle a six pattes.', leurre: 'oiseau' },
  { nom: 'la coccinelle', groupe: 'insecte', fiche: 'Elle a six pattes.', leurre: 'mollusque' },
  { nom: 'l’abeille', groupe: 'insecte', fiche: 'Elle a six pattes et des ailes.', leurre: 'oiseau' },
  { nom: 'l’araignée', groupe: 'arachnide', fiche: 'Elle a huit pattes et pas d’antennes.', leurre: 'insecte' },
  { nom: 'l’escargot', groupe: 'mollusque', fiche: 'Il a un corps mou et une coquille.', leurre: 'insecte' },
];

const pourquoi = (a: Animal) =>
  `${maj(a.nom)} se range dans ${GROUPES[a.groupe].nom} : on regarde ce que l’animal possède (${GROUPES[a.groupe].attribut}).`;

const faux = (a: Animal, g: Groupe) => ({
  label: GROUPES[g].nom,
  why:
    g === a.leurre
      ? `Attention au piège ! Où vit l’animal, ou comment il bouge, ne suffit pas. ${pourquoi(a)}`
      : `Ce groupe réunit les animaux qui ont ${GROUPES[g].attribut}. Relis la fiche.`,
});

const qcm = (rng: Rng, a: Animal, taille: 3 | 4, prompt: string): QuestionDraft => {
  const autres = rng.shuffle(CLES.filter((g) => g !== a.groupe && g !== a.leurre));
  const choisis = (a.leurre ? [a.leurre, ...autres] : autres).slice(0, taille - 1);
  const { answer, traps: tr } = choice(
    rng,
    GROUPES[a.groupe].nom,
    choisis.map((g) => faux(a, g)),
  );
  return {
    prompt,
    answer,
    traps: tr,
    hint: 'Cherche dans la fiche ce que l’animal possède : plumes, mamelles, pattes, nageoires…',
    steps: ['Pour classer, on regarde ce que l’animal **possède**.', a.fiche, `Groupe : **${GROUPES[a.groupe].nom}**.`],
    targetSeconds: 30,
  };
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const a = rng.pick(ANIMAUX.filter((x) => !x.leurre));
  return qcm(rng, a, 3, `Voici ${a.nom}. ${a.fiche} Dans quel groupe ranges-tu cet animal ?`);
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const a = rng.pick(ANIMAUX.filter((x) => x.leurre));
    return qcm(rng, a, 4, `Enquête ! ${a.fiche} C’est ${a.nom}. Quel est son groupe ?`);
  }
  const trois = rng.shuffle(CLES).slice(0, 3);
  return {
    prompt: `Associe chaque groupe à ce que ses animaux possèdent : ${trois.map((g) => GROUPES[g].nom).join(', ')}.`,
    answer: association(
      rng,
      trois.map((g) => [GROUPES[g].nom, maj(GROUPES[g].attribut)] as const),
    ),
    hint: 'Commence par le groupe dont tu connais le mieux un animal : que porte-t-il ?',
    steps: [
      'Chaque groupe réunit des animaux qui possèdent la même chose.',
      ...trois.map((g) => `${maj(GROUPES[g].nom)} : ${GROUPES[g].attribut}.`),
      'Chaque groupe est relié à **son** attribut.',
    ],
    targetSeconds: 50,
  };
};

const BOITES: readonly (readonly string[])[] = [
  ['les animaux', 'les vertébrés', 'les mammifères', 'les chats'],
  ['les animaux', 'les vertébrés', 'les oiseaux', 'les pigeons'],
  ['les animaux', 'les invertébrés', 'les insectes', 'les coccinelles'],
  ['les animaux', 'les invertébrés', 'les mollusques', 'les escargots'],
];

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const boite = rng.pick(BOITES);
    return {
      prompt: `Des boîtes rangées les unes dans les autres ! Mets-les de la plus grande à la plus petite : ${[...boite].sort().join(', ')}.`,
      answer: ordre(rng, boite),
      hint: 'La plus grande boîte contient toutes les autres.',
      steps: [
        'Dans des groupes emboîtés, chaque boîte est contenue dans la précédente.',
        `Ordre : **${boite.join(' → ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const a = rng.pick(ANIMAUX);
  const { answer, traps: tr } = saisie(
    GROUPES[a.groupe].accepte,
    CLES.filter((g) => g !== a.groupe).map((g) => [GROUPES[g].accepte[0] ?? '', faux(a, g).why] as const),
  );
  return {
    prompt: `${a.fiche} C’est ${a.nom}. Écris le nom de son groupe.`,
    answer,
    traps: tr,
    hint: `Dans ce groupe, les animaux ont ${GROUPES[a.groupe].attribut}. Quel est son nom ?`,
    steps: ['On repère ce que l’animal possède.', pourquoi(a), `Groupe : **${GROUPES[a.groupe].nom}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cinq = rng
      .shuffle(CLES)
      .slice(0, 5)
      .map((g) => rng.pick(ANIMAUX.filter((a) => a.groupe === g)));
    return {
      prompt: `Sans fiche cette fois ! Relie chaque animal à son groupe : ${cinq.map((a) => a.nom).join(', ')}.`,
      answer: association(
        rng,
        cinq.map((a) => [maj(a.nom), GROUPES[a.groupe].nom] as const),
      ),
      hint: 'Pour chaque animal, imagine ce qu’il porte sur le corps et compte ses pattes.',
      steps: [
        'On ne classe pas selon le lieu de vie : on regarde ce que l’animal possède.',
        ...cinq.map(pourquoi),
        'Chaque animal est relié à **son** groupe.',
      ],
      targetSeconds: 70,
    };
  }
  const a = rng.pick(ANIMAUX.filter((x) => x.leurre && x.groupe !== 'arachnide'));
  const vertebre = ['mammifere', 'oiseau', 'poisson', 'batracien'].includes(a.groupe);
  return {
    prompt: `Complète cette fiche. Animal : ${a.nom}. ${a.fiche}`,
    answer: {
      kind: 'cloze',
      parts: ['Son groupe (au pluriel) : les ', '. C’est un animal ', ' (vertébré ou invertébré).'],
      blanks: [
        { mode: 'text', accepted: [GROUPES[a.groupe].nom.replace('les ', ''), ...GROUPES[a.groupe].accepte] },
        { mode: 'text', accepted: vertebre ? ['vertébré', 'vertebre'] : ['invertébré', 'invertebre'] },
      ],
    },
    hint: 'Trouve d’abord le groupe. Puis demande-toi : ce groupe a-t-il des vertèbres ?',
    steps: [
      pourquoi(a),
      vertebre
        ? 'Ce groupe fait partie des vertébrés : ces animaux ont des vertèbres.'
        : 'Cet animal n’a ni vertèbres ni squelette intérieur : c’est un invertébré.',
      `Réponses : **${GROUPES[a.groupe].nom}** et **${vertebre ? 'vertébré' : 'invertébré'}**.`,
    ],
    targetSeconds: 50,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const par = (g: Groupe) => rng.pick(ANIMAUX.filter((a) => a.groupe === g));
  const m1 = par('mammifere');
  const m2 = rng.pick(ANIMAUX.filter((a) => a.groupe === 'mammifere' && a !== m1));
  const oiseau = par('oiseau');
  const autre = rng.pick([par('poisson'), par('batracien')]);
  const insecte = par('insecte');
  const mou = par('mollusque');
  const cartes = rng.shuffle([m1, m2, oiseau, autre, insecte, mou]);
  const figure = {
    kind: 'document' as const,
    title: 'Les fiches de la classe',
    lines: cartes.map((a) => `${maj(a.nom)}. ${a.fiche}`),
  };
  const noms = cartes.map((a) => a.nom).join(', ');
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: `Lis les fiches (${noms}). Combien d’animaux entrent dans la boîte des vertébrés ?`,
      figure,
      answer: num(4),
      traps: traps(r(4), [
        [6, 'Tous les animaux ne sont pas des vertébrés : l’insecte et le mollusque sont des invertébrés.'],
        [2, 'La boîte des vertébrés ne contient pas que les mammifères : les autres groupes à vertèbres y sont aussi.'],
      ]),
      hint: 'Les vertébrés ont des vertèbres : mammifères, oiseaux, poissons et batraciens.',
      steps: [
        'La boîte des vertébrés réunit mammifères, oiseaux, poissons et batraciens.',
        `On retire ${insecte.nom} et ${mou.nom}, qui sont des invertébrés.`,
        'Il reste **4** vertébrés.',
      ],
      targetSeconds: 70,
    };
  }
  if (t === 1) {
    const mam = m1;
    const { answer, traps: tr } = choice(rng, 'les vertébrés', [
      { label: 'les mammifères', why: `La boîte des mammifères ne contient pas ${oiseau.nom}.` },
      { label: 'les oiseaux', why: `La boîte des oiseaux ne contient pas ${mam.nom}.` },
      { label: 'les invertébrés', why: `${maj(mam.nom)} a des vertèbres : sa place n’est pas dans cette boîte.` },
    ]);
    return {
      prompt: `Lis les fiches (${noms}). Quelle est la plus petite boîte qui contient à la fois ${mam.nom} et ${oiseau.nom} ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Trouve le groupe de chacun, puis la boîte qui les entoure tous les deux.',
      steps: [
        pourquoi(mam),
        pourquoi(oiseau),
        'Les deux groupes sont emboîtés dans la même boîte : **les vertébrés**.',
      ],
      targetSeconds: 70,
    };
  }
  return {
    prompt: `Lis les fiches (${noms}). Combien d’animaux entrent dans la boîte des mammifères ?`,
    figure,
    answer: num(2),
    traps: traps(r(2), [
      [4, 'Tu as compté tous les vertébrés. Les mammifères sont seulement ceux qui ont des mamelles.'],
      [1, 'Cherche bien : un mammifère peut voler ou vivre dans la mer.'],
    ]),
    hint: 'Compte les fiches qui parlent de mamelles.',
    steps: ['Un mammifère a des mamelles.', `Ici : ${m1.nom} et ${m2.nom}.`, 'Il y en a **2**.'],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const classer: Skill = {
  id: 'vcm1-classer',
  title: 'Classer les êtres vivants',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour **classer** un animal, regarde ce qu’il **possède** : des plumes → oiseau, des mamelles → mammifère, six pattes → insecte. Voler ou nager ne suffit pas !',
      'Les groupes sont des **groupes emboîtés**, comme des boîtes : les mammifères sont rangés dans la boîte des **vertébrés** (ils ont des vertèbres).',
    ],
    source: `${PROGRAMME} : « Réaliser une classification en groupes emboités pour mettre en évidence des liens de parenté à partir d'un petit nombre d’espèces possédant des attributs identifiés » ; attributs des groupes et des espèces : Trésor de la langue française (CNRTL).`,
    sources: [
      PROGRAMME,
      'cnrtl-vertebre',
      'cnrtl-invertebre',
      'cnrtl-mammifere',
      'cnrtl-oiseau',
      'cnrtl-poisson',
      'cnrtl-batracien',
      'cnrtl-insecte',
      'cnrtl-arachnide',
      'cnrtl-mollusque',
      'cnrtl-chat',
      'cnrtl-chauve-souris',
      'cnrtl-baleine',
      'cnrtl-pigeon',
      'cnrtl-manchot',
      'cnrtl-truite',
      'cnrtl-grenouille',
      'cnrtl-mouche',
      'cnrtl-coccinelle',
      'cnrtl-abeille',
      'cnrtl-araignee',
      'cnrtl-escargot',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
