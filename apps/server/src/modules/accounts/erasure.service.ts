import type { FamilyDelete, FamilyExport } from '@epicademie/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { AppError } from '../../core/errors.ts';
import type { Actor } from '../../core/http/auth.ts';
import { accountsRepo } from './accounts.repo.ts';
import { erasureRepo } from './erasure.repo.ts';

interface ErasureDeps {
  readonly db: Db;
  readonly clock: Clock;
  /** Annule chez le prestataire les paiements en cours de la famille (avant son effacement). */
  readonly cancelPayments?: (familyId: string) => Promise<void>;
  readonly refuseAutonomous: (actor: Actor) => void;
  readonly passwordMatches: (hash: string | null, password: string) => Promise<boolean>;
  readonly checkPin: (
    account: { id: string; pinFailures: number; pinLockedUntil: Date | null },
    pinHash: string,
    pin: string,
  ) => Promise<void>;
}

/** Droits d'accès, de portabilité et d'effacement d'une famille (RGPD). */
export function createErasureService(d: ErasureDeps) {
  return {
    /** Export JSON des données de la famille (aucune empreinte de mot de passe ni de PIN). */
    async exportFamily(actor: Actor): Promise<FamilyExport> {
      const data = await erasureRepo(d.db).collect(actor.familyId);
      return { exportedAt: d.clock.now().toISOString(), ...data };
    },

    /**
     * Droit à l'effacement : mot de passe ou PIN redemandé, paiements en cours annulés chez le
     * prestataire, puis suppression définitive de la famille en une transaction.
     */
    async deleteFamily(actor: Actor, input: FamilyDelete): Promise<void> {
      d.refuseAutonomous(actor);
      const repo = accountsRepo(d.db);
      const account = await repo.findById(actor.accountId);
      if (account?.role !== 'parent') throw new AppError('FORBIDDEN', 'Ce compte ne peut pas être supprimé ici.');
      if (input.password !== undefined) {
        if (!(await d.passwordMatches(account.passwordHash, input.password))) {
          throw new AppError('UNAUTHORIZED', 'Mot de passe incorrect.');
        }
      } else if (account.parentPinHash && input.pin !== undefined) {
        await d.checkPin(account, account.parentPinHash, input.pin);
        await repo.setPinFailures(account.id, 0, null);
      } else {
        throw new AppError('UNAUTHORIZED', 'Code PIN non défini : utilise le mot de passe du compte.');
      }
      await d.cancelPayments?.(actor.familyId);
      await d.db.transaction((tx) => erasureRepo(tx).erase(actor.familyId));
    },
  };
}
