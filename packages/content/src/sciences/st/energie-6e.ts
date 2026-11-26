import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-mouvement-energie.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Formes d'énergie, stockage et transfert, ressources, conversions et environnement (6e) ———

type Forme = 'pesanteur' | 'cinetique' | 'chimique' | 'thermique' | 'electrique' | 'nucleaire' | 'lumineuse';

const ADJ: Record<Forme, string> = {
  pesanteur: 'de pesanteur',
  cinetique: 'cinétique',
  chimique: 'chimique',
  thermique: 'thermique',
  electrique: 'électrique',
  nucleaire: 'nucléaire',
  lumineuse: 'lumineuse',
};
const nom = (f: Forme) => `énergie ${ADJ[f]}`;
const FORMES = Object.keys(ADJ) as Forme[];
const sansAccent = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
/** Autres écritures justes d’une même forme. */
const SYNONYMES: Partial<Record<Forme, readonly string[]>> = {
  pesanteur: [
    'pesanteur',
    'potentielle',
    'énergie potentielle',
    'potentielle de pesanteur',
    'énergie potentielle de pesanteur',
  ],
  thermique: ['chaleur', 'la chaleur', 'calorifique', 'énergie calorifique'],
  electrique: ['électricité', 'l’électricité'],
  nucleaire: ['atomique', 'énergie atomique'],
};
/** Admises seulement quand la lumière décrite vient du Soleil. */
const SOLAIRE = ['solaire', 'énergie solaire', 'l’énergie solaire', 'energie solaire', 'l’energie solaire'];
const variantes = (f: Forme) => {
  const longs = [nom(f), `l’${nom(f)}`];
  return [...new Set([ADJ[f], ...(SYNONYMES[f] ?? []), ...longs].flatMap((v) => [v, sansAccent(v)]))];
};

const DEFINITION: Record<Forme, string> = {
  pesanteur: 'L’énergie de pesanteur dépend de l’altitude.',
  cinetique: 'L’énergie cinétique est liée au mouvement.',
  chimique: 'L’énergie chimique est une réserve, par exemple celle qu’utilise une pile.',
  thermique: 'L’énergie thermique est liée à la chaleur.',
  electrique: 'L’énergie électrique correspond à un transfert par un circuit.',
  nucleaire: 'L’énergie nucléaire vient du noyau des atomes.',
  lumineuse: 'L’énergie lumineuse correspond à un transfert par la lumière.',
};

/** Situations typiques : une seule forme est désignée par la question. */
const SITUATIONS: readonly { q: string; forme: Forme; why: string }[] = [
  {
    q: 'un skieur qui file sur la piste, du fait de son mouvement',
    forme: 'cinetique',
    why: 'Elle est liée au mouvement.',
  },
  {
    q: 'l’eau retenue en haut d’un barrage, du fait de son altitude',
    forme: 'pesanteur',
    why: 'Elle dépend de l’altitude sur Terre.',
  },
  {
    q: 'le contenu d’une pile, avant qu’elle serve',
    forme: 'chimique',
    why: 'La pile fournit de l’électricité à partir de l’énergie chimique.',
  },
  {
    q: 'ce qui est transféré par les fils d’une pile vers un moteur',
    forme: 'electrique',
    why: 'Par les fils, l’énergie est transférée sous forme électrique.',
  },
  {
    q: 'ce que la Terre reçoit du Soleil par la lumière qu’il émet',
    forme: 'lumineuse',
    why: 'Ce transfert se fait par la lumière.',
  },
  { q: 'une soupe très chaude, du fait de sa température', forme: 'thermique', why: 'Elle est liée à la chaleur.' },
  {
    q: 'le combustible à base d’uranium d’une centrale',
    forme: 'nucleaire',
    why: 'Elle est tirée du noyau des atomes, ici ceux de l’uranium.',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SITUATIONS);
  const faux = rng.shuffle(FORMES.filter((f) => f !== s.forme)).slice(0, 2);
  const { answer, traps } = choice(
    rng,
    nom(s.forme),
    faux.map((f) => ({ label: nom(f), why: `${DEFINITION[f]} Ici : ${s.why}` })),
  );
  return {
    prompt: `Quelle forme d’énergie décrit-on : ${s.q} ?`,
    answer,
    traps,
    hint: 'Repère le mot-clé : mouvement, altitude, chaleur, lumière, fils, pile ou uranium.',
    steps: ['On relie un indice à une forme d’énergie.', s.why, `C’est l’**${nom(s.forme)}**.`],
    targetSeconds: 25,
  };
};

