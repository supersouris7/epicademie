import { useState } from 'react';
import { CalcError, evaluate, formatResult } from '../../lib/calc.ts';
import { ToolPanel } from './ToolPanel.tsx';

const KEYS = ['(', ')', '⌫', 'C', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+'];

/** Calculatrice simple (4 opérations, parenthèses), proposée seulement quand le calcul n'est pas l'objectif. */
export function Calculator({ onClose }: { readonly onClose: () => void }) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const press = (k: string) => {
    if (k === 'C') {
      setExpr('');
      setResult(null);
    } else if (k === '⌫') setExpr((e) => e.slice(0, -1));
    else if (k === '=') {
      try {
        const r = formatResult(evaluate(expr));
        setResult(r);
        setExpr(r);
      } catch (err) {
        setResult(err instanceof CalcError ? err.message : 'Erreur');
      }
    } else {
      setResult(null);
      setExpr((e) => (e.length < 40 ? e + k : e));
    }
  };
  return (
    <ToolPanel title="Calculatrice" onClose={onClose}>
      <div className="bg-surface-2 border-outline rounded-xl border-4 p-3 text-right" aria-live="polite">
        <div className="text-muted min-h-6 text-lg font-bold">{result !== null && result !== expr ? result : ' '}</div>
        <div className="font-display min-h-10 text-3xl break-all">{expr || '0'}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={`cartoon cartoon-press font-display h-14 text-2xl ${k === '=' ? 'bg-success text-white' : /[÷×−+()]/.test(k) ? 'bg-accent text-white' : k === 'C' || k === '⌫' ? 'bg-surface-2' : 'bg-surface'}`}
            aria-label={k === '⌫' ? 'Effacer' : k === 'C' ? 'Tout effacer' : k}
          >
            {k}
          </button>
        ))}
      </div>
    </ToolPanel>
  );
}
