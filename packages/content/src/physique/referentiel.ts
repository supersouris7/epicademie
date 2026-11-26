import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { maj, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesMouvement } from './donnees-mouvement.ts';

// ——— Référentiel et relativité du mouvement (5e) ———

interface Scene {
  readonly contexte: string;
  readonly sujet: string;
  /** Complément « par rapport … » dans lequel le sujet est immobile. */
  readonly fixe: string;
  /** Complément « par rapport … » dans lequel le sujet est en mouvement. */
  readonly mobile: string;
}

const SCENES: readonly Scene[] = [
  {
    contexte: 'Nour est assise dans un train qui roule.',
    sujet: 'Nour',
    fixe: 'au wagon',
    mobile: 'au quai d’une gare',
  },
  {
    contexte: 'Deux amis se tiennent immobiles sur la même marche d’un escalier mécanique en marche.',
    sujet: 'le premier ami',
    fixe: 'au second ami',
    mobile: 'au mur du magasin',
  },
  {
    contexte: 'Un sac est posé sur le siège d’une voiture qui roule.',
    sujet: 'le sac',
    fixe: 'à la voiture',
    mobile: 'à un arbre au bord de la route',
  },
  {
    contexte: 'Un marin est assis sur le pont d’un bateau qui s’éloigne du port.',
    sujet: 'le marin',
    fixe: 'au pont du bateau',
    mobile: 'au phare du port',
  },
  {
    contexte: 'Une valise est posée sur le plancher d’un ascenseur qui descend.',
    sujet: 'la valise',
    fixe: 'à la cabine',
    mobile: 'à l’immeuble',
  },
];

