import { useEffect } from 'react';
import { keyIsForGame } from '../lib/keys.ts';

interface NumPadProps {
  readonly onKey: (key: string) => void;
  readonly onSubmit: () => void;
  /** Rien de saisi : le bouton OK devient « ? » (indice, puis explication). */
  readonly onUnknown?: () => void;
  readonly canSubmit: boolean;
  readonly allowComma?: boolean;
  readonly allowMinus?: boolean;
  /** Touche spéciale à la place de la virgule (ex. passer au dénominateur). */
  readonly extraKey?: { readonly label: string; readonly ariaLabel: string; readonly onPress: () => void };
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
/** Largeur du 0 selon le nombre de cases libres de la dernière rangée. */
const ZERO_SPAN: Record<number, string> = { 1: '', 2: 'col-span-2', 3: 'col-span-3' };

/** Pavé numérique tactile géant (+ clavier physique). */
export function NumPad({
  onKey,
  onSubmit,
  canSubmit,
  allowComma = true,
  allowMinus = true,
  extraKey,
  onUnknown,
}: NumPadProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!keyIsForGame(e)) return;
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
  const key = (k: string, label = k, span = '') => (
    <button
      key={k}
      type="button"
      onClick={() => onKey(k)}
      className={`${keyClass} bg-surface ${span}`}
      aria-label={label === '⌫' ? 'Effacer' : label === '−' ? 'Moins' : label}
    >
      {label}
    </button>
  );
  return (
    <div className="mx-auto grid h-full min-h-0 w-full max-w-md grid-cols-4 gap-2 xl:max-w-lg">
      <div className="col-span-3 grid min-h-0 grid-cols-3 grid-rows-4 gap-2">
        {KEYS.map((k) => key(k))}
        {/* Dernière rangée sans trou : le 0 prend la place des touches absentes (− ou virgule). */}
        {allowMinus && key('−')}
        {key('0', '0', ZERO_SPAN[3 - (allowMinus ? 1 : 0) - (allowComma || extraKey ? 1 : 0)])}
        {allowComma
          ? key(',')
          : extraKey && (
              <button
                type="button"
                onClick={extraKey.onPress}
                aria-label={extraKey.ariaLabel}
                className={`${keyClass} bg-accent text-white`}
              >
                {extraKey.label}
              </button>
            )}
      </div>
      <div className="grid min-h-0 grid-rows-[1fr_3fr] gap-2">
        {key('⌫')}
        <SubmitKey className={keyClass} canSubmit={canSubmit} onSubmit={onSubmit} onUnknown={onUnknown} />
      </div>
    </div>
  );
}

/**
 * Touche de validation : « OK » dès qu'une réponse est saisie ; sinon « ? » (si permis), qui
 * demande de l'aide au lieu d'une réponse au hasard.
 */
export function SubmitKey({
  className,
  canSubmit,
  onSubmit,
  onUnknown,
}: {
  readonly className: string;
  readonly canSubmit: boolean;
  readonly onSubmit: () => void;
  readonly onUnknown?: () => void;
}) {
  const help = !canSubmit && onUnknown !== undefined;
  return (
    <button
      type="button"
      onClick={help ? onUnknown : onSubmit}
      disabled={!canSubmit && !help}
      aria-label={help ? 'Je ne sais pas : un indice' : 'OK'}
      className={`${className} ${help ? 'bg-accent' : 'bg-success'} text-white disabled:opacity-40`}
    >
      {help ? '?' : 'OK'}
    </button>
  );
}
