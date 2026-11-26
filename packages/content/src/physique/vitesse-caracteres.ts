import { choice, num, traps } from '../build.ts';
import { dec, div, isDecimal, mul, r, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesInteractions } from './donnees-interactions.ts';

// ——— La vitesse : direction, sens, valeur ; relation et unités (4e) ———

interface Trajet {
  readonly texte: string;
  readonly direction: string;
  readonly sens: string;
  readonly valeur: string;
}

const TRAJETS: readonly Trajet[] = [
  {
    texte: 'Un ascenseur monte le long d’une glissière verticale à 2 m/s.',
    direction: 'la verticale',
    sens: 'du bas vers le haut',
    valeur: '2 m/s',
  },
  {
    texte: 'Un train roule à 200 km/h, de Nantes vers Angers, sur une voie droite.',
    direction: 'la droite de la voie',
    sens: 'de Nantes vers Angers',
    valeur: '200 km/h',
  },
  {
    texte: 'Un chariot roule à 3 m/s sur un rail horizontal, de la gauche vers la droite.',
    direction: 'l’horizontale du rail',
    sens: 'de la gauche vers la droite',
    valeur: '3 m/s',
  },
  {
    texte: 'Un colis descend tout droit le long d’un câble incliné, vers l’entrepôt, à 4 m/s.',
    direction: 'la droite du câble incliné',
    sens: 'vers l’entrepôt',
    valeur: '4 m/s',
  },
  {
    texte: 'Un nageur avance à 1 m/s le long d’une ligne d’eau droite, du plongeoir vers l’échelle.',
    direction: 'la droite de la ligne d’eau',
    sens: 'du plongeoir vers l’échelle',
    valeur: '1 m/s',
  },
];

const CARACTERES = ['direction', 'sens', 'valeur'] as const;
type Caractere = (typeof CARACTERES)[number];

const DEFINITION: Record<Caractere, string> = {
  direction: 'La direction est la droite suivant laquelle l’objet se déplace.',
  sens: 'Le sens indique vers quel côté l’objet avance sur cette droite.',
  valeur: 'La valeur est un nombre accompagné d’une unité, comme des m/s ou des km/h.',
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const t = rng.pick(TRAJETS);
  const c = rng.pick(CARACTERES);
  const { answer, traps: tr } = choice(
    rng,
    t[c],
    CARACTERES.filter((x) => x !== c).map((x) => ({
      label: t[x],
      why: `Cette information correspond à ${x === 'sens' ? 'un autre élément, le sens' : `un autre élément, la ${x}`}. ${DEFINITION[x]}`,
    })),
  );
  return {
    prompt: `${t.texte} Quelle information donne ${c === 'sens' ? 'le sens' : `la ${c}`} de sa vitesse ?`,
    answer,
    traps: tr,
    hint: 'Une vitesse a trois caractéristiques : la droite suivie, le côté vers lequel on avance et un nombre avec son unité.',
    steps: [DEFINITION[c], `Ici : **${t[c]}**.`],
    targetSeconds: 30,
  };
};

interface Paire {
  readonly texte: string;
  readonly change: Caractere | 'rien';
  readonly why: string;
}

const COMPARAISONS: readonly Paire[] = [
  {
    texte: 'Deux ascenseurs voisins se déplacent à 1 m/s sur des glissières verticales : l’un monte, l’autre descend.',
    change: 'sens',
    why: 'Même direction (verticale) et même valeur (1 m/s) ; l’un va vers le haut, l’autre vers le bas.',
  },
  {
    texte: 'Deux voitures se croisent sur une route droite, chacune à 70 km/h.',
    change: 'sens',
    why: 'La droite suivie et la valeur sont les mêmes ; les deux voitures avancent vers des côtés opposés.',
  },
  {
    texte:
      'Sur deux voies droites parallèles, deux trains vont vers la même gare : l’un à 90 km/h, l’autre à 120 km/h.',
    change: 'valeur',
    why: 'Même direction (voies parallèles) et même sens ; seuls les nombres diffèrent.',
  },
  {
    texte: 'Deux coureurs avancent vers la même arrivée, dans des couloirs droits parallèles, à 5 m/s et 6 m/s.',
    change: 'valeur',
    why: 'Même direction et même sens ; leurs valeurs, 5 m/s et 6 m/s, diffèrent.',
  },
  {
    texte: 'Un drone monte à la verticale à 4 m/s ; un autre vole à l’horizontale à 4 m/s.',
    change: 'direction',
    why: 'Les valeurs sont égales, mais l’un suit une droite verticale et l’autre une droite horizontale.',
  },
  {
    texte:
      'Sur un plan, un robot suit une ligne droite orientée nord-sud et un second une ligne droite orientée est-ouest, tous deux à 2 m/s.',
    change: 'direction',
    why: 'Les valeurs sont égales, mais les deux droites suivies ne sont pas parallèles.',
  },
];

