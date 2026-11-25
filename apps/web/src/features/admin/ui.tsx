import { useMemo, useState, type ReactNode } from 'react';

/**
 * Composants de la console d'administration, au thème de la page de pilotage (sombre, dense,
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
    default: 'border-pilot-line text-pilot-fg hover:border-pilot-acc',
    primary: 'border-pilot-acc bg-pilot-acc text-white hover:brightness-110',
    danger: 'border-pilot-bad/50 text-pilot-bad hover:border-pilot-bad',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer rounded-full border px-3.5 py-1 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
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
    slate: 'bg-pilot-line text-pilot-fg',
    green: 'bg-pilot-ok/15 text-pilot-ok',
    amber: 'bg-pilot-warn/15 text-pilot-warn',
    red: 'bg-pilot-bad/15 text-pilot-bad',
    indigo: 'bg-pilot-acc/20 text-pilot-acc',
  };
  return (
    <span className={`inline-flex items-center rounded-[10px] px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
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
    <section className={`${cardClass} min-w-0 px-3.5 py-3`}>
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className={titleClass}>{title}</h2>
        {actions}
      </header>
      {children}
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
    <div className={`${cardClass} px-3 py-2.5`}>
      <dt className="text-sm text-pilot-mut">{label}</dt>
      <dd className="text-2xl font-bold tabular-nums">{value}</dd>
      {hint && <dd className="text-sm text-pilot-mut">{hint}</dd>}
    </div>
  );
}

export const inputClass =
  'max-w-full rounded-[8px] border border-pilot-line bg-pilot-bg px-2.5 py-1.5 text-sm text-pilot-fg focus:border-pilot-acc focus:ring-2 focus:ring-pilot-acc/40 focus:outline-none';

/* Styles partagés, repris de la page de pilotage. */
export const cardClass = 'rounded-[12px] border border-pilot-line bg-pilot-card';
export const titleClass = 'text-[1.1rem] font-bold';
export const tableClass = 'w-full text-left text-sm';
export const thClass = 'px-2 py-1.5 font-semibold text-pilot-mut';
export const tdClass = 'border-t border-pilot-line px-2 py-1.5 align-top';
export const mutedClass = 'text-sm text-pilot-mut';
export const errorClass = 'text-sm text-pilot-bad';

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
        <span className={mutedClass}>
          {shown.length.toLocaleString('fr-FR')} ligne{shown.length > 1 ? 's' : ''}
          {shown.length !== rows.length && ` sur ${rows.length.toLocaleString('fr-FR')}`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className={tableClass} aria-label={label}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`${thClass} ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.sort ? (
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1 hover:text-pilot-fg"
                      onClick={() => setSort((s) => ({ key: c.key, dir: s?.key === c.key && s.dir === 1 ? -1 : 1 }))}
                    >
                      {c.label}
                      <span aria-hidden className="opacity-70">
                        {sort?.key === c.key ? (sort.dir === 1 ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
              {detail && <th scope="col" className="w-10 px-2 py-1.5" aria-label="Détail" />}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (detail ? 1 : 0)}
                  className="border-t border-pilot-line px-2 py-6 text-center text-pilot-mut"
                >
                  {empty}
                </td>
              </tr>
            )}
            {slice.map((r) => {
              const k = rowKey(r);
              const isOpen = open === k;
              return [
                <tr key={k} className="hover:bg-pilot-line/40">
                  {columns.map((c) => (
                    <td key={c.key} className={`${tdClass} ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                      {c.render(r)}
                    </td>
                  ))}
                  {detail && (
                    <td className={`${tdClass} text-right`}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Replier' : 'Détail'}
                        onClick={() => setOpen(isOpen ? null : k)}
                        className="cursor-pointer rounded-full px-2 text-pilot-mut hover:bg-pilot-line"
                      >
                        {isOpen ? '▾' : '▸'}
                      </button>
                    </td>
                  )}
                </tr>,
                detail && isOpen ? (
                  <tr key={`${k}-detail`} className="bg-pilot-bg/60">
                    <td colSpan={columns.length + 1} className="border-t border-pilot-line px-3 py-3">
                      {/* Le détail reste lisible sur téléphone, même quand le tableau défile. */}
                      <div className="sticky left-3 max-w-[calc(100vw-5rem)]">{detail(r)}</div>
                    </td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className={`flex items-center justify-end gap-2 ${mutedClass}`}>
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
