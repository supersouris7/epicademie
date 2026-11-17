import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { c } from '../../design/palette.ts';

export type Point = readonly [x: number, y: number, pressure: number];
export interface Stroke {
  readonly color: string;
  readonly points: readonly Point[];
}

const COLORS = [
  { value: c('ink'), label: 'Noir' },
  { value: c('red-500'), label: 'Rouge' },
  { value: c('blue-500'), label: 'Bleu' },
];
/** 5 mm à 96 ppp ≈ 19 px : petits carreaux du cahier de maths. */
const GRID = 19;
const ERASER_RADIUS = 16;

const lineWidth = (p: number) => 2.2 + p * 2.2;

/** Trace un trait lissé : courbes quadratiques passant par les milieux des points successifs. */
function drawStroke(g: CanvasRenderingContext2D, s: Stroke) {
  const pts = s.points;
  const first = pts[0];
  if (!first) return;
  const avg = pts.reduce((sum, p) => sum + p[2], 0) / pts.length;
  g.strokeStyle = s.color;
  g.fillStyle = s.color;
  g.lineWidth = lineWidth(avg);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (pts.length < 3) {
    const last = pts[pts.length - 1] ?? first;
    g.beginPath();
    g.moveTo(first[0], first[1]);
    g.lineTo(last[0] + 0.01, last[1]);
    g.stroke();
    return;
  }
  g.beginPath();
  g.moveTo(first[0], first[1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i] ?? first;
    const q = pts[i + 1] ?? p;
    g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  const last = pts[pts.length - 1] ?? first;
  g.lineTo(last[0], last[1]);
  g.stroke();
}

interface BrouillonProps {
  readonly strokes: readonly Stroke[];
  readonly onChange: (strokes: readonly Stroke[]) => void;
}

/**
 * Brouillon à petits carreaux : stylo (3 couleurs), gomme (efface trait par trait), annuler, tout effacer.
 * Dès qu'un stylet est utilisé, les contacts au doigt sont ignorés (appui de la paume).
 */
export function Brouillon({ strokes, onChange }: BrouillonProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const current = useRef<Stroke | null>(null);
  const penSeen = useRef(false);
  const live = useRef(strokes);
  const [mode, setMode] = useState<'stylo' | 'gomme'>('stylo');
  const [color, setColor] = useState(COLORS[0]?.value ?? c('ink'));

  const redraw = () => {
    const c = canvas.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    const ratio = window.devicePixelRatio || 1;
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    for (const s of live.current) drawStroke(g, s);
    if (current.current) drawStroke(g, current.current);
  };

  useEffect(() => {
    live.current = strokes;
    redraw();
  });

  // Taille du canevas = taille du panneau (suit la rotation de la tablette).
  useEffect(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      c.width = Math.round(el.clientWidth * ratio);
      c.height = Math.round(el.clientHeight * ratio);
      redraw();
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const pos = (e: PointerEvent<HTMLCanvasElement>): Point[] => {
    const r = e.currentTarget.getBoundingClientRect();
    const events = typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [];
    const list = events.length ? events : [e.nativeEvent];
    return list.map(
      (ev) => [ev.clientX - r.left, ev.clientY - r.top, ev.pointerType === 'pen' ? ev.pressure || 0.5 : 0.5] as const,
    );
  };

  const ignore = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'pen') penSeen.current = true;
    return !e.isPrimary || (penSeen.current && e.pointerType === 'touch');
  };

  const eraseAt = (pts: Point[]) => {
    const before = live.current.length;
    live.current = live.current.filter(
      (s) => !s.points.some((p) => pts.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < ERASER_RADIUS)),
    );
    if (live.current.length !== before) redraw();
  };

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (ignore(e)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (mode === 'gomme') {
      eraseAt(pos(e));
      current.current = { color: 'gomme', points: [] };
      return;
    }
    current.current = { color, points: pos(e) };
    redraw();
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!current.current || ignore(e)) return;
    if (mode === 'gomme') {
      eraseAt(pos(e));
      return;
    }
    current.current = { ...current.current, points: [...current.current.points, ...pos(e)] };
    redraw();
  };
  const up = () => {
    const s = current.current;
    current.current = null;
    if (!s) return;
    onChange(s.color === 'gomme' ? live.current : [...live.current, s]);
  };

  const btn = 'cartoon cartoon-press font-display flex h-11 min-w-11 items-center justify-center px-3 text-base';
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Outils du brouillon">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setMode('stylo');
              setColor(c.value);
            }}
            aria-label={`Stylo ${c.label.toLowerCase()}`}
            aria-pressed={mode === 'stylo' && color === c.value}
            className={`h-11 w-11 rounded-full border-4 ${mode === 'stylo' && color === c.value ? 'border-primary' : 'border-outline/30'}`}
            style={{ backgroundColor: c.value }}
          />
        ))}
        <button
          type="button"
          onClick={() => setMode('gomme')}
          aria-pressed={mode === 'gomme'}
          className={`${btn} ${mode === 'gomme' ? 'bg-accent text-white' : 'bg-surface'}`}
        >
          Gomme
        </button>
        <button
          type="button"
          onClick={() => onChange(strokes.slice(0, -1))}
          disabled={strokes.length === 0}
          className={`${btn} bg-surface disabled:opacity-40`}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          disabled={strokes.length === 0}
          className={`${btn} bg-surface disabled:opacity-40`}
        >
          Tout effacer
        </button>
      </div>
      <div
        ref={wrap}
        className="border-outline relative min-h-48 flex-1 overflow-hidden rounded-2xl border-4 bg-white"
        style={{
          backgroundImage: `linear-gradient(${c('violet-100')} 1px, transparent 1px), linear-gradient(90deg, ${c('violet-100')} 1px, transparent 1px)`,
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      >
        <canvas
          ref={canvas}
          className={`absolute inset-0 h-full w-full touch-none ${mode === 'gomme' ? 'cursor-cell' : 'cursor-crosshair'}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="Zone de brouillon : écris avec le doigt ou le stylet"
          role="img"
        />
      </div>
    </div>
  );
}
