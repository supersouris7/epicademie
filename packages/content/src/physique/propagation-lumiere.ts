import { choice, num, traps } from '../build.ts';
import { fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, maj, ordre, saisie } from '../sciences/st/outils.ts';
import type { Figure, QuestionDraft, Skill } from '../types.ts';
import { referencesSignaux } from './donnees-signaux.ts';

// ——— Propagation de la lumière : sources, rayon lumineux, ombres, année-lumière (5e) ———

export const SOURCES_PRIMAIRES = [
  'le Soleil',
  'la flamme d’une bougie',
  'une lampe allumée',
  'une étoile lointaine',
] as const;
export const OBJETS_DIFFUSANTS = [
  'la Lune',
  'une planète',
  'une page de cahier',
  'un mur blanc',
  'un écran de cinéma',
] as const;

const WHY_DIFFUSANT = (o: string) =>
  `${maj(o)} ne produit pas sa lumière : on le voit parce que cet objet renvoie la lumière reçue.`;
const WHY_PRIMAIRE = (o: string) => `${maj(o)} produit sa propre lumière : c’est une source primaire.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const cherchePrimaire = rng.pick([true, false]);
  const bon: string = rng.pick<string>(cherchePrimaire ? SOURCES_PRIMAIRES : OBJETS_DIFFUSANTS);
  const autres = rng.shuffle<string>(cherchePrimaire ? OBJETS_DIFFUSANTS : SOURCES_PRIMAIRES).slice(0, 2);
  const { answer, traps: t } = choice(
    rng,
    bon,
    autres.map((o) => ({ label: o, why: cherchePrimaire ? WHY_DIFFUSANT(o) : WHY_PRIMAIRE(o) })),
  );
  return {
    prompt: cherchePrimaire
      ? 'Lequel de ces objets est une source primaire de lumière ?'
      : 'Lequel de ces objets est un objet diffusant ?',
    answer,
    traps: t,
    hint: 'Demande-toi : cet objet brillerait-il encore dans le noir complet, sans rien pour l’éclairer ?',
    steps: [
      'Une source primaire produit sa lumière ; un objet diffusant renvoie la lumière qu’il reçoit.',
      cherchePrimaire
        ? `${maj(bon)} produit sa propre lumière.`
        : `On voit ${bon} grâce à la lumière reçue d’ailleurs.`,
      `La réponse est **${bon}**.`,
    ],
    targetSeconds: 25,
  };
};

const MOTS: readonly (readonly [string, string])[] = [
  ['source primaire', 'objet qui produit sa propre lumière'],
  ['objet diffusant', 'objet qui renvoie dans toutes les directions la lumière reçue'],
  ['rayon lumineux', 'ligne droite fléchée qui modélise le trajet de la lumière'],
  ['ombre', 'zone sombre derrière un objet opaque qui arrête la lumière'],
  ['année-lumière', 'distance parcourue par la lumière dans le vide en un an'],
];

const associer = (rng: Rng, n: 3 | 5, secondes: number): QuestionDraft => {
  const paires = rng.shuffle(MOTS).slice(0, n);
  return {
    prompt: `Associe chaque terme à sa description : ${paires
      .map((p) => p[0])
      .sort()
      .join(' ; ')}.`,
    answer: association(rng, paires),
    hint: 'Commence par les termes que tu connais le mieux, puis procède par élimination.',
    steps: [
      'Chaque terme a un sens précis en optique (la partie de la physique qui étudie la lumière).',
      paires.map(([m, d]) => `${m} : ${d}`).join(' ; ') + '.',
      'Chaque terme a **sa** description.',
    ],
    targetSeconds: secondes,
  };
};

interface Cas {
  readonly question: string;
  readonly bon: string;
  readonly faux: readonly (readonly [string, string])[];
  readonly why: string;
}

const CAS_N2: readonly Cas[] = [
  {
    question: 'Comment la lumière se propage-t-elle dans le vide ?',
    bon: 'en ligne droite',
    faux: [
      [
        'elle ne s’y propage pas',
        'La lumière du Soleil traverse le vide de l’espace : elle n’a pas besoin de matière.',
      ],
      ['en contournant les obstacles en cercle', 'Dans le vide, son trajet est une droite.'],
      ['seulement vers le bas', 'La lumière part de la source dans de nombreuses directions, en ligne droite.'],
    ],
    why: 'Dans le vide, la lumière se propage en ligne droite.',
  },
  {
    question: 'Pourquoi voit-on la Lune briller la nuit ?',
    bon: 'elle renvoie la lumière qu’elle reçoit du Soleil',
    faux: [
      ['elle produit sa propre lumière', 'La Lune n’est pas une source primaire : elle n’émet pas sa lumière.'],
      ['elle brûle comme une flamme', 'La Lune n’est pas en combustion : elle est éclairée par le Soleil.'],
      ['elle garde en elle la lumière de la veille', 'La Lune renvoie la lumière au moment où elle la reçoit.'],
    ],
    why: 'La Lune est un objet diffusant : elle réfléchit la lumière reçue du Soleil.',
  },
  {
    question: 'Qu’est-ce qui provoque l’ombre d’un arbre sur le sol ?',
    bon: 'l’arbre, opaque, arrête une partie de la lumière qui arrive en ligne droite',
    faux: [
      ['l’arbre produit de l’obscurité', 'Un objet n’émet pas d’obscurité : il arrête la lumière.'],
      ['la lumière tourne autour de l’arbre pour l’éviter', 'La lumière ne contourne pas ainsi : elle va tout droit.'],
      ['le sol absorbe l’arbre', 'L’ombre vient de la lumière arrêtée avant d’atteindre le sol.'],
    ],
    why: 'Un objet opaque intercepte la lumière : derrière lui apparaît une zone moins éclairée.',
  },
  {
    question: 'Qu’est-ce qu’une année-lumière ?',
    bon: 'une unité de distance',
    faux: [
      ['une unité de durée', 'Le mot « année » trompe : on mesure le chemin parcouru par la lumière en un an.'],
      ['une unité de vitesse', 'La vitesse de la lumière s’exprime en km/s ou en m/s, pas en années-lumière.'],
      ['une unité d’éclairement', 'Elle ne mesure pas la quantité de lumière reçue.'],
    ],
    why: 'L’année-lumière est la distance parcourue par la lumière dans le vide en un an.',
  },
  {
    question: 'Quelle précaution prendre avec un pointeur laser ?',
    bon: 'ne jamais le diriger vers une personne ni vers un véhicule',
    faux: [
      [
        'le diriger vers les yeux seulement de loin',
        'Même de loin, un faisceau laser reste dangereux : on ne vise personne.',
      ],
      ['le tester en visant un avion', 'Éblouir un pilote est un véritable danger pour le transport aérien.'],
      [
        'le regarder en face pour vérifier qu’il fonctionne',
        'On ne regarde jamais dans un laser : c’est une source à risque.',
      ],
    ],
    why: 'Un laser est une source lumineuse à risque : on ne le pointe vers personne.',
  },
];

const qcm = (rng: Rng, c: Cas, secondes: number): QuestionDraft => {
  const { answer, traps: t } = choice(
    rng,
    c.bon,
    c.faux.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: c.question,
    answer,
    traps: t,
    hint: 'Pense à la source de la lumière, à son trajet et à ce qui l’arrête.',
    steps: ['On revient aux idées clés : sources, trajet en ligne droite, ombre.', c.why, `Réponse : **${c.bon}**.`],
    targetSeconds: secondes,
  };
};

const niveau2 = (rng: Rng): QuestionDraft =>
  rng.int(0, 2) === 0 ? associer(rng, 3, 50) : qcm(rng, rng.pick(CAS_N2), 35);

const TROUS: readonly {
  readonly parts: readonly string[];
  readonly mots: readonly (readonly string[])[];
  readonly why: string;
}[] = [
  {
    parts: ['Dans le vide, la lumière se propage en ligne ', '. On représente son trajet par un ', ' lumineux.'],
    mots: [['droite'], ['rayon']],
    why: 'La propagation est rectiligne : le modèle du rayon lumineux est une droite fléchée.',
  },
  {
    parts: ['Une flamme est une source ', ' : elle ', ' sa propre lumière.'],
    mots: [['primaire'], ['produit', 'émet']],
    why: 'Une source primaire produit la lumière qu’elle envoie.',
  },
  {
    parts: ['Une page de livre est un objet ', ' : elle renvoie la lumière dans toutes les ', '.'],
    mots: [['diffusant'], ['directions']],
    why: 'Un objet diffusant renvoie dans toutes les directions une partie de la lumière reçue.',
  },
  {
    parts: ['Un objet ', ' arrête la lumière : derrière lui se forme une ', '.'],
    mots: [['opaque'], ['ombre']],
    why: 'La lumière qui va en ligne droite est arrêtée par l’objet opaque.',
  },
];

const CHAINES: readonly {
  readonly sujet: string;
  readonly etapes: readonly string[];
}[] = [
  {
    sujet: 'On observe la Lune depuis la Terre',
    etapes: [
      'Le Soleil émet de la lumière',
      'La lumière du Soleil atteint la Lune',
      'La Lune renvoie une partie de cette lumière',
      'La lumière renvoyée atteint la Terre',
    ],
  },
  {
    sujet: 'Une caméra filme un livre éclairé par une lampe',
    etapes: [
      'La lampe émet de la lumière',
      'La lumière atteint le livre',
      'Le livre diffuse une partie de la lumière',
      'La lumière diffusée atteint la caméra',
    ],
  },
  {
    sujet: 'Une lampe éclaire un cube opaque placé devant un écran',
    etapes: [
      'La lampe émet de la lumière',
      'La lumière arrive en ligne droite sur le cube',
      'Le cube arrête une partie de la lumière',
      'Une ombre apparaît sur l’écran, derrière le cube',
    ],
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const t = rng.pick(TROUS);
    return {
      prompt: `Complète la phrase avec les mots du cours (${t.parts.join('…')})`,
      answer: { kind: 'cloze', parts: t.parts, blanks: t.mots.map((accepted) => ({ mode: 'text', accepted })) },
      hint: 'Utilise le vocabulaire : source, rayon, opaque, diffusant, ombre.',
      steps: [
        'On cherche le terme exact de la physique.',
        t.why,
        `Il fallait écrire **${t.mots.map((m) => m[0]).join('** puis **')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  if (type === 1) {
    const c = rng.pick(CHAINES);
    return {
      prompt: `${c.sujet}. Remets dans l’ordre le trajet de la lumière.`,
      answer: ordre(rng, c.etapes),
      hint: 'Pars de la source primaire : c’est elle qui produit la lumière.',
      steps: [
        'La lumière part de la source, puis rencontre les objets.',
        c.etapes.join(', puis ') + '.',
        'L’ordre commence par la **source**.',
      ],
      targetSeconds: 55,
    };
  }
  const primaire = rng.pick([true, false]);
  const nom = primaire ? 'source primaire' : 'objet diffusant';
  const obj: string = rng.pick<string>(primaire ? SOURCES_PRIMAIRES : OBJETS_DIFFUSANTS);
  const why = primaire ? WHY_PRIMAIRE(obj) : WHY_DIFFUSANT(obj);
  const { answer, traps: t } = saisie(
    primaire ? [nom, `une ${nom}`, 'objet lumineux', 'un objet lumineux'] : [nom, `un ${nom}`],
    [
      [primaire ? 'objet diffusant' : 'source primaire', why],
      [primaire ? 'un objet diffusant' : 'une source primaire', why],
    ],
  );
  return {
    prompt: `Pour la lumière, comment appelle-t-on en physique un corps comme ${obj} ? Réponds en deux mots.`,
    answer,
    traps: t,
    hint: 'L’objet produit-il sa lumière, ou la reçoit-il d’ailleurs ?',
    steps: [why, 'On choisit le terme du programme.', `C’est un cas de **${nom}**.`],
    targetSeconds: 40,
  };
};