const DIFFERENCE: Record<Caractere, string> = {
  direction: 'la direction',
  sens: 'le sens seulement',
  valeur: 'la valeur seulement',
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const t = rng.pick(TRAJETS);
    return {
      prompt: `${t.texte} Associe chaque caractéristique de la vitesse à l’information qui convient.`,
      answer: association(
        rng,
        CARACTERES.map((c) => [c, t[c]] as const),
      ),
      hint: 'Repère d’abord le nombre avec son unité, puis distingue la droite suivie et le côté vers lequel on va.',
      steps: [
        `${DEFINITION.direction} ${DEFINITION.sens} ${DEFINITION.valeur}`,
        `**Direction : ${t.direction} ; sens : ${t.sens} ; valeur : ${t.valeur}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const p = rng.pick(COMPARAISONS);
  const bon = p.change as Caractere;
  const { answer, traps: tr } = choice(rng, DIFFERENCE[bon], [
    ...CARACTERES.filter((c) => c !== bon).map((c) => ({ label: DIFFERENCE[c], why: p.why })),
    { label: 'rien : les deux vitesses sont identiques', why: p.why },
  ]);
  return {
    prompt: `${p.texte} Qu’est-ce qui distingue les deux vitesses ?`,
    answer,
    traps: tr,
    hint: 'Compare dans l’ordre : la droite suivie, puis le côté vers lequel on va, puis le nombre avec son unité.',
    steps: [p.why, `Réponse : **${DIFFERENCE[bon]}**.`],
    targetSeconds: 45,
  };
};

const nombre = (value: Rational, unit: string, liste: readonly (readonly [Rational, string])[]) => ({
  answer: num(value, unit),
  traps: traps(
    value,
    liste.filter(([v]) => isDecimal(v)),
  ),
});

const OBJETS = ['Un drone', 'Une rame de métro', 'Un chariot motorisé', 'Un téléphérique'] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const objet = rng.pick(OBJETS);
  const v = rng.int(3, 15);
  const t = rng.int(12, 30);
  const d = v * t;
  const type = rng.int(0, 2);
  if (type === 0)
    return {
      prompt: `En mouvement uniforme, voici un relevé : « ${objet}, ${d} m en ${t} s ». Quelle est la valeur de sa vitesse, en m/s ?`,
      ...nombre(r(v), 'm/s', [
        [r(d * t), 'La relation est v = d ÷ t : on divise, on ne multiplie pas.'],
        [div(r(t), r(d)), 'Tu as divisé la durée par la distance : c’est l’inverse.'],
      ]),
      hint: 'La valeur de la vitesse dit combien de mètres sont parcourus en une seconde.',
      steps: ['Mouvement uniforme : v = d ÷ t.', `v = ${d} ÷ ${t} = **${v} m/s**.`],
      targetSeconds: 40,
    };
  if (type === 1)
    return {
      prompt: `${objet} avance d’un mouvement uniforme ; la valeur de sa vitesse est ${v} m/s. Quelle distance, en m, couvre cet objet en ${t} s ?`,
      ...nombre(r(d), 'm', [
        [r(v + t), 'On multiplie la vitesse par la durée, on ne les additionne pas.'],
        [div(r(v), r(t)), 'Pour obtenir une distance, on multiplie la vitesse par la durée.'],
      ]),
      hint: 'La même distance est parcourue à chaque seconde.',
      steps: ['d = v × t.', `d = ${v} × ${t} = **${d} m**.`],
      targetSeconds: 40,
    };
  return {
    prompt: `${objet} doit couvrir ${d} m d’un mouvement uniforme, avec une vitesse de valeur ${v} m/s. Quelle est la durée du trajet, en s ?`,
    ...nombre(r(t), 's', [
      [r(d * v), 'Pour une durée, on divise la distance par la valeur de la vitesse.'],
      [div(r(v), r(d)), 'Tu as divisé la vitesse par la distance : c’est l’inverse.'],
    ]),
    hint: 'Combien de fois la distance parcourue en une seconde tient-elle dans le trajet ?',
    steps: ['t = d ÷ v.', `t = ${d} ÷ ${v} = **${t} s**.`],
    targetSeconds: 40,
  };
};

/** 1 m/s = 3,6 km/h : multiples de 5 m/s, donc de 18 km/h, pour des résultats entiers. */
const RAPPEL = '1 h = 3 600 s : 1 m/s correspond à 3 600 m en 1 h, soit 3,6 km/h.';

const niveau4 = (rng: Rng): QuestionDraft => {
  const k = rng.int(1, 24);
  const ms = 5 * k;
  const kmh = 18 * k;
  const facteur = dec(36, 1);
  if (rng.int(0, 1) === 0)
    return {
      prompt: `Convertis en km/h la valeur de vitesse ${ms} m/s.`,
      ...nombre(r(kmh), 'km/h', [
        [div(r(ms), facteur), 'Pour passer des m/s aux km/h, on multiplie par 3,6.'],
        [r(ms * 3600), '3 600 donne des mètres par heure : il reste à convertir en kilomètres.'],
        [r(ms * 60), 'Une heure compte 3 600 s (et non 60), et il faut des kilomètres.'],
      ]),
      hint: 'Cherche d’abord la distance parcourue en une heure, puis écris-la en kilomètres.',
      steps: [RAPPEL, `${ms} × 3,6 = **${kmh} km/h**.`],
      targetSeconds: 60,
    };
  return {
    prompt: `Convertis en m/s la valeur de vitesse ${kmh} km/h.`,
    ...nombre(r(ms), 'm/s', [
      [mul(r(kmh), facteur), 'Pour passer des km/h aux m/s, on divise par 3,6.'],
      [div(r(kmh * 1000), r(60)), 'Une heure compte 3 600 s, pas 60.'],
      [r(kmh * 1000), 'Tu as converti la distance en mètres, mais pas l’heure en secondes.'],
    ]),
    hint: 'Écris la distance en mètres et l’heure en secondes.',
    steps: [`${kmh} km/h = ${kmh * 1000} m en 3 600 s.`, `${kmh * 1000} ÷ 3 600 = **${ms} m/s**.`],
    targetSeconds: 60,
  };
};

const chronometre = (rng: Rng): QuestionDraft => {
  const k = rng.int(1, 7);
  const ms = 5 * k;
  const kmh = 18 * k;
  const t = rng.int(12, 60);
  const d = ms * t;
  return {
    prompt: 'Lis la fiche de contrôle. Combien de secondes faut-il au véhicule pour franchir le tronçon ?',
    figure: {
      kind: 'document',
      title: 'Fiche de contrôle d’un tunnel (données de l’exercice)',
      lines: [
        `Longueur du tronçon contrôlé : ${d} m.`,
        'Mouvement du véhicule : rectiligne et uniforme.',
        `Valeur de la vitesse affichée : ${kmh} km/h.`,
      ],
    },
    ...nombre(r(t), 's', [
      [div(r(d), r(kmh)), 'La distance est en mètres et la vitesse en km/h : convertis d’abord en m/s.'],
      [div(r(d), mul(r(kmh), dec(36, 1))), 'Pour passer en m/s, divise par 3,6 au lieu de multiplier.'],
      [r(d * ms), 'La durée s’obtient en divisant la distance par la valeur de la vitesse.'],
    ]),
    hint: 'Accorde les unités avant d’utiliser la relation entre distance, vitesse et durée.',
    steps: [`${kmh} km/h = ${kmh} ÷ 3,6 = ${ms} m/s.`, 't = d ÷ v.', `t = ${d} ÷ ${ms} = **${t} s**.`],
    targetSeconds: 120,
  };
};

const NOMS = ['A', 'B', 'C'] as const;

const classement = (rng: Rng): QuestionDraft => {
  // Trois valeurs distinctes en m/s, écrites chacune d'une façon différente.
  const base = rng.int(2, 6);
  const vitesses = rng.shuffle([5 * base, 5 * base + 5, 5 * base + 10]);
  const [a, b, c] = vitesses as [number, number, number];
  const duree = rng.int(4, 9);
  const valeurs = [a, b, c];
  const max = Math.max(...valeurs);
  const bon = `Le mobile ${NOMS[valeurs.indexOf(max)]}`;
  const why = `En m/s : A = ${a}, B = ${b} (${(b * 18) / 5} ÷ 3,6), C = ${c} (${c * duree} ÷ ${duree}).`;
  const { answer, traps: tr } = choice(
    rng,
    bon,
    NOMS.map((n) => ({ label: `Le mobile ${n}`, why })).filter((o) => o.label !== bon),
  );
  return {
    prompt: 'Lis les trois relevés. Quel mobile a la vitesse de plus grande valeur ?',
    figure: {
      kind: 'document',
      title: 'Relevés de trois mouvements uniformes (données de l’exercice)',
      lines: [
        `Mobile A : vitesse affichée ${a} m/s.`,
        `Mobile B : vitesse affichée ${(b * 18) / 5} km/h.`,
        `Mobile C : ${c * duree} m parcourus en ${duree} s.`,
      ],
    },
    answer,
    traps: tr,
    hint: 'On ne compare que des valeurs écrites dans la même unité.',
    steps: [why, `La plus grande valeur est ${max} m/s : **${bon.toLowerCase()}**.`],
    targetSeconds: 120,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => (rng.int(0, 1) === 0 ? chronometre(rng) : classement(rng));

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const vitesseCaracteres: Skill = {
  id: 'p4-vitesse',
  title: 'La vitesse : direction, sens et valeur',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'La **vitesse** d’un mobile a une direction (la droite suivie), un sens (le côté vers lequel il avance) et une valeur (par exemple 20 m/s).',
      'Dans un mouvement uniforme, v = d ÷ t. Pour passer des m/s aux km/h, multiplie par 3,6 : 10 m/s = 36 km/h, car 1 h = 3 600 s.',
    ],
    ...referencesInteractions(
      'vitesse-caracteres',
      'relation',
      'direction',
      'sens',
      'metre-par-seconde',
      'kilometre-par-heure',
      'heure',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
