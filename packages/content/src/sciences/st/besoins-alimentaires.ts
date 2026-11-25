import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Besoins alimentaires : grandir et bouger (programme du cycle 3, CNRTL, Santé publique France) ———
// Les « points de besoin » des documents sont inventés : ils servent à lire des données, pas à fixer des rations.
// Leur sens de variation suit les textes cités : plus de la maternelle à l’adolescence (repas de midi, BO 2001),
// et plus avec l’activité physique.

const ACTIVITES = ['monter les escaliers', 'rouler à vélo', 'jouer au ballon', 'sauter à la corde', 'porter un sac'];
const REPOS = ['dormir', 'regarder un film assis', 'lire allongé', 'écouter une histoire assis'];

/** Élèves comparés, du plus jeune au plus âgé. */
const AGES = [
  { qui: 'un élève de maternelle', court: 'maternelle' },
  { qui: 'un élève d’école élémentaire', court: 'école élémentaire' },
  { qui: 'un adolescent', court: 'adolescence' },
] as const;

/** Trois besoins inventés au calme, strictement croissants avec l’âge. */
const parAge = (rng: Rng) => {
  const petit = rng.pick([40, 45, 50]);
  const moyen = petit + rng.pick([15, 20]);
  return [petit, moyen, moyen + rng.pick([15, 20])] as const;
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 1);
  if (t === 0) {
    const bon = rng.pick(ACTIVITES);
    const { answer, traps } = choice(
      rng,
      bon,
      rng
        .shuffle(REPOS)
        .slice(0, 2)
        .map((label) => ({
          label,
          why: 'Là, ton corps bouge très peu. On cherche un moment où les muscles travaillent.',
        })),
    );
    return {
      prompt: 'Quel exemple est une activité physique ?',
      answer,
      traps,
      hint: 'Dans lequel tes muscles te font-ils vraiment bouger ?',
      steps: ['Une activité physique fait bouger le corps grâce aux muscles.', `La réponse est **${bon}**.`],
      targetSeconds: 15,
    };
  }
  const cas = rng.pick([
    { q: 'Pour grandir, de quoi ton corps a-t-il besoin ?', bon: 'd’aliments' },
    { q: 'Qu’est-ce qui apporte au corps de quoi grandir et rester en vie ?', bon: 'les aliments' },
  ]);
  const { answer, traps } = choice(rng, cas.bon, [
    { label: 'de jouets', why: 'Un jouet amuse, mais il ne fournit rien pour grandir. Ce sont les aliments.' },
    { label: 'de cahiers', why: 'Un cahier ne se mange pas. Pour grandir, il faut des aliments.' },
  ]);
  return {
    prompt: cas.q,
    answer,
    traps,
    hint: 'Pense à ce que tu mets dans ton assiette.',
    steps: ['Le corps tire ce qu’il lui faut de ce qu’il consomme.', `La réponse est **${cas.bon}**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const points = parAge(rng);
    const grand = rng.int(0, 1) === 0;
    const bon = AGES[grand ? 2 : 0].qui;
    const { answer, traps } = choice(
      rng,
      bon,
      AGES.filter((x) => x.qui !== bon).map((x) => ({
        label: x.qui,
        why: `Compare les trois nombres du tableau : le plus ${grand ? 'grand' : 'petit'} est sur une autre ligne.`,
      })),
    );
    return {
      prompt: `Lis les données. Qui a le plus ${grand ? 'grand' : 'petit'} besoin ?`,
      figure: {
        kind: 'document',
        title: 'Repas de midi, jour calme (points inventés)',
        lines: AGES.map((x, i) => `${maj(x.qui)} : ${points[i]} points.`),
      },
      answer,
      traps,
      hint: 'Lis les trois nombres, puis compare-les.',
      steps: ['On compare des enfants d’âges différents.', `La réponse est **${bon}**.`],
      targetSeconds: 35,
    };
  }
  const bon = 'Son corps grandit : les aliments servent aussi à le construire';
  const age = rng.pick([6, 8, 10]);
  const { answer, traps } = choice(rng, bon, [
    {
      label: 'Ses besoins sont les mêmes à tout âge',
      why: 'Les besoins changent au cours de la croissance : ils ne sont pas les mêmes à tout âge.',
    },
    {
      label: 'Seul le sport compte : grandir ne change rien',
      why: 'L’activité compte, mais la croissance aussi.',
    },
    {
      label: 'Il ne mange que pour bouger',
      why: 'Les aliments servent aussi à rester en vie et, chez les jeunes, à grandir.',
    },
  ]);
  return {
    prompt: `Un enfant de ${age} ans mange. Qu’est-ce qui est vrai pour lui ?`,
    answer,
    traps,
    hint: 'Pense à la toise : que se passe-t-il d’une année à l’autre ?',
    steps: ['Chez un jeune, les aliments servent à construire chaque partie du corps.', `La réponse est **${bon}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Complète la phrase sur la croissance.',
      answer: {
        kind: 'cloze',
        parts: ['Quand tu grandis, on parle de ta ', '. Les ', ' apportent de quoi construire ton corps.'],
        blanks: [
          { mode: 'text', accepted: ['croissance'] },
          { mode: 'list', options: ['écrans', 'aliments', 'chaussures'], correct: 1 },
        ],
      },
      hint: 'Le premier mot commence par « crois ». Le second : ce que tu manges.',
      steps: ['Grandir, c’est la croissance.', 'Réponses : **croissance** et **aliments**.'],
      targetSeconds: 40,
    };
  }
  if (t === 1) {
    const [petit, moyen, grand] = rng.shuffle([
      ['dormir', 'marcher', 'courir vite'],
      ['lire assis', 'marcher', 'faire une course à vélo'],
      ['regarder un film', 'jouer à la marelle', 'nager vite longtemps'],
    ])[0] as [string, string, string];
    return {
      prompt: `Range de la plus petite à la plus grande dépense d’énergie : ${[petit, moyen, grand].sort().join(', ')}.`,
      answer: ordre(rng, [petit, moyen, grand]),
      hint: 'Plus les muscles travaillent fort, plus le corps dépense.',
      steps: ['Au repos, la dépense est la plus faible.', `Ordre : **${petit} → ${moyen} → ${grand}**.`],
      targetSeconds: 45,
    };
  }
  const { answer, traps } = saisie(
    [
      'activité physique',
      'activite physique',
      'l’activité physique',
      'une activité physique',
      'activités physiques',
      'activites physiques',
      'les activités physiques',
      'exercice',
      'exercice physique',
      'l’exercice',
      'l’exercice physique',
      'effort',
      'effort physique',
      'l’effort',
      'un effort',
    ],
    [
      ['repos', 'Au repos, le corps bouge très peu. On cherche le mot pour les mouvements des muscles.'],
      ['croissance', 'La croissance, c’est grandir. On parle ici de mouvements.'],
      ['sport', 'Le sport n’est qu’un exemple : monter un escalier compte aussi. Cherche le nom qui les regroupe.'],
    ],
  );
  return {
    prompt:
      'Les mouvements faits par tes muscles, qui dépensent plus d’énergie qu’au repos, ont un nom. Écris-le (deux mots).',
    answer,
    traps,
    hint: 'Le premier mot vient du verbe « agir ». Le second parle de ton corps.',
    steps: ['On nomme les mouvements des muscles.', 'C’est l’**activité physique**.'],
    targetSeconds: 40,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Relie chaque mot à sa définition.',
      answer: association(rng, [
        ['aliment', 'ce qui apporte de quoi grandir ou rester en vie'],
        ['croissance', 'le fait de grandir'],
        ['activité physique', 'mouvements des muscles qui dépensent de l’énergie'],
        ['repos', 'moment où le corps bouge très peu'],
        ['besoins alimentaires', 'ce que le corps doit manger et boire'],
      ]),
      hint: 'Commence par les mots dont tu es sûr, puis termine par élimination.',
      steps: ['Chaque mot a un seul sens ici.', 'Chaque mot est relié à **sa** définition.'],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const { answer, traps } = saisie(
      [
        'activité',
        'activité physique',
        'activite',
        'activite physique',
        'l’activité',
        'l’activité physique',
        'son activité',
        'son activité physique',
        'le sport',
        'sport',
        'le mouvement',
        'mouvement',
        'activités physiques',
        'les activités physiques',
        'exercice',
        'exercice physique',
        'l’exercice',
        'l’exercice physique',
        'son exercice',
        'effort',
        'l’effort',
        'effort physique',
        'son effort',
      ],
      [
        ['taille', 'Ils ont la même taille et le même âge : cherche ce qui change entre eux.'],
        ['âge', 'Ils ont le même âge. Cherche ce qui change entre eux.'],
      ],
    );
    const sport = rng.pick(['fait une longue randonnée', 'nage toute la matinée', 'joue au foot tout l’après-midi']);
    return {
      prompt: `Deux élèves ont le même âge et la même taille. Aujourd’hui, Tom ${sport}, Lou lit. Qu’est-ce qui explique que leurs besoins diffèrent ? Écris un ou deux mots.`,
      answer,
      traps,
      hint: 'Ce qui change : l’un bouge beaucoup, l’autre non.',
      steps: [
        'Les besoins alimentaires varient avec la croissance et l’activité physique.',
        'Ici, seul le mouvement change.',
        'La réponse : l’**activité** physique.',
      ],
      targetSeconds: 45,
    };
  }
  const parLAge = rng.int(0, 1) === 0;
  const [petit, , grand] = parAge(rng);
  const calme = rng.pick([60, 65, 70]);
  const sportif = calme + rng.pick([20, 25, 30]);
  const bon = parLAge
    ? 'L’âge : ils n’en sont pas au même moment de leur croissance'
    : 'L’activité physique : l’un a beaucoup plus bougé';
  const { answer, traps } = choice(rng, bon, [
    parLAge
      ? {
          label: 'L’activité physique : l’un a beaucoup plus bougé',
          why: 'Les deux sont restés au calme. Cherche ce qui change entre les deux lignes.',
        }
      : {
          label: 'L’âge : ils n’en sont pas au même moment de leur croissance',
          why: 'Les deux ont le même âge. Cherche ce qui change entre les deux lignes.',
        },
    {
      label: 'Rien : tous les enfants ont les mêmes besoins',
      why: 'Les nombres sont différents : les besoins ne sont pas identiques pour tous.',
    },
    {
      label: parLAge ? 'Seul le sport peut changer les besoins' : 'Seul l’âge peut changer les besoins',
      why: parLAge
        ? 'Ici aucun n’a fait de sport, et les besoins diffèrent pourtant.'
        : 'Ici l’âge est le même, et les besoins diffèrent pourtant.',
    },
  ]);
  const lines = parLAge
    ? [`Élise, élève de maternelle, jour calme : ${petit} points.`, `Hugo, adolescent, jour calme : ${grand} points.`]
    : [`Tom, 10 ans, jour calme : ${calme} points.`, `Lou, 10 ans, jour de randonnée : ${sportif} points.`];
  return {
    prompt: 'Lis les données. Qu’est-ce qui explique le mieux l’écart entre les deux besoins ?',
    figure: { kind: 'document', title: 'Deux besoins (points inventés)', lines },
    answer,
    traps,
    hint: 'Entre les deux lignes, qu’est-ce qui est pareil ? Qu’est-ce qui change ?',
    steps: [
      'Les besoins alimentaires varient avec la croissance et l’activité physique.',
      parLAge ? 'Ici, l’activité est la même et l’âge change.' : 'Ici, l’âge est le même et l’activité change.',
      `La réponse est **${bon}**.`,
    ],
    targetSeconds: 50,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const calmes = parAge(rng);
  // Ajout d’un jour de sport inférieur à l’écart entre maternelle et adolescence : le plus jeune sportif reste en dessous.
  const plus = rng.pick([10, 15, 20]);
  const sport = calmes.map((c) => c + plus);
  const figure = {
    kind: 'document' as const,
    title: 'Besoins au repas de midi (points inventés pour l’exercice)',
    lines: AGES.map((x, i) => `${maj(x.court)} : jour calme ${calmes[i]} points ; jour de sport ${sport[i]} points.`),
  };
  const sujet = 'Lis le tableau.';
  const t = rng.int(0, 2);
  if (t === 0) {
    const bon = 'Les besoins augmentent avec l’âge, et aussi les jours de sport';
    const { answer, traps } = choice(rng, bon, [
      {
        label: 'Les besoins changent seulement avec le sport',
        why: 'Compare les trois jours calmes : les nombres changent déjà avec l’âge.',
      },
      {
        label: 'Les besoins changent seulement avec l’âge',
        why: 'Sur une même ligne, le jour de sport demande plus que le jour calme.',
      },
      {
        label: 'Tout le monde a les mêmes besoins un jour de sport',
        why: 'Lis la colonne « jour de sport » : les trois nombres sont différents.',
      },
    ]);
    return {
      prompt: `${sujet} Quelle conclusion permet-il de tirer ?`,
      figure,
      answer,
      traps,
      hint: 'Lis le tableau de haut en bas, puis de gauche à droite.',
      steps: [
        'De haut en bas, l’âge augmente : les besoins aussi.',
        'De gauche à droite, on ajoute du sport : les besoins augmentent.',
        `Conclusion : **${bon}**.`,
      ],
      targetSeconds: 75,
    };
  }
  if (t === 1) {
    const sportSeul = rng.int(0, 1) === 0;
    const parAges = 'Maternelle au calme et adolescence au calme';
    const parSport = 'Adolescence au calme et adolescence un jour de sport';
    const bon = sportSeul ? parAges : parSport;
    const { answer, traps } = choice(rng, bon, [
      {
        label: sportSeul ? parSport : parAges,
        why: sportSeul
          ? 'Ici, seul le sport change : cela ne montre pas que l’âge compte aussi.'
          : 'Ici, seul l’âge change : cela ne montre pas que le sport compte aussi.',
      },
      {
        label: 'Maternelle au calme et adolescence un jour de sport',
        why: 'Deux choses changent à la fois : l’âge et le sport. On ne sait pas laquelle agit.',
      },
      {
        label: 'Adolescence au calme comparée avec elle-même',
        why: 'Rien ne change : aucune comparaison n’est possible.',
      },
    ]);
    return {
      prompt: `${sujet} Léa dit : « ${sportSeul ? 'Seul le sport change les besoins' : 'Seul l’âge change les besoins'}. » Quelle comparaison montre que c’est faux ?`,
      figure,
      answer,
      traps,
      hint: 'Pour tester une idée, ne fais changer qu’une seule chose à la fois.',
      steps: [
        sportSeul ? 'Il faut des âges différents sans sport.' : 'Il faut le même âge avec et sans sport.',
        `On compare : **${bon}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const i = rng.int(0, 2);
  const age = AGES[i]?.court ?? 'maternelle';
  return {
    prompt: `${sujet} Complète les deux conclusions.`,
    figure,
    answer: {
      kind: 'cloze',
      parts: [
        'Au calme, quand l’âge augmente, le besoin ',
        `. Pour la ligne « ${age} », le jour de sport demande `,
        ' que le jour calme.',
      ],
      blanks: [
        { mode: 'list', options: ['diminue', 'augmente', 'reste le même'], correct: 1 },
        { mode: 'list', options: ['moins', 'autant', 'plus'], correct: 2 },
      ],
    },
    hint: 'Compare les nombres de haut en bas, puis sur la ligne demandée.',
    steps: [
      `Au calme : ${calmes.join(', ')} points, de plus en plus.`,
      `Ligne « ${age} » : ${calmes[i]} points au calme, ${sport[i]} avec le sport.`,
      'Réponses : **augmente** et **plus**.',
    ],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const besoinsAlimentaires: Skill = {
  id: 'vcm2-besoins-alimentaires',
  title: 'Les besoins alimentaires',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Les **aliments** apportent de quoi rester en vie. Quand tu es jeune, ils servent aussi à ta **croissance**.',
      'Tes **besoins alimentaires** changent avec ton âge : à midi, il en faut plus à un adolescent qu’à un élève de maternelle. Ils changent aussi avec ton **activité physique** !',
    ],
    source: `${PROGRAMME} : « Exploiter des données pour expliquer la variation des besoins alimentaires au cours de la croissance et selon l’activité physique ». Bulletin officiel (restauration scolaire, 2001) : le repas de midi doit apporter des quantités plus grandes aux adolescents qu’aux élèves de maternelle (« pour les élèves de maternelle : 8 g de protéines de bonne qualité » ; « pour les adolescents : 17 à 20 g ») ; les besoins sont « fonction de la masse corporelle, du degré d'activité ». Santé publique France : l’activité physique entraîne « une dépense en énergie supérieure à celle du repos ».`,
    sources: [PROGRAMME, 'cnrtl-aliment', 'cnrtl-croissance', 'bo-restauration-2001', 'spf-activite-physique-2017'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
