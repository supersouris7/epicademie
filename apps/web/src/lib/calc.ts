/**
 * Évaluateur de la calculatrice : nombres décimaux (virgule ou point), π, + − × ÷, parenthèses,
 * carré (²), puissance (^), racine carrée (√), cos, sin, tan et leurs réciproques (cos⁻¹…), en degrés
 * comme au collège. Multiplication implicite devant π, une parenthèse ou une fonction : « 2π »,
 * « 3(4+1) », « 2√(9) ». Analyse descendante récursive — aucune évaluation de code arbitraire.
 */
export class CalcError extends Error {}

const DEG = Math.PI / 180;
const fixed = (v: number) => Number(v.toPrecision(12));

/** Fonctions, telles qu'écrites dans l'affichage (parenthèse ouvrante comprise). */
export const CALC_FUNCTIONS: Record<string, (x: number) => number> = {
  '√(': (x) => {
    if (x < 0) throw new CalcError('Pas de racine d’un nombre négatif');
    return Math.sqrt(x);
  },
  'cos⁻¹(': (x) => inverse(Math.acos, x),
  'sin⁻¹(': (x) => inverse(Math.asin, x),
  'tan⁻¹(': (x) => Math.atan(x) / DEG,
  'cos(': (x) => Math.cos(x * DEG),
  'sin(': (x) => Math.sin(x * DEG),
  'tan(': (x) => {
    if (Math.abs(fixed((((x % 180) + 180) % 180) - 90)) === 0) throw new CalcError('tan(90°) n’existe pas');
    return Math.tan(x * DEG);
  },
};

function inverse(f: (x: number) => number, x: number) {
  const v = fixed(x);
  if (v < -1 || v > 1) throw new CalcError('Le nombre doit être entre −1 et 1');
  return f(v) / DEG;
}

const NAMES = Object.keys(CALC_FUNCTIONS);

export function evaluate(input: string): number {
  const src = input.replace(/\s/g, '').replace(/−/g, '-').replace(/,/g, '.');
  let i = 0;
  const peek = () => src[i];
  const fnAt = () => {
    const name = NAMES.find((n) => src.startsWith(n, i));
    return name ? { name, f: CALC_FUNCTIONS[name] as (x: number) => number } : undefined;
  };
  /** Un facteur commence ici sans opérateur : multiplication implicite. */
  const implicit = () => peek() === 'π' || peek() === '(' || fnAt() !== undefined;

  const expr = (): number => {
    let v = term();
    while (peek() === '+' || peek() === '-') v = src[i++] === '+' ? v + term() : v - term();
    return v;
  };
  const term = (): number => {
    let v = unary();
    for (;;) {
      const op = peek();
      if (op === '×' || op === '*') {
        i++;
        v *= unary();
      } else if (op === '÷' || op === '/') {
        i++;
        const d = unary();
        if (d === 0) throw new CalcError('Division par zéro');
        v /= d;
      } else if (implicit()) v *= power();
      else return v;
    }
  };
  const unary = (): number => {
    if (peek() === '-') {
      i++;
      return -unary();
    }
    return power();
  };
  // Puissance à droite : 2^3^2 = 2^9 ; −2^2 = −4.
  const power = (): number => {
    const base = postfix();
    if (peek() !== '^') return base;
    i++;
    const v = base ** unary();
    if (!Number.isFinite(v)) throw new CalcError('Nombre trop grand');
    return v;
  };
  const postfix = (): number => {
    let v = primary();
    while (peek() === '²') {
      i++;
      v *= v;
    }
    return v;
  };
  const closing = () => {
    if (peek() !== ')') throw new CalcError('Parenthèse manquante');
    i++;
  };
  const primary = (): number => {
    const fn = fnAt();
    if (fn) {
      i += fn.name.length;
      const v = expr();
      closing();
      return fn.f(v);
    }
    if (peek() === '(') {
      i++;
      const v = expr();
      closing();
      return v;
    }
    if (peek() === 'π') {
      i++;
      return Math.PI;
    }
    const m = /^\d+(\.\d+)?|^\.\d+/.exec(src.slice(i));
    if (!m) throw new CalcError('Expression incomplète');
    i += m[0].length;
    return Number(m[0]);
  };
  if (!src) throw new CalcError('Vide');
  const v = expr();
  if (i !== src.length) throw new CalcError('Expression invalide');
  return v;
}

/** Décimales affichées au plus : autant qu'une réponse peut en recevoir (saisie limitée à 6). */
export const MAX_DECIMALS = 6;

/**
 * Affichage français d'un résultat : 10 chiffres significatifs et 6 décimales au plus
 * (π × 25 → 78,539816), sans zéro inutile ni écriture scientifique.
 */
export function formatResult(v: number): string {
  if (!Number.isFinite(v) || Math.abs(v) >= 1e12) return 'Erreur';
  const rounded = Number(Number(v.toPrecision(10)).toFixed(MAX_DECIMALS));
  if (Object.is(rounded, -0)) return '0';
  return String(rounded).replace('.', ',').replace('-', '−');
}
