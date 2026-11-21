import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CHAT_EMOJIS, PRESET_MESSAGES, type OnlinePlayer, type Profile } from '@questeo/shared';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { useRealtime } from './store.ts';

/** Joueurs connectés : on peut leur envoyer un message (prédéfini ou emoji) ou les inviter dans l'arène. */
export function Online({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const online = useRealtime((s) => s.online);
  const others = online.filter((p) => p.id !== profile.id);
  const sendChat = useRealtime((s) => s.sendChat);
  const [to, setTo] = useState<OnlinePlayer | null>(null);
  const [toast, showToast] = useToast(2000);
  const send = (payload: Parameters<typeof sendChat>[1], text: string) => {
    if (!to) return;
    sendChat(to.id, payload);
    showToast(`Envoyé à ${to.name} : ${text}`);
    setTo(null);
  };

  return (
    <PageShell title="Joueurs connectés" back="/multi" nav={profile}>
      <div className="flex items-center gap-3">
        <Questy mood={others.length ? 'wow' : 'happy'} size={80} />
        <SpeechBubble>
          {others.length
            ? 'Envoie un message ou invite tes amis dans l’arène !'
            : 'Personne d’autre pour l’instant. Ouvre l’appli sur une autre tablette !'}
        </SpeechBubble>
      </div>

      <ul className="flex flex-col gap-3" aria-label="Joueurs connectés">
        {others.map((p) => (
          <li key={p.id} className="cartoon bg-surface flex flex-wrap items-center gap-3 p-3">
            <CharacterAvatar avatar={p.avatar} size={52} />
            <HeroFace hero={p.hero} expression="joie" size={44} />
            <span className="font-display min-w-0 flex-1 text-xl tracking-wide">
              {p.name}
              {p.friend && (
                <span role="img" aria-label="ami d’une autre famille" className="ml-1 text-base">
                  🤝
                </span>
              )}
              {p.busy && <span className="text-muted block text-sm font-bold">en arène</span>}
            </span>
            <GameButton size="sm" variant="surface" onClick={() => setTo(p)} aria-label={`Message à ${p.name}`}>
              💬 Message
            </GameButton>
            <GameButton
              size="sm"
              variant="danger"
              disabled={p.busy}
              onClick={() => void navigate(`/arene?invite=${p.id}`)}
              aria-label={`Inviter ${p.name} dans l’arène`}
            >
              ⚔️ Arène
            </GameButton>
          </li>
        ))}
      </ul>

      {/* Messages : prédéfinis et emoji seulement. */}
      {to && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Message à ${to.name}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
        >
          <div className="cartoon bg-surface flex max-h-[85dvh] w-full max-w-lg flex-col gap-3 overflow-y-auto p-4">
            <div className="flex items-center gap-3">
              <HeroFace hero={to.hero} expression="joie" size={44} />
              <h2 className="font-display flex-1 text-2xl tracking-wide">Message à {to.name}</h2>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setTo(null)}
                className="text-muted px-2 text-3xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1.5" aria-label="Emoji">
              {CHAT_EMOJIS.map((e, i) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => send({ kind: 'emoji', index: i }, e)}
                  className="cartoon-press bg-surface-2 rounded-xl py-1.5 text-2xl"
                  aria-label={`Envoyer ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2" aria-label="Messages">
              {PRESET_MESSAGES.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => send({ kind: 'preset', index: i }, m)}
                  className="cartoon cartoon-press bg-surface-2 px-3 py-2 text-left font-bold"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {toast}
    </PageShell>
  );
}