const IMMOBILE = 'immobile';
const MOUVEMENT = 'en mouvement';
const pourquoi = (s: Scene, fixe: boolean) =>
  fixe
    ? `Par rapport ${s.fixe}, ${s.sujet} ne change pas de position.`
    : `Par rapport ${s.mobile}, ${s.sujet} change de position au cours du temps.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 5) === 0) {
    const bon = 'par rapport à quoi on l’observe';
    const { answer, traps } = choice(rng, bon, [
      { label: 'la couleur de l’objet', why: 'La couleur ne dit rien sur le changement de position.' },
      { label: 'le prix de l’objet', why: 'Le prix n’a aucun rôle dans l’étude d’un mouvement.' },
    ]);
    return {
      prompt: 'Pour dire si un objet est immobile ou en mouvement, que faut-il toujours préciser ?',
      answer,
      traps,
      hint: 'Un mouvement est un changement de position… mesuré par rapport à quelque chose.',
      steps: [
        'Un mouvement est un changement de position par rapport à une référence.',
        `Il faut préciser **${bon}** : c’est le référentiel.`,
      ],
      targetSeconds: 25,
    };
  }
  const s = rng.pick(SCENES);
  const fixe = rng.int(0, 1) === 0;
  const bon = fixe ? IMMOBILE : MOUVEMENT;
  const { answer, traps } = choice(rng, bon, [
    { label: fixe ? MOUVEMENT : IMMOBILE, why: pourquoi(s, fixe) },
    { label: 'on ne peut pas le savoir', why: `La référence est donnée, on peut donc répondre. ${pourquoi(s, fixe)}` },
  ]);
  return {
    prompt: `${s.contexte} Par rapport ${fixe ? s.fixe : s.mobile}, ${s.sujet} est…`,
    answer,
    traps,
    hint: 'La distance et la position par rapport à cette référence changent-elles ?',
    steps: [pourquoi(s, fixe), `${maj(s.sujet)} est **${bon}** dans ce référentiel.`],
    targetSeconds: 25,
  };
};

const phrase = (s: Scene, a: string, b: string) =>
  `${maj(s.sujet)} est ${a} par rapport ${s.fixe} et ${b} par rapport ${s.mobile}`;

const niveau2 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SCENES);
  const bon = phrase(s, IMMOBILE, MOUVEMENT);
  const why = `${pourquoi(s, true)} ${pourquoi(s, false)}`;
  const { answer, traps } = choice(rng, bon, [
    { label: phrase(s, MOUVEMENT, IMMOBILE), why: `Les deux références sont inversées. ${why}` },
    { label: phrase(s, IMMOBILE, IMMOBILE), why: `Le mouvement dépend de la référence. ${why}` },
    { label: phrase(s, MOUVEMENT, MOUVEMENT), why: `Le mouvement dépend de la référence. ${why}` },
  ]);
  return {
    prompt: `${s.contexte} Quelle affirmation est exacte ?`,
    answer,
    traps,
    hint: 'Traite chaque référence séparément : la position change-t-elle par rapport à elle ?',
    steps: [pourquoi(s, true), pourquoi(s, false), `**${bon}**.`],
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SCENES);
  const inverse = rng.int(0, 1) === 1;
  const [premier, second] = inverse ? [s.mobile, s.fixe] : [s.fixe, s.mobile];
  const etats = [IMMOBILE, MOUVEMENT];
  return {
    prompt: `${s.contexte} Complète la description, d’abord par rapport ${premier}.`,
    answer: {
      kind: 'cloze',
      parts: [
        `Par rapport ${premier}, ${s.sujet} est `,
        ` ; par rapport ${second}, ${s.sujet} est `,
        '. La référence choisie pour décrire un mouvement s’appelle le ',
        '.',
      ],
      blanks: [
        { mode: 'list', options: etats, correct: inverse ? 1 : 0 },
        { mode: 'list', options: etats, correct: inverse ? 0 : 1 },
        { mode: 'text', accepted: ['référentiel', 'referentiel'] },
      ],
    },
    hint: 'Pour le dernier mot : il ressemble au mot « référence ».',
    steps: [
      pourquoi(s, true),
      pourquoi(s, false),
      'La référence choisie est le **référentiel** : le mouvement est relatif à ce choix.',
    ],
    targetSeconds: 55,
  };
};

const CAS: readonly { texte: string; bon: typeof IMMOBILE | typeof MOUVEMENT; why: string }[] = [
  {
    texte:
      'Deux cyclistes roulent côte à côte, dans le même sens et à la même vitesse, sur une route droite. Par rapport au premier, le second est-il immobile ou en mouvement ?',
    bon: IMMOBILE,
    why: 'Les deux cyclistes avancent ensemble : la position du second par rapport au premier ne change pas.',
  },
  {
    texte:
      'Une voiture roule devant un platane. Par rapport à la voiture, le platane est-il immobile ou en mouvement ?',
    bon: MOUVEMENT,
    why: 'La position du platane par rapport à la voiture change : dans ce référentiel, il est en mouvement.',
  },
  {
    texte:
      'Un train démarre le long d’un quai. Par rapport au train, un banc fixé sur le quai est-il immobile ou en mouvement ?',
    bon: MOUVEMENT,
    why: 'Vu du train, le banc change de position.',
  },
  {
    texte:
      'Dans un car qui roule, le conducteur et une passagère restent assis. Par rapport à la passagère, le conducteur est-il immobile ou en mouvement ?',
    bon: IMMOBILE,
    why: 'Leurs positions l’un par rapport à l’autre ne changent pas.',
  },
  {
    texte: 'Un voyageur dort sur son siège dans un avion en vol. Par rapport au sol, est-il immobile ou en mouvement ?',
    bon: MOUVEMENT,
    why: 'Même endormi, il est emporté par l’avion : sa position change par rapport au sol.',
  },
  {
    texte:
      'Un voyageur dort sur son siège dans un avion en vol. Par rapport à l’avion, est-il immobile ou en mouvement ?',
    bon: IMMOBILE,
    why: 'Sa place dans l’avion ne change pas.',
  },
  {
    texte:
      'Un bus passe devant une voiture garée. Par rapport au bus, la voiture garée est-elle immobile ou en mouvement ?',
    bon: MOUVEMENT,
    why: 'Par rapport au bus, la voiture change de position, même si elle est garée.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CAS);
  const autre = c.bon === IMMOBILE ? MOUVEMENT : IMMOBILE;
  const accepted = c.bon === IMMOBILE ? [IMMOBILE] : [MOUVEMENT, 'mouvement'];
  const { answer, traps } = saisie(accepted, [
    [autre, `Observe depuis la référence demandée dans la question. ${c.why}`],
  ]);
  return {
    prompt: c.texte,
    answer,
    traps,
    hint: 'Place-toi sur la référence citée : vois-tu l’objet changer de position ?',
    steps: ['Seule la position par rapport à la référence demandée compte.', c.why, `Réponse : **${c.bon}**.`],
    targetSeconds: 45,
  };
};

interface Compte {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly vues: readonly { q: string; bon: string; faux: readonly string[]; why: string }[];
}

const COMPTES: readonly Compte[] = [
  {
    titre: 'Le départ du train',
    lignes: [
      'Inès est assise dans un train arrêté ; sa valise est posée à côté d’elle.',
      'Karim est debout sur le quai.',
      'Le train démarre le long du quai.',
      'Inès et sa valise ne changent pas de place dans le wagon.',
      'Karim ne bouge pas.',
    ],
    vues: [
      {
        q: 'Après le démarrage, par rapport à quoi la valise est-elle en mouvement ?',
        bon: 'au quai',
        faux: ['au wagon', 'à Inès', 'au siège d’Inès'],
        why: 'Lignes 3 et 4 : la valise avance avec le wagon par rapport au quai, mais garde sa place dans le wagon.',
      },
      {
        q: 'Après le démarrage, qui ou quoi reste immobile par rapport au quai ?',
        bon: 'Karim',
        faux: ['Inès', 'la valise', 'le wagon'],
        why: 'Ligne 5 : Karim ne bouge pas ; le wagon et son contenu avancent le long du quai.',
      },
      {
        q: 'Après le démarrage, par rapport à Inès, qui ou quoi est en mouvement ?',
        bon: 'Karim',
        faux: ['la valise', 'le wagon', 'le siège d’Inès'],
        why: 'Pour Inès, la valise, le siège et le wagon gardent leur place, tandis que Karim s’éloigne.',
      },
    ],
  },
  {
    titre: 'Le tapis roulant de l’aéroport',
    lignes: [
      'Un tapis roulant avance dans un couloir.',
      'Léa se tient sans marcher sur le tapis, son chariot à côté d’elle.',
      'Marc se tient debout sur le sol du couloir, à côté du tapis, sans bouger.',
      'Le chariot reste à la même place à côté de Léa.',
    ],
    vues: [
      {
        q: 'Par rapport à quoi le chariot est-il immobile ?',
        bon: 'à Léa',
        faux: ['à Marc', 'au sol du couloir', 'aux murs du couloir'],
        why: 'Ligne 4 : le chariot garde sa place à côté de Léa, mais il avance par rapport au couloir.',
      },
      {
        q: 'Par rapport à Léa, qui ou quoi est en mouvement ?',
        bon: 'Marc',
        faux: ['son chariot', 'la partie du tapis sous ses pieds', 'les chaussures qu’elle porte'],
        why: 'Lignes 2 et 3 : Léa avance avec le tapis ; la position de Marc par rapport à elle change.',
      },
    ],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(COMPTES);
  const v = rng.pick(c.vues);
  const { answer, traps } = choice(
    rng,
    v.bon,
    v.faux.map((label) => ({ label, why: v.why })),
  );
  return {
    prompt: `Lis le document. ${v.q}`,
    figure: { kind: 'document', title: c.titre, lines: c.lignes },
    answer,
    traps,
    hint: 'Pour chaque proposition, demande-toi si la position change par rapport à la référence de la question.',
    steps: [
      'Le mouvement est relatif : on compare les positions par rapport à une seule référence.',
      v.why,
      `Réponse : **${v.bon}**.`,
    ],
    targetSeconds: 70,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const referentielNotion: Skill = {
  id: 'p5-referentiel',
  title: 'Le référentiel',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **référentiel** est ce par rapport à quoi on observe un mouvement : le sol, un wagon, un bateau…',
      'La **relativité du mouvement** : assis dans un train qui roule, tu es immobile par rapport au wagon et en mouvement par rapport au quai.',
    ],
    ...referencesMouvement(
      'referentiel-definition',
      'mouvement-definition',
      'relativite',
      'observateur',
      'point-de-vue',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
