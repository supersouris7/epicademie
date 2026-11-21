/** Nombres relatifs sur une droite graduée : zéro au milieu, négatifs à gauche, positifs à droite. */
export function NumberLineDemo({ values }: { readonly values: readonly number[] }) {
  const span = Math.max(5, ...values.map((v) => Math.abs(v)));
  const min = -span;
  const width = 320;
  const x = (v: number) => 16 + ((v - min) / (2 * span)) * (width - 32);
  const ticks = Array.from({ length: 2 * span + 1 }, (_, i) => min + i);
  const labelEvery = span > 10 ? 5 : span > 5 ? 2 : 1;
  return (
    <figure className="flex flex-col gap-2" aria-label={`Droite graduée : ${values.join(', ')}`}>
      <svg viewBox={`0 0 ${width} 70`} className="w-full" aria-hidden>
        <line x1="8" y1="35" x2={width - 8} y2="35" stroke="currentColor" strokeWidth="2" />
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              y1={t === 0 ? 27 : 31}
              x2={x(t)}
              y2={t === 0 ? 43 : 39}
              stroke="currentColor"
              strokeWidth={t === 0 ? 3 : 1.5}
            />
            {t % labelEvery === 0 && (
              <text x={x(t)} y="58" textAnchor="middle" fontSize="11" fill="currentColor">
                {t < 0 ? `−${-t}` : t}
              </text>
            )}
          </g>
        ))}
        {values.map((v) => (
          <g key={`v${v}`}>
            <circle cx={x(v)} cy="35" r="6" fill={v < 0 ? 'var(--danger)' : 'var(--success)'} />
            <text x={x(v)} y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
              {v < 0 ? `−${-v}` : v}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-muted text-center text-xs font-bold">Plus un nombre est à gauche, plus il est petit.</p>
    </figure>
  );
}
