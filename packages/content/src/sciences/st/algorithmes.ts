import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Algorithme et programme : consignes à un robot (cours moyen) ———

export const CAPS = ['nord', 'est', 'sud', 'ouest'] as const;
export type Cap = (typeof CAPS)[number];

/** `a` avance d'une case, `d` tourne à droite, `g` tourne à gauche (quart de tour, sans avancer). */
export type Bloc = 'a' | 'd' | 'g';
export const TEXTE: Record<Bloc, string> = {
  a: 'avance d’une case',
  d: 'tourne à droite',
  g: 'tourne à gauche',
};

/** « le nord », « l’est »… */
const le = (cap: Cap) => (cap === 'est' || cap === 'ouest' ? `l’${cap}` : `le ${cap}`);

export const tourner = (cap: Cap, b: Bloc): Cap => {
  const i = CAPS.indexOf(cap);
  const pas = b === 'd' ? 1 : b === 'g' ? 3 : 0;
  return CAPS[(i + pas) % 4] ?? cap;
};

/** Exécute un programme depuis la case (0 ; 0) : position finale, cap et cases parcourues. */
export function executer(depart: Cap, blocs: readonly Bloc[]) {
  let cap = depart;
  let est = 0;
  let nord = 0;
  let cases = 0;
  for (const b of blocs) {
    if (b !== 'a') {
      cap = tourner(cap, b);
      continue;
    }
    cases++;
    if (cap === 'nord') nord++;
    else if (cap === 'sud') nord--;
    else if (cap === 'est') est++;
    else est--;
  }
  return { cap, est, nord, cases };
}

const liste = (blocs: readonly Bloc[]) => blocs.map((b) => TEXTE[b]);

const DEFINITIONS = [
  {
    q: 'Qu’est-ce qu’un algorithme ?',
    bon: 'une suite de règles à appliquer dans un ordre précis',
    faux: [
      ['le moteur qui fait rouler un robot', 'Le moteur est une pièce du robot ; ce n’est pas une suite de règles.'],
      [
        'un capteur qui repère les obstacles',
        'Un capteur recueille une information ; ce n’est pas une suite de règles.',
      ],
    ],
  },
  {
    q: 'Qu’est-ce qu’un programme pour un robot ?',
    bon: 'une suite d’instructions écrites dans un langage, que le robot exécute',
    faux: [
      ['la pile qui alimente le robot', 'La pile donne de l’énergie ; elle ne dit pas quoi faire.'],
      ['la coque qui protège le robot', 'La coque protège ; elle ne donne aucune consigne.'],
    ],
  },
] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const d = rng.pick(DEFINITIONS);
    const { answer, traps: tr } = choice(
      rng,
      d.bon,
      d.faux.map(([label, why]) => ({ label, why })),
    );
    return {
      prompt: d.q,
      answer,
      traps: tr,
      hint: 'Cherche ce qui donne des consignes.',
      steps: ['Un robot suit des consignes.', `**${maj(d.bon)}**.`],
      targetSeconds: 25,
    };
  }
  const x = rng.pick([
    { q: 'Quelle consigne fait changer le robot de case ?', bon: 'a' as const },
    { q: 'Quelle consigne fait pivoter le robot vers sa droite ?', bon: 'd' as const },
    { q: 'Quelle consigne fait pivoter le robot vers sa gauche ?', bon: 'g' as const },
  ]);
  const why: Record<Bloc, string> = {
    a: '« Avance » déplace le robot d’une case, sans tourner.',
    d: '« Tourne à droite » fait pivoter le robot vers la droite, sans avancer.',
    g: '« Tourne à gauche » fait pivoter le robot vers la gauche, sans avancer.',
  };
  const { answer, traps: tr } = choice(
    rng,
    TEXTE[x.bon],
    (['a', 'd', 'g'] as const).filter((b) => b !== x.bon).map((b) => ({ label: TEXTE[b], why: why[b] })),
  );
  return {
    prompt: x.q,
    answer,
    traps: tr,
    hint: 'Relis chaque consigne : avancer, ce n’est pas tourner.',
    steps: [why[x.bon], `Réponse : **${TEXTE[x.bon]}**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const x = rng.pick([
    {
      q: 'Comment s’appelle une seule consigne d’un programme ?',
      bon: 'une instruction',
      faux: [
        ['un capteur', 'Un capteur est un élément qui recueille une information.'],
        ['un actionneur', 'Un actionneur est un élément qui agit, comme un moteur.'],
        ['un programme', 'Le programme est la suite entière des consignes.'],
      ],
    },
    {
      q: 'Comment s’appelle la suite d’instructions que l’on donne à un robot dans un langage de programmation ?',
      bon: 'un programme',
      faux: [
        ['une instruction', 'Une instruction est une seule consigne ; ici, il y en a toute une suite.'],
        ['un capteur', 'Un capteur recueille une information.'],
        ['un moteur', 'Un moteur fait bouger ; il n’est pas une suite de consignes.'],
      ],
    },
    {
      q: 'À l’école, on programme souvent un robot avec des morceaux à assembler. Comment s’appelle ce type de langage ?',
      bon: 'un langage par blocs',
      faux: [
        ['un langage des signes', 'La langue des signes sert à communiquer entre personnes.'],
        ['un langage par dessins animés', 'Un dessin animé raconte une histoire ; il ne programme pas.'],
        ['un langage musical', 'La musique ne sert pas ici à donner des consignes au robot.'],
      ],
    },
  ] as const);
  const { answer, traps: tr } = choice(
    rng,
    x.bon,
    x.faux.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: x.q,
    answer,
    traps: tr,
    hint: 'Pense à la différence entre une consigne et la liste entière.',
    steps: ['On cherche le mot exact.', `C’est **${x.bon}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const n = rng.int(2, 4);
    const m = rng.int(2, 4);
    const sens = rng.pick(['droite', 'gauche'] as const);
    const etapes = [`avancer de ${n} cases`, `tourner à ${sens}`, `avancer de ${m + 3} cases`, 's’arrêter'];
    return {
      prompt: `Le robot doit : d’abord avancer de ${n} cases, puis tourner à ${sens}, puis avancer de ${m + 3} cases, et enfin s’arrêter. Remets les blocs dans l’ordre.`,
      answer: ordre(rng, etapes),
      hint: 'Suis les mots « d’abord », « puis », « enfin ».',
      steps: ['Un algorithme s’applique dans un ordre précis.', `Ordre : **${etapes.join(' → ')}**.`],
      targetSeconds: 45,
    };
  }
  const blocs = rng.shuffle<Bloc>(['a', 'a', 'a', 'd', 'g']).slice(0, 4);
  const toujours: Bloc[] = [...blocs, 'a'];
  const { cases } = executer('nord', toujours);
  return {
    prompt: `Voici un programme : ${liste(toujours).join(', ')}. Combien de cases le robot parcourt-il ?`,
    answer: num(cases, 'cases'),
    traps: traps(r(cases), [
      [toujours.length, 'Tu as compté tous les blocs. Tourner ne fait pas changer de case.'],
      [toujours.length - cases, 'C’est le nombre de virages. Compte les « avance ».'],
    ]),
    hint: 'Seules certaines consignes font changer de case.',
    steps: ['On compte les blocs « avance d’une case ».', `Le robot parcourt **${cases} case(s)**.`],
    targetSeconds: 40,
  };
};

