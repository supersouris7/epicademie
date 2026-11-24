import { check, normalizeText } from './check.ts';
import { eq, fmt, isDecimal, type Rational } from './rational.ts';
import type { Figure, Level, Question, Response, Trap } from './types.ts';

/**
 * Validation automatique des exercices (docs/adr/0014-fiabilite-pedagogique.md).
 *
 * Chaque question générée passe des contrôles de structure ET de cohérence : la réponse attendue,
 * saisie telle quelle, doit être jugée juste par la correction ; chaque erreur typique prévue doit
 * être jugée fausse (sinon la question se contredit) ; les formes équivalentes d'une même réponse
 * sont acceptées. Les variantes d'une même notion sont comparées entre elles : un même énoncé ne
 * doit jamais attendre deux réponses différentes.
 *
 * Ces contrôles ne remplacent pas la relecture pédagogique : une question peut être cohérente et
 * mal posée. Ils garantissent qu'aucun enfant ne reçoit une question cassée ou contradictoire.
 */

export interface ValidationIssue {
  readonly skillId: string;
  readonly level: Level;
  readonly seed: number;
  /** Code stable (tri, statistiques) et explication en français. */
  readonly code: string;
  readonly message: string;
}

/** Texte qui trahit un bug de génération (valeur manquante, objet affiché tel quel). */
const BROKEN_TEXT = /\b(undefined|NaN|null|Infinity)\b|\[object /;
/** Bornes des nombres attendus (au-delà : erreur de génération probable). */
const MAX_MAGNITUDE = 1e9;

type Check = (code: string, message: string) => void;

/** Textes montrés à l'élève par la réponse elle-même (propositions, éléments, colonnes, segments). */
function answerTexts(a: Question['answer']): readonly string[] {
  switch (a.kind) {
    case 'choice':
      return a.options;
    case 'order':
      return a.items;
    case 'match':
      return [...a.left, ...a.right];
    case 'cloze':
      return [...a.parts, ...a.blanks.flatMap((b) => (b.mode === 'list' ? b.options : []))];
    default:
      return [];
  }
}

function textChecks(q: Question, fail: Check): void {
  const texts = [q.prompt, q.hint, ...q.steps, ...answerTexts(q.answer)];
  if (!q.prompt.trim()) fail('enonce-vide', 'Énoncé vide');
  if (!q.hint.trim()) fail('indice-vide', 'Indice vide');
  if (q.steps.length === 0 || q.steps.some((s) => !s.trim())) fail('correction-vide', 'Correction absente ou vide');
  for (const t of texts) {
    if (BROKEN_TEXT.test(t)) fail('texte-casse', `Texte cassé : « ${t.slice(0, 80)} »`);
  }
  if (q.targetSeconds <= 0 || q.targetSeconds > 600) fail('duree', `Durée cible hors bornes : ${q.targetSeconds} s`);
}

const validRational = (r: Rational) => Number.isSafeInteger(r.n) && Number.isSafeInteger(r.d) && r.d !== 0;

/** Réponses justes à saisir (forme attendue, et formes équivalentes qui doivent aussi passer). */
function rightResponses(q: Question): Response[] {
  const a = q.answer;
  switch (a.kind) {
    case 'number': {
      if (!isDecimal(a.value)) return [];
      const text = fmt(a.value);
      // Écritures équivalentes : point décimal, espaces de milliers retirés.
      return [
        { kind: 'number', text },
        { kind: 'number', text: text.replace(',', '.').replace(/\s/g, '') },
      ];
    }
    case 'fraction':
      return [
        { kind: 'fraction', num: String(a.value.n), den: String(a.value.d) },
        // Fraction non simplifiée : égale, donc juste.
        { kind: 'fraction', num: String(a.value.n * 2), den: String(a.value.d * 2) },
      ];
    case 'choice':
      return [{ kind: 'choice', index: a.correct }];
    case 'point':
      return [{ kind: 'point', x: a.x, y: a.y }];
    case 'text':
      return a.accepted.map((text) => ({ kind: 'text', text: ` ${text.toUpperCase()} ` }));
    case 'order':
      return [{ kind: 'order', order: [...a.correct] }];
    case 'match':
      return [{ kind: 'match', pairs: [...a.pairs] }];
    case 'cloze':
      return [
        {
          kind: 'cloze',
          answers: a.blanks.map((b) => (b.mode === 'list' ? (b.options[b.correct] ?? '') : (b.accepted[0] ?? ''))),
        },
        // Majuscules et espaces superflus : toujours acceptés.
        {
          kind: 'cloze',
          answers: a.blanks.map(
            (b) => ` ${(b.mode === 'list' ? (b.options[b.correct] ?? '') : (b.accepted[0] ?? '')).toUpperCase()} `,
          ),
        },
      ];
  }
}

/** Contrôles des réponses numériques ; faux si la valeur est invalide (rien d'autre à vérifier). */
function numericChecks(q: Question, fail: Check): boolean {
  const a = q.answer;
  if (a.kind !== 'number' && a.kind !== 'fraction') return true;
  if (!validRational(a.value)) {
    fail('nombre-invalide', 'Réponse numérique invalide');
    return false;
  }
  if (Math.abs(a.value.n / a.value.d) > MAX_MAGNITUDE) fail('nombre-borne', 'Réponse numérique démesurée');
  if (a.kind !== 'number') return true;
  if (!isDecimal(a.value) && a.round === undefined) {
    fail('decimal-infini', `Réponse impossible à saisir en décimal : ${a.value.n}/${a.value.d}`);
  }
  if (a.unit !== undefined && a.unit.trim() !== a.unit) fail('unite', 'Unité mal formée');
  return true;
}

function choiceChecks(q: Question, fail: Check): void {
  const a = q.answer;
  if (a.kind !== 'choice') return;
  if (a.options.length < 2) fail('qcm-options', 'QCM avec moins de 2 propositions');
  if (a.correct < 0 || a.correct >= a.options.length) fail('qcm-correct', 'Bonne réponse hors des propositions');
  const normalized = a.options.map((o) => normalizeText(o));
  if (new Set(normalized).size !== normalized.length)
    fail('qcm-doublon', `Propositions en double : ${a.options.join(' | ')}`);
  if (normalized.some((o) => o === '')) fail('qcm-vide', 'Proposition vide');
}

const MIN_ITEMS = 3;
const MAX_ITEMS = 6;

const isPermutation = (p: readonly number[], n: number) =>
  p.length === n && new Set(p).size === n && p.every((i) => Number.isInteger(i) && i >= 0 && i < n);

/** Toutes les permutations de 0..n-1 (n ≤ 6 : 720 au plus). */
function permutations(n: number): number[][] {
  const out: number[][] = [];
  const walk = (cur: number[], rest: number[]) => {
    if (rest.length === 0) out.push(cur);
    for (const [k, x] of rest.entries()) walk([...cur, x], [...rest.slice(0, k), ...rest.slice(k + 1)]);
  };
  walk(
    [],
    Array.from({ length: n }, (_, i) => i),
  );
  return out;
}

/** Éléments sans doublon ni vide, sinon plusieurs ordres ou associations seraient justes. */
function distinctItems(items: readonly string[], what: string, fail: Check): void {
  const normalized = items.map((i) => normalizeText(i));
  if (normalized.some((i) => i === '')) fail('element-vide', `${what} : élément vide`);
  if (new Set(normalized).size !== normalized.length) fail('element-doublon', `${what} : éléments en double`);
}

/** Ordre : 3 à 6 éléments distincts, un seul ordre juste, jamais présenté déjà rangé. */
function orderChecks(a: Extract<Question['answer'], { kind: 'order' }>, q: Question, fail: Check): void {
  const n = a.items.length;
  if (n < MIN_ITEMS || n > MAX_ITEMS) fail('ordre-taille', `Ordre : ${n} éléments (3 à 6 attendus)`);
  if (!isPermutation(a.correct, n)) {
    fail('ordre-permutation', 'Ordre : la solution n’est pas une permutation');
    return;
  }
  distinctItems(a.items, 'Ordre', fail);
  if (a.correct.every((c, i) => c === i)) fail('ordre-deja-range', 'Ordre : les éléments sont présentés déjà rangés');
  if (n > MAX_ITEMS) return;
  // Un seul ordre juste : toute autre permutation est jugée fausse.
  const right = permutations(n).filter((p) => check(q, { kind: 'order', order: p }).correct);
  if (right.length !== 1) fail('ordre-non-unique', `Ordre : ${right.length} ordres jugés justes (1 attendu)`);
}

/** Association : 3 à 6 paires, colonnes distinctes, une seule solution. */
function matchChecks(a: Extract<Question['answer'], { kind: 'match' }>, q: Question, fail: Check): void {
  const n = a.left.length;
  if (n < MIN_ITEMS || n > MAX_ITEMS) fail('paires-taille', `Association : ${n} paires (3 à 6 attendues)`);
  if (a.right.length !== n) {
    fail('paires-colonnes', 'Association : colonnes de tailles différentes');
    return;
  }
  if (!isPermutation(a.pairs, n)) {
    fail('paires-permutation', 'Association : la solution n’est pas une bijection');
    return;
  }
  distinctItems(a.left, 'Association (gauche)', fail);
  distinctItems(a.right, 'Association (droite)', fail);
  if (a.pairs.every((c, i) => c === i))
    fail('paires-deja-rangees', 'Association : colonnes déjà en face l’une de l’autre');
  if (n > MAX_ITEMS) return;
  const right = permutations(n).filter((p) => check(q, { kind: 'match', pairs: p }).correct);
  if (right.length !== 1)
    fail('paires-non-unique', `Association : ${right.length} solutions jugées justes (1 attendue)`);
}

/** Texte à trous : segments et trous cohérents ; liste valide ; saisie courte avec au moins une variante. */
function clozeChecks(a: Extract<Question['answer'], { kind: 'cloze' }>, fail: Check): void {
  if (a.blanks.length === 0) fail('trou-aucun', 'Texte à trous sans trou');
  if (a.parts.length !== a.blanks.length + 1) fail('trou-segments', 'Texte à trous : segments et trous incohérents');
  for (const b of a.blanks) {
    if (b.mode === 'text') {
      if (b.accepted.length === 0 || b.accepted.some((t) => !t.trim()))
        fail('trou-attendu', 'Trou sans réponse acceptée');
      continue;
    }
    if (b.options.length < 2) fail('trou-options', 'Trou en liste avec moins de 2 propositions');
    if (b.correct < 0 || b.correct >= b.options.length) fail('trou-correct', 'Bonne proposition hors de la liste');
    distinctItems(b.options, 'Trou en liste', fail);
  }
}

function answerChecks(q: Question, fail: Check): void {
  const a = q.answer;
  if (!numericChecks(q, fail)) return;
  choiceChecks(q, fail);
  if (a.kind === 'order') orderChecks(a, q, fail);
  if (a.kind === 'match') matchChecks(a, q, fail);
  if (a.kind === 'cloze') clozeChecks(a, fail);
  if (a.kind === 'point' && (!Number.isInteger(a.x) || !Number.isInteger(a.y))) fail('point', 'Point hors des nœuds');
  if (a.kind === 'text' && (a.accepted.length === 0 || a.accepted.some((t) => !t.trim()))) {
    fail('texte-attendu', 'Aucune réponse écrite acceptée');
  }
  for (const r of rightResponses(q)) {
    if (!check(q, r).correct) fail('reponse-refusee', `La bonne réponse ${JSON.stringify(r)} est jugée fausse`);
  }
}

/** Réponses justes de la question (attendue et acceptées), pour comparer aux erreurs typiques. */
const isRightValue = (a: Question['answer'], v: Rational) =>
  (a.kind === 'number' || a.kind === 'fraction') &&
  (eq(v, a.value) || (a.kind === 'number' && (a.accept ?? []).some((x) => eq(x, v))));

/** Saisie correspondant à une erreur typique, et problème de cohérence éventuel. */
function trapResponse(a: Question['answer'], t: Trap): { response: Response | null; problem?: [string, string] } {
  if ('value' in t) {
    if (!validRational(t.value)) return { response: null, problem: ['piege-invalide', 'Erreur typique invalide'] };
    const problem: [string, string] | undefined = isRightValue(a, t.value)
      ? ['piege-juste', 'Une erreur typique est égale à la bonne réponse']
      : undefined;
    if (a.kind === 'number' && isDecimal(t.value)) return { response: { kind: 'number', text: fmt(t.value) }, problem };
    if (a.kind === 'fraction')
      return { response: { kind: 'fraction', num: String(t.value.n), den: String(t.value.d) }, problem };
    return { response: null, problem };
  }
  if ('option' in t) {
    const bad = a.kind !== 'choice' || t.option < 0 || t.option >= a.options.length || t.option === a.correct;
    return {
      response: { kind: 'choice', index: t.option },
      problem: bad ? ['piege-option', `Erreur typique sur une proposition invalide (${t.option})`] : undefined,
    };
  }
  if ('point' in t) {
    const same = a.kind === 'point' && t.point.x === a.x && t.point.y === a.y;
    return {
      response: { kind: 'point', ...t.point },
      problem: same ? ['piege-juste', 'Erreur typique = bon point'] : undefined,
    };
  }
  const accepted = a.kind === 'text' && a.accepted.some((x) => normalizeText(x) === normalizeText(t.text));
  return {
    response: { kind: 'text', text: t.text },
    problem: accepted ? ['piege-juste', 'Erreur typique acceptée comme juste'] : undefined,
  };
}

/** Erreurs typiques : jamais la bonne réponse, et toujours jugées fausses. */
function trapChecks(q: Question, fail: Check): void {
  for (const t of q.traps) {
    if (!t.why.trim()) fail('piege-sans-explication', 'Erreur typique sans explication');
    const { response, problem } = trapResponse(q.answer, t);
    if (problem) fail(...problem);
    if (response && check(q, response).correct) {
      fail('piege-accepte', `Une erreur typique est jugée juste : ${JSON.stringify(response)}`);
    }
  }
}

const finite = (...values: number[]) => values.every(Number.isFinite);

function figureChecks(f: Figure | undefined, q: Question, fail: Check): void {
  if (!f) return;
  switch (f.kind) {
    case 'grid': {
      if (!(f.xMin < f.xMax && f.yMin < f.yMax)) fail('figure', 'Quadrillage aux bornes inversées');
      const inside = (x: number, y: number) => x >= f.xMin && x <= f.xMax && y >= f.yMin && y <= f.yMax;
      if (f.points.some((p) => !inside(p.x, p.y))) fail('figure', 'Point hors du quadrillage');
      if (q.answer.kind === 'point' && !inside(q.answer.x, q.answer.y))
        fail('figure', 'Bonne réponse hors du quadrillage');
      return;
    }
    case 'numberLine':
      if (!(f.min < f.max) || f.points.some((p) => p.at < f.min || p.at > f.max))
        fail('figure', 'Droite graduée incohérente');
      return;
    case 'polygon':
      if (f.vertices.length < 3 || !f.vertices.every((v) => finite(v.x, v.y))) fail('figure', 'Polygone invalide');
      return;
    case 'bars':
      if (f.bars.length === 0 || !f.bars.every((b) => finite(b.value))) fail('figure', 'Diagramme en barres invalide');
      return;
    case 'chart':
      if (f.points.length === 0 || !f.points.every((p) => finite(p.x, p.y))) fail('figure', 'Graphique invalide');
      return;
    case 'table':
      if (f.rows.length === 0) fail('figure', 'Tableau vide');
      return;
    case 'document':
      if (f.lines.length === 0 || f.lines.some((l) => !l.trim())) fail('figure', 'Document vide ou à ligne vide');
      return;
    default:
      return;
  }
}

/** Audio : texte et langue valides, texte écouté absent de l'énoncé (question d'écoute). */
function audioChecks(q: Question, fail: Check): void {
  const a = q.audio;
  if (!a) return;
  if (!a.text.trim()) fail('audio', 'Audio sans texte');
  if (!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(a.lang)) fail('audio', `Langue d'audio invalide : ${a.lang}`);
  if (a.text.trim() && normalizeText(q.prompt).includes(normalizeText(a.text)))
    fail('audio', 'Le texte à écouter apparaît dans l’énoncé');
}

/** Contrôles d'une question générée. */
export function validateQuestion(q: Question): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail: Check = (code, message) =>
    issues.push({ skillId: q.skillId, level: q.level, seed: q.seed, code, message });
  textChecks(q, fail);
  answerChecks(q, fail);
  trapChecks(q, fail);
  figureChecks(q.figure, q, fail);
  audioChecks(q, fail);
  return issues;
}

