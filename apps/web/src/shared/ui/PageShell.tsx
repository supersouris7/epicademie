import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import type { Profile } from '@questeo/shared';
import { MainNav } from './MainNav.tsx';
import { GameButton } from './game/GameButton.tsx';
import { GameBackdrop } from './game/GameBackdrop.tsx';

interface PageShellProps {
  readonly title?: string;
  /** Route de retour ; absent = pas de bouton retour. */
  readonly back?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  /** Écran principal : barre du haut figée (joueur et onglets). */
  readonly nav?: Profile;
}

export function PageShell({ title, back, actions, children, nav }: PageShellProps) {
  const navigate = useNavigate();
  const hasHeader = title !== undefined || back !== undefined || actions !== undefined;
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-5 overflow-x-clip px-4 pb-6 sm:px-6 sm:pb-8">
      <GameBackdrop />
      {nav && <MainNav profile={nav} />}
      {hasHeader && (
        <header className={`flex items-center gap-3 ${nav ? '' : 'pt-4 sm:pt-6'}`}>
          {back !== undefined && (
            <GameButton
              variant="accent"
              iconOnly
              icon="icons-navigation-back"
              onClick={() => void navigate(back)}
              aria-label="Retour"
            />
          )}
          {title && (
            <h1 className="font-display text-toon min-w-0 flex-1 text-3xl leading-tight tracking-wide sm:text-4xl">
              {title}
            </h1>
          )}
          {!title && <div className="flex-1" />}
          {actions}
        </header>
      )}
      <main className={`flex flex-1 flex-col gap-6 ${!nav && !hasHeader ? 'pt-4 sm:pt-6' : ''}`}>{children}</main>
    </div>
  );
}
