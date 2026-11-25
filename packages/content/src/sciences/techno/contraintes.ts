import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Trap } from '../../types.ts';
import { association, formes, maj, notion, qcm, saisie } from './outils.ts';

// ——— Les contraintes et les choix de conception : ergonomie, sécurité, développement durable ———

type Domaine = 'l’ergonomie' | 'la sécurité' | 'le développement durable';
const DOMAINES: readonly Domaine[] = ['l’ergonomie', 'la sécurité', 'le développement durable'];

const IDEE: Record<Domaine, string> = {
  'l’ergonomie': 'rendre l’objet facile et confortable à utiliser',
  'la sécurité': 'protéger les personnes d’un danger',
  'le développement durable': 'économiser les ressources et l’énergie, et à limiter les déchets',
};

const CHOIX: readonly { texte: string; domaine: Domaine }[] = [
  { texte: 'une poignée arrondie qui épouse la forme de la main', domaine: 'l’ergonomie' },
  { texte: 'de grandes touches bien espacées sur une télécommande', domaine: 'l’ergonomie' },
  { texte: 'une selle de vélo réglable en hauteur selon la taille', domaine: 'l’ergonomie' },
  { texte: 'des repères en relief pour trouver un bouton sans regarder', domaine: 'l’ergonomie' },
  { texte: 'un mixeur qui ne démarre que couvercle fermé', domaine: 'la sécurité' },
  { texte: 'un fusible qui coupe le courant en cas de problème', domaine: 'la sécurité' },
  { texte: 'un bouchon qu’un jeune enfant ne parvient pas à ouvrir sur un produit ménager', domaine: 'la sécurité' },
  { texte: 'un fer à repasser qui s’éteint seul s’il est oublié', domaine: 'la sécurité' },
  { texte: 'un boîtier fabriqué en plastique recyclé', domaine: 'le développement durable' },
  { texte: 'des pièces d’usure remplaçables pour garder l’objet longtemps', domaine: 'le développement durable' },
  { texte: 'un panneau solaire qui recharge la batterie', domaine: 'le développement durable' },
  { texte: 'un emballage réduit au strict nécessaire', domaine: 'le développement durable' },
];

const explication = (c: (typeof CHOIX)[number]) =>
  `« ${maj(c.texte)} » vise surtout ${c.domaine} : on cherche à ${IDEE[c.domaine]}.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CHOIX);
  return {
    prompt: `Choix de conception : « ${c.texte} ». Quel domaine vise-t-il avant tout ?`,
    ...qcm(
      rng,
      c.domaine,
      DOMAINES.filter((d) => d !== c.domaine).map((d) => ({
        label: d,
        why: `Pour ${d}, on cherche à ${IDEE[d]}. ${explication(c)}`,
      })),
    ),
    hint: 'Demande-toi qui ou quoi est protégé ou avantagé : le confort, la personne, ou la planète ?',
    steps: ['On cherche le but principal du choix.', explication(c), `La bonne réponse est **${c.domaine}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const cible = rng.pick(DOMAINES);
  const bon = rng.pick(CHOIX.filter((c) => c.domaine === cible));
  const [d1, d2] = DOMAINES.filter((d) => d !== cible) as [Domaine, Domaine];
  const autres = [
    ...rng.shuffle(CHOIX.filter((c) => c.domaine === d1)).slice(0, 2),
    rng.pick(CHOIX.filter((c) => c.domaine === d2)),
  ];
  return {
    prompt: `Quel choix de conception vise avant tout ${cible} ?`,
    ...qcm(
      rng,
      bon.texte,
      autres.map((c) => ({ label: c.texte, why: explication(c) })),
    ),
    hint: 'Pour chaque proposition, trouve son but principal, puis compare avec le domaine demandé.',
    steps: [`Pour ${cible}, on cherche à ${IDEE[cible]}.`, explication(bon), `La bonne réponse est **${bon.texte}**.`],
    targetSeconds: 40,
  };
};

type Terme = 'norme' | 'label' | 'cahier des charges' | 'ergonomie';

