import type { ReactNode } from 'react';

export type ToolTab = 'brouillon' | 'calculatrice' | 'conversion';

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
            className={`cartoon cartoon-press font-display h-11 px-3 text-base ${active === t ? 'bg-accent text-white' : 'bg-surface-2'}`}
          >
            {LABELS[t]}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="cartoon cartoon-press bg-surface-2 font-display ml-auto h-11 w-11 text-xl"
          aria-label="Fermer les outils"
        >
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
        {children}
      </div>
    </section>
  );
}

export function ToolButton({ label, onClick }: { readonly label: string; readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cartoon cartoon-press bg-surface font-display h-11 px-3 text-base"
    >
      {label}
    </button>
  );
}
