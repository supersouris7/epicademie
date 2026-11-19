import { useCallback, useState } from 'react';
import type { Question, Response } from '@questeo/content';
import { MathText } from './MathText.tsx';
import { applyKey } from './numpad.ts';
import { typeKey } from './keyboard.ts';
import { Keyboard } from './tools/Keyboard.tsx';
import { NumPad } from './NumPad.tsx';

interface AnswerInputProps {
  readonly question: Question;
  readonly disabled: boolean;
  readonly onSubmit: (r: Response) => void;
  /** Point choisi sur le quadrillage (questions « point »). */
  readonly picked: { x: number; y: number } | null;
  /** Valeur de départ (reportée depuis la calculatrice). */
  readonly initialText?: string;
  /** Option de QCM déjà essayée : grisée au 2e essai. */
  readonly excluded?: number;
}

function unitLabel(unit?: string) {
  return unit ? <MathText text={unit} className="font-display text-muted text-3xl" /> : null;
}

/** Saisie adaptée au type de réponse : pavé numérique, fraction, QCM, point. */
export function AnswerInput({ question, disabled, onSubmit, picked, initialText, excluded }: AnswerInputProps) {
  const a = question.answer;
  const [text, setText] = useState(initialText ?? '');
  const [num, setNum] = useState('');
  const [den, setDen] = useState('');
  const [focus, setFocus] = useState<'num' | 'den'>('num');
  const [upper, setUpper] = useState(false);

  const onNumberKey = useCallback((k: string) => setText((v) => applyKey(v, k)), []);
  const onLetter = useCallback(
    (k: string) => {
      setText((v) => typeKey(v, k, upper));
      if (k !== '⌫') setUpper(false);
    },
    [upper],
  );
  const onFractionKey = useCallback(
    (k: string) => {
      if (k === ',') return;
      if (focus === 'num') setNum((v) => applyKey(v, k, 6));
      else setDen((v) => applyKey(v.replace('−', ''), k === '−' ? '' : k, 6));
    },
    [focus],
  );

  if (a.kind === 'choice') {
    return (
      <div
        className={`grid h-full auto-rows-[minmax(3.5rem,6.5rem)] content-center gap-3 overflow-y-auto ${a.options.length > 2 ? 'sm:grid-cols-2' : 'grid-cols-2'}`}
      >
        {a.options.map((o, i) => (
          <button
            key={o}
            type="button"
            disabled={disabled || excluded === i}
            onClick={() => onSubmit({ kind: 'choice', index: i })}
            className={`cartoon cartoon-press bg-surface min-h-14 px-4 py-2 text-2xl font-bold disabled:opacity-40 ${excluded === i ? 'line-through' : ''}`}
          >
            <MathText text={o} />
          </button>
        ))}
      </div>
    );
  }

  if (a.kind === 'point') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-muted text-lg font-bold">
          {picked ? 'Touche OK pour valider, ou touche un autre nœud.' : 'Touche un nœud du quadrillage.'}
        </p>
        <button
          type="button"
          disabled={disabled || !picked}
          onClick={() => picked && onSubmit({ kind: 'point', ...picked })}
          className="cartoon cartoon-press bg-success font-display min-h-16 w-48 text-2xl text-white disabled:opacity-40"
        >
          OK
        </button>
      </div>
    );
  }

  if (a.kind === 'fraction') {
    const box = (which: 'num' | 'den', value: string) => (
      <button
        type="button"
        onClick={() => setFocus(which)}
        aria-label={which === 'num' ? 'Numérateur' : 'Dénominateur'}
        aria-pressed={focus === which}
        className={`font-display flex h-11 min-w-28 items-center justify-center rounded-2xl border-4 px-3 text-3xl ${focus === which ? 'border-primary bg-surface' : 'border-outline/40 bg-surface-2'}`}
      >
        {value || <span className="text-muted">?</span>}
      </button>
    );
    return (
      <div className="flex h-full min-h-0 flex-col items-center gap-2">
        <div className="flex shrink-0 flex-col items-center gap-1" role="group" aria-label="Fraction">
          {box('num', num)}
          <div className="bg-ink h-1.5 w-32 rounded-full" />
          {box('den', den)}
        </div>
        <NumPad
          onKey={onFractionKey}
          extraKey={{
            label: focus === 'num' ? '↓' : '↑',
            ariaLabel: focus === 'num' ? 'Passer au dénominateur' : 'Revenir au numérateur',
            onPress: () => setFocus((f) => (f === 'num' ? 'den' : 'num')),
          }}
          onSubmit={() => onSubmit({ kind: 'fraction', num, den })}
          canSubmit={!disabled && num !== '' && num !== '−' && den !== ''}
          allowComma={false}
        />
      </div>
    );
  }

  if (a.kind === 'text') {
    return (
      <div className="flex h-full min-h-0 w-full flex-col items-center gap-2">
        <div
          className="cartoon bg-surface font-display flex min-h-12 w-full shrink-0 items-center px-4 text-3xl break-all"
          aria-label="Ta réponse"
          aria-live="polite"
        >
          {text || <span className="text-muted">?</span>}
          <span aria-hidden className="bg-primary ml-0.5 inline-block h-8 w-1 animate-pulse rounded" />
        </div>
        <Keyboard
          onKey={onLetter}
          onSubmit={() => onSubmit({ kind: 'text', text })}
          canSubmit={!disabled && text.trim() !== ''}
          upper={upper}
          onShift={() => setUpper((u) => !u)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-2">
      <div className="flex shrink-0 items-center gap-3" aria-live="polite">
        <div
          className="cartoon bg-surface font-display flex h-12 min-w-48 items-center justify-center px-4 text-4xl"
          aria-label="Ta réponse"
        >
          {text || <span className="text-muted">?</span>}
        </div>
        {unitLabel(a.unit)}
      </div>
      <NumPad
        onKey={onNumberKey}
        onSubmit={() => onSubmit({ kind: 'number', text })}
        canSubmit={!disabled && text !== '' && text !== '−'}
      />
    </div>
  );
}
