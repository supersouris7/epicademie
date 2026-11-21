import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { lockParent, useMe, useSetMe } from '../account/index.ts';

/**
 * Mise en page de l'Espace parent : sobre (pas de décor de jeu), lisible, adulte. En-tête avec
 * retour, titre et « Se déconnecter » (verrouille de nouveau l'Espace parent sur cet appareil).
 */
export function ParentShell({
  title,
  back,
  children,
}: {
  readonly title: string;
  readonly back: string;
  readonly children: ReactNode;
}) {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const setMe = useSetMe();
  const leave = async () => {
    try {
      setMe(await lockParent());
    } finally {
      void navigate('/');
    }
  };
  return (
    <div className="bg-surface-2 min-h-dvh">
      <header className="bg-surface border-b border-[var(--outline)]/15">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => void navigate(back)}
            aria-label="Retour"
            className="hover:bg-surface-2 rounded-lg px-2 py-1 text-xl font-bold"
          >
            ←
          </button>
          <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{title}</h1>
          {me?.parent && (
            <button
              type="button"
              onClick={() => void leave()}
              className="rounded-lg border border-[var(--outline)]/30 px-3 py-1.5 text-sm font-bold hover:bg-[var(--surface-2)]"
            >
              Se déconnecter
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">{children}</main>
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
