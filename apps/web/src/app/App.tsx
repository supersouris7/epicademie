import { useLocation } from 'react-router';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { lazyScreen } from './lazyScreen.tsx';

/**
 * Application : choisit entre la console d'administration et le jeu, chacun téléchargé à la demande
 * (la console ne charge pas le code du jeu) ; une barrière d'erreur entoure le tout.
 */
const AdminPage = lazyScreen(async () => (await import('../features/admin/index.ts')).AdminPage);
const GameApp = lazyScreen(async () => (await import('./GameApp.tsx')).GameApp);

export function App() {
  const { pathname } = useLocation();
  // Console d'administration : route autonome, rendue avant toute logique de session de jeu
  // (aucune redirection vers /bienvenue, aucun choix de profil, aucune navigation du jeu).
  const admin = pathname === '/admin' || pathname.startsWith('/admin/');
  return <ErrorBoundary>{admin ? <AdminPage /> : <GameApp />}</ErrorBoundary>;
}
