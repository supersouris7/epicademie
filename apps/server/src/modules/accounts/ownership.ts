import type { Db } from '../../db/client.ts';
import { notFound } from '../../core/errors.ts';
import type { Actor } from '../../core/http/auth.ts';
import { accountsRepo } from './accounts.repo.ts';

/**
 * Isolation des familles : chaque route qui désigne un profil, une partie ou un combat vérifie
 * qu'il appartient à la famille de l'appareil connecté. Sinon : 404, comme s'il n'existait pas
 * (on ne révèle pas l'existence des données d'une autre famille).
 */
export function createOwnership(db: Db) {
  const repo = accountsRepo(db);
  return {
    async profile(actor: Actor, profileId: string): Promise<void> {
      if ((await repo.familyOfProfile(profileId)) !== actor.familyId) throw notFound('Profil introuvable');
    },
    async game(actor: Actor, gameId: string, message = 'Partie introuvable'): Promise<void> {
      if ((await repo.familyOfGame(gameId)) !== actor.familyId) throw notFound(message);
    },
  };
}

export type Ownership = ReturnType<typeof createOwnership>;
