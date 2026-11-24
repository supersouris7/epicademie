import { useQuery } from '@tanstack/react-query';
import { isFreeChapter } from '@epicademie/content';
import { api } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';

/** Abonnement de la famille (accès premium, prix, historique). */
export const billingKey = ['billing'] as const;
export const useBilling = () => useQuery({ queryKey: billingKey, queryFn: () => request(api.billing) });

/**
 * Le chapitre est-il jouable ? Gratuit (1er chapitre de chaque classe) ou abonnement en cours.
 * Tant que l'état n'est pas chargé, rien n'est verrouillé : le serveur fait foi de toute façon.
 */
export function useChapterAccess(): (chapterId: string) => boolean {
  const { data } = useBilling();
  return (chapterId) => data === undefined || data.premium || isFreeChapter(chapterId);
}

/** « 24,99 € » */
export const formatPrice = (cents: number, currency: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

export const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
