import { emptyConversion, LAYOUTS, type ConversionKind, type ConversionState } from '../../lib/conversion.ts';
import { MathText } from '../MathText.tsx';

interface ConversionTableProps {
  readonly kind: ConversionKind;
  readonly state: ConversionState;
  readonly onChange: (s: ConversionState) => void;
  readonly highlight: ReadonlySet<string>;
}

/** Tableau de conversion à remplir : chiffres et virgule placés comme sur le cahier. */
export function ConversionTable({ kind, state, onChange, highlight }: ConversionTableProps) {
  const layout = LAYOUTS[kind];
  const total = state.digits.length;
  const set = (patch: Partial<ConversionState>) => onChange({ ...state, ...patch });
  const type = (d: string) =>
    set({
      digits: state.digits.map((v, i) => (i === state.selected ? d : v)),
      selected: Math.min(total - 1, state.selected + 1),
    });
  const hl = (u: string) => (highlight.has(u) ? 'bg-primary text-white' : '');
  let index = 0;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted text-sm font-bold">
        Touche une case, écris un chiffre ; « Virgule » la place juste après la case choisie. Les unités de l’énoncé
        sont en orange.
      </p>
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse">
          <thead>
            <tr>
              {layout.map((c) => (
                <th
                  key={c.unit}
                  colSpan={c.cells}
                  className={`border-outline border-2 px-2 py-1 text-lg ${hl(c.unit) || 'bg-accent text-white'}`}
                >
                  <MathText text={c.unit} />
                </th>
              ))}
            </tr>
            {kind === 'volume' && (
              <tr>
                {layout.flatMap((c) =>
                  (c.capacity ?? []).map((u, k) => (
                    <th
                      key={`${c.unit}${k}`}
                      className={`border-outline border-2 px-1 text-sm ${hl(u) || 'bg-surface-2'}`}
                    >
                      {u}
                    </th>
                  )),
                )}
              </tr>
            )}
          </thead>
          <tbody>
            <tr>
              {layout.flatMap((c) =>
                Array.from({ length: c.cells }, (_, k) => {
                  const i = index++;
                  const last = k === c.cells - 1;
                  return (
                    <td
                      key={`${c.unit}${k}`}
                      className={`border-outline relative border-y-2 p-0 ${last ? 'border-r-2' : 'border-r border-r-[var(--text-muted)]'} ${k === 0 ? 'border-l-2' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => set({ selected: i })}
                        aria-label={`Case ${i + 1}`}
                        aria-pressed={state.selected === i}
                        className={`font-display h-14 w-11 text-3xl ${state.selected === i ? 'bg-[color-mix(in_srgb,var(--primary)_28%,transparent)]' : ''}`}
                      >
                        {state.digits[i] ?? ''}
                      </button>
                      {state.comma === i && (
                        <span
                          aria-label="virgule"
                          className="bg-danger absolute top-1 -right-[5px] bottom-1 z-10 w-2.5 rounded-full"
                        />
                      )}
                    </td>
                  );
                }),
              )}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => type(k)}
            className="cartoon cartoon-press bg-surface font-display h-12 w-12 text-2xl"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => set({ comma: state.comma === state.selected ? null : state.selected })}
          className="cartoon cartoon-press bg-danger font-display h-12 px-3 text-xl text-white"
        >
          Virgule
        </button>
        <button
          type="button"
          onClick={() => set({ digits: state.digits.map((v, i) => (i === state.selected ? null : v)) })}
          className="cartoon cartoon-press bg-surface-2 font-display h-12 px-3 text-lg"
        >
          Effacer la case
        </button>
        <button
          type="button"
          onClick={() => onChange(emptyConversion(kind))}
          className="cartoon cartoon-press bg-surface-2 font-display h-12 px-3 text-lg"
        >
          Tout effacer
        </button>
      </div>
    </div>
  );
}
