import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { notion, ordre, qcm, saisie } from './outils.ts';

// ——— Tester un programme : résultat attendu, résultat obtenu, écart, protocole, mise au point ———

interface Banc {
  readonly objet: string;
  readonly grandeur: string;
  readonly unite: string;
  /** Seuil demandé par le besoin : l'action a lieu si la mesure est strictement supérieure. */
  readonly seuils: readonly number[];
  readonly marche: string;
  readonly arret: string;
}

const BANCS: readonly Banc[] = [
  {
    objet: 'un ventilateur automatique',
    grandeur: 'température',
    unite: '°C',
    seuils: [22, 25, 28],
    marche: 'le ventilateur tourne',
    arret: 'le ventilateur est arrêté',
  },
  {
    objet: 'une pompe de cuve',
    grandeur: 'hauteur d’eau',
    unite: 'cm',
    seuils: [30, 40, 50],
    marche: 'la pompe fonctionne',
    arret: 'la pompe est arrêtée',
  },
  {
    objet: 'une alarme de bruit',
    grandeur: 'valeur du niveau sonore',
    unite: 'dB',
    seuils: [60, 70, 80],
    marche: 'le voyant est allumé',
    arret: 'le voyant est éteint',
  },
];

const besoinDe = (b: Banc, seuil: number) =>
  `Besoin : pour ${b.objet}, si la ${b.grandeur} est supérieure à ${seuil} ${b.unite}, ${b.marche} ; sinon, ${b.arret}.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(BANCS);
  if (rng.int(0, 1) === 0) {
    const bonne = 'vérifier que ce qu’il fait correspond à ce qui est attendu';
    return {
      prompt: `On vient d’écrire le programme d’${b.objet}. Que signifie le tester ?`,
      ...qcm(rng, bonne, [
        { label: 'changer la couleur du boîtier', why: 'La couleur du boîtier ne vérifie pas le programme.' },
        {
          label: 'recopier le programme une deuxième fois',
          why: 'Une copie fait exactement la même chose : rien n’est vérifié.',
        },
      ]),
      hint: 'Tester, c’est comparer deux choses.',
      steps: [
        'On exécute le programme et on compare le résultat obtenu au résultat attendu.',
        `La réponse est **${bonne}**.`,
      ],
      targetSeconds: 25,
    };
  }
  const bonne = 'le résultat attendu';
  return {
    prompt: `${besoinDe(b, rng.pick(b.seuils))} Avant l’essai, on note ce que le système devrait faire d’après le besoin. Comment l’appelle-t-on ?`,
    ...qcm(rng, bonne, [
      { label: 'le résultat obtenu', why: 'Le résultat obtenu est ce que l’on observe pendant l’essai.' },
      { label: 'le matériau', why: 'Un matériau est la matière d’une pièce : cela ne concerne pas l’essai.' },
    ]),
    hint: 'On ne l’a pas encore observé : on le prévoit.',
    steps: ['Ce que l’on prévoit d’après le besoin est comparé ensuite à l’observation.', `C’est **${bonne}**.`],
    targetSeconds: 30,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(BANCS);
  const seuil = rng.pick(b.seuils);
  const dessus = rng.int(0, 1) === 0;
  const mesure = dessus ? seuil + rng.int(2, 6) : seuil - rng.int(2, 6);
  const conforme = rng.int(0, 1) === 0;
  const attendu = dessus ? b.marche : b.arret;
  const obtenu = conforme ? attendu : dessus ? b.arret : b.marche;
  const bonne = conforme
    ? 'le résultat est conforme : cet essai ne montre pas d’écart'
    : 'il y a un écart : le résultat obtenu n’est pas celui attendu';
  return {
    prompt: `${besoinDe(b, seuil)} Essai à ${mesure} ${b.unite} : on observe que ${obtenu}. Que conclure ?`,
    ...qcm(rng, bonne, [
      {
        label: conforme
          ? 'il y a un écart : le résultat obtenu n’est pas celui attendu'
          : 'le résultat est conforme : cet essai ne montre pas d’écart',
        why: `Pour ${mesure} ${b.unite}, le résultat attendu est : « ${attendu} ». Compare avec l’observation.`,
      },
      {
        label: 'on ne peut rien comparer, car le besoin ne prévoit rien dans ce cas',
        why: 'Le besoin dit quoi faire au-dessus du seuil et dans tous les autres cas.',
      },
      {
        label: 'le programme est prouvé juste pour toutes les valeurs',
        why: 'Un seul essai ne vérifie qu’une situation.',
      },
    ]),
    hint: 'Commence par trouver ce que le besoin prévoit pour cette valeur.',
    steps: [
      `Pour ${mesure} ${b.unite}, le résultat attendu est : « ${attendu} ».`,
      `Le résultat obtenu est : « ${obtenu} ».`,
      `Conclusion : **${bonne}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(BANCS);
  if (rng.int(0, 2) === 0) {
    return {
      prompt: `Pendant le test d’${b.objet}, le résultat obtenu est différent du résultat attendu. Comment appelle-t-on cette différence ? (un mot)`,
      ...saisie(
        ['écart', 'un écart', 'l’écart', 'ecart', 'un ecart'],
        [
          ['protocole', 'Le protocole prévoit les essais à faire : ce n’est pas une différence.'],
          ['besoin', 'Le besoin dit ce que le système doit faire.'],
        ],
      ),
      hint: 'Le mot commence par la lettre « é ».',
      steps: ['On compare le résultat obtenu au résultat attendu.', 'Une différence est un **écart**.'],
      targetSeconds: 30,
    };
  }
  const suite = [
    'exécuter le programme dans la situation à essayer',
    'relever le résultat obtenu',
    'comparer avec le résultat attendu et constater un écart',
    'modifier le programme pour corriger cet écart',
    'refaire le même essai avec le programme modifié',
  ];
  return {
    prompt: `Pour ${b.objet}, le résultat attendu est déjà écrit. Range les étapes de la mise au point dans l’ordre.`,
    answer: ordre(rng, suite),
    hint: 'On ne corrige qu’après avoir constaté un problème, et on vérifie la correction à la fin.',
    steps: [
      'La mise au point enchaîne essai, comparaison, correction et nouvel essai.',
      `L’ordre est : **${suite.join(' → ')}**.`,
    ],
    targetSeconds: 60,
  };
};

