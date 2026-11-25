import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill, Trap } from '../types.ts';
import {
  A_A,
  CES_SES,
  ET_EST,
  MOTS_INVARIABLES,
  MOTS_VARIABLES,
  ON_ONT,
  SON_SONT,
  faitOrthographe,
  sourcesOrthographe,
  type Emploi,
  type MotInvariable,
  type Paire,
  type Phrase,
} from './orthographe-mots.donnees.ts';
import { at, document, pickN, textTrap } from './outils.ts';

/**
 * Chapitre « Orthographe des mots » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * vocabulaire : « Mémoriser l’orthographe des mots » ; étude de la langue pour les natures de mots.
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitOrthographe(id).citation} »`;

/** La phrase avec ses trous remplis. */
export const remplir = (texte: string, mots: readonly string[]): string => {
  const parts = texte.split('…');
  return parts.map((part, i) => (i === 0 ? part : `${at(mots, i - 1)}${part}`)).join('');
};

const motsDe = (paire: Paire) => paire.emplois.map((e) => e.mot);
const emploiDe = (paire: Paire, mot: string): Emploi => {
  const e = paire.emplois.find((x) => x.mot === mot);
  if (!e) throw new Error(`mot inconnu : ${mot}`);
  return e;
};
const autreMot = (paire: Paire, mot: string) => at(motsDe(paire), mot === paire.emplois[0].mot ? 1 : 0);
const pourquoi = (paire: Paire, bon: string): Rich => {
  const e = emploiDe(paire, bon);
  return `Ici il faut « ${bon} ». ${e.role} ${e.essai}`;
};
const entreGuillemets = (mots: readonly string[]) => mots.map((m) => `« ${m} »`);
const liste = (mots: readonly string[]) => {
  const q = entreGuillemets(mots);
  return `${q.slice(0, -1).join(', ')} ou ${at(q, q.length - 1)}`;
};
/** Un mot des deux, tiré à parts égales, puis une phrase qui l'attend. */
const phraseSimple = (rng: Rng, paire: Paire): { phrase: Phrase; bon: string } => {
  const bon = rng.pick(motsDe(paire));
  const phrase = rng.pick(paire.simples.filter((x) => x.mots[0] === bon));
  return { phrase, bon };
};

function paireDraft(paire: Paire, avant: Paire | undefined) {
  return (rng: Rng, level: Level): QuestionDraft => {
    const [m1, m2] = motsDe(paire) as [string, string];
    switch (level) {
      case 1: {
        const { phrase, bon } = phraseSimple(rng, paire);
        const { answer, traps } = choice(rng, bon, [
          { label: autreMot(paire, bon), why: pourquoi(paire, bon) },
          { label: paire.intrus.mot, why: paire.intrus.why },
        ]);
        return {
          prompt: `Quel mot complète la phrase « ${phrase.texte} » ?`,
          answer,
          traps,
          hint: paire.indice,
          steps: explications(paire, phrase),
        };
      }
      case 2: {
        const phrases = pickN(rng, paire.simples, 4);
        const [juste, ...fausses] = phrases as [Phrase, ...Phrase[]];
        const bon = remplir(juste.texte, juste.mots);
        const { answer, traps } = choice(
          rng,
          bon,
          fausses.map((x) => {
            const attendu = at(x.mots, 0);
            return { label: remplir(x.texte, [autreMot(paire, attendu)]), why: pourquoi(paire, attendu) };
          }),
        );
        return {
          prompt: 'Une seule phrase est bien écrite. Laquelle ?',
          answer,
          traps,
          hint: paire.indice,
          steps: [...explications(paire, juste).slice(0, -1), `La bonne phrase est **${bon}**`],
        };
      }
      case 3: {
        const { phrase, bon } = phraseSimple(rng, paire);
        const accepted = [bon];
        const traps: Trap[] = [
          textTrap(autreMot(paire, bon), pourquoi(paire, bon)),
          textTrap(paire.intrus.mot, paire.intrus.why),
        ];
        return {
          prompt: `Écris ${liste([m1, m2])} : « ${phrase.texte} »`,
          answer: { kind: 'text', accepted },
          traps,
          hint: paire.indice,
          steps: explications(paire, phrase),
        };
      }
      case 4: {
        const phrase = rng.pick(paire.doubles);
        const parts = phrase.texte.split('…');
        return {
          prompt: `Attention, deux trous ! ${liste([m1, m2])} ? « ${phrase.texte} »`,
          answer: {
            kind: 'cloze',
            parts,
            blanks: phrase.mots.map((m) => ({ mode: 'text' as const, accepted: [m] })),
          },
          hint: 'Fais l’essai pour chaque trou, un par un.',
          steps: explications(paire, phrase),
        };
      }
      default: {
        const anciennes = avant ? pickN(rng, avant.doubles, 1).map((phrase) => ({ phrase, de: avant })) : [];
        const lignes = rng.shuffle([
          ...pickN(rng, paire.doubles, 3 - anciennes.length).map((phrase) => ({ phrase, de: paire })),
          ...anciennes,
        ]);
        const mots = [...(avant ? motsDe(avant) : []), m1, m2];
        const attendus = lignes.flatMap((l) => l.phrase.mots);
        return {
          prompt: `Lis le texte. Complète avec ${liste(mots)}.`,
          figure: document(
            'Carnet de bord',
            lignes.map((l) => l.phrase.texte),
          ),
          answer: {
            kind: 'cloze',
            parts: ['Ligne 1 : ', ' puis ', '. Ligne 2 : ', ' puis ', '. Ligne 3 : ', ' puis ', '.'],
            blanks: attendus.map((m) => ({ mode: 'text' as const, accepted: [m] })),
          },
          hint: 'Pour chaque trou, cherche d’abord les deux mots possibles, puis fais l’essai.',
          steps: [
            ...lignes.flatMap((l) => explications(l.de, l.phrase).slice(0, -1)),
            `Réponses : **${attendus.join(', ')}**.`,
          ].filter((s, i, all) => all.indexOf(s) === i),
        };
      }
    }
  };
}

