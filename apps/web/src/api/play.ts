import { useQuery } from '@tanstack/react-query';
import type { AnswerResult, AnswerSubmit, SessionCreate, SessionSummary, SkillProgress } from '@questeo/shared';
import { api } from './client.ts';

export const skillsKey = (profileId: string) => ['skills', profileId] as const;

export const useSkills = (profileId: string) =>
  useQuery({ queryKey: skillsKey(profileId), queryFn: () => api<SkillProgress[]>(`/profiles/${profileId}/skills`) });

export const startSession = (input: SessionCreate) =>
  api<{ id: string }>('/sessions', { method: 'POST', body: JSON.stringify(input) });

export const submitAnswer = (sessionId: string, answer: AnswerSubmit) =>
  api<AnswerResult>(`/sessions/${sessionId}/answers`, { method: 'POST', body: JSON.stringify(answer) });

export const finishSession = (sessionId: string) =>
  api<SessionSummary>(`/sessions/${sessionId}/finish`, { method: 'POST' });

export const markConfused = (sessionId: string, skillId: string) =>
  api<undefined>(`/sessions/${sessionId}/confused`, { method: 'POST', body: JSON.stringify({ skillId }) });
