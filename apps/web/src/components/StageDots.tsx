/** Trois pastilles : réussites espacées (J0, J+2, J+7) d'une notion. */
export function StageDots({ stage }: { readonly stage: number }) {
  return (
    <span
      className="flex gap-1"
      role="img"
      aria-label={stage >= 3 ? 'Notion acquise' : `${stage} réussite${stage > 1 ? 's' : ''} sur 3`}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`border-outline h-4 w-4 rounded-full border-2 ${i <= stage ? (stage >= 3 ? 'bg-gold' : 'bg-success') : 'bg-surface-2'}`}
        />
      ))}
    </span>
  );
}
