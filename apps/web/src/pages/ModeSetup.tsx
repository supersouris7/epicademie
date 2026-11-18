import { motion } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { chaptersOf } from '@questeo/content';
import { SUBJECTS, getMode } from '@questeo/shared';
import { MODE_MOODS } from '../lib/modes.ts';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { useToast } from '../components/Toast.tsx';
import { SoonBadge } from '../components/game/SoonBadge.tsx';
import { SubjectIcon } from '../components/game/SubjectIcon.tsx';
import { Questy } from '../components/mascot/Questy.tsx';

/** Après le choix du mode : choix de la matière. */
export function ModeSetup() {
  const { modeId = '' } = useParams();
  const mode = getMode(modeId);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();
  if (!mode) return <Navigate to="/hub" replace />;
  const back = mode.category === 'multi' ? '/multi' : '/hub';
  const playable = (mode.id === 'entrainement' || mode.id === 'boss') && mode.available;
  const pickSubject = (subject: string, name: string, available: boolean) => {
    if (!available || chaptersOf(subject).length === 0) showToast(`${name} arrive bientôt !`);
    else if (playable) void navigate(`/jouer/${mode.id}/${subject}`);
    else showToast(`${mode.name} arrive bientôt !`);
  };

  return (
    <PageShell title={mode.name} back={back}>
      <div className="flex items-center gap-4">
        <Questy size={130} mood={MODE_MOODS[mode.id]} />
        <SpeechBubble>{`${mode.pitch}. Choisis ta matière !`}</SpeechBubble>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SUBJECTS.map((s, i) => (
          <motion.li
            key={s.id}
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.05, type: 'spring', stiffness: 220, damping: 15 }}
          >
            <button
              type="button"
              onClick={() => pickSubject(s.id, s.name, s.available)}
              aria-label={s.available ? s.name : `${s.name}, à venir`}
              className={`cartoon bevel cartoon-press relative flex min-h-36 w-full flex-col items-center justify-center gap-2 p-4 hover:brightness-110 ${s.available ? '' : 'opacity-60 grayscale'}`}
              style={{ backgroundColor: `var(--subject-${s.color})` }}
            >
              <SubjectIcon subject={s.id} size={72} />
              <span className="font-display text-toon text-xl tracking-wide sm:text-2xl">{s.name}</span>
            </button>
            {!s.available && <SoonBadge />}
          </motion.li>
        ))}
      </ul>
      {toast}
    </PageShell>
  );
}
