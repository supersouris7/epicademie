import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Les actions humaines sur l'environnement proche : répercussions positives et négatives ———
// Chaque effet vient d'une page du ministère chargé de la transition écologique (voir données citées).

interface Action {
  readonly acte: string;
  readonly effet: string;
}

const POSITIVES: readonly Action[] = [
  { acte: 'planter une haie', effet: 'aide des espèces à circuler entre les milieux' },
  { acte: 'entretenir une mare', effet: 'garde un milieu humide pour des êtres vivants' },
  { acte: 'installer une passe à poissons sur un barrage', effet: 'permet aux poissons de franchir un obstacle' },
  { acte: 'faucher l’herbe plus tard', effet: 'favorise la diversité des êtres vivants en ville' },
  { acte: 'composter les épluchures', effet: 'fait retourner de la matière au sol' },
];

const NEGATIVES: readonly Action[] = [
  { acte: 'construire une route à travers une forêt', effet: 'coupe le milieu et gêne les déplacements' },
  { acte: 'goudronner un sol nu', effet: 'empêche le sol d’absorber l’eau de pluie' },
  { acte: 'laisser des lampes allumées toute la nuit dehors', effet: 'perturbe les animaux la nuit' },
  { acte: 'jeter des produits sales dans la rivière', effet: 'pollue l’eau' },
  { acte: 'pêcher trop de poissons', effet: 'prélève trop d’individus d’une espèce sauvage' },
];

