import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { BANQUES, DEFINITIONS_CULTURE, faitCultureCm2, sourcesCultureCm2, type Banque } from './culture-cm2.donnees.ts';
import type { Saisie } from './lecture-cm2.donnees.ts';
import { associer, qcm, ranger, saisir, trous } from './lecture-outils.ts';
import { pickN } from './outils.ts';

/**
 * Chapitre « Culture littéraire » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025) : genres littéraires
 * (récit, théâtre, poésie, fable, conte), morale et merveilleux.
 */

/** Textes d'accompagnement d'une notion : la définition ouvre les étapes, les indices ne donnent pas la réponse. */
interface Guide {
  readonly definition: Rich;
  /** Consigne d’association, si les paires ne sont pas « description → nom ». */
  readonly consigne?: string;
  readonly association: string;
  readonly indice: string;
  readonly indiceLong: string;
}

const apparier = (rng: Rng, paires: Banque['paires'], n: 3 | 5, consigne: string, g: Guide): QuestionDraft => {
  const choisies = pickN(rng, paires, n);
  return associer(
    rng,
    `${consigne} ${g.consigne ?? 'Associe chaque description à son nom.'} À classer : ${choisies.map(([a]) => `« ${a} »`).join(' ')}`,
    choisies,
    g.association,
    [g.definition, ...choisies.map(([a, b]) => `« ${a} » → ${b}.`)],
  );
};

const repondre = (s: Saisie, consigne: string, g: Guide): QuestionDraft =>
  saisir(s, consigne, [g.definition], g.indice);

const draft =
  (banque: Banque, g: Guide) =>
  (rng: Rng, level: Level): QuestionDraft => {
    const unSurDeux = () => rng.int(1, 2) === 1;
    switch (level) {
      case 1:
        return qcm(rng, rng.pick(banque.decouvrir), 2, {
          consigne: 'Lis le texte.',
          definition: g.definition,
          hint: g.indice,
        });
      case 2:
        return unSurDeux()
          ? apparier(rng, banque.paires, 3, 'Observe bien.', g)
          : qcm(rng, rng.pick(banque.reconnaitre), 3, {
              consigne: 'Observe bien.',
              definition: g.definition,
              hint: g.indice,
            });
      case 3:
        if (banque.suites.length > 0 && unSurDeux()) {
          const s = rng.pick(banque.suites);
          return ranger(rng, s.ordre, {
            prompt: `Remets l’histoire dans l’ordre. (${s.titre})`,
            hint: 'Cherche d’abord le tout premier fait. Les mots de temps t’aident.',
            steps: [g.definition, s.preuve, `L’ordre juste : **${s.ordre.join(' ')}**`],
          });
        }
        return repondre(rng.pick(banque.ecrire), 'À toi d’écrire !', g);
      case 4:
        return unSurDeux()
          ? apparier(rng, banque.cinq, 5, 'Défi des cinq paires !', g)
          : repondre(rng.pick(banque.pieges), 'Attention au piège !', g);
      default: {
        const t = rng.pick(banque.longs);
        return trous(rng, t, t.trous, {
          prompt: `Lis « ${t.titre} » en entier. Complète chaque phrase.`,
          hint: g.indiceLong,
          etapes: [g.definition],
        });
      }
    }
  };

interface Notion {
  readonly id: string;
  readonly title: string;
  readonly memo: readonly Rich[];
  readonly factId: string;
  readonly faits: readonly string[];
  readonly banque: Banque;
  readonly guide: Guide;
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: {
    memo: n.memo,
    source: `Programme de français du cycle 3 (BO du 17 avril 2025), cours moyen — « ${faitCultureCm2(n.factId).citation} »`,
    sources: sourcesCultureCm2(n.faits),
  },
  generate: draft(n.banque, n.guide),
});