const programmeSeuil = (b: Banc, seuil: number, comparaison: '>' | '≥' = '>') => [
  'répéter indéfiniment',
  `    si ${b.grandeur} ${comparaison} ${seuil} ${b.unite} alors`,
  `        ordre : ${b.marche}`,
  '    sinon',
  `        ordre : ${b.arret}`,
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(BANCS);
  const seuil = rng.pick(b.seuils);
  const faux = seuil + rng.pick([4, 5, 6]);
  const figure = { kind: 'document' as const, title: 'Programme à tester', lines: programmeSeuil(b, faux) };
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `${besoinDe(b, seuil)} Le programme ne répond pas au besoin. Quelle valeur du seuil faut-il écrire, en ${b.unite} ? (nombre seul)`,
      figure,
      ...saisie(
        [String(seuil), `${seuil} ${b.unite}`],
        [
          [String(faux), 'C’est la valeur actuelle du programme, qui ne respecte pas le besoin.'],
          [String(faux - seuil), 'C’est la différence entre les deux seuils, pas le nouveau seuil.'],
        ],
      ),
      hint: 'Compare le nombre du besoin et celui du programme.',
      steps: [
        `Le besoin fixe le seuil à ${seuil} ${b.unite} ; le programme utilise ${faux} ${b.unite}.`,
        `Il faut modifier ce paramètre : **${seuil}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const revele = seuil + rng.int(1, 3);
  const essais = [seuil - rng.int(2, 6), revele, faux + rng.int(2, 6)];
  const bonne = `${revele} ${b.unite}`;
  return {
    prompt: `${besoinDe(b, seuil)} Parmi ces valeurs d’essai, laquelle fait apparaître l’erreur du programme ?`,
    figure,
    ...qcm(
      rng,
      bonne,
      essais
        .filter((v) => v !== revele)
        .map((v) => ({
          label: `${v} ${b.unite}`,
          why: `À ${v} ${b.unite}, le programme fait la même chose que ce que demande le besoin.`,
        })),
    ),
    hint: 'Cherche une valeur située entre le seuil demandé et le seuil écrit dans le programme.',
    steps: [
      `Le besoin déclenche l’action au-dessus de ${seuil}, le programme seulement au-dessus de ${faux}.`,
      `Les comportements diffèrent entre les deux : la réponse est **${bonne}**.`,
    ],
    targetSeconds: 60,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(BANCS);
  const seuil = rng.pick(b.seuils);
  // Le besoin inclut la valeur du seuil ; le programme l'exclut : seul l'essai à la limite le montre.
  const essais = rng.shuffle([seuil - 5, seuil, seuil + 5]);
  const etat = (action: boolean) => (action ? b.marche : b.arret);
  const lines = [
    `Besoin : à partir de ${seuil} ${b.unite} (${seuil} compris), ${b.marche} ; en dessous, ${b.arret}.`,
    ...programmeSeuil(b, seuil),
    ...essais.map((v, i) => `Essai ${i + 1} : mesure ${v} ${b.unite} → obtenu : ${etat(v > seuil)}.`),
  ];
  const figure = { kind: 'document' as const, title: `Dossier de test : ${b.objet}`, lines };
  if (rng.int(0, 1) === 0) {
    const rang = essais.indexOf(seuil) + 1;
    const bonne = `l’essai ${rang}`;
    return {
      prompt: `Compare chaque essai au besoin (seuil de ${seuil} ${b.unite}). Quel essai montre un écart ?`,
      figure,
      ...qcm(
        rng,
        bonne,
        [1, 2, 3]
          .filter((i) => i !== rang)
          .map((i) => ({
            label: `l’essai ${i}`,
            why: `Dans l’essai ${i}, le résultat obtenu est celui que demande le besoin.`,
          })),
      ),
      hint: 'Que demande le besoin quand la mesure est exactement égale au seuil ?',
      steps: [
        `À ${seuil} ${b.unite}, le résultat attendu est : « ${b.marche} ».`,
        `Le programme compare avec « > » : à ${seuil} exactement, la condition est fausse.`,
        `La réponse est **${bonne}**.`,
      ],
      targetSeconds: 75,
    };
  }
  const bonne = `remplacer la condition par « ${b.grandeur} ≥ ${seuil} ${b.unite} »`;
  return {
    prompt: `Les essais montrent un écart à la limite de ${seuil} ${b.unite}. Quelle modification rend le programme conforme au besoin ?`,
    figure,
    ...qcm(rng, bonne, [
      {
        label: `remplacer la condition par « ${b.grandeur} > ${seuil + 1} ${b.unite} »`,
        why: `Avec ce seuil, à ${seuil} ${b.unite} la condition reste fausse.`,
      },
      {
        label: `remplacer la condition par « ${b.grandeur} < ${seuil} ${b.unite} »`,
        why: 'La condition serait inversée : l’action aurait lieu en dessous du seuil.',
      },
      { label: 'supprimer l’essai qui pose problème', why: 'Cacher l’essai ne corrige pas le programme.' },
    ]),
    hint: '« À partir de » inclut la valeur elle-même.',
    steps: [
      `Le besoin inclut la valeur ${seuil}.`,
      'Le signe « ≥ » signifie « supérieur ou égal à ».',
      `Il faut **${bonne}**, puis refaire les essais.`,
    ],
    targetSeconds: 70,
  };
};

export const testsProgramme = notion(
  {
    id: 't5-tester-programme',
    title: 'Tester un programme',
    memo: [
      'Un **test** compare le résultat obtenu au résultat attendu d’après le besoin. Une différence est un **écart** : on modifie le programme, puis on refait les essais. Un **protocole** prévoit les essais et les mesures à faire.',
      'Exemple : si la lampe doit s’allumer à partir de 18 h, essaie avant 18 h, à 18 h pile et après 18 h.',
    ],
    attendu: 'Analyser un programme simple fourni et tester s’il répond au besoin ou au problème posé',
    sources: [],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
