import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, maj, notion, ordre, qcm, saisie } from './outils.ts';
import {
  FONCTIONS_ENERGIE as F,
  ROLE_ENERGIE,
  de,
  SYSTEMES_ENERGIE,
  type FonctionEnergie,
  type SystemeEnergie,
} from './systemes.ts';

// ——— Fonctions de la chaîne d'énergie : alimenter, distribuer, convertir, transmettre ———

const POURQUOI: Readonly<Record<FonctionEnergie, string>> = {
  alimenter: 'Alimenter, c’est fournir l’énergie au système, au début de la chaîne.',
  distribuer: 'Distribuer, c’est laisser passer ou non l’énergie : un choix « passe ou ne passe pas ».',
  convertir: 'Convertir, c’est changer la forme de l’énergie, par exemple électrique en mouvement.',
  transmettre: 'Transmettre, c’est faire circuler l’énergie d’un constituant à un autre, jusqu’à l’action.',
};

/** Réponse écrite : le verbe de la fonction ; les autres fonctions sont des erreurs expliquées. */
const verbe = (bonne: FonctionEnergie) =>
  saisie(
    [bonne, `${bonne} l’énergie`, ...(bonne === 'alimenter' ? ['alimenter en énergie'] : [])],
    [
      ...F.filter((f) => f !== bonne).map((f) => [f, POURQUOI[f]] as const),
      ['acquérir', 'Acquérir est une fonction de la chaîne d’information : prélever des informations.'],
    ],
  );

const fiche = (s: SystemeEnergie, lignes: readonly string[]) => ({
  kind: 'document' as const,
  title: `Fiche : ${s.nom}`,
  lines: [...lignes.map(maj), `Action attendue : ${s.action}.`],
});

