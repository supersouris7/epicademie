import type { KeyboardEvent } from 'react';
import { MAP_TITLE, type MapId, zoneName } from '@epicademie/content';
import { viewBoxOf } from './geometrie.ts';
import type { FondCarte, VueCarte, ZoneFond } from './types.ts';

/** État d'une zone pour le dessin. */
export interface CarteProps {
  readonly map: MapId;
  readonly fond: FondCarte;
  readonly highlight?: readonly string[];
  readonly marks?: readonly { readonly zone: string; readonly label: string }[];
  /** Zone choisie par l'élève. */
  readonly picked?: string | null;
  /** Zone qui a le focus clavier (télécommande). */
  readonly focused?: string | null;
  /** Rend les zones touchables (réponse « zone »). */
  readonly onZone?: (zone: string) => void;
  readonly onZoneKey?: (e: KeyboardEvent, zone: string) => void;
  /** Cadrage (zoom) : centre et facteur. */
  readonly view?: VueCarte;
  readonly disabled?: boolean;
}

const LAND = 'var(--surface)';
const SEA = 'color-mix(in srgb, var(--primary) 16%, var(--surface))';
const BACK = 'color-mix(in srgb, var(--text) 14%, var(--surface-2))';

function fillOf(z: ZoneFond, p: CarteProps): string {
  if (p.picked === z.id) return 'var(--primary)';
  if (p.highlight?.includes(z.id)) return 'var(--accent)';
  return z.k === 'sea' ? SEA : LAND;
}

function Zone({ z, p }: { readonly z: ZoneFond; readonly p: CarteProps }) {
  const interactive = p.onZone !== undefined;
  const focusRing = p.focused === z.id;
  const common = interactive
    ? {
        role: 'button' as const,
        tabIndex: focusRing ? 0 : -1,
        'aria-label': zoneName(p.map, z.id) ?? z.id,
        'aria-pressed': p.picked === z.id,
        'aria-disabled': p.disabled,
        'data-zone': z.id,
        onClick: () => !p.disabled && p.onZone?.(z.id),
        onKeyDown: (e: KeyboardEvent) => p.onZoneKey?.(e, z.id),
        style: { cursor: p.disabled ? 'default' : 'pointer', outline: 'none' },
      }
    : { 'data-zone': z.id };
  if (z.k === 'river') {
    const on = p.picked === z.id || p.highlight?.includes(z.id) === true;
    return (
      <g>
        <path
          d={z.d}
          fill="none"
          stroke={p.picked === z.id ? 'var(--primary)' : on ? 'var(--accent)' : 'var(--text)'}
          strokeWidth={on ? 4 : 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
          aria-hidden
        />
        <path
          d={z.d}
          fill="none"
          stroke={focusRing ? 'var(--accent)' : 'transparent'}
          strokeOpacity={focusRing ? 0.5 : 1}
          strokeWidth={focusRing ? 9 : 16}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents={interactive ? 'stroke' : 'none'}
          {...common}
        />
      </g>
    );
  }
  const fill = fillOf(z, p);
  // Continents : le contour est dessiné une fois sous l'ensemble (voir Carte) ; ici, la couleur couvre les
  // frontières entre pays d'un même continent.
  const land = z.k === 'land';
  return (
    <path
      d={z.d}
      fill={fill}
      fillRule="evenodd"
      stroke={focusRing ? 'var(--accent)' : land ? fill : 'var(--text)'}
      strokeWidth={focusRing ? 3.5 : land ? 1.6 : 1}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      {...common}
    />
  );
}

/** Carte SVG : fond, zones (surlignées, choisies ou touchables) et repères. */
export function Carte(p: CarteProps) {
  const { fond } = p;
  const r = Math.round(fond.w / 62);
  const lands = fond.zones.filter((z) => z.k === 'land');
  return (
    <svg
      viewBox={viewBoxOf(fond, p.view)}
      role={p.onZone ? 'group' : 'img'}
      aria-label={MAP_TITLE[p.map]}
      className="mx-auto block h-auto w-full touch-manipulation select-none"
      style={{ background: SEA, borderRadius: '0.75rem' }}
    >
      {fond.back && (
        <path
          d={fond.back}
          fill={BACK}
          fillRule="evenodd"
          stroke="var(--text)"
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {fond.zones
        .filter((z) => z.k === 'sea')
        .map((z) => (
          <Zone key={z.id} z={z} p={p} />
        ))}
      {lands.map((z) => (
        <path
          key={`halo-${z.id}`}
          d={z.d}
          fill="var(--text)"
          fillRule="evenodd"
          stroke="var(--text)"
          strokeWidth={3}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
          aria-hidden
        />
      ))}
      {fond.zones
        .filter((z) => z.k !== 'sea' && z.k !== 'river')
        .map((z) => (
          <Zone key={z.id} z={z} p={p} />
        ))}
      {fond.zones
        .filter((z) => z.k === 'river')
        .map((z) => (
          <Zone key={z.id} z={z} p={p} />
        ))}
      {(p.marks ?? []).map((m) => {
        const z = fond.zones.find((x) => x.id === m.zone);
        if (!z) return null;
        return (
          <g key={m.zone} pointerEvents="none" aria-hidden>
            <circle cx={z.c[0]} cy={z.c[1]} r={r} fill="var(--text)" stroke="var(--surface)" strokeWidth={2} />
            <text
              x={z.c[0]}
              y={z.c[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={r * 1.25}
              fontWeight="bold"
              fill="var(--surface)"
            >
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
