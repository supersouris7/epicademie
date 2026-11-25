import type { Chapter, Skill } from '../types.ts';
import { choice } from '../build.ts';
import { SKILLS as AGE_INDUSTRIEL } from './age-industriel.ts';
import { SKILLS as AVANT_LA_FRANCE } from './avant-la-france.ts';
import { SKILLS as EMPIRE_ROMAIN } from './empire-romain.ts';
import { SKILLS as GUERRES_EUROPE } from './guerres-europe.ts';
import { SKILLS as HUMANITE } from './humanite.ts';
import { SKILLS as TEMPS_DES_ROIS } from './le-temps-des-rois.ts';
import { SKILLS as RECITS_FONDATEURS } from './recits-fondateurs.ts';
import { SKILLS as REVOLUTION_EMPIRE } from './revolution-empire.ts';
import { SKILLS as REPERES_6E } from './reperes-6e.ts';
import { SKILLS as SE_REPERER_CM2 } from './se-reperer-cm2.ts';
import { SKILLS as SE_REPERER } from './se-reperer.ts';
import { SKILLS as TEMPS_REPUBLIQUE } from './temps-republique.ts';

/**
 * Histoire, cycle 3 (docs/adr/0024-contenus-hors-maths.md). Source institutionnelle unique :
 * programme du cycle 3 (Éduscol, « Programme du cycle 3, en vigueur à la rentrée 2023 », d'après
 * le BOEN n° 31 du 30 juillet 2020 et le BOEN n° 25 du 22 juin 2023), repères annuels de
 * programmation d'histoire. Chaque fait est écrit tel quel dans le programme : la citation est
 * gardée avec la question.
 */

const PROG = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), histoire';

type Kind = 'annee' | 'personne' | 'siecle' | 'notion';
interface Fact {
  readonly question: string;
  readonly answer: string;
  readonly kind: Kind;
  /** Citation exacte du programme. */
  readonly quote: string;
  readonly explain: string;
}

const CM1: readonly Fact[] = [
  {
    question: 'En quelle année Charlemagne est-il couronné empereur ?',
    answer: '800',
    kind: 'annee',
    quote: 'Charlemagne, couronné empereur en 800, roi des Francs et des Lombards',
    explain: 'Charlemagne, roi des Francs et des Lombards, est couronné empereur en 800.',
  },
  {
    question:
      'Quel roi des Francs est l’occasion d’étudier le lien entre les peuples « barbares » et l’empire romain ?',
    answer: 'Clovis',
    kind: 'personne',
    quote:
      'Clovis, roi des Francs, est l’occasion de revisiter les relations entre les peuples dits barbares et l’empire romain',
    explain: 'Clovis, roi des Francs : son baptême montre la continuité entre mondes romain et mérovingien.',
  },
  {
    question: 'Au cours de quel siècle règne Louis IX, le « roi chrétien » ?',
    answer: 'XIIIe siècle',
    kind: 'siecle',
    quote: 'Louis IX, le « roi chrétien » au XIIIe siècle',
    explain: 'Louis IX, le « roi chrétien », règne au XIIIe siècle.',
  },
  {
    question: 'Quel roi est un protecteur des Arts et des Lettres à la Renaissance ?',
    answer: 'François Ier',
    kind: 'personne',
    quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
    explain: 'François Ier protège les Arts et les Lettres à la Renaissance.',
  },
  {
    question: 'Quel roi est associé à l’édit de Nantes ?',
    answer: 'Henri IV',
    kind: 'personne',
    quote: 'Henri IV et l’édit de Nantes',
    explain: 'L’édit de Nantes est associé au roi Henri IV.',
  },
  {
    question: 'Quel roi est surnommé le « roi Soleil » ?',
    answer: 'Louis XIV',
    kind: 'personne',
    quote: 'Louis XIV, le roi Soleil à Versailles',
    explain: 'Louis XIV, le roi Soleil, règne à Versailles.',
  },
  {
    question: 'Qui est présenté comme le dernier roi de l’Ancien Régime ?',
    answer: 'Louis XVI',
    kind: 'personne',
    quote: 'on présente bien Louis XVI comme le dernier roi de l’Ancien Régime',
    explain: 'Louis XVI est le dernier roi de l’Ancien Régime.',
  },
  {
    question: 'Quelle année marque le début de la Révolution française ?',
    answer: '1789',
    kind: 'annee',
    quote: 'De l’année 1789 à l’exécution du roi : Louis XVI, la Révolution, la Nation',
    explain: 'La Révolution française commence avec l’année 1789.',
  },
  {
    question: 'Qui est général dans les armées républicaines puis devient empereur ?',
    answer: 'Napoléon Bonaparte',
    kind: 'personne',
    quote: 'Napoléon Bonaparte, du général à l’Empereur, de la Révolution à l’Empire',
    explain: 'Napoléon Bonaparte, général des armées républicaines, prend le pouvoir puis devient empereur.',
  },
];

const CM2: readonly Fact[] = [
  {
    question: 'En quelle année la République fête-t-elle ses cent ans ?',
    answer: '1892',
    kind: 'annee',
    quote: '1892 : la République fête ses cent ans',
    explain: 'En 1892, la République fête ses cent ans.',
  },
  {
    question: 'À partir des années 1880, l’école devient gratuite, laïque et… ?',
    answer: 'obligatoire',
    kind: 'notion',
    quote:
      'À partir des années 1880, l’adhésion à la République se construit en partie par l’école gratuite, laïque et obligatoire',
    explain: 'Au temps de Jules Ferry, l’école devient gratuite, laïque et obligatoire.',
  },
  {
    question: 'Les deux guerres mondiales ont lieu au cours de quel siècle ?',
    answer: 'XXe siècle',
    kind: 'siecle',
    quote: 'Deux guerres mondiales au vingtième siècle',
    explain: 'Les deux guerres mondiales ont lieu au XXe siècle (le vingtième siècle).',
  },
  {
    question: 'Quelles sont les énergies majeures de l’âge industriel ?',
    answer: 'le charbon puis le pétrole',
    kind: 'notion',
    quote: 'Les énergies majeures de l’âge industriel (charbon puis pétrole) et les machines',
    explain: 'L’âge industriel utilise d’abord le charbon, puis le pétrole.',
  },
];

