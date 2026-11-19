import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { getChapter } from '@questeo/content';
import { useRealtime, type Notice } from '../realtime/store.ts';
import { useSession } from '../store/session.ts';
import { HeroFace } from './battle/HeroFace.tsx';
import { GameButton } from './game/GameButton.tsx';

/** Notifications en haut de l'écran : messages des autres joueurs et invitations à l'arène. */
export function Notifications() {
  const notices = useRealtime((s) => s.notices);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[60] mx-auto flex max-w-md flex-col gap-2 px-3">
      <AnimatePresence>
        {notices.map((n) => (
          <NoticeCard key={n.id} notice={n} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NoticeCard({ notice }: { readonly notice: Notice }) {
  const dismiss = useRealtime((s) => s.dismiss);
  const respond = useRealtime((s) => s.respondArena);
  const navigate = useNavigate();
  // Un message s'efface seul ; une invitation attend une réponse.
  useEffect(() => {
    if (notice.kind !== 'chat') return;
    const t = window.setTimeout(() => dismiss(notice.id), 6000);
    return () => window.clearTimeout(t);
  }, [notice, dismiss]);
  const from = notice.kind === 'chat' ? notice.message.from : notice.invite.from;
  return (
    <motion.div
      layout
      initial={{ y: -40, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -40, opacity: 0 }}
      role="alert"
      className="cartoon bg-surface pointer-events-auto flex items-center gap-3 p-2.5 shadow-xl"
    >
      <HeroFace hero={from.hero} expression={notice.kind === 'chat' ? 'joie' : 'determine'} size={44} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-base leading-tight tracking-wide">{from.name}</p>
        {notice.kind === 'chat' ? (
          <p className="text-lg leading-snug font-bold">{notice.message.text}</p>
        ) : (
          <p className="font-bold">t’invite dans l’arène : {getChapter(notice.invite.chapterId)?.title ?? 'maths'}</p>
        )}
      </div>
      {notice.kind === 'invite' ? (
        <div className="flex flex-col gap-1">
          <GameButton
            size="sm"
            variant="success"
            onClick={() => {
              respond(notice.invite.arenaId, true);
              dismiss(notice.id);
              void navigate('/arene');
            }}
          >
            J’y vais !
          </GameButton>
          <button
            type="button"
            className="text-muted text-sm font-bold underline"
            onClick={() => {
              respond(notice.invite.arenaId, false);
              dismiss(notice.id);
            }}
          >
            Non merci
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => dismiss(notice.id)}
          className="text-muted px-2 text-xl"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

/** Branche la connexion temps réel sur le profil choisi, et revient aux profils en cas de refus. */
export function RealtimeLink({ profileId }: { readonly profileId: string | null }) {
  const connect = useRealtime((s) => s.connect);
  const navigate = useNavigate();
  useEffect(() => {
    connect(profileId);
  }, [profileId, connect]);
  useEffect(() => {
    const onRefused = () => {
      useSession.getState().selectProfile(null);
      void navigate('/', { replace: true });
    };
    window.addEventListener('questeo:refused', onRefused);
    return () => window.removeEventListener('questeo:refused', onRefused);
  }, [navigate]);
  return null;
}
