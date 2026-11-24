import { useCallback, useState, type KeyboardEvent } from 'react';
import { MAP_CREDIT, zoneName, type Question, type Response } from '@epicademie/content';
import { Carte } from './figures/cartes/Carte.tsx';
import { useFond } from './figures/cartes/useFond.ts';
import { neighbour } from './figures/cartes/geometrie.ts';
import { SubmitKey } from './NumPad.tsx';

type Spec = Extract<Question['answer'], { kind: 'zone' }>;

interface Props {
  readonly spec: Spec;
  readonly disabled: boolean;
  readonly onSubmit: (r: Response) => void;
  readonly onUnknown?: () => void;
}

const ZOOMS = [1, 2, 4] as const;
const ARROWS: Record<string, readonly [number, number]> = {
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0],
  ArrowDown: [0, 1],
  ArrowUp: [0, -1],
};

/**
 * Réponse « zone » : on touche la bonne zone de la carte, puis OK. Au clavier et à la télécommande, les flèches
 * passent d'une zone à sa voisine, OK/Entrée choisit la zone (une 2e fois : valide). Les boutons ＋/－ rapprochent
 * la carte pour atteindre les petites zones (départements).
 */
export function ZoneAnswer({ spec, disabled, onSubmit, onUnknown }: Props) {
  const fond = useFond(spec.map);
  const [picked, setPicked] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [zoomAt, setZoomAt] = useState(0);
  const submit = useCallback(() => {
    if (picked && !disabled) onSubmit({ kind: 'zone', zone: picked });
  }, [picked, disabled, onSubmit]);
  const pick = (zone: string) => {
    setPicked(zone);
    setFocused(zone);
  };
  const onKey = (e: KeyboardEvent, zone: string) => {
    if (disabled || !fond) return;
    const dir = ARROWS[e.key];
    if (dir) {
      const next = neighbour(fond, zone, dir);
      e.preventDefault();
      if (next) {
        setFocused(next);
        queueMicrotask(() => document.querySelector<SVGElement>(`[data-zone="${next}"]`)?.focus());
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (picked === zone) submit();
      else pick(zone);
    }
  };
  const focusZone = focused ?? picked ?? fond?.zones[0]?.id ?? null;
  const centre = fond?.zones.find((z) => z.id === (focused ?? picked));
  const zoom = ZOOMS[zoomAt] ?? 1;
  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-2 overflow-y-auto">
      <p className="text-muted text-center text-lg font-bold">Touche la bonne zone de la carte, puis OK.</p>
      {fond ? (
        <div className="w-full max-w-3xl">
          <Carte
            map={spec.map}
            fond={fond}
            picked={picked}
            focused={focusZone}
            onZone={pick}
            onZoneKey={onKey}
            disabled={disabled}
            view={{ cx: centre?.c[0] ?? fond.w / 2, cy: centre?.c[1] ?? fond.h / 2, zoom }}
          />
          <p className="text-muted mt-1 text-xs italic">{MAP_CREDIT[spec.map]}</p>
        </div>
      ) : (
        <p role="status" className="text-muted py-6 font-bold">
          Chargement de la carte…
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={disabled || zoomAt === 0}
          aria-label="Éloigner la carte"
          onClick={() => setZoomAt((z) => Math.max(0, z - 1))}
          className="cartoon cartoon-press bg-surface-2 font-display min-h-14 w-14 text-3xl disabled:opacity-40"
        >
          −
        </button>
        <button
          type="button"
          disabled={disabled || zoomAt === ZOOMS.length - 1}
          aria-label="Rapprocher la carte"
          onClick={() => setZoomAt((z) => Math.min(ZOOMS.length - 1, z + 1))}
          className="cartoon cartoon-press bg-surface-2 font-display min-h-14 w-14 text-3xl disabled:opacity-40"
        >
          ＋
        </button>
        <p className="min-w-40 text-center text-lg font-bold" aria-live="polite">
          {picked ? <>Ton choix : {zoneName(spec.map, picked)}</> : <span className="text-muted">Rien de choisi</span>}
        </p>
        <SubmitKey
          className="cartoon cartoon-press font-display min-h-14 w-24 text-2xl"
          canSubmit={!disabled && picked !== null}
          onSubmit={submit}
          onUnknown={picked === null ? onUnknown : undefined}
        />
      </div>
    </div>
  );
}
