import { useQuery } from '@tanstack/react-query';
import { api } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';
import { journeyKey } from '../../shared/api/queries.ts';

/** Progrès personnel et efforts de la semaine d'un profil. */
export const useJourney = (profileId: string) =>
  useQuery({
    queryKey: journeyKey(profileId),
    queryFn: () => request(api.journey, { params: { id: profileId } }),
  });