interface Ressource {
  readonly nom: string;
  readonly renouvelable: boolean;
  readonly why: string;
}
const inepuisable = (x: string) => `${x} : source d’énergie considérée comme inépuisable à l’échelle du temps humain.`;
const fossile = (x: string) => `${x} : énergie fossile, dont les stocks diminuent.`;
const RESSOURCES: readonly Ressource[] = [
  { nom: 'le vent', renouvelable: true, why: inepuisable('Le vent') },
  { nom: 'le Soleil', renouvelable: true, why: inepuisable('Le Soleil') },
  { nom: 'les marées', renouvelable: true, why: inepuisable('Les marées') },
  { nom: 'les chutes d’eau', renouvelable: true, why: inepuisable('Les chutes d’eau') },
  { nom: 'le pétrole', renouvelable: false, why: fossile('Le pétrole') },
  { nom: 'le charbon', renouvelable: false, why: fossile('Le charbon') },
  { nom: 'le gaz naturel', renouvelable: false, why: fossile('Le gaz naturel') },
  {
    nom: 'l’uranium',
    renouvelable: false,
    why: 'L’uranium est extrait de mines : c’est une énergie de stock, comme le pétrole et le charbon.',
  },
];
const OUI = RESSOURCES.filter((x) => x.renouvelable);
const NON = RESSOURCES.filter((x) => !x.renouvelable);
const TRANSFERTS: readonly Forme[] = ['electrique', 'lumineuse'];
const STOCKEES: readonly Forme[] = ['pesanteur', 'cinetique', 'chimique', 'nucleaire', 'thermique'];
const REGLE_STOCK =
  'Pesanteur, cinétique, chimique, nucléaire et thermique peuvent être stockées ; électrique et lumineuse correspondent à des transferts.';

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const bon = rng.pick(TRANSFERTS);
    const faux = rng.shuffle(STOCKEES).slice(0, 3);
    const { answer, traps } = choice(
      rng,
      nom(bon),
      faux.map((f) => ({ label: nom(f), why: REGLE_STOCK })),
    );
    return {
      prompt: `Parmi ces énergies (${[bon, ...faux]
        .map((f) => ADJ[f])
        .sort()
        .join(', ')}), laquelle correspond à un transfert ?`,
      answer,
      traps,
      hint: 'Deux formes seulement sur les sept correspondent à des transferts.',
      steps: [REGLE_STOCK, `Réponse : **${nom(bon)}**.`],
      targetSeconds: 30,
    };
  }
  if (t === 1) {
    const cherche = rng.int(0, 1) === 0;
    const bon = rng.pick(cherche ? OUI : NON);
    const faux = rng.shuffle(cherche ? NON : OUI).slice(0, 3);
    const { answer, traps } = choice(
      rng,
      maj(bon.nom),
      faux.map((f) => ({ label: maj(f.nom), why: f.why })),
    );
    return {
      prompt: `Parmi ${[bon, ...faux]
        .map((x) => x.nom)
        .sort()
        .join(', ')}, quelle ressource ${cherche ? 'est' : 'n’est pas'} renouvelable ?`,
      answer,
      traps,
      hint: 'Une ressource renouvelable ne s’épuise pas à l’échelle d’une vie humaine.',
      steps: ['On se demande si les stocks diminuent.', bon.why, `Réponse : **${maj(bon.nom)}**.`],
      targetSeconds: 30,
    };
  }
  const paires = rng
    .shuffle([
      ['Une lampe', 'convertit l’énergie électrique en énergie lumineuse'],
      ['Un moteur électrique', 'convertit l’énergie électrique en énergie cinétique'],
      ['Une photopile', 'convertit l’énergie solaire en énergie électrique'],
      ['Une pile', 'fournit de l’énergie électrique à partir d’énergie chimique'],
    ] as const)
    .slice(0, 3);
  return {
    prompt: `Associe chaque appareil à son rôle : ${paires
      .map((p) => p[0].toLowerCase())
      .sort()
      .join(', ')}.`,
    answer: association(rng, paires),
    hint: 'Pour chaque appareil : que reçoit-il, que donne-t-il ?',
    steps: [
      'Chaque appareil a une forme d’énergie au départ et une à l’arrivée.',
      `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
    ],
    targetSeconds: 45,
  };
};

interface Conversion {
  readonly situation: string;
  readonly depart: Forme;
  readonly arrivee: Forme;
  readonly why: string;
}
const CONVERSIONS: readonly Conversion[] = [
  {
    situation: 'Au cours de la chute d’une balle',
    depart: 'pesanteur',
    arrivee: 'cinetique',
    why: 'La balle perd de l’altitude et prend de la vitesse.',
  },
  {
    situation: 'Dans une voiture à essence qui accélère, grâce au moteur',
    depart: 'chimique',
    arrivee: 'cinetique',
    why: 'L’essence stocke de l’énergie chimique ; la voiture se met en mouvement.',
  },
  {
    situation: 'Dans une photopile éclairée par le Soleil',
    depart: 'lumineuse',
    arrivee: 'electrique',
    why: 'La photopile produit de l’électricité à partir de l’énergie solaire.',
  },
  {
    situation: 'Dans une lampe qui éclaire',
    depart: 'electrique',
    arrivee: 'lumineuse',
    why: 'La lampe reçoit un transfert électrique et émet de la lumière.',
  },
  {
    situation: 'Dans une centrale nucléaire qui produit de l’électricité',
    depart: 'nucleaire',
    arrivee: 'electrique',
    why: 'La centrale tire son énergie de l’uranium et fournit de l’électricité.',
  },
  {
    situation: 'Dans une pile qui alimente un appareil',
    depart: 'chimique',
    arrivee: 'electrique',
    why: 'La pile fournit de l’énergie électrique à partir de l’énergie chimique.',
  },
];
const OPTIONS = FORMES.map(nom);

const niveau3 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CONVERSIONS);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `${c.situation} : complète la conversion.`,
      answer: {
        kind: 'cloze',
        parts: ['L’', ' est convertie en ', '.'],
        blanks: [
          { mode: 'list', options: OPTIONS, correct: FORMES.indexOf(c.depart) },
          { mode: 'list', options: OPTIONS, correct: FORMES.indexOf(c.arrivee) },
        ],
      },
      hint: 'Cherche d’abord ce qu’on a au départ, puis ce qu’on obtient.',
      steps: [c.why, `Réponse : l’**${nom(c.depart)}** est convertie en **${nom(c.arrivee)}**.`],
      targetSeconds: 40,
    };
  }
  const depart = rng.int(0, 1) === 0;
  const bon = depart ? c.depart : c.arrivee;
  const autre = depart ? c.arrivee : c.depart;
  const acceptees = [...variantes(bon), ...(depart && bon === 'lumineuse' ? SOLAIRE : [])];
  const { answer, traps } = saisie(acceptees, [
    ...variantes(autre).map((v) => [v, `C’est la forme ${depart ? 'obtenue' : 'de départ'}. ${c.why}`] as const),
  ]);
  return {
    prompt: `${c.situation}, une énergie est convertie. Écris la forme d’énergie ${depart ? 'de départ' : 'obtenue'}.`,
    answer,
    traps,
    hint: depart ? 'Qu’a-t-on avant la conversion ?' : 'Qu’obtient-on après la conversion ?',
    steps: [c.why, `C’est l’**${nom(bon)}**.`],
    targetSeconds: 40,
  };
};

const CONSEQUENCES: readonly (readonly [string, string])[] = [
  ['Brûler du pétrole', 'Émet du dioxyde de carbone, gaz à effet de serre'],
  ['Utiliser de l’uranium', 'Laisse des déchets radioactifs à vie longue'],
  ['Utiliser le vent', 'Ressource renouvelable : l’éolienne fournit de l’électricité'],
  ['Utiliser le bois', 'Renouvelable si la forêt est gérée de façon durable'],
  ['Utiliser les marées', 'Ressource renouvelable liée à la mer'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Associe chaque usage à ce qui le caractérise.',
      answer: association(rng, CONSEQUENCES),
      hint: 'Commence par les deux usages qui laissent un gaz ou des déchets.',
      steps: [
        'Chaque ressource a ses propres conséquences.',
        `Réponse : **${CONSEQUENCES.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 75,
    };
  }
  if (t === 1) {
    const x = rng.pick([...NON, ...OUI]);
    const bon = x.renouvelable ? 'renouvelable' : 'non renouvelable';
    const { answer, traps } = saisie(
      x.renouvelable
        ? ['renouvelable', 'renouvelables']
        : ['non renouvelable', 'non renouvelables', 'non-renouvelable', 'non-renouvelables', 'pas renouvelable'],
      [[x.renouvelable ? 'non renouvelable' : 'renouvelable', x.why]],
    );
    return {
      prompt: `À l’échelle d’une vie humaine, cette ressource en énergie est-elle renouvelable ou non renouvelable : ${x.nom} ?`,
      answer,
      traps,
      hint: 'Les stocks de cette ressource diminuent-ils ?',
      steps: [x.why, `La ressource est **${bon}**.`],
      targetSeconds: 35,
    };
  }
  const s = rng.pick(SITUATIONS);
  const transfert = TRANSFERTS.includes(s.forme);
  const acceptees = [...variantes(s.forme), ...(s.forme === 'lumineuse' ? SOLAIRE : [])];
  const { answer, traps } = saisie(acceptees, [
    ...variantes(s.forme === 'chimique' ? 'electrique' : 'chimique').map(
      (v) => [v, `Ce n’est pas la forme décrite. ${s.why}`] as const,
    ),
    ...variantes(s.forme === 'cinetique' ? 'pesanteur' : 'cinetique').map(
      (v) => [v, `Ce n’est pas la forme décrite. ${s.why}`] as const,
    ),
  ]);
  return {
    prompt: `Sans liste d’aide, nomme la forme d’énergie : ${s.q}.`,
    answer,
    traps,
    hint: transfert
      ? 'C’est l’une des deux formes qui correspondent à un transfert.'
      : 'C’est une forme qui peut être stockée.',
    steps: [s.why, `C’est l’**${nom(s.forme)}**.`],
    targetSeconds: 40,
  };
};