const TRADUCTIONS: readonly (readonly [string, string])[] = [
  ['avance d’une case', 'le robot change de case, droit devant'],
  ['tourne à droite', 'le robot pivote vers sa droite'],
  ['tourne à gauche', 'le robot pivote vers sa gauche'],
  ['arrête-toi', 'le robot ne bouge plus'],
  ['si obstacle devant, alors tourne', 'le robot change de direction seulement s’il détecte un obstacle'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    return {
      prompt: 'Traduis ce programme : relie chaque bloc à sa phrase en français.',
      answer: association(rng, TRADUCTIONS),
      hint: 'Commence par les blocs les plus simples.',
      steps: [
        'Traduire un programme, c’est dire avec des mots ce que fait chaque bloc.',
        'Chaque bloc est relié à **sa** phrase.',
      ],
      targetSeconds: 60,
    };
  }
  const depart = rng.pick(CAPS);
  const blocs: Bloc[] = [
    rng.pick(['d', 'g'] as const),
    'a',
    rng.pick(['d', 'g'] as const),
    rng.pick(['d', 'g', 'a'] as const),
  ];
  const { cap } = executer(depart, blocs);
  const faux = CAPS.filter((c) => c !== cap).map(
    (c) =>
      [
        c,
        c === depart
          ? 'C’est la direction du départ : suis chaque virage.'
          : 'Refais les virages un par un, depuis la position du robot.',
      ] as const,
  );
  const { answer, traps: tr } = saisie([cap, le(cap), `vers ${le(cap)}`], faux);
  return {
    prompt: `Le robot regarde vers ${le(depart)}. Il exécute : ${liste(blocs).join(', ')}. Vers où regarde-t-il à la fin ? Écris nord, sud, est ou ouest.`,
    answer,
    traps: tr,
    hint: 'Fais tourner ta feuille. Seuls les virages changent la direction. Ordre en tournant à droite : nord, est, sud, ouest.',
    steps: [
      'En tournant à droite : nord, puis est, puis sud, puis ouest.',
      'Avancer ne change pas la direction.',
      `Il regarde vers **${le(cap)}**.`,
    ],
    targetSeconds: 55,
  };
};

