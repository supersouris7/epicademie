import type { ReactNode } from 'react';

/**
 * Rendu du mini-balisage des contenus : `{3/4}` fraction empilée, `^2` exposant, `**gras**`.
 */
const TOKEN = /(\{-?\d+\/\d+\}|\{…\/\d+\}|\{\d+\/…\}|\^\d|\*\*[^*]+\*\*)/g;

function Fraction({ num, den }: { readonly num: string; readonly den: string }) {
  return (
    <span
      className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.85em] leading-none"
      aria-label={`${num} sur ${den}`}
    >
      <span className="px-0.5 pb-0.5">{num}</span>
      <span className="w-full border-t-2 border-current" />
      <span className="px-0.5 pt-0.5">{den}</span>
    </span>
  );
}

function renderRich(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    const frac = /^\{(-?\d+|…)\/(\d+|…)\}$/.exec(part);
    if (frac) return <Fraction key={i} num={frac[1] ?? ''} den={frac[2] ?? ''} />;
    if (/^\^\d$/.test(part)) return <sup key={i}>{part.slice(1)}</sup>;
    if (part.startsWith('**')) return <strong key={i}>{renderRich(part.slice(2, -2))}</strong>;
    return <span key={i}>{part}</span>;
  });
}

/** « 1 000 » : l'espace des milliers devient insécable, le nombre n'est jamais coupé en fin de ligne. */
const glueThousands = (text: string) => text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1\u202f');

export function MathText({ text, className }: { readonly text: string; readonly className?: string }) {
  return <span className={className}>{renderRich(glueThousands(text))}</span>;
}
