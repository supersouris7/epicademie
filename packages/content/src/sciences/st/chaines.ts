import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Les chaînes et les réseaux alimentaires : lire des flèches, végétaux à la base, effets d'une disparition ———
// Réseaux inventés : chaque lien « est mangé par » est donné par l'énoncé ou le document.

const FLECHE = 'La flèche « A → B » veut dire « A est mangé par B ».';

interface Reseau {
  /** Chaînes partant d'un végétal ; réunies, elles forment le réseau. */
  readonly chaines: readonly (readonly string[])[];
  readonly vegetaux: readonly string[];
}

const RESEAUX: readonly Reseau[] = [
  {
    chaines: [
      ['l’herbe', 'la sauterelle', 'la grenouille', 'le héron'],
      ['l’herbe', 'le lapin', 'le renard'],
      ['l’herbe', 'la sauterelle', 'la mésange', 'l’épervier'],
    ],
    vegetaux: ['l’herbe'],
  },
  {
    chaines: [
      ['les feuilles du chêne', 'la chenille', 'la mésange', 'l’épervier'],
      ['les glands', 'le mulot', 'la chouette'],
      ['les glands', 'le mulot', 'le renard'],
    ],
    vegetaux: ['les feuilles du chêne', 'les glands'],
  },
  {
    chaines: [
      ['la salade', 'l’escargot', 'le hérisson'],
      ['le rosier', 'le puceron', 'la coccinelle', 'la mésange'],
      ['la salade', 'la limace', 'le hérisson'],
    ],
    vegetaux: ['la salade', 'le rosier'],
  },
];

type Lien = readonly [string, string];

const liens = (n: Reseau): Lien[] => {
  const out: Lien[] = [];
  for (const c of n.chaines)
    for (let i = 0; i + 1 < c.length; i++) {
      const [a, b] = [c[i] ?? '', c[i + 1] ?? ''];
      if (!out.some((l) => l[0] === a && l[1] === b)) out.push([a, b]);
    }
  return out;
};
const mange = (n: Reseau, proie: string) =>
  liens(n)
    .filter((l) => l[0] === proie)
    .map((l) => l[1]);
/** Vrai si une seule façon d'apparier proies et mangeurs respecte les flèches. */
const seulAppariement = (n: Reseau, paires: readonly Lien[]) => {
  const compter = (i: number, pris: ReadonlySet<string>): number =>
    i === paires.length
      ? 1
      : paires.reduce(
          (total, [, b]) =>
            !pris.has(b) && liens(n).some(([x, y]) => x === paires[i]?.[0] && y === b)
              ? total + compter(i + 1, new Set([...pris, b]))
              : total,
          0,
        );
  return compter(0, new Set()) === 1;
};
const nourritures = (n: Reseau, qui: string) =>
  liens(n)
    .filter((l) => l[1] === qui)
    .map((l) => l[0]);
