import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { CYCLE3 } from './donnees.ts';
import { association, formes, maj, notion, qcm, saisie } from './outils.ts';

// ——— Le besoin, les fonctions techniques et les solutions (programme de 5e, acquis du cycle 3 réinvestis) ———

/** Besoins cités par le programme du cycle 3, et deux objets qui y répondent chacun clairement. */
const BESOINS: readonly { besoin: string; objets: readonly string[] }[] = [
  { besoin: 'se déplacer', objets: ['un vélo', 'une trottinette', 'un autobus'] },
  { besoin: 'se chauffer', objets: ['un radiateur', 'un poêle à bois', 'un convecteur électrique'] },
  { besoin: 'communiquer', objets: ['un téléphone', 'un talkie-walkie', 'un interphone'] },
  { besoin: 'se soigner', objets: ['un thermomètre médical', 'un pansement', 'un inhalateur'] },
  { besoin: 's’alimenter', objets: ['un réfrigérateur', 'une casserole', 'un presse-agrumes'] },
  { besoin: 'se loger', objets: ['une tente', 'une maison en bois', 'une yourte'] },
];

interface Solution {
  readonly objet: string;
  readonly solution: string;
  readonly fonction: string;
  /** Autres écritures acceptées du nom. */
  readonly variantes: readonly string[];
}

/** La lampe de bureau est l'exemple du programme ; le vélo l'illustre. */
const SOLUTIONS: readonly Solution[] = [
  {
    objet: 'la lampe de bureau',
    solution: 'l’ampoule',
    fonction: 'éclairer',
    variantes: ['une ampoule', 'led', 'la led', 'une led'],
  },
  {
    objet: 'la lampe de bureau',
    solution: 'l’interrupteur',
    fonction: 'allumer et éteindre',
    variantes: ['un interrupteur', 'bouton', 'le bouton', 'un bouton'],
  },
  {
    objet: 'la lampe de bureau',
    solution: 'le cordon électrique',
    fonction: 'transporter l’énergie électrique',
    variantes: [
      'un cordon électrique',
      'cordon',
      'le cordon',
      'câble',
      'le câble',
      'câble électrique',
      'le câble électrique',
      'fil',
      'le fil',
      'fil électrique',
      'le fil électrique',
    ],
  },
  {
    objet: 'le vélo',
    solution: 'les freins',
    fonction: 'ralentir et arrêter le vélo',
    variantes: ['frein', 'le frein'],
  },
  {
    objet: 'le vélo',
    solution: 'la sonnette',
    fonction: 'avertir les piétons',
    variantes: ['une sonnette', 'avertisseur', 'l’avertisseur'],
  },
  {
    objet: 'le vélo',
    solution: 'la chaîne',
    fonction: 'transmettre le mouvement des pédales à la roue arrière',
    variantes: ['une chaîne', 'chaine', 'la chaine'],
  },
  {
    objet: 'le vélo',
    solution: 'le porte-bagages',
    fonction: 'transporter un sac',
    variantes: [
      'un porte-bagages',
      'porte-bagage',
      'le porte-bagage',
      'porte bagages',
      'le porte bagages',
      'panier',
      'le panier',
    ],
  },
  {
    objet: 'le vélo',
    solution: 'le catadioptre',
    fonction: 'renvoyer la lumière des phares',
    variantes: ['un catadioptre', 'catadioptres', 'les catadioptres', 'réflecteur', 'le réflecteur'],
  },
];

const objetsAvecBesoin = BESOINS.flatMap((b) => b.objets.map((objet) => ({ objet, besoin: b.besoin })));

