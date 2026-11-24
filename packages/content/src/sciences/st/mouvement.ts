import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, saisie } from './outils.ts';

// ——— Décrire un mouvement : forme, point de vue, distance, durée, conversions (programme du cycle 3) ———

const DROITE = 'en ligne droite (rectiligne)';
const CERCLE = 'en cercle (circulaire)';
const IMMOBILE = 'il ne bouge pas';

const CAS: readonly { scene: string; bon: string; why: string }[] = [
  {
    scene: 'Un train roule sur une voie toute droite, vu depuis le quai de la gare.',
    bon: DROITE,
    why: 'Du point de vue du quai, le train avance en ligne droite : le mouvement est rectiligne.',
  },
  {
    scene: 'Un point coloré est peint sur une toupie qui tourne autour de son axe.',
    bon: CERCLE,
    why: 'Le point tourne autour de l’axe : il décrit un cercle, le mouvement est circulaire.',
  },
  {
    scene: 'Une bille roule sur une règle bien droite posée sur le sol.',
    bon: DROITE,
    why: 'La bille suit la règle : elle avance en ligne droite, le mouvement est rectiligne.',
  },
  {
    scene: 'Le bout de l’aiguille d’une horloge fait un tour complet autour de son centre.',
    bon: CERCLE,
    why: 'Le bout de l’aiguille tourne autour du centre : il décrit un cercle.',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CAS);
  const { answer, traps: tr } = choice(
    rng,
    c.bon,
    [DROITE, CERCLE, IMMOBILE]
      .filter((x) => x !== c.bon)
      .map((x) => ({
        label: x,
        why:
          x === IMMOBILE
            ? 'L’objet bouge bien dans la scène : il se déplace.'
            : `Ce n’est pas le bon trajet : ${c.why}`,
      })),
  );
  return {
    prompt: `${c.scene} Comment l’objet se déplace-t-il ?`,
    answer,
    traps: tr,
    hint: 'Imagine le trait que laisserait l’objet : une droite ou un rond ?',
    steps: ['On imagine la trace laissée par l’objet.', c.why, `Mouvement : **${c.bon}**.`],
    targetSeconds: 20,
  };
};

