import { noop, queryOptions, useQuery, type QueryClient } from '@tanstack/react-query';
import { api } from '@epicademie/shared';
import { request } from './client.ts';

/** Lectures partagées entre fonctionnalités (menus du jeu et Espace parent) : notions et boss d'un profil. */
export const skillsKey = (profileId: string) => ['skills', profileId] as const;

const skillsQuery = (profileId: string) =>
  queryOptions({
    queryKey: skillsKey(profileId),
    queryFn: () => request(api.listSkills, { params: { id: profileId } }),
  });

export const useSkills = (profileId: string) => useQuery(skillsQuery(profileId));

/** Progrès personnel (rafraîchi à chaque fin de série). */
export const journeyKey = (profileId: string) => ['journey', profileId] as const;

export const chapterTrophiesKey = (profileId: string) => ['chapter-trophies', profileId] as const;

const chapterTrophiesQuery = (profileId: string) =>
  queryOptions({
    queryKey: chapterTrophiesKey(profileId),
    queryFn: () => request(api.chapterTrophies, { params: { id: profileId } }),
  });

/** Trophées de chapitre (Épreuves du chapitre réussies). */
export const useChapterTrophies = (profileId: string) => useQuery(chapterTrophiesQuery(profileId));

export const bossesKey = (profileId: string) => ['bosses', profileId] as const;

const bossesQuery = (profileId: string) =>
  queryOptions({
    queryKey: bossesKey(profileId),
    queryFn: () => request(api.bossOverview, { params: { id: profileId } }),
  });

export const useBosses = (profileId: string) => useQuery(bossesQuery(profileId));

/** Demande d'avance ce que les menus d'un joueur affichent (sans effet si les données sont fraîches). */
export function prefetchPlayerData(qc: QueryClient, profileId: string) {
  void qc.query(skillsQuery(profileId)).catch(noop);
  void qc.query(bossesQuery(profileId)).catch(noop);
  void qc.query(chapterTrophiesQuery(profileId)).catch(noop);
}
