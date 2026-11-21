import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Friend, type FriendsView, type Profile } from '@questeo/shared';
import { ApiError, request } from '../../shared/api/client.ts';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';

const STATUS_TEXT: Record<Friend['status'], string> = {
  envoyee: 'Demande envoyée : à ton copain d’accepter',
  recue: 'Veut être ton ami',
  parents: 'En attente de l’accord des parents',
  active: 'Ami',
};

/**
 * Mes amis : son code ami à donner en vrai, ajout par le code d'un copain d'une autre famille,
 * demandes à accepter, attente de l'accord des parents (validé dans l'Espace parent), amis.
 */
export function Friends({ profile }: { readonly profile: Profile }) {
  const qc = useQueryClient();
  const key = ['friends', profile.id];
  const { data } = useQuery({ queryKey: key, queryFn: () => request(api.friends, { params: { id: profile.id } }) });
  const [code, setCode] = useState('');
  const [toast, showToast] = useToast(3000);
  const done = (view: FriendsView, message?: string) => {
    qc.setQueryData(key, view);
    if (message) showToast(message);
  };
  const fail = (err: unknown) => showToast(err instanceof ApiError ? err.message : 'Problème de connexion');
  const add = useMutation({
    mutationFn: () => request(api.requestFriend, { params: { id: profile.id }, body: { code } }),
    onSuccess: (v) => {
      setCode('');
      done(v, 'Demande envoyée !');
    },
    onError: fail,
  });
  const accept = useMutation({
    mutationFn: (friendId: string) => request(api.acceptFriend, { params: { id: profile.id, friendId } }),
    onSuccess: (v) => done(v, 'Accepté ! Il reste l’accord des parents.'),
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: (friendId: string) => request(api.removeFriend, { params: { id: profile.id, friendId } }),
    onSuccess: (v) => done(v),
    onError: fail,
  });

  return (
    <PageShell title="Mes amis" back="/multi" nav={profile}>
      <section className="cartoon bg-surface flex flex-col items-center gap-1 p-4 text-center">
        <h2 className="font-display text-xl tracking-wide">Mon code ami</h2>
        <p className="font-display text-gold text-5xl tracking-[0.2em]" aria-label="Mon code ami">
          {data?.code ?? '······'}
        </p>
        <p className="text-muted text-sm font-bold">Donne-le à un copain (en vrai) pour qu’il t’ajoute.</p>
      </section>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) add.mutate();
        }}
      >
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="font-display text-lg tracking-wide">Ajouter un ami</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            autoComplete="off"
            placeholder="Son code (6 caractères)"
            className="cartoon bg-surface font-display min-h-14 px-4 text-2xl tracking-[0.15em] outline-none focus:ring-4 focus:ring-[var(--primary)]"
          />
        </label>
        <GameButton type="submit" icon="icons-navigation-plus" disabled={add.isPending || !code.trim()}>
          Ajouter
        </GameButton>
      </form>
      <p className="text-muted text-sm font-bold">
        Une amitié s’active quand ton copain l’accepte et qu’un parent de chaque famille la valide dans l’Espace parent.
        Entre amis : messages tout prêts et invitations à jouer, rien d’autre.
      </p>

      <ul className="flex flex-col gap-3" aria-label="Mes amis">
        {data?.friends.length === 0 && <li className="text-muted font-bold">Pas encore d’ami ajouté.</li>}
        {data?.friends.map((f) => (
          <li key={f.id} className="cartoon bg-surface flex flex-wrap items-center gap-3 p-3">
            <CharacterAvatar avatar={f.avatar} size={52} />
            <span className="min-w-0 flex-1">
              <span className="font-display block text-xl tracking-wide">{f.name}</span>
              <span className="text-muted text-sm font-bold">{STATUS_TEXT[f.status]}</span>
            </span>
            {f.status === 'recue' && (
              <GameButton size="sm" variant="success" onClick={() => accept.mutate(f.id)}>
                Accepter
              </GameButton>
            )}
            <GameButton
              size="sm"
              variant="surface"
              onClick={() => remove.mutate(f.id)}
              aria-label={`${f.status === 'recue' ? 'Refuser' : 'Retirer'} ${f.name}`}
            >
              {f.status === 'recue' ? 'Refuser' : 'Retirer'}
            </GameButton>
          </li>
        ))}
      </ul>
      {toast}
    </PageShell>
  );
}