const POINTS_DE_VUE: readonly { q: string; bon: string; why: string }[] = [
  {
    q: 'Tu es assis dans un train qui roule sur une voie toute droite. Par rapport au quai de la gare, comment te déplaces-tu ?',
    bon: 'tu avances en ligne droite',
    why: 'Le quai ne bouge pas et le train avance tout droit : par rapport au quai, tu avances en ligne droite.',
  },
  {
    q: 'Tu es assis dans un train qui roule sur une voie toute droite. Par rapport à ton voisin de siège, comment te déplaces-tu ?',
    bon: 'tu ne bouges pas',
    why: 'Ton voisin voyage avec toi : par rapport à lui, tu restes à la même place.',
  },
  {
    q: 'Un manège tourne. Par rapport au sol, comment se déplace un enfant assis sur un cheval de bois ?',
    bon: 'il tourne en cercle',
    why: 'Le sol ne bouge pas et le manège tourne : par rapport au sol, l’enfant décrit un cercle.',
  },
  {
    q: 'Un manège tourne. Par rapport au cheval de bois voisin, comment se déplace un enfant assis sur son cheval ?',
    bon: 'il ne bouge pas',
    why: 'Les deux chevaux tournent ensemble : par rapport au cheval voisin, l’enfant reste à la même place.',
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(POINTS_DE_VUE);
  const train = c.bon.startsWith('tu');
  const options = train
    ? ['tu avances en ligne droite', 'tu ne bouges pas', 'tu tournes en cercle']
    : ['il tourne en cercle', 'il ne bouge pas', 'il avance en ligne droite'];
  const { answer, traps: tr } = choice(
    rng,
    c.bon,
    options.filter((x) => x !== c.bon).map((x) => ({ label: x, why: `Pas cette réponse : ${c.why}` })),
  );
  return {
    prompt: c.q,
    answer,
    traps: tr,
    hint: 'Demande-toi : est-ce que la chose de référence bouge, elle aussi, avec l’objet ?',
    steps: ['Le mouvement dépend toujours du point de vue : « par rapport à… ».', c.why, `Réponse : **${c.bon}**.`],
    targetSeconds: 30,
  };
};

const TEMPS = [
  { q: 'Un robot part à 9 h 10 et s’arrête à 9 h 35.', depart: 10, arrivee: 35, h: '9 h' },
  { q: 'Un escargot mécanique part à 14 h 05 et s’arrête à 14 h 20.', depart: 5, arrivee: 20, h: '14 h' },
  { q: 'Une voiture télécommandée part à 11 h 15 et s’arrête à 11 h 50.', depart: 15, arrivee: 50, h: '11 h' },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const c = rng.pick(CAS.filter((x) => x.bon !== IMMOBILE));
    const mot = c.bon === DROITE ? 'rectiligne' : 'circulaire';
    const { answer, traps: tr } = saisie(
      c.bon === DROITE
        ? ['rectiligne', 'un mouvement rectiligne', 'mouvement rectiligne']
        : ['circulaire', 'un mouvement circulaire', 'mouvement circulaire'],
      [[c.bon === DROITE ? 'circulaire' : 'rectiligne', c.why]],
    );
    return {
      prompt: `${c.scene} Le mouvement est-il rectiligne ou circulaire ? Écris le bon mot.`,
      answer,
      traps: tr,
      hint: 'Rectiligne veut dire « en ligne droite », circulaire « en cercle ».',
      steps: ['On imagine la trace laissée par l’objet.', c.why, `Mouvement : **${mot}**.`],
      targetSeconds: 25,
    };
  }
  if (t === 1) {
    const x = rng.pick(TEMPS);
    const d = x.arrivee - x.depart;
    return {
      prompt: `${x.q} Quelle est la durée du déplacement, en minutes ?`,
      answer: num(d, 'min'),
      traps: traps(r(d), [
        [x.arrivee, 'C’est l’instant d’arrivée, pas la durée : il faut soustraire l’instant de départ.'],
        [
          x.arrivee + x.depart,
          'On ne les additionne pas : la durée est l’intervalle entre deux instants, donc une soustraction.',
        ],
      ]),
      hint: 'La durée, c’est le temps écoulé entre le départ et l’arrivée.',
      steps: [
        'La durée est l’intervalle entre deux instants : arrivée − départ.',
        `${x.arrivee} − ${x.depart}.`,
        `Durée : **${d} min**.`,
      ],
      targetSeconds: 30,
    };
  }
  const conv = rng.pick([
    { v: 3, de: 'km', vers: 'm', k: 1000 },
    { v: 4, de: 'm', vers: 'cm', k: 100 },
    { v: 2, de: 'h', vers: 'min', k: 60 },
    { v: 5, de: 'min', vers: 's', k: 60 },
  ]);
  const bon = conv.v * conv.k;
  return {
    prompt: `Convertis : ${conv.v} ${conv.de} = ? ${conv.vers}`,
    answer: num(bon, conv.vers),
    traps: traps(r(bon), [
      [conv.v, `Il faut multiplier : ${conv.v} ${conv.de} ne vaut pas ${conv.v} ${conv.vers}.`],
      [
        conv.v * (conv.k === 60 ? 100 : conv.k === 100 ? 1000 : 100),
        `1 ${conv.de} vaut ${conv.k} ${conv.vers}, pas un autre nombre.`,
      ],
    ]),
    hint: `Combien de ${conv.vers} dans 1 ${conv.de} ?`,
    steps: [`1 ${conv.de} = ${conv.k} ${conv.vers}.`, `${conv.v} × ${conv.k}.`, `Résultat : **${bon} ${conv.vers}**.`],
    targetSeconds: 30,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Associe chaque mesure à sa conversion.',
      answer: association(rng, [
        ['3 km', '3 000 m'],
        ['4 m', '400 cm'],
        ['2 h', '120 min'],
        ['3 min', '180 s'],
        ['5 cm', '50 mm'],
      ]),
      hint: 'Pour chaque unité, rappelle-toi combien il y en a dans la plus grande : 1 km, 1 m, 1 h, 1 min, 1 cm.',
      steps: [
        '1 km = 1 000 m ; 1 m = 100 cm ; 1 h = 60 min ; 1 min = 60 s ; 1 cm = 10 mm.',
        'On multiplie à chaque fois par le nombre d’unités.',
        'Chaque mesure est reliée à **sa** conversion.',
      ],
      targetSeconds: 60,
    };
  }
  const cas = rng.pick([
    {
      p: '2 h 15 min',
      un: 'min',
      bon: 135,
      e: [
        [215, 'On ne colle pas 2 et 15 : 2 h = 120 min, puis on ajoute 15 min.'],
        [17, 'Il faut convertir les heures en minutes (× 60), pas ajouter 2 et 15.'],
      ],
    },
    {
      p: '3 min 20 s',
      un: 's',
      bon: 200,
      e: [
        [320, 'On ne colle pas 3 et 20 : 3 min = 180 s, puis on ajoute 20 s.'],
        [23, 'Il faut convertir les minutes en secondes (× 60).'],
      ],
    },
    {
      p: '3 m 20 cm',
      un: 'cm',
      bon: 320,
      e: [
        [23, 'Il faut convertir les mètres en centimètres (× 100), pas ajouter 3 et 20.'],
        [3020, 'On ne colle pas 3 000 et 20 : 3 m = 300 cm, puis on additionne 300 + 20.'],
      ],
    },
    {
      p: '2 km 500 m',
      un: 'm',
      bon: 2500,
      e: [
        [502, 'Il faut convertir les kilomètres en mètres (× 1 000), pas ajouter 2 et 500.'],
        [2000500, 'On ne colle pas 2 000 et 500 : 2 km = 2 000 m, puis on additionne 2 000 + 500.'],
      ],
    },
  ] as const);
  return {
    prompt: `Convertis en ${cas.un} : ${cas.p}.`,
    answer: num(cas.bon, cas.un),
    traps: traps(
      r(cas.bon),
      cas.e.map(([v, w]) => [v, w] as const),
    ),
    hint: 'Convertis d’abord la grande unité, puis ajoute la petite.',
    steps: [
      'On convertit la grande unité dans la petite.',
      'Puis on ajoute ce qui reste.',
      `Résultat : **${cas.bon} ${cas.un}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const depart = rng.pick([40, 60, 80]);
  const arrivee = depart + 300;
  const h0 = rng.pick([10, 14]);
  const m0 = rng.pick([5, 10, 20]);
  const duree = rng.pick([7, 12, 15]);
  const fig = {
    kind: 'document' as const,
    title: 'Un robot dans la classe',
    lines: [
      'Un robot roule en ligne droite sur le sol de la classe.',
      `Il part de la marque ${depart} cm et s’arrête à la marque ${arrivee} cm.`,
      `Il part à ${h0} h ${String(m0).padStart(2, '0')} et s’arrête à ${h0} h ${String(m0 + duree).padStart(2, '0')}.`,
    ],
  };
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Lis le texte. Quelle distance le robot a-t-il parcourue, en cm ?',
      figure: fig,
      answer: num(300, 'cm'),
      traps: traps(r(300), [
        [arrivee, 'C’est la marque d’arrivée, pas la distance : il faut retirer la marque de départ.'],
        [arrivee + depart, 'On ne les additionne pas : la distance est la différence entre les deux marques.'],
      ]),
      hint: 'La distance parcourue, c’est la différence entre la marque d’arrivée et celle de départ.',
      steps: ['Distance = marque d’arrivée − marque de départ.', `${arrivee} − ${depart}.`, 'Distance : **300 cm**.'],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Lis le texte. Quelle est la durée du déplacement du robot, en minutes ?',
      figure: fig,
      answer: num(duree, 'min'),
      traps: traps(r(duree), [
        [m0 + duree, 'C’est l’instant d’arrivée : il faut retirer l’instant de départ.'],
        [m0, 'C’est la minute de départ : la durée est l’intervalle entre le départ et l’arrivée.'],
      ]),
      hint: 'Seules les minutes changent : fais arrivée − départ.',
      steps: ['La durée est l’intervalle entre deux instants.', `${m0 + duree} − ${m0}.`, `Durée : **${duree} min**.`],
      targetSeconds: 50,
    };
  }
  const { answer, traps: tr } = choice(rng, DROITE, [
    { label: CERCLE, why: 'Le texte dit que le robot roule en ligne droite, pas en cercle.' },
    { label: IMMOBILE, why: 'Le robot passe de la marque de départ à la marque d’arrivée : il bouge.' },
  ]);
  return {
    prompt: 'Lis le texte. Par rapport au sol de la classe, comment le robot se déplace-t-il ?',
    figure: fig,
    answer,
    traps: tr,
    hint: 'Relis la première ligne du texte.',
    steps: [
      'Le point de vue est le sol de la classe.',
      'Le texte dit que le robot roule en ligne droite.',
      `Mouvement : **${DROITE}**.`,
    ],
    targetSeconds: 35,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const mouvement: Skill = {
  id: 'pcm1-mouvement',
  title: 'Décrire un mouvement',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **mouvement** se décrit toujours **par rapport à** quelque chose : c’est le **point de vue**. Un train va en ligne droite (**rectiligne**) vu du quai ; un point d’une toupie tourne en cercle (**circulaire**).',
      'On le mesure : la **distance** parcourue (en m, km…) et la **durée** (le temps entre deux instants). Attention aux conversions : 1 km = 1 000 m, 1 m = 100 cm, 1 h = 60 min et 1 min = 60 s.',
    ],
    source: `${PROGRAMME} : « Observer et identifier le mouvement rectiligne ou circulaire d’un objet, en précisant le point de vue » ; « Mesurer une distance lors du déplacement d’un objet » ; « Mesurer une durée, comme intervalle entre deux instants » ; « Effectuer des conversions d’unités de distance et de temps ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
