import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Trap } from '../../types.ts';
import { association, maj, notion, ordre, qcm, saisie } from './outils.ts';

// ——— Les usages d'un objet, ses interacteurs et ses incidences sur l'environnement ———

type Etape = 'extraction' | 'traitement' | 'fabrication' | 'assemblage' | 'utilisation' | 'fin de vie' | 'transport';

/** Ordre du programme ; le transport relie les étapes, il n'entre pas dans la remise en ordre. */
const SUITE: readonly Etape[] = ['extraction', 'traitement', 'fabrication', 'assemblage', 'utilisation', 'fin de vie'];
const ETAPES: readonly Etape[] = [...SUITE, 'transport'];

const SENS: Record<Etape, string> = {
  extraction: 'on prélève les matières premières dans la nature',
  traitement: 'on transforme la matière première en matériau utilisable',
  fabrication: 'on réalise les pièces',
  assemblage: 'on réunit les pièces',
  utilisation: 'la personne se sert de l’objet',
  'fin de vie': 'on se sépare de l’objet : il est recyclé, valorisé ou jeté',
  transport: 'on déplace matières, pièces ou objets',
};

const EXEMPLES: readonly { texte: string; etape: Etape }[] = [
  { texte: 'On extrait du minerai de fer dans une mine.', etape: 'extraction' },
  { texte: 'On coupe des arbres en forêt pour obtenir du bois brut.', etape: 'extraction' },
  { texte: 'Le minerai de fer est transformé en acier dans une usine.', etape: 'traitement' },
  { texte: 'Les troncs sont transformés en planches prêtes à l’emploi.', etape: 'traitement' },
  { texte: 'On plie des tubes pour réaliser le cadre d’un vélo.', etape: 'fabrication' },
  { texte: 'On perce les trous d’une pièce de meuble.', etape: 'fabrication' },
  { texte: 'On visse les roues et la selle sur le cadre d’un vélo.', etape: 'assemblage' },
  { texte: 'On fixe la poignée sur le corps d’une valise.', etape: 'assemblage' },
  { texte: 'Une élève se rend au collège à vélo.', etape: 'utilisation' },
  { texte: 'On fait chauffer de l’eau avec la bouilloire.', etape: 'utilisation' },
  { texte: 'Le vélo hors d’usage est démonté et son métal est recyclé.', etape: 'fin de vie' },
  { texte: 'Une bouilloire en panne est apportée en déchèterie.', etape: 'fin de vie' },
  { texte: 'Des vélos voyagent en camion de l’usine au magasin.', etape: 'transport' },
  { texte: 'Un cargo achemine des pièces d’un pays à un autre.', etape: 'transport' },
];

