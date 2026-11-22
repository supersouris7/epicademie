import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { c } from '../../../design/palette.ts';
import { BrouillonToolbar, type BrouillonMode } from './BrouillonToolbar.tsx';
import { COLORS, GRID, TEXT_SIZE, drawStroke, erasedBy, type Point, type Stroke } from './brouillonDraw.ts';

export type { Stroke };

interface BrouillonProps {
  readonly strokes: readonly Stroke[];
  readonly onChange: (strokes: readonly Stroke[]) => void;
  /** Mode pleine page (énoncé gardé en haut). */
  readonly expanded?: boolean;
  readonly onToggleExpand?: () => void;
}

/**
 * Brouillon à petits carreaux : stylo (3 couleurs), texte au clavier, gomme (efface trait par trait),
 * annuler, tout effacer.
 * Dès qu'un stylet est utilisé, les contacts au doigt sont ignorés (appui de la paume).
 */
export function Brouillon({ strokes, onChange, expanded, onToggleExpand }: BrouillonProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const current = useRef<Stroke | null>(null);
  const penSeen = useRef(false);
  const live = useRef(strokes);
  const [mode, setMode] = useState<BrouillonMode>('stylo');
  const [editing, setEditing] = useState<Stroke | null>(null);
  const edit = useRef<Stroke | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
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
    if (edit.current) drawStroke(g, edit.current, true);
  };

  useEffect(() => {
    live.current = strokes;
    redraw();
  });

  // Le clavier (virtuel compris) s'ouvre dès qu'un texte est commencé.
  const typing = editing !== null;
  useEffect(() => {
    if (typing) area.current?.focus();
  }, [typing]);

  const setEdit = (s: Stroke | null) => {
    edit.current = s;
    setEditing(s);
    redraw();
  };
  /** Valide le texte en cours : il rejoint les traits (donc annuler / gomme / effacer s'appliquent). */
  const commit = () => {
    const s = edit.current;
    edit.current = null;
    setEditing(null);
    if (s?.text?.trim()) onChange([...live.current, s]);
    else redraw();
  };
  const choose = (m: BrouillonMode) => {
    if (m !== 'texte') commit();
    setMode(m);
  };

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
    live.current = live.current.filter((s) => !erasedBy(s, pts));
    if (live.current.length !== before) redraw();
  };

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (ignore(e)) return;
    if (mode === 'texte') {
      e.preventDefault();
      commit();
      const [p] = pos(e);
      if (p) setEdit({ color, text: '', points: [[p[0], Math.max(0, p[1] - TEXT_SIZE / 2), 0.5]] });
      // Focus dans le geste de l'utilisateur : fait apparaître le clavier virtuel.
      area.current?.focus();
      return;
    }
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <BrouillonToolbar
        mode={mode}
        color={color}
        canClear={strokes.length > 0 || !!editing}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        onColor={(v) => {
          if (mode === 'gomme') setMode('stylo');
          if (mode === 'texte' && edit.current) setEdit({ ...edit.current, color: v });
          setColor(v);
        }}
        onMode={choose}
        onUndo={() => {
          if (edit.current) setEdit(null);
          else onChange(strokes.slice(0, -1));
        }}
        onClear={() => {
          setEdit(null);
          onChange([]);
        }}
      />
      <div
        ref={wrap}
        className="border-outline relative min-h-32 flex-1 overflow-hidden rounded-2xl border-4 bg-white"
        style={{
          backgroundImage: `linear-gradient(${c('violet-100')} 1px, transparent 1px), linear-gradient(90deg, ${c('violet-100')} 1px, transparent 1px)`,
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      >
        <canvas
          ref={canvas}
          className={`absolute inset-0 h-full w-full touch-none ${mode === 'gomme' ? 'cursor-cell' : mode === 'texte' ? 'cursor-text' : 'cursor-crosshair'}`}
          onMouseDown={(e) => mode === 'texte' && e.preventDefault()}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="Zone de brouillon : écris avec le doigt ou le stylet"
          role="img"
        />
        {editing && (
          <textarea
            ref={area}
            value={editing.text ?? ''}
            onChange={(e) => setEdit({ ...editing, text: e.target.value })}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') commit();
            }}
            aria-label="Saisie de texte du brouillon"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            rows={1}
            className="absolute w-8 resize-none overflow-hidden border-0 bg-transparent p-0 opacity-0 outline-none"
            style={{ left: editing.points[0]?.[0] ?? 0, top: editing.points[0]?.[1] ?? 0, fontSize: 16 }}
          />
        )}
      </div>
    </div>
  );
}
