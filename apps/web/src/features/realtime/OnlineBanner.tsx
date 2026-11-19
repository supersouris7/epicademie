import { useState } from 'react';
import { useNavigate } from 'react-router';
import { questySays } from '../../shared/lib/dialogue.ts';
import { useRealtime } from './store.ts';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';

/** Accueil : Questy annonce qui est connecté ; un toucher ouvre la liste des joueurs connectés. */
export function OnlineBanner({ meId }: { readonly meId: string }) {
  const navigate = useNavigate();
  const online = useRealtime((s) => s.online);
  const others = online.filter((p) => p.id !== meId);
  const [lines] = useState(() => ({ alone: questySays('hubAlone'), friends: questySays('hubFriends') }));
  const names = others.map((p) => p.name);
  const list =
    names.length <= 3
      ? names.join(', ').replace(/, ([^,]*)$/, ' et $1')
      : `${names.slice(0, 3).join(', ')} et ${names.length - 3} autres`;
  return (
    <button
      type="button"
      onClick={() => void navigate('/connectes')}
      className="cartoon cartoon-press bg-surface flex w-full items-center gap-3 p-2.5 text-left"
      aria-label={`Joueurs connectés : ${others.length}`}
    >
      <Questy mood={others.length ? 'wow' : 'happy'} size={56} />
      <span className="min-w-0 flex-1 font-bold">
        {others.length ? (
          <>
            {lines.friends} <span className="font-display text-lg tracking-wide">{list}</span> !
          </>
        ) : (
          lines.alone
        )}
      </span>
      <span className="flex -space-x-3" aria-hidden>
        {others.slice(0, 4).map((p) => (
          <HeroFace key={p.id} hero={p.hero} expression="joie" size={36} />
        ))}
      </span>
      <span className="font-display bg-success shrink-0 rounded-full px-2.5 py-0.5 text-white">{others.length}</span>
    </button>
  );
}
