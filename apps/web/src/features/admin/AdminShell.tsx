import type { ReactNode } from 'react';
import { useAdminSession } from './api.ts';
import { inputClass } from './ui.tsx';

/** Police système, thème sombre (classe `admin-dark`) : la console ne reprend rien du style du jeu. */
const FRAME_STYLE = {
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
} as const;

export interface AdminSection {
  readonly id: string;
  readonly label: string;
  readonly group: string;
}

/**
 * Cadre de la console d'administration : menu latéral par groupes, en-tête avec l'opérateur.
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
  const { data: session } = useAdminSession();
  const groups = [...new Set(sections.map((s) => s.group))];
  return (
    <div className="admin-dark min-h-dvh bg-slate-100 text-slate-900" style={FRAME_STYLE}>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <span className="rounded-[4px] bg-slate-900 px-2 py-0.5 text-xs font-bold tracking-wider text-white">
          ADMIN
        </span>
        <h1 className="flex-1 text-sm font-semibold">Épicadémie · Console d’administration</h1>
        <span className="text-xs text-slate-500">Opérateur : {session?.operator}</span>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:flex-row md:p-6">
        <nav aria-label="Rubriques" className="md:w-52 md:shrink-0">
          <select
            className={`${inputClass} w-full md:hidden`}
            value={active}
            aria-label="Rubrique"
            onChange={(e) => onSelect(e.target.value)}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.group} · {s.label}
              </option>
            ))}
          </select>
          <div className="hidden flex-col gap-4 md:flex">
            {groups.map((g) => (
              <div key={g}>
                <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">{g}</p>
                <ul role="tablist" aria-orientation="vertical" className="flex flex-col">
                  {sections
                    .filter((s) => s.group === g)
                    .map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={active === s.id}
                          onClick={() => onSelect(s.id)}
                          className={`w-full rounded-[4px]-[6px] px-2 py-1.5 text-left text-sm ${active === s.id ? 'bg-white font-semibold text-indigo-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-700 hover:bg-white/70'}`}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
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
    <div
      className="admin-dark flex min-h-dvh items-center justify-center bg-slate-100 p-4 text-slate-900"
      style={FRAME_STYLE}
    >
      <div className="w-full max-w-sm rounded-[4px]-[8px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm">Administration accessible uniquement depuis la page de pilotage.</p>
      </div>
    </div>
  );
}
