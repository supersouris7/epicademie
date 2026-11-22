import { GameIcon } from '../../ui/game/GameIcon.tsx';
import { COLORS } from './brouillonDraw.ts';

export type BrouillonMode = 'stylo' | 'texte' | 'gomme';

interface ToolbarProps {
  readonly mode: BrouillonMode;
  readonly color: string;
  readonly canClear: boolean;
  readonly expanded?: boolean;
  readonly onColor: (color: string) => void;
  readonly onMode: (mode: BrouillonMode) => void;
  readonly onUndo: () => void;
  readonly onClear: () => void;
  readonly onToggleExpand?: () => void;
}

const btn = 'cartoon cartoon-press font-display flex h-10 min-w-10 items-center justify-center px-2.5 text-base';

/** Barre d'outils du brouillon : couleurs, stylo, texte au clavier, gomme, annuler, tout effacer. */
export function BrouillonToolbar(p: ToolbarProps) {
  const { mode, color, canClear, expanded, onToggleExpand } = p;
  const modeBtn = (m: BrouillonMode) => `${btn} ${mode === m ? 'bg-accent text-white' : 'bg-surface'}`;
  return (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Outils du brouillon">
      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => p.onColor(c.value)}
          aria-label={`Stylo ${c.label.toLowerCase()}`}
          aria-pressed={mode !== 'gomme' && color === c.value}
          className={`h-10 w-10 rounded-full border-4 ${mode !== 'gomme' && color === c.value ? 'border-primary' : 'border-outline/30'}`}
          style={{ backgroundColor: c.value }}
        />
      ))}
      <button
        type="button"
        onClick={() => p.onMode('stylo')}
        aria-pressed={mode === 'stylo'}
        className={modeBtn('stylo')}
      >
        Stylo
      </button>
      <button
        type="button"
        onClick={() => p.onMode('texte')}
        aria-pressed={mode === 'texte'}
        aria-label="Texte au clavier"
        className={modeBtn('texte')}
      >
        <span aria-hidden="true">⌨</span>
      </button>
      <button
        type="button"
        onClick={() => p.onMode('gomme')}
        aria-pressed={mode === 'gomme'}
        className={modeBtn('gomme')}
      >
        Gomme
      </button>
      <button type="button" onClick={p.onUndo} disabled={!canClear} className={`${btn} bg-surface disabled:opacity-40`}>
        Annuler
      </button>
      <button
        type="button"
        onClick={p.onClear}
        disabled={!canClear}
        className={`${btn} bg-surface disabled:opacity-40`}
      >
        Tout effacer
      </button>
      {onToggleExpand && (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-pressed={expanded}
          className={`${btn} bg-accent ml-auto gap-1.5 text-white`}
        >
          <GameIcon id={expanded ? 'icons-navigation-fullscreen-exit' : 'icons-navigation-fullscreen'} size="xs" />
          {expanded ? 'Réduire' : 'Pleine page'}
        </button>
      )}
    </div>
  );
}
