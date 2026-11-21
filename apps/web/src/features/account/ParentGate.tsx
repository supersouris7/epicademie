import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ApiError } from '../../shared/api/client.ts';
import { ParentUnlock } from './ParentUnlock.tsx';
import { ParentGateContext, type ParentAction as Action } from './parentGate.ts';

/**
 * Verrou parent : certaines actions (créer ou supprimer un profil, changer le prénom ou la
 * classe…) sont réservées au parent. Le serveur les refuse (403) tant que le mot de passe n'a
 * pas été confirmé récemment ; `withParent(action)` demande alors le code PIN (ou le mot de passe),
 * puis relance l'action. Un enfant qui joue sur l'appareil ne peut donc pas les faire seul.
 */

export function ParentGateProvider({ children }: { readonly children: ReactNode }) {
  const [pending, setPending] = useState<Action | null>(null);
  const settle = useRef<((ok: boolean) => void) | null>(null);

  const withParent = useCallback(async (action: Action) => {
    try {
      await action();
    } catch (err) {
      if (!(err instanceof ApiError && err.code === 'FORBIDDEN')) throw err;
      // Mot de passe demandé ; l'action est relancée une fois confirmé.
      const confirmed = await new Promise<boolean>((resolve) => {
        settle.current = resolve;
        setPending(() => action);
      });
      if (confirmed) await action();
    }
  }, []);

  const close = (ok: boolean) => {
    settle.current?.(ok);
    settle.current = null;
    setPending(null);
  };

  return (
    <ParentGateContext.Provider value={withParent}>
      {children}
      {pending && <ParentPasswordDialog onDone={close} />}
    </ParentGateContext.Provider>
  );
}

function ParentPasswordDialog({ onDone }: { readonly onDone: (ok: boolean) => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Espace parent"
    >
      <div className="bg-surface flex w-full max-w-sm flex-col gap-4 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold">Action réservée au parent</h2>
        <ParentUnlock onUnlocked={() => onDone(true)} />
        <button type="button" onClick={() => onDone(false)} className="text-muted font-bold underline">
          Annuler
        </button>
      </div>
    </div>
  );
}
