import { useQuery } from '@tanstack/react-query';
import { api, type BattleAnswer, type ItemId } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';

export const bossesKey = (profileId: string) => ['bosses', profileId] as const;

export const useBosses = (profileId: string) =>
  useQuery({ queryKey: bossesKey(profileId), queryFn: () => request(api.bossOverview, { params: { id: profileId } }) });

export const startBattle = (profileId: string, chapterId: string) =>
  request(api.startBattle, { body: { profileId, chapterId } });

export const answerBattle = (id: string, answer: BattleAnswer) =>
  request(api.answerBattle, { params: { id }, body: answer });

export const sendBattleItem = (id: string, item: ItemId) =>
  request(api.useBattleItem, { params: { id }, body: { item } });

export const finishBattle = (id: string) => request(api.finishBattle, { params: { id } });

/** Achat : une clé par appui, pour qu'une requête rejouée ne débite jamais deux fois. */
export const buyItem = (profileId: string, item: ItemId | 'rubis') =>
  request(api.buy, { body: { profileId, item }, idempotencyKey: crypto.randomUUID() });

/** Équipe jusqu'à 3 objets de la réserve pour les prochains combats. */
export const equipItems = (profileId: string, items: readonly ItemId[]) =>
  request(api.setEquipment, { params: { id: profileId }, body: { items: [...items] } });
