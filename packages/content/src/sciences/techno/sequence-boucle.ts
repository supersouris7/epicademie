import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, maj, notion, qcm, saisie } from './outils.ts';

// ——— Séquence d'instructions, événement déclencheur, instruction conditionnelle, boucle, paramètres ———

type Mot = 'une séquence' | 'une boucle' | 'un événement' | 'une instruction conditionnelle';

const MOTS: Record<Mot, { sens: string; exemples: readonly string[] }> = {
  'une séquence': {
    sens: 'une suite d’instructions exécutées l’une après l’autre, dans l’ordre',
    exemples: [
      'allumer la DEL, puis émettre un bip, puis éteindre la DEL',
      'avancer, puis tourner à droite, puis s’arrêter',
    ],
  },
  'une boucle': {
    sens: 'des instructions que le programme répète',
    exemples: ['répéter 4 fois : avancer, puis tourner', 'répéter 10 fois : faire clignoter la DEL'],
  },
  'un événement': {
    sens: 'quelque chose qui se produit et peut déclencher des instructions',
    exemples: ['l’appui sur le bouton « marche »', 'la réception d’un message radio'],
  },
  'une instruction conditionnelle': {
    sens: 'des instructions exécutées seulement si une condition est vraie',
    exemples: [
      'si la température dépasse 30 °C, alors ouvrir la fenêtre',
      'si un obstacle est proche, alors s’arrêter',
    ],
  },
};
const TOUS = Object.keys(MOTS) as Mot[];

