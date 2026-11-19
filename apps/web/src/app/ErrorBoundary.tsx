import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../shared/lib/telemetry.ts';
import { GameButton } from '../shared/ui/game/GameButton.tsx';
import { Questy } from '../shared/ui/mascot/Questy.tsx';

/**
 * Barrière d'erreur : si un écran plante pendant l'affichage, l'enfant voit un écran de secours
 * (et non une page blanche) et l'erreur part au suivi d'erreurs du serveur.
 */
export class ErrorBoundary extends Component<{ readonly children: ReactNode }, { readonly failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, info.componentStack ?? undefined);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={140} />
        <p className="font-display text-2xl">Oups, un bug !</p>
        <p className="text-lg">Questy a prévenu l’équipe. Tu peux reprendre là où tu en étais.</p>
        <GameButton onClick={() => window.location.assign('/hub')}>Revenir au menu</GameButton>
      </div>
    );
  }
}
