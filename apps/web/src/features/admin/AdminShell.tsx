import { useEffect, useState, type ReactNode } from 'react';
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
    <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto">
      <p className={mutedClass}>
        {session.operator} · {ADMIN_ROLE_LABELS[session.role]}
      </p>
      <AdminButton tone="primary" disabled={logout.isPending} onClick={() => logout.mutate()}>
        Se déconnecter
      </AdminButton>
      {logout.isError && (
        <p role="alert" className="w-full text-sm text-pilot-bad">
          La déconnexion a échoué. Réessaie.
        </p>
      )}
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

const LOGIN_URL = `${API_PREFIX}/admin-auth/login`;
const LOGIN_ATTEMPT_KEY = 'admin-sso-tentative';
/** Délai pendant lequel un nouvel envoi automatique vers le SSO est bloqué (anti-boucle si la connexion échoue). */
const LOGIN_RETRY_MS = 60_000;

/** Vrai si l'on peut partir seul vers le SSO (pas de tentative automatique récente dans cet onglet). */
function claimAutoLogin(): boolean {
  const now = Date.now();
  try {
    const last = Number(sessionStorage.getItem(LOGIN_ATTEMPT_KEY) ?? 0);
    if (now - last < LOGIN_RETRY_MS) return false;
    sessionStorage.setItem(LOGIN_ATTEMPT_KEY, String(now));
    return true;
  } catch {
    return false;
  }
}

/** Personne non connectée : départ direct vers le SSO s'il est configuré. */
function SignIn() {
  const { data, isPending } = useAdminAuthConfig(true);
  if (isPending) return null;
  return data?.sso ? (
    <SsoSignIn />
  ) : (
    <SignInFrame>
      <p className="text-sm">Administration accessible uniquement depuis la page de pilotage.</p>
    </SignInFrame>
  );
}

/** Envoi automatique vers le SSO ; le lien ne s'affiche qu'après une tentative récente (connexion échouée). */
function SsoSignIn() {
  const [redirecting] = useState(claimAutoLogin);
  useEffect(() => {
    if (redirecting) window.location.assign(LOGIN_URL);
  }, [redirecting]);
  if (redirecting) return null;
  return (
    <SignInFrame>
      <p className="text-sm">La connexion n’a pas abouti.</p>
      <a href={LOGIN_URL} className="font-semibold text-pilot-acc underline">
        Se connecter
      </a>
    </SignInFrame>
  );
}

function SignInFrame({ children }: { readonly children: ReactNode }) {
  return (
    <div className={`${frameClass} flex items-center justify-center p-4`}>
      <div className={`${cardClass} flex w-full max-w-sm flex-col gap-3 p-6`}>{children}</div>
    </div>
  );
}
