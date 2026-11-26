import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { maj } from './outils.ts';
import { compter, document, ecrit, formes, liste, notion, paires, qcm, ranger, type Faux } from './vivant-kit.ts';

// ——— Biodiversité actuelle et passée : clé, fossiles, échelle des temps, crises, diversité dans l'espèce (6e) ———

const TERRE = 'La Terre a environ 4,5 milliards d’années.';
const CRISES = 'Les temps riches en fossiles ont connu cinq grandes crises biologiques.';

const MOTS: readonly (readonly [string, string])[] = [
  ['un fossile', 'reste, empreinte ou trace d’un ancien organisme dans une roche sédimentaire'],
  ['une espèce', 'êtres vivants qui se ressemblent et ont ensemble une descendance fertile'],
  ['une clé de détermination', 'suite de choix qui permet de trouver le nom d’une espèce'],
  ['une crise biologique', 'disparition de très nombreuses espèces sur une courte durée à l’échelle géologique'],
  ['la diversité intraspécifique', 'différences entre les individus d’une même espèce'],
  ['la biodiversité', 'diversité du monde vivant'],
];

const autres = (m: string, n: number, rng: Rng): Faux[] =>
  rng
    .shuffle(MOTS.filter((x) => x[0] !== m))
    .slice(0, n)
    .map(([mot, d]) => [mot, `${maj(mot)} : ${d}.`]);

const niveau1 = (rng: Rng): QuestionDraft => {
  const [mot, def] = rng.pick(MOTS);
  return qcm(rng, {
    prompt: `Quel terme désigne : « ${def} » ?`,
    bon: mot,
    faux: autres(mot, 2, rng),
    hint: 'Repère le mot clé de la description.',
    pourquoi: [`${maj(mot)} : ${def}.`],
  });
};

const DIVERSITE: readonly { cas: string; bon: boolean }[] = [
  { cas: 'des coccinelles d’une même espèce n’ont pas toutes le même nombre de points', bon: true },
  { cas: 'les élèves d’une classe n’ont pas tous la même couleur des yeux', bon: true },
  { cas: 'des escargots d’une même espèce ont des coquilles de teintes différentes', bon: true },
  { cas: 'un chêne et un escargot vivent dans le même parc', bon: false },
  { cas: 'une truite et un pigeon n’appartiennent pas à la même espèce', bon: false },
  { cas: 'un chat et une araignée n’ont pas le même nombre de pattes', bon: false },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 1);
  if (t === 0) return paires(rng, MOTS, 3, 'Associe chaque terme à son sens');
  const d = rng.pick(DIVERSITE);
  const bon = d.bon ? 'la diversité à l’intérieur d’une espèce' : 'la diversité entre des espèces différentes';
  return qcm(rng, {
    prompt: `Observation : ${d.cas}. De quelle diversité s’agit-il ?`,
    bon,
    faux: [
      [
        d.bon ? 'la diversité entre des espèces différentes' : 'la diversité à l’intérieur d’une espèce',
        'Demande-toi si les individus comparés sont de la même espèce.',
      ],
      ['une crise biologique', 'Une crise est une disparition massive d’espèces.'],
      ['un paléoenvironnement', 'Ce mot désigne un milieu ancien.'],
    ],
    hint: 'Les individus comparés appartiennent-ils à la même espèce ?',
    pourquoi: [d.bon ? 'Les individus comparés sont de la même espèce.' : 'On compare des espèces différentes.'],
  });
};

