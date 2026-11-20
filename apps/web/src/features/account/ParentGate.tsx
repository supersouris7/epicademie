import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiError } from '../../shared/api/client.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { confirmParent, useSetMe } from './api.ts';
import { ParentGateContext, type ParentAction as Action } from './parentGate.ts';

/**
 * Verrou parent : certaines actions (créer ou supprimer un profil, changer le prénom ou la
 * classe…) sont réservées au parent. Le serveur les refuse (403) tant que le mot de passe n'a
 * pas été confirmé récemment ; `withParent(action)` affiche alors la demande de mot de passe,
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
  const setMe = useSetMe();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Le champ prend le focus à l'ouverture (seul champ de la boîte de dialogue).
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const submit = async () => {
    setBusy(true);
    try {
      setMe(await confirmParent(password));
      onDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Vérification impossible pour le moment.');
      setBusy(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Espace parent"
    >
      <form
        className="cartoon bg-surface flex w-full max-w-md flex-col gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <h2 className="font-display text-2xl tracking-wide">Espace parent</h2>
        <p>Cette action est réservée au parent. Saisis le mot de passe du compte familial.</p>
        <label className="flex flex-col gap-1 font-bold">
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            className="cartoon bg-surface-2 px-3 py-2 font-normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            ref={input}
          />
        </label>
        {error && (
          <p role="alert" className="text-danger font-bold">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <GameButton type="submit" disabled={busy || password === ''}>
            Valider
          </GameButton>
          <GameButton variant="surface" onClick={() => onDone(false)}>
            Annuler
          </GameButton>
        </div>
      </form>
    </div>
  );
}
