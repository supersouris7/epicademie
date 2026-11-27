import { useEffect } from 'react';
import { noop, useQueryClient } from '@tanstack/react-query';
import { profilesQuery } from '../features/profiles/api.ts';
import { disabledSkillsQuery } from '../features/training/api.ts';
import { prefetchPlayerData } from '../shared/api/queries.ts';
import { preloadScreens } from './lazyScreen.tsx';

type Groups = Parameters<typeof preloadScreens>[0];

/** Quand le navigateur a fini d'afficher l'écran courant (Safari n'a pas `requestIdleCallback`). */
function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 1000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 200);
  return () => window.clearTimeout(id);
}

/**
 * Préparation de la suite, une fois la session vérifiée : le code des écrans voisins puis des autres,
 * et les données que les menus du joueur afficheront. Rien ici n'est attendu par l'écran en cours.
 * Pas l'abonnement : aucun écran du jeu ne l'attend, et il peut changer hors de l'application
 * (paiement sur un autre appareil) ; il est demandé par l'écran qui s'en sert.
 */
export function Warmup({ profileId, screens }: { readonly profileId: string | null; readonly screens: Groups }) {
  const qc = useQueryClient();
  useEffect(() => whenIdle(() => void preloadScreens(screens)), [screens]);
  useEffect(
    () =>
      whenIdle(() => {
        void qc.query(profilesQuery).catch(noop);
        void qc.query(disabledSkillsQuery).catch(noop);
        if (profileId) prefetchPlayerData(qc, profileId);
      }),
    [qc, profileId],
  );
  return null;
}