const EVENEMENTS: readonly { nom: string; age: number }[] = [
  { nom: 'formation de la Terre (environ 4,5 milliards d’années)', age: 4500 },
  { nom: 'grande extinction de la fin de l’ère primaire (252 millions d’années)', age: 252 },
  { nom: 'extinction de la fin du Crétacé, celle des dinosaures (environ 66 millions d’années)', age: 66 },
];
const HOMO = 'diffusion du genre Homo en Eurasie, au Quaternaire';

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const trois = rng.shuffle([...EVENEMENTS.map((e) => e.nom), HOMO]).slice(0, 3);
    const enOrdre = [...EVENEMENTS.map((e) => e.nom), HOMO].filter((n) => trois.includes(n));
    return ranger(rng, {
      prompt: `Place ces événements du plus ancien au plus récent : ${liste(trois)}.`,
      enOrdre,
      hint: 'Plus le nombre d’années est grand, plus l’événement est ancien.',
      pourquoi: [TERRE, 'On compare les âges : le plus grand est le plus ancien.'],
    });
  }
  if (t === 1) {
    const mot = 'un fossile';
    const def = 'reste, empreinte ou trace d’un ancien organisme dans une roche sédimentaire';
    return ecrit({
      prompt: `Comment nomme-t-on ceci : ${def} ? Écris le mot.`,
      accepte: formes(mot.replace('un ', ''), 'un', 'le'),
      faux: [
        ['espèce', 'Une espèce est un ensemble d’êtres vivants, pas une trace dans la roche.'],
        ['roche', 'La roche contient la trace : on demande le nom de la trace.'],
      ],
      hint: 'Les paléontologues les cherchent dans les roches.',
      pourquoi: [`${maj(mot)} : ${def}.`],
    });
  }
  return ecrit({
    prompt: 'Quel mot désigne un ensemble d’individus qui se ressemblent et dont la descendance commune est fertile ?',
    accepte: formes('espèce', 'une', 'l’'),
    faux: [
      ['fossile', 'Un fossile est une trace d’un ancien organisme.'],
      ['biodiversité', 'La biodiversité est la diversité du monde vivant tout entier.'],
    ],
    hint: 'C’est la plus petite boîte de la classification.',
    pourquoi: ['Se reproduire entre eux, avec une descendance fertile, caractérise les membres d’une espèce.'],
  });
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0) return paires(rng, MOTS, 5, 'Sans aide, associe les cinq termes à leur sens');
  if (t === 1)
    return compter({
      prompt:
        'Une extinction a eu lieu il y a 252 millions d’années et une autre il y a environ 66 millions d’années. Combien de millions d’années les séparent ?',
      valeur: 186,
      faux: [
        [318, 'Pour une durée entre deux dates passées, on soustrait.'],
        [252, 'C’est l’âge de la première extinction, pas l’écart.'],
      ],
      hint: 'Soustrais le plus petit âge du plus grand.',
      pourquoi: ['252 − 66 = 186.'],
    });
  if (t === 2) {
    const c = rng.pick([
      {
        q: 'Un film montre des êtres humains chassant des dinosaures. Pourquoi est-ce impossible ?',
        bon: 'les dinosaures du film ont disparu bien avant l’histoire des humains',
        faux: [
          'les dinosaures vivaient uniquement après les humains',
          'les deux ont disparu la même année',
          'les humains sont plus anciens que la Terre',
        ],
        pourquoi:
          'L’extinction des dinosaures date d’environ 66 millions d’années ; le genre Homo se diffuse bien plus tard.',
      },
      {
        q: 'Que signifie une crise biologique à l’échelle des temps géologiques ?',
        bon: 'de très nombreuses espèces disparaissent, ce qui change la biodiversité',
        faux: [
          'un seul individu d’une espèce meurt',
          'toutes les roches disparaissent',
          'les êtres vivants cessent d’avoir des cellules',
        ],
        pourquoi: CRISES,
      },
      {
        q: 'Deux individus se ressemblent beaucoup. Est-ce suffisant pour affirmer qu’ils sont de la même espèce ?',
        bon: 'non : il faut aussi qu’ils puissent avoir ensemble une descendance fertile',
        faux: [
          'oui : la ressemblance suffit toujours',
          'oui, s’ils ont la même taille',
          'non : des individus d’une espèce sont tous identiques',
        ],
        pourquoi: 'La ressemblance ne suffit pas : la reproduction compte aussi.',
      },
    ]);
    return qcm(rng, {
      prompt: c.q,
      bon: c.bon,
      faux: c.faux.map((f): Faux => [f, c.pourquoi]),
      hint: 'Pense à l’échelle de temps et à la définition des termes.',
      pourquoi: [c.pourquoi],
    });
  }
  return ecrit({
    prompt: 'Le temps long de l’histoire de la Terre se lit sur l’échelle des temps … Écris l’adjectif qui manque.',
    accepte: formes('géologiques').concat(formes('géologique')),
    faux: [
      ['historiques', 'Les temps historiques concernent l’histoire des humains.'],
      ['humains', 'L’histoire humaine est une échelle beaucoup plus courte.'],
    ],
    hint: 'L’adjectif désigne ce qui concerne les roches et l’histoire de la Terre.',
    pourquoi: ['L’échelle des temps géologiques se compte en millions d’années.'],
  });
};

