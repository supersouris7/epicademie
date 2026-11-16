import { useEffect } from 'react';
import { pressCalc, type CalcState } from '../../lib/calcState.ts';

const KEYBOARD: Record<string, string> = {
  '*': '×',
  x: '×',
  '/': '÷',
  '-': '−',
  '.': ',',
  Enter: '=',
  '=': '=',
  Backspace: '⌫',
  Escape: 'C',
  Delete: 'C',
};

const KEYS = ['(', ')', '⌫', 'C', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+'];

interface CalculatorProps {
  readonly state: CalcState;
  readonly onChange: (s: CalcState) => void;
  /** Reporte le résultat dans la réponse (questions à saisie numérique). */
  readonly onUse?: (value: string) => void;
}

/** Calculatrice (4 opérations, parenthèses), intégrée au panneau d'outils ; clavier physique pris en charge. */
export function Calculator({ state, onChange, onUse }: CalculatorProps) {
  useEffect(() => {
    document.body.dataset.keyboard = 'calc';
    const onKey = (e: KeyboardEvent) => {
      const k = /^[\d+()]$/.test(e.key) ? e.key : KEYBOARD[e.key];
      if (!k || e.target instanceof HTMLInputElement) return;
      e.preventDefault();
      onChange(pressCalc(state, k));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      delete document.body.dataset.keyboard;
    };
  }, [state, onChange]);

  const value = state.result !== null && /^[−\d]/.test(state.result) ? state.result : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-surface-2 border-outline rounded-xl border-4 px-3 py-2 text-right" aria-live="polite">
        <div className="text-muted min-h-5 text-sm font-bold">
          {state.result !== null && state.result !== state.expr ? state.result : ' '}
        </div>
        <div className="font-display min-h-9 text-3xl break-all">{state.expr || '0'}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(pressCalc(state, k))}
            className={`cartoon cartoon-press font-display h-12 text-2xl ${k === '=' ? 'bg-success text-white' : /[÷×−+()]/.test(k) ? 'bg-accent text-white' : k === 'C' || k === '⌫' ? 'bg-surface-2' : 'bg-surface'}`}
            aria-label={k === '⌫' ? 'Effacer le dernier caractère' : k === 'C' ? 'Tout effacer' : k}
          >
            {k}
          </button>
        ))}
      </div>
      {onUse && (
        <button
          type="button"
          disabled={!value}
          onClick={() => value && onUse(value)}
          className="cartoon cartoon-press bg-primary font-display h-12 text-lg text-white disabled:opacity-40"
        >
          Mettre {value ?? 'le résultat'} dans ma réponse
        </button>
      )}
    </div>
  );
}
