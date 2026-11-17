import { motion } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { chaptersOf } from '@questeo/content';
import { SUBJECTS, getMode } from '@questeo/shared';
import { GameButton } from '../components/game/GameButton.tsx';
import { MODE_MOODS } from '../lib/modes.ts';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { useToast } from '../components/Toast.tsx';
import { SubjectIcon } from '../components/game/SubjectIcon.tsx';
import { Questy } from '../components/mascot/Questy.tsx';

/** Après le choix du mode : choix de la matière (ou départ direct pour les modes toutes matières). */
export function ModeSetup() {
  const { modeId = '' } = useParams();
  const mode = getMode(modeId);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();
  if (!mode) return <Navigate to="/hub" replace />;
  const back = mode.category === 'multi' ? '/multi' : '/hub';
  const soon = () => showToast(`${mode.name} arrive bientôt !`);
  const pickSubject = (subject: string, name: string) => {
    if (mode.id === 'entrainement' && chaptersOf(subject).length > 0) void navigate(`/jouer/entrainement/${subject}`);
    else showToast(mode.id === 'entrainement' ? `${name} arrive bientôt !` : `${mode.name} arrive bientôt !`);
  };

  return (
    <PageShell title={mode.name} back={back}>
      <div className="flex items-center gap-4">
        <Questy size={88} mood={MODE_MOODS[mode.id]} />
        <SpeechBubble>{mode.scope === 'toutes' ? mode.pitch : `${mode.pitch}. Choisis ta matière !`}</SpeechBubble>
      </div>

      {mode.scope === 'toutes' ? (
        <GameButton size="xl" icon="icons-navigation-play" className="self-center" onClick={soon}>
          C’est parti !
        </GameButton>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {mode.scope === 'globale-ou-matiere' && (
            <li className="col-span-2 sm:col-span-3">
              <button
                type="button"
                onClick={soon}
                className="cartoon bevel cartoon-press bg-accent font-display text-toon min-h-20 w-full text-2xl tracking-wide"
              >
                Bilan global (toutes matières)
              </button>
            </li>
          )}
          {SUBJECTS.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.05, type: 'spring', stiffness: 220, damping: 15 }}
            >
              <button
                type="button"
                onClick={() => pickSubject(s.id, s.name)}
                className="cartoon bevel cartoon-press flex min-h-36 w-full flex-col items-center justify-center gap-2 p-4 hover:brightness-110"
                style={{ backgroundColor: `var(--subject-${s.color})` }}
              >
                <SubjectIcon subject={s.id} size={72} />
                <span className="font-display text-toon text-xl tracking-wide sm:text-2xl">{s.name}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
      {toast}
    </PageShell>
  );
}
