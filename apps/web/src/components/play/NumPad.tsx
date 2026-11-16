import { useEffect } from 'react';

interface NumPadProps {
  readonly onKey: (key: string) => void;
  readonly onSubmit: () => void;
  readonly canSubmit: boolean;
  readonly allowComma?: boolean;
  readonly allowMinus?: boolean;
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

/** Pavé numérique tactile géant (+ clavier physique). */
export function NumPad({ onKey, onSubmit, canSubmit, allowComma = true, allowMinus = true }: NumPadProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (/^\d$/.test(e.key)) onKey(e.key);
      else if ((e.key === ',' || e.key === '.') && allowComma) onKey(',');
      else if (e.key === '-' && allowMinus) onKey('−');
      else if (e.key === 'Backspace') onKey('⌫');
      else if (e.key === 'Enter' && canSubmit) onSubmit();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKey, onSubmit, canSubmit, allowComma, allowMinus]);

  const key = (k: string, label = k, extra = '') => (
    <button
      key={k}
      type="button"
      onClick={() => onKey(k)}
      className={`cartoon cartoon-press bg-surface font-display h-16 text-3xl sm:h-18 ${extra}`}
      aria-label={label === '⌫' ? 'Effacer' : label === '−' ? 'Moins' : label}
    >
      {label}
    </button>
  );
  return (
    <div className="mx-auto grid w-full max-w-sm grid-cols-4 gap-3">
      <div className="col-span-3 grid grid-cols-3 gap-3">
        {KEYS.map((k) => key(k))}
        {allowMinus ? key('−') : <span />}
        {key('0')}
        {allowComma ? key(',') : <span />}
      </div>
      <div className="grid grid-rows-[1fr_2fr] gap-3">
        {key('⌫')}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="cartoon cartoon-press bg-success font-display text-2xl text-white disabled:opacity-40"
        >
          OK
        </button>
      </div>
    </div>
  );
}
