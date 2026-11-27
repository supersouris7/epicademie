import { queryOptions, useQuery } from '@tanstack/react-query';
import { api, type EvaluationAnswer, type EvaluationCreate, type SubjectId } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';

/** Appels au serveur pour l'Arène d'évaluation : accueil, déroulé de l'épreuve, bilan, historique. */
export const evaluationHomeKey = (profileId: string, subject: string) =>
  ['evaluation-home', profileId, subject] as const;

export const evaluationHomeQuery = (profileId: string, subject: SubjectId) =>
  queryOptions({
    queryKey: evaluationHomeKey(profileId, subject),
    queryFn: () => request(api.evaluationHome, { params: { id: profileId, subject } }),
  });

export const useEvaluationHome = (profileId: string, subject: SubjectId) =>
  useQuery(evaluationHomeQuery(profileId, subject));

export const useEvaluationResult = (id: string) =>
  useQuery({ queryKey: ['evaluation', id], queryFn: () => request(api.evaluationResult, { params: { id } }) });

export const useEvaluationReview = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: ['evaluation', id, 'review'],
    queryFn: () => request(api.evaluationReview, { params: { id } }),
    enabled,
  });

export const startEvaluation = (input: EvaluationCreate) => request(api.startEvaluation, { body: input });
export const nextQuestion = (id: string) => request(api.evaluationNext, { params: { id } });
export const answerQuestion = (id: string, answer: EvaluationAnswer) =>
  request(api.answerEvaluation, { params: { id }, body: answer });
export const chooseAdvanced = (id: string, accept: boolean) =>
  request(api.chooseAdvanced, { params: { id }, body: { accept } });
export const finishEvaluation = (id: string) => request(api.finishEvaluation, { params: { id } });
