import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { zoneIds, zoneName } from '../cartes.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, thème 1 « Découvrir le(s) lieu(x) où j’habite » (lot ge-cm1-01). Chaque fait cite le programme du
 * cycle 3 (registre `cycle3-2020`) ou une définition du TLFi (CNRTL), avec sa citation exacte ; les textes à lire
 * du niveau 5 sont écrits pour l’exercice. Les noms de régions viennent du registre des cartes (INSEE, COG 2025).
 */

const PROG_VOCAB =
  'description des milieux (relief, hydrologie, climat, végétation) et à celle des formes d’occupation humaine (ville, campagne, activités…)';
const PROG_PRATIQUER =
  'pratiquer un lieu, pour une personne, c’est en avoir l’usage et y accomplir des actes du quotidien comme le travail, les achats, les loisirs';
const PROG_HABITER =
  'habiter ne se réduit pas à résider, avoir son domicile quelque part. S’intéresser à l’habiter consiste à observer les façons dont les humains organisent et pratiquent leurs espaces de vie';
const PROG_TERRITOIRES =
  'Le(s) lieu(x) de vie de l’élève est (sont) inséré(s) dans des territoires plus vastes, région, France, Europe, monde, qu’on doit savoir reconnaître et nommer';
const PROG_LOCALISER = 'Localiser mon (mes) lieu(x) de vie et le(s) situer à différentes échelles';

// ——— Notion 1 : mon espace proche ———

