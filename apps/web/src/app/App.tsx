import { ErrorBoundary } from './ErrorBoundary.tsx';
import { GameApp } from './GameApp.tsx';

/**
 * Application du jeu, entourée d'une barrière d'erreur. La console d'administration est une
 * application à part (admin.html, `admin-main.tsx`).
 */
export function App() {
  return (
    <ErrorBoundary>
      <GameApp />
    </ErrorBoundary>
  );
}
