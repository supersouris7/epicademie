import type { ReactNode } from 'react';
import { useAdminSession } from './api.ts';
import { segmentClass, segmentedClass } from './segments.ts';
import { cardClass } from './ui.tsx';

export interface AdminSection {
  readonly id: string;
  readonly label: string;
  /** Éléments à traiter, affichés sur l'onglet (rien à zéro). */
  readonly count?: number | undefined;
}

/** Fond et texte communs aux deux écrans de la console (police : classe `admin-dark`). */
const frameClass = 'admin-dark min-h-dvh bg-pilot-bg text-pilot-fg';

/**
 * Cadre de la console d'administration : titre, rubriques en sélecteur segmenté
 * (grille de trois colonnes sur petit écran, une seule ligne sur grand écran).
 * Aucun compte de jeu : l'accès vient de l'en-tête que le frontal de la page de pilotage ajoute.
 */
export function AdminShell({
  sections,
  active,
  onSelect,
  children,
}: {
  readonly sections: readonly AdminSection[];
  readonly active: string;
  readonly onSelect: (id: string) => void;
  readonly children: ReactNode;
}) {
  return (
    <div className={frameClass}>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-[18px] p-3">
        <header>
          <h1 className="text-[1.35rem] font-bold">Gestion du jeu</h1>
        </header>
        <nav aria-label="Rubriques">
          <div role="tablist" className={`${segmentedClass} grid grid-cols-3 lg:flex lg:rounded-full`}>
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active === s.id}
                onClick={() => onSelect(s.id)}
                className={`${segmentClass(active === s.id)} lg:flex-auto lg:whitespace-nowrap`}
              >
                {s.label}
                {!!s.count && (
                  <span className="ml-1.5 inline-block rounded-full bg-pilot-warn px-1.5 text-xs font-bold text-pilot-bg tabular-nums">
                    {s.count}
                    <span className="sr-only"> à traiter</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

/** Garde : la console s'ouvre seulement si le serveur reconnaît l'opérateur (sinon, un message). */
export function AdminGate({ children }: { readonly children: ReactNode }) {
  const { data, isPending } = useAdminSession();
  if (isPending) return null;
  if (data) return <>{children}</>;
  return (
    <div className={`${frameClass} flex items-center justify-center p-4`}>
      <div className={`${cardClass} w-full max-w-sm p-6`}>
        <p className="text-sm">Administration accessible uniquement depuis la page de pilotage.</p>
      </div>
    </div>
  );
}