const VALEUR_C = 'On prend 300 000 km/s pour la vitesse de la lumière dans le vide.';

/** Schéma : source ponctuelle S, sommet B d'un objet opaque, écran vertical ; la hauteur d'ombre vaut `h × k`. */
export const schemaOmbre = (d: number, h: number, k: number): Figure => ({
  kind: 'grid',
  xMin: -1,
  xMax: d * k + 1,
  yMin: -1,
  yMax: h * k + 1,
  axes: false,
  points: [
    { name: 'S', x: 0, y: 0 },
    { name: 'A', x: d, y: 0 },
    { name: 'B', x: d, y: h },
    { name: 'E', x: d * k, y: 0 },
  ],
});

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 3);
  if (type === 0) return associer(rng, 5, 80);
  if (type === 1) {
    const { answer, traps: t } = saisie(
      ['année-lumière', 'année lumière', 'annee-lumiere', 'annee lumiere', 'une année-lumière', 'l’année-lumière'],
      [
        ['année', 'Une année est une durée ; l’unité de distance cherchée ajoute le mot « lumière ».'],
        ['kilomètre', 'Le kilomètre convient, mais la question vise l’unité liée au trajet de la lumière en un an.'],
        ['seconde-lumière', 'La question porte sur la durée d’un an, pas d’une seconde.'],
      ],
    );
    return {
      prompt: 'Écris le nom de l’unité de distance égale au chemin parcouru par la lumière dans le vide en un an.',
      answer,
      traps: t,
      hint: 'Le nom réunit deux mots : une durée et ce qui se déplace.',
      steps: [
        'Les astronomes expriment de très grandes distances avec la lumière.',
        'La durée choisie est un an.',
        'C’est l’**année-lumière**, une unité de distance.',
      ],
      targetSeconds: 45,
    };
  }
  if (type === 2) {
    const s = rng.int(2, 20);
    const d = 300000 * s;
    return {
      prompt: `${VALEUR_C} Quelle distance, en km, la lumière parcourt-elle dans le vide en ${s} s ?`,
      answer: num(r(d), 'km'),
      traps: traps(r(d), [
        [r(300000 + s), 'Chaque seconde apporte 300 000 km : on multiplie, on n’additionne pas.'],
        [r(300000), 'C’est la distance parcourue en une seule seconde.'],
      ]),
      hint: 'La distance parcourue chaque seconde est la même.',
      steps: ['d = v × t.', `d = 300 000 × ${s}.`, `La lumière parcourt **${fmt(r(d))} km**.`],
      targetSeconds: 60,
    };
  }
  const d = rng.int(2, 4);
  const h = rng.int(1, 3);
  const k = rng.int(2, 3);
  const res = h * k;
  return {
    prompt: `S est une petite source de lumière, [AB] un objet opaque vertical posé sur l’axe et E le pied d’un écran vertical. SA = ${d} carreaux, AB = ${h} carreau${h > 1 ? 'x' : ''}, SE = ${d * k} carreaux. Quelle est la hauteur de l’ombre sur l’écran, en carreaux ?`,
    figure: schemaOmbre(d, h, k),
    answer: num(r(res), 'carreaux'),
    traps: traps(r(res), [
      [r(h), 'L’ombre n’a pas forcément la taille de l’objet : les rayons issus de S s’écartent.'],
      [
        r(h + d * k - d),
        'On n’ajoute pas les distances : la hauteur grandit dans la même proportion que la distance à S.',
      ],
    ]),
    hint: 'Trace le rayon partant de S qui frôle le point B : il monte régulièrement jusqu’à l’écran.',
    steps: [
      'La lumière va en ligne droite : le rayon SB se prolonge jusqu’à l’écran.',
      `L’écran est ${k} fois plus loin de S que l’objet, donc le rayon monte ${k} fois plus haut.`,
      `${h} × ${k} = **${res} carreaux**.`,
    ],
    targetSeconds: 90,
  };
};

