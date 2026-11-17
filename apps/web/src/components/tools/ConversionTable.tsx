import {
  emptyConversion,
  LAYOUTS,
  readConversion,
  type ConversionKind,
  type ConversionState,
} from '../../lib/conversion.ts';
import { MathText } from '../MathText.tsx';

interface ConversionTableProps {
  readonly kind: ConversionKind;
  readonly state: ConversionState;
  readonly onChange: (s: ConversionState) => void;
  readonly highlight: ReadonlySet<string>;
  /** Envoie le nombre lu dans le tableau vers la réponse. */
  readonly onUse?: (value: string) => void;
}

/** Tableau de conversion à remplir : chiffres et virgule placés comme sur le cahier. */
export function ConversionTable({ kind, state, onChange, highlight, onUse }: ConversionTableProps) {
  const layout = LAYOUTS[kind];
  const total = state.digits.length;
  const set = (patch: Partial<ConversionState>) => onChange({ ...state, ...patch });
  const type = (d: string) =>
    set({
      digits: state.digits.map((v, i) => (i === state.selected ? d : v)),
      selected: Math.min(total - 1, state.selected + 1),
    });
  const hl = (u: string) => (highlight.has(u) ? 'bg-primary text-white' : '');
  const value = readConversion(state);
  let index = 0;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <p className="text-muted shrink-0 text-xs font-bold [@media(max-height:500px)]:hidden">
        Touche une case, écris les chiffres, place la virgule. Unités de l’énoncé en orange.
      </p>
      <div className="shrink-0 overflow-x-auto">
        <table className="mx-auto border-collapse">
          <thead>
            <tr>
              {layout.map((c) => (
                <th
                  key={c.unit}
                  colSpan={c.cells}
                  className={`border-outline border-2 px-1 py-0.5 text-base ${hl(c.unit) || 'bg-accent text-white'}`}
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
                        className={`font-display h-11 w-9 text-2xl sm:w-11 sm:text-3xl ${state.selected === i ? 'bg-[color-mix(in_srgb,var(--primary)_28%,transparent)]' : ''}`}
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
