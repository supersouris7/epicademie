import { useEffect } from 'react';

interface NumPadProps {
  readonly onKey: (key: string) => void;
  readonly onSubmit: () => void;
  readonly canSubmit: boolean;
  readonly allowComma?: boolean;
  readonly allowMinus?: boolean;
  /** Touche spéciale à la place de la virgule (ex. passer au dénominateur). */
  readonly extraKey?: { readonly label: string; readonly ariaLabel: string; readonly onPress: () => void };
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

/** Pavé numérique tactile géant (+ clavier physique). */
export function NumPad({ onKey, onSubmit, canSubmit, allowComma = true, allowMinus = true, extraKey }: NumPadProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (document.body.dataset.keyboard) return;
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

  // Les touches remplissent la hauteur de la zone de saisie (même taille quel que soit l'onglet).
  const keyClass = 'cartoon cartoon-press font-display h-full min-h-10 text-3xl [@media(max-height:500px)]:text-2xl';
  const key = (k: string, label = k) => (
    <button
      key={k}
      type="button"
      onClick={() => onKey(k)}
      className={`${keyClass} bg-surface`}
      aria-label={label === '⌫' ? 'Effacer' : label === '−' ? 'Moins' : label}
    >
      {label}
    </button>
  );
  return (
    <div className="mx-auto grid h-full min-h-0 w-full max-w-md grid-cols-4 gap-2">
      <div className="col-span-3 grid min-h-0 grid-cols-3 grid-rows-4 gap-2">
        {KEYS.map((k) => key(k))}
        {allowMinus ? key('−') : <span />}
        {key('0')}
        {allowComma ? (
          key(',')
        ) : extraKey ? (
          <button
            type="button"
            onClick={extraKey.onPress}
            aria-label={extraKey.ariaLabel}
            className={`${keyClass} bg-accent text-white`}
          >
            {extraKey.label}
          </button>
        ) : (
          <span />
        )}
      </div>
      <div className="grid min-h-0 grid-rows-[1fr_3fr] gap-2">
        {key('⌫')}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`${keyClass} bg-success text-white disabled:opacity-40`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
