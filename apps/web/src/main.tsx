import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { App } from './app/App.tsx';
import { createQueryClient } from './app/queryClient.ts';
import { installChunkReload } from './shared/lib/chunkReload.ts';
import { installFullscreenPreference } from './shared/lib/fullscreen.ts';
import { installErrorReporting } from './shared/lib/telemetry.ts';
import './index.css';

/** Démarrage du front : fournisseurs (requêtes serveur, animations, routeur) et suivi d'erreurs. */
const queryClient = createQueryClient();

installFullscreenPreference();
installErrorReporting();
installChunkReload();

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
