import { useEffect } from 'react';
import { keyIsForGame } from '../../lib/keys.ts';
import { layoutOf, isDivisionByZero, POSED_OPS, type PosedCell, type PosedOp } from '../posedLayout.ts';
import {
  addStep,
  advance,
  press,
  restart,
  selectTarget,
  setOp,
  type PosedState,
  type PosedTarget,
} from '../posedState.ts';

const OP_LABELS: Record<PosedOp, string> = {
  addition: 'Addition',
  soustraction: 'Soustraction',
  multiplication: 'Multiplication',
  division: 'Division',
};

const OP_SIGNS: Record<PosedOp, string> = { addition: '+', soustraction: '−', multiplication: '×', division: '÷' };

const PAD = ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫'] as const;

/** Mots de l'opération posée, expliqués avec le ton coach. */
const WORDS: Record<PosedOp, readonly (readonly [string, string])[]> = {
  addition: [
    [
      'Retenue',
      'Quand une colonne dépasse 9, tu écris le chiffre des unités en bas et tu « retiens » les dizaines : tu les notes en petit au-dessus de la colonne suivante.',
    ],
  ],
  soustraction: [
    [
      'Retenue',
      'Si le chiffre du haut est trop petit, tu en empruntes une dizaine à la colonne de gauche : tu notes la retenue en petit, puis tu continues.',
    ],
  ],
  multiplication: [
    ['Retenue', 'Le chiffre que tu gardes en tête pour le mettre dans la colonne suivante.'],
    [
      'Produit partiel',
      'Le résultat de la multiplication par un seul chiffre du nombre du bas. À chaque ligne, tu décales d’un cran vers la gauche (la case grise).',
    ],
  ],
  division: [
    ['Quotient', 'Le résultat de la division : combien de fois le diviseur « rentre » dans le dividende.'],
    ['Reste', 'Ce qui reste à la fin, toujours plus petit que le diviseur.'],
    [
      'Dividende, diviseur',
      'Le dividende est le nombre qu’on partage (sous la potence, à gauche) ; le diviseur est le nombre par lequel on divise (à droite).',
    ],
  ],
};

const HINTS: Record<PosedOp, string> = {
  addition: 'Les unités sont sous les unités, la virgule sous la virgule. Commence par la colonne de droite.',
  soustraction: 'Les unités sont sous les unités, la virgule sous la virgule. Commence par la colonne de droite.',
  multiplication:
    'Multiplie le nombre du haut par chaque chiffre du nombre du bas, en décalant d’un cran à chaque ligne, puis additionne les lignes.',
  division:
    'Pose ta division dans la potence : retire ce qui « rentre », note ce qui reste, abaisse le chiffre suivant. Ajoute une soustraction si tu en as besoin.',
};

interface PosedOperationProps {
  readonly state: PosedState;
  readonly onChange: (s: PosedState) => void;
}

const isTarget = (t: PosedTarget, id: string) => typeof t === 'object' && t.cell === id;

/**
 * « Poser une opération » : l'enfant saisit deux nombres, l'outil les aligne en colonnes et prépare
 * les cases (retenues, trait, résultat, produits partiels, potence). Il ne calcule ni ne vérifie rien.
 */
