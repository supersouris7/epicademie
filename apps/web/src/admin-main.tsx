import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminApp } from './features/admin/index.ts';
import { installChunkReload } from './shared/lib/chunkReload.ts';
import { installErrorReporting } from './shared/lib/telemetry.ts';
import './admin.css';

/** Démarrage de la console d'administration (admin.html) : une application à part, sans le jeu. */
installErrorReporting();
installChunkReload();

const root = document.getElementById('root');
if (!root) throw new Error('#root introuvable');

createRoot(root).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