const niveau1 = (rng: Rng): QuestionDraft => {
  const trois: readonly Mot[] = ['une séquence', 'une boucle', 'un événement'];
  const mot = rng.pick(trois);
  const bonne = MOTS[mot].sens;
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `En programmation, quel mot désigne ${bonne} ?`,
      ...qcm(
        rng,
        mot,
        trois.filter((m) => m !== mot).map((m) => ({ label: m, why: `${maj(m)} désigne ${MOTS[m].sens}.` })),
      ),
      hint: 'Pense au sens de chacun de ces mots dans la vie de tous les jours.',
      steps: ['On cherche le mot qui correspond à cette définition.', `La réponse est **${mot}**.`],
      targetSeconds: 25,
    };
  }
  return {
    prompt: `En programmation, qu’est-ce qu’${mot} ?`,
    ...qcm(
      rng,
      bonne,
      trois.filter((m) => m !== mot).map((m) => ({ label: MOTS[m].sens, why: `C’est la définition d’${m}.` })),
    ),
    hint: 'Pense au sens de ce mot dans la vie de tous les jours.',
    steps: [`On cherche le sens du mot en programmation.`, `La réponse est **${bonne}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const mot = rng.pick(TOUS);
  const exemple = rng.pick(MOTS[mot].exemples);
  return {
    prompt: `Dans un programme, on lit : « ${exemple} ». Comment appelle-t-on cet élément ?`,
    ...qcm(
      rng,
      mot,
      TOUS.filter((m) => m !== mot).map((m) => ({ label: m, why: `${maj(m)} désigne ${MOTS[m].sens}.` })),
    ),
    hint: 'Repère les mots « répéter », « si », « puis », ou un fait qui se produit.',
    steps: [`Cet élément correspond à : ${MOTS[mot].sens}.`, `La réponse est **${mot}**.`],
    targetSeconds: 35,
  };
};

const nombre = (n: number, unite: string, erreurs: readonly (readonly [number, string])[]) =>
  saisie(
    [String(n), `${n} ${unite}`],
    // Deux erreurs peuvent donner le même nombre : une seule explication est gardée (la première).
    erreurs
      .filter(([v], i) => v !== n && erreurs.findIndex(([w]) => w === v) === i)
      .map(([v, why]) => [String(v), why] as const),
  );

const niveau3 = (rng: Rng): QuestionDraft => {
  const n = rng.int(3, 9);
  const d = rng.pick([10, 15, 20, 25]);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Un robot exécute ce programme : répéter ${n} fois « avancer de ${d} cm ». Quelle distance parcourt-il, en cm ? (nombre seul)`,
      ...nombre(n * d, 'cm', [
        [d, 'C’est la distance d’un seul passage : la boucle est répétée plusieurs fois.'],
        [n + d, 'Il ne faut pas ajouter le nombre de répétitions à la distance : il faut multiplier.'],
        [(n - 1) * d, 'Il manque un passage dans la boucle.'],
      ]),
      hint: 'Combien de fois l’instruction est-elle exécutée ?',
      steps: [`L’instruction est exécutée ${n} fois.`, `${n} × ${d} = ${n * d}.`, `La réponse est **${n * d}** cm.`],
      targetSeconds: 40,
    };
  }
  const bips = rng.int(2, 3);
  return {
    prompt: `Un programme contient : répéter ${n} fois « émettre ${bips} bips ». Combien de bips entend-on en tout ?`,
    ...nombre(n * bips, 'bips', [
      [bips, 'C’est le nombre de bips d’un seul passage dans la boucle.'],
      [n, 'C’est le nombre de passages : chaque passage émet plusieurs bips.'],
      [n + bips, 'Il faut multiplier le nombre de passages par le nombre de bips, pas les ajouter.'],
    ]),
    hint: 'Compte les bips d’un passage, puis le nombre de passages.',
    steps: [
      `À chaque passage : ${bips} bips ; il y a ${n} passages.`,
      `${n} × ${bips} = ${n * bips}.`,
      `La réponse est **${n * bips}**.`,
    ],
    targetSeconds: 40,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const n = rng.int(3, 8);
  const d = rng.pick([5, 10, 15, 20]);
  const avant = rng.pick([30, 40, 50]);
  const sorte = rng.int(0, 2);
  const lines = [
    'quand le bouton « départ » est appuyé',
    `    avancer de ${avant} cm`,
    `    répéter ${n} fois`,
    `        avancer de ${d} cm`,
    '        émettre un bip',
    '    allumer le voyant',
  ];
  const figure = { kind: 'document' as const, title: 'Programme du robot', lines };
  if (sorte === 0) {
    const total = avant + n * d;
    return {
      prompt: `On appuie une fois sur « départ ». Quelle distance totale le robot parcourt-il, en cm ?`,
      figure,
      ...nombre(total, 'cm', [
        [n * d, 'Tu as oublié l’instruction placée avant la boucle.'],
        [n * (avant + d), 'La première instruction est avant la boucle : elle n’est pas répétée.'],
        [avant + d, 'La boucle est exécutée plusieurs fois.'],
      ]),
      hint: 'Les lignes décalées sous « répéter » sont les seules à être répétées.',
      steps: [
        `Avant la boucle : ${avant} cm, une seule fois.`,
        `Dans la boucle : ${n} × ${d} = ${n * d} cm.`,
        `Au total : **${total}** cm.`,
      ],
      targetSeconds: 60,
    };
  }
  if (sorte === 1) {
    const m = n + rng.int(2, 4);
    const total = avant + m * d;
    return {
      prompt: `On modifie un seul paramètre : « répéter ${n} fois » devient « répéter ${m} fois ». Quelle distance totale le robot parcourt-il alors, en cm ?`,
      figure,
      ...nombre(total, 'cm', [
        [avant + n * d, 'C’est la distance avant la modification.'],
        [m * d, 'Tu as oublié l’instruction placée avant la boucle.'],
        [avant + (m - n) * d, 'Tu n’as compté que les passages ajoutés.'],
      ]),
      hint: 'Recalcule la boucle avec le nouveau nombre de passages, sans oublier le début.',
      steps: [
        `Dans la boucle : ${m} × ${d} = ${m * d} cm.`,
        `On ajoute les ${avant} cm du début.`,
        `La réponse est **${total}** cm.`,
      ],
      targetSeconds: 60,
    };
  }
  const paires: readonly (readonly [string, string])[] = [
    ['« quand le bouton « départ » est appuyé »', 'l’événement qui déclenche le programme'],
    [`« répéter ${n} fois »`, 'le début de la boucle'],
    [`« avancer de ${avant} cm »`, 'une instruction exécutée une fois, avant la boucle'],
    ['« émettre un bip »', 'une instruction répétée à chaque passage'],
    ['« allumer le voyant »', 'une instruction exécutée une fois, après la boucle'],
  ];
  return {
    prompt: `Associe chaque ligne du programme à son rôle (boucle de ${n} passages, départ de ${avant} cm).`,
    figure,
    answer: association(rng, paires),
    hint: 'Observe le décalage des lignes : il montre ce qui est dans la boucle.',
    steps: [
      'Le décalage montre quelles instructions appartiennent à la boucle.',
      `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
    ],
    targetSeconds: 80,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const n = rng.int(3, 6);
  const appuis = rng.int(2, 4);
  const sorte = rng.int(0, 2);
  const figure = {
    kind: 'document' as const,
    title: 'Programme de la sonnette lumineuse',
    lines: [
      'quand le bouton est appuyé',
      '    émettre un bip',
      `    répéter ${n} fois`,
      '        allumer la DEL',
      '        attendre 1 s',
      '        éteindre la DEL',
      '        attendre 1 s',
    ],
  };
  if (sorte === 0) {
    const total = n * appuis;
    return {
      prompt: `Un visiteur appuie ${appuis} fois, en attendant à chaque fois la fin du programme. Combien de fois la DEL s’allume-t-elle en tout ?`,
      figure,
      ...nombre(total, 'fois', [
        [n, 'C’est pour un seul appui : l’événement se produit plusieurs fois.'],
        [appuis, 'À chaque appui, la boucle allume la DEL plusieurs fois.'],
        [n + appuis, 'Il faut multiplier les passages par le nombre d’appuis.'],
      ]),
      hint: 'Que se passe-t-il pour un seul appui ? Puis combien d’appuis y a-t-il ?',
      steps: [
        `Un appui déclenche la boucle : la DEL s’allume ${n} fois.`,
        `${appuis} × ${n} = ${total}.`,
        `La réponse est **${total}**.`,
      ],
      targetSeconds: 55,
    };
  }
  if (sorte === 1) {
    const duree = 2 * n;
    return {
      prompt:
        'Les instructions autres que « attendre » sont quasi instantanées. Après un appui, combien de secondes dure environ le programme ? (nombre seul)',
      figure,
      ...nombre(duree, 's', [
        [n, 'Chaque passage contient deux attentes d’une seconde.'],
        [2, 'C’est la durée d’un seul passage dans la boucle.'],
        [duree + n, 'Seules les instructions « attendre » durent une seconde.'],
      ]),
      hint: 'Additionne les attentes d’un passage, puis tiens compte de la boucle.',
      steps: [
        'Un passage contient 1 s + 1 s = 2 s d’attente.',
        `Il y a ${n} passages : ${n} × 2 = ${duree}.`,
        `La réponse est **${duree}** s.`,
      ],
      targetSeconds: 60,
    };
  }
  const bonne = 'déplacer « émettre un bip » à l’intérieur de la boucle';
  return {
    prompt: `Nouveau besoin : à chaque appui, on veut entendre un bip à chacun des ${n} clignotements. Quelle modification répond à ce besoin ?`,
    figure,
    ...qcm(rng, bonne, [
      {
        label: 'placer « émettre un bip » après la boucle, hors de celle-ci',
        why: 'Hors de la boucle, le bip n’est émis qu’une fois par appui.',
      },
      {
        label: `remplacer « répéter ${n} fois » par « répéter ${n + 1} fois »`,
        why: 'Le nombre de clignotements change, mais il n’y a toujours qu’un bip.',
      },
      {
        label: 'remplacer les deux « attendre 1 s » par « attendre 2 s »',
        why: 'Seule la durée change : le nombre de bips reste le même.',
      },
    ]),
    hint: 'Où doit se trouver une instruction pour être répétée ?',
    steps: [
      'Seules les instructions placées dans la boucle sont répétées.',
      'Le bip doit être répété autant de fois que la DEL clignote.',
      `Il faut **${bonne}**.`,
    ],
    targetSeconds: 65,
  };
};

export const sequenceBoucle = notion(
  {
    id: 't5-sequence-boucle',
    title: 'Séquence, événement et boucle',
    memo: [
      'Une **séquence** est une suite d’instructions exécutées dans l’ordre. Un **événement** (appui sur un bouton) peut la déclencher. Une **boucle** répète des instructions ; une **instruction conditionnelle** les exécute seulement si une condition est vraie.',
      'Changer un **paramètre** change le résultat : « répéter 3 fois : avancer de 10 cm » fait 30 cm ; avec 5 fois, 50 cm.',
    ],
    attendu: 'Modifier les paramètres d’un programme et identifier ou évaluer ses effets en termes de fonctionnalité',
    sources: ['academie-sequence', 'academie-boucle'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
