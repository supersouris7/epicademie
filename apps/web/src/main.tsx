import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { App } from './app/App.tsx';
import { installFullscreenPreference } from './shared/lib/fullscreen.ts';
import { installErrorReporting } from './shared/lib/telemetry.ts';
import './index.css';

/**
 * Démarrage du front : fournisseurs (requêtes serveur, animations, routeur) et suivi d'erreurs.
 * Les requêtes en échec sont retentées 2 fois, sauf réponse du serveur (erreur métier).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: (count, err) => count < 2 && !(err instanceof Error && 'status' in err) },
  },
});

installFullscreenPreference();
installErrorReporting();

const root = document.getElementById('root');
if (!root) throw new Error('#root introuvable');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
  </StrictMode>,
);