const TERMES: Record<Terme, { definition: string; accepte: readonly string[] }> = {
  norme: {
    definition:
      'un ensemble de données (mesures, caractéristiques, qualités) qui définit un produit et sert de référence',
    accepte: [...formes('norme', 'une'), 'la norme'],
  },
  label: {
    definition: 'une marque apposée sur un produit pour en garantir la qualité',
    accepte: [...formes('label', 'un'), 'le label'],
  },
  'cahier des charges': {
    definition: 'le document qui liste les exigences que le futur objet devra respecter',
    accepte: [...formes('cahier des charges', 'un'), 'le cahier des charges'],
  },
  ergonomie: {
    definition: 'l’adaptation de l’objet à la personne qui s’en sert, pour un usage facile et confortable',
    accepte: formes('ergonomie', 'l’'),
  },
};
const MOTS = Object.keys(TERMES) as Terme[];

const pourquoiTerme = (choisi: Terme, vrai: Terme) =>
  `« ${maj(choisi)} » désigne ${TERMES[choisi].definition}. La définition donnée est celle de « ${vrai} ».`;

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const mot = rng.pick(MOTS);
    const { answer, traps } = saisie(
      TERMES[mot].accepte,
      MOTS.filter((m) => m !== mot).map((m) => [m, pourquoiTerme(m, mot)] as const),
    );
    return {
      prompt: `Quel terme désigne ${TERMES[mot].definition} ? Écris norme, label, cahier des charges ou ergonomie.`,
      answer,
      traps,
      hint: 'Est-ce un document, une marque sur le produit, une référence technique ou une qualité d’usage ?',
      steps: [
        'On repère le type de chose décrit : document, marque, référence ou qualité d’usage.',
        `Il s’agit de la définition : ${TERMES[mot].definition}.`,
        `Le terme est **${mot}**.`,
      ],
      targetSeconds: 35,
    };
  }
  const [a, b] = rng.shuffle(MOTS) as [Terme, Terme];
  const options = rng.shuffle(MOTS);
  return {
    prompt: 'Quel terme correspond à chaque définition du document ? Complète les deux réponses.',
    figure: {
      kind: 'document',
      title: 'Définitions',
      lines: [a, b].map((m, i) => `Définition ${i + 1} : ${TERMES[m].definition}.`),
    },
    answer: {
      kind: 'cloze',
      parts: ['Définition 1 : ', '. Définition 2 : ', '.'],
      blanks: [a, b].map((m) => ({ mode: 'list' as const, options, correct: options.indexOf(m) })),
    },
    hint: 'Commence par la phrase que tu connais le mieux.',
    steps: ['Chaque définition correspond à un seul terme.', `Réponse : **${a}**, puis **${b}**.`],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const paires = MOTS.map((m) => [m, TERMES[m].definition] as const);
    const choisies = rng.shuffle([
      ...paires,
      ['sécurité', 'une situation qui entraîne l’absence de dangers pour les personnes'] as const,
    ]);
    return {
      prompt: `Associe chaque terme à sa définition : ${choisies.map((p) => p[0]).join(' ; ')}.`,
      answer: association(rng, choisies),
      hint: 'Place d’abord les mots dont tu es sûr, puis termine par élimination.',
      steps: [
        'On distingue le document, la marque, la référence, la qualité d’usage et l’absence de danger.',
        `Réponse : **${choisies.map(([m, d]) => `${m} → ${d}`).join(' ; ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const c = rng.pick(CHOIX);
  const court = c.domaine.replace(/^(l’|la |le )/, '');
  const { answer, traps } = saisie(
    [court, c.domaine],
    DOMAINES.filter((d) => d !== c.domaine).map(
      (d) => [d.replace(/^(l’|la |le )/, ''), `Pour ${d}, on cherche à ${IDEE[d]}. ${explication(c)}`] as const,
    ),
  );
  return {
    prompt: `Un fabricant décide : « ${c.texte} ». Écris le domaine que ce choix de conception vise avant tout.`,
    answer,
    traps,
    hint: 'Trois grands domaines guident les choix de conception : retrouve-les puis choisis.',
    steps: ['On cherche le but principal du choix.', explication(c), `La réponse est **${court}**.`],
    targetSeconds: 40,
  };
};

interface Exigence {
  readonly texte: string;
  readonly respecte: string;
  readonly manque: string;
}

const CAHIERS: readonly { objet: string; exigences: readonly Exigence[] }[] = [
  {
    objet: 'une gourde',
    exigences: [
      { texte: 'contenir au moins 0,75 L', respecte: '0,8 L', manque: '0,5 L' },
      { texte: 'résister à une chute d’une table', respecte: 'résiste à la chute', manque: 'se fend en tombant' },
      { texte: 'fermer sans fuir', respecte: 'bouchon étanche', manque: 'bouchon qui goutte' },
      {
        texte: 'être faite d’un matériau recyclable',
        respecte: 'matériau recyclable',
        manque: 'matériau non recyclable',
      },
    ],
  },
  {
    objet: 'une lampe de lecture',
    exigences: [
      { texte: 'avoir une hauteur réglable', respecte: 'hauteur réglable', manque: 'hauteur fixe' },
      { texte: 'consommer au plus 8 W', respecte: 'consomme 5 W', manque: 'consomme 20 W' },
      { texte: 'avoir un cordon d’au moins 1,5 m', respecte: 'cordon de 2 m', manque: 'cordon de 1 m' },
      { texte: 'avoir un socle stable', respecte: 'socle stable', manque: 'socle qui bascule' },
    ],
  },
  {
    objet: 'une boîte à goûter',
    exigences: [
      { texte: 'peser au plus 300 g', respecte: 'pèse 220 g', manque: 'pèse 450 g' },
      { texte: 'avoir des angles arrondis', respecte: 'angles arrondis', manque: 'angles pointus' },
      {
        texte: 'passer au lave-vaisselle',
        respecte: 'passe au lave-vaisselle',
        manque: 'lavage à la main obligatoire',
      },
      { texte: 'se fermer d’une seule main', respecte: 'fermeture à une main', manque: 'fermeture à deux mains' },
    ],
  },
];

const LETTRES = ['A', 'B', 'C', 'D'];

const niveau5 = (rng: Rng): QuestionDraft => {
  const cahier = rng.pick(CAHIERS);
  const ratees = rng.shuffle(cahier.exigences.map((_, i) => i)).slice(0, 3);
  const prototypes = rng.shuffle<number | null>([null, ...ratees]);
  const bonne = prototypes.indexOf(null);
  const labels = prototypes.map((_, i) => `Prototype ${LETTRES[i]}`);
  const exigence = (k: number) => cahier.exigences.slice(k, k + 1);
  const traps: Trap[] = prototypes.flatMap((rate, i) =>
    rate === null
      ? []
      : exigence(rate).map((e) => ({
          option: i,
          why: `${labels[i]} ne respecte pas l’exigence « ${e.texte} » : ${e.manque}.`,
        })),
  );
  return {
    prompt: `Voici le cahier des charges d’${cahier.objet} et quatre prototypes. Lequel respecte toutes les exigences ?`,
    figure: {
      kind: 'document',
      title: `Cahier des charges : ${cahier.objet}`,
      lines: [
        `Exigences : ${cahier.exigences.map((e) => e.texte).join(' ; ')}.`,
        ...prototypes.map(
          (rate, i) =>
            `${labels[i]} : ${cahier.exigences.map((e, k) => (k === rate ? e.manque : e.respecte)).join(' ; ')}.`,
        ),
      ],
    },
    answer: { kind: 'choice', options: labels, correct: bonne },
    traps,
    hint: 'Vérifie les exigences une à une : un prototype est éliminé dès qu’une seule n’est pas respectée.',
    steps: [
      'On compare chaque prototype à chaque exigence du cahier des charges.',
      'Trois prototypes échouent chacun sur une exigence différente.',
      `La réponse est **${labels[bonne]}**.`,
    ],
    targetSeconds: 90,
  };
};

export const contraintes = notion(
  {
    id: 't5-contraintes',
    title: 'Les contraintes et les choix de conception',
    memo: [
      'Le concepteur suit des contraintes écrites dans le **cahier des charges** ; une **norme** sert de référence et un **label** garantit une qualité.',
      'Ses choix visent l’**ergonomie** (usage facile), la **sécurité** (protéger) ou le **développement durable** (ménager les ressources).',
    ],
    attendu:
      'Repérer et expliquer les choix de conception dans les domaines de l’ergonomie et de la sécurité ou en lien avec des objectifs de développement durable',
    sources: [
      'academie-cahier',
      'cnrtl-norme',
      'cnrtl-label',
      'cnrtl-securite',
      'academie-ergonomie',
      'insee-developpement-durable',
    ],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
