import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../../shared/api/queryClient.ts';
import { AdminErrorBoundary } from './AdminErrorBoundary.tsx';
import { AdminPage } from './AdminPage.tsx';

/** La console et ses fournisseurs (requêtes serveur, barrière d'erreur) : ni routeur ni session de jeu. */
export function AdminApp() {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <AdminErrorBoundary>
        <AdminPage />
      </AdminErrorBoundary>
    </QueryClientProvider>
  );
}