/** Clé de la bonne réponse (pour repérer un même énoncé qui attendrait deux réponses). */
function answerKey(q: Question): string {
  const a = q.answer;
  switch (a.kind) {
    case 'number':
    case 'fraction':
      return `${a.kind}:${a.value.n}/${a.value.d}`;
    case 'choice':
      return `choice:${normalizeText(a.options[a.correct] ?? '')}`;
    case 'point':
      return `point:${a.x},${a.y}`;
    case 'text':
      return `text:${a.accepted.map(normalizeText).sort().join('|')}`;
    case 'order':
      return `order:${a.correct.map((i) => normalizeText(a.items[i] ?? '')).join('|')}`;
    case 'match':
      return `match:${a.left
        .map((l, i) => `${normalizeText(l)}=${normalizeText(a.right[a.pairs[i] ?? 0] ?? '')}`)
        .sort()
        .join('|')}`;
    case 'cloze':
      return `cloze:${a.blanks
        .map((b) =>
          b.mode === 'list'
            ? normalizeText(b.options[b.correct] ?? '')
            : b.accepted.map(normalizeText).sort().join('/'),
        )
        .join('|')}`;
  }
}

/**
 * Contrôles de variantes : chaque question, puis la cohérence entre variantes (un même énoncé,
 * même figure, doit toujours attendre la même réponse).
 */
export function validateVariants(questions: readonly Question[]): ValidationIssue[] {
  const issues = questions.flatMap(validateQuestion);
  const seen = new Map<string, { key: string; q: Question }>();
  for (const q of questions) {
    // Un QCM au même texte mais aux propositions différentes est une autre question.
    const options = q.answer.kind === 'choice' ? q.answer.options.map(normalizeText).sort().join('|') : '';
    const statement = `${q.level}|${q.prompt}|${JSON.stringify(q.figure ?? null)}|${options}`;
    const key = answerKey(q);
    const before = seen.get(statement);
    if (before && before.key !== key) {
      issues.push({
        skillId: q.skillId,
        level: q.level,
        seed: q.seed,
        code: 'enonce-contradictoire',
        message: `Même énoncé que la graine ${before.q.seed}, mais autre réponse attendue (« ${q.prompt.slice(0, 80)} »)`,
      });
    }
    seen.set(statement, { key, q });
  }
  return issues;
}
