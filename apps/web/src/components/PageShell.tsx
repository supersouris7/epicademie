import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { FullscreenButton } from './FullscreenButton.tsx';
import { GameButton } from './game/GameButton.tsx';
import { GameBackdrop } from './game/GameBackdrop.tsx';

interface PageShellProps {
  readonly title?: string;
  /** Route de retour ; absent = pas de bouton retour. */
  readonly back?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}

export function PageShell({ title, back, actions, children }: PageShellProps) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <GameBackdrop />
      <header className="flex items-center gap-3">
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
          <h1 className="font-display text-toon flex-1 truncate text-3xl tracking-wide sm:text-4xl">{title}</h1>
        )}
        {!title && <div className="flex-1" />}
        {actions}
        <FullscreenButton />
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  );
}