const TOUTES = [...POSITIVES, ...NEGATIVES];
const POSITIF = 'un effet positif';
const NEGATIF = 'un effet négatif';
const estPositive = (a: Action) => POSITIVES.includes(a);
const explique = (a: Action) => [
  `L’action : ${a.acte}.`,
  `Elle ${a.effet}.`,
  `C’est **${estPositive(a) ? POSITIF : NEGATIF}** pour la nature.`,
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const bonne = rng.pick(POSITIVES);
  const [x, y] = rng.shuffle(NEGATIVES) as [Action, Action];
  const { answer, traps: tr } = choice(rng, maj(bonne.acte), [
    { label: maj(x.acte), why: `Cette action ${x.effet} : elle abîme la nature.` },
    { label: maj(y.acte), why: `Cette action ${y.effet} : elle abîme la nature.` },
  ]);
  return {
    prompt: 'Quelle action aide la nature près de chez toi ?',
    answer,
    traps: tr,
    hint: 'Cherche l’action qui protège un lieu de vie.',
    steps: explique(bonne),
    targetSeconds: 30,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(TOUTES).slice(0, 3);
    return {
      prompt: `Associe chaque action à son effet : ${trois.map((a) => a.acte).join(' ; ')}.`,
      answer: association(
        rng,
        trois.map((a) => [maj(a.acte), maj(a.effet)] as const),
      ),
      hint: 'Commence par l’action la plus facile à relier à son effet.',
      steps: ['Chaque action a un effet sur la nature.', 'Chaque action est reliée à **son** effet.'],
      targetSeconds: 50,
    };
  }
  const bonne = rng.pick(NEGATIVES);
  const autres = rng.shuffle(POSITIVES).slice(0, 3);
  const { answer, traps: tr } = choice(
    rng,
    maj(bonne.acte),
    autres.map((a) => ({ label: maj(a.acte), why: `Cette action ${a.effet} : son effet est positif.` })),
  );
  return {
    prompt: 'Parmi ces actions, laquelle a un effet négatif sur la nature ?',
    answer,
    traps: tr,
    hint: 'Une seule action abîme un milieu.',
    steps: explique(bonne),
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  const a = rng.pick(TOUTES);
  const signe = estPositive(a) ? 'positif' : 'négatif';
  const contraire = estPositive(a) ? 'négatif' : 'positif';
  if (t === 0) {
    const { answer, traps: tr } = saisie(
      [...new Set([signe, signe.replace('é', 'e'), `un effet ${signe}`])],
      [
        [contraire, `Relis ce que fait l’action : ${a.effet}.`],
        ['neutre', 'Cette action change bien quelque chose pour la nature.'],
      ],
    );
    return {
      prompt: `Action : ${a.acte}. Son effet sur la nature est-il positif ou négatif ? Écris le mot.`,
      answer,
      traps: tr,
      hint: 'Demande-toi si les êtres vivants y gagnent ou y perdent.',
      steps: explique(a),
      targetSeconds: 35,
    };
  }
  if (t === 1) {
    return {
      prompt: `${maj(a.acte)}. Complète.`,
      answer: {
        kind: 'cloze',
        parts: ['Cette action a un effet ', ' sur la nature. C’est une action ', '.'],
        blanks: [
          { mode: 'list', options: ['positif', 'négatif'], correct: estPositive(a) ? 0 : 1 },
          { mode: 'list', options: ['qui protège', 'qui abîme'], correct: estPositive(a) ? 0 : 1 },
        ],
      },
      hint: 'Les deux réponses vont dans le même sens.',
      steps: explique(a),
      targetSeconds: 35,
    };
  }
  const { answer, traps: tr } = saisie(
    ['pollution', 'la pollution', 'une pollution'],
    [
      ['haie', 'Une haie aide les êtres vivants : ce n’est pas ce qui salit.'],
      ['prédation', 'La prédation est une relation entre animaux.'],
    ],
  );
  const salete = rng.pick([
    'Des produits sales coulent dans la rivière.',
    'De la fumée et des déchets salissent le sol et l’eau.',
    'Des déchets sont abandonnés au bord de la mare.',
  ]);
  return {
    prompt: `${salete} Comment appelle-t-on ce qui abîme ainsi le milieu ? Écris un mot.`,
    answer,
    traps: tr,
    hint: 'C’est un mot de cette leçon qui parle de saleté.',
    steps: ['Des saletés abîment l’eau, le sol ou l’air.', 'Ce mot est la **pollution**.'],
    targetSeconds: 35,
  };
};

const MOTS = [
  {
    texte: 'Une rangée d’arbustes qui borde un champ',
    mot: 'haie',
    accepte: ['haie', 'une haie', 'la haie'],
  },
  {
    texte: 'Un passage construit pour que les poissons franchissent un barrage',
    mot: 'passe à poissons',
    accepte: ['passe à poissons', 'une passe à poissons', 'passe a poissons', 'la passe à poissons'],
  },
  {
    texte: 'La saleté ou les produits qui abîment l’eau, le sol ou l’air',
    mot: 'pollution',
    accepte: ['pollution', 'la pollution', 'une pollution'],
  },
] as const;

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const m = rng.pick(MOTS);
    const { answer, traps: tr } = saisie(
      m.accepte,
      MOTS.filter((x) => x !== m).map(
        (x) => [x.mot, `Ce mot désigne autre chose : ${x.texte.toLowerCase()}.`] as const,
      ),
    );
    return {
      prompt: `Sans propositions : ${m.texte.toLowerCase()}. Quel est ce mot ?`,
      answer,
      traps: tr,
      hint: 'Il fait partie des mots de cette leçon.',
      steps: ['On lit la description.', `Le mot est **${m.mot}**.`],
      targetSeconds: 45,
    };
  }
  const cinq = rng.shuffle([...rng.shuffle(POSITIVES).slice(0, 3), ...rng.shuffle(NEGATIVES).slice(0, 2)]);
  return {
    prompt: `Associe les cinq actions à leur effet : ${cinq.map((a) => a.acte).join(' ; ')}.`,
    answer: association(
      rng,
      cinq.map((a) => [maj(a.acte), maj(a.effet)] as const),
    ),
    hint: 'Sépare les actions qui aident et celles qui abîment.',
    steps: ['Chaque action change quelque chose dans le milieu.', 'Chaque action est reliée à **son** effet.'],
    targetSeconds: 80,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const bonnes = rng.shuffle(POSITIVES).slice(0, rng.int(1, 3));
  const mauvaises = rng.shuffle(NEGATIVES).slice(0, 4 - bonnes.length);
  const projet = rng.shuffle([...bonnes, ...mauvaises]);
  const figure = {
    kind: 'document' as const,
    title: 'Actions notées près d’un village (exemple inventé)',
    lines: projet.map((a) => `${maj(a.acte)}.`),
  };
  const sujet = `Lis les actions notées (${projet.map((a) => a.acte).join(' ; ')}).`;
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: `${sujet} Combien d’actions ont un effet positif sur la nature ?`,
      figure,
      answer: num(bonnes.length),
      traps: traps(r(bonnes.length), [
        [mauvaises.length, 'Tu as compté les actions qui abîment la nature.'],
        [projet.length, 'Toutes les actions ne sont pas bonnes pour la nature.'],
      ]),
      hint: 'Juge les lignes une par une.',
      steps: [`Positives : ${bonnes.map((a) => a.acte).join(', ')}.`, `Il y en a **${bonnes.length}**.`],
      targetSeconds: 70,
    };
  }
  if (t === 1) {
    const cible = rng.pick(mauvaises);
    const { answer, traps: tr } = choice(rng, maj(cible.acte), [
      ...bonnes.map((a) => ({ label: maj(a.acte), why: `Cette action ${a.effet}.` })),
      ...mauvaises
        .filter((a) => a !== cible)
        .map((a) => ({ label: maj(a.acte), why: `Cette action ${a.effet} : ce n’est pas l’effet demandé.` })),
    ]);
    return {
      prompt: `${sujet} Quelle action notée ${cible.effet} ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Cherche l’action liée à ce problème.',
      steps: explique(cible),
      targetSeconds: 60,
    };
  }
  const bon = 'Certaines actions aident la nature, d’autres l’abîment : on les juge une par une';
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: 'Toute action humaine abîme forcément la nature',
      why: `Faux : par exemple, ${bonnes[0]?.acte} a un effet positif.`,
    },
    {
      label: 'Aucune action humaine ne change quoi que ce soit',
      why: `Faux : ${mauvaises[0]?.acte} ${mauvaises[0]?.effet}.`,
    },
    {
      label: 'Une seule action positive annule toutes les autres',
      why: 'Chaque effet compte : on les regarde un par un.',
    },
  ]);
  return {
    prompt: `${sujet} Quelle conclusion est la plus juste ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Il y a des effets des deux côtés.',
    steps: ['La liste contient des actions positives et négatives.', `Conclusion : **${bon}**.`],
    targetSeconds: 70,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const actionsHumaines: Skill = {
  id: 'vcm2-actions-humaines',
  title: 'Les activités humaines et l’environnement',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Nos actions changent l’**environnement** proche. Elles peuvent l’abîmer : route qui coupe un milieu, **pollution** de l’eau.',
      'Elles peuvent aussi l’aider : planter une **haie**, garder une mare. À chaque projet, regarde les deux côtés !',
    ],
    source: `${PROGRAMME} : « Mettre en évidence quelques répercussions positives et négatives des actions humaines sur l’environnement proche » ; ministère chargé de la transition écologique (trame verte et bleue, biodiversité, pollution lumineuse, artificialisation des sols, biodéchets).`,
    sources: [
      PROGRAMME,
      'ecologie-trame-verte',
      'ecologie-biodiversite',
      'ecologie-pollution-lumineuse',
      'ecologie-artificialisation',
      'ecologie-biodechets',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
