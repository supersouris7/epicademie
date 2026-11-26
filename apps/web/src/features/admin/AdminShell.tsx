import type { ReactNode } from 'react';
import { ADMIN_ROLE_LABELS, API_PREFIX, type AdminSession } from '@epicademie/shared';
import { useAdminAuthConfig, useAdminSession, useLogout } from './api.ts';
import { RoleContext } from './can.ts';
import { segmentClass, segmentedClass } from './segments.ts';
import { AdminButton, cardClass, mutedClass } from './ui.tsx';

export interface AdminSection {
  readonly id: string;
  readonly label: string;
  /** Éléments à traiter, affichés sur l'onglet (rien à zéro). */
  readonly count?: number | undefined;
}

/** Fond et texte communs aux écrans de la console (police et couleurs du navigateur : admin.css). */
export const frameClass = 'min-h-dvh bg-pilot-bg text-pilot-fg';

/**
 * Cadre de la console d'administration : titre, rubriques en sélecteur segmenté
 * (grille de trois colonnes sur petit écran, une seule ligne sur grand écran).
 * Aucun compte de jeu : session du fournisseur d'identité de l'équipe, ou frontal de pilotage.
 */
export function AdminShell({
  sections,
  active,
  onSelect,
  user,
  children,
}: {
  readonly user?: ReactNode;
  readonly sections: readonly AdminSection[];
  readonly active: string;
  readonly onSelect: (id: string) => void;
  readonly children: ReactNode;
}) {
  return (
    <div className={frameClass}>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-[18px] p-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-[1.35rem] font-bold">Gestion du jeu</h1>
          {user}
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

/** Personne connectée par le fournisseur d'identité : nom, rôle, déconnexion. */
function SignedIn({ session }: { readonly session: AdminSession }) {
  const logout = useLogout();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className={mutedClass}>
        {session.operator} · {ADMIN_ROLE_LABELS[session.role]}
      </p>
      <AdminButton disabled={logout.isPending} onClick={() => logout.mutate()}>
        Se déconnecter
      </AdminButton>
    </div>
  );
}

/** Garde : la console s'ouvre seulement si le serveur reconnaît la personne (sinon, la connexion). */
export function AdminGate({ children }: { readonly children: (user: ReactNode) => ReactNode }) {
  const { data, isPending, isError } = useAdminSession();
  if (isPending) return null;
  if (data && !isError) {
    return <RoleContext value={data.role}>{children(data.via === 'sso' && <SignedIn session={data} />)}</RoleContext>;
  }
  return <SignIn />;
}

function SignIn() {
  const { data, isPending } = useAdminAuthConfig(true);
  if (isPending) return null;
  return (
    <div className={`${frameClass} flex items-center justify-center p-4`}>
      <div className={`${cardClass} flex w-full max-w-sm flex-col gap-3 p-6`}>
        {data?.sso ? (
          <>
            <p className="text-sm">Administration réservée à l’équipe.</p>
            <a href={`${API_PREFIX}/admin-auth/login`} className="font-semibold text-pilot-acc underline">
              Se connecter
            </a>
          </>
        ) : (
          <p className="text-sm">Administration accessible uniquement depuis la page de pilotage.</p>
        )}
      </div>
    </div>
  );
}
