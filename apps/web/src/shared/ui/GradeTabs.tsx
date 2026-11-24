import { gradeInfo, type Grade } from '@epicademie/shared';

interface GradeTabsProps {
  readonly grades: readonly Grade[];
  readonly value: Grade;
  /** Classe du joueur : marquée d'un point. */
  readonly own: Grade;
  readonly onChange: (g: Grade) => void;
}

/** Choix de la classe dont on affiche le programme (CM1 → 3e). */
export function GradeTabs({ grades, value, own, onChange }: GradeTabsProps) {
  if (grades.length < 2) return null;
  return (
    <div role="radiogroup" aria-label="Classe" className="flex flex-wrap items-center gap-2">
      <span className="font-display text-muted mr-1 text-lg tracking-wide">Classe</span>
      {grades.map((g) => {
        const active = g === value;
        return (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(g)}
            className={`cartoon cartoon-press font-display relative min-w-14 px-3 py-1.5 text-lg tracking-wide ${active ? 'bg-accent gloss text-toon' : 'bg-surface-2'}`}
            style={{ borderRadius: '9999px' }}
          >
            {gradeInfo(g).name}
            {g === own && (
              <span
                className="bg-gold border-outline absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2"
                aria-label="ta classe"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