const CIEL = [
  { nom: 'une étoile', primaire: true },
  { nom: 'le Soleil', primaire: true },
  { nom: 'une lampe de poche allumée', primaire: true },
  { nom: 'la flamme d’une bougie', primaire: true },
  { nom: 'la Lune', primaire: false },
  { nom: 'une planète', primaire: false },
  { nom: 'un panneau blanc éclairé par un projecteur', primaire: false },
  { nom: 'le mur d’une maison éclairé par un lampadaire', primaire: false },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const nbP = rng.int(1, 3);
    const choisis = rng.shuffle([
      ...rng.shuffle(CIEL.filter((c) => c.primaire)).slice(0, nbP),
      ...rng.shuffle(CIEL.filter((c) => !c.primaire)).slice(0, 5 - nbP),
    ]);
    const primaire = rng.pick([true, false]);
    const res = primaire ? nbP : 5 - nbP;
    return {
      prompt: primaire
        ? 'Lis le carnet d’observation. Combien de sources primaires de lumière y sont notées ?'
        : 'Lis le carnet d’observation. Combien d’objets diffusants y sont notés ?',
      figure: {
        kind: 'document',
        title: 'Carnet d’observation (exercice)',
        lines: choisis.map((c) => `J’observe ${c.nom}.`),
      },
      answer: num(r(res)),
      traps: traps(r(res), [
        [r(5), 'Tout ce qu’on voit n’est pas du même type : trie les sources primaires et les objets diffusants.'],
        [r(5 - res), 'Tu as compté l’autre catégorie.'],
      ]),
      hint: 'Pour chaque ligne : l’objet produit-il sa lumière ?',
      steps: [
        `Sources primaires : ${
          choisis
            .filter((c) => c.primaire)
            .map((c) => c.nom)
            .join(', ') || 'aucune'
        }.`,
        `Objets diffusants : ${choisis
          .filter((c) => !c.primaire)
          .map((c) => c.nom)
          .join(', ')}.`,
        `La réponse est **${res}**.`,
      ],
      targetSeconds: 90,
    };
  }
  if (type === 1) {
    const s = rng.int(1, 6);
    const d = 300000 * s;
    const t = 2 * s;
    return {
      prompt: `Lis le compte rendu. Combien de secondes dure l’aller-retour de la lumière ?`,
      figure: {
        kind: 'document',
        title: 'Compte rendu (données de l’exercice)',
        lines: [
          'Un faisceau laser part d’une station vers un réflecteur dans l’espace.',
          `Distance entre la station et le réflecteur : ${fmt(r(d))} km.`,
          'Le faisceau revient à la station par le même chemin.',
          VALEUR_C,
        ],
      },
      answer: num(r(t), 's'),
      traps: traps(r(t), [
        [r(s), 'Tu n’as compté que l’aller : la lumière doit aussi revenir.'],
        [r(2 * d), 'C’est la distance totale en km, pas la durée.'],
      ]),
      hint: 'Quelle distance totale la lumière parcourt-elle ? Combien de km chaque seconde ?',
      steps: [
        `Distance totale : 2 × ${fmt(r(d))} = ${fmt(r(2 * d))} km.`,
        'Durée = distance ÷ vitesse.',
        `${fmt(r(2 * d))} ÷ 300 000 = **${t} s**.`,
      ],
      targetSeconds: 110,
    };
  }
  const n = rng.int(4, 40);
  const nom = rng.pick(['Alpha', 'Bêta', 'Gamma', 'Delta']);
  return {
    prompt: `Lis la fiche. À quelle distance, en années-lumière, se trouve l’étoile ${nom} ?`,
    figure: {
      kind: 'document',
      title: 'Fiche d’astronomie (étoile imaginaire)',
      lines: [
        `L’étoile ${nom} produit sa propre lumière.`,
        `La lumière reçue ce soir a quitté ${nom} il y a ${n} ans.`,
        'Entre l’étoile et la Terre, on suppose que la lumière voyage dans le vide.',
      ],
    },
    answer: num(r(n), 'années-lumière'),
    traps: traps(r(n), [
      [r(2 * n), 'La lumière a fait un seul trajet, de l’étoile vers la Terre.'],
      [
        r(300000 * n),
        'Une année-lumière représente déjà tout le chemin d’un an : inutile de multiplier par la vitesse.',
      ],
    ]),
    hint: 'En une année, la lumière parcourt une année-lumière.',
    steps: [
      'Une année-lumière est la distance parcourue par la lumière dans le vide en un an.',
      `La lumière a voyagé ${n} ans.`,
      `L’étoile est à **${n} années-lumière**.`,
    ],
    targetSeconds: 90,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const propagationLumiere: Skill = {
  id: 'p5-propagation-lumiere',
  title: 'La propagation de la lumière',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **source primaire** produit sa lumière (Soleil, flamme, lampe allumée) ; un **objet diffusant** (Lune, page, mur) renvoie dans toutes les directions la lumière qu’il reçoit.',
      'Dans le vide ou un milieu homogène, la lumière va en ligne droite : on la modélise par un **rayon lumineux**, et un objet opaque qui l’arrête crée une **ombre**.',
      'Elle parcourt environ 300 000 km par seconde dans le vide ; une **année-lumière** est la distance qu’elle y parcourt en un an ; ne dirige jamais un laser vers quelqu’un.',
    ],
    ...referencesSignaux(
      'sources-programme',
      'rectiligne-programme',
      'annee-lumiere-programme',
      'laser-programme',
      'lumineux',
      'diffuser',
      'lune',
      'etoile',
      'planete',
      'rayon',
      'ombre',
      'vitesse-lumiere',
      'vitesse-son',
      'annee-lumiere',
      'laser',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
