/**
 * Longueur, aire, volume : le lien entre cm, cm² et cm³ (retour terrain : « il ne fait pas le
 * lien »). Trois images côte à côte — un trait de 1 cm, un carré de 1 cm de côté, un cube de
 * 1 cm d'arête — puis un exemple qu'on compte, et le tableau « je mesure… avec… ».
 */
type Focus = 'longueur' | 'aire' | 'volume';

const COLORS: Record<Focus, string> = { longueur: 'var(--info)', aire: 'var(--success)', volume: 'var(--accent)' };

function Unit({ focus, active }: { readonly focus: Focus; readonly active: boolean }) {
  const c = COLORS[focus];
  const label = { longueur: '1 cm', aire: '1 cm²', volume: '1 cm³' }[focus];
  const caption = { longueur: 'un trait de 1 cm', aire: 'un carré de 1 cm de côté', volume: 'un cube de 1 cm d’arête' }[
    focus
  ];
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 ${active ? 'bg-surface' : 'opacity-60'}`}
      style={{ borderColor: active ? c : 'transparent' }}
    >
      <svg viewBox="0 0 60 60" className="h-14 w-14" aria-hidden>
        {focus === 'longueur' && (
          <line x1="10" y1="30" x2="50" y2="30" stroke={c} strokeWidth="5" strokeLinecap="round" />
        )}
        {focus === 'aire' && (
          <rect x="10" y="10" width="40" height="40" fill={c} fillOpacity="0.35" stroke={c} strokeWidth="3" />
        )}
        {focus === 'volume' && (
          <g stroke={c} strokeWidth="2.5" strokeLinejoin="round">
            <path d="M10 22 L30 12 L50 22 L30 32 Z" fill={c} fillOpacity="0.5" />
            <path d="M10 22 L10 46 L30 56 L30 32 Z" fill={c} fillOpacity="0.3" />
            <path d="M50 22 L50 46 L30 56 L30 32 Z" fill={c} fillOpacity="0.15" />
          </g>
        )}
      </svg>
      <span className="font-display text-xl" style={{ color: c }}>
        {label}
      </span>
      <span className="text-center text-xs font-bold">{caption}</span>
    </div>
  );
}

/** Exemple compté : 3 traits, 3 × 2 carrés, 3 × 2 × 2 cubes. */
function Example({ focus }: { readonly focus: Focus }) {
  const c = COLORS[focus];
  if (focus === 'longueur') {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg viewBox="0 0 140 24" className="h-8 w-48" aria-hidden>
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={10 + i * 40}
              y1="12"
              x2={46 + i * 40}
              y2="12"
              stroke={c}
              strokeWidth="5"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <p className="text-sm">
          3 traits de 1 cm bout à bout : longueur = <b>3 cm</b>.
        </p>
      </div>
    );
  }
  if (focus === 'aire') {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg viewBox="0 0 100 70" className="h-20 w-28" aria-hidden>
          {[0, 1].map((r) =>
            [0, 1, 2].map((k) => (
              <rect
                key={`${r}-${k}`}
                x={5 + k * 30}
                y={5 + r * 30}
                width="30"
                height="30"
                fill={c}
                fillOpacity="0.35"
                stroke={c}
                strokeWidth="2"
              />
            )),
          )}
        </svg>
        <p className="text-sm">
          Rectangle de 3 cm sur 2 cm : 3 × 2 = 6 carrés de 1 cm² : aire = <b>6 cm²</b>.
        </p>
      </div>
    );
  }
  // 3 × 2 × 2 cubes en perspective (rangées de 3, 2 de profondeur, 2 étages).
  const cubes: { x: number; y: number }[] = [];
  for (let z = 0; z < 2; z++)
    for (let d = 1; d >= 0; d--)
      for (let w = 0; w < 3; w++) cubes.push({ x: 8 + w * 20 + d * 10, y: 52 - z * 20 - d * 8 });
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 80" className="h-24 w-32" aria-hidden>
        {cubes.map((q, i) => (
          <g key={i} stroke={c} strokeWidth="1.5" strokeLinejoin="round">
            <rect x={q.x} y={q.y} width="20" height="20" fill={c} fillOpacity="0.3" />
            <path d={`M${q.x} ${q.y} l10 -8 h20 l-10 8 Z`} fill={c} fillOpacity="0.5" />
            <path d={`M${q.x + 20} ${q.y} l10 -8 v20 l-10 8 Z`} fill={c} fillOpacity="0.15" />
          </g>
        ))}
      </svg>
      <p className="text-sm">
        Boîte de 3 cm × 2 cm × 2 cm : 3 × 2 × 2 = 12 cubes de 1 cm³ : volume = <b>12 cm³</b>.
      </p>
    </div>
  );
}

export function UnitsDemo({ focus }: { readonly focus: Focus }) {
  return (
    <figure className="flex flex-col gap-3" aria-label="Longueur, aire et volume : le lien entre cm, cm² et cm³">
      <div className="grid grid-cols-3 gap-2">
        {(['longueur', 'aire', 'volume'] as const).map((f) => (
          <Unit key={f} focus={f} active={f === focus} />
        ))}
      </div>
      <Example focus={focus} />
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th scope="col">Je mesure…</th>
            <th scope="col">je compte des…</th>
            <th scope="col">unité</th>
          </tr>
        </thead>
        <tbody>
          <tr className={focus === 'longueur' ? 'font-bold' : ''}>
            <td>un trait, un tour (longueur, périmètre)</td>
            <td>traits de 1 cm</td>
            <td style={{ color: COLORS.longueur }}>cm</td>
          </tr>
          <tr className={focus === 'aire' ? 'font-bold' : ''}>
            <td>une surface à plat (aire)</td>
            <td>carrés de 1 cm sur 1 cm</td>
            <td style={{ color: COLORS.aire }}>cm²</td>
          </tr>
          <tr className={focus === 'volume' ? 'font-bold' : ''}>
            <td>un espace à remplir (volume)</td>
            <td>cubes de 1 cm d’arête</td>
            <td style={{ color: COLORS.volume }}>cm³</td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}
