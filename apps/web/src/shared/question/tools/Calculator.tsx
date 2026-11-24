import { useEffect } from 'react';
import type { Grade } from '@epicademie/shared';
import { calcRows, pressCalc, sendable, type CalcState } from '../calcState.ts';
import { keyIsForGame } from '../../lib/keys.ts';

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
  '^': 'xⁿ',
};

const ARIA: Record<string, string> = {
  '⌫': 'Effacer le dernier caractère',
  C: 'Tout effacer',
  π: 'Pi',
  'x²': 'Au carré',
  xⁿ: 'Puissance',
  '√': 'Racine carrée',
  '−': 'Moins',
  'cos⁻¹': 'Arc cosinus (angle dont le cosinus vaut)',
  'sin⁻¹': 'Arc sinus (angle dont le sinus vaut)',
  'tan⁻¹': 'Arc tangente (angle dont la tangente vaut)',
};

/** Pavé principal (4 colonnes) : le 0 sous le 1, comme sur une vraie calculatrice. */
const PAD = [
  ['C', '⌫', '÷', '×'],
  ['7', '8', '9', '−'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', '='],
] as const;

const OPS = new Set(['÷', '×', '−', '+']);

interface CalculatorProps {
  readonly state: CalcState;
  readonly onChange: (s: CalcState) => void;
  /** Classe de la question : touches de fonction du programme (π, x², √, xⁿ, cos…). */
  readonly grade?: Grade;
  /** Envoie le résultat dans la réponse (questions à saisie numérique). */
  readonly onUse?: (value: string) => void;
}

/**
 * Calculatrice dans la zone d'outils, à la place du pavé de réponse. Les touches de fonction
 * suivent la classe (trigonométrie en degrés en 3e) ; clavier physique pris en charge (p = π, ^).
 * Résultats à 6 décimales au plus, comme les réponses.
 */
export function Calculator({ state, onChange, grade, onUse }: CalculatorProps) {
  useEffect(() => {
    document.body.dataset.keyboard = 'calc';
    const onKey = (e: KeyboardEvent) => {
      const k = /^[\d+()]$/.test(e.key) ? e.key : KEYBOARD[e.key];
      if (!k || !keyIsForGame(e)) return;
      e.preventDefault();
      onChange(pressCalc(state, k));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      delete document.body.dataset.keyboard;
    };
  }, [state, onChange]);

  const press = (k: string) => onChange(pressCalc(state, k));
  // Résultat envoyable : celui affiché, ou l'expression calculée à la volée.
  const value = sendable(state);
  const rows = calcRows(grade);
  const base = 'cartoon cartoon-press font-display h-full min-h-0';
  const tone = (k: string) =>
    k === '='
      ? 'bg-success text-white'
      : OPS.has(k)
        ? 'bg-accent text-white'
        : /^[C⌫]$/.test(k)
          ? 'bg-surface-2'
          : 'bg-surface';
  const key = (k: string, extra = '') => (
    <button
      key={k}
      type="button"
      onClick={() => press(k)}
      aria-label={ARIA[k] ?? k}
      className={`${base} text-2xl ${tone(k)} ${extra}`}
    >
      {k}
    </button>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5" data-tool="calc">
      <div
        className="bg-surface-2 border-outline flex shrink-0 items-baseline gap-2 rounded-xl border-4 px-3 py-0.5"
        aria-live="polite"
      >
        <span className="text-muted min-w-0 shrink truncate text-xs font-bold">
          {state.result !== null && state.result !== state.expr ? state.result : ''}
        </span>
        <span className="font-display min-h-8 min-w-0 flex-1 truncate text-right text-2xl" dir="ltr">
          {state.expr || '0'}
        </span>
      </div>

      {/* Touches de fonction de la classe : une ou deux rangées, plus petites que le pavé. */}
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid shrink-0 gap-1.5"
          style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
        >
          {row.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={ARIA[k] ?? k}
              className={`${base} bg-primary h-9 px-0.5 text-lg text-white [@media(max-height:760px)]:h-8`}
            >
              {k}
            </button>
          ))}
        </div>
      ))}

      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-5 gap-1.5">
        {PAD.flat().map((k) => key(k))}
        {key('0', onUse ? '' : 'col-span-3')}
        {key(',')}
        {onUse && (
          <button
            type="button"
            disabled={!value}
            onClick={() => value && onUse(value)}
            aria-label={value ? `Envoyer ${value} dans ma réponse` : 'Envoyer le résultat dans ma réponse'}
            className={`${base} bg-primary col-span-2 truncate px-2 text-base text-white disabled:opacity-40`}
          >
            Envoyer ➜ réponse
          </button>
        )}
      </div>
    </div>
  );
}
