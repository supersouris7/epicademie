import { useQuery } from '@tanstack/react-query';
import { api, type AnswerSubmit, type SessionCreate } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';

export const skillsKey = (profileId: string) => ['skills', profileId] as const;

export const useSkills = (profileId: string) =>
  useQuery({ queryKey: skillsKey(profileId), queryFn: () => request(api.listSkills, { params: { id: profileId } }) });

export const startSession = (input: SessionCreate) => request(api.startSession, { body: input });

export const submitAnswer = (sessionId: string, answer: AnswerSubmit) =>
  request(api.answerSession, { params: { id: sessionId }, body: answer });

export const finishSession = (sessionId: string) => request(api.finishSession, { params: { id: sessionId } });

export const markConfused = (sessionId: string, skillId: string) =>
  request(api.markConfused, { params: { id: sessionId }, body: { skillId } });
