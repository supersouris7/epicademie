import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { api } from '@questeo/shared';
import { ApiError, request } from '../../shared/api/client.ts';
import { LoginScreen, logout, useMe, useSetMe } from '../account/index.ts';
import { AdminButton, inputClass } from './ui.tsx';

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
 * Cadre de la console d'administration : menu latéral par groupes, en-tête avec la session
 * (compte, fin de session, fermer). Accès : compte administrateur ET mot de passe redemandé à
 * chaque ouverture (session de 15 minutes, côté serveur).
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
  const { data: me } = useMe();
  const setMe = useSetMe();
  const navigate = useNavigate();
  const groups = [...new Set(sections.map((s) => s.group))];
  const close = async () => {
    setMe(await request(api.closeAdmin));
    void navigate('/');
  };
  return (
    <div className="admin-dark min-h-dvh bg-slate-100 text-slate-900" style={FRAME_STYLE}>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <span className="rounded-[4px] bg-slate-900 px-2 py-0.5 text-xs font-bold tracking-wider text-white">
          ADMIN
        </span>
        <h1 className="flex-1 text-sm font-semibold">Questeo · Console d’administration</h1>
        <span className="hidden text-xs text-slate-500 sm:inline">
          {me?.account.email}
          {me?.adminUntil &&
            ` · session jusqu’à ${new Date(me.adminUntil).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
        </span>
        <AdminButton onClick={() => void close()}>Fermer la session</AdminButton>
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

/** Garde : compte administrateur, puis mot de passe redemandé (session de 15 minutes). */
export function AdminGate({ children }: { readonly children: ReactNode }) {
  const { data: me, error: meError, isPending } = useMe();
  const setMe = useSetMe();
  const qc = useQueryClient();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (isPending) return null;
  // Sans session : connexion directement sur /admin (pas de barre d'adresse dans l'onglet de pilotage).
  if (meError instanceof ApiError && meError.status === 401) return <LoginScreen redirectTo="/admin" />;
  const frame = (content: ReactNode) => (
    <div
      className="admin-dark flex min-h-dvh items-center justify-center bg-slate-100 p-4 text-slate-900"
      style={FRAME_STYLE}
    >
      <div className="w-full max-w-sm rounded-[4px]-[8px] border border-slate-200 bg-white p-6 shadow-sm">
        {content}
      </div>
    </div>
  );
  if (me?.account.role !== 'admin') {
    return frame(
      <div className="flex flex-col gap-3">
        <p className="text-sm">Ce compte n’a pas accès à l’administration.</p>
        <AdminButton onClick={() => void logout().then(() => qc.resetQueries())}>Se déconnecter</AdminButton>
      </div>,
    );
  }
  if (me.adminUntil && new Date(me.adminUntil) > new Date()) return <>{children}</>;
  return frame(
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        request(api.openAdmin, { body: { password } })
          .then(setMe)
          .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Connexion impossible.'));
      }}
    >
      <span className="w-fit rounded-[4px] bg-slate-900 px-2 py-0.5 text-xs font-bold tracking-wider text-white">
        ADMIN
      </span>
      <h1 className="text-base font-semibold">Ouvrir la console d’administration</h1>
      <p className="text-xs text-slate-500">
        Mot de passe redemandé à chaque ouverture. Session de 15 minutes. Compte : {me.account.email}
      </p>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Mot de passe
        <input
          type="password"
          autoComplete="current-password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <AdminButton type="submit" tone="primary" disabled={password === ''}>
        Ouvrir la session
      </AdminButton>
    </form>,
  );
}
