import type { ReactNode } from 'react';
import { GameIcon } from '../game/GameIcon.tsx';

export type DockTab = 'reponse' | 'calculatrice' | 'brouillon' | 'conversion';

const ICONS: Record<DockTab, string> = {
  reponse: 'icons-navigation-edit',
  calculatrice: 'icons-tools-calculator',
  brouillon: 'icons-tools-pencil',
  conversion: 'icons-tools-conversion',
};

interface PlayDockProps {
  readonly tabs: readonly DockTab[];
  readonly active: DockTab;
  /** Outil conseillé : son onglet brille tant qu'il n'a pas été ouvert. */
  readonly glow?: DockTab;
  readonly onSelect: (t: DockTab) => void;
  readonly children: ReactNode;
}

/** « Répondre » pour toutes les saisies (pavé, clavier, choix, point) : le verbe dit quoi faire. */
const LABELS: Record<DockTab, string> = {
  reponse: 'Répondre',
  calculatrice: 'Calculatrice',
  brouillon: 'Brouillon',
  conversion: 'Conversion',
};

/**
 * Zone d'outils de l'écran coupé : en bas en portrait, sur le côté en paysage. L'énoncé n'est jamais recouvert.
 * Le pavé (ou le clavier) partage la zone avec la calculatrice, le brouillon et le tableau de conversion ;
 * le contenu de chaque outil est conservé d'un onglet à l'autre.
 */
export function PlayDock({ tabs, active, glow, onSelect, children }: PlayDockProps) {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col gap-2 [@media(max-height:500px)]:gap-1"
      aria-label="Réponse et outils"
    >
      {tabs.length > 1 && (
        <div className="flex shrink-0 gap-1.5" role="tablist" aria-label="Outils">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active === t}
              onClick={() => onSelect(t)}
              className={`cartoon cartoon-press font-display flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-xs leading-none [@media(max-height:500px)]:h-10 ${active === t ? 'bg-accent gloss text-toon' : 'bg-surface-2'} ${glow === t && active !== t ? 'glow' : ''}`}
            >
              <GameIcon id={ICONS[t]} size="xs" />
              <span className="truncate">{LABELS[t]}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" role="tabpanel">
        {children}
      </div>
    </section>
  );
}
