import type { Chapter, Demo, QuestionDraft } from './types.ts';

/**
 * Schéma d'explication ajouté automatiquement quand le générateur n'en fournit pas (retour
 * terrain du 20/11/2026 : « pas assez de schémas dans les explications ») :
 * - division (quotient, reste, divisible…) → la division posée et étiquetée, avec le partage ;
 * - aire, volume, périmètre → le lien cm / cm² / cm³ ;
 * - rangs d'un nombre décimal (dixièmes, centièmes…) → le tableau des rangs.
 * Un schéma n'est ajouté que si les nombres sont lisibles dans l'énoncé ; sinon, rien.
 */
export function autoDemo(draft: QuestionDraft, chapter: Chapter): Demo | undefined {
  const text = `${draft.prompt} ${draft.steps.join(' ')}`.toLowerCase();
  return (
    divisionDemo(draft.prompt, text) ??
    unitsDemo(text, chapter) ??
    placeValueDemo(draft.prompt, text) ??
    fractionDemo(draft.prompt, chapter) ??
    numberLineDemo(draft.prompt, chapter)
  );
}

const N = '(\\d[\\d\u202f ]*?)';
/** Énoncés de division reconnus : « 59 ÷ 7 », « 59 par 7 », « divisible par », « multiple de », « partage … entre ». */
const DIVISION_PATTERNS: readonly RegExp[] = [
  new RegExp(`(?<![\\d,])${N}\\s*(?:÷|:|divisé par|par)\\s*(\\d+)(?!\\d|,\\d)`),
  new RegExp(`(?<![\\d,])${N}\\s+(?:est|n’est pas)(?:-il)?\\s+(?:divisible par|un multiple de)\\s+(\\d+)(?!\\d|,\\d)`),
  new RegExp(`partage\\s+${N}\\s+\\D{1,30}?\\s+entre\\s+(\\d+)(?!\\d|,\\d)`),
];

const DIVISION_WORDS_ALL = /quotient|reste|divisi|diviseur|dividende|euclidien|multiple|partage/;

function divisionDemo(prompt: string, text: string): Demo | undefined {
  if (!DIVISION_WORDS_ALL.test(text)) return undefined;
  for (const re of DIVISION_PATTERNS) {
    const m = re.exec(prompt);
    if (!m) continue;
    const dividend = Number((m[1] ?? '').replace(/[\s\u202f]/g, ''));
    const divisor = Number(m[2]);
    if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || divisor < 2 || divisor > 99) continue;
    if (dividend < divisor || dividend > 9999) continue;
    return { kind: 'division', dividend, divisor };
  }
  return undefined;
}

function unitsDemo(text: string, chapter: Chapter): Demo | undefined {
  if (chapter.subject !== 'maths') return undefined;
  if (/volume|\^3|³|contenance/.test(text)) return { kind: 'unites', focus: 'volume' };
  if (/\baire|\^2|²/.test(text)) return { kind: 'unites', focus: 'aire' };
  if (text.includes('périmètre')) return { kind: 'unites', focus: 'longueur' };
  return undefined;
}

const PLACE_WORDS = /dixième|centième|millième|partie entière|partie décimale|décimale|chiffre des/;

function placeValueDemo(prompt: string, text: string): Demo | undefined {
  if (!PLACE_WORDS.test(text)) return undefined;
  const m = /(\d{1,4}),(\d{1,3})(?!\d)/.exec(prompt);
  if (!m) return undefined;
  return { kind: 'rangs', value: `${m[1]},${m[2]}` };
}

/** Fractions de l'énoncé ({3/4}, au plus 3), dessinées en parts (dénominateur jusqu'à 12, au plus une unité). */
function fractionDemo(prompt: string, chapter: Chapter): Demo | undefined {
  if (!chapter.id.includes('fraction')) return undefined;
  const parts = [...prompt.matchAll(/\{(\d+)\/(\d+)\}/g)]
    .map((m) => ({ num: Number(m[1]), den: Number(m[2]) }))
    .filter((f) => f.den >= 2 && f.den <= 12 && f.num >= 1 && f.num <= f.den);
  if (parts.length === 0 || parts.length > 3) return undefined;
  return { kind: 'fraction', parts };
}

/** Nombres relatifs de l'énoncé, sur une droite graduée (chapitres des relatifs, entiers de −20 à 20). */
function numberLineDemo(prompt: string, chapter: Chapter): Demo | undefined {
  if (!chapter.id.includes('relatif')) return undefined;
  const values = [...prompt.matchAll(/(?<![\d,])([−-]?\d+)(?![\d,])/g)].map((m) =>
    Number((m[1] ?? '').replace('−', '-')),
  );
  const usable = [...new Set(values)].filter((v) => Number.isInteger(v) && Math.abs(v) <= 20);
  if (usable.length < 1 || usable.length > 4 || !usable.some((v) => v < 0)) return undefined;
  return { kind: 'droite', values: usable };
}
