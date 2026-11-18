import { useQuery } from '@tanstack/react-query';
import type {
  BattleAnswer,
  BattleAnswerResult,
  BattleSummary,
  BattleView,
  BossOverview,
  Inventory,
  ItemId,
} from '@questeo/shared';
import { api } from './client.ts';

export const bossesKey = (profileId: string) => ['bosses', profileId] as const;

export const useBosses = (profileId: string) =>
  useQuery({ queryKey: bossesKey(profileId), queryFn: () => api<BossOverview>(`/profiles/${profileId}/bosses`) });

export const startBattle = (profileId: string, chapterId: string) =>
  api<BattleView>('/battles', { method: 'POST', body: JSON.stringify({ profileId, chapterId }) });

export const answerBattle = (id: string, answer: BattleAnswer) =>
  api<BattleAnswerResult>(`/battles/${id}/answers`, { method: 'POST', body: JSON.stringify(answer) });

export const sendBattleItem = (id: string, item: ItemId) =>
  api<BattleView>(`/battles/${id}/items`, { method: 'POST', body: JSON.stringify({ item }) });

export const finishBattle = (id: string) => api<BattleSummary>(`/battles/${id}/finish`, { method: 'POST' });

export const buyHint = (profileId: string) =>
  api<{ coins: number; inventory: Inventory }>('/shop', {
    method: 'POST',
    body: JSON.stringify({ profileId, item: 'indice' }),
  });

/** Équipe jusqu'à 3 objets de la réserve pour les prochains combats. */
export const equipItems = (profileId: string, items: readonly ItemId[]) =>
  api<BossOverview>(`/profiles/${profileId}/equipment`, { method: 'PUT', body: JSON.stringify({ items }) });