interface Parcours {
  readonly nord: number;
  readonly est: number;
  readonly court: readonly Bloc[];
  readonly long: readonly Bloc[];
  readonly faux: readonly Bloc[];
}

const A = (n: number): Bloc[] => Array.from({ length: n }, () => 'a');

/** Arrivée à `nord` cases au nord et `est` cases à l'est ; le robot regarde vers le nord au départ. */
export const parcours = (nord: number, est: number): Parcours => ({
  nord,
  est,
  court: [...A(nord), 'd', ...A(est)],
  long: [...A(nord + 1), 'd', ...A(est), 'd', 'a'],
  faux: [...A(nord), 'g', ...A(est)],
});

const niveau5 = (rng: Rng): QuestionDraft => {
  const p = parcours(rng.int(2, 3), rng.int(1, 3));
  const lettres = ['A', 'B', 'C'] as const;
  const programmes = rng.shuffle([
    { blocs: p.court, genre: 'court' },
    { blocs: p.long, genre: 'long' },
    { blocs: p.faux, genre: 'faux' },
  ]);
  const figure = {
    kind: 'document' as const,
    title: 'Mission : rejoindre la balise',
    lines: [
      'Au départ, le robot regarde vers le nord.',
      `La balise est ${p.nord} cases au nord et ${p.est} case(s) à l’est du départ.`,
      'Chaque bloc dure une seconde. Aucun obstacle sur la carte.',
      ...programmes.map((g, i) => `Programme ${lettres[i]} : ${liste(g.blocs).join(', ')}.`),
    ],
  };
  const lettre = (genre: string) => lettres[programmes.findIndex((g) => g.genre === genre)] ?? 'A';
  if (rng.int(0, 1) === 0) {
    const bon = lettre('court');
    const { answer, traps: tr } = saisie(
      [bon, `programme ${bon}`, `le programme ${bon}`],
      [
        [lettre('long'), 'Ce programme arrive à la balise, mais avec plus de blocs : il est plus lent.'],
        [lettre('faux'), 'Ce programme tourne à gauche : il part à l’ouest et manque la balise.'],
      ],
    );
    return {
      prompt: 'Lis la mission. Quel programme atteint la balise le plus vite ? Écris sa lettre.',
      figure,
      answer,
      traps: tr,
      hint: 'Vérifie d’abord où arrive chaque programme, puis compte ses blocs.',
      steps: [
        `Le programme ${lettre('faux')} va à l’ouest : il rate la balise.`,
        `Le programme ${lettre('long')} arrive, mais il compte ${p.long.length} blocs contre ${p.court.length}.`,
        `C’est le programme **${bon}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const bon = p.court.length;
  return {
    prompt: `Lis la mission. Combien de secondes dure le programme ${lettre('court')} ?`,
    figure,
    answer: num(bon, 's'),
    traps: traps(r(bon), [
      [bon - 1, 'Tourner prend aussi une seconde : compte le virage.'],
      [p.long.length, 'C’est la durée du programme le plus long.'],
    ]),
    hint: 'Un bloc, une seconde. N’oublie aucun bloc.',
    steps: ['On compte tous les blocs du programme demandé.', `Il dure **${bon} secondes**.`],
    targetSeconds: 50,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const algorithmes: Skill = {
  id: 'tcm2-algorithme-programme',
  title: 'Algorithme et programme',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **algorithme**, c’est une suite de règles à appliquer dans un ordre précis. Un **programme** l’écrit dans un langage que la machine exécute ; chaque consigne est une **instruction**.',
      'Pour un robot : « avance », « tourne à droite », « arrête-toi ». Lis les blocs un par un, comme si tu étais le robot !',
    ],
    source: `${PROGRAMME} : « organiser un ensemble de consignes (par exemple, pour un robot : avancer, tourner, s’arrêter) » ; « langages de programmation par blocs » ; « Coder un algorithme simple agissant sur le comportement d’un objet technique » ; « Comprendre un programme simple et le traduire en langage naturel » ; « Critiquer un programme au regard du comportement de l’objet programmé ». Académie française : algorithme, « en appliquant dans un ordre précis une suite finie de règles » ; programme, « Suite d’instructions rédigées dans un langage spécifique, qui commande à un dispositif […] d’exécuter une tâche donnée » ; instruction, « Consigne formulée dans un langage de programmation ».`,
    sources: [PROGRAMME, 'academie-algorithme', 'academie-programme', 'academie-instruction'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
