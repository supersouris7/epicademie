import type { Grade } from '@epicademie/shared';
import { allSkillEntries } from './catalog.ts';
import { createRng } from './rng.ts';
import { SUBJECT_GLOSSARIES } from './glossaires.ts';
import { skillLevels, type Chapter, type Level, type QuestionDraft, type Skill, type SubjectTerm } from './types.ts';

/**
 * Détecteur sans IA des explications et des questions à reprendre (docs/contenus/README.md §1 et §3).
 * Il ne juge pas le fond : il compte des indices mesurables (longueur, étapes, consigne, mots difficiles,
 * variété) pour classer les notions à réécrire en priorité. Mode avertissement : rien n'est bloqué,
 * sauf pour les notions déjà reprises (voir lisibilite.test.ts).
 */
export const READABILITY_CODES = {
  'etapes-nombre': 'explication hors du format 3 ou 4 bulles',
  'bulle-chargee': 'plus d’une idée dans une bulle (trop de phrases ou de mots)',
  'bulle-sans-action': 'bulle qui ne dit pas quoi faire',
  'phrase-longue': 'phrase trop longue pour l’âge (explication, indice, mémo)',
  'memo-long': 'mémo de plus de 3 phrases',
  'mot-non-defini': 'mot difficile absent du glossaire',
  'consigne-sans-verbe': 'consigne sans verbe d’action ni question',
  'enonce-long': 'énoncé trop long pour l’âge',
  'distracteur-double': 'deux propositions identiques',
  'peu-de-variantes': 'moins de 6 questions différentes à un niveau',
} as const;
export type ReadabilityCode = keyof typeof READABILITY_CODES;

type AnyGrade = Grade | 'ce2';

/** Limites en nombre de mots (les nombres et les calculs ne comptent pas). */
interface Limits {
  readonly sentence: number;
  readonly bubble: number;
  readonly prompt: number;
}

// « ≈ 12 mots » en CM : 2 mots de tolérance ; la limite monte avec l'âge.
const CM: Limits = { sentence: 14, bubble: 30, prompt: 40 };
const COLLEGE: Limits = { sentence: 18, bubble: 40, prompt: 55 };
const LIMITS: Readonly<Record<AnyGrade, Limits>> = {
  ce2: CM,
  cm1: CM,
  cm2: CM,
  '6e': { sentence: 16, bubble: 35, prompt: 45 },
  '5e': COLLEGE,
  '4e': COLLEGE,
  '3e': { sentence: 20, bubble: 45, prompt: 65 },
  adulte: { sentence: 20, bubble: 45, prompt: 65 },
};

const MIN_VARIANTS = 6;
/** Graines examinées par niveau (déterministe : le rapport ne change que si les contenus changent). */
const SEEDS = 30;

/** Verbes à l'impératif qui disent à l'enfant quoi faire. */
const ACTIONS = [
  'additionne ajoute applique arrondis associe avance calcule cherche choisis classe colorie compare complète compte',
  'conclus conjugue convertis copie coupe coche décompose décris déduis demande-toi dessine devine divise donne',
  'écoute écris efface élimine encadre enlève entoure essaie examine fais garde glisse identifie imagine indique',
  'justifie lis mesure mets monte multiplie nomme note observe oublie ordonne partage pars passe pense place pose',
  'prends rappelle-toi range recopie recule regarde regroupe relève relie relis remarque remets remplace repère',
  'réponds retiens retrouve reviens sépare simplifie souligne souviens-toi soustrais suis termine touche trace',
  'traduis transforme trie trouve utilise vérifie vois descends distingue détermine exprime effectue résous',
  'construis reproduis commence continue écarte',
]
  .join(' ')
  .split(' ');

const WORD = String.raw`(?<![\p{L}-])(?:${ACTIONS.join('|')})(?![\p{L}])`;
/** Un verbe d'action en tête de proposition (début, ponctuation, ou après « puis », « alors »…). */
const ACTION = new RegExp(
  String.raw`(?:^|[.!?…:;,(«»]\s*|(?<![\p{L}])(?:puis|et|ensuite|alors|donc|d’abord|enfin)\s+)\**${WORD}`,
  'iu',
);