const animaux = (n: Reseau) => [...new Set(liens(n).map((l) => l[1]))];
const sansArticle = (s: string) => s.replace(/^(l’|la |le |les )/, '');
const variantes = (s: string) => {
  const nu = sansArticle(s);
  const sansAccents = (x: string) => x.normalize('NFD').replace(/\p{M}/gu, '');
  return [...new Set([s, nu, sansAccents(s), sansAccents(nu)])];
};
const fleches = (c: readonly string[]) => c.join(' → ');
const enDocument = (n: Reseau, titre: string) => ({
  kind: 'document' as const,
  title: titre,
  lines: [FLECHE, ...liens(n).map(([a, b]) => `${maj(a)} → ${b}.`)],
});

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(rng.pick(RESEAUX).chaines.filter((x) => x.length === 3));
  const [a = '', b = '', fin = ''] = c;
  const { answer, traps: tr } = choice(rng, a, [
    { label: b, why: `${maj(b)} mange un autre être vivant : il n’est pas au début.` },
    { label: fin, why: `${maj(fin)} est au bout de la chaîne.` },
  ]);
  return {
    prompt: `Voici une chaîne alimentaire : ${fleches(c)}. Qui est au tout début ?`,
    answer,
    traps: tr,
    hint: 'Cherche celui qui ne mange aucun autre dans cette chaîne.',
    steps: ['Une chaîne alimentaire commence par un végétal.', `Au début : **${a}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const n = rng.pick(RESEAUX);
  if (rng.int(0, 1) === 0) {
    const c = rng.pick(n.chaines.filter((x) => x.length === 4));
    const trois = c.slice(0, -1).map((x, i) => [maj(x), maj(c[i + 1] ?? '')] as const);
    return {
      prompt: `${FLECHE} Voici une chaîne : ${fleches(c)}. Associe chaque être vivant à celui qui le mange.`,
      answer: association(rng, trois),
      hint: 'Suis chaque flèche : elle pointe vers celui qui mange.',
      steps: ['La flèche va vers le mangeur.', 'Chaque proie est reliée à **son** mangeur.'],
      targetSeconds: 50,
    };
  }
  const [a, b] = rng.pick(liens(n));
  const autres = liens(n)
    .flat()
    .filter((x) => x !== a && x !== b);
  const [x = '', y = ''] = rng.shuffle([...new Set(autres)]);
  const { answer, traps: tr } = choice(rng, `${b} mange ${a}`, [
    { label: `${a} mange ${b}`, why: 'La flèche part de celui qui est mangé et va vers celui qui mange.' },
    { label: `${a} mange ${x}`, why: 'Cet être vivant n’est pas dans la flèche.' },
    { label: `${y} mange ${a}`, why: 'Cet être vivant n’est pas dans la flèche.' },
  ]);
  return {
    prompt: `${FLECHE} Que signifie « ${a} → ${b} » ?`,
    answer,
    traps: tr,
    hint: 'Lis la flèche avec les mots « est mangé par ».',
    steps: [`On lit : ${a} est mangé par ${b}.`, `Donc **${b} mange ${a}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const n = rng.pick(RESEAUX);
  const c = rng.pick(n.chaines.filter((x) => x.length >= 3));
  if (rng.int(0, 1) === 0) {
    const phrases = rng.shuffle(c.slice(1).map((x, i) => `${maj(x)} mange ${c[i]}.`));
    return {
      prompt: `${phrases.join(' ')} Range la chaîne : du végétal jusqu’au dernier mangeur.`,
      answer: ordre(rng, c.map(maj)),
      hint: 'Commence par celui que personne ne cite comme mangeur.',
      steps: ['La chaîne commence par un végétal.', `Chaîne : **${fleches(c)}**.`],
      targetSeconds: 55,
    };
  }
  const base = c[0] ?? '';
  const autres = c.slice(1);
  const { answer, traps: tr } = saisie(
    variantes(base),
    autres.map((x) => [x, `${maj(x)} mange un autre être vivant : ce n’est pas le végétal de départ.`] as const),
  );
  return {
    prompt: `${FLECHE} Dans la chaîne ${fleches(c)}, quel végétal est à la base ? Écris-le.`,
    answer,
    traps: tr,
    hint: 'Cherche celui qui ne mange aucun autre dans cette chaîne.',
    steps: ['Les végétaux sont à la base des chaînes et réseaux alimentaires.', `À la base : **${base}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const n = rng.pick(RESEAUX);
  const t = rng.int(0, 2);
  if (t === 0) {
    const milieux = liens(n)
      .map((l) => l[1])
      .filter((x) => nourritures(n, x).length === 1 && mange(n, x).length === 1)
      .filter(
        (x) =>
          animaux(n).filter(
            (y) => nourritures(n, y).includes(nourritures(n, x)[0] ?? '') && mange(n, y).includes(mange(n, x)[0] ?? ''),
          ).length === 1,
      );
    const m = rng.pick(milieux);
    const avant = nourritures(n, m)[0] ?? '';
    const apres = mange(n, m)[0] ?? '';
    const { answer, traps: tr } = saisie(variantes(m), [
      [avant, `C’est ce que mange l’être cherché, pas lui.`],
      [apres, `C’est lui qui mange l’être cherché.`],
    ]);
    return {
      prompt: `Qui mange ${avant} et est mangé par ${apres} ? Écris-le.`,
      figure: enDocument(n, 'Réseau alimentaire (exemple inventé)'),
      answer,
      traps: tr,
      hint: 'Il est au milieu : une flèche arrive vers lui, une autre en part.',
      steps: [`On cherche : ${avant} → ? → ${apres}.`, `C’est **${m}**.`],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const paires: Lien[] = [];
    for (const [a, b] of rng.shuffle(liens(n))) if (!paires.some((p) => p[0] === a || p[1] === b)) paires.push([a, b]);
    const cinq = paires.slice(0, 5);
    if (cinq.length === 5 && seulAppariement(n, cinq))
      return {
        prompt: `Dans ce réseau, associe chacun (${cinq
          .map((p) => p[0])
          .sort()
          .join(', ')}) à son mangeur, parmi : ${cinq
          .map((p) => p[1])
          .sort()
          .join(', ')}.`,
        figure: enDocument(n, 'Réseau alimentaire (exemple inventé)'),
        answer: association(
          rng,
          cinq.map((p) => [maj(p[0]), maj(p[1])] as const),
        ),
        hint: 'Chaque proie ne va qu’avec un mangeur de la liste proposée.',
        steps: ['On suit les flèches du réseau.', 'Chaque proie est reliée à **un** mangeur.'],
        targetSeconds: 80,
      };
  }
  const specialistes = animaux(n).filter((x) => nourritures(n, x).length === 1);
  const x = rng.pick(specialistes);
  const aliment = nourritures(n, x)[0] ?? '';
  const { answer, traps: tr } = saisie(variantes(aliment), [
    [x, 'C’est l’animal lui-même : on demande sa nourriture.'],
    ...mange(n, x)
      .slice(0, 1)
      .map((m) => [m, `${maj(m)} mange ${x} : ce n’est pas sa nourriture.`] as const),
  ]);
  return {
    prompt: `Dans ce réseau, quelle est la seule nourriture de ${x} ? Écris-la.`,
    figure: enDocument(n, 'Réseau alimentaire (exemple inventé)'),
    answer,
    traps: tr,
    hint: 'Cherche la seule flèche qui arrive vers cet animal.',
    steps: ['On regarde les flèches qui arrivent vers cet animal.', `La seule nourriture de ${x} est **${aliment}**.`],
    targetSeconds: 60,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const n = rng.pick(RESEAUX);
  const figure = enDocument(n, 'Enquête sur un réseau (exemple inventé)');
  const t = rng.int(0, 2);
  if (t === 0) {
    const proie = rng.pick([...new Set(liens(n).map((l) => l[0]))].filter((p) => mange(n, p).length > 1));
    const total = mange(n, proie).length;
    const fleche = liens(n).length;
    return {
      prompt: `Lis le réseau. Combien d’êtres vivants mangent ${proie} ?`,
      figure,
      answer: num(total),
      traps: traps(r(total), [
        [nourritures(n, proie).length, 'Tu as compté ce que cet être mange. Compte ceux qui le mangent.'],
        [fleche, 'Tu as compté toutes les flèches. Ne garde que celles qui partent de cet être.'],
      ]),
      hint: 'Compte les flèches qui partent de lui.',
      steps: [`On cherche les flèches qui partent de : ${proie}.`, `Il y en a **${total}**.`],
      targetSeconds: 60,
    };
  }
  const cibles = animaux(n).filter(
    (x) => mange(n, x).length > 0 && mange(n, x).every((y) => nourritures(n, y).length === 1),
  );
  const disparu = rng.pick(cibles);
  const victimes = mange(n, disparu);
  const victime = rng.pick(victimes);
  if (t === 1) {
    const { answer, traps: tr } = saisie(
      [...new Set(victimes.flatMap(variantes))],
      [
        [disparu, 'C’est l’animal qui a disparu : cherche qui le mangeait.'],
        ...nourritures(n, disparu).map(
          (x) => [x, 'C’est la nourriture du disparu : elle sera moins mangée, elle ne perd pas son repas.'] as const,
        ),
      ],
    );
    return {
      prompt: `Imagine que ${disparu} disparaît de ce réseau. Quel animal perd sa seule nourriture ? Écris-le.`,
      figure,
      answer,
      traps: tr,
      hint: 'Cherche une flèche qui part du disparu.',
      steps: [`On regarde qui mange ${disparu}.`, `Sans autre nourriture ici : **${victimes.join(' et ')}**.`],
      targetSeconds: 60,
    };
  }
  const bon = `${maj(victime)} n’a plus de nourriture dans ce réseau`;
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: `Rien ne change pour les autres êtres vivants`,
      why: 'Les êtres vivants d’un réseau dépendent les uns des autres.',
    },
    {
      label: `${maj(victime)} garde exactement la même nourriture qu’avant`,
      why: 'Sa nourriture dans ce réseau vient justement de disparaître.',
    },
    {
      label: `Tous les végétaux disparaissent aussitôt`,
      why: 'Le disparu mange d’autres êtres : les végétaux ne dépendent pas de lui pour exister.',
    },
  ]);
  return {
    prompt: `Imagine que ${disparu} disparaît. Quelle conséquence lis-tu dans le réseau ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Regarde les flèches qui partent du disparu.',
    steps: [`${maj(victime)} se nourrit seulement de ${disparu} ici.`, `Conséquence : **${bon}**.`],
    targetSeconds: 70,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const chainesAlimentaires: Skill = {
  id: 'vcm2-chaines-alimentaires',
  title: 'Les chaînes et réseaux alimentaires',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **chaîne alimentaire** montre qui est mangé par qui : herbe → sauterelle → grenouille. Elle commence par un **végétal**.',
      'Plusieurs chaînes reliées forment un **réseau alimentaire**. Si un être vivant disparaît, d’autres peuvent manquer de nourriture !',
    ],
    source: `${PROGRAMME} : « Représenter les liens alimentaires entre les êtres vivants par des chaînes formant un réseau » ; « Repérer la place singulière des végétaux positionnés à la base des réseaux alimentaires ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