const pourquoiBesoin = (objet: string, besoin: string) =>
  `${maj(objet)} sert à ${besoin} : c’est le besoin que cet objet vient combler.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const cible = rng.pick(objetsAvecBesoin);
  const autres = rng.shuffle(BESOINS.filter((b) => b.besoin !== cible.besoin)).slice(0, 2);
  return {
    prompt: `À quel besoin répond avant tout ${cible.objet} ?`,
    ...qcm(
      rng,
      cible.besoin,
      autres.map((b) => ({
        label: b.besoin,
        why: `Le besoin « ${b.besoin} » demande plutôt un objet comme ${b.objets[0]}. ${pourquoiBesoin(cible.objet, cible.besoin)}`,
      })),
    ),
    hint: 'Imagine la personne sans cet objet : qu’est-ce qui lui manquerait ?',
    steps: [
      'On cherche le manque que l’objet vient combler, pas ce dont il est fait.',
      pourquoiBesoin(cible.objet, cible.besoin),
      `La bonne réponse est **${cible.besoin}**.`,
    ],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const familles = rng.shuffle(BESOINS).slice(0, 4);
    const [cible, ...autres] = familles as [(typeof BESOINS)[number], ...(typeof BESOINS)[number][]];
    const bon = rng.pick(cible.objets);
    return {
      prompt: `Quel objet répond au besoin « ${cible.besoin} » ?`,
      ...qcm(
        rng,
        bon,
        autres.map((b) => {
          const o = rng.pick(b.objets);
          return { label: o, why: pourquoiBesoin(o, b.besoin) };
        }),
      ),
      hint: 'Pour chaque objet, demande-toi à quoi sert celui qui l’utilise.',
      steps: [
        `On cherche l’objet qui aide à ${cible.besoin}.`,
        pourquoiBesoin(bon, cible.besoin),
        `La bonne réponse est **${bon}**.`,
      ],
      targetSeconds: 25,
    };
  }
  const choisis = rng.shuffle(BESOINS).slice(0, 3);
  const paires = choisis.map((b) => [rng.pick(b.objets), b.besoin] as const);
  return {
    prompt: `Associe chaque objet à son besoin : ${paires.map((p) => p[0]).join(' ; ')}.`,
    answer: association(rng, paires),
    hint: 'Commence par l’objet dont l’usage te semble le plus évident.',
    steps: [
      'Un besoin est un manque ; l’objet y répond.',
      `Réponse : **${paires.map(([o, b]) => `${o} → ${b}`).join(' ; ')}**.`,
    ],
    targetSeconds: 40,
  };
};

type Mot = 'besoin' | 'fonction technique' | 'solution technique';

const ACCEPTE: Record<Mot, readonly string[]> = {
  besoin: [...formes('besoin', 'un'), 'le besoin'],
  'fonction technique': [...formes('fonction technique', 'une'), 'la fonction technique', 'fonction'],
  'solution technique': [
    ...formes('solution technique', 'une'),
    'la solution technique',
    'solution',
    'solution technologique',
  ],
};

const DEFINITION: Record<Mot, string> = {
  besoin: 'Un besoin est un manque ressenti par une personne ou une société.',
  'fonction technique': 'Une fonction technique est un rôle précis que l’objet doit assurer.',
  'solution technique': 'Une solution technique est l’élément choisi pour assurer une fonction.',
};

const MOTS: readonly Mot[] = ['besoin', 'fonction technique', 'solution technique'];

const niveau3 = (rng: Rng): QuestionDraft => {
  const mot = rng.pick(MOTS);
  const s = rng.pick(SOLUTIONS);
  const b = rng.pick(objetsAvecBesoin);
  const scene = {
    besoin: `${maj(b.objet)} permet à quelqu’un de ${b.besoin}. Que désigne « ${b.besoin} » ?`,
    'fonction technique': `Sur ${s.objet}, un élément doit « ${s.fonction} ». Que désigne « ${s.fonction} » ?`,
    'solution technique': `Sur ${s.objet}, on a choisi ${s.solution} pour « ${s.fonction} ». Que désigne « ${s.solution} » ?`,
  }[mot];
  const { answer, traps } = saisie(
    ACCEPTE[mot],
    MOTS.filter((m) => m !== mot).map(
      (m) => [m, `${DEFINITION[m]} Ici, ce n’est pas le cas. ${DEFINITION[mot]}`] as const,
    ),
  );
  return {
    prompt: `${scene} Écris : besoin, fonction technique ou solution technique.`,
    answer,
    traps,
    hint: 'Pose-toi trois questions : pourquoi l’objet existe, ce qu’il doit faire, avec quoi il le fait.',
    steps: [
      'On distingue le « pourquoi » (besoin), le « quoi faire » (fonction) et le « avec quoi » (solution).',
      DEFINITION[mot],
      `La bonne réponse est **${mot}**.`,
    ],
    targetSeconds: 35,
  };
};

const ligne = (s: Solution) => `${s.solution} (${s.objet})`;

/** « sert » ou « servent », selon le nombre de la solution. */
const role = (s: Solution) => `${s.solution} ${s.solution.startsWith('les ') ? 'servent' : 'sert'} à ${s.fonction}`;

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const choisies = rng.shuffle(SOLUTIONS).slice(0, 5);
    const paires = choisies.map((s) => [ligne(s), s.fonction] as const);
    return {
      prompt: `Associe chaque solution technique à sa fonction technique : ${choisies.map(ligne).join(' ; ')}.`,
      answer: association(rng, paires),
      hint: 'Pour chaque élément, imagine ce qui ne marcherait plus s’il disparaissait.',
      steps: [
        'Chaque élément assure un rôle précis dans l’objet.',
        `Réponse : **${paires.map(([a, f]) => `${a} → ${f}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const s = rng.pick(SOLUTIONS);
  const memeObjet = SOLUTIONS.filter((x) => x.objet === s.objet && x !== s);
  const nom = s.solution.replace(/^(l’|le |la |les )/, '');
  const { answer, traps } = saisie(
    [s.solution, nom, ...s.variantes],
    memeObjet.map(
      (x) => [x.solution.replace(/^(l’|le |la |les )/, ''), `${maj(role(x))}, pas à ${s.fonction}.`] as const,
    ),
  );
  return {
    prompt: `Sur ${s.objet}, quel élément assure la fonction technique « ${s.fonction} » ? Écris son nom.`,
    answer,
    traps,
    hint: 'Passe en revue les éléments de l’objet et leur rôle, un par un.',
    steps: [
      `On cherche la solution technique qui réalise la fonction « ${s.fonction} ».`,
      `Les autres éléments ont un autre rôle : ${memeObjet.map(role).join(' ; ')}.`,
      `La réponse est **${s.solution}**.`,
    ],
    targetSeconds: 45,
  };
};

interface Proposition {
  readonly texte: string;
  /** Absent : la proposition répond au besoin. */
  readonly why?: string;
}

/** Choisir un objet parmi plusieurs propositions pour répondre à un besoin : une seule convient. */
const SITUATIONS: readonly { besoin: string; propositions: readonly Proposition[] }[] = [
  {
    besoin:
      'Pour une randonnée de nuit, une élève veut éclairer son chemin, sans prise de courant et en gardant les deux mains libres.',
    propositions: [
      { texte: 'une lampe frontale à piles' },
      {
        texte: 'une lampe de bureau branchée sur une prise',
        why: 'Elle a besoin d’une prise de courant : impossible en randonnée.',
      },
      { texte: 'une lampe torche tenue à la main', why: 'Elle occupe une main : les mains ne sont pas libres.' },
      {
        texte: 'un miroir porté autour du cou',
        why: 'Un miroir ne produit pas de lumière : il n’éclaire pas dans la nuit.',
      },
    ],
  },
  {
    besoin: 'Un élève veut garder sa boisson fraîche pendant une sortie d’une journée, sans électricité.',
    propositions: [
      { texte: 'une gourde isotherme' },
      { texte: 'un réfrigérateur de cuisine', why: 'Il demande de l’électricité et ne s’emporte pas en sortie.' },
      {
        texte: 'une casserole sans couvercle',
        why: 'Elle n’isole pas la boisson et ne la protège pas pendant le transport.',
      },
      { texte: 'un sac en filet ajouré', why: 'Il laisse passer l’air chaud : il ne garde pas la fraîcheur.' },
    ],
  },
  {
    besoin: 'Une famille veut être avertie à distance, sur un téléphone, quand quelqu’un sonne à sa porte.',
    propositions: [
      { texte: 'une sonnette connectée reliée à un téléphone' },
      {
        texte: 'une sonnette mécanique à clochette',
        why: 'Le son reste à la porte : aucun message n’est envoyé à distance.',
      },
      { texte: 'un paillasson portant le mot « Bienvenue »', why: 'Il n’informe personne quand quelqu’un sonne.' },
      { texte: 'une boîte aux lettres à clé', why: 'Elle reçoit du courrier, mais ne signale pas qu’on sonne.' },
    ],
  },
  {
    besoin:
      'Un cycliste veut transporter un sac lourd sur le trajet du collège, en gardant les deux mains sur le guidon.',
    propositions: [
      { texte: 'un porte-bagages avec une sangle' },
      {
        texte: 'un sac tenu dans une main',
        why: 'Il faut lâcher le guidon d’une main : ce n’est pas permis par la demande.',
      },
      { texte: 'une sonnette plus puissante', why: 'Une sonnette avertit : elle ne transporte rien.' },
      { texte: 'un catadioptre supplémentaire', why: 'Un catadioptre rend visible, il ne transporte rien.' },
    ],
  },
  {
    besoin: 'Au camping, sans prise électrique, une personne veut faire chauffer de l’eau pour préparer une boisson.',
    propositions: [
      { texte: 'un réchaud à gaz avec une casserole' },
      { texte: 'une bouilloire électrique', why: 'Elle a besoin d’une prise électrique, absente au camping.' },
      { texte: 'une gourde isotherme vide', why: 'Elle conserve la température, mais ne chauffe pas l’eau.' },
      { texte: 'un thermomètre de cuisine', why: 'Il mesure la température, il ne la fait pas monter.' },
    ],
  },
];

const LETTRES = ['A', 'B', 'C', 'D'];

const niveau5 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick(SITUATIONS);
  const ordre = rng.shuffle(cas.propositions);
  const bonne = ordre.findIndex((p) => p.why === undefined);
  const labels = ordre.map((_, i) => `Proposition ${LETTRES[i]}`);
  return {
    prompt: `Lis le besoin et choisis l’objet qui y répond. ${cas.besoin}`,
    figure: {
      kind: 'document',
      title: 'Propositions',
      lines: ordre.map((p, i) => `${labels[i]} : ${p.texte}.`),
    },
    answer: { kind: 'choice', options: labels, correct: bonne },
    traps: ordre.flatMap((p, i) => (p.why ? [{ option: i, why: p.why }] : [])),
    hint: 'Note chaque condition du besoin, puis vérifie-les une à une pour chaque proposition.',
    steps: [
      'On liste les conditions écrites dans le besoin.',
      'Une proposition convient seulement si elle les respecte toutes.',
      `La réponse est **${labels[bonne]}** : ${ordre[bonne]?.texte ?? ''}.`,
    ],
    targetSeconds: 70,
  };
};

export const besoin = notion(
  {
    id: 't5-besoin',
    title: 'Le besoin et les fonctions d’un objet',
    memo: [
      'Un objet technique répond à un **besoin** : un manque, comme « se déplacer ». Son **usage**, c’est la façon de s’en servir pour combler ce manque.',
      'Une **fonction technique** est un rôle à assurer (« éclairer »). La **solution technique** est l’élément choisi pour le faire (l’ampoule).',
    ],
    attendu: 'Choisir un OST parmi plusieurs propositions en vue de répondre à un besoin',
    sources: [CYCLE3, 'cnrtl-besoin', 'cnrtl-usage'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
