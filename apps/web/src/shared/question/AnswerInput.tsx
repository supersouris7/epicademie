import { useCallback, useEffect, useState } from 'react';
import { keyIsForGame } from '../lib/keys.ts';
import type { Question, Response } from '@epicademie/content';
import { MathText } from './MathText.tsx';
import { applyKey } from './numpad.ts';
import { typeKey } from './keyboard.ts';
import { Keyboard } from './tools/Keyboard.tsx';
import { NumPad, SubmitKey } from './NumPad.tsx';
import { isStructured } from './answers.ts';
import { StructuredAnswer } from './StructuredAnswers.tsx';
import { ZoneAnswer } from './ZoneAnswer.tsx';

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
  /** Rien de saisi : le bouton OK devient « ? » (aide au lieu d'une réponse au hasard). */
  readonly onUnknown?: () => void;
}

function unitLabel(unit?: string) {
  return unit ? <MathText text={unit} className="font-display text-muted text-3xl" /> : null;
}

/** Saisie adaptée au type de réponse : pavé numérique, fraction, QCM, point. */
export function AnswerInput({
  question,
  disabled,
  onSubmit,
  picked,
  initialText,
  excluded,
  onUnknown,
}: AnswerInputProps) {
  const help = disabled ? undefined : onUnknown;
  /** « ? » seulement tant que rien n'est saisi. */
  const helpIf = (empty: boolean) => (empty ? help : undefined);
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

  if (a.kind === 'choice')
    return <ChoiceAnswer options={a.options} disabled={disabled} excluded={excluded} onSubmit={onSubmit} />;
  if (isStructured(a))
    return <StructuredAnswer question={question} disabled={disabled} onSubmit={onSubmit} onUnknown={help} />;
  if (a.kind === 'zone')
    return <ZoneAnswer key={question.seed} spec={a} disabled={disabled} onSubmit={onSubmit} onUnknown={help} />;
  if (a.kind === 'point')
    return <PointAnswer picked={picked} disabled={disabled} onSubmit={onSubmit} onUnknown={help} />;

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
          onUnknown={helpIf(num === '' && den === '')}
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
          onUnknown={helpIf(text.trim() === '')}
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
        onUnknown={helpIf(text === '')}
      />
    </div>
  );
}

/** QCM : une option par bouton (celle déjà essayée est grisée au 2e essai). Au clavier : 1, 2, 3… ou A, B, C… */
function ChoiceAnswer(p: {
  readonly options: readonly string[];
  readonly disabled: boolean;
  readonly excluded?: number;
  readonly onSubmit: (r: Response) => void;
}) {
  const { options, disabled, excluded, onSubmit } = p;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!keyIsForGame(e) || disabled || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const i = /^[1-9]$/.test(k) ? Number(k) - 1 : /^[a-i]$/.test(k) ? k.charCodeAt(0) - 97 : -1;
      if (i < 0 || i >= options.length || i === excluded) return;
      e.preventDefault();
      onSubmit({ kind: 'choice', index: i });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [options, disabled, excluded, onSubmit]);
  return (
    <div
      className={`grid h-full auto-rows-[minmax(3.5rem,auto)] gap-3 overflow-y-auto [align-content:safe_center] ${p.options.length > 2 ? 'sm:grid-cols-2' : 'grid-cols-2'}`}
    >
      {p.options.map((o, i) => (
        <button
          key={o}
          type="button"
          disabled={p.disabled || p.excluded === i}
          onClick={() => p.onSubmit({ kind: 'choice', index: i })}
          className={`cartoon cartoon-press bg-surface min-h-14 min-w-0 px-3 py-2 text-lg font-bold break-words sm:px-4 sm:text-2xl disabled:opacity-40 ${p.excluded === i ? 'line-through' : ''}`}
        >
          <MathText text={o} />
        </button>
      ))}
    </div>
  );
}

/** Point sur un quadrillage : OK une fois un nœud touché (« ? » avant, si permis). */
function PointAnswer(p: {
  readonly picked: { x: number; y: number } | null;
  readonly disabled: boolean;
  readonly onSubmit: (r: Response) => void;
  readonly onUnknown?: () => void;
}) {
  const { picked } = p;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-muted text-lg font-bold">
        {picked ? 'Touche OK pour valider, ou touche un autre nœud.' : 'Touche un nœud du quadrillage.'}
      </p>
      <SubmitKey
        className="cartoon cartoon-press font-display min-h-16 w-48 text-2xl"
        canSubmit={!p.disabled && picked !== null}
        onSubmit={() => picked && p.onSubmit({ kind: 'point', ...picked })}
        onUnknown={p.onUnknown}
      />
    </div>
  );
}
