/**
 * Évaluateur de la calculatrice : nombres décimaux (virgule ou point), + − × ÷, parenthèses.
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
      } else return v;
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

/** Affichage français d'un résultat (10 chiffres significatifs au plus). */
export function formatResult(v: number): string {
  if (!Number.isFinite(v)) return 'Erreur';
  const rounded = Number(v.toPrecision(10));
  return String(rounded).replace('.', ',').replace('-', '−');
}