/** Mots difficiles : chacun doit avoir sa définition dans le glossaire de la matière quand on l'emploie. */
const DIFFICULT: Readonly<Record<string, readonly string[]>> = {
  maths: [
    'abscisse',
    'arrondi',
    'contenance',
    'dénominateur',
    'dividende',
    'diviseur',
    'numérateur',
    'ordre de grandeur',
    'périmètre',
    'quotient',
    'graduation',
    'valeur absolue',
  ],
  sciences: [
    'cohésion',
    'condensation',
    'dissolution',
    'ébullition',
    'évaporation',
    'fusion',
    'liquéfaction',
    'molécule',
    'solidification',
    'sublimation',
    'vaporisation',
  ],
};

/** Texte sans balisage : gras retiré, fractions et exposants remplacés par un symbole sans lettre. */
const plain = (text: string) =>
  text
    .replace(/\*\*/g, '')
    .replace(/\{[^{}]*\}/g, '#')
    .replace(/\^\d/g, '');

/** Mots d'un texte : seuls les groupes contenant une lettre comptent. */
export const wordCount = (text: string): number =>
  plain(text)
    .split(/[\s’']+/)
    .filter((w) => /\p{L}{2,}|^[aày]$/iu.test(w)).length;

/** Phrases (point, point d'exclamation ou d'interrogation, deux-points et point-virgule font une pause). */
export const sentences = (text: string, pauses = /(?<=[.!?…])\s+|\s*[:;→]\s+/): string[] =>
  plain(text)
    .split(pauses)
    .filter((s) => wordCount(s) > 0);

const FULL_STOPS = /(?<=[.!?…])\s+/;

export const saysWhatToDo = (bubble: string): boolean => ACTION.test(bubble.replace(/'/g, '’'));

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mentions = (text: string, term: string) =>
  new RegExp(String.raw`(?<![\p{L}])${escape(term)}s?(?![\p{L}])`, 'iu').test(text);

/** Mots difficiles employés dans les textes et absents du glossaire. */
export function undefinedWords(
  texts: readonly string[],
  subject: string,
  glossary: readonly SubjectTerm[] = SUBJECT_GLOSSARIES[subject] ?? [],
): string[] {
  const known = new Set(glossary.flatMap((g) => [g.word, ...g.forms]).map((w) => w.toLowerCase()));
  const all = texts.map(plain).join(' \n ');
  return (DIFFICULT[subject] ?? []).filter((term) => !known.has(term) && mentions(all, term));
}

/** Indices relevés sur une question (explication, indice, énoncé, propositions). */
export function questionIssues(q: QuestionDraft, grade: AnyGrade): ReadabilityCode[] {
  const max = LIMITS[grade];
  const out = new Set<ReadabilityCode>();
  if (q.steps.length < 3 || q.steps.length > 4) out.add('etapes-nombre');
  for (const bubble of q.steps) {
    if (sentences(bubble, FULL_STOPS).length > 2 || wordCount(bubble) > max.bubble) out.add('bulle-chargee');
    if (!saysWhatToDo(bubble)) out.add('bulle-sans-action');
  }
  if ([q.hint, ...q.steps].some((t) => sentences(t).some((s) => wordCount(s) > max.sentence))) {
    out.add('phrase-longue');
  }
  if (!q.prompt.includes('?') && !saysWhatToDo(q.prompt)) out.add('consigne-sans-verbe');
  if (wordCount(q.prompt) > max.prompt) out.add('enonce-long');
  if (q.answer.kind === 'choice') {
    const options = q.answer.options.map((o) => o.replace(/\s+/g, ' ').trim());
    if (new Set(options).size !== options.length) out.add('distracteur-double');
  }
  return [...out];
}

/** Indices relevés sur le mémo de la notion. */
export function memoIssues(skill: Skill, grade: AnyGrade): ReadabilityCode[] {
  const all = skill.lesson.memo.flatMap((m) => sentences(m, FULL_STOPS));
  const out: ReadabilityCode[] = all.length > 3 ? ['memo-long'] : [];
  const long = skill.lesson.memo.some((m) => sentences(m).some((s) => wordCount(s) > LIMITS[grade].sentence));
  return long ? [...out, 'phrase-longue'] : out;
}

export interface ReadabilityReport {
  readonly subject: string;
  readonly grade: AnyGrade;
  readonly chapterId: string;
  readonly skillId: string;
  readonly boss: boolean;
  /** Nombre de questions examinées touchées par chaque indice (1 pour un indice sur le mémo). */
  readonly counts: Partial<Record<ReadabilityCode, number>>;
  readonly words: readonly string[];
  /** Part des contrôles en défaut : sert à trier les notions les plus à reprendre. */
  readonly score: number;
}

/** Examine une notion à tous ses niveaux. */
export function analyzeSkill(skill: Skill, chapter: Pick<Chapter, 'id' | 'subject' | 'grade'>, boss = false) {
  const counts: Partial<Record<ReadabilityCode, number>> = {};
  const add = (code: ReadabilityCode) => {
    counts[code] = (counts[code] ?? 0) + 1;
  };
  const texts: string[] = [...skill.lesson.memo];
  let total = 0;
  for (let level = 1; level <= skillLevels(skill); level++) {
    const variants = new Set<string>();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const q = skill.generate(createRng(seed * 7919), level as Level);
      total++;
      variants.add(JSON.stringify([q.prompt, q.figure, q.audio, q.answer]));
      texts.push(q.hint, ...q.steps);
      questionIssues(q, chapter.grade).forEach(add);
    }
    if (variants.size < MIN_VARIANTS) add('peu-de-variantes');
  }
  memoIssues(skill, chapter.grade).forEach(add);
  const words = undefinedWords(texts, chapter.subject);
  if (words.length > 0) counts['mot-non-defini'] = words.length;
  // Chaque indice pèse au plus 1 : la part des questions touchées.
  const score = Object.values(counts).reduce((sum, n) => sum + Math.min(1, n / total), 0);
  return {
    subject: chapter.subject,
    grade: chapter.grade,
    chapterId: chapter.id,
    skillId: skill.id,
    boss,
    counts,
    words,
    score: Math.round(score * 100) / 100,
  } satisfies ReadabilityReport;
}

const GRADE_ORDER: readonly AnyGrade[] = ['ce2', 'cm1', 'cm2', '6e', '5e', '4e', '3e', 'adulte'];

/** Notions signalées du catalogue, triées par matière, classe, puis de la plus à reprendre à la moins. */
export function analyzeCatalog(): ReadabilityReport[] {
  return allSkillEntries()
    .map(({ skill, chapter, boss }) => analyzeSkill(skill, chapter, boss))
    .filter((r) => Object.keys(r.counts).length > 0)
    .sort(
      (a, b) =>
        a.subject.localeCompare(b.subject) ||
        GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade) ||
        b.score - a.score ||
        a.skillId.localeCompare(b.skillId),
    );
}

/** Rapport tabulé (une notion par ligne) pour découper la reprise en lots. */
export function toTsv(reports: readonly ReadabilityReport[]): string {
  const header = ['matiere', 'classe', 'chapitre', 'notion', 'type', 'score', 'indices', 'mots_non_definis'];
  const rows = reports.map((r) => [
    r.subject,
    r.grade,
    r.chapterId,
    r.skillId,
    r.boss ? 'boss' : 'entrainement',
    r.score.toFixed(2),
    Object.entries(r.counts)
      .map(([code, n]) => `${code}=${n}`)
      .join(', '),
    r.words.join(', '),
  ]);
  return [header, ...rows].map((row) => row.join('\t')).join('\n') + '\n';
}
