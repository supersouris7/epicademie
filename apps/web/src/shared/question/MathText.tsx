import { useContext, type ComponentType, type ReactNode } from 'react';
import { normalizeUnits, splitTerms } from '@questeo/content';
import { TermContext } from './termContext.ts';

/**
 * Rendu du mini-balisage des contenus : `{3/4}` fraction empilée, `^2` exposant, `**gras**`.
 * Avec `terms`, les mots du glossaire (quotient, reste, aire, cm²…) deviennent touchables : à
 * réserver aux textes hors boutons (énoncé, explication, leçon), jamais dans une option à toucher.
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

type TermComponent = ComponentType<{ readonly id: string; readonly children: ReactNode }> | null;

function renderRich(text: string, Term: TermComponent): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    const frac = /^\{(-?\d+|…)\/(\d+|…)\}$/.exec(part);
    if (frac) return <Fraction key={i} num={frac[1] ?? ''} den={frac[2] ?? ''} />;
    if (/^\^\d$/.test(part)) return <sup key={i}>{part.slice(1)}</sup>;
    if (part.startsWith('**')) return <strong key={i}>{renderRich(part.slice(2, -2), Term)}</strong>;
    if (!Term) return <span key={i}>{part}</span>;
    return (
      <span key={i}>
        {splitTerms(part).map((p, k) =>
          p.term ? (
            <Term key={k} id={p.term}>
              {p.text}
            </Term>
          ) : (
            p.text
          ),
        )}
      </span>
    );
  });
}

/** « 1 000 » : l'espace des milliers devient insécable, le nombre n'est jamais coupé en fin de ligne. */
const glueThousands = (text: string) => text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1\u202f');

export function MathText({
  text,
  className,
  terms = false,
}: {
  readonly text: string;
  readonly className?: string;
  /** Mots du glossaire touchables (hors boutons). */
  readonly terms?: boolean;
}) {
  const Term = useContext(TermContext);
  return <span className={className}>{renderRich(normalizeUnits(glueThousands(text)), terms ? Term : null)}</span>;
}
