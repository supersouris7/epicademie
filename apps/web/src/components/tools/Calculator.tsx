import { useEffect } from 'react';
import { pressCalc, sendable, type CalcState } from '../../lib/calcState.ts';

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
  p: 'π',
};

const KEYS = ['(', ')', 'π', '⌫', 'C', '7', '8', '9', '÷', '×', '4', '5', '6', '−', '+', '1', '2', '3', '0', ','];

interface CalculatorProps {
  readonly state: CalcState;
  readonly onChange: (s: CalcState) => void;
  /** Envoie le résultat dans la réponse (questions à saisie numérique). */
  readonly onUse?: (value: string) => void;
}

/**
 * Calculatrice (4 opérations, parenthèses, π), dans la zone d'outils à la place du pavé ;
 * clavier physique pris en charge (p = π). Résultats à 6 décimales au plus, comme les réponses.
 */
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

  // Résultat envoyable : celui affiché, ou l'expression calculée à la volée.
  const value = sendable(state);
  return (
    <div className="flex flex-col gap-2 [@media(max-height:500px)]:gap-1">
      <div
        className="bg-surface-2 border-outline rounded-xl border-4 px-3 py-2 text-right [@media(max-height:500px)]:py-0.5"
        aria-live="polite"
      >
        <div className="text-muted min-h-5 text-sm font-bold">
          {state.result !== null && state.result !== state.expr ? state.result : ' '}
        </div>
        <div className="font-display min-h-9 text-3xl break-all [@media(max-height:500px)]:min-h-7 [@media(max-height:500px)]:text-2xl">
          {state.expr || '0'}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(pressCalc(state, k))}
            className={`cartoon cartoon-press font-display h-12 text-2xl [@media(max-height:500px)]:h-9 ${/[÷×−+()π]/.test(k) ? 'bg-accent text-white' : k === 'C' || k === '⌫' ? 'bg-surface-2' : 'bg-surface'}`}
            aria-label={k === '⌫' ? 'Effacer le dernier caractère' : k === 'C' ? 'Tout effacer' : k === 'π' ? 'Pi' : k}
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(pressCalc(state, '='))}
          className={`cartoon cartoon-press bg-success font-display h-12 text-2xl text-white [@media(max-height:500px)]:h-9 ${onUse ? 'col-span-2' : 'col-span-5'}`}
        >
          =
        </button>
        {onUse && (
          <button
            type="button"
            disabled={!value}
            onClick={() => value && onUse(value)}
            aria-label={value ? `Envoyer ${value} dans ma réponse` : 'Envoyer le résultat dans ma réponse'}
            className="cartoon cartoon-press bg-primary font-display col-span-3 h-12 truncate px-2 text-lg text-white disabled:opacity-40 [@media(max-height:500px)]:h-9"
          >
            Envoyer ➜ réponse
          </button>
        )}
      </div>
    </div>
  );
}