const SIXIEME: readonly Fact[] = [
  {
    question: 'Dans quelle cité grecque naît la démocratie ?',
    answer: 'Athènes',
    kind: 'notion',
    quote: 'Dans quelles conditions la démocratie naît-elle à Athènes ?',
    explain: 'La démocratie naît à Athènes, une cité grecque.',
  },
  {
    question: 'Qui conquiert la Gaule ?',
    answer: 'César',
    kind: 'personne',
    quote: 'Lors de la première année du cycle 3 a été abordée la conquête de la Gaule par César',
    explain: 'La Gaule est conquise par César.',
  },
  {
    question: 'Depuis quel siècle existe un commerce régulier entre Rome et la Chine ?',
    answer: 'IIe siècle avant J.-C.',
    kind: 'siecle',
    quote: 'Un commerce régulier entre Rome et la Chine existe depuis le IIe siècle avant J.-C.',
    explain: 'Par la route de la soie, Rome et la Chine des Han commercent depuis le IIe siècle avant J.-C.',
  },
  {
    question: 'Dans quels territoires de l’Orient ancien étudie-t-on les premiers États et les premières écritures ?',
    answer: 'l’Égypte ou la Mésopotamie',
    kind: 'notion',
    quote:
      'L’étude des premiers États et des premières écritures se place dans le cadre de l’Orient ancien et peut concerner l’Égypte ou la Mésopotamie',
    explain: 'Les premiers États et les premières écritures : l’Orient ancien, l’Égypte ou la Mésopotamie.',
  },
];

/** Réponses du même type, tirées de tous les faits (dates entre elles, personnages entre eux…). */
const ALL = [...CM1, ...CM2, ...SIXIEME];

function skillOf(id: string, title: string, facts: readonly Fact[], classe: string): Skill {
  return {
    id,
    title,
    lesson: {
      memo: facts.slice(0, 3).map((f) => f.explain),
      source: `${PROG}, classe de ${classe}.`,
    },
    generate: (rng) => {
      const f = rng.pick(facts);
      const sameKind = ALL.filter((x) => x.kind === f.kind && x.answer !== f.answer).map((x) => x.answer);
      const wrong = rng.shuffle([...new Set(sameKind)]).slice(0, 3);
      const { answer, traps } = choice(
        rng,
        f.answer,
        wrong.map((w) => ({ label: w, why: `Ce n’est pas la bonne réponse : ${f.explain}` })),
      );
      return {
        prompt: f.question,
        answer,
        traps,
        hint: 'Pense à la frise : qui, quand, où ?',
        steps: [`Le programme dit : « ${f.quote} ».`, `Réponse : **${f.answer}**.`],
      };
    },
  };
}

const chapter = (id: string, grade: Chapter['grade'], title: string, skills: readonly Skill[]): Chapter => ({
  id,
  subject: 'histoire',
  grade,
  domain: 'reperes',
  title,
  skills,
});

export const HISTOIRE_CHAPTERS: readonly Chapter[] = [
  chapter('hcm1-reperes', 'cm1', 'Des Gaulois à Napoléon', [skillOf('hcm1-reperes', 'Repères de CM1', CM1, 'CM1')]),
  chapter('hcm1-avant-la-france', 'cm1', 'Et avant la France ?', AVANT_LA_FRANCE),
  chapter('hcm1-temps-des-rois', 'cm1', 'Le temps des rois', TEMPS_DES_ROIS),
  chapter('hcm1-revolution-empire', 'cm1', 'Révolution et Empire', REVOLUTION_EMPIRE),
  chapter('hcm1-se-reperer', 'cm1', 'Se repérer dans le temps', SE_REPERER),
  chapter('hcm2-reperes', 'cm2', 'La République et le XXe siècle', [
    skillOf('hcm2-reperes', 'Repères de CM2', CM2, 'CM2'),
  ]),
  chapter('hcm2-temps-republique', 'cm2', 'Le temps de la République', TEMPS_REPUBLIQUE),
  chapter('hcm2-age-industriel', 'cm2', 'L’âge industriel en France', AGE_INDUSTRIEL),
  chapter('hcm2-guerres-europe', 'cm2', 'Des guerres mondiales à l’Union européenne', GUERRES_EUROPE),
  chapter('hcm2-se-reperer', 'cm2', 'Se repérer dans le temps', SE_REPERER_CM2),
  chapter('h6-reperes', '6e', 'L’Antiquité', [skillOf('h6-reperes', 'Repères de 6e', SIXIEME, 'sixième')]),
  chapter('h6-humanite-migrations', '6e', 'L’humanité et ses migrations', HUMANITE),
  chapter('h6-recits-fondateurs', '6e', 'Récits fondateurs et citoyenneté', RECITS_FONDATEURS),
  chapter('h6-empire-romain', '6e', 'L’empire romain dans le monde antique', EMPIRE_ROMAIN),
  chapter('h6-se-reperer', '6e', 'Se repérer dans le temps', REPERES_6E),
];