const niveau1 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(F);
  return {
    prompt: `Dans la chaîne d’énergie, quelle fonction consiste à ${ROLE_ENERGIE[f]} ?`,
    ...qcm(rng, f, [
      { label: 'acquérir', why: 'Acquérir appartient à la chaîne d’information : prélever des informations.' },
      { label: 'traiter', why: 'Traiter appartient à la chaîne d’information : exécuter le programme.' },
    ]),
    hint: 'Les deux chaînes n’ont pas les mêmes verbes : cherche celui qui parle d’énergie.',
    steps: [POURQUOI[f], `La réponse est **${f}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const paires = rng
      .shuffle(F)
      .slice(0, 3)
      .map((f) => [f, ROLE_ENERGIE[f]] as const);
    return {
      prompt: `Associe chaque fonction de la chaîne d’énergie à son rôle : ${paires.map((p) => p[0]).join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Repère d’abord le verbe qui parle d’un changement de forme.',
      steps: [
        'Chaque verbe désigne un rôle précis dans le trajet de l’énergie.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const s = rng.pick(SYSTEMES_ENERGIE);
  const f = rng.pick(F);
  return {
    prompt: `Dans ${s.nom}, quelle fonction assure ce constituant : ${s.constituants[f]} ?`,
    ...qcm(
      rng,
      f,
      F.filter((x) => x !== f).map((x) => ({ label: x, why: POURQUOI[x] })),
    ),
    hint: 'Ce constituant fournit-il l’énergie, la laisse-t-il passer, la change-t-il ou la fait-il avancer ?',
    steps: [`Ce constituant sert à ${ROLE_ENERGIE[f]}.`, `La réponse est **${f}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const s = rng.pick(SYSTEMES_ENERGIE);
    return {
      prompt: `Dans ${s.nom}, range les quatre fonctions de la chaîne d’énergie, de la source d’énergie à l’action (${s.action}).`,
      answer: ordre(rng, F),
      hint: 'On part de la réserve ou de l’arrivée d’énergie et on avance jusqu’au mouvement.',
      steps: [
        'L’énergie est fournie, puis autorisée à passer, puis changée de forme, puis amenée jusqu’à l’action.',
        `L’ordre est : **${F.join(' → ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const f = rng.pick(F);
  return {
    prompt: `Écris le verbe qui nomme cette fonction de la chaîne d’énergie : ${ROLE_ENERGIE[f]}.`,
    ...verbe(f),
    hint: 'Il y a quatre verbes : pense au trajet de l’énergie, du début jusqu’à l’action.',
    steps: [POURQUOI[f], `La réponse est **${f}**.`],
    targetSeconds: 35,
  };
};

interface Cas {
  readonly texte: string;
  readonly fonction: FonctionEnergie;
}

const CAS: readonly Cas[] = [
  { texte: 'Les piles d’une lampe torche fournissent l’énergie à la lampe.', fonction: 'alimenter' },
  { texte: 'La prise de courant apporte l’énergie à un grille-pain.', fonction: 'alimenter' },
  {
    texte: 'Sur ordre du programme, un relais laisse passer ou coupe le courant vers un moteur.',
    fonction: 'distribuer',
  },
  { texte: 'L’usager appuie sur un interrupteur pour ouvrir ou fermer le circuit.', fonction: 'distribuer' },
  { texte: 'Une lampe reçoit de l’énergie électrique et émet de la lumière.', fonction: 'convertir' },
  { texte: 'Un radiateur électrique produit de la chaleur à partir du courant.', fonction: 'convertir' },
  { texte: 'Un vérin électrique produit un mouvement en ligne droite à partir du courant.', fonction: 'convertir' },
  { texte: 'Une chaîne de vélo amène le mouvement du pédalier jusqu’à la roue arrière.', fonction: 'transmettre' },
  { texte: 'Des engrenages font passer la rotation du moteur aux fouets d’un batteur.', fonction: 'transmettre' },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CAS);
  return {
    prompt: `${c.texte} Quelle fonction de la chaîne d’énergie est décrite ? Écris le verbe.`,
    ...verbe(c.fonction),
    hint: 'Regarde ce qui arrive à l’énergie : arrive-t-elle, est-elle bloquée ou non, change-t-elle de forme, se déplace-t-elle ?',
    steps: [POURQUOI[c.fonction], `La réponse est **${c.fonction}**.`],
    targetSeconds: 40,
  };
};

const PANNES: readonly { fonction: FonctionEnergie; constat: (s: SystemeEnergie) => string }[] = [
  {
    fonction: 'alimenter',
    constat: (s) => `Aucune énergie ne sort de ${s.constituants.alimenter}, alors que le reste est en bon état.`,
  },
  {
    fonction: 'distribuer',
    constat: (s) =>
      `L’énergie arrive jusqu’à ${s.constituants.distribuer}, qui reçoit bien la commande de marche, mais ne laisse jamais passer le courant.`,
  },
  {
    fonction: 'convertir',
    constat: (s) => `Le courant arrive bien à ${s.constituants.convertir}, mais aucun mouvement n’est produit.`,
  },
  {
    fonction: 'transmettre',
    constat: (s) =>
      `Pendant l’essai, ${s.constituants.convertir} tourne, mais le mouvement n’arrive pas jusqu’au bout : le système n’arrive pas à ${s.action}.`,
  },
];

/** « à le moteur » → « au moteur » (couvre aussi « jusqu’à le relais »). */
const contracte = (t: string) => t.replaceAll('à le ', 'au ').replaceAll('de le ', 'du ');

const niveau5 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYSTEMES_ENERGIE);
  const suite = F.map((f) => maj(s.constituants[f]));
  if (rng.int(0, 2) === 0) {
    return {
      prompt: `Lis la fiche ${de(s.nom)}. Range ses constituants dans l’ordre de la chaîne d’énergie, de la source jusqu’à l’action.`,
      figure: fiche(
        s,
        rng.shuffle(suite).map((c) => `Constituant : ${c.toLowerCase()}.`),
      ),
      answer: ordre(rng, suite),
      hint: 'Attribue d’abord une fonction à chaque constituant.',
      steps: [
        `On associe les fonctions : ${F.map((f) => `${f} (${s.constituants[f]})`).join(', ')}.`,
        `L’ordre est : **${suite.join(' → ')}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const p = rng.pick(PANNES);
  return {
    prompt: `${contracte(p.constat(s))} Quelle fonction de la chaîne d’énergie n’est plus assurée ? Écris le verbe.`,
    figure: fiche(
      s,
      rng.shuffle(suite).map((c) => `Constituant : ${c.toLowerCase()}.`),
    ),
    ...verbe(p.fonction),
    hint: 'Suis l’énergie constituant par constituant : à quel endroit le trajet s’arrête-t-il ?',
    steps: [
      `On cherche le constituant où le trajet s’arrête, puis son rôle : ${ROLE_ENERGIE[p.fonction]}.`,
      `La fonction qui n’est plus assurée est **${p.fonction}** (${s.constituants[p.fonction]}).`,
    ],
    targetSeconds: 60,
  };
};

export const fonctionsEnergie = notion(
  {
    id: 't4-fonctions-energie',
    title: 'Les fonctions de la chaîne d’énergie',
    memo: [
      'La **chaîne d’énergie** permet à un système de réaliser une action avec l’énergie qu’il reçoit. Quatre verbes à retenir : alimenter, distribuer, convertir, transmettre.',
      'Exemple d’une trottinette : la batterie alimente, l’interrupteur distribue, le moteur convertit, la courroie transmet.',
    ],
    classe: '4e',
    attendu: 'Identifier les constituants d’une chaîne d’énergie et les associer à leurs fonctions',
    sources: ['eduscol-sti-chaine-energie', 'eduscol-sti-alimenter-distribuer', 'eduscol-sti-trottinette'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
