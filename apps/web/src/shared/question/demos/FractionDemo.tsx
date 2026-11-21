/** Fractions dessinées : une barre partagée en parts égales (dénominateur), parts prises coloriées (numérateur). */
export function FractionDemo({ parts }: { readonly parts: readonly { readonly num: number; readonly den: number }[] }) {
  return (
    <figure className="flex flex-col gap-3" aria-label="Fractions dessinées en parts égales">
      {parts.map((f, k) => (
        <div key={k} className="flex items-center gap-3">
          <span className="font-display w-14 text-center text-2xl" aria-label={`${f.num} sur ${f.den}`}>
            <span className="block leading-none">{f.num}</span>
            <span className="border-outline block border-t-2 leading-none">{f.den}</span>
          </span>
          <div className="border-outline flex h-8 flex-1 overflow-hidden rounded-lg border-2" aria-hidden>
            {Array.from({ length: f.den }, (_, i) => (
              <span
                key={i}
                className="border-outline h-full flex-1 border-r-2 last:border-r-0"
                style={{ background: i < f.num ? 'var(--success)' : 'transparent' }}
              />
            ))}
          </div>
        </div>
      ))}
      <p className="text-muted text-center text-xs font-bold">
        Le dénominateur dit en combien de parts égales on partage ; le numérateur, combien on en prend.
      </p>
    </figure>
  );
}
