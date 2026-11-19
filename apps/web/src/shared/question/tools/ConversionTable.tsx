import { motion } from 'motion/react';
import { emptyConversion, LAYOUTS, readConversion, type ConversionKind, type ConversionState } from '../conversion.ts';
import { MathText } from '../MathText.tsx';

interface ConversionTableProps {
  readonly kind: ConversionKind;
  readonly state: ConversionState;
  readonly onChange: (s: ConversionState) => void;
  readonly highlight: ReadonlySet<string>;
  /** Envoie le nombre lu dans le tableau vers la réponse. */
  readonly onUse?: (value: string) => void;
}

/**
 * Grille du tableau de conversion : en-têtes d'unités et cases blanches façon cahier.
 * `pad` ajoute des cases sans unité de part et d'autre (démonstration d'un nombre qui déborde).
 */
export function ConversionGrid({
  kind,
  state,
  highlight,
  onSelect,
  padLeft = 0,
  padRight = 0,
}: {
  readonly kind: ConversionKind;
  readonly state: ConversionState;
  readonly highlight: ReadonlySet<string>;
  readonly onSelect?: (i: number) => void;
  readonly padLeft?: number;
  readonly padRight?: number;
}) {
  const layout = LAYOUTS[kind];
  const hl = (u: string) => (highlight.has(u) ? 'bg-primary text-white' : '');
  const blank = (n: number, side: string) =>
    Array.from({ length: n }, (_, k) => ({ key: `${side}${k}`, unit: '', k: 0, cells: 1, pad: true }));
  const columns = [
    ...blank(padLeft, 'l'),
    ...layout.flatMap((c) =>
      Array.from({ length: c.cells }, (_, k) => ({
        key: `${c.unit}${k}`,
        unit: c.unit,
        k,
        cells: c.cells,
        pad: false,
      })),
    ),
    ...blank(padRight, 'r'),
  ];
  return (
    <table className="mx-auto w-full max-w-xl table-fixed border-collapse">
      <thead>
        <tr>
          {padLeft > 0 && <th colSpan={padLeft} />}
          {layout.map((c) => (
            <th
              key={c.unit}
              colSpan={c.cells}
              className={`border-outline border-2 px-0.5 py-0.5 text-sm sm:text-base ${hl(c.unit) || 'bg-accent text-white'}`}
            >
              <MathText text={c.unit} />
            </th>
          ))}
          {padRight > 0 && <th colSpan={padRight} />}
        </tr>
        {kind === 'volume' && (
          <tr>
            {padLeft > 0 && <th colSpan={padLeft} />}
            {layout.flatMap((c) =>
              (c.capacity ?? []).map((u, k) => (
                <th
                  key={`${c.unit}${k}`}
                  className={`border-outline border-2 px-0 text-xs sm:text-sm ${hl(u) || 'bg-surface-2'}`}
                >
                  {u}
                </th>
              )),
            )}
            {padRight > 0 && <th colSpan={padRight} />}
          </tr>
        )}
      </thead>
      <tbody>
        <tr>
          {columns.map((col, i) => {
            const last = col.k === col.cells - 1;
            const selected = state.selected === i;
            const cell = (
              <span
                className={`font-display flex h-11 w-full items-center justify-center text-2xl text-[var(--af-ink)] sm:text-3xl ${selected ? 'bg-[color-mix(in_srgb,var(--primary)_30%,white)]' : col.pad ? 'bg-[var(--af-cream-100)]' : 'bg-white'}`}
              >
                {state.digits[i] ?? ''}
              </span>
            );
            return (
              <td
                key={col.key}
                className={`border-outline relative border-y-2 p-0 ${col.pad ? 'border-x border-dashed' : last ? 'border-r-2' : 'border-r border-r-[var(--af-violet-700)]'} ${col.k === 0 && !col.pad ? 'border-l-2' : ''}`}
              >
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-label={`Case ${i + 1}`}
                    aria-pressed={selected}
                    className="block w-full"
                  >
                    {cell}
                  </button>
                ) : (
                  cell
                )}
                {state.comma === i && (
                  <motion.span
                    layoutId={onSelect ? undefined : 'demo-comma'}
                    aria-label="virgule"
                    className="bg-danger absolute top-1 -right-[5px] bottom-1 z-10 w-2.5 rounded-full"
                  />
                )}
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}

/** Tableau de conversion à remplir : chiffres et virgule placés comme sur le cahier. */
export function ConversionTable({ kind, state, onChange, highlight, onUse }: ConversionTableProps) {
  const total = state.digits.length;
  const set = (patch: Partial<ConversionState>) => onChange({ ...state, ...patch });
  const type = (d: string) =>
    set({
      digits: state.digits.map((v, i) => (i === state.selected ? d : v)),
      selected: Math.min(total - 1, state.selected + 1),
    });
  const value = readConversion(state);
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <p className="text-muted shrink-0 text-xs font-bold [@media(max-height:500px)]:hidden">
        Touche une case, écris les chiffres, place la virgule. Unités de l’énoncé en orange.
      </p>
      <div className="shrink-0 overflow-x-auto">
        <ConversionGrid kind={kind} state={state} highlight={highlight} onSelect={(i) => set({ selected: i })} />
      </div>
      {/* Touches en grille compacte (2 lignes) : la zone garde la même hauteur que le pavé. */}
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-2 gap-1.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => type(k)}
            className="cartoon cartoon-press bg-surface font-display h-full min-h-9 text-2xl"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            // Juste après le chiffre qu'on vient d'écrire (la sélection a déjà avancé d'une case).
            const prev = state.selected - 1;
            const at =
              state.digits[state.selected] === null && prev >= 0 && state.digits[prev] !== null ? prev : state.selected;
            set({ comma: state.comma === at ? null : at });
          }}
          aria-label="Virgule"
          className="cartoon cartoon-press bg-danger font-display h-full min-h-9 text-2xl text-white"
        >
          ,
        </button>
        <button
          type="button"
          onClick={() => set({ digits: state.digits.map((v, i) => (i === state.selected ? null : v)) })}
          aria-label="Effacer la case"
          className="cartoon cartoon-press bg-surface-2 font-display h-full min-h-9 text-xl"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => onChange(emptyConversion(kind))}
          aria-label="Tout effacer"
          className="cartoon cartoon-press bg-surface-2 font-display h-full min-h-9 text-xl"
        >
          C
        </button>
      </div>
      {onUse && (
        <button
          type="button"
          disabled={!value}
          onClick={() => value && onUse(value)}
          aria-label={value ? `Envoyer ${value} dans ma réponse` : 'Envoyer le nombre du tableau dans ma réponse'}
          className="cartoon cartoon-press bg-primary font-display h-11 shrink-0 text-lg text-white disabled:opacity-40"
        >
          Envoyer {value ?? ''} ➜ réponse
        </button>
      )}
    </div>
  );
}
