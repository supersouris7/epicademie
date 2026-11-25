import type { ReactNode } from 'react';
import { nb, plural } from './labels.ts';
import { integerTicks } from './ticks.ts';
import { mutedClass, tableClass, tdClass, thClass } from './ui.tsx';

/**
 * Graphiques de la console sans dépendance : tracé en SVG étiré à la largeur disponible, textes en
 * HTML (jamais mis à l'échelle : 12 px au moins, même sur téléphone). Chaque graphique est décrit
 * en texte (`aria-label`, légende) et ses valeurs sont aussi données dans un tableau repliable.
 */

export interface Point {
  readonly label: string;
  readonly value: number;
}

/** Nom de ce qu'on compte, pour accorder les phrases. */
export interface Unit {
  readonly one: string;
  readonly many: string;
}

/** Repère de dessin (unités du SVG, indépendantes de la taille affichée). */
const W = 600;
const H = 150;
const PAD = 4;

const shortDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

const yOf = (value: number, top: number) => H - PAD - (value / top) * (H - 2 * PAD);

function Values({ caption, head, points }: { caption: string; head: string; points: readonly Point[] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-semibold text-pilot-acc">Voir les valeurs</summary>
      <div className="mt-2 max-h-48 overflow-auto">
        <table className={tableClass}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={thClass}>
                Jour
              </th>
              <th scope="col" className={`${thClass} text-right`}>
                {head}
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <th scope="row" className={`${tdClass} font-normal`}>
                  {shortDay(p.label)}
                </th>
                <td className={`${tdClass} text-right tabular-nums`}>{nb(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Cadre commun : axe vertical, lignes de repère, premier et dernier jour. */
function Chart({
  title,
  head,
  summary,
  points,
  ticks,
  children,
}: {
  readonly title: string;
  readonly head: string;
  readonly summary: string;
  readonly points: readonly Point[];
  readonly ticks: readonly number[];
  readonly children: ReactNode;
}) {
  const top = ticks.at(-1) ?? 1;
  return (
    <figure>
      <div className="flex gap-2 text-xs text-pilot-mut tabular-nums">
        <div aria-hidden="true" className="relative h-40 shrink-0">
          {/* Largeur réservée par le plus grand repère. */}
          <span className="invisible">{nb(top)}</span>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(yOf(t, top) / H) * 100}%` }}>
              {nb(t)}
            </span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${title}. ${summary}`}
          className="h-40 min-w-0 flex-1 overflow-visible"
        >
          {ticks.map((t) => (
            <line
              key={t}
              x1={0}
              x2={W}
              y1={yOf(t, top)}
              y2={yOf(t, top)}
              stroke="var(--color-pilot-line)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {children}
        </svg>
      </div>
      <div aria-hidden="true" className="flex justify-between pl-6 text-xs text-pilot-mut">
        <span>{points[0] && shortDay(points[0].label)}</span>
        <span>{shortDay(points.at(-1)?.label ?? '')}</span>
      </div>
      <figcaption className={`mt-1 ${mutedClass}`}>{summary}</figcaption>
      <Values caption={title} head={head} points={points} />
    </figure>
  );
}

const maxOf = (points: readonly Point[]) => Math.max(0, ...points.map((p) => p.value));

/** Barres : une par jour (comptes créés). */
export function BarChart({
  title,
  unit,
  points,
}: {
  readonly title: string;
  readonly unit: Unit;
  readonly points: readonly Point[];
}) {
  const max = maxOf(points);
  const ticks = integerTicks(max);
  const top = ticks.at(-1) ?? 1;
  const step = W / Math.max(points.length, 1);
  const total = points.reduce((s, p) => s + p.value, 0);
  const summary = `${plural(total, unit.one, unit.many)} sur ${points.length} jours, maximum ${nb(max)} par jour.`;
  return (
    <Chart title={title} head={unit.many} summary={summary} points={points} ticks={ticks}>
      {points.map((p, i) => (
        <rect
          key={p.label}
          x={i * step + step * 0.15}
          y={yOf(p.value, top)}
          width={step * 0.7}
          height={H - PAD - yOf(p.value, top)}
          fill="var(--color-pilot-acc)"
        >
          <title>{`${shortDay(p.label)} : ${nb(p.value)}`}</title>
        </rect>
      ))}
    </Chart>
  );
}

/** Courbe : évolution dans le temps (abonnements actifs). */
export function LineChart({
  title,
  unit,
  points,
}: {
  readonly title: string;
  readonly unit: Unit;
  readonly points: readonly Point[];
}) {
  const max = maxOf(points);
  const ticks = integerTicks(max);
  const top = ticks.at(-1) ?? 1;
  const x = (i: number) => (points.length <= 1 ? 0 : (i / (points.length - 1)) * W);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${yOf(p.value, top).toFixed(1)}`)
    .join(' ');
  const last = points.at(-1)?.value ?? 0;
  const summary = `${plural(last, unit.one, unit.many)} aujourd’hui, maximum ${nb(max)} sur ${points.length} jours.`;
  return (
    <Chart title={title} head={unit.many} summary={summary} points={points} ticks={ticks}>
      <path
        d={path}
        fill="none"
        stroke="var(--color-pilot-ok)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Points : traits de longueur nulle à bouts ronds, qui restent ronds malgré l'étirement. */}
      {points.map((p, i) => (
        <path
          key={p.label}
          d={`M${x(i).toFixed(1)} ${yOf(p.value, top).toFixed(1)}h0`}
          stroke="var(--color-pilot-ok)"
          strokeWidth="6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        >
          <title>{`${shortDay(p.label)} : ${nb(p.value)}`}</title>
        </path>
      ))}
    </Chart>
  );
}

/** Répartition : une barre horizontale par catégorie, la valeur est écrite à côté. */
export function ShareChart({ title, points }: { readonly title: string; readonly points: readonly Point[] }) {
  const total = points.reduce((s, p) => s + p.value, 0);
  return (
    <figure aria-label={title}>
      <ul className="flex flex-col gap-3">
        {points.map((p) => (
          <li key={p.label}>
            <div className="flex justify-between text-sm">
              <span>{p.label}</span>
              <span className="tabular-nums">
                {nb(p.value)} ({total === 0 ? 0 : Math.round((p.value / total) * 100)} %)
              </span>
            </div>
            <div
              className="mt-1 h-3.5 overflow-hidden rounded-full border border-pilot-line bg-pilot-bg"
              aria-hidden="true"
            >
              <div className="h-full bg-pilot-acc" style={{ width: `${total === 0 ? 0 : (p.value / total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
