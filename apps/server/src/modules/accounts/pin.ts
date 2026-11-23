import type { Clock } from '../../core/clock.ts';
import { AppError } from '../../core/errors.ts';
import { verifyPassword } from '../../core/auth/password.ts';
import type { accountsRepo } from './accounts.repo.ts';

/** Code PIN parent : erreurs d'affilée permises avant blocage, et durée du blocage. */
const PIN_MAX_FAILURES = 5;
const PIN_LOCK_MINUTES = 15;

/** Vérifie le PIN (5 erreurs d'affilée le bloquent 15 minutes) ; lève 401 s'il est faux ou bloqué. */
export function pinChecker(clock: Clock, repo: ReturnType<typeof accountsRepo>) {
  return async (
    account: { id: string; pinFailures: number; pinLockedUntil: Date | null },
    pinHash: string,
    pin: string,
  ): Promise<void> => {
    if (account.pinLockedUntil && account.pinLockedUntil > clock.now()) {
      throw new AppError('UNAUTHORIZED', 'Trop d’erreurs : réessaie dans 15 minutes, ou utilise le mot de passe.');
    }
    if (!(await verifyPassword(pin, pinHash))) {
      const failures = account.pinFailures + 1;
      const locked = failures >= PIN_MAX_FAILURES ? new Date(clock.now().getTime() + PIN_LOCK_MINUTES * 60_000) : null;
      await repo.setPinFailures(account.id, locked ? 0 : failures, locked);
      throw new AppError(
        'UNAUTHORIZED',
        locked ? 'Trop d’erreurs : le code PIN est bloqué 15 minutes.' : 'Code PIN incorrect.',
      );
    }
  };
}
