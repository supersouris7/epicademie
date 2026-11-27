import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import type { ClozeBlank, Question, Response } from '@epicademie/content';
import { keyIsForGame } from '../lib/keys.ts';
import { MathText } from './MathText.tsx';
import { SubmitKey } from './NumPad.tsx';
import { typeKey } from './keyboard.ts';
import { Keyboard } from './tools/Keyboard.tsx';

/**
 * Réponses structurées (ADR 0034) : ordre, association, texte à trous.
 * Trois façons de répondre, sans écran spécial : toucher, clavier (chiffres, lettres, Retour arrière, Entrée)
 * et télécommande (flèches pour passer d'un bouton à l'autre, OK pour valider).
 */

type Spec<K extends Question['answer']['kind']> = Extract<Question['answer'], { kind: K }>;

interface CommonProps {
  readonly disabled: boolean;
  readonly onSubmit: (r: Response) => void;
  readonly onUnknown?: () => void;
}

const LETTERS = 'ABCDEFGHIJKL';
// Téléphone : texte plus petit et mots coupés, pour que les longues propositions restent dans leur bouton.
const BUTTON =
  'cartoon cartoon-press bg-surface min-h-14 min-w-0 px-2 py-2 text-base font-bold break-words hyphens-auto sm:px-3 sm:text-xl disabled:opacity-40';

/** Groupe de boutons dont les flèches de la télécommande font passer le focus au suivant ou au précédent. */
function ArrowGroup(p: { readonly label: string; readonly className: string; readonly children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: ReactKeyboardEvent) => {
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!forward && !back) return;
    const all = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    if (all.length === 0) return;
    const at = all.indexOf(document.activeElement as HTMLButtonElement);
    const next = at < 0 ? 0 : (at + (forward ? 1 : -1) + all.length) % all.length;
    e.preventDefault();
    all[next]?.focus();
  };
  return (
    <div ref={ref} onKeyDown={onKeyDown} role="toolbar" aria-label={p.label} className={p.className}>
      {p.children}
    </div>
  );
}

/** Touches du clavier physique, sauf quand l'élève écrit ailleurs ou que le clavier virtuel est actif. */
function useGameKeys(handler: (e: KeyboardEvent) => boolean, deps: readonly unknown[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!keyIsForGame(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (handler(e)) e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function Frame({ children, hint }: { readonly children: ReactNode; readonly hint: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-3 overflow-y-auto [justify-content:safe_center]">
      <p className="text-muted text-center text-lg font-bold">{hint}</p>
      {children}
    </div>
  );
}

/** Ordre : on touche les éléments dans l'ordre voulu (1, 2, 3…) ; toucher un élément placé le retire. */
function OrderAnswer({ spec, disabled, onSubmit, onUnknown }: CommonProps & { readonly spec: Spec<'order'> }) {
  const n = spec.items.length;
  const [order, setOrder] = useState<readonly number[]>([]);
  const toggle = useCallback(
    (i: number) => setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i])),
    [],
  );
  const complete = order.length === n;
  const submit = () => complete && !disabled && onSubmit({ kind: 'order', order });
  useGameKeys(
    (e) => {
      if (disabled) return false;
      if (/^[1-9]$/.test(e.key) && Number(e.key) <= n) toggle(Number(e.key) - 1);
      else if (e.key === 'Backspace') setOrder((o) => o.slice(0, -1));
      else if (e.key === 'Enter' && complete) onSubmit({ kind: 'order', order });
      else if (e.key === '?' && order.length === 0 && onUnknown) onUnknown();
      else return false;
      return true;
    },
    [disabled, n, complete, order, onSubmit, onUnknown, toggle],
  );
  return (
    <Frame hint="Touche les éléments dans le bon ordre. Touche un élément une deuxième fois pour le retirer.">
      <ArrowGroup label="Éléments à remettre dans l’ordre" className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {spec.items.map((item, i) => {
          const rank = order.indexOf(i);
          return (
            <button
              key={item}
              type="button"
              disabled={disabled}
              aria-pressed={rank >= 0}
              aria-label={`${item}${rank >= 0 ? ` (place ${rank + 1})` : ''}`}
              onClick={() => toggle(i)}
              className={`${BUTTON} flex items-center gap-3 text-left ${rank >= 0 ? 'border-primary' : ''}`}
            >
              <span
                aria-hidden
                className={`font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${rank >= 0 ? 'bg-primary text-white' : 'bg-surface-2 text-muted'}`}
              >
                {rank >= 0 ? rank + 1 : i + 1}
              </span>
              <MathText text={item} />
            </button>
          );
        })}
      </ArrowGroup>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || order.length === 0}
          onClick={() => setOrder([])}
          className={`${BUTTON} bg-surface-2`}
        >
          Tout effacer
        </button>
        <SubmitKey
          className="cartoon cartoon-press font-display min-h-14 w-36 text-2xl"
          canSubmit={!disabled && complete}
          onSubmit={submit}
          onUnknown={order.length === 0 ? onUnknown : undefined}
        />
      </div>
    </Frame>
  );
}

