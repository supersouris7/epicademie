import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../shared/api/client.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { joinFamily } from '../account/index.ts';
import { ParentCard } from './ParentShell.tsx';

/**
 * Rattachement d'un élève de moins de 15 ans : le parent saisit le code d'invitation affiché sur
 * l'appareil de l'élève. Le profil rejoint la famille avec toute sa progression.
 */
export function JoinStudent() {
  const qc = useQueryClient();
  const [code, setCode] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <ParentCard title="Rattacher le compte d’un élève" id="rattacher">
      <p>
        Votre enfant a créé son compte seul ? Saisissez le code d’invitation affiché sur son appareil : son profil et
        toute sa progression rejoignent votre famille.
      </p>
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setDone(null);
          void joinFamily(code)
            .then((r) => {
              setDone(`Rattaché : ${r.joined.join(', ')}.`);
              setCode('');
              return qc.invalidateQueries({ queryKey: ['profiles'] });
            })
            .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Rattachement impossible.'));
        }}
      >
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-bold">Code d’invitation</span>
          <input
            value={code}
            autoComplete="off"
            autoCapitalize="characters"
            className="bg-surface rounded-xl border-2 border-current px-3 py-2 uppercase"
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <GameButton type="submit" variant="accent">
          Rattacher
        </GameButton>
      </form>
      {done && <p role="status">{done}</p>}
      {error && (
        <p role="alert" className="text-danger font-bold">
          {error}
        </p>
      )}
    </ParentCard>
  );
}
