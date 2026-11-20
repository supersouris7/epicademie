import { useEffect } from 'react';
import { keyIsForGame } from '../../lib/keys.ts';

const ROWS = [
  ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
  ['w', 'x', 'c', 'v', 'b', 'n', '’', '-'],
] as const;
/** Lettres accentuées du français et de l'espagnol. */
const ACCENTS = [
  'é',
  'è',
  'ê',
  'à',
  'â',
  'ç',
  'ù',
  'û',
  'ô',
  'î',
  'ï',
  'ë',
  'ñ',
  'á',
  'í',
  'ó',
  'ú',
  '¿',
  '¡',
] as const;

interface KeyboardProps {
  readonly onKey: (key: string) => void;
  readonly onSubmit: () => void;
  readonly canSubmit: boolean;
  readonly upper: boolean;
  readonly onShift: () => void;
}

/** Clavier AZERTY tactile (+ clavier physique) pour les réponses écrites. */
export function Keyboard({ onKey, onSubmit, canSubmit, upper, onShift }: KeyboardProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!keyIsForGame(e)) return;
      if (document.body.dataset.keyboard || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        if (canSubmit) onSubmit();
      } else if (e.key === 'Backspace') onKey('⌫');
      else if (e.key === "'") onKey('’');
      else if (e.key.length === 1 && /[\p{L} \-’¿¡]/u.test(e.key)) onKey(e.key);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKey, onSubmit, canSubmit]);

  const key = (k: string, extra = '', label: string = k) => (
    <button
      key={k}
      type="button"
      onClick={() => onKey(k)}
      aria-label={k === '⌫' ? 'Effacer' : k === ' ' ? 'Espace' : k === '’' ? 'Apostrophe' : undefined}
      className={`cartoon cartoon-press bg-surface font-display h-full min-h-8 min-w-0 flex-1 text-xl ${extra}`}
    >
      {upper && k.length === 1 ? label.toUpperCase() : label}
    </button>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5" role="group" aria-label="Clavier">
      <div className="flex min-h-0 flex-1 gap-1 overflow-x-auto" aria-label="Lettres accentuées">
        {ACCENTS.map((k) => key(k, 'bg-surface-2 min-w-9 text-lg'))}
      </div>
      {ROWS.map((row) => (
        <div key={row[0]} className="flex min-h-0 flex-1 gap-1">
          {row.map((k) => key(k))}
          {row[0] === 'w' && key('⌫', 'flex-[1.6] bg-surface-2')}
        </div>
      ))}
      <div className="flex min-h-0 flex-1 gap-1">
        <button
          type="button"
          onClick={onShift}
          aria-pressed={upper}
          aria-label="Majuscule"
          className={`cartoon cartoon-press font-display h-full flex-[1.4] text-xl ${upper ? 'bg-accent text-white' : 'bg-surface-2'}`}
        >
          ⇧
        </button>
        {key(' ', 'flex-[5]', 'espace')}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="cartoon cartoon-press bg-success font-display h-full flex-[2] text-xl text-white disabled:opacity-40"
        >
          OK
        </button>
      </div>
    </div>
  );
}