/** Ce qu'on cherche, comment on le vérifie, puis la réponse en gras. */
function explications(paire: Paire, phrase: Phrase): string[] {
  const uniques = [...new Set(phrase.mots)];
  return [
    ...uniques.flatMap((m) => {
      const e = emploiDe(paire, m);
      return [`${e.role} ${e.essai}`];
    }),
    `On écrit : **${remplir(phrase.texte, phrase.mots)}**`,
  ];
}

// ───────────────────────── Mots invariables ─────────────────────────

const COURANTS = MOTS_INVARIABLES.filter((x) => x.niveau === 'courant');
const DIFFICILES = MOTS_INVARIABLES.filter((x) => x.niveau === 'difficile');
/** Niveau 2 : les adverbes seuls (« entre » ou « sous » peuvent aussi être d'autres mots, qui changent). */
export const ADVERBES_SURS = ['toujours', 'souvent', 'jamais', 'alors', 'encore', 'assez'];

const INVARIABLE = 'Un mot invariable s’écrit toujours de la même façon.';
/** Fautes qui sont aussi de vrais mots : on dit lequel. */
const VRAIS_MOTS: Readonly<Record<string, string>> = {
  sens: '« sens » est un autre mot : le sens d’une phrase.',
  sou: '« sou » est un autre mot : une petite pièce de monnaie.',
  antre: '« antre » est un autre mot : la grotte d’une bête sauvage.',
};
const fauteWhy = (x: MotInvariable, faute: string): Rich =>
  `${VRAIS_MOTS[faute] ?? `Compare lettre par lettre avec « ${x.mot} ».`} Ici, on écrit « ${x.mot} » : garde son image en tête.`;
const piegesFautes = (x: MotInvariable): Trap[] => x.fautes.map((t) => textTrap(t, fauteWhy(x, t)));
const nature = (x: MotInvariable) => (x.classe === 'adverbe' ? 'un adverbe' : 'une préposition');
const etapesMot = (x: MotInvariable): string[] => [
  INVARIABLE,
  `« ${x.mot} » est ${nature(x)} : on l’apprend par cœur.`,
  `On écrit **${x.mot}**.`,
];

function invariableDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const x = rng.pick(COURANTS);
      const { answer, traps } = choice(
        rng,
        x.mot,
        x.fautes.map((label) => ({ label, why: fauteWhy(x, label) })),
      );
      return {
        prompt: `Quel mot est bien écrit ? « ${x.phrase} »`,
        answer,
        traps,
        hint: 'Regarde chaque lettre, surtout celles qu’on n’entend pas.',
        steps: etapesMot(x),
      };
    }
    case 2: {
      const x = rng.pick(COURANTS.filter((m) => ADVERBES_SURS.includes(m.mot)));
      const { answer, traps } = choice(
        rng,
        x.mot,
        pickN(rng, MOTS_VARIABLES, 3).map(([label, forme]) => ({
          label,
          why: `« ${label} » change : on peut écrire « ${forme} ».`,
        })),
      );
      return {
        prompt: 'Quel mot est invariable ?',
        answer,
        traps,
        hint: 'Essaie de mettre chaque mot au pluriel ou de le conjuguer.',
        steps: [
          INVARIABLE,
          'Les autres mots ont plusieurs formes.',
          `« ${x.mot} » ne change jamais : c’est **${x.mot}**.`,
        ],
      };
    }
    case 3: {
      const x = rng.pick(COURANTS);
      return {
        prompt: `Écris en entier le mot coupé : « ${x.phrase.replace('…', `${x.debut}…`)} »`,
        answer: { kind: 'text', accepted: [x.mot] },
        traps: piegesFautes(x),
        hint: 'Dis la phrase dans ta tête, puis pense à la fin du mot, parfois muette.',
        steps: etapesMot(x),
      };
    }
    case 4: {
      const x = rng.pick(DIFFICILES);
      const faute = rng.pick(x.fautes);
      return {
        prompt: `Un mot est mal écrit. Écris seulement ce mot, sans faute : « ${x.phrase.replace('…', faute)} »`,
        answer: { kind: 'text', accepted: [x.mot] },
        traps: piegesFautes(x),
        hint: 'Cherche le petit mot qui ne change jamais, puis vérifie lettres et accents.',
        steps: etapesMot(x),
      };
    }
    default: {
      const choisis = rng.shuffle([...pickN(rng, DIFFICILES, 2), rng.pick(COURANTS)]);
      return {
        prompt: 'Lis le texte. Chaque ligne cache un mot mal écrit. Écris ces mots correctement.',
        figure: document(
          'Mon journal',
          choisis.map((x) => x.phrase.replace('…', rng.pick(x.fautes))),
        ),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1 : ', '. Ligne 2 : ', '. Ligne 3 : ', '.'],
          blanks: choisis.map((x) => ({ mode: 'text' as const, accepted: [x.mot] })),
        },
        hint: 'Relis chaque ligne et cherche un petit mot qui ne change jamais.',
        steps: [
          INVARIABLE,
          ...choisis.map((x, i) => `Ligne ${i + 1} : « ${x.mot} » est ${nature(x)}, son écriture ne change jamais.`),
          `Réponses : **${choisis.map((x) => x.mot).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── Notions du chapitre ─────────────────────────

interface Notion {
  readonly id: string;
  readonly title: string;
  readonly memo: readonly string[];
  readonly factId: string;
  readonly faits: readonly string[];
  readonly generate: Skill['generate'];
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: {
    memo: n.memo,
    source: programme(n.factId),
    sources: sourcesOrthographe(n.factId, 'mots-frequents', ...n.faits),
  },
  generate: n.generate,
});

export const FCM1_ORTHOGRAPHE_MOTS: readonly Skill[] = [
  skill({
    id: 'fcm1-a-a',
    title: 'a ou à',
    memo: [
      'Ce sont des **homophones** : on entend la même chose, mais on écrit deux mots différents.',
      '« a » est le **verbe** avoir. Essaie « avait » : « il a faim » → « il avait faim ».',
      '« à » est une **préposition** : « je vais à l’école ». « Avait » n’y va pas.',
    ],
    factId: 'etre-avoir',
    faits: ['substitution', 'avoir', 'preposition-a', 'preposition'],
    generate: paireDraft(A_A, undefined),
  }),
  skill({
    id: 'fcm1-et-est',
    title: 'et ou est',
    memo: [
      'Deux **homophones** : « et » ajoute, c’est une **conjonction de coordination**. « Le pain et le beurre. »',
      '« est » est le **verbe** être. Essaie « était » : « il est là » → « il était là ».',
    ],
    factId: 'conjonctions',
    faits: ['substitution', 'etre-avoir', 'et', 'etre'],
    generate: paireDraft(ET_EST, A_A),
  }),
  skill({
    id: 'fcm1-son-sont',
    title: 'son ou sont',
    memo: [
      '« son » est un **déterminant possessif** : « son vélo » (comme « mon vélo »).',
      '« sont » est le **verbe** être au **pluriel**. Essaie « étaient » : « ils sont là » → « ils étaient là ».',
    ],
    factId: 'determinants',
    faits: ['substitution', 'etre-avoir', 'son', 'etre'],
    generate: paireDraft(SON_SONT, ET_EST),
  }),
  skill({
    id: 'fcm1-on-ont',
    title: 'on ou ont',
    memo: [
      '« on » est un **pronom personnel** sujet. Essaie « il » : « on joue » → « il joue ».',
      '« ont » est le **verbe** avoir au **pluriel**. Essaie « avaient » : « ils ont faim » → « ils avaient faim ».',
    ],
    factId: 'pronoms',
    faits: ['substitution', 'etre-avoir', 'on', 'avoir'],
    generate: paireDraft(ON_ONT, SON_SONT),
  }),
  skill({
    id: 'fcm1-ces-ses',
    title: 'ces ou ses',
    memo: [
      '« ces » est un **déterminant démonstratif** : on montre. « Regarde ces nuages-là ! » (ce nuage).',
      '« ses » est un **déterminant possessif** : c’est à quelqu’un. « Il range ses jouets. » (son jouet).',
    ],
    factId: 'determinants',
    faits: ['substitution', 'ce', 'son'],
    generate: paireDraft(CES_SES, ON_ONT),
  }),
  skill({
    id: 'fcm1-mots-invariables',
    title: 'Les mots invariables fréquents',
    memo: [
      'Un mot **invariable** ne change jamais. Apprends son écriture une bonne fois !',
      'Les **adverbes** (toujours, beaucoup) et les **prépositions** (chez, sous) sont invariables.',
    ],
    factId: 'invariable',
    faits: ['adverbes', 'adverbe', 'preposition', ...MOTS_INVARIABLES.map((x) => x.fait)],
    generate: invariableDraft,
  }),
];
