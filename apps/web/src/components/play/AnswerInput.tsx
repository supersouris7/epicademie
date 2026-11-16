import { useCallback, useState } from 'react';
import type { Question, Response } from '@questeo/content';
import { MathText } from '../MathText.tsx';
import { applyKey } from '../../lib/numpad.ts';
import { NumPad } from './NumPad.tsx';

interface AnswerInputProps {
  readonly question: Question;
  readonly disabled: boolean;
  readonly onSubmit: (r: Response) => void;
  /** Point choisi sur le quadrillage (questions « point »). */
  readonly picked: { x: number; y: number } | null;
}

function unitLabel(unit?: string) {
  return unit ? <MathText text={unit} className="font-display text-muted text-3xl" /> : null;
}

/** Saisie adaptée au type de réponse : pavé numérique, fraction, QCM, point. */
export function AnswerInput({ question, disabled, onSubmit, picked }: AnswerInputProps) {
  const a = question.answer;
  const [text, setText] = useState('');
  const [num, setNum] = useState('');
  const [den, setDen] = useState('');
  const [focus, setFocus] = useState<'num' | 'den'>('num');

  const onNumberKey = useCallback((k: string) => setText((v) => applyKey(v, k)), []);
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
      <div className={`grid gap-3 ${a.options.length > 2 ? 'sm:grid-cols-2' : 'grid-cols-2'}`}>
        {a.options.map((o, i) => (
          <button
            key={o}
            type="button"
            disabled={disabled}
            onClick={() => onSubmit({ kind: 'choice', index: i })}
            className="cartoon cartoon-press bg-surface min-h-18 px-4 py-3 text-2xl font-bold disabled:opacity-60"
          >
            <MathText text={o} />
          </button>
        ))}
      </div>
    );
  }

  if (a.kind === 'point') {
    return (
      <div className="flex flex-col items-center gap-3">
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
        className={`font-display flex h-16 min-w-28 items-center justify-center rounded-2xl border-4 px-3 text-4xl ${focus === which ? 'border-primary bg-surface' : 'border-outline/40 bg-surface-2'}`}
      >
        {value || <span className="text-muted">?</span>}
      </button>
    );
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2" role="group" aria-label="Fraction">
          {box('num', num)}
          <div className="bg-ink h-1.5 w-32 rounded-full" />
          {box('den', den)}
        </div>
        <NumPad
          onKey={onFractionKey}
          onSubmit={() => onSubmit({ kind: 'fraction', num, den })}
          canSubmit={!disabled && num !== '' && num !== '−' && den !== ''}
          allowComma={false}
        />
        <p className="text-muted text-sm font-bold">Touche une case pour écrire le numérateur ou le dénominateur.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3" aria-live="polite">
        <div
          className="cartoon bg-surface font-display flex h-18 min-w-48 items-center justify-center px-4 text-4xl"
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
