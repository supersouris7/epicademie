import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-matiere.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Dissolution, saturation et conservation de la masse (6e) ———
// Les solides A, B, C et leurs masses maximales dissoutes sont des données de l'exercice.

const SOLIDES = ['A', 'B', 'C'] as const;

const DISSOUS = 'Le solide s’est dissous en entier';
const INSOLUBLE = 'Le solide ne s’est pas dissous';
const SATUREE = 'La solution est saturée';

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick([
    {
      solide: 'une pincée de sel',
      vu: 'on ne voit plus aucun grain',
      bon: DISSOUS,
      pourquoi: 'Plus aucun grain visible : tout le sel est passé dans l’eau.',
      faux: [
        [INSOLUBLE, 'On ne voit plus le sel : il s’est dissous dans l’eau.'],
        [SATUREE, 'Une solution saturée ne dissout plus tout : ici rien ne reste au fond.'],
      ],
    },
    {
      solide: 'une cuillère de sucre',
      vu: 'on ne voit plus aucun grain',
      bon: DISSOUS,
      pourquoi: 'Plus aucun grain visible : tout le sucre est passé dans l’eau.',
      faux: [
        [INSOLUBLE, 'On ne voit plus le sucre : il s’est dissous dans l’eau.'],
        [SATUREE, 'Une solution saturée ne dissout plus tout : ici rien ne reste au fond.'],
      ],
    },
    {
      solide: 'du sable',
      vu: 'tous les grains retombent au fond',
      bon: INSOLUBLE,
      pourquoi: 'Tous les grains restent visibles au fond : l’eau n’a pas dissous le sable.',
      faux: [
        [DISSOUS, 'Les grains sont toujours visibles : le sable ne s’est pas dissous.'],
        [SATUREE, 'La saturation concerne un solide qui se dissout, jusqu’à une limite : le sable ne se dissout pas.'],
      ],
    },
    {
      solide: 'de plus en plus de sel, cuillère après cuillère,',
      vu: 'les premières cuillères disparaissent, puis les grains restent au fond malgré l’agitation',
      bon: SATUREE,
      pourquoi: 'Le sel se dissout d’abord, puis l’eau ne peut plus en dissoudre davantage : elle est saturée.',
      faux: [
        [DISSOUS, 'Des grains restent au fond : tout le sel ne s’est pas dissous.'],
        [INSOLUBLE, 'Les premières cuillères ont disparu : le sel s’est d’abord dissous.'],
      ],
    },
  ] as const);
  const { answer, traps: t } = choice(
    rng,
    s.bon,
    s.faux.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: `On verse ${s.solide} dans un verre d’eau et on remue : ${s.vu}. Quelle conclusion convient ?`,
    answer,
    traps: t,
    hint: 'Regarde ce qui reste visible : rien, tout le solide, ou seulement une partie ?',
    steps: ['On observe ce qui reste visible après agitation.', s.pourquoi, `**${s.bon}**.`],
    targetSeconds: 25,
  };
};

