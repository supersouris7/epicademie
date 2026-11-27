import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { Me } from '@epicademie/shared';
import { useSession } from '../../shared/lib/session.ts';
import { safeStorage } from '../../shared/lib/storage.ts';

/**
 * Ce que le cache garde d'une session : rien d'une autre famille (ou d'une session finie), rien de
 * réservé au parent une fois son espace verrouillé, dans cet onglet comme dans les autres.
 */

/** Session de l'appareil. */
export const meKey = ['me'] as const;

/** Clé locale écrite à chaque changement de session : les autres onglets en sont avertis. */
export const SESSION_SIGNAL = 'epicademie.session';

/** Retire (et annule) tout ce qui appartient à la famille : restent la session et les réglages du serveur. */
export function dropFamilyData(qc: QueryClient) {
  qc.removeQueries({ predicate: ({ queryKey: [name] }) => name !== meKey[0] && name !== 'auth-options' });
}

/** Prévient les autres onglets : famille en cours (vide si la session est finie). */
export function announceSession(familyId: string) {
  safeStorage.set(SESSION_SIGNAL, `${familyId}|${Date.now()}-${Math.random()}`);
}

/** Applique au cache une session reçue, avant qu'elle remplace `previous`. */
export function followSession(qc: QueryClient, previous: Me | undefined, me: Me) {
  const changed = previous?.family.id !== me.family.id;
  const locked = previous?.parent === true && !me.parent;
  if (changed) dropFamilyData(qc);
  if (locked) qc.removeQueries({ predicate: ({ meta }) => meta?.parentOnly === true });
  if (changed || locked) announceSession(me.family.id);
}

/**
 * Écoute les autres onglets. Autre famille ou déconnexion : tout est retiré et la session redemandée
 * (les écrans connectés attendent la réponse). Même famille : la session est seulement revérifiée
 * (verrou parent), sans interrompre l'écran.
 */
export function useSessionSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const onStorage = ({ key, newValue }: StorageEvent) => {
      if (key !== SESSION_SIGNAL || newValue === null) return;
      const current = qc.getQueryData<Me>(meKey)?.family.id;
      if (current === undefined) return; // Rien en mémoire ici.
      if (newValue.split('|')[0] === current) {
        void qc.invalidateQueries({ queryKey: meKey });
        return;
      }
      dropFamilyData(qc);
      // En mémoire seulement : le choix enregistré appartient à l'onglet qui a changé la session.
      useSession.setState({ profileId: null });
      void qc.resetQueries({ queryKey: meKey });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [qc]);
}