const espaceProche: Notion = {
  id: 'gcm1-espace-proche',
  title: 'Mon espace proche',
  hint: 'Pense à ce que tu fais chaque jour autour de chez toi : école, courses, jeux.',
  memo: [
    '**Habiter**, ce n’est pas seulement avoir une adresse. C’est aussi **pratiquer un lieu** : y faire des courses, y jouer, y travailler.',
    'Autour de toi, regarde le **paysage** : le **relief** (colline, plaine), l’eau (**hydrologie**), le climat, les plantes.',
    'Les humains aussi laissent des traces : une ville, une campagne, des activités. Exemple : un village au bord d’une rivière.',
  ],
  faits: [
    {
      q: 'En géographie, habiter c’est…',
      a: 'observer comment les humains organisent et pratiquent leurs espaces de vie',
      wrong: [
        {
          label: 'compter les maisons d’une rue',
          why: 'On ne compte pas : on observe comment les gens vivent dans les lieux.',
        },
        {
          label: 'ranger sa chambre',
          why: 'Habiter, en géographie, concerne tous les espaces de vie, pas seulement ta chambre.',
        },
        {
          label: 'avoir une adresse, et rien d’autre',
          why: 'Le programme dit que habiter ne se réduit pas à avoir son domicile quelque part.',
        },
      ],
      gap: ['Habiter ne se réduit pas à avoir un domicile : c’est aussi ', ' les lieux de vie.', ['pratiquer']],
      quote: PROG_HABITER,
      explain: 'Habiter, c’est observer comment les humains organisent et pratiquent leurs espaces de vie.',
    },
    {
      q: 'Pratiquer un lieu, c’est…',
      a: 'en avoir l’usage et y faire des actes du quotidien',
      wrong: [
        {
          label: 'le regarder seulement sur une photo',
          why: 'Une photo ne suffit pas : pratiquer un lieu, c’est s’en servir.',
        },
        {
          label: 'dessiner sa carte',
          why: 'Dessiner une carte aide à se repérer, mais ce n’est pas pratiquer le lieu.',
        },
        { label: 'y être né', why: 'On peut pratiquer un lieu sans y être né : il suffit de s’en servir.' },
      ],
      gap: ['Pratiquer un lieu, c’est y faire des actes du quotidien : le travail, les achats, les ', '.', ['loisirs']],
      quote: PROG_PRATIQUER,
      explain: 'Pratiquer un lieu, c’est en avoir l’usage et y accomplir des actes du quotidien.',
    },
    {
      q: 'Pour décrire un milieu, on parle du relief, du climat, de la végétation et de…',
      a: 'l’hydrologie',
      wrong: [
        { label: 'la monnaie', why: 'La monnaie ne décrit pas un milieu. Le programme cite l’hydrologie.' },
        { label: 'la musique', why: 'La musique ne décrit pas un milieu. Le programme cite l’hydrologie.' },
        { label: 'la politique', why: 'La politique ne décrit pas un milieu. Le programme cite l’hydrologie.' },
      ],
      gap: ['Pour décrire un milieu : relief, ', ', climat, végétation.', ['hydrologie']],
      quote: PROG_VOCAB,
      explain: 'Le programme cite quatre mots pour décrire un milieu : relief, hydrologie, climat, végétation.',
    },
    {
      q: 'Lequel de ces mots décrit une forme d’occupation humaine ?',
      a: 'la ville',
      wrong: [
        { label: 'le relief', why: 'Le relief décrit le milieu (les hauteurs du sol), pas l’occupation humaine.' },
        { label: 'le climat', why: 'Le climat décrit le milieu, pas l’occupation humaine.' },
        { label: 'l’hydrologie', why: 'L’hydrologie décrit le milieu (l’eau), pas l’occupation humaine.' },
      ],
      gap: ['Les formes d’occupation humaine sont la ville, la ', ' et les activités.', ['campagne']],
      quote: PROG_VOCAB,
      explain: 'La ville, la campagne et les activités sont des formes d’occupation humaine.',
    },
    {
      q: 'Comment appelle-t-on la vue d’ensemble qu’offre la nature, dans une étendue de pays ?',
      a: 'un paysage',
      wrong: [
        { label: 'une adresse', why: 'Une adresse indique où habite quelqu’un. Elle ne décrit pas ce qu’on voit.' },
        { label: 'un plan de métro', why: 'Un plan est un dessin d’un réseau. Le paysage, lui, se regarde.' },
        { label: 'un horaire', why: 'Un horaire donne une heure. Le paysage est ce que tu vois autour de toi.' },
      ],
      gap: ['La vue d’ensemble que tu as depuis ta fenêtre est un ', '.', ['paysage']],
      quote: "Vue d'ensemble, qu'offre la nature, d'une étendue de pays, d'une région.",
      explain: 'Un paysage est la vue d’ensemble qu’offre la nature dans une étendue de pays.',
      src: 'cnrtl-paysage',
    },
  ],
  paires3: [
    ['Relief', 'Les hauteurs et les creux du sol'],
    ['Hydrologie', 'Tout ce qui concerne l’eau'],
    ['Végétation', 'Les plantes d’un lieu'],
  ],
  paires5: [
    ['Relief', 'Les hauteurs et les creux du sol'],
    ['Hydrologie', 'Tout ce qui concerne l’eau'],
    ['Végétation', 'Les plantes d’un lieu'],
    ['Climat', 'Le temps qu’il fait, année après année'],
    ['Paysage', 'Ce que l’on voit d’un lieu, en vue d’ensemble'],
  ],
  libres: [
    {
      q: 'Pour décrire un milieu : relief, climat, végétation et … (un mot qui parle de l’eau).',
      accepted: ['hydrologie', 'l’hydrologie'],
      traps: [
        { text: 'eau', why: 'Bonne idée ! Mais le mot du programme est « hydrologie ».' },
        { text: 'ville', why: 'La ville est une occupation humaine, pas un élément du milieu.' },
      ],
      quote: PROG_VOCAB,
      explain: 'Le mot du programme pour parler de l’eau d’un milieu est l’hydrologie.',
    },
    {
      q: 'La ville et la … sont deux formes d’occupation humaine (un mot).',
      accepted: ['campagne', 'la campagne'],
      traps: [
        { text: 'montagne', why: 'La montagne est une forme de relief : elle décrit le milieu.' },
        { text: 'météo', why: 'La météo décrit le temps qu’il fait, pas l’occupation humaine.' },
      ],
      quote: PROG_VOCAB,
      explain: 'Ville et campagne : ce sont deux formes d’occupation humaine.',
    },
    {
      q: 'Le travail, les achats et les … sont des actes du quotidien (un mot).',
      accepted: ['loisirs', 'les loisirs', 'loisir'],
      traps: [
        { text: 'vacances', why: 'Les vacances ne sont pas un acte du quotidien. Le programme cite les loisirs.' },
        { text: 'rêves', why: 'Un rêve n’est pas un acte que l’on accomplit dans un lieu.' },
      ],
      quote: PROG_PRATIQUER,
      explain: 'Le programme cite : le travail, les achats, les loisirs.',
    },
    {
      q: 'Habiter ne se réduit pas à … (un verbe : avoir son domicile quelque part).',
      accepted: ['résider', 'resider'],
      traps: [
        { text: 'voyager', why: 'Voyager, c’est se déplacer. Le mot cherché veut dire « avoir son domicile ».' },
        {
          text: 'habiter',
          why: 'C’est le mot de départ. On cherche un autre verbe, qui veut dire avoir son domicile.',
        },
      ],
      quote: PROG_HABITER,
      explain: 'Résider, c’est avoir son domicile quelque part. Habiter, c’est plus large.',
    },
  ],
  docs: [
    {
      title: 'Une semaine au village',
      lines: [
        'Une élève habite un village au pied d’une colline.',
        'Chaque matin, elle va à l’école à pied.',
        'Le mercredi, elle joue au football au stade du village.',
        'Le samedi, ses parents font les courses au marché.',
      ],
      qs: [
        {
          q: 'Que montrent toutes ces activités ?',
          a: 'qu’elle pratique les lieux de son village',
          wrong: [
            {
              label: 'qu’elle réside seulement chez elle',
              why: 'Le texte parle d’école, de stade et de marché : elle y accomplit des actes du quotidien.',
            },
            {
              label: 'qu’elle ne sort jamais de chez elle',
              why: 'Au contraire : elle va à l’école, au stade et au marché.',
            },
            {
              label: 'qu’elle n’aime pas son village',
              why: 'Le texte ne dit rien de tel : il décrit ce qu’elle fait dans ces lieux.',
            },
          ],
          quote: PROG_PRATIQUER,
          explain: 'École, loisirs, achats : elle accomplit des actes du quotidien, donc elle pratique ces lieux.',
        },
      ],
    },
    {
      title: 'Par la fenêtre',
      lines: [
        'Par la fenêtre, on voit une rivière, des champs et des collines.',
        'Au loin, on aperçoit quelques maisons et une route.',
      ],
      qs: [
        {
          q: 'Quel mot du programme décrit les collines ?',
          a: 'le relief',
          wrong: [
            {
              label: 'l’hydrologie',
              why: 'L’hydrologie parle de l’eau, comme la rivière. Les collines sont des hauteurs du sol.',
            },
            { label: 'le climat', why: 'Le climat parle du temps qu’il fait. Les collines forment le relief.' },
          ],
          quote: PROG_VOCAB,
          explain: 'Les collines sont des hauteurs du sol : c’est le relief.',
        },
        {
          q: 'Quelle forme d’occupation humaine voit-on au loin ?',
          a: 'des maisons et une route',
          wrong: [
            {
              label: 'une rivière',
              why: 'Une rivière fait partie du milieu (l’hydrologie), pas de l’occupation humaine.',
            },
            {
              label: 'des collines',
              why: 'Les collines font partie du milieu (le relief), pas de l’occupation humaine.',
            },
          ],
          quote: PROG_VOCAB,
          explain: 'Maisons et route sont faites par les humains : c’est l’occupation humaine.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la commune ———

const COMMUNE_DEF =
  "Circonscription administrative de base placée sous l'autorité d'un maire assisté d'adjoints et d'un conseil municipal";

const commune: Notion = {
  id: 'gcm1-commune',
  title: 'La commune',
  hint: 'Pense au village ou à la ville où tu habites, et à son maire.',
  memo: [
    'Ta **commune** est ton village ou ta ville. Elle est dirigée par un **maire**.',
    'Le maire est aidé par des adjoints et par un **conseil municipal**.',
    'Ta commune est dans un territoire plus vaste : une **région**, puis la France. Tu apprends à la **localiser** sur une carte.',
  ],
  faits: [
    {
      q: 'Qu’est-ce que la commune, en France ?',
      a: 'la division administrative de base',
      wrong: [
        {
          label: 'une montagne',
          why: 'Une montagne est une forme de relief. La commune est un territoire administré.',
        },
        { label: 'un fleuve', why: 'Un fleuve est un cours d’eau. La commune est un territoire administré.' },
        { label: 'une région', why: 'Une région est un territoire plus vaste : ta commune est dans une région.' },
      ],
      gap: ['La commune est la circonscription administrative de ', '.', ['base']],
      quote: COMMUNE_DEF,
      explain: 'La commune est la circonscription administrative de base.',
      src: 'cnrtl-commune',
    },
    {
      q: 'Qui a l’autorité sur une commune ?',
      a: 'le maire',
      wrong: [
        { label: 'le facteur', why: 'Le facteur distribue le courrier. La commune est sous l’autorité d’un maire.' },
        { label: 'le directeur de l’école', why: 'Il dirige une école. La commune est sous l’autorité d’un maire.' },
        { label: 'un adjoint', why: 'L’adjoint assiste le maire, mais l’autorité est celle du maire.' },
      ],
      gap: ['Une commune est placée sous l’autorité du ', '.', ['maire']],
      quote: COMMUNE_DEF,
      explain: 'La commune est placée sous l’autorité d’un maire.',
      src: 'cnrtl-commune',
    },
    {
      q: 'Qui aide le maire à diriger la commune ?',
      a: 'des adjoints et un conseil municipal',
      wrong: [
        {
          label: 'des pompiers',
          why: 'Les pompiers ne sont pas cités. Le maire est assisté d’adjoints et d’un conseil municipal.',
        },
        {
          label: 'des commerçants',
          why: 'Les commerçants ne sont pas cités. Le maire est assisté d’adjoints et d’un conseil municipal.',
        },
        {
          label: 'des arbitres',
          why: 'Les arbitres ne sont pas cités. Le maire est assisté d’adjoints et d’un conseil municipal.',
        },
      ],
      gap: ['Le maire est assisté d’adjoints et d’un conseil ', '.', ['municipal']],
      quote: COMMUNE_DEF,
      explain: 'Le maire est assisté d’adjoints et d’un conseil municipal.',
      src: 'cnrtl-commune',
    },
    {
      q: 'Ta commune est insérée dans un territoire plus vaste. Lequel ?',
      a: 'la région',
      wrong: [
        { label: 'ta rue', why: 'Ta rue est plus petite que ta commune. Il faut un territoire plus vaste.' },
        { label: 'ta classe', why: 'Ta classe est plus petite que ta commune. Il faut un territoire plus vaste.' },
        { label: 'ton immeuble', why: 'Ton immeuble est plus petit que ta commune. Il faut un territoire plus vaste.' },
      ],
      gap: ['Ta commune est dans un territoire plus vaste : la ', ', puis la France.', ['région']],
      quote: PROG_TERRITOIRES,
      explain: 'Le programme cite des territoires plus vastes : la région, puis la France, l’Europe et le monde.',
    },
    {
      q: 'Au CM1, que fais-tu avec ton lieu de vie sur une carte ?',
      a: 'je le localise et je le situe à différentes échelles',
      wrong: [
        { label: 'je le déménage', why: 'Un lieu ne se déplace pas : on le repère sur la carte.' },
        { label: 'je le renomme', why: 'On garde son nom : on apprend à le placer sur la carte.' },
        { label: 'je le pèse', why: 'Un lieu ne se pèse pas : on le repère sur la carte.' },
      ],
      gap: ['Tu apprends à ', ' ton lieu de vie sur une carte.', ['localiser']],
      quote: PROG_LOCALISER,
      explain: 'Le programme demande de localiser son lieu de vie et de le situer à différentes échelles.',
    },
  ],
  paires3: [
    ['Commune', 'La division administrative de base'],
    ['Maire', 'Celui qui a l’autorité sur la commune'],
    ['Région', 'Un territoire plus vaste qui contient ta commune'],
  ],
  paires5: [
    ['Commune', 'La division administrative de base'],
    ['Maire', 'Celui qui a l’autorité sur la commune'],
    ['Région', 'Un territoire plus vaste qui contient ta commune'],
    ['Échelle', 'La taille à laquelle on regarde un lieu'],
    ['Localiser', 'Dire où se trouve un lieu'],
  ],
  libres: [
    {
      q: 'Une commune est placée sous l’autorité d’un … (un mot).',
      accepted: ['maire', 'le maire', 'un maire'],
      traps: [
        { text: 'roi', why: 'Il n’y a pas de roi pour une commune. Elle est sous l’autorité d’un maire.' },
        { text: 'directeur', why: 'Un directeur dirige une école. La commune est sous l’autorité d’un maire.' },
      ],
      quote: COMMUNE_DEF,
      explain: 'La commune est placée sous l’autorité d’un maire.',
      src: 'cnrtl-commune',
    },
    {
      q: 'Le maire est assisté d’adjoints et d’un conseil … (un mot).',
      accepted: ['municipal', 'le conseil municipal'],
      traps: [
        { text: 'scolaire', why: 'Un conseil scolaire parle de l’école. Pour la commune, on dit conseil municipal.' },
        { text: 'sportif', why: 'Un conseil sportif parle de sport. Pour la commune, on dit conseil municipal.' },
      ],
      quote: COMMUNE_DEF,
      explain: 'Le maire est assisté d’adjoints et d’un conseil municipal.',
      src: 'cnrtl-commune',
    },
    {
      q: 'Tu dois localiser ton lieu de vie et le situer à différentes … (un mot).',
      accepted: ['échelles', 'echelles', 'échelle'],
      traps: [
        { text: 'distances', why: 'On parle d’échelles : commune, région, France, Europe, monde.' },
        { text: 'couleurs', why: 'On parle d’échelles, pas de couleurs : commune, région, France…' },
      ],
      quote: PROG_LOCALISER,
      explain: 'On situe son lieu de vie à différentes échelles : de la commune au monde.',
    },
  ],
  docs: [
    {
      title: 'À la mairie',
      lines: [
        'Dans un village, une personne reçoit les habitants.',
        'Elle est aidée par deux adjoints et par un conseil municipal.',
        'Ensemble, ils s’occupent de la commune.',
      ],
      qs: [
        {
          q: 'Qui a l’autorité sur cette commune ?',
          a: 'le maire',
          wrong: [
            { label: 'un adjoint', why: 'Les adjoints aident la personne qui reçoit les habitants : le maire.' },
            {
              label: 'un habitant pris au hasard',
              why: 'Une commune est placée sous l’autorité du maire, pas d’un habitant au hasard.',
            },
          ],
          quote: COMMUNE_DEF,
          explain: 'La personne aidée par des adjoints et un conseil municipal est le maire.',
          src: 'cnrtl-commune',
        },
      ],
    },
    {
      title: 'Où est ma commune ?',
      lines: [
        'Une élève cherche sa commune sur une carte de France.',
        'Elle la trouve d’abord dans sa région.',
        'Ensuite, elle regarde où se trouve la France en Europe.',
      ],
      qs: [
        {
          q: 'Que fait cette élève ?',
          a: 'elle situe son lieu de vie à différentes échelles',
          wrong: [
            { label: 'elle change de commune', why: 'Elle ne déménage pas : elle regarde une carte.' },
            {
              label: 'elle mesure sa commune',
              why: 'Elle ne mesure rien : elle la repère sur la carte, de plus en plus loin.',
            },
          ],
          quote: PROG_LOCALISER,
          explain: 'Commune, région, France, Europe : elle situe son lieu de vie à différentes échelles.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : la France sur la carte ———

/** Régions de l'Hexagone et de Corse du registre des cartes (INSEE, COG 2025). */
const REGIONS_CARTE = zoneIds('france-regions');
/** Régions les plus connues : niveaux 1 et 3. */
const REGIONS_FACILES = ['53', '94', '11', '93', '75', '84', '44', '76'];
const nom = (map: 'france-regions' | 'europe' | 'monde', zone: string) => zoneName(map, zone) ?? zone;

const others = (rng: Rng, list: readonly string[], skip: string, n: number) =>
  rng.shuffle(list.filter((x) => x !== skip)).slice(0, n);

/** Question de carte : repère A sur une région, un pays ou un continent (niveaux 1 et 2). */
function repereA(rng: Rng, level: Level): QuestionDraft {
  const n = level === 1 ? 2 : 3;
  const kind = rng.int(0, 2);
  const prefix = level === 1 ? '' : 'Attention aux pièges ! ';
  if (kind === 0) {
    const pool = level === 1 ? REGIONS_FACILES : REGIONS_CARTE;
    const z = rng.pick(pool);
    const wrong = others(rng, pool, z, n).map((o) => ({
      label: nom('france-regions', o),
      why: `${nom('france-regions', o)} est une autre région : regarde bien où est placé le repère A.`,
    }));
    return {
      prompt: `${prefix}Sur cette carte de la France, quelle région porte le repère A ?`,
      figure: { kind: 'map', map: 'france-regions', highlight: [z], marks: [{ zone: z, label: 'A' }] },
      ...choice(rng, nom('france-regions', z), wrong),
      hint: 'Les régions ont chacune un nom : cherche celle qui est repérée par la lettre A.',
      steps: [
        'Le repère A est posé au centre d’une région de la carte.',
        'On regarde où elle se trouve : nord, sud, bord de mer, île…',
        `Le repère A montre la région **${nom('france-regions', z)}**.`,
      ],
      targetSeconds: 25,
    };
  }
  if (kind === 1) {
    const pool = ['esp', 'deu', 'ita', 'bel', 'che', 'prt', 'gbr'];
    const wrong = others(rng, pool, 'fra', n).map((o) => ({
      label: nom('europe', o),
      why: `${nom('europe', o)} est un pays voisin de la France : ce n’est pas celui du repère A.`,
    }));
    return {
      prompt: `${prefix}Sur cette carte de l’Europe, quel pays porte le repère A ?`,
      figure: { kind: 'map', map: 'europe', highlight: ['fra'], marks: [{ zone: 'fra', label: 'A' }] },
      ...choice(rng, 'France', wrong),
      hint: 'Tu habites dans ce pays : cherche-le sur la carte de l’Europe.',
      steps: [
        'La carte montre l’Europe, avec plusieurs pays.',
        'Le repère A est posé sur le pays où tu habites.',
        'Le repère A montre la **France**.',
      ],
      targetSeconds: 25,
    };
  }
  const pool = ['afrique', 'asie', 'amerique-nord', 'amerique-sud', 'oceanie'];
  const wrong = others(rng, pool, 'europe', n).map((o) => ({
    label: nom('monde', o),
    why: `${nom('monde', o)} est un autre continent : ce n’est pas celui du repère A.`,
  }));
  return {
    prompt: `${prefix}Sur ce planisphère, quel continent porte le repère A ?`,
    figure: { kind: 'map', map: 'monde', highlight: ['europe'], marks: [{ zone: 'europe', label: 'A' }] },
    ...choice(rng, 'Europe', wrong),
    hint: 'La France se trouve sur ce continent.',
    steps: [
      'Le planisphère montre le monde entier.',
      'Le repère A est posé sur le continent où se trouve la France.',
      'Le repère A montre l’**Europe**.',
    ],
    targetSeconds: 25,
  };
}

/** Toucher une région sur la carte (niveaux 3 et 4). */
function toucherRegion(rng: Rng, level: Level): QuestionDraft {
  const pool = level === 3 ? REGIONS_FACILES : REGIONS_CARTE;
  const z = rng.pick(pool);
  const traps: Trap[] = others(rng, pool, z, 2).map((o) => ({
    zone: o,
    why: `Tu as touché ${nom('france-regions', o)}. Cherche ${nom('france-regions', z)}.`,
  }));
  return {
    prompt: `Touche la région **${nom('france-regions', z)}** sur la carte.`,
    figure: { kind: 'map', map: 'france-regions' },
    answer: { kind: 'zone', map: 'france-regions', zone: z },
    traps,
    hint: 'Repère d’abord si la région est au nord, au sud, à l’est ou à l’ouest.',
    steps: [
      `On cherche la région ${nom('france-regions', z)} sur la carte de la France.`,
      'On part d’un repère connu : la mer, la frontière ou une grande ville.',
      `La région **${nom('france-regions', z)}** est celle que tu dois toucher.`,
    ],
    targetSeconds: 30,
  };
}

/** Lecture de carte avec trois repères (niveau 5). */
function troisReperes(rng: Rng): QuestionDraft {
  const [a, b, c] = rng.shuffle(REGIONS_CARTE).slice(0, 3) as [string, string, string];
  const reperes = [
    { letter: 'A', zone: a },
    { letter: 'B', zone: b },
    { letter: 'C', zone: c },
  ];
  const target = reperes[rng.int(0, 2)] ?? { letter: 'A', zone: a };
  const cible = nom('france-regions', target.zone);
  const wrong = reperes
    .filter((r) => r.letter !== target.letter)
    .map((r) => ({
      label: r.letter,
      why: `Le repère ${r.letter} montre ${nom('france-regions', r.zone)}, pas ${cible}.`,
    }));
  return {
    prompt: `Sur cette carte, trois régions sont repérées. Quel repère montre la région **${cible}** ?`,
    figure: {
      kind: 'map',
      map: 'france-regions',
      highlight: reperes.map((r) => r.zone),
      marks: reperes.map((r) => ({ zone: r.zone, label: r.letter })),
    },
    ...choice(rng, target.letter, wrong, true),
    hint: 'Place d’abord la région sur la carte de France, puis regarde la lettre posée dessus.',
    steps: [
      `On cherche où se trouve la région ${cible}.`,
      'On compare avec la position des trois lettres A, B et C.',
      `La région ${cible} porte le repère **${target.letter}**.`,
    ],
    targetSeconds: 45,
  };
}

const carteFrance = (rng: Rng, level: Level): QuestionDraft | undefined => {
  if (level <= 2) return repereA(rng, level);
  if (level <= 4) return toucherRegion(rng, level);
  return troisReperes(rng);
};

const NB_REGIONS = REGIONS_CARTE.length;
const COG_QUOTE = `Régions de France métropolitaine, Code officiel géographique 2025 : ${REGIONS_CARTE.map((z) => nom('france-regions', z)).join(', ')}`;

const franceCarte: Notion = {
  id: 'gcm1-france-carte',
  title: 'La France sur la carte',
  hint: 'Pense aux poupées russes : ta commune, ta région, la France, l’Europe, le monde.',
  memo: [
    'Ton lieu de vie est dans une **commune**, qui est dans une **région**, dans la France, en Europe, dans le monde. Ce sont des **échelles**.',
    'Sur la carte de la France métropolitaine, on repère les régions : Bretagne, Occitanie, Corse…',
    'Un **repère** est un lieu qu’on sait nommer et placer sur la carte.',
  ],
  faits: [
    {
      q: 'Quel est le plus vaste de ces territoires ?',
      a: 'le monde',
      wrong: [
        { label: 'la région', why: 'La région est le plus petit des quatre. Le monde les contient tous.' },
        { label: 'la France', why: 'La France est plus petite que l’Europe et que le monde.' },
        { label: 'l’Europe', why: 'L’Europe est plus petite que le monde.' },
      ],
      gap: ['Du plus petit au plus grand : région, France, Europe, le ', '.', ['monde']],
      quote: PROG_TERRITOIRES,
      explain: 'Le programme cite dans l’ordre : région, France, Europe, monde.',
    },
    {
      q: 'Quel territoire réunit la France et ses voisins comme l’Espagne, l’Allemagne et l’Italie ?',
      a: 'l’Europe',
      wrong: [
        { label: 'la commune', why: 'La commune est bien plus petite que la France.' },
        { label: 'la région', why: 'La région est plus petite que la France : elle ne peut pas contenir ses voisins.' },
        { label: 'le quartier', why: 'Un quartier est une toute petite partie d’une ville.' },
      ],
      gap: ['La France, l’Espagne, l’Allemagne et l’Italie sont en ', '.', ['Europe']],
      quote: PROG_TERRITOIRES,
      explain: 'Après la France vient l’Europe, qui réunit la France et ses voisins.',
    },
    {
      q: 'Dans quelle liste les territoires vont-ils du plus petit au plus grand ?',
      a: 'région, France, Europe, monde',
      wrong: [
        {
          label: 'monde, Europe, France, région',
          why: 'Cette liste est dans l’ordre inverse : elle va du plus grand au plus petit.',
        },
        { label: 'France, région, monde, Europe', why: 'La région est plus petite que la France : elle passe avant.' },
        {
          label: 'Europe, région, monde, France',
          why: 'Cette liste est mélangée : la région est la plus petite, le monde le plus grand.',
        },
      ],
      gap: ['Après la région vient la ', ', puis l’Europe, puis le monde.', ['France']],
      quote: PROG_TERRITOIRES,
      explain: 'Du plus petit au plus grand : région, France, Europe, monde.',
    },
    {
      q: 'Combien de régions montre la carte de la France métropolitaine ?',
      a: String(NB_REGIONS),
      wrong: [
        { label: '2', why: `La carte montre ${NB_REGIONS} régions, pas 2.` },
        {
          label: '5',
          why: `5 est le nombre de régions d’outre-mer, qui ne sont pas sur cette carte. Il y en a ${NB_REGIONS}.`,
        },
        {
          label: '18',
          why: `18 compte aussi l’outre-mer. La carte de la France métropolitaine en montre ${NB_REGIONS}.`,
        },
      ],
      gap: ['La carte de la France métropolitaine montre ', ' régions.', [String(NB_REGIONS)]],
      quote: COG_QUOTE,
      explain: `La carte de la France métropolitaine compte ${NB_REGIONS} régions, Corse comprise.`,
      src: 'insee-cog-2025',
    },
  ],
  paires3: [
    ['Commune', 'Le village ou la ville où tu habites'],
    ['Région', 'Un territoire de France qui regroupe des communes'],
    ['Europe', 'Le continent où se trouve la France'],
  ],
  paires5: [
    ['Commune', 'Le village ou la ville où tu habites'],
    ['Région', 'Un territoire de France qui regroupe des communes'],
    ['Europe', 'Le continent où se trouve la France'],
    ['France', 'Le pays où tu habites'],
    ['Monde', 'Tous les continents et tous les océans'],
  ],
  ordre: ['Ma commune', 'Ma région', 'La France', 'L’Europe', 'Le monde'],
  libres: [
    {
      q: 'Du plus petit au plus grand : commune, région, France, … , monde (un mot).',
      accepted: ['Europe', 'l’Europe'],
      traps: [
        { text: 'Asie', why: 'L’Asie est un autre continent. La France est en Europe.' },
        { text: 'Afrique', why: 'L’Afrique est un autre continent. La France est en Europe.' },
      ],
      quote: PROG_TERRITOIRES,
      explain: 'Après la France vient l’Europe, puis le monde.',
    },
    {
      q: 'Parmi région, France, Europe et monde, lequel est le plus vaste (un mot) ?',
      accepted: ['monde', 'le monde'],
      traps: [
        { text: 'Europe', why: 'L’Europe est vaste, mais le monde la contient.' },
        { text: 'France', why: 'La France est plus petite que l’Europe et le monde.' },
      ],
      quote: PROG_TERRITOIRES,
      explain: 'Le monde est le plus vaste : il contient la région, la France et l’Europe.',
    },
    {
      q: 'La France métropolitaine compte … régions sur la carte (un nombre).',
      accepted: [String(NB_REGIONS), 'treize'],
      traps: [
        {
          text: '18',
          why: `18 compte aussi l’outre-mer. La carte de la France métropolitaine en montre ${NB_REGIONS}.`,
        },
        {
          text: '5',
          why: `5 est le nombre de régions d’outre-mer. La carte de la France métropolitaine en montre ${NB_REGIONS}.`,
        },
      ],
      quote: COG_QUOTE,
      explain: `La carte de la France métropolitaine compte ${NB_REGIONS} régions.`,
      src: 'insee-cog-2025',
    },
  ],
  docs: [
    {
      title: 'Un voyage sur la carte',
      lines: [
        'Une élève part de sa commune.',
        'Elle regarde d’abord sa région.',
        'Puis elle ouvre une carte de la France, de l’Europe et du monde.',
      ],
      qs: [
        {
          q: 'Dans quel ordre agrandit-elle sa vue ?',
          a: 'commune, région, France, Europe, monde',
          wrong: [
            {
              label: 'monde, Europe, France, région, commune',
              why: 'Elle part de sa commune, le plus petit : elle ne commence pas par le monde.',
            },
            {
              label: 'commune, France, région, monde, Europe',
              why: 'La région est plus petite que la France : elle vient avant.',
            },
          ],
          quote: PROG_TERRITOIRES,
          explain: 'Elle va du plus petit au plus grand : commune, région, France, Europe, monde.',
        },
      ],
    },
    {
      title: 'Une lettre de correspondante',
      lines: [
        'Une élève écrit à sa correspondante :',
        '« J’habite en France, en Europe.',
        'Ma commune est dans une région au bord de la mer. »',
      ],
      qs: [
        {
          q: 'Quel est le plus vaste des territoires cités dans la lettre ?',
          a: 'l’Europe',
          wrong: [
            { label: 'la France', why: 'La France est citée, mais elle est plus petite que l’Europe.' },
            { label: 'la région', why: 'La région est plus petite que la France et que l’Europe.' },
          ],
          quote: PROG_TERRITOIRES,
          explain: 'Région, France, Europe : l’Europe est la plus vaste des trois.',
        },
      ],
    },
  ],
  carte: carteFrance,
};

// ——— Notion 4 : grands repères (fleuves, massifs) ———

const FLEUVE_DEF =
  "Cours d'eau important, généralement caractérisé par une très grande longueur et largeur, un débit abondant, des affluents nombreux, et qui se jette le plus souvent dans la mer.";
const MASSIF_DEF = 'Massif montagneux ou, elliptiquement, massif, ensemble de hauteurs, de montagnes.';
const MONT_BLANC_DEF = "Le massif du Mont-Blanc, l'ensemble des hauteurs groupées autour du mont Blanc.";
const MONTAGNE_DEF =
  "Forme de relief consistant en élévations importantes de terrains, résultant d'un soulèvement du sol et caractérisée par une forte dénivellation entre sommets et fonds de vallées.";
const PROG_REPERES = 'Nommer et localiser les grands repères géographiques.';

const grandsReperes: Notion = {
  id: 'gcm1-grands-reperes',
  title: 'Grands repères (fleuves, massifs)',
  hint: 'Un fleuve, c’est de l’eau qui coule. Un massif, ce sont des montagnes groupées.',
  memo: [
    'Un **fleuve** est un grand cours d’eau qui se jette le plus souvent dans la mer.',
    'Un **massif** est un ensemble de montagnes. Exemple : le massif du Mont-Blanc.',
    'Fleuves et massifs sont des **repères** : on apprend à les nommer et à les placer sur une carte.',
  ],
  faits: [
    {
      q: 'Comment appelle-t-on un grand cours d’eau qui se jette le plus souvent dans la mer ?',
      a: 'un fleuve',
      wrong: [
        { label: 'un massif', why: 'Un massif est un ensemble de montagnes, pas un cours d’eau.' },
        { label: 'une commune', why: 'Une commune est un territoire administré, pas un cours d’eau.' },
        { label: 'un ruisseau', why: 'Le fleuve est un cours d’eau important, pas un petit ruisseau.' },
      ],
      gap: ['Un grand cours d’eau qui se jette dans la mer est un ', '.', ['fleuve']],
      quote: FLEUVE_DEF,
      explain: 'Un fleuve est un cours d’eau important qui se jette le plus souvent dans la mer.',
      src: 'cnrtl-fleuve',
    },
    {
      q: 'Un massif, c’est…',
      a: 'un ensemble de montagnes',
      wrong: [
        { label: 'un grand cours d’eau', why: 'Un grand cours d’eau est un fleuve. Un massif regroupe des montagnes.' },
        {
          label: 'un groupe de maisons',
          why: 'Un groupe de maisons est un village. Un massif regroupe des montagnes.',
        },
        {
          label: 'une vue d’ensemble sur la nature',
          why: 'La vue d’ensemble est le paysage. Un massif regroupe des montagnes.',
        },
      ],
      gap: ['Un massif est un ensemble de ', '.', ['montagnes', 'hauteurs']],
      quote: MASSIF_DEF,
      explain: 'Un massif est un ensemble de hauteurs, de montagnes.',
      src: 'cnrtl-massif',
    },
    {
      q: 'Que désigne « le massif du Mont-Blanc » ?',
      a: 'l’ensemble des hauteurs groupées autour du mont Blanc',
      wrong: [
        {
          label: 'un fleuve qui coule près du mont Blanc',
          why: 'Un massif n’est pas un cours d’eau : c’est un ensemble de hauteurs.',
        },
        {
          label: 'une ville au pied du mont Blanc',
          why: 'Un massif n’est pas une ville : c’est un ensemble de hauteurs.',
        },
        {
          label: 'une région de France',
          why: 'Un massif n’est pas une région administrative : c’est un ensemble de hauteurs.',
        },
      ],
      gap: ['Le massif du Mont-Blanc est l’ensemble des ', ' groupées autour du mont Blanc.', ['hauteurs']],
      quote: MONT_BLANC_DEF,
      explain: 'Le massif du Mont-Blanc est l’ensemble des hauteurs groupées autour du mont Blanc.',
      src: 'cnrtl-massif',
    },
    {
      q: 'Un fleuve se jette le plus souvent dans…',
      a: 'la mer',
      wrong: [
        { label: 'une montagne', why: 'L’eau d’un fleuve descend vers la mer, elle ne remonte pas une montagne.' },
        { label: 'un champ', why: 'Un fleuve est un cours d’eau important : il se jette le plus souvent dans la mer.' },
        {
          label: 'une ville',
          why: 'Un fleuve peut traverser une ville, mais il se jette le plus souvent dans la mer.',
        },
      ],
      gap: ['Un fleuve se jette le plus souvent dans la ', '.', ['mer']],
      quote: FLEUVE_DEF,
      explain: 'Un fleuve se jette le plus souvent dans la mer.',
      src: 'cnrtl-fleuve',
    },
    {
      q: 'Une montagne est une forme de…',
      a: 'relief',
      wrong: [
        { label: 'hydrologie', why: 'L’hydrologie parle de l’eau. Une montagne est une élévation du sol : un relief.' },
        { label: 'climat', why: 'Le climat parle du temps. Une montagne est une élévation du sol : un relief.' },
        {
          label: 'végétation',
          why: 'La végétation parle des plantes. Une montagne est une élévation du sol : un relief.',
        },
      ],
      gap: ['Une montagne est une forme de ', '.', ['relief']],
      quote: MONTAGNE_DEF,
      explain: 'Une montagne est une forme de relief : une élévation importante du sol.',
      src: 'cnrtl-montagne',
    },
    {
      q: 'Que fait-on avec les grands repères géographiques, comme les fleuves et les massifs ?',
      a: 'on les nomme et on les localise',
      wrong: [
        { label: 'on les déplace', why: 'Un fleuve ou un massif ne se déplace pas : on le repère sur la carte.' },
        { label: 'on les compte en kilos', why: 'On ne pèse pas un repère : on apprend son nom et sa place.' },
        { label: 'on les efface', why: 'On ne les efface pas : on apprend à les nommer et à les placer.' },
      ],
      gap: ['Pour un repère géographique, on sait le nommer et le ', ' sur la carte.', ['localiser', 'situer']],
      quote: PROG_REPERES,
      explain: 'Le programme demande de nommer et de localiser les grands repères géographiques.',
    },
  ],
  paires3: [
    ['Fleuve', 'Grand cours d’eau qui se jette dans la mer'],
    ['Massif', 'Ensemble de montagnes'],
    ['Repère', 'Lieu qu’on sait nommer et placer sur une carte'],
  ],
  paires5: [
    ['Fleuve', 'Grand cours d’eau qui se jette dans la mer'],
    ['Massif', 'Ensemble de montagnes'],
    ['Repère', 'Lieu qu’on sait nommer et placer sur une carte'],
    ['Montagne', 'Forme de relief aux sommets élevés'],
    ['Relief', 'Les hauteurs et les creux du sol'],
  ],
  libres: [
    {
      q: 'Un grand cours d’eau qui se jette dans la mer s’appelle un … (un mot).',
      accepted: ['fleuve', 'un fleuve'],
      traps: [
        { text: 'massif', why: 'Un massif est un ensemble de montagnes, pas un cours d’eau.' },
        { text: 'paysage', why: 'Un paysage est une vue d’ensemble, pas un cours d’eau.' },
      ],
      quote: FLEUVE_DEF,
      explain: 'Le grand cours d’eau qui se jette dans la mer est un fleuve.',
      src: 'cnrtl-fleuve',
    },
    {
      q: 'Un ensemble de montagnes s’appelle un … (un mot).',
      accepted: ['massif', 'un massif'],
      traps: [
        { text: 'fleuve', why: 'Un fleuve est un cours d’eau, pas un ensemble de montagnes.' },
        { text: 'paysage', why: 'Un paysage est une vue d’ensemble, pas un ensemble de montagnes.' },
      ],
      quote: MASSIF_DEF,
      explain: 'Un ensemble de hauteurs, de montagnes, est un massif.',
      src: 'cnrtl-massif',
    },
    {
      q: 'Le massif du Mont-Blanc est l’ensemble des … groupées autour du mont Blanc (un mot).',
      accepted: ['hauteurs', 'montagnes'],
      traps: [
        { text: 'maisons', why: 'Un massif est fait de reliefs, pas de maisons.' },
        { text: 'rivières', why: 'Un massif est fait de reliefs, pas de cours d’eau.' },
      ],
      quote: MONT_BLANC_DEF,
      explain: 'Le massif du Mont-Blanc est l’ensemble des hauteurs groupées autour du mont Blanc.',
      src: 'cnrtl-massif',
    },
    {
      q: 'Une montagne est une forme de … (un mot : les hauteurs du sol).',
      accepted: ['relief', 'le relief'],
      traps: [
        { text: 'climat', why: 'Le climat parle du temps qu’il fait, pas des hauteurs du sol.' },
        { text: 'végétation', why: 'La végétation parle des plantes, pas des hauteurs du sol.' },
      ],
      quote: MONTAGNE_DEF,
      explain: 'Une montagne est une élévation du sol : une forme de relief.',
      src: 'cnrtl-montagne',
    },
  ],
  docs: [
    {
      title: 'Une randonnée',
      lines: [
        'Un groupe de randonneurs marche dans les montagnes.',
        'Autour d’eux, de nombreux sommets forment un ensemble de montagnes.',
        'En bas, un grand cours d’eau coule vers la mer.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on l’ensemble de montagnes autour d’eux ?',
          a: 'un massif',
          wrong: [
            { label: 'un fleuve', why: 'Un fleuve est un cours d’eau. Un ensemble de montagnes est un massif.' },
            { label: 'un paysage', why: 'Un paysage est une vue d’ensemble. Un ensemble de montagnes est un massif.' },
          ],
          quote: MASSIF_DEF,
          explain: 'Un ensemble de montagnes s’appelle un massif.',
          src: 'cnrtl-massif',
        },
        {
          q: 'Comment appelle-t-on le grand cours d’eau qui coule vers la mer ?',
          a: 'un fleuve',
          wrong: [
            { label: 'un massif', why: 'Un massif est un ensemble de montagnes, pas un cours d’eau.' },
            { label: 'une commune', why: 'Une commune est un territoire administré, pas un cours d’eau.' },
          ],
          quote: FLEUVE_DEF,
          explain: 'Un grand cours d’eau qui se jette dans la mer est un fleuve.',
          src: 'cnrtl-fleuve',
        },
      ],
    },
    {
      title: 'Au pied du mont Blanc',
      lines: ['Une ville est installée au pied du mont Blanc.', 'Sur la carte, on lit : « massif du Mont-Blanc ».'],
      qs: [
        {
          q: 'Que désigne « massif du Mont-Blanc » sur cette carte ?',
          a: 'l’ensemble des hauteurs groupées autour du mont Blanc',
          wrong: [
            {
              label: 'la ville au pied de la montagne',
              why: 'La ville est citée à part. Le massif désigne les hauteurs.',
            },
            {
              label: 'un fleuve qui descend de la montagne',
              why: 'Un massif n’est pas un cours d’eau : c’est un ensemble de hauteurs.',
            },
          ],
          quote: MONT_BLANC_DEF,
          explain: 'Le massif du Mont-Blanc est l’ensemble des hauteurs groupées autour du mont Blanc.',
          src: 'cnrtl-massif',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [espaceProche, commune, franceCarte, grandsReperes];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
