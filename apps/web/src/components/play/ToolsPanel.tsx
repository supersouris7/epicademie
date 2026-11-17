import type { ReactNode } from 'react';
import { GameButton } from '../game/GameButton.tsx';
import { GameIcon } from '../game/GameIcon.tsx';

export type ToolTab = 'brouillon' | 'calculatrice' | 'conversion';

const ICONS: Record<ToolTab, string> = {
  brouillon: 'icons-tools-pencil',
  calculatrice: 'icons-tools-calculator',
  conversion: 'icons-tools-conversion',
};

const LABELS: Record<ToolTab, string> = {
  brouillon: 'Brouillon',
  calculatrice: 'Calculatrice',
  conversion: 'Conversion',
};

interface ToolsPanelProps {
  readonly tabs: readonly ToolTab[];
  readonly active: ToolTab;
  readonly onSelect: (t: ToolTab) => void;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

/** Panneau d'outils à côté de la question : jamais par-dessus l'énoncé, contenu conservé. */
export function ToolsPanel({ tabs, active, onSelect, onClose, children }: ToolsPanelProps) {
  return (
    <section className="cartoon bg-surface flex min-h-0 flex-1 flex-col gap-2 p-3" aria-label="Outils">
      <div className="flex items-center gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active === t}
            onClick={() => onSelect(t)}
            className={`cartoon cartoon-press font-display flex h-11 items-center gap-1.5 px-3 text-base ${active === t ? 'bg-accent text-toon' : 'bg-surface-2'}`}
          >
            <GameIcon id={ICONS[t]} size="xs" />
            {LABELS[t]}
          </button>
        ))}
        <GameButton
          variant="danger"
          size="sm"
          iconOnly
          icon="icons-navigation-close"
          onClick={onClose}
          className="ml-auto"
          aria-label="Fermer les outils"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
        {children}
      </div>
    </section>
  );
}

const TOOL_ICONS: Record<string, string> = {
  Brouillon: 'icons-tools-pencil',
  Calculatrice: 'icons-tools-calculator',
  'Tableau de conversion': 'icons-tools-conversion',
};

export function ToolButton({ label, onClick }: { readonly label: string; readonly onClick: () => void }) {
  return (
    <GameButton variant="surface" size="sm" icon={TOOL_ICONS[label]} onClick={onClick}>
      {label}
    </GameButton>
  );
}
