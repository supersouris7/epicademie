import { useState } from 'react';

export interface RadarAxis {
  readonly id: string;
  readonly label: string;
  /** Part de notions acquises (médaille d'or), de 0 à 1. */
  readonly value: number;
  /** Détail affiché au survol : « 4 notions en or sur 12 ». */
  readonly detail: string;
}

/** Toile plus large que haute : la place des noms de domaine à gauche et à droite. */
const W = 440;
const H = 330;
const CX = W / 2;
const CY = H / 2;
const R = 105;
const RINGS = [0.25, 0.5, 0.75, 1];

const point = (i: number, n: number, r: number) => {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
};

/**
 * Toile d'araignée des compétences : un axe par domaine, la surface dorée montre la part de notions
 * acquises (Or). Un seul ensemble de valeurs : pas de légende, le titre le nomme ; chaque axe porte
 * son nom et son pourcentage (jamais la couleur seule), le détail s'affiche au survol ou au toucher.
 */
export function SkillRadar({ axes, title }: { readonly axes: readonly RadarAxis[]; readonly title: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const n = axes.length;
  if (n < 3) return null;
  const shape = axes.map((ax, i) => point(i, n, R * Math.max(0.02, ax.value)).join(',')).join(' ');
  const active = axes.find((a) => a.id === hover);
  return (
    <figure className="cartoon bg-surface flex flex-col items-center gap-1 p-3">
      <figcaption className="font-display self-start text-xl tracking-wide">{title}</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-md"
        role="img"
        aria-label={`${title} : ${axes.map((a) => `${a.label} ${Math.round(a.value * 100)} %`).join(', ')}`}
      >
        {/* Grille discrète : anneaux à 25, 50, 75 et 100 %, rayons vers chaque domaine. */}
        {RINGS.map((k) => (
          <polygon
            key={k}
            points={axes.map((_, i) => point(i, n, R * k).join(',')).join(' ')}
            fill="none"
            stroke="var(--text-muted)"
            strokeOpacity={k === 1 ? 0.45 : 0.2}
            strokeWidth={1}
          />
        ))}
        {axes.map((ax, i) => {
          const [x, y] = point(i, n, R);
          return <line key={ax.id} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--text-muted)" strokeOpacity={0.2} />;
        })}
        <polygon
          points={shape}
          fill="var(--gold)"
          fillOpacity={0.28}
          stroke="var(--gold)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {axes.map((ax, i) => {
          const [x, y] = point(i, n, R * Math.max(0.02, ax.value));
          const [lx, ly] = point(i, n, R + 22);
          const anchor = Math.abs(lx - CX) < 8 ? 'middle' : lx < CX ? 'end' : 'start';
          const dy = Math.abs(lx - CX) < 8 ? (ly < CY ? -14 : 6) : -6;
          const on = hover === ax.id;
          return (
            <g
              key={ax.id}
              onPointerEnter={() => setHover(ax.id)}
              onPointerLeave={() => setHover(null)}
              onClick={() => setHover(on ? null : ax.id)}
              className="cursor-pointer"
            >
              {/* Zone de survol plus grande que le point. */}
              <circle cx={x} cy={y} r={16} fill="transparent" />
              <circle cx={x} cy={y} r={on ? 6 : 4.5} fill="var(--gold)" stroke="var(--surface)" strokeWidth={2} />
              <text
                x={lx}
                y={ly + dy}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="var(--text)"
                fontSize={13}
                fontWeight={800}
              >
                {ax.label}
              </text>
              <text
                x={lx}
                y={ly + dy + 15}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="var(--text-muted)"
                fontSize={12}
                fontWeight={700}
              >
                {Math.round(ax.value * 100)} %
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-muted min-h-6 text-sm font-bold" aria-live="polite">
        {active ? `${active.label} : ${active.detail}` : 'Touche un domaine pour voir le détail.'}
      </p>
    </figure>
  );
}
