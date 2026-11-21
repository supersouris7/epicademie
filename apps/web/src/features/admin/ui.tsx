import { useMemo, useState, type ReactNode } from 'react';

/**
 * Composants de la console d'administration : style « logiciel professionnel » (clair, dense,
 * lisible), indépendant du thème du jeu. Pensés pour des milliers de lignes : recherche, tri,
 * pagination.
 */

export function AdminButton({
  children,
  onClick,
  disabled,
  tone = 'default',
  type = 'button',
}: {
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly tone?: 'default' | 'primary' | 'danger';
  readonly type?: 'button' | 'submit';
}) {
  const tones = {
    default: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    primary: 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700',
    danger: 'border-red-200 bg-white text-red-700 hover:bg-red-50',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[4px]-[6px] border px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = 'slate',
}: {
  readonly children: ReactNode;
  readonly tone?: 'slate' | 'green' | 'amber' | 'red' | 'indigo';
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Panel({
  title,
  actions,
  children,
}: {
  readonly title: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="rounded-[4px]-[8px] border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2.5">
        <h2 className="flex-1 text-sm font-semibold text-slate-900">{title}</h2>
        {actions}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: ReactNode;
  readonly hint?: string;
}) {
  return (
    <div className="rounded-[4px]-[8px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{value}</dd>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export const inputClass =
  'rounded-[4px]-[6px] border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none';

/** Colonne d'un tableau : libellé, valeur affichée et clé de tri. */
export interface Column<T> {
  readonly key: string;
  readonly label: string;
  readonly render: (row: T) => ReactNode;
  readonly sort?: (row: T) => string | number;
  readonly align?: 'left' | 'right';
}

const PAGE_SIZE = 25;

/**
 * Tableau dense : recherche (texte libre), tri par colonne, pagination ; une ligne peut se
 * déplier (`detail`) pour les actions et le détail.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  detail,
  empty = 'Aucune donnée.',
  label,
}: {
  readonly rows: readonly T[];
  readonly columns: readonly Column<T>[];
  readonly rowKey: (row: T) => string;
  readonly searchText?: (row: T) => string;
  readonly detail?: (row: T) => ReactNode;
  readonly empty?: string;
  readonly label: string;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : [...rows];
    const col = sort && columns.find((c) => c.key === sort.key);
    if (col?.sort) {
      const by = col.sort;
      filtered.sort((a, b) => {
        const x = by(a);
        const y = by(b);
        return (x < y ? -1 : x > y ? 1 : 0) * (sort?.dir ?? 1);
      });
    }
    return filtered;
  }, [rows, query, sort, columns, searchText]);
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const slice = shown.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {searchText && (
          <input
            type="search"
            placeholder="Rechercher…"
            aria-label={`Rechercher dans ${label}`}
            className={`${inputClass} w-64`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        )}
        <span className="text-xs text-slate-500">
          {shown.length.toLocaleString('fr-FR')} ligne{shown.length > 1 ? 's' : ''}
          {shown.length !== rows.length && ` sur ${rows.length.toLocaleString('fr-FR')}`}
        </span>
      </div>
      <div className="overflow-x-auto rounded-[4px]-[6px] border border-slate-200">
        <table className="w-full text-left text-sm" aria-label={label}>
          <thead className="bg-slate-50 text-xs text-slate-600">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-3 py-2 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}
                >
                  {c.sort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                      onClick={() => setSort((s) => ({ key: c.key, dir: s?.key === c.key && s.dir === 1 ? -1 : 1 }))}
                    >
                      {c.label}
                      <span aria-hidden className="text-slate-400">
                        {sort?.key === c.key ? (sort.dir === 1 ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
              {detail && <th scope="col" className="w-10 px-3 py-2" aria-label="Détail" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length + (detail ? 1 : 0)} className="px-3 py-6 text-center text-slate-500">
                  {empty}
                </td>
              </tr>
            )}
            {slice.map((r) => {
              const k = rowKey(r);
              const isOpen = open === k;
              return [
                <tr key={k} className="hover:bg-slate-50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-2 align-top text-slate-800 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}
                    >
                      {c.render(r)}
                    </td>
                  ))}
                  {detail && (
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Replier' : 'Détail'}
                        onClick={() => setOpen(isOpen ? null : k)}
                        className="rounded-[4px] px-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        {isOpen ? '▾' : '▸'}
                      </button>
                    </td>
                  )}
                </tr>,
                detail && isOpen ? (
                  <tr key={`${k}-detail`} className="bg-slate-50/60">
                    <td colSpan={columns.length + 1} className="px-3 py-3">
                      {detail(r)}
                    </td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs text-slate-600">
          <AdminButton disabled={current === 0} onClick={() => setPage(current - 1)}>
            ← Précédent
          </AdminButton>
          <span>
            Page {current + 1} / {pages}
          </span>
          <AdminButton disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
            Suivant →
          </AdminButton>
        </div>
      )}
    </div>
  );
}
