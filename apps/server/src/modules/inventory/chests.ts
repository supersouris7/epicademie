import type { Chest } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { profilesRepo } from '../profiles/index.ts';
import { inventoryRepo } from './inventory.repo.ts';

/**
 * Remet un coffre tiré au joueur : objets ajoutés à l'inventaire (stock plafonné, le coffre
 * renvoyé montre ce qui a vraiment été ajouté), Acad-Héros ajouté à la collection (un doublon est
 * déjà converti en pièces). Les pièces et rubis sont crédités par l'appelant avec le reste des gains.
 */
export async function grantChest(db: Executor, profileId: string, chest: Chest): Promise<Chest> {
  if (chest.hero && !chest.hero.duplicate) await profilesRepo(db).addHero(profileId, chest.hero.id, 'coffre');
  return { ...chest, items: await inventoryRepo(db).add(profileId, chest.items) };
}