export function PosedOperation({ state, onChange }: PosedOperationProps) {
  useEffect(() => {
    document.body.dataset.keyboard = 'posed';
    const onKey = (e: KeyboardEvent) => {
      if (!keyIsForGame(e)) return;
      let next: PosedState;
      if (/^\d$/.test(e.key)) next = press(state, e.key);
      else if (e.key === ',' || e.key === '.') next = press(state, ',');
      else if (e.key === 'Backspace') next = press(state, '⌫');
      else if (e.key === 'Enter') next = advance(state);
      else return;
      e.preventDefault();
      onChange(next);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      delete document.body.dataset.keyboard;
    };
  }, [state, onChange]);

  const layout = layoutOf(state.op, state.a, state.b, state.extraSteps);
  const field = (target: 'a' | 'b', label: string) => (
    <button
      type="button"
      aria-label={`${label} : ${state[target] || 'vide'}`}
      aria-pressed={state.target === target}
      onClick={() => onChange(selectTarget(state, target))}
      className={`cartoon cartoon-press font-display h-10 min-w-0 flex-1 truncate px-2 text-xl ${state.target === target ? 'bg-accent text-toon' : 'bg-surface'}`}
    >
      {state[target] || label}
    </button>
  );

  return (
    <div className="flex min-h-0 flex-col gap-2 md:flex-row" data-tool="posed">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex shrink-0 gap-1" role="group" aria-label="Type d’opération">
          {POSED_OPS.map((op) => (
            <button
              key={op}
              type="button"
              aria-label={OP_LABELS[op]}
              aria-pressed={state.op === op}
              onClick={() => onChange(setOp(state, op))}
              className={`cartoon cartoon-press font-display h-9 min-w-0 flex-1 text-xl ${state.op === op ? 'bg-accent text-toon' : 'bg-surface-2'}`}
            >
              {OP_SIGNS[op]}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {field('a', 'Premier nombre')}
          <span className="font-display text-xl" aria-hidden>
            {OP_SIGNS[state.op]}
          </span>
          {field('b', 'Second nombre')}
        </div>
        <p className="text-muted shrink-0 text-xs font-bold">
          {layout
            ? HINTS[state.op]
            : isDivisionByZero(state.b) && state.op === 'division'
              ? 'On ne peut pas diviser par 0. Choisis un autre diviseur.'
              : 'Tape tes deux nombres (avec une virgule si tu veux) : je les range en colonnes pour toi.'}
        </p>
        {layout && (
          <>
            <Board layout={layout} state={state} onChange={onChange} />
            {layout.decimals > 0 && (
              <p className="text-muted text-xs font-bold">
                Dans tes deux nombres, il y a {layout.decimals} chiffre{layout.decimals > 1 ? 's' : ''} après la virgule
                : pense à la virgule de ton résultat.
              </p>
            )}
            {state.op === 'division' && (
              <button
                type="button"
                onClick={() => onChange(addStep(state))}
                className="cartoon cartoon-press bg-surface-2 h-9 shrink-0 px-3 text-sm font-bold"
              >
                Ajouter une soustraction
              </button>
            )}
          </>
        )}
        <details className="shrink-0 text-sm">
          <summary className="cursor-pointer font-bold">Les mots à connaître</summary>
          <dl className="mt-1 space-y-1">
            {WORDS[state.op].map(([word, meaning]) => (
              <div key={word}>
                <dt className="inline font-bold">{word} : </dt>
                <dd className="inline">{meaning}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 md:w-56">
        <div className="grid grid-cols-3 gap-1.5">
          {PAD.map((k) => (
            <button
              key={k}
              type="button"
              aria-label={k === '⌫' ? 'Effacer' : k === ',' ? 'Virgule' : k}
              onClick={() => onChange(press(state, k))}
              className={`cartoon cartoon-press font-display h-11 text-2xl ${k === '⌫' ? 'bg-surface-2' : 'bg-surface'}`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onChange(advance(state))}
            className="cartoon cartoon-press bg-primary h-9 text-sm font-bold text-white"
          >
            Suivant ➜
          </button>
          <button
            type="button"
            onClick={() => onChange(restart(state))}
            className="cartoon cartoon-press bg-surface-2 h-9 text-sm font-bold"
          >
            Recommencer
          </button>
        </div>
      </div>
    </div>
  );
}

function Board({
  layout,
  state,
  onChange,
}: {
  readonly layout: NonNullable<ReturnType<typeof layoutOf>>;
  readonly state: PosedState;
  readonly onChange: (s: PosedState) => void;
}) {
  const render = (c: PosedCell) => {
    const border = `${c.under ? 'border-b-4 border-b-current ' : ''}${c.side ? 'border-l-4 border-l-current ' : ''}`;
    const size = c.small ? 'text-xs' : 'text-xl sm:text-2xl';
    if (c.kind === 'input') {
      const value = state.cells[c.id] ?? '';
      return (
        <button
          key={c.id}
          type="button"
          aria-label={`${c.label ?? 'Case'} : ${value || 'vide'}`}
          aria-current={isTarget(state.target, c.id) ? 'true' : undefined}
          onClick={() => onChange(selectTarget(state, { cell: c.id }))}
          className={`font-display aspect-square min-w-0 rounded-md border-2 ${size} ${border} ${isTarget(state.target, c.id) ? 'bg-accent text-toon border-outline' : 'bg-surface border-dashed'}`}
        >
          {value}
        </button>
      );
    }
    return (
      <div
        key={c.id}
        className={`font-display flex aspect-square min-w-0 items-center justify-center ${size} ${border} ${c.kind === 'shift' ? 'text-muted' : ''}`}
      >
        {c.text}
      </div>
    );
  };
  return (
    <div
      role="group"
      aria-label="Opération posée"
      className="mx-auto grid w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
        maxWidth: `${layout.cols * 3.25}rem`,
      }}
    >
      {layout.rows.map((row) => (
        <RowCells key={row.id} caption={row.caption} cols={layout.cols}>
          {row.cells.map(render)}
        </RowCells>
      ))}
    </div>
  );
}

function RowCells({
  caption,
  cols,
  children,
}: {
  readonly caption?: string;
  readonly cols: number;
  readonly children: React.ReactNode;
}) {
  return (
    <>
      {caption && (
        <p className="text-muted text-xs font-bold" style={{ gridColumn: `1 / span ${cols}` }}>
          {caption}
        </p>
      )}
      {children}
    </>
  );
}
