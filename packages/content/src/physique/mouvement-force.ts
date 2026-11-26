import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesInteractions } from './donnees-interactions.ts';

// ——— Mouvement et force : effets d'une action, équilibre (4e) ———

const DEFORME = 'elle déforme l’objet';
const MODIFIE = 'elle modifie le mouvement de l’objet';

const EFFETS: readonly { texte: string; bon: string; why: string }[] = [
  {
    texte: 'Une main écrase une éponge posée sur l’évier ; l’éponge reste à sa place.',
    bon: DEFORME,
    why: 'L’éponge change de forme sans se déplacer.',
  },
  {
    texte: 'Un enfant étire un ressort accroché à un support ; le ressort s’allonge puis reste immobile.',
    bon: DEFORME,
    why: 'Le ressort change de longueur : il est déformé.',
  },
  {
    texte: 'Un pied pousse un ballon immobile, qui se met à rouler.',
    bon: MODIFIE,
    why: 'Le ballon était au repos et se met en mouvement.',
  },
  {
    texte: 'Les freins serrent la roue d’un vélo, qui ralentit.',
    bon: MODIFIE,
    why: 'La vitesse du vélo diminue : son mouvement change.',
  },
  {
    texte: 'Un aimant dévie la trajectoire d’une bille en fer qui roule.',
    bon: MODIFIE,
    why: 'La direction du mouvement de la bille change.',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(EFFETS);
  const autre = e.bon === DEFORME ? MODIFIE : DEFORME;
  const { answer, traps: t } = choice(rng, e.bon, [
    { label: autre, why: e.why },
    { label: 'elle change la masse de l’objet', why: `Ici, la masse ne change pas. ${e.why}` },
  ]);
  return {
    prompt: `${e.texte} Quel effet principal de la force observe-t-on ?`,
    answer,
    traps: t,
    hint: 'La forme change-t-elle, ou la façon de se déplacer ?',
    steps: [e.why, `Effet observé de la force : **${e.bon}**.`],
    targetSeconds: 25,
  };
};

const AUGMENTE = 'sa valeur augmente';
const DIMINUE = 'sa valeur diminue';
const DIRECTION = 'sa direction change, sa valeur reste la même';
const RIEN = 'ni sa valeur ni sa direction ne changent';
const VARIATIONS = [AUGMENTE, DIMINUE, DIRECTION, RIEN] as const;

const MOUVEMENTS: readonly { texte: string; bon: (typeof VARIATIONS)[number]; why: string }[] = [
  {
    texte: 'Un cycliste accélère sur une route droite.',
    bon: AUGMENTE,
    why: 'La route est droite : la direction reste la même, et la valeur augmente.',
  },
  {
    texte: 'Un tramway freine sur une voie droite avant l’arrêt.',
    bon: DIMINUE,
    why: 'La voie est droite et la vitesse baisse.',
  },
  {
    texte: 'Une nacelle de manège tourne sur un cercle, avec une vitesse de valeur constante.',
    bon: DIRECTION,
    why: 'Sur un cercle, la direction du déplacement change sans cesse.',
  },
  {
    texte: 'Un satellite parcourt une orbite circulaire à vitesse de valeur constante.',
    bon: DIRECTION,
    why: 'La trajectoire circulaire fait tourner la direction de la vitesse.',
  },
  {
    texte: 'Un palet glisse en ligne droite, avec des distances égales parcourues pendant des durées égales.',
    bon: RIEN,
    why: 'La trajectoire est droite et les distances égales : la vitesse ne change pas.',
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MOUVEMENTS);
  const { answer, traps: t } = choice(
    rng,
    m.bon,
    VARIATIONS.filter((v) => v !== m.bon).map((label) => ({ label, why: m.why })),
  );
  return {
    prompt: `${m.texte} Comment évolue sa vitesse ?`,
    answer,
    traps: t,
    hint: 'Regarde la forme de la trajectoire (direction) et les distances parcourues (valeur).',
    steps: [m.why, `Donc **${m.bon}**.`],
    targetSeconds: 40,
  };
};

const CHANGEMENTS = [
  { texte: 'Une balle de tennis frappée par une raquette repart dans l’autre sens.', quoi: 'le sens' },
  { texte: 'Un ballon immobile est mis en mouvement par un tir.', quoi: 'la valeur' },
  { texte: 'Une voiture suit un virage à vitesse de valeur constante.', quoi: 'la direction' },
  { texte: 'Un train ralentit sur une voie droite.', quoi: 'la valeur' },
  { texte: 'Un patineur tourne en rond à allure régulière.', quoi: 'la direction' },
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CHANGEMENTS);
  const options = ['la valeur', 'la direction', 'le sens'];
  return {
    prompt: `${c.texte} Complète la phrase.`,
    answer: {
      kind: 'cloze',
      parts: [
        'D’après la description, la caractéristique de la vitesse qui change est ',
        '. L’action qui modifie ce mouvement est modélisée par une ',
        '.',
      ],
      blanks: [
        { mode: 'list', options, correct: options.indexOf(c.quoi) },
        { mode: 'text', accepted: ['force'] },
      ],
    },
    hint: 'Pour le second mot, rappelle-toi comment on modélise une action en physique.',
    steps: [
      `Dans cette situation, c’est **${c.quoi}** qui change.`,
      'Ce qui modifie le mouvement d’un corps est une **force**.',
    ],
    targetSeconds: 55,
  };
};

