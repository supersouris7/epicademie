import { queryOptions, useQuery } from '@tanstack/react-query';
import { api, type AnswerSubmit, type SessionCreate } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';
import { LONG_FRESH_MS } from '../../shared/api/queryClient.ts';

/** Appels au serveur pour l'entraînement : progression par notion, partie, réponses, bilan. */
export { chapterTrophiesKey, skillsKey, useSkills } from '../../shared/api/queries.ts';

export const startSession = (input: SessionCreate) => request(api.startSession, { body: input });

export const submitAnswer = (sessionId: string, answer: AnswerSubmit) =>
  request(api.answerSession, { params: { id: sessionId }, body: answer });

export const finishSession = (sessionId: string) => request(api.finishSession, { params: { id: sessionId } });

export const markConfused = (sessionId: string, skillId: string) =>
  request(api.markConfused, { params: { id: sessionId }, body: { skillId } });

export const disabledSkillsQuery = queryOptions({
  queryKey: ['content', 'disabled'] as const,
  queryFn: async () => new Set((await request(api.disabledContent)).skills),
  staleTime: LONG_FRESH_MS,
});

/** Notions désactivées par l'équipe (en maintenance) : le jeu ne les propose plus. */
export const useDisabledSkills = () => useQuery(disabledSkillsQuery);
