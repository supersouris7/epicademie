import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type FamilyFriend } from '@questeo/shared';
import { ApiError, request } from '../../shared/api/client.ts';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';

const STATUS: Record<FamilyFriend['status'], string> = {
  envoyee: 'demande envoyée, pas encore acceptée',
  recue: 'demande reçue, pas encore acceptée',
  parents: 'acceptée : en attente de validation',
  active: 'amis',
};

/**
 * Espace parent : amis des enfants dans d'autres familles. Une amitié ne s'active qu'avec
 * l'accord d'un parent de chaque famille ; on peut aussi la retirer à tout moment.
 */
export function FamilyFriends() {
  const qc = useQueryClient();
  const key = ['family-friends'];
  const { data } = useQuery({ queryKey: key, queryFn: () => request(api.familyFriends) });
  const [toast, showToast] = useToast(3000);
  const fail = (err: unknown) => showToast(err instanceof ApiError ? err.message : 'Problème de connexion');
  const approve = useMutation({
    mutationFn: (f: FamilyFriend) => request(api.approveFriend, { params: { id: f.profileId, friendId: f.id } }),
    onSuccess: (list) => {
      qc.setQueryData(key, list);
      showToast('Amitié validée.');
    },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: (f: FamilyFriend) => request(api.removeFriend, { params: { id: f.profileId, friendId: f.id } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
    onError: fail,
  });
  return (
    <section aria-labelledby="amis" className="cartoon bg-surface flex flex-col gap-3 p-4">
      <h2 id="amis" className="font-display text-2xl tracking-wide">
        Amis d’autres familles
      </h2>
      <p className="text-muted text-sm font-bold">
        Votre enfant ajoute un copain avec son code ami. L’amitié ne s’active qu’avec votre accord et celui d’un parent
        de l’autre famille. Entre amis : messages tout prêts et invitations à jouer, jamais de texte libre.
      </p>
      {data?.length === 0 && <p>Aucune demande pour l’instant.</p>}
      <ul className="flex flex-col gap-2">
        {data?.map((f) => (
          <li key={`${f.profileId}-${f.id}`} className="bg-surface-2 flex flex-wrap items-center gap-3 rounded-2xl p-2">
            <CharacterAvatar avatar={f.avatar} size={44} />
            <span className="min-w-0 flex-1">
              <span className="font-bold">
                {f.profileName} et {f.name}
              </span>
              <span className="text-muted block text-sm">
                {f.status === 'parents' && f.myParentOk
                  ? 'validée par vous : en attente de l’autre famille'
                  : STATUS[f.status]}
              </span>
            </span>
            {f.status === 'parents' && !f.myParentOk && (
              <GameButton size="sm" variant="success" onClick={() => approve.mutate(f)}>
                Valider
              </GameButton>
            )}
            <GameButton size="sm" variant="surface" onClick={() => remove.mutate(f)}>
              {f.status === 'active' ? 'Retirer' : 'Refuser'}
            </GameButton>
          </li>
        ))}
      </ul>
      {toast}
    </section>
  );
}