const SUSPENSIONS = [
  { objet: 'Une lampe', support: 'le câble', verbe: 'suspendue à un câble vertical' },
  { objet: 'Un seau', support: 'la corde', verbe: 'suspendu à une corde verticale' },
  { objet: 'Une enseigne', support: 'la chaîne', verbe: 'suspendue à une chaîne verticale' },
  { objet: 'Un livre', support: 'la table', verbe: 'posé sur une table horizontale' },
] as const;

const niveau4 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SUSPENSIONS);
  const v = rng.int(3, 40);
  const intro = `${s.objet} ${s.verbe} reste immobile. La Terre exerce sur cet objet une force verticale, vers le bas, de ${v} N ; la seule autre force est exercée par ${s.support}.`;
  if (rng.int(0, 1) === 0)
    return {
      prompt: `${intro} Quelle est la valeur, en N, de la force exercée par ${s.support} ?`,
      answer: num(r(v), 'N'),
      traps: traps(r(v), [
        [0, 'L’objet est immobile, mais les forces existent : elles s’annulent, aucune n’est nulle.'],
        [2 * v, 'Deux forces qui s’annulent ont la même valeur : on n’ajoute rien.'],
      ]),
      hint: 'À l’équilibre avec deux forces, elles se compensent exactement.',
      steps: ['L’objet est en équilibre : les deux forces s’annulent.', `Elles ont donc la même valeur : **${v} N**.`],
      targetSeconds: 60,
    };
  const { answer, traps: t } = saisie(
    [
      'vers le haut',
      'vers le haut.',
      'le haut',
      'haut',
      'en haut',
      'de bas en haut',
      'du bas vers le haut',
      'verticalement vers le haut',
    ],
    [
      ['vers le bas', 'Les deux forces s’additionneraient vers le bas : l’objet ne resterait pas en équilibre.'],
      ['le bas', 'Les deux forces s’additionneraient vers le bas : l’objet ne resterait pas en équilibre.'],
      ['bas', 'Les deux forces s’additionneraient vers le bas : l’objet ne resterait pas en équilibre.'],
    ],
  );
  return {
    prompt: `${intro} Dans quel sens agit la force exercée par ${s.support} ? (réponds « vers … »)`,
    answer,
    traps: t,
    hint: 'Pour s’annuler, les deux forces doivent s’opposer.',
    steps: ['À l’équilibre, la seconde force compense celle de la Terre.', 'Elle agit **vers le haut**.'],
    targetSeconds: 60,
  };
};