interface Dispositif {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly chaine: readonly string[];
  readonly ressource: string;
  readonly renouvelable: boolean;
  readonly consequence: string;
  readonly sortie: Forme;
  readonly why: string;
}
const CO2 = 'sa combustion émet du dioxyde de carbone';
const PEU = 'elle engendre peu ou pas de déchets et d’émissions polluantes';
const DECHETS = 'son utilisation laisse surtout des déchets radioactifs';
const DISPOSITIFS: readonly Dispositif[] = [
  {
    titre: 'Une centrale hydroélectrique',
    lignes: [
      'De l’eau est retenue en hauteur derrière un barrage.',
      'Elle descend dans un tuyau en prenant de la vitesse.',
      'Elle fait tourner une turbine reliée à un générateur, qui envoie l’électricité dans les câbles.',
    ],
    chaine: [
      'eau en hauteur : énergie de pesanteur',
      'eau en mouvement : énergie cinétique',
      'turbine et générateur',
      'câbles : énergie électrique',
    ],
    ressource: 'l’eau',
    renouvelable: true,
    consequence: PEU,
    sortie: 'electrique',
    why: 'Les chutes d’eau alimentent des énergies renouvelables.',
  },
  {
    titre: 'Une éolienne',
    lignes: [
      'Le vent souffle sur les pales d’une éolienne.',
      'Les pales tournent et entraînent un générateur.',
      'Le générateur envoie l’électricité dans les câbles.',
    ],
    chaine: ['vent : énergie cinétique', 'pales en rotation', 'générateur', 'câbles : énergie électrique'],
    ressource: 'le vent',
    renouvelable: true,
    consequence: PEU,
    sortie: 'electrique',
    why: 'Le vent est une ressource renouvelable.',
  },
  {
    titre: 'Une voiture à essence',
    lignes: [
      'Le réservoir contient de l’essence, obtenue à partir du pétrole.',
      'L’essence est envoyée vers le moteur, où elle brûle.',
      'Le moteur fait tourner les roues et la voiture avance.',
    ],
    chaine: [
      'essence dans le réservoir : énergie chimique',
      'combustion dans le moteur',
      'roues entraînées par le moteur',
      'voiture qui avance : énergie cinétique',
    ],
    ressource: 'le pétrole',
    renouvelable: false,
    consequence: CO2,
    sortie: 'cinetique',
    why: 'Le pétrole est une énergie fossile : ses stocks diminuent.',
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DISPOSITIFS);
  const figure = { kind: 'document' as const, title: `${d.titre} (description simplifiée)`, lines: d.lignes };
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Lis la description. Range les étapes de la chaîne d’énergie.',
      figure,
      answer: ordre(rng, d.chaine),
      hint: 'Commence par la ressource et termine par la forme d’énergie obtenue.',
      steps: ['On suit l’énergie depuis la ressource.', `Ordre : **${d.chaine.join(' → ')}**.`],
      targetSeconds: 75,
    };
  }
  if (t === 1) {
    const bon = `${maj(d.ressource)} : ressource ${d.renouvelable ? 'renouvelable' : 'non renouvelable'}`;
    const autre = d.consequence === DECHETS ? CO2 : DECHETS;
    const { answer, traps } = choice(rng, `${bon} ; ${d.consequence}`, [
      {
        label: `${maj(d.ressource)} : ressource ${d.renouvelable ? 'non renouvelable' : 'renouvelable'} ; ${d.consequence}`,
        why: d.why,
      },
      {
        label: `${bon} ; ${autre}`,
        why: 'Les déchets radioactifs viennent des combustibles nucléaires usés, qui ne sont pas utilisés ici.',
      },
      {
        label: `${bon} ; elle ne fournit aucune énergie`,
        why: 'La description montre qu’une forme d’énergie est obtenue à partir de cette ressource.',
      },
    ]);
    return {
      prompt: 'Lis la description. Quel bilan de la ressource utilisée est exact ?',
      figure,
      answer,
      traps,
      hint: 'Vérifie deux choses : les stocks, puis ce que l’utilisation rejette.',
      steps: [d.why, `**${bon} ; ${d.consequence}**.`],
      targetSeconds: 75,
    };
  }
  const { answer, traps } = saisie(
    variantes(d.sortie),
    FORMES.filter((f) => f === 'chimique' || f === 'thermique' || f === 'pesanteur').flatMap((f) =>
      variantes(f).map(
        (v) => [v, 'Ce n’est pas la forme obtenue à la fin de la chaîne : relis la dernière ligne.'] as const,
      ),
    ),
  );
  return {
    prompt: `Lis la description. Quelle forme d’énergie obtient-on au bout de la chaîne${d.sortie === 'electrique' ? ', dans les câbles' : ', pour la voiture en mouvement'} ? Écris son nom.`,
    figure,
    answer,
    traps,
    hint: 'La dernière ligne dit ce que l’on obtient.',
    steps: ['On lit la fin de la description.', `C’est l’**${nom(d.sortie)}**.`],
    targetSeconds: 55,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const sourcesConversions: Skill = {
  id: 'p6-sources-conversions',
  title: 'Sources et conversions d’énergie',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Tu peux stocker l’**énergie de pesanteur**, l’**énergie cinétique**, l’**énergie chimique**, l’**énergie thermique** et l’**énergie nucléaire** ; les énergies électrique et lumineuse correspondent à des **transferts d’énergie**. Exemple de **conversion d’énergie** : dans une chute, l’énergie de pesanteur est convertie en énergie cinétique.',
      'Soleil, vent, eau et bois bien géré sont des ressources **renouvelables** ; pétrole, charbon, gaz et uranium sont des stocks qui ne se renouvellent pas à l’échelle d’une vie humaine. Brûler du pétrole ou du gaz émet du dioxyde de carbone ; l’uranium laisse des déchets radioactifs.',
    ],
    ...references(
      'formes',
      'stockees-transferts',
      'ressources',
      'chute',
      'moteur-pile',
      'essence',
      'soleil',
      'renouvelables',
      'peu-polluantes',
      'fossiles',
      'gaz-naturel',
      'bois',
      'eolienne',
      'charbon',
      'uranium-stock',
      'dechets-nucleaires',
      'co2',
      'pile',
      'photopile',
      'recepteur',
      'hydro',
      'thermique',
      'nucleaire',
      'essence-petrole',
      'maree',
      'centrale-nucleaire',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
