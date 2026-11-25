import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Besoins alimentaires : grandir et bouger (programme du cycle 3, CNRTL, Santé publique France) ———
// Les « points de besoin » des documents sont inventés : ils servent à lire des données, pas à fixer des rations.

const ACTIVITES = ['monter les escaliers', 'rouler à vélo', 'jouer au ballon', 'sauter à la corde', 'porter un sac'];
const REPOS = ['dormir', 'regarder un film assis', 'lire allongé', 'écouter une histoire assis'];

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
    const a = rng.pick(ACTIVITES);
    const r = rng.pick(REPOS);
    return {
      prompt: `Associe chaque mot à son exemple : ${a}, ${r}, grandir.`,
      answer: association(rng, [
        ['activité physique', a],
        ['repos', r],
        ['croissance', 'grandir'],
      ]),
      hint: 'La croissance se voit sur la toise. L’activité fait travailler les muscles.',
      steps: ['On relie chaque mot à un exemple.', 'Chaque mot a **son** exemple.'],
      targetSeconds: 45,
    };
  }
  const bon = 'Son corps grandit : les aliments servent aussi à le construire';
  const age = rng.pick([6, 8, 10]);
  const { answer, traps } = choice(rng, bon, [
    { label: 'Son corps ne change plus du tout', why: 'À cet âge, le corps grandit encore.' },
    {
      label: 'Les aliments servent seulement à jouer',
      why: 'Les aliments servent à rester en vie, à bouger et, chez les jeunes, à grandir.',
    },
    { label: 'Un enfant n’a pas besoin de manger', why: 'Tout être vivant a besoin d’aliments.' },
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
    ['activité physique', 'activite physique', 'l’activité physique', 'une activité physique'],
    [
      ['repos', 'Au repos, le corps bouge très peu. On cherche le mot pour les mouvements des muscles.'],
      ['croissance', 'La croissance, c’est grandir. On parle ici de mouvements.'],
    ],
  );
  return {
    prompt:
      'Les mouvements faits par tes muscles, qui dépensent plus d’énergie qu’au repos, ont un nom. Écris-le (deux mots).',
    answer,
    traps,
    hint: 'Le premier mot commence par « acti », le second par « phy ».',
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
  const bon = 'Non : ils varient avec la croissance et l’activité physique';
  const { answer, traps } = choice(rng, bon, [
    {
      label: 'Oui : tout le monde a les mêmes, toujours',
      why: 'Les besoins changent d’une personne et d’un jour à l’autre.',
    },
    {
      label: 'Oui : seule la couleur des cheveux les change',
      why: 'La couleur des cheveux ne change pas les besoins.',
    },
    { label: 'Non : ils dépendent seulement du prénom', why: 'Le prénom ne change rien au corps.' },
  ]);
  const qui = rng.pick(['Un bébé et un adulte', 'Un enfant et son grand-père', 'Un coureur et un dormeur']);
  return {
    prompt: `Piège possible ! ${qui} ont-ils forcément les mêmes besoins alimentaires ?`,
    answer,
    traps,
    hint: 'Compare : grandissent-ils pareil ? Bougent-ils pareil ?',
    steps: ['Le corps ne demande pas toujours la même chose.', `La réponse est **${bon}**.`],
    targetSeconds: 35,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const nom = rng.pick(['Alix', 'Sacha', 'Camille']);
  const calme = rng.pick([100, 110, 120]);
  const sport = calme + rng.pick([20, 30, 40]);
  const figure = {
    kind: 'document' as const,
    title: `Le tableau de ${nom} (nombres inventés pour l’exercice)`,
    lines: [
      `Lundi, ${nom} reste au calme : besoin de ${calme} points.`,
      `Mercredi, ${nom} fait une grande randonnée : besoin de ${sport} points.`,
      'Les « points » mesurent ici les besoins du corps.',
      `${nom} est un enfant : son corps grandit.`,
    ],
  };
  const sujet = `Lis le tableau de ${nom} (${calme} points, ${sport} points).`;
  const t = rng.int(0, 2);
  if (t === 0) {
    const ecart = sport - calme;
    const { answer, traps } = saisie(
      [String(ecart), `${ecart} points`],
      [
        [String(sport), 'C’est le besoin du mercredi. On cherche l’écart avec le lundi.'],
        [String(sport + calme), 'Tu as additionné. Pour un écart, on soustrait.'],
      ],
    );
    return {
      prompt: `${sujet} Combien de points en plus faut-il le mercredi ? Écris le nombre.`,
      figure,
      answer,
      traps,
      hint: 'Soustrais le besoin du lundi de celui du mercredi.',
      steps: ['On compare les deux jours.', `${sport} − ${calme}.`, `En plus : **${ecart}** points.`],
      targetSeconds: 60,
    };
  }
  const randonnee = t === 1;
  const bon = randonnee ? 'Son activité physique est plus grande' : 'Les aliments servent aussi à construire son corps';
  const faux = randonnee
    ? [
        { label: 'Son corps a rajeuni en deux jours', why: 'Un corps ne rajeunit pas. Relis la ligne 2.' },
        {
          label: 'Le mercredi est un jour plus court',
          why: 'La longueur du jour n’est pas écrite ici. Regarde ce que fait l’enfant.',
        },
        { label: 'Le corps n’a plus besoin d’eau', why: 'Au contraire, on boit quand on bouge. Regarde la ligne 2.' },
      ]
    : [
        { label: 'Un enfant n’utilise pas ses aliments', why: 'Tout être vivant utilise ses aliments.' },
        {
          label: 'Les aliments font seulement dormir',
          why: 'Les aliments apportent de quoi grandir et rester en vie.',
        },
        {
          label: 'Grandir ne demande aucune matière',
          why: 'Pour grandir, il faut de la matière : elle vient des aliments.',
        },
      ];
  const { answer, traps } = choice(rng, bon, faux);
  return {
    prompt: randonnee
      ? `${sujet} Pourquoi le besoin est-il plus grand le mercredi ?`
      : `${sujet} La ligne 4 parle de croissance. Qu’est-ce que cela change pour ses aliments ?`,
    figure,
    answer,
    traps,
    hint: randonnee ? 'Qu’est-ce qui change entre lundi et mercredi ?' : 'Pense à la croissance.',
    steps: ['Les besoins alimentaires varient avec la croissance et l’activité physique.', `Explication : **${bon}**.`],
    targetSeconds: 55,
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
      'Chaque **aliment** apporte de quoi rester en vie. Quand tu es jeune, il sert aussi à ta **croissance**.',
      'Tes **besoins alimentaires** changent avec ta croissance et ton **activité physique**. Un jour de randonnée, ton corps dépense plus qu’un jour au calme !',
    ],
    source: `${PROGRAMME} : « Exploiter des données pour expliquer la variation des besoins alimentaires au cours de la croissance et selon l’activité physique ». Santé publique France : l’activité physique entraîne « une dépense en énergie supérieure à celle du repos ».`,
    sources: [PROGRAMME, 'cnrtl-aliment', 'cnrtl-croissance', 'spf-activite-physique-2017'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
