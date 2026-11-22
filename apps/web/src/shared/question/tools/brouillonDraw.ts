import { c } from '../../../design/palette.ts';

export type Point = readonly [x: number, y: number, pressure: number];
export interface Stroke {
  readonly color: string;
  readonly points: readonly Point[];
  /** Présent pour un texte tapé au clavier : `points[0]` est son coin haut-gauche. */
  readonly text?: string;
}

export const COLORS = [
  { value: c('ink'), label: 'Noir' },
  { value: c('red-500'), label: 'Rouge' },
  { value: c('blue-500'), label: 'Bleu' },
];
/** 5 mm à 96 ppp ≈ 19 px : petits carreaux du cahier de maths. */
export const GRID = 19;
export const ERASER_RADIUS = 16;

export const TEXT_SIZE = 16;
const CHAR_WIDTH = 9;

/** Zone occupée par un texte (estimation sans canevas, utilisée pour la gomme). */
export function textBox(s: Stroke): { x: number; y: number; w: number; h: number } | null {
  const o = s.points[0];
  if (s.text === undefined || !o) return null;
  const lines = s.text.split('\n');
  const longest = Math.max(...lines.map((l) => l.length), 1);
  return { x: o[0], y: o[1], w: longest * CHAR_WIDTH, h: lines.length * GRID };
}

/** La gomme (cercle de rayon ERASER_RADIUS autour de q) touche-t-elle ce trait ou ce texte ? */
export function erasedBy(s: Stroke, pts: readonly Point[]): boolean {
  const box = textBox(s);
  if (box)
    return pts.some(
      (q) =>
        q[0] > box.x - ERASER_RADIUS &&
        q[0] < box.x + box.w + ERASER_RADIUS &&
        q[1] > box.y - ERASER_RADIUS &&
        q[1] < box.y + box.h + ERASER_RADIUS,
    );
  return s.points.some((p) => pts.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < ERASER_RADIUS));
}

function drawText(g: CanvasRenderingContext2D, s: Stroke, caret = false) {
  const o = s.points[0];
  if (!o || s.text === undefined) return;
  g.fillStyle = s.color;
  g.font = `${TEXT_SIZE}px sans-serif`;
  g.textBaseline = 'top';
  const lines = s.text.split('\n');
  lines.forEach((l, i) => g.fillText(l, o[0], o[1] + i * GRID));
  if (caret) {
    const last = lines[lines.length - 1] ?? '';
    const x = o[0] + g.measureText(last).width + 1;
    const y = o[1] + (lines.length - 1) * GRID;
    g.fillRect(x, y, 2, TEXT_SIZE + 2);
  }
}

const lineWidth = (p: number) => 2.2 + p * 2.2;

/** Trace un trait lissé : courbes quadratiques passant par les milieux des points successifs. */
export function drawStroke(g: CanvasRenderingContext2D, s: Stroke, caret = false) {
  if (s.text !== undefined) {
    drawText(g, s, caret);
    return;
  }
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
