import { useQuery } from '@tanstack/react-query';
import { api } from '@epicademie/shared';
import { request } from './client.ts';

/** Lectures partagées entre fonctionnalités (menus du jeu et Espace parent) : notions et boss d'un profil. */
export const skillsKey = (profileId: string) => ['skills', profileId] as const;

export const useSkills = (profileId: string) =>
  useQuery({ queryKey: skillsKey(profileId), queryFn: () => request(api.listSkills, { params: { id: profileId } }) });

export const chapterTrophiesKey = (profileId: string) => ['chapter-trophies', profileId] as const;

/** Trophées de chapitre (Épreuves du chapitre réussies). */
export const useChapterTrophies = (profileId: string) =>
  useQuery({
    queryKey: chapterTrophiesKey(profileId),
    queryFn: () => request(api.chapterTrophies, { params: { id: profileId } }),
  });

export const bossesKey = (profileId: string) => ['bosses', profileId] as const;

export const useBosses = (profileId: string) =>
  useQuery({ queryKey: bossesKey(profileId), queryFn: () => request(api.bossOverview, { params: { id: profileId } }) });
