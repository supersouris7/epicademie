interface Part {
  readonly num: number;
  readonly den: number;
}

/**
 * Fractions dessinées : une barre (ou un gâteau rond) partagée en parts égales (dénominateur), parts prises
 * coloriées (numérateur).
 */
export function FractionDemo({ parts, shape }: { readonly parts: readonly Part[]; readonly shape?: 'cake' }) {
  return (
    <figure className="flex flex-col gap-3" aria-label="Fractions dessinées en parts égales">
      <div className={shape === 'cake' ? 'flex flex-wrap justify-center gap-4' : 'flex flex-col gap-3'}>
        {parts.map((f, k) => (
          <div key={k} className="flex items-center gap-3">
            <span className="font-display w-14 text-center text-2xl" aria-label={`${f.num} sur ${f.den}`}>
              <span className="block leading-none">{f.num}</span>
              <span className="border-outline block border-t-2 leading-none">{f.den}</span>
            </span>
            {shape === 'cake' ? <Cake {...f} /> : <Bar {...f} />}
          </div>
        ))}
      </div>
      <p className="text-muted text-center text-xs font-bold">
        Le nombre du bas dit en combien de parts égales on partage ; celui du haut, combien on en prend.
      </p>
    </figure>
  );
}

function Bar({ num, den }: Part) {
  return (
    <div className="border-outline flex h-8 flex-1 overflow-hidden rounded-lg border-2" aria-hidden>
      {Array.from({ length: den }, (_, i) => (
        <span
          key={i}
          className="border-outline h-full flex-1 border-r-2 last:border-r-0"
          style={{ background: i < num ? 'var(--success)' : 'transparent' }}
        />
      ))}
    </div>
  );
}

/** Point du bord du gâteau (rayon 48) après `i` parts sur `den`, en partant du haut. */
const edge = (i: number, den: number) => {
  const angle = (2 * Math.PI * i) / den - Math.PI / 2;
  return `${(50 + 48 * Math.cos(angle)).toFixed(2)} ${(50 + 48 * Math.sin(angle)).toFixed(2)}`;
};

function Cake({ num, den }: Part) {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0" aria-hidden>
      {Array.from({ length: den }, (_, i) => (
        <path
          key={i}
          d={`M50 50 L${edge(i, den)} A48 48 0 0 1 ${edge(i + 1, den)} Z`}
          fill={i < num ? 'var(--success)' : 'var(--surface)'}
          stroke="var(--outline)"
          strokeWidth="2"
          data-taken={i < num}
        />
      ))}
    </svg>
  );
}
