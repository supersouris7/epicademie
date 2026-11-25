import { useMemo, useState, type ReactNode } from 'react';
import { segmentClass, segmentedClass } from './segments.ts';
import { useIsPhone } from './useIsPhone.ts';

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
    primary: 'border-pilot-acc bg-pilot-acc text-pilot-bg hover:brightness-110',
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

export interface Choice<V extends string> {
  readonly value: V;
  readonly label: string;
  /** Compteur affiché à côté du libellé. */
  readonly count?: number | undefined;
}

/** Sélecteur segmenté (comme la page de pilotage) : le choix actif en violet, texte sombre. */
export function Segmented<V extends string>({
  label,
  choices,
  value,
  onChange,
}: {
  readonly label: string;
  readonly choices: readonly Choice<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
}) {
  return (
    <div role="group" aria-label={label} className={`${segmentedClass} flex flex-wrap`}>
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          aria-pressed={value === c.value}
          onClick={() => onChange(c.value)}
          className={`${segmentClass(value === c.value)} flex-auto whitespace-nowrap`}
        >
          {c.label} {c.count !== undefined && <span className="ml-0.5 tabular-nums">{c.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Contenu d'une carte de liste sur téléphone : un titre, deux informations, un badge. */
export interface CardContent {
  readonly title: ReactNode;
  readonly infos: readonly [ReactNode, ReactNode];
  readonly badge?: ReactNode;
}

/** Carte d'une ligne : entièrement touchable quand elle ouvre quelque chose. */
export function RowCard({
  content: { title, infos, badge },
  onClick,
  expanded,
}: {
  readonly content: CardContent;
  readonly onClick?: (() => void) | undefined;
  readonly expanded?: boolean | undefined;
}) {
  const className = `${innerCardClass} flex w-full items-center gap-2 p-3 text-left text-sm`;
  const body = (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
        <span className="font-semibold">{title}</span>
        <span className="text-pilot-mut">{infos[0]}</span>
        <span className="text-pilot-mut">{infos[1]}</span>
      </span>
      {badge && <span className="shrink-0">{badge}</span>}
    </>
  );
  if (!onClick) return <div className={className}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`${className} cursor-pointer hover:border-pilot-acc`}
    >
      {body}
      <span aria-hidden className="shrink-0 text-pilot-mut">
        {expanded ? '▾' : '▸'}
      </span>
    </button>
  );
}

export const inputClass =
  'max-w-full rounded-[8px] border border-pilot-line bg-pilot-bg px-2.5 py-1.5 text-sm text-pilot-fg focus:border-pilot-acc focus:ring-2 focus:ring-pilot-acc/40 focus:outline-none';

/* Styles partagés, repris de la page de pilotage. */
export const cardClass = 'rounded-[12px] border border-pilot-line bg-pilot-card';
/** Même carte, posée dans un panneau (fond de page pour la détacher). */
export const innerCardClass = 'rounded-[12px] border border-pilot-line bg-pilot-bg';
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
 * Liste dense : recherche (texte libre), tri par colonne, pagination ; une ligne peut se déplier
 * (`detail`) pour les actions et le détail. Avec `card`, elle devient une liste de cartes sur
 * téléphone.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  detail,
  card,
  empty = 'Aucune donnée.',
  label,
}: {
  readonly rows: readonly T[];
  readonly columns: readonly Column<T>[];
  readonly rowKey: (row: T) => string;
  readonly searchText?: (row: T) => string;
  readonly detail?: (row: T) => ReactNode;
  readonly card?: (row: T) => CardContent;
  readonly empty?: string;
  readonly label: string;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort | null>(null);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const phone = useIsPhone();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : [...rows];
    return sortRows(filtered, columns, sort);
  }, [rows, query, sort, columns, searchText]);
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const body: BodyProps<T> = {
    rows: shown.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE),
    rowKey,
    detail,
    empty,
    label,
    open,
    toggle: (key) => setOpen(open === key ? null : key),
  };
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
      {phone && card ? (
        <CardList {...body} card={card} />
      ) : (
        <TableView
          {...body}
          columns={columns}
          sort={sort}
          onSort={(key) => setSort((s) => ({ key, dir: s?.key === key && s.dir === 1 ? -1 : 1 }))}
        />
      )}
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

interface Sort {
  readonly key: string;
  readonly dir: 1 | -1;
}

function sortRows<T>(rows: T[], columns: readonly Column<T>[], sort: Sort | null): T[] {
  const by = sort && columns.find((c) => c.key === sort.key)?.sort;
  if (!by) return rows;
  return rows.sort((a, b) => {
    const x = by(a);
    const y = by(b);
    return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
  });
}

interface BodyProps<T> {
  readonly rows: readonly T[];
  readonly rowKey: (row: T) => string;
  readonly detail: ((row: T) => ReactNode) | undefined;
  readonly empty: string;
  readonly label: string;
  readonly open: string | null;
  readonly toggle: (key: string) => void;
}

function CardList<T>({
  rows,
  rowKey,
  detail,
  empty,
  label,
  open,
  toggle,
  card,
}: BodyProps<T> & { readonly card: (row: T) => CardContent }) {
  if (rows.length === 0) return <p className={mutedClass}>{empty}</p>;
  return (
    <ul aria-label={label} className="flex flex-col gap-2">
      {rows.map((r) => {
        const k = rowKey(r);
        const isOpen = open === k;
        return (
          <li key={k} className="flex min-w-0 flex-col gap-2">
            <RowCard content={card(r)} onClick={detail && (() => toggle(k))} expanded={detail ? isOpen : undefined} />
            {detail && isOpen && <div className="min-w-0 px-1 pb-2 [overflow-wrap:anywhere]">{detail(r)}</div>}
          </li>
        );
      })}
    </ul>
  );
}

function TableView<T>({
  rows,
  rowKey,
  detail,
  empty,
  label,
  open,
  toggle,
  columns,
  sort,
  onSort,
}: BodyProps<T> & {
  readonly columns: readonly Column<T>[];
  readonly sort: Sort | null;
  readonly onSort: (key: string) => void;
}) {
  return (
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
                    onClick={() => onSort(c.key)}
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
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (detail ? 1 : 0)}
                className="border-t border-pilot-line px-2 py-6 text-center text-pilot-mut"
              >
                {empty}
              </td>
            </tr>
          )}
          {rows.map((r) => {
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
                      onClick={() => toggle(k)}
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
  );
}
