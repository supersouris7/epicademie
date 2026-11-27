import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../../shared/lib/telemetry.ts';
import { frameClass } from './AdminShell.tsx';
import { AdminButton } from './ui.tsx';

/** Écran de secours de la console (au thème de la console), l'erreur part au suivi du serveur. */
export class AdminErrorBoundary extends Component<{ readonly children: ReactNode }, { readonly failed: boolean }> {
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
      <div role="alert" className={`${frameClass} flex flex-col items-center justify-center gap-3 p-4`}>
        <p className="text-sm">La console a rencontré une erreur.</p>
        <AdminButton onClick={() => window.location.reload()}>Recharger</AdminButton>
      </div>
    );
  }
}
