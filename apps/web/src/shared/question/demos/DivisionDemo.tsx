/**
 * La division expliquée en image (retour terrain : les mots bloquent plus que le calcul) :
 * 1. la division posée, chaque nombre avec son nom et sa couleur ;
 * 2. le partage en paquets (jetons), quand le dividende est assez petit pour être dessiné ;
 * 3. l'égalité de contrôle, avec les mêmes couleurs.
 */
const ROLE = {
  dividende: 'var(--info)',
  diviseur: 'var(--accent)',
  quotient: 'var(--success)',
  reste: 'var(--danger)',
} as const;

function Tag({ name, children }: { readonly name: keyof typeof ROLE; readonly children: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center leading-tight">
      <span className="font-display text-3xl" style={{ color: ROLE[name] }}>
        {children}
      </span>
      <span className="rounded-full px-2 text-xs font-bold text-white" style={{ background: ROLE[name] }}>
        {name}
      </span>
    </span>
  );
}

/** Jetons dessinés au plus : au-delà, le partage serait illisible. */
const MAX_TOKENS = 60;

export function DivisionDemo({ dividend, divisor }: { readonly dividend: number; readonly divisor: number }) {
  const quotient = Math.floor(dividend / divisor);
  const rest = dividend - divisor * quotient;
  const drawable = dividend <= MAX_TOKENS && divisor > 0;
  return (
    <figure className="flex flex-col gap-3" aria-label={`Division de ${dividend} par ${divisor} expliquée en image`}>
      {/* Division posée (potence) */}
      <div className="flex items-start justify-center gap-0">
        <div className="flex flex-col items-end gap-2 pr-3">
          <Tag name="dividende">{dividend}</Tag>
          <Tag name="reste">{rest}</Tag>
        </div>
        <div className="border-outline flex flex-col items-start border-l-4">
          <div className="border-outline border-b-4 px-3 pb-1">
            <Tag name="diviseur">{divisor}</Tag>
          </div>
          <div className="px-3 pt-1">
            <Tag name="quotient">{quotient}</Tag>
          </div>
        </div>
      </div>

      {drawable && (
        <div className="flex flex-col gap-1">
          <p className="text-center text-sm font-bold">
            {dividend} jetons rangés en paquets de {divisor} :
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2" aria-hidden>
            {Array.from({ length: quotient }, (_, k) => (
              <span
                key={k}
                className="flex flex-wrap gap-0.5 rounded-lg border-2 p-1"
                style={{ borderColor: ROLE.quotient, maxWidth: `${Math.min(divisor, 5) * 14 + 12}px` }}
              >
                {Array.from({ length: divisor }, (_, i) => (
                  <span key={i} className="h-3 w-3 rounded-full" style={{ background: ROLE.dividende }} />
                ))}
              </span>
            ))}
            {rest > 0 && (
              <span className="flex gap-0.5 rounded-lg border-2 border-dashed p-1" style={{ borderColor: ROLE.reste }}>
                {Array.from({ length: rest }, (_, i) => (
                  <span key={i} className="h-3 w-3 rounded-full" style={{ background: ROLE.reste }} />
                ))}
              </span>
            )}
          </div>
          <p className="text-center text-sm">
            <b style={{ color: ROLE.quotient }}>{quotient} paquets</b> entiers
            {rest > 0 ? (
              <>
                , et{' '}
                <b style={{ color: ROLE.reste }}>
                  {rest} jeton{rest > 1 ? 's' : ''} qui reste{rest > 1 ? 'nt' : ''}
                </b>{' '}
                (pas assez pour un paquet de plus).
              </>
            ) : (
              ' : il ne reste rien, la division tombe juste.'
            )}
          </p>
        </div>
      )}

      <p
        className="font-display text-center text-2xl"
        aria-label={`${dividend} égale ${divisor} fois ${quotient} plus ${rest}`}
      >
        <span style={{ color: ROLE.dividende }}>{dividend}</span> ={' '}
        <span style={{ color: ROLE.diviseur }}>{divisor}</span> ×{' '}
        <span style={{ color: ROLE.quotient }}>{quotient}</span> + <span style={{ color: ROLE.reste }}>{rest}</span>
      </p>
      <p className="text-muted text-center text-xs font-bold">Le reste est toujours plus petit que le diviseur.</p>
    </figure>
  );
}