interface Phase {
  readonly forme: 'une ligne droite' | 'un cercle';
  readonly allure: 'constante' | 'croissante' | 'décroissante';
}

const distances = (a: Phase['allure'], base: number, pas: number): number[] =>
  a === 'constante'
    ? [base, base, base]
    : a === 'croissante'
      ? [base, base + pas, base + 2 * pas]
      : [base + 2 * pas, base + pas, base];

const LETTRES = ['A', 'B', 'C'] as const;
const liste = (l: readonly string[]) =>
  l.length === 1 ? `la phase ${String(l[0])}` : `les phases ${l.slice(0, -1).join(', ')} et ${String(l.at(-1))}`;

const niveau5 = (rng: Rng): QuestionDraft => {
  // Une phase au mouvement rectiligne uniforme, une dont la valeur varie, une circulaire.
  const phases = rng.shuffle<Phase>([
    { forme: 'une ligne droite', allure: 'constante' },
    { forme: 'une ligne droite', allure: rng.pick(['croissante', 'décroissante'] as const) },
    { forme: 'un cercle', allure: 'constante' },
  ]);
  const base = rng.int(2, 6);
  const pas = rng.int(2, 5);
  const lignes = phases.map((p, i) => {
    const d = distances(p.allure, base, pas);
    return `Phase ${String(LETTRES[i])} : ${p.forme} ; distances parcourues chaque seconde : ${d[0]} m, ${d[1]} m, ${d[2]} m.`;
  });
  const varie = LETTRES.filter((_, i) => phases[i]?.forme === 'un cercle' || phases[i]?.allure !== 'constante');
  const valeurSeule = LETTRES.filter((_, i) => phases[i]?.allure !== 'constante');
  const circulaire = LETTRES.filter((_, i) => phases[i]?.forme === 'un cercle');
  // Autre paire, avec la phase où la vitesse ne change pas : la bonne réponse n’est pas la seule paire proposée.
  const fausse = LETTRES.filter((l) => !varie.includes(l) || circulaire.includes(l));
  const bon = liste(varie);
  const why =
    'La vitesse change si sa valeur varie (distances inégales) ou si sa direction change (cercle) : une force modifie alors le mouvement.';
  const { answer, traps: t } = choice(rng, bon, [
    { label: liste(valeurSeule), why: `Tu as oublié le changement de direction. ${why}` },
    { label: liste(circulaire), why: `Tu as oublié le changement de valeur. ${why}` },
    { label: liste(fausse), why: `En ligne droite à distances égales, la vitesse ne change pas. ${why}` },
    { label: liste([...LETTRES]), why: `En ligne droite à distances égales, la vitesse ne change pas. ${why}` },
  ]);
  return {
    prompt:
      'Lis le relevé d’un mobile. Pendant quelles phases sa vitesse varie-t-elle, ce qui révèle qu’une force modifie son mouvement ?',
    figure: { kind: 'document', title: 'Relevé de chronophotographie (données de l’exercice)', lines: lignes },
    answer,
    traps: t,
    hint: 'Examine pour chaque phase la valeur (les distances) puis la direction (la forme de la trajectoire).',
    steps: [why, `Réponse : **${bon}**.`],
    targetSeconds: 120,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const mouvementForce: Skill = {
  id: 'p4-mouvement-force',
  title: 'Mouvement et force',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **force** peut déformer un corps ou modifier son mouvement : quand la valeur ou la direction de la vitesse change, une action s’exerce.',
      'Un corps au repos est en **équilibre** quand les forces qu’il subit s’annulent : une lampe suspendue est tirée vers le haut par son câble autant qu’elle est attirée vers le bas.',
    ],
    ...referencesInteractions(
      'variation',
      'force-effets',
      'variation-force',
      'equilibre-programme',
      'equilibre',
      'faire-equilibre',
      'direction',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
