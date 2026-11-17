/**
 * Évaluateur de la calculatrice : nombres décimaux (virgule ou point), π, + − × ÷, parenthèses.
 * Multiplication implicite devant π ou une parenthèse : « 2π », « 3(4+1) », « π(2) ».
 * Analyse descendante récursive — aucune évaluation de code arbitraire.
 */
export class CalcError extends Error {}

export function evaluate(input: string): number {
  const src = input.replace(/\s/g, '').replace(/−/g, '-').replace(/,/g, '.');
  let i = 0;
  const peek = () => src[i];
  const expr = (): number => {
    let v = term();
    while (peek() === '+' || peek() === '-') v = src[i++] === '+' ? v + term() : v - term();
    return v;
  };
  const term = (): number => {
    let v = factor();
    for (;;) {
      const op = peek();
      if (op === '×' || op === '*') {
        i++;
        v *= factor();
      } else if (op === '÷' || op === '/') {
        i++;
        const d = factor();
        if (d === 0) throw new CalcError('Division par zéro');
        v /= d;
      } else if (op === 'π' || op === '(') v *= factor();
      else return v;
    }
  };
  const factor = (): number => {
    if (peek() === '-') {
      i++;
      return -factor();
    }
    if (peek() === '(') {
      i++;
      const v = expr();
      if (peek() !== ')') throw new CalcError('Parenthèse manquante');
      i++;
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