const MOTS: readonly (readonly [string, string])[] = [
  ['Solvant', 'La substance, souvent liquide, qui dissout'],
  ['Soluté', 'La substance dissoute'],
  ['Solution saturée', 'Elle contient le maximum de substance dissoute'],
  ['Insoluble', 'Qui ne peut pas être dissous'],
  ['Soluble', 'Qui peut se dissoudre dans un solvant'],
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(MOTS).slice(0, 3);
    return {
      prompt: `Associe chaque mot à sa définition : ${trois
        .map(([m]) => m.toLowerCase())
        .sort()
        .join(', ')}.`,
      answer: association(rng, trois),
      hint: trois.some(([m]) => m === 'Insoluble')
        ? 'Le préfixe « in » veut dire « ne pas ».'
        : 'Demande-toi qui dissout, qui est dissous, et ce qui est possible ou non.',
      steps: [
        'Chaque mot désigne une chose précise.',
        `Réponse : **${trois.map(([m, d]) => `${m} → ${d}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const [bon, def] = rng.pick(MOTS);
  const { answer, traps: tr } = choice(
    rng,
    bon,
    rng
      .shuffle(MOTS.filter(([m]) => m !== bon))
      .slice(0, 3)
      .map(([m, d]) => ({ label: m, why: `${m} : ${d.toLowerCase()}.` })),
  );
  return {
    prompt: `Quel mot correspond à cette définition : « ${def.toLowerCase()} » ?`,
    answer,
    traps: tr,
    hint: 'Demande-toi qui dissout, qui est dissous, et ce qui est possible ou non.',
    steps: ['On relie la définition à son mot.', `Réponse : **${bon}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  const eau = rng.int(1, 5) * 100;
  const sel = rng.int(1, 5) * 5;
  if (t === 0) {
    return {
      prompt: `On dissout entièrement ${sel} g de sel dans ${eau} g d’eau. Quelle est la masse de la solution, en g ?`,
      answer: num(eau + sel, 'g'),
      traps: traps(r(eau + sel), [
        [eau, 'Le sel dissous ne se voit plus, mais sa masse compte toujours.'],
        [eau - sel, 'La dissolution ne fait pas perdre de masse.'],
      ]),
      hint: 'La masse totale se conserve lors du mélange.',
      steps: [`Masse totale = eau + sel = ${eau} + ${sel}.`, `La solution a une masse de **${eau + sel} g**.`],
      targetSeconds: 30,
    };
  }
  if (t === 1) {
    return {
      prompt: `Une solution de ${eau + sel} g contient ${eau} g d’eau et du sel entièrement dissous. Quelle est la masse de sel, en g ?`,
      answer: num(sel, 'g'),
      traps: traps(r(sel), [
        [eau + sel, 'C’est la masse de toute la solution.'],
        [eau, 'C’est la masse de l’eau.'],
      ]),
      hint: 'Masse de la solution = masse du solvant + masse du soluté.',
      steps: [`Sel = ${eau + sel} − ${eau}.`, `Il y a **${sel} g** de sel.`],
      targetSeconds: 35,
    };
  }
  return {
    prompt: 'Dans de l’eau salée, complète la phrase.',
    answer: {
      kind: 'cloze',
      parts: ['L’eau est le ', ' et le sel est le ', '.'],
      blanks: [
        { mode: 'text', accepted: ['solvant'] },
        { mode: 'text', accepted: ['soluté', 'solute'] },
      ],
    },
    hint: 'L’un des deux dissout, l’autre est dissous.',
    steps: ['L’eau dissout le sel.', 'Elle est le **solvant** ; le sel est le **soluté**.'],
    targetSeconds: 35,
  };
};

/** Donnée de l'exercice : masse maximale (g) de solide dissoute dans 100 g d'eau, à la même température. */
const tirageSaturation = (rng: Rng) => {
  const nom = rng.pick(SOLIDES);
  const max = rng.int(6, 18) * 2;
  const k = rng.int(2, 5);
  return { nom, max, k, eau: 100 * k };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const { nom, max, k, eau } = tirageSaturation(rng);
  const regle = `Donnée : au maximum ${max} g du solide ${nom} se dissolvent dans 100 g d’eau (même température ; la masse maximale est proportionnelle à la masse d’eau).`;
  const t = rng.int(0, 3);
  if (t === 0) {
    return {
      prompt: `${regle} Quelle masse maximale de ${nom} peut-on dissoudre dans ${eau} g d’eau, en g ?`,
      answer: num(max * k, 'g'),
      traps: traps(r(max * k), [
        [max, 'C’est le maximum pour 100 g d’eau seulement.'],
        [max + eau, 'On n’additionne pas : on utilise la proportionnalité.'],
      ]),
      hint: 'Combien de fois 100 g d’eau y a-t-il ?',
      steps: [`${eau} g = ${k} fois 100 g.`, `${max} × ${k} = **${max * k} g**.`],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    const reste = rng.int(2, 12);
    const verse = max * k + reste;
    return {
      prompt: `${regle} On verse ${verse} g de ${nom} dans ${eau} g d’eau et on remue. Quelle masse de solide reste au fond, en g ?`,
      answer: num(reste, 'g'),
      traps: traps(r(reste), [
        [verse - max, 'Le maximum dépend de la masse d’eau : calcule-le pour toute l’eau.'],
        [max * k, 'C’est la masse dissoute, pas celle qui reste au fond.'],
        [0, 'La solution est saturée : le surplus ne se dissout pas.'],
      ]),
      hint: 'Trouve d’abord la masse maximale qui se dissout dans toute cette eau.',
      steps: [`Maximum dissous : ${max} × ${k} = ${max * k} g.`, `Au fond : ${verse} − ${max * k} = **${reste} g**.`],
      targetSeconds: 75,
    };
  }
  if (t === 2) {
    const trop = rng.int(0, 1) === 0;
    const verse = max * k + (trop ? rng.int(2, 10) : -rng.int(2, 10));
    const bon = trop ? 'oui' : 'non';
    const { answer, traps: tr } = saisie(
      [bon],
      [[trop ? 'non' : 'oui', 'Compare la masse versée au maximum dissous dans toute l’eau (proportionnalité).']],
    );
    return {
      prompt: `${regle} On verse ${verse} g de ${nom} dans ${eau} g d’eau et on remue. Reste-t-il du solide au fond ? Réponds par oui ou non.`,
      answer,
      traps: tr,
      hint: 'Calcule le maximum pour toute l’eau, puis compare.',
      steps: [`Maximum : ${max * k} g ; on en verse ${verse} g.`, `Réponse : **${bon}**.`],
      targetSeconds: 60,
    };
  }
  const solide = max * k + rng.int(2, 12);
  return {
    prompt: `On verse ${solide} g d’un solide dans ${eau} g d’eau : une partie reste au fond. Quelle est la masse totale du mélange (eau, solide dissous et dépôt), en g ?`,
    answer: num(eau + solide, 'g'),
    traps: traps(r(eau + solide), [
      [eau, 'Le solide versé, dissous ou au fond, compte dans la masse.'],
      [eau + max * k, 'Le dépôt au fond fait aussi partie du mélange.'],
    ]),
    hint: 'La masse totale se conserve, que le solide soit dissous ou non.',
    steps: [`Masse totale = ${eau} + ${solide}.`, `**${eau + solide} g**.`],
    targetSeconds: 60,
  };
};

const EVAPORATION: readonly string[] = [
  'Filtrer la solution saturée pour retirer le dépôt',
  'Verser le liquide filtré dans une coupelle',
  'Laisser l’eau s’évaporer',
  'Récupérer le solide qui avait été dissous',
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const { nom, max, k, eau } = tirageSaturation(rng);
  const dose = max / 2;
  const nbDoses = rng.int(3, 5);
  // Doses successives : les deux premières se dissolvent entièrement dans toute l'eau, au-delà il reste un dépôt.
  const lignes = [`On travaille avec ${eau} g d’eau, à température constante.`];
  for (let i = 1; i <= nbDoses; i++) {
    const total = i * dose * k;
    const depot = Math.max(0, total - max * k);
    lignes.push(
      `Après ${i} ajout(s), soit ${total} g de ${nom} : ${depot === 0 ? 'tout est dissous' : 'un dépôt reste au fond'}.`,
    );
  }
  lignes.push(`Quand le dépôt apparaît, la masse maximale dissoute est de ${max * k} g.`);
  const figure = { kind: 'document' as const, title: 'Ajouts successifs (données de l’exercice)', lines: lignes };
  const total = nbDoses * dose * k;
  const depot = total - max * k;
  const t = rng.int(0, 3);
  if (t === 0) {
    return {
      prompt: 'Lis le compte rendu. Quelle masse de solide reste au fond après le dernier ajout, en g ?',
      figure,
      answer: num(depot, 'g'),
      traps: traps(r(depot), [
        [total, 'C’est la masse totale versée : une partie est dissoute.'],
        [max * k, 'C’est la masse dissoute, pas le dépôt.'],
      ]),
      hint: 'Dépôt = masse versée moins masse dissoute au maximum.',
      steps: [`Versé : ${total} g ; dissous : ${max * k} g.`, `Dépôt : ${total} − ${max * k} = **${depot} g**.`],
      targetSeconds: 75,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Lis le compte rendu. Quelle masse affiche la balance (sans le récipient) après le dernier ajout, en g ?',
      figure,
      answer: num(eau + total, 'g'),
      traps: traps(r(eau + total), [
        [eau + max * k, 'Le dépôt fait aussi partie du mélange : il compte.'],
        [eau, 'La masse du solide versé s’ajoute à celle de l’eau.'],
      ]),
      hint: 'Le mélange contient l’eau et tout le solide versé.',
      steps: [`La masse se conserve : ${eau} + ${total}.`, `**${eau + total} g**.`],
      targetSeconds: 75,
    };
  }
  if (t === 2) {
    const bon = `La solution est saturée : elle ne peut plus dissoudre de ${nom} à cette température`;
    const { answer, traps: tr } = choice(rng, bon, [
      { label: `Le solide ${nom} est devenu insoluble`, why: 'Une partie s’est dissoute : le solide reste soluble.' },
      { label: 'Une partie de la masse a disparu', why: 'La masse totale se conserve.' },
    ]);
    return {
      prompt: 'Lis le compte rendu. Comment expliques-tu le dépôt du dernier ajout ?',
      figure,
      answer,
      traps: tr,
      hint: 'Il existe une limite à la quantité de solide qu’une eau peut dissoudre.',
      steps: ['Au-delà du maximum, le solide ajouté ne se dissout plus.', `**${bon}**.`],
      targetSeconds: 60,
    };
  }
  return {
    prompt: `On veut récupérer le solide ${nom} dissous dans la solution saturée. Lis le compte rendu, puis remets les étapes dans l’ordre.`,
    figure,
    answer: ordre(rng, EVAPORATION),
    hint: 'Le dépôt n’était pas dissous : sépare-le avant de t’occuper du solide caché dans le liquide.',
    steps: ['On sépare le dépôt, puis on fait évaporer l’eau.', `Ordre : **${EVAPORATION.map(maj).join(' → ')}**.`],
    targetSeconds: 80,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const dissolutionMatiere: Skill = {
  id: 'p6-dissolution',
  title: 'Dissolution et conservation de la masse',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un solide **soluble** peut se **dissoudre** dans un **solvant** comme l’eau : c’est le **soluté**. La masse totale se conserve : 100 g d’eau + 10 g de sel = 110 g.',
      'Quand le solvant ne peut plus rien dissoudre à cette température, la solution est **saturée** : le surplus reste au fond. On récupère le solide dissous par **évaporation** de l’eau.',
    ],
    ...references('dissoudre', 'conservation', 'saturation', 'soluble', 'insoluble', 'solvant', 'solute', 'saturee'),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
