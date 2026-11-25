import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Signal et information : signaux lumineux, sonores, électriques (programme du cycle 3) ———

type Nature = 'lumineux' | 'sonore' | 'électrique';
const NATURES: readonly Nature[] = ['lumineux', 'sonore', 'électrique'];

const PERCOIT: Record<Nature, string> = {
  lumineux: 'on le voit, grâce à la lumière',
  sonore: 'on l’entend, grâce à un son',
  électrique: 'c’est un courant qui voyage dans un fil',
};

const ACCEPTE: Record<Nature, readonly string[]> = {
  lumineux: ['lumineux', 'lumineuse', 'signal lumineux'],
  sonore: ['sonore', 'signal sonore'],
  électrique: ['électrique', 'electrique', 'signal électrique', 'signal electrique'],
};

const SCENES: readonly { scene: string; court: string; n: Nature }[] = [
  {
    scene: 'Au carrefour, un feu de signalisation s’allume pour les voitures.',
    court: 'le feu au carrefour',
    n: 'lumineux',
  },
  {
    scene: 'Un voyant s’allume sur ton appareil pendant qu’il se charge.',
    court: 'le voyant de l’appareil',
    n: 'lumineux',
  },
  {
    scene: 'Un bateau fait des éclats avec sa lampe pour prévenir un autre bateau.',
    court: 'la lampe du bateau',
    n: 'lumineux',
  },
  { scene: 'La sirène d’une usine retentit pour prévenir les ouvriers.', court: 'la sirène de l’usine', n: 'sonore' },
  {
    scene: 'Une alarme sonne dans la salle pour prévenir tout le monde.',
    court: 'l’alarme dans la salle',
    n: 'sonore',
  },
  { scene: 'L’arbitre donne un coup de sifflet pour arrêter le jeu.', court: 'le sifflet de l’arbitre', n: 'sonore' },
  {
    scene: 'Un courant passe dans le fil qui relie un bouton à une sonnette.',
    court: 'le fil de la sonnette',
    n: 'électrique',
  },
  {
    scene: 'Deux appareils reliés par un fil s’envoient un message sous forme de courant.',
    court: 'le message dans le fil',
    n: 'électrique',
  },
];

