import type { ReactNode } from 'react';
import { mutedClass, tableClass, tdClass, thClass } from './ui.tsx';

/**
 * Graphiques de la console en SVG pur (aucune dépendance). Chaque graphique est décrit en texte
 * (`aria-label`, légende) et ses valeurs sont aussi données dans un tableau repliable.
 */

export interface Point {
  readonly label: string;
  readonly value: number;
}

const W = 600;
const H = 180;
const PAD = { left: 32, right: 8, top: 8, bottom: 22 } as const;

const shortDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const nb = (n: number) => n.toLocaleString('fr-FR');

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

function Frame({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${summary}`} className="h-auto w-full">
      {children}
    </svg>
  );
}

/** Repères communs : 3 lignes (0, moitié, max) et premier/dernier jour. */
function Axes({ max, points }: { max: number; points: readonly Point[] }) {
  const innerH = H - PAD.top - PAD.bottom;
  const first = points[0];
  const last = points.at(-1);
  return (
    <g fontSize="11" fill="var(--color-pilot-mut)">
      {[0, max / 2, max].map((t) => {
        const y = PAD.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--color-pilot-line)" strokeWidth="1" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end">
              {nb(Math.round(t * 10) / 10)}
            </text>
          </g>
        );
      })}
      {first && (
        <text x={PAD.left} y={H - 6}>
          {shortDay(first.label)}
        </text>
      )}
      {last && (
        <text x={W - PAD.right} y={H - 6} textAnchor="end">
          {shortDay(last.label)}
        </text>
      )}
    </g>
  );
}

const maxOf = (points: readonly Point[]) => Math.max(1, ...points.map((p) => p.value));

/** Barres : une par jour (comptes créés). */
export function BarChart({
  title,
  unit,
  points,
}: {
  readonly title: string;
  readonly unit: string;
  readonly points: readonly Point[];
}) {
  const max = maxOf(points);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = innerW / Math.max(points.length, 1);
  const total = points.reduce((s, p) => s + p.value, 0);
  const summary = `${nb(total)} ${unit} sur ${points.length} jours, maximum ${nb(max)} par jour.`;
  return (
    <figure>
      <Frame title={title} summary={summary}>
        <Axes max={max} points={points} />
        {points.map((p, i) => {
          const h = (p.value / max) * innerH;
          return (
            <rect
              key={p.label}
              x={PAD.left + i * step + step * 0.15}
              y={PAD.top + innerH - h}
              width={step * 0.7}
              height={h}
              fill="var(--color-pilot-acc)"
            >
              <title>{`${shortDay(p.label)} : ${nb(p.value)}`}</title>
            </rect>
          );
        })}
      </Frame>
      <figcaption className={mutedClass}>{summary}</figcaption>
      <Values caption={title} head={unit} points={points} />
    </figure>
  );
}

/** Courbe : évolution dans le temps (abonnements actifs). */
export function LineChart({
  title,
  unit,
  points,
}: {
  readonly title: string;
  readonly unit: string;
  readonly points: readonly Point[];
}) {
  const max = maxOf(points);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? 0 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const last = points.at(-1)?.value ?? 0;
  const summary = `${nb(last)} ${unit} aujourd’hui, maximum ${nb(max)} sur ${points.length} jours.`;
  return (
    <figure>
      <Frame title={title} summary={summary}>
        <Axes max={max} points={points} />
        <path d={path} fill="none" stroke="var(--color-pilot-ok)" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={p.label} cx={x(i)} cy={y(p.value)} r="2.5" fill="var(--color-pilot-ok)">
            <title>{`${shortDay(p.label)} : ${nb(p.value)}`}</title>
          </circle>
        ))}
      </Frame>
      <figcaption className={mutedClass}>{summary}</figcaption>
      <Values caption={title} head={unit} points={points} />
    </figure>
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
