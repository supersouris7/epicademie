import { useState } from 'react';
import { MathText } from '../MathText.tsx';
import { ToolPanel } from './ToolPanel.tsx';

export type ConversionKind = 'longueur' | 'aire' | 'volume';

interface Column {
  readonly unit: string;
  /** Sous-colonnes (1 pour les longueurs, 2 pour les aires, 3 pour les volumes). */
  readonly cells: number;
  /** Unités de contenance alignées sous chaque sous-colonne (volumes). */
  readonly capacity?: readonly string[];
}

const LENGTHS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

const LAYOUTS: Record<ConversionKind, readonly Column[]> = {
  longueur: LENGTHS.map((unit) => ({ unit, cells: 1 })),
  aire: LENGTHS.map((u) => ({ unit: `${u}^2`, cells: 2 })),
  // 1 m³ = 1 kL ; 1 dm³ = 1 L (daL, hL à gauche) ; 1 cm³ = 1 mL (cL, dL à gauche).
  volume: [
    { unit: 'm^3', cells: 3, capacity: ['', '', 'kL'] },
    { unit: 'dm^3', cells: 3, capacity: ['hL', 'daL', 'L'] },
    { unit: 'cm^3', cells: 3, capacity: ['dL', 'cL', 'mL'] },
  ],
};

const TITLES: Record<ConversionKind, string> = {
  longueur: 'Tableau des longueurs',
  aire: 'Tableau des aires',
  volume: 'Tableau des volumes et contenances',
};

/** Tableau de conversion à remplir : on place les chiffres et la virgule comme sur le cahier. */
export function ConversionTable({ kind, onClose }: { readonly kind: ConversionKind; readonly onClose: () => void }) {
  const layout = LAYOUTS[kind];
  const total = layout.reduce((s, c) => s + c.cells, 0);
  const [digits, setDigits] = useState<(string | null)[]>(() => Array.from({ length: total }, () => null));
  const [comma, setComma] = useState<number | null>(null);
  const [selected, setSelected] = useState(0);

  const type = (d: string) => {
    setDigits((ds) => ds.map((v, i) => (i === selected ? d : v)));
    setSelected((s) => Math.min(total - 1, s + 1));
  };
  const keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let index = 0;
  return (
    <ToolPanel title={TITLES[kind]} onClose={onClose} wide>
      <p className="text-muted text-sm font-bold">
        Touche une case, écris un chiffre ; « Virgule » la place juste après la case choisie.
      </p>
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse">
          <thead>
            <tr>
              {layout.map((c) => (
                <th
                  key={c.unit}
                  colSpan={c.cells}
                  className="border-outline bg-accent border-2 px-2 py-1 text-lg text-white"
                >
                  <MathText text={c.unit} />
                </th>
              ))}
            </tr>
            {kind === 'volume' && (
              <tr>
                {layout.flatMap((c) =>
                  (c.capacity ?? []).map((u, k) => (
                    <th key={`${c.unit}${k}`} className="border-outline bg-surface-2 border-2 px-1 text-sm">
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
                        onClick={() => setSelected(i)}
                        aria-label={`Case ${i + 1}`}
                        aria-pressed={selected === i}
                        className={`font-display h-14 w-11 text-3xl ${selected === i ? 'bg-[color-mix(in_srgb,var(--primary)_25%,transparent)]' : ''}`}
                      >
                        {digits[i] ?? ''}
                      </button>
                      {comma === i && (
                        <span className="text-danger font-display absolute -right-1.5 bottom-0 text-3xl leading-none">
                          ,
                        </span>
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
        {keys.map((k) => (
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
          onClick={() => setComma((c) => (c === selected ? null : selected))}
          className="cartoon cartoon-press bg-danger font-display h-12 px-3 text-xl text-white"
        >
          Virgule
        </button>
        <button
          type="button"
          onClick={() => setDigits((ds) => ds.map((v, i) => (i === selected ? null : v)))}
          className="cartoon cartoon-press bg-surface-2 font-display h-12 px-3 text-xl"
        >
          Effacer
        </button>
        <button
          type="button"
          onClick={() => {
            setDigits(Array.from({ length: total }, () => null));
            setComma(null);
            setSelected(0);
          }}
          className="cartoon cartoon-press bg-surface-2 font-display h-12 px-3 text-xl"
        >
          Tout effacer
        </button>
      </div>
    </ToolPanel>
  );
}