const pas = (choisi: Nature) => `Un signal ${choisi} : ${PERCOIT[choisi]}. Ce n’est pas le cas ici.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(SCENES);
  const { answer, traps } = choice(
    rng,
    c.n,
    NATURES.filter((n) => n !== c.n).map((n) => ({ label: n, why: pas(n) })),
  );
  return {
    prompt: `${c.scene} De quelle nature est ce signal ?`,
    answer,
    traps,
    hint: 'Le voit-on, l’entend-on, ou passe-t-il dans un fil ?',
    steps: ['On cherche comment le signal voyage.', `Ici, ${PERCOIT[c.n]}.`, `C’est un signal **${c.n}**.`],
    targetSeconds: 20,
  };
};

const SITUATIONS: readonly { scene: string; signal: string; info: string; source: string; recepteur: string }[] = [
  {
    scene: 'La sirène de l’école retentit : les élèves comprennent qu’il faut sortir.',
    signal: 'le son de la sirène',
    info: 'il faut sortir',
    source: 'la sirène',
    recepteur: 'les élèves',
  },
  {
    scene: 'Le voyant de la tablette s’allume : l’élève comprend que la tablette se charge.',
    signal: 'la lumière du voyant',
    info: 'la tablette se charge',
    source: 'le voyant',
    recepteur: 'l’élève',
  },
  {
    scene: 'La lampe du phare clignote : le marin comprend qu’il approche de la côte.',
    signal: 'la lumière qui clignote',
    info: 'la côte est proche',
    source: 'la lampe du phare',
    recepteur: 'le marin',
  },
  {
    scene: 'La sonnette retentit : la famille comprend qu’un visiteur est à la porte.',
    signal: 'le son de la sonnette',
    info: 'un visiteur est à la porte',
    source: 'la sonnette',
    recepteur: 'la famille',
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const trois = NATURES.map((n) => ({ n, court: rng.pick(SCENES.filter((s) => s.n === n)).court }));
    return {
      prompt: `Associe chaque situation à la nature de son signal : ${trois.map((t) => t.court).join(' ; ')}.`,
      answer: association(
        rng,
        trois.map((t) => [t.court, t.n] as const),
      ),
      hint: 'Pour chaque situation : voit-on, entend-on, ou est-ce un courant dans un fil ?',
      steps: [
        'On cherche comment chaque signal voyage.',
        `Réponse : **${trois.map((t) => `${t.court} → ${t.n}`).join(' ; ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const s = rng.pick(SITUATIONS);
  const demande = rng.int(0, 1) === 0 ? 'signal' : 'info';
  const roles = {
    signal: { label: s.signal, why: `« ${maj(s.signal)} » est le signal : ce qu’on voit ou entend.` },
    info: { label: s.info, why: `« ${maj(s.info)} » est l’information : ce qu’on comprend.` },
    source: { label: s.source, why: `« ${maj(s.source)} » est l’objet qui émet le signal.` },
    recepteur: { label: s.recepteur, why: `« ${maj(s.recepteur)} » : c’est le côté qui reçoit le signal.` },
  };
  const bon = roles[demande].label;
  const { answer, traps } = choice(
    rng,
    bon,
    Object.values(roles).filter((x) => x.label !== bon),
  );
  return {
    prompt: `${s.scene} ${demande === 'signal' ? 'Quel est le signal ?' : 'Quelle est l’information transmise ?'}`,
    answer,
    traps,
    hint: 'Le signal, on le voit ou on l’entend. L’information, c’est ce qu’on comprend.',
    steps: [
      'Il y a un émetteur, un signal, un récepteur et une information.',
      roles[demande].why,
      `La bonne réponse est **${bon}**.`,
    ],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const s = rng.pick(SITUATIONS);
    return {
      prompt: `${s.scene} Complète avec les deux bons mots.`,
      answer: {
        kind: 'cloze',
        parts: [`${maj(s.signal)} est le `, `. « ${maj(s.info)} » est l’`, '.'],
        blanks: [
          { mode: 'text', accepted: ['signal'] },
          { mode: 'text', accepted: ['information'] },
        ],
      },
      hint: 'L’un des mots désigne ce qu’on voit ou entend, l’autre ce qu’on comprend.',
      steps: [
        'Un signal transporte quelque chose qu’on comprend.',
        'Ce qu’on voit ou entend est le signal.',
        'Réponse : **signal**, puis **information**.',
      ],
      targetSeconds: 45,
    };
  }
  const c = rng.pick(SCENES);
  const { answer, traps } = saisie(
    ACCEPTE[c.n],
    NATURES.filter((n) => n !== c.n).map((n) => [n, pas(n)] as const),
  );
  return {
    prompt: `${c.scene} Écris la nature de ce signal : lumineux, sonore ou électrique.`,
    answer,
    traps,
    hint: 'Comment le message arrive-t-il : par les yeux, les oreilles ou un fil ?',
    steps: ['On cherche comment le signal voyage.', `Ici, ${PERCOIT[c.n]}.`, `C’est un signal **${c.n}**.`],
    targetSeconds: 30,
  };
};

/** Chaînes à deux signaux : la question précise lequel est visé. */
const CHAINES: readonly { texte: string; question: string; n: Nature }[] = [
  {
    texte: 'Tu appuies sur le bouton : un courant passe dans le fil, puis la sonnette fait « dring ».',
    question: 'Quel est le signal dans le fil ?',
    n: 'électrique',
  },
  {
    texte: 'Tu appuies sur le bouton : un courant passe dans le fil, puis la sonnette fait « dring ».',
    question: 'Quel est le signal qui arrive à tes oreilles ?',
    n: 'sonore',
  },
  {
    texte: 'Un courant passe dans un fil jusqu’à une lampe qui s’allume pour te dire « entre ».',
    question: 'Quel est le signal que tes yeux reçoivent ?',
    n: 'lumineux',
  },
  {
    texte: 'Un courant passe dans un fil jusqu’à une lampe qui s’allume pour te dire « entre ».',
    question: 'Quel est le signal qui passe dans le fil ?',
    n: 'électrique',
  },
];

const APPLICATIONS: readonly (readonly [string, string])[] = [
  ['un feu de signalisation', 'une lumière qui renseigne les conducteurs au carrefour'],
  ['un voyant de charge', 'une petite lampe qui indique qu’un appareil se charge'],
  ['une alarme sonore', 'un son fort qui prévient d’un problème'],
  ['une sonnette de porte', 'un appui sur un bouton annonce un visiteur'],
  ['un câble de communication sous-marin', 'un long câble posé sous la mer qui transporte des messages'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 3) === 0) {
    return {
      prompt: 'Associe chaque application à ce qu’elle fait.',
      answer: association(rng, APPLICATIONS),
      hint: 'Commence par les appareils que tu connais bien.',
      steps: [
        'Chacune de ces applications sert à transmettre une information.',
        `Réponse : **${APPLICATIONS.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const c = rng.pick(CHAINES);
  const { answer, traps } = saisie(
    ACCEPTE[c.n],
    NATURES.filter((n) => n !== c.n).map(
      (n) => [n, `Attention à la question posée. Un signal ${n} : ${PERCOIT[n]}.`] as const,
    ),
  );
  return {
    prompt: `${c.texte} ${c.question} Écris sa nature.`,
    answer,
    traps,
    hint: 'Il y a deux signaux dans cette histoire : ne confonds pas le fil et ce que tu perçois.',
    steps: [
      'Un même message peut changer de forme en route.',
      `La question porte sur un moment précis : ${PERCOIT[c.n]}.`,
      `C’est un signal **${c.n}**.`,
    ],
    targetSeconds: 45,
  };
};

const SENS = ['tout va bien', 'viens me voir', 'attention, danger'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const ordreSens = rng.shuffle(SENS);
    const codes = ['1 éclair de lampe', '2 éclairs de lampe', '3 coups de sifflet'];
    const i = rng.int(0, 2);
    const bon = ordreSens[i] ?? SENS[0];
    const { answer, traps } = choice(rng, bon, [
      ...ordreSens
        .filter((x) => x !== bon)
        .map((x) => ({
          label: x,
          why: `Ce sens correspond à un autre signal du code. Relis la ligne « ${codes[i]} ».`,
        })),
      {
        label: 'on ne peut rien comprendre',
        why: 'Si : le code est donné. Un signal convenu transmet une information.',
      },
    ]);
    return {
      prompt: `Lis le code secret. Tu reçois : ${codes[i]}. Quelle information comprends-tu ?`,
      figure: {
        kind: 'document',
        title: 'Notre code secret',
        lines: codes.map((c, k) => `${c} = « ${ordreSens[k]} ».`),
      },
      answer,
      traps,
      hint: 'Trouve dans le code la ligne qui correspond exactement au signal reçu.',
      steps: [
        'Un signal n’a de sens que si l’on connaît le code convenu.',
        `Dans le code, « ${codes[i]} » veut dire « ${bon} ».`,
        `Tu comprends : **${bon}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const cas = rng.pick([
    {
      obstacle: 'Une grande planche opaque cache ta camarade : elle ne peut pas te voir.',
      bon: 'donner un coup de sifflet',
      faux: ['agiter les bras', 'allumer ta lampe de poche derrière la planche', 'montrer un dessin'],
      why: 'La planche est opaque : la lumière ne passe pas, donc elle ne verrait rien. Elle peut entendre.',
      nature: 'sonore',
    },
    {
      obstacle: 'Un concert très bruyant empêche ton ami d’entendre, mais il te regarde.',
      bon: 'faire clignoter une lampe',
      faux: ['l’appeler en criant', 'donner un coup de sifflet', 'chuchoter son prénom'],
      why: 'Avec tout ce bruit, un son se perd. Il te voit : un signal lumineux passe.',
      nature: 'lumineux',
    },
  ]);
  const { answer, traps } = choice(
    rng,
    cas.bon,
    cas.faux.map((label) => ({ label, why: cas.why })),
  );
  return {
    prompt: `${cas.obstacle} Comment peux-tu envoyer ton message ?`,
    answer,
    traps,
    hint: 'Quel sens la personne peut-elle encore utiliser ?',
    steps: [
      'On cherche ce qui empêche de recevoir le message.',
      cas.why,
      `Il faut **${cas.bon}** : un signal ${cas.nature}.`,
    ],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const signal: Skill = {
  id: 'pcm2-signal',
  title: 'Signal et information',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **signal** sert à transmettre une **information**. Il peut être **lumineux** (un feu), sonore (une sirène) ou **électrique** (un courant dans un fil).',
      'Exemple : le voyant de charge s’allume (signal) et tu comprends que l’appareil se charge (information). Il faut connaître le code !',
    ],
    source: `${PROGRAMME} : « Identifier des signaux de natures différentes et citer des applications dans lesquelles un signal permet de transmettre une information » ; « Au cycle 3, le travail concerne les signaux lumineux et électriques ».`,
    sources: [PROGRAMME, 'cnrtl-signal', 'cnrtl-sirene', 'cnrtl-voyant'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