/** Association : on touche un élément de gauche (chiffre), puis son partenaire de droite (lettre). */
function MatchAnswer({ spec, disabled, onSubmit, onUnknown }: CommonProps & { readonly spec: Spec<'match'> }) {
  const n = spec.left.length;
  const [pairs, setPairs] = useState<readonly (number | null)[]>(() => Array.from({ length: n }, () => null));
  const [active, setActive] = useState<number | null>(0);
  const nextFree = (p: readonly (number | null)[]) => {
    const i = p.indexOf(null);
    return i < 0 ? null : i;
  };
  const pickLeft = useCallback((i: number) => {
    // Un élément déjà associé est libéré et re-sélectionné.
    setPairs((p) => p.map((v, k) => (k === i ? null : v)));
    setActive(i);
  }, []);
  const pickRight = useCallback(
    (j: number) => {
      if (pairs.includes(j)) return;
      const target = active ?? nextFree(pairs);
      if (target === null) return;
      const next = pairs.map((v, k) => (k === target ? j : v));
      setPairs(next);
      setActive(nextFree(next));
    },
    [active, pairs],
  );
  const undo = useCallback(() => {
    const last = pairs.reduce<number>((acc, v, k) => (v !== null ? k : acc), -1);
    if (last < 0) return;
    setPairs((p) => p.map((v, k) => (k === last ? null : v)));
    setActive(last);
  }, [pairs]);
  const complete = pairs.every((p) => p !== null);
  const submit = () => {
    if (complete && !disabled) onSubmit({ kind: 'match', pairs: pairs });
  };
  useGameKeys(
    (e) => {
      if (disabled) return false;
      const letter = /^[a-l]$/i.test(e.key) ? e.key.toUpperCase().charCodeAt(0) - 65 : -1;
      if (/^[1-9]$/.test(e.key) && Number(e.key) <= n) pickLeft(Number(e.key) - 1);
      else if (letter >= 0 && letter < n) pickRight(letter);
      else if (e.key === 'Backspace') undo();
      else if (e.key === 'Enter' && complete) onSubmit({ kind: 'match', pairs: pairs });
      else if (e.key === '?' && pairs.every((p) => p === null) && onUnknown) onUnknown();
      else return false;
      return true;
    },
    [disabled, n, complete, pairs, active, onSubmit, onUnknown, pickLeft, pickRight, undo],
  );
  return (
    <Frame hint="Touche un élément à gauche, puis son partenaire à droite.">
      <ArrowGroup
        label="Associer les deux colonnes"
        className="grid w-full max-w-3xl grid-cols-2 gap-x-2 gap-y-2 sm:gap-x-6"
      >
        <div className="flex flex-col gap-2">
          {spec.left.map((l, i) => {
            const partner = pairs[i];
            return (
              <button
                key={l}
                type="button"
                disabled={disabled}
                aria-pressed={active === i}
                aria-label={`${i + 1}. ${l}${partner != null ? ` (associé à ${LETTERS[partner]})` : ''}`}
                onClick={() => pickLeft(i)}
                className={`${BUTTON} flex items-center gap-2 text-left ${active === i ? 'border-primary' : ''}`}
              >
                <span
                  aria-hidden
                  className="font-display bg-surface-2 text-muted w-7 shrink-0 rounded-full text-center"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <MathText text={l} />
                </span>
                {partner != null && (
                  <span
                    aria-hidden
                    className="font-display bg-primary w-7 shrink-0 rounded-full text-center text-white"
                  >
                    {LETTERS[partner]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {spec.right.map((r, j) => {
            const owner = pairs.indexOf(j);
            return (
              <button
                key={r}
                type="button"
                disabled={disabled || owner >= 0}
                aria-label={`${LETTERS[j]}. ${r}${owner >= 0 ? ` (associé à ${owner + 1})` : ''}`}
                onClick={() => pickRight(j)}
                className={`${BUTTON} flex items-center gap-2 text-left`}
              >
                <span
                  aria-hidden
                  className="font-display bg-surface-2 text-muted w-7 shrink-0 rounded-full text-center"
                >
                  {LETTERS[j]}
                </span>
                <span className="min-w-0 flex-1">
                  <MathText text={r} />
                </span>
                {owner >= 0 && (
                  <span
                    aria-hidden
                    className="font-display bg-primary w-7 shrink-0 rounded-full text-center text-white"
                  >
                    {owner + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ArrowGroup>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || pairs.every((p) => p === null)}
          onClick={undo}
          className={`${BUTTON} bg-surface-2`}
        >
          Retirer la dernière
        </button>
        <SubmitKey
          className="cartoon cartoon-press font-display min-h-14 w-36 text-2xl"
          canSubmit={!disabled && complete}
          onSubmit={submit}
          onUnknown={pairs.every((p) => p === null) ? onUnknown : undefined}
        />
      </div>
    </Frame>
  );
}

const firstEmpty = (answers: readonly string[], from = 0) => {
  const after = answers.findIndex((a, i) => i >= from && a.trim() === '');
  return after >= 0 ? after : answers.findIndex((a) => a.trim() === '');
};

/** Texte à trous : on touche un trou, puis on écrit (clavier) ou on choisit (liste). OK passe au trou suivant. */
function ClozeAnswer({ spec, disabled, onSubmit, onUnknown }: CommonProps & { readonly spec: Spec<'cloze'> }) {
  const { blanks, parts } = spec;
  const [answers, setAnswers] = useState<readonly string[]>(() => blanks.map(() => ''));
  const [active, setActive] = useState(0);
  const [upper, setUpper] = useState(false);
  const blank: ClozeBlank | undefined = blanks[active];
  const complete = answers.every((a) => a.trim() !== '');
  const setAnswer = useCallback((i: number, v: string) => setAnswers((a) => a.map((x, k) => (k === i ? v : x))), []);
  const choose = useCallback(
    (option: string) => {
      const next = answers.map((x, k) => (k === active ? option : x));
      setAnswers(next);
      const i = firstEmpty(next, active + 1);
      if (i >= 0) setActive(i);
    },
    [active, answers],
  );
  const onLetter = useCallback(
    (k: string) => {
      setAnswer(active, typeKey(answers[active] ?? '', k, upper));
      if (k !== '⌫') setUpper(false);
    },
    [active, answers, setAnswer, upper],
  );
  const advance = () => {
    if (complete) onSubmit({ kind: 'cloze', answers });
    else {
      const i = firstEmpty(answers, active + 1);
      if (i >= 0) setActive(i);
    }
  };
  const nothing = answers.every((a) => a === '');
  useGameKeys(
    (e) => {
      if (disabled || blank?.mode !== 'list') return false;
      if (/^[1-9]$/.test(e.key) && Number(e.key) <= blank.options.length)
        choose(blank.options[Number(e.key) - 1] ?? '');
      else if (e.key === 'Enter' && complete) onSubmit({ kind: 'cloze', answers });
      else if (e.key === '?' && nothing && onUnknown) onUnknown();
      else return false;
      return true;
    },
    [disabled, blank, choose, complete, answers, onSubmit, nothing, onUnknown],
  );
  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center gap-2">
      <p
        className="cartoon bg-surface w-full shrink-0 px-4 py-2 text-xl leading-loose font-bold"
        aria-label="Texte à compléter"
      >
        {parts.map((p, i) => (
          <span key={i}>
            <MathText text={p} />
            {i < blanks.length && (
              <button
                type="button"
                disabled={disabled}
                aria-label={`Trou ${i + 1}${answers[i] ? ` : ${answers[i]}` : ' (vide)'}`}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
                className={`font-display mx-1 inline-block min-h-11 min-w-20 rounded-xl border-4 px-2 align-middle ${active === i ? 'border-primary bg-surface' : 'border-outline/40 bg-surface-2'}`}
              >
                {(answers[i] ?? '') === '' ? <span className="text-muted">…</span> : answers[i]}
              </button>
            )}
          </span>
        ))}
      </p>
      {blank?.mode === 'list' ? (
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3">
          <ArrowGroup
            label={`Propositions pour le trou ${active + 1}`}
            className="grid w-full max-w-2xl gap-2 sm:grid-cols-2"
          >
            {blank.options.map((o, i) => (
              <button
                key={o}
                type="button"
                disabled={disabled}
                aria-pressed={answers[active] === o}
                onClick={() => choose(o)}
                className={`${BUTTON} ${answers[active] === o ? 'border-primary' : ''}`}
              >
                <span aria-hidden className="text-muted mr-2">
                  {i + 1}
                </span>
                <MathText text={o} />
              </button>
            ))}
          </ArrowGroup>
          <SubmitKey
            className="cartoon cartoon-press font-display min-h-14 w-36 text-2xl"
            canSubmit={!disabled && complete}
            onSubmit={advance}
            onUnknown={nothing ? onUnknown : undefined}
          />
        </div>
      ) : (
        <Keyboard
          onKey={onLetter}
          onSubmit={advance}
          canSubmit={!disabled && (complete || (answers[active] ?? '').trim() !== '')}
          onUnknown={nothing ? onUnknown : undefined}
          upper={upper}
          onShift={() => setUpper((u) => !u)}
        />
      )}
    </div>
  );
}

/** Saisie du type de réponse structuré de la question (la question change : la saisie repart de zéro). */
export function StructuredAnswer({ question, ...p }: CommonProps & { readonly question: Question }) {
  const a = question.answer;
  if (a.kind === 'order') return <OrderAnswer key={question.seed} spec={a} {...p} />;
  if (a.kind === 'match') return <MatchAnswer key={question.seed} spec={a} {...p} />;
  if (a.kind === 'cloze') return <ClozeAnswer key={question.seed} spec={a} {...p} />;
  return null;
}
