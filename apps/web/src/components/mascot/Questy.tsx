import { useId } from 'react';
import { GRID, MOODS, litPixels, type MoodId } from './moods.ts';

const PITCH = 100 / GRID;
const LED = PITCH * 0.86;
const OUTLINE = '#1d1638';

interface QuestyProps {
  readonly mood?: MoodId;
  readonly size?: number | string;
  readonly className?: string;
  readonly title?: string;
}

/** Questy : avatar rond à écran LED, une couleur et une grimace par humeur. */
export function Questy({ mood = 'happy', size = 96, className, title }: QuestyProps) {
  const id = useId().replace(/:/g, '');
  const m = MOODS[mood];
  const lit = new Set(litPixels(m).map(([x, y]) => `${x},${y}`));
  const cells: { x: number; y: number; on: boolean }[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) cells.push({ x, y, on: lit.has(`${x},${y}`) });
  }
  const rect = ({ x, y }: { x: number; y: number }) => ({
    x: x * PITCH + (PITCH - LED) / 2,
    y: y * PITCH + (PITCH - LED) / 2,
    width: LED,
    height: LED,
    rx: LED * 0.25,
  });
  return (
    <svg
      viewBox="-6 -6 112 112"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title ?? `Questy — ${m.label}`}
    >
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx={50} cy={50} r={48} />
        </clipPath>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-v`} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <circle cx={50} cy={53} r={50} fill={OUTLINE} />
      <g clipPath={`url(#${id}-c)`}>
        <rect x={0} y={0} width={100} height={100} fill={m.screen} />
        {cells
          .filter((c) => !c.on)
          .map((c) => (
            <rect key={`${c.x}-${c.y}`} {...rect(c)} fill={m.glow} opacity={0.07} />
          ))}
        <g filter={`url(#${id}-glow)`}>
          {cells
            .filter((c) => c.on)
            .map((c) => (
              <rect key={`${c.x}-${c.y}`} {...rect(c)} fill={m.glow} />
            ))}
        </g>
        <rect x={0} y={0} width={100} height={100} fill={`url(#${id}-v)`} />
        <path
          d="M14 30 C22 16 36 8 52 6"
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.18}
          fill="none"
        />
      </g>
      <circle cx={50} cy={50} r={48} fill="none" stroke={OUTLINE} strokeWidth={4} />
    </svg>
  );
}