const pourquoiEtape = (e: Etape) => `Lors de l’étape « ${e} », ${SENS[e]}.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const ex = rng.pick(EXEMPLES);
  const autres = rng.shuffle(ETAPES.filter((e) => e !== ex.etape)).slice(0, 2);
  return {
    prompt: `${ex.texte} À quelle étape du cycle de vie cela correspond-il ?`,
    ...qcm(
      rng,
      ex.etape,
      autres.map((e) => ({ label: e, why: pourquoiEtape(e) })),
    ),
    hint: 'Demande-toi où en est l’objet : avant qu’il existe, pendant qu’il sert, ou après ?',
    steps: ['On situe l’action dans la vie de l’objet.', pourquoiEtape(ex.etape), `La réponse est **${ex.etape}**.`],
    targetSeconds: 25,
  };
};

type Interacteur = 'usager' | 'données' | 'autre objet' | 'élément de l’environnement';
const TYPES: readonly Interacteur[] = ['usager', 'données', 'autre objet', 'élément de l’environnement'];

const DEFINITION: Record<Interacteur, string> = {
  usager: 'une personne qui se sert de l’objet',
  données: 'des informations que l’objet reçoit ou envoie',
  'autre objet': 'un objet extérieur avec lequel il échange',
  'élément de l’environnement': 'un élément naturel ou physique autour de lui (pluie, lumière, air, sol…)',
};

const INTERACTEURS: readonly { systeme: string; element: string; type: Interacteur }[] = [
  { systeme: 'un portail automatique', element: 'la personne qui veut entrer', type: 'usager' },
  { systeme: 'un portail automatique', element: 'la télécommande', type: 'autre objet' },
  { systeme: 'un portail automatique', element: 'la pluie', type: 'élément de l’environnement' },
  { systeme: 'un portail automatique', element: 'le code d’accès saisi puis transmis', type: 'données' },
  { systeme: 'une montre connectée', element: 'la sportive qui la porte', type: 'usager' },
  { systeme: 'une montre connectée', element: 'le téléphone auquel elle est reliée', type: 'autre objet' },
  { systeme: 'une montre connectée', element: 'la chaleur de l’air', type: 'élément de l’environnement' },
  { systeme: 'une montre connectée', element: 'la position géographique envoyée à une application', type: 'données' },
  { systeme: 'un lampadaire de rue', element: 'la lumière du jour', type: 'élément de l’environnement' },
  { systeme: 'un lampadaire de rue', element: 'le piéton qui passe dessous', type: 'usager' },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const i = rng.pick(INTERACTEURS);
  return {
    prompt: `On étudie ${i.systeme}. Quel type d’interacteur extérieur est « ${i.element} » ?`,
    ...qcm(
      rng,
      i.type,
      TYPES.filter((t) => t !== i.type).map((t) => ({
        label: t,
        why: `« ${maj(t)} » désigne ${DEFINITION[t]}. Ce n’est pas le cas de « ${i.element} ».`,
      })),
    ),
    hint: 'Est-ce une personne, une information, un objet ou quelque chose de la nature ?',
    steps: [
      `Un interacteur est ce qui agit avec l’objet depuis l’extérieur.`,
      `« ${maj(i.element)} » : ${DEFINITION[i.type]}.`,
      `La réponse est **${i.type}**.`,
    ],
    targetSeconds: 30,
  };
};

const OBJETS = [
  'd’un vélo',
  'd’une bouilloire',
  'd’un meuble en bois',
  'd’une valise',
  'd’une lampe',
  'd’une trottinette',
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const objet = rng.pick(OBJETS);
  const taille = rng.int(4, 6);
  const etapes = rng
    .shuffle(SUITE)
    .slice(0, taille)
    .sort((a, b) => SUITE.indexOf(a) - SUITE.indexOf(b));
  const listees = [...etapes].sort((a, b) => a.localeCompare(b, 'fr'));
  return {
    prompt: `Range dans l’ordre ces étapes du cycle de vie ${objet} : ${listees.join(', ')}.`,
    answer: ordre(rng, etapes),
    hint: 'La matière doit d’abord être obtenue avant de devenir des pièces, puis un objet utilisé.',
    steps: [
      'On suit l’objet depuis la matière première jusqu’à ce qu’on s’en sépare.',
      etapes.map(pourquoiEtape).join(' '),
      `L’ordre est : **${etapes.join(' → ')}**.`,
    ],
    targetSeconds: 50,
  };
};

const ACCEPTE: Record<Etape, readonly string[]> = {
  extraction: ['extraction', 'l’extraction'],
  traitement: ['traitement', 'le traitement'],
  fabrication: ['fabrication', 'la fabrication'],
  assemblage: ['assemblage', 'l’assemblage'],
  utilisation: ['utilisation', 'l’utilisation'],
  'fin de vie': ['fin de vie', 'la fin de vie'],
  transport: ['transport', 'le transport'],
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cinq = rng.shuffle(ETAPES).slice(0, 5);
    const paires = cinq.map((e) => [rng.pick(EXEMPLES.filter((x) => x.etape === e)).texte, e] as const);
    return {
      prompt: `Associe chaque action à son étape du cycle de vie : ${paires.map((p) => p[0]).join(' ')}`,
      answer: association(rng, paires),
      hint: 'Commence par les actions les plus faciles à situer, puis procède par élimination.',
      steps: [
        'Chaque action correspond à une étape précise de la vie d’un objet.',
        `Réponse : **${paires.map(([t, e]) => `${t} → ${e}`).join(' ; ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const ex = rng.pick(EXEMPLES);
  const { answer, traps } = saisie(
    ACCEPTE[ex.etape],
    ETAPES.filter((e) => e !== ex.etape).map((e) => [e, pourquoiEtape(e)] as const),
  );
  return {
    prompt: `${ex.texte} Écris le nom de l’étape du cycle de vie.`,
    answer,
    traps,
    hint: 'Sept étapes jalonnent la vie d’un objet : retrouve celle qui décrit cette action.',
    steps: ['On situe l’action dans la vie de l’objet.', pourquoiEtape(ex.etape), `La réponse est **${ex.etape}**.`],
    targetSeconds: 40,
  };
};

/** Choix de matériaux ou d'énergie : l'étape qu'ils influencent en premier lieu, désignée dans le texte. */
const CHOIX: readonly { texte: string; etape: Etape; why: string }[] = [
  {
    texte: 'Le fabricant remplace l’aluminium neuf par de l’aluminium recyclé : il faudra extraire moins de minerai.',
    etape: 'extraction',
    why: 'Le choix évite de prélever de nouvelles matières premières.',
  },
  {
    texte: 'Les pièces sont vissées plutôt que soudées : on pourra les séparer pour les trier quand l’objet sera jeté.',
    etape: 'fin de vie',
    why: 'Le choix facilite le tri quand on se sépare de l’objet.',
  },
  {
    texte: 'On choisit un moteur qui consomme moins d’électricité à chaque fois qu’on s’en sert.',
    etape: 'utilisation',
    why: 'Le choix agit sur l’énergie dépensée pendant qu’on se sert de l’objet.',
  },
  {
    texte: 'On choisit une usine proche du magasin : les camions parcourront moins de kilomètres.',
    etape: 'transport',
    why: 'Le choix agit sur les trajets des objets.',
  },
  {
    texte: 'On choisit un matériau qui se plie à froid : il n’y a plus besoin de chauffer pour réaliser les pièces.',
    etape: 'fabrication',
    why: 'Le choix agit sur la réalisation des pièces.',
  },
];

interface Appareil {
  readonly nom: string;
  readonly note: number;
}

const NOTES = [1.5, 2.8, 3.6, 4.4, 5.5, 6.2, 7, 7.9, 8.5, 9.2];
const sur10 = (n: number) => `${String(n).replace('.', ',')} sur 10`;

const niveau5 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const c = rng.pick(CHOIX);
    const autres = rng.shuffle(ETAPES.filter((e) => e !== c.etape)).slice(0, 3);
    return {
      prompt: `${c.texte} Quelle étape du cycle de vie ce choix influence-t-il avant tout ?`,
      ...qcm(
        rng,
        c.etape,
        autres.map((e) => ({ label: e, why: `${pourquoiEtape(e)} Or ${c.why.toLowerCase()}` })),
      ),
      hint: 'Repère à quel moment de la vie de l’objet l’effet annoncé se produit.',
      steps: ['On cherche à quel moment le choix change quelque chose.', c.why, `La réponse est **${c.etape}**.`],
      targetSeconds: 45,
    };
  }
  const appareils: Appareil[] = rng
    .shuffle(NOTES)
    .slice(0, 4)
    .map((note, i) => ({ nom: `Appareil ${'ABCD'.charAt(i)}`, note }));
  const meilleur = appareils.reduce((m, a) => (a.note > m.note ? a : m));
  const bonne = appareils.indexOf(meilleur);
  const options = appareils.map((a) => a.nom);
  const traps: Trap[] = appareils.flatMap((a, i) =>
    i === bonne
      ? []
      : [
          {
            option: i,
            why: `${a.nom} a ${sur10(a.note)}, moins que ${meilleur.nom} (${sur10(meilleur.note)}) : il est moins réparable.`,
          },
        ],
  );
  return {
    prompt:
      'Une famille veut un lave-vaisselle qu’elle pourra réparer le plus facilement. D’après les indices de réparabilité, lequel choisir ?',
    figure: {
      kind: 'document',
      title: 'Indice de réparabilité affiché en magasin',
      lines: appareils.map((a) => `${a.nom} : ${sur10(a.note)}.`),
    },
    answer: { kind: 'choice', options, correct: bonne },
    traps,
    hint: 'La note va de 0 à 10 : réfléchis à ce qu’indique une note plus élevée, puis compare.',
    steps: [
      'L’indice est une note de 0 à 10 : plus elle est élevée, plus le produit est réparable.',
      `La plus haute note est ${sur10(meilleur.note)}.`,
      `La réponse est **${meilleur.nom}**.`,
    ],
    targetSeconds: 45,
  };
};

export const cycleVie = notion(
  {
    id: 't5-usages-environnement',
    title: 'Usages, interacteurs et environnement',
    memo: [
      'Autour d’un objet, les **interacteurs extérieurs** sont les usagers, les données, d’autres objets et l’environnement (la pluie sur un portail).',
      'Son **cycle de vie** va de l’extraction à la fin de vie, avec des transports : chaque choix de matériau ou d’énergie a des effets. L’**indice de réparabilité** se note de 0 à 10.',
    ],
    attendu: 'Identifier les étapes du cycle de vie d’un OST influencées par les choix de matériaux et d’énergie',
    sources: ['ecologie-indice-reparabilite'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