export const FCM2_CULTURE: readonly Skill[] = [
  skill({
    id: 'fcm2-recit-narrateur',
    title: 'Le récit : personnage et narrateur',
    memo: [
      'Dans un **récit**, l’**auteur** écrit le livre. Le **narrateur** raconte, et le **personnage** agit.',
      'Le **héros** est le personnage principal. Exemple : « Je courus » (narrateur dans l’histoire).',
      'Le **dénouement** termine l’histoire.',
    ],
    factId: 'cl2-prog-genres',
    faits: DEFINITIONS_CULTURE.recit,
    banque: BANQUES.recit,
    guide: {
      definition: 'Un **récit** raconte des événements : l’**auteur** l’écrit, le **narrateur** le raconte.',
      association: 'Demande-toi : qui écrit, qui raconte, qui agit ?',
      indice: 'Demande-toi qui écrit, qui raconte et qui agit.',
      indiceLong: 'Repère le nom de la personne qui écrit, puis celui qui agit.',
    },
  }),
  skill({
    id: 'fcm2-theatre',
    title: 'Le théâtre : réplique et didascalie',
    memo: [
      'Au **théâtre**, une **réplique** est ce qu’un personnage dit. La **didascalie** dit comment jouer.',
      'Exemple : « LÉA (en riant). — Bravo ! » On dit « Bravo ! », on ne dit pas « en riant ».',
      'Une **tirade** est une longue réplique. Un **aparté** est caché aux autres personnages.',
      'La pièce se découpe en **actes**, et chaque acte en **scènes**. La **comédie** veut divertir.',
    ],
    factId: 'cl2-prog-forme',
    faits: DEFINITIONS_CULTURE.theatre,
    banque: BANQUES.theatre,
    guide: {
      definition:
        'Une **pièce de théâtre** se joue : des **répliques** sont dites, des **didascalies** guident le jeu.',
      association: 'Demande-toi : est-ce dit, joué, ou une partie de la pièce ?',
      indice: 'Regarde les parenthèses, les noms et qui peut entendre.',
      indiceLong: 'Les parenthèses guident le jeu ; le nom indique qui parle.',
    },
  }),
  skill({
    id: 'fcm2-poesie',
    title: 'La poésie : vers, strophe, rime',
    memo: [
      'Un **vers** est une ligne d’un **poème**. Une **strophe** est un groupe de vers.',
      'Une **rime** est un son qui revient à la fin des vers : « lune » et « prune ».',
      'Un **quatrain** a quatre vers. Rimes plates : AABB. Croisées : ABAB. Embrassées : ABBA.',
    ],
    factId: 'cl2-prog-poesie',
    faits: DEFINITIONS_CULTURE.poesie,
    banque: BANQUES.poesie,
    guide: {
      definition:
        'Dans un **poème**, les lignes sont des **vers**, groupés en **strophes**, souvent avec des **rimes**.',
      association: 'Pense à la ligne, au groupe de lignes et au son.',
      indice: 'Dis les derniers mots de chaque ligne à voix haute et compte les lignes.',
      indiceLong: 'Compare le dernier son de chaque ligne.',
    },
  }),
  skill({
    id: 'fcm2-fable-morale',
    title: 'La fable et la morale',
    memo: [
      'Une **fable** est un court récit qui porte une leçon : la **morale**.',
      'La morale peut ouvrir ou fermer le texte. Exemple : « Rien ne sert de courir, il faut partir à point. »',
    ],
    factId: 'cl2-prog-morale',
    faits: DEFINITIONS_CULTURE.fable,
    banque: BANQUES.fable,
    guide: {
      definition: 'Une **fable** est un court récit qui exprime une leçon, souvent une **morale**.',
      consigne: 'Associe chaque histoire à sa morale.',
      association: 'Pour chaque histoire, demande-toi : qu’est-ce qu’elle apprend ?',
      indice: 'Qui réussit, qui échoue, et pourquoi ?',
      indiceLong: 'Relis la fin : quelle leçon en tires-tu ?',
    },
  }),
  skill({
    id: 'fcm2-conte-merveilleux',
    title: 'Le conte merveilleux',
    memo: [
      'Un **conte** est un court récit d’aventures imaginaires. Le **merveilleux** y fait entrer la magie.',
      'Une **fée**, un **ogre** ou une **métamorphose** : voilà des indices ! Début : « Il était une fois ».',
      'Perrault a publié des contes célèbres.',
    ],
    factId: 'cl2-prog-merveilleux',
    faits: DEFINITIONS_CULTURE.conte,
    banque: BANQUES.conte,
    guide: {
      definition:
        'Un **conte** merveilleux mêle des êtres ou des faits impossibles dans la réalité : c’est le **merveilleux**.',
      association: 'Imagine chaque mot dans un conte que tu connais.',
      indice: 'Demande-toi : est-ce possible dans la vraie vie ?',
      indiceLong: 'Cherche ce qui est impossible dans la vraie vie, puis la fin.',
    },
  }),
];