const PEUPLEMENTS = [
  { code: 'A', fossile: 'coquilles d’animaux marins', milieu: 'une mer' },
  {
    code: 'B',
    fossile: 'feuilles et graines de plantes terrestres',
    milieu: 'une terre émergée avec de la végétation',
  },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const ancien = rng.pick(PEUPLEMENTS);
    const recent = PEUPLEMENTS[ancien === PEUPLEMENTS[0] ? 1 : 0];
    const n = rng.int(5, 9);
    const actuel = rng.int(14, 20);
    const figure = document('Coupe d’une carrière (données inventées pour l’exercice)', [
      `Couche profonde (la plus ancienne) : ${n} espèces fossiles, surtout des ${ancien.fossile}.`,
      `Couche du dessus (plus récente) : ${n + 2} espèces fossiles, surtout des ${recent.fossile}.`,
      `Surface actuelle : ${actuel} espèces vivantes recensées.`,
    ]);
    return qcm(rng, {
      prompt: `Lis la coupe (${n}, ${n + 2} et ${actuel} espèces ; couche profonde ${ancien.code}). D’après les fossiles, quel milieu correspond à la couche profonde ?`,
      figure,
      bon: ancien.milieu,
      faux: [
        [recent.milieu, 'C’est le milieu suggéré par la couche du dessus.'],
        [
          'le même milieu qu’aujourd’hui, sans aucun changement',
          'On le reconstitue à partir des fossiles de la couche, pas de la surface.',
        ],
        ['un milieu sans aucun être vivant', 'La couche contient des espèces fossiles.'],
      ],
      hint: 'Lis les fossiles de la couche la plus profonde : où vivaient ces êtres ?',
      pourquoi: [
        'Les fossiles d’une couche renseignent sur le milieu de son époque.',
        `La couche profonde contient des ${ancien.fossile}.`,
      ],
    });
  }
  if (t === 1) {
    const a = rng.int(20, 40);
    const b = rng.int(4, 12);
    return compter({
      prompt: `Lis les relevés (${a} puis ${b} espèces). Combien d’espèces de moins trouve-t-on après la limite ?`,
      figure: document('Relevé de fossiles de part et d’autre d’une limite (données inventées)', [
        `Sous la limite (couches plus anciennes) : ${a} espèces.`,
        `Au-dessus de la limite : ${b} espèces.`,
      ]),
      valeur: a - b,
      faux: [
        [a + b, 'Pour une perte, on soustrait.'],
        [b, 'C’est le nombre d’espèces restantes.'],
      ],
      hint: 'Compare les deux nombres.',
      pourquoi: [`${a} − ${b} = ${a - b}.`, 'Une chute brutale du nombre d’espèces peut signaler une crise.'],
    });
  }
  const [x, y, z] = rng.shuffle(['K', 'M', 'N', 'P', 'R', 'S']).slice(0, 3) as [string, string, string];
  const cas = rng.pick([
    { obs: 'des fleurs jaunes et des feuilles rondes', nom: x },
    { obs: 'des fleurs jaunes et des feuilles allongées', nom: y },
    { obs: 'des fleurs blanches', nom: z },
  ]);
  return ecrit({
    prompt: `Utilise la clé (plantes ${x}, ${y}, ${z}). Une plante a ${cas.obs}. Écris la lettre donnée par la clé.`,
    figure: document('Clé de détermination (plantes désignées par une lettre, données de l’exercice)', [
      'Question 1. Fleurs jaunes : aller à la question 2. Fleurs blanches : plante ' + z + '.',
      `Question 2. Feuilles rondes : plante ${x}. Feuilles allongées : plante ${y}.`,
    ]),
    accepte: [cas.nom, `plante ${cas.nom}`],
    faux: [x, y, z]
      .filter((l) => l !== cas.nom)
      .map((l): Faux => [l, 'Reprends la clé depuis la question 1 et suis chaque choix qui correspond à la plante.']),
    hint: 'Commence toujours par la question 1, puis suis le renvoi.',
    pourquoi: ['Une clé sert à identifier, par des choix successifs qui correspondent à l’observation.'],
  });
};

export const biodiversite = notion({
  id: 'v6-biodiversite',
  title: 'La biodiversité actuelle et passée',
  memo: [
    'La **biodiversité** change. Les **fossiles** renseignent sur les espèces et les milieux du passé. La Terre a environ 4,5 milliards d’années ; ses grandes **crises biologiques** ont fait disparaître de très nombreuses espèces.',
    'Dans une **espèce**, les individus diffèrent : c’est la **diversité intraspécifique**. Une **clé de détermination** aide à trouver un nom, par des choix successifs.',
  ],
  faits: [
    'cle-programme',
    'intraspecifique',
    'echelles',
    'paleoenvironnement',
    'crises-programme',
    'fossile-definition',
    'age-terre',
    'crises',
    'fin-primaire',
    'fin-cretace',
    'quaternaire',
    'espece-criteres',
    'cle',
  ],
  niveaux: [niveau1, niveau2, niveau3, niveau4, niveau5],
});
