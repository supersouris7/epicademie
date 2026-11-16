import { useEffect, useRef, useState, type PointerEvent } from 'react';

const COLORS = ['#1d1638', '#e6224b', '#4b3fe0', '#12b886'];

/** Ardoise transparente par-dessus la question : on écrit au doigt ou au stylet, rien n'est enregistré. */
export function Ardoise({ onClose }: { readonly onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0] ?? '#000');

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = window.innerWidth * ratio;
    c.height = window.innerHeight * ratio;
    const ctx = c.getContext('2d');
    ctx?.scale(ratio, ratio);
    document.body.dataset.toolOpen = 'true';
    return () => {
      delete document.body.dataset.toolOpen;
    };
  }, []);

  const ctx = () => canvas.current?.getContext('2d') ?? null;
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    const g = ctx();
    if (!g) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    g.strokeStyle = color;
    g.lineWidth = e.pointerType === 'pen' ? 2.5 + e.pressure * 2 : 4;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(e.clientX, e.clientY);
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const g = ctx();
    g?.lineTo(e.clientX, e.clientY);
    g?.stroke();
  };
  const up = () => {
    drawing.current = false;
  };
  const clear = () => {
    const c = canvas.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
  };

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Ardoise">
      <canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full touch-none bg-[color-mix(in_srgb,var(--surface)_35%,transparent)]"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <div className="cartoon bg-surface absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 p-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Couleur ${c}`}
            aria-pressed={color === c}
            className={`h-10 w-10 rounded-full border-4 ${color === c ? 'border-primary' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <button
          type="button"
          onClick={clear}
          className="cartoon cartoon-press bg-surface-2 font-display h-11 px-3 text-lg"
        >
          Effacer
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cartoon cartoon-press bg-accent font-display h-11 px-3 text-lg text-white"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
