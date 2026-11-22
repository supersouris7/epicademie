import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { GeneralReportButton } from '../../shared/question/GeneralReportButton.tsx';
import { lockParent, ParentUnlock, useMe, useSetMe } from '../account/index.ts';

/** Onglets de l'Espace parent, par utilité : progrès des enfants d'abord, puis le compte. */
const TABS = [
  { to: '/parent', label: 'Progrès', match: (p: string) => p === '/parent' || p.startsWith('/parent/enfant/') },
  { to: '/parent/abonnement', label: 'Abonnement', match: (p: string) => p.startsWith('/parent/abonnement') },
  { to: '/parent/profils', label: 'Profils', match: (p: string) => p.startsWith('/parent/profils') },
  { to: '/parent/reglages', label: 'Réglages', match: (p: string) => p.startsWith('/parent/reglages') },
] as const;

const SMALL_BUTTON =
  'rounded-lg border border-[var(--outline)]/30 px-3 py-1.5 text-sm font-bold hover:bg-[var(--surface-2)]';

/**
 * Page de l'Espace parent : verrou (code PIN), en-tête, onglets toujours visibles et contenu.
 * Chaque bouton reste dans l'Espace parent ; le seul qui en sort est « Retour au jeu ».
 * `back` : lien vers la page parente (ex. la liste des enfants), toujours dans l'espace.
 */
export function ParentPage({
  title,
  back,
  children,
}: {
  readonly title: string;
  readonly back?: { readonly to: string; readonly label: string };
  readonly children: ReactNode;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: me } = useMe();
  const setMe = useSetMe();
  const unlocked = me?.parent === true;
  const lock = async () => setMe(await lockParent());
  return (
    <div className="bg-surface-2 min-h-dvh">
      <header className="bg-surface border-b border-[var(--outline)]/15">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3">
          <p className="text-muted min-w-0 flex-1 font-bold">Espace parent</p>
          <button type="button" onClick={() => void navigate('/')} className={SMALL_BUTTON}>
            Retour au jeu
          </button>
          <GeneralReportButton className="hover:bg-[var(--surface-2)]" />
          {unlocked && (
            <button type="button" onClick={() => void lock()} className={SMALL_BUTTON}>
              Verrouiller
            </button>
          )}
        </div>
        {unlocked && (
          <nav aria-label="Rubriques de l’Espace parent" className="mx-auto flex max-w-4xl gap-1 px-4">
            {TABS.map((t) => {
              const current = t.match(pathname);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  aria-current={current ? 'page' : undefined}
                  className={`min-h-11 flex-1 border-b-4 px-2 py-2.5 text-center text-sm font-bold sm:text-base ${
                    current ? 'border-[var(--accent)]' : 'text-muted border-transparent hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
        {unlocked && back && (
          <Link to={back.to} className="text-accent self-start font-bold underline">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold">{unlocked ? title : 'Espace parent'}</h1>
        {unlocked ? (
          children
        ) : (
          <div className="bg-surface mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl p-6 shadow-sm">
            <p className="text-center">Le suivi des enfants et les réglages du compte sont réservés au parent.</p>
            <ParentUnlock onUnlocked={() => undefined} />
          </div>
        )}
      </main>
    </div>
  );
}

/** Carte de l'Espace parent : fond clair, bord fin, titre de section. */
export function ParentCard({
  title,
  children,
  id,
}: {
  readonly title?: string;
  readonly children: ReactNode;
  readonly id?: string;
}) {
  return (
    <section aria-labelledby={id} className="bg-surface flex flex-col gap-3 rounded-2xl p-4 shadow-sm">
      {title && (
        <h2 id={id} className="text-lg font-bold">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
