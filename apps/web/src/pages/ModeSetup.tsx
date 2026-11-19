import { motion } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { chaptersOf } from '@questeo/content';
import { SUBJECTS, getMode, playedGrade, type Profile } from '@questeo/shared';
import { acquired } from '@questeo/engine';
import { useSkills } from '../api/play.ts';
import { useBosses } from '../api/battles.ts';
import { ProgressBar } from '../components/game/ProgressBar.tsx';
import { RELICS } from '../design/relics.ts';
import { MODE_MOODS } from '../lib/modes.ts';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { useToast } from '../components/Toast.tsx';
import { SoonBadge } from '../components/game/SoonBadge.tsx';
import { SubjectIcon } from '../components/game/SubjectIcon.tsx';
import { GameIcon } from '../components/game/GameIcon.tsx';
import { CHEST_ICON } from '../components/game/ChestReveal.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { useEntrance } from '../lib/entrance.ts';

/** Après le choix du mode : choix de la matière. */
export function ModeSetup({ profile }: { readonly profile: Profile }) {
  const enter = useEntrance();
  const { modeId = '' } = useParams();
  const mode = getMode(modeId);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();
  const { data: skills } = useSkills(profile.id);
  const { data: bosses } = useBosses(profile.id);
  if (!mode) return <Navigate to="/hub" replace />;
  const isBoss = mode.id === 'boss';
  // Barre sous chaque matière (classe du joueur) : notions acquises (Entraînement) ou boss vaincus (Combat).
  const grade = playedGrade(profile.grade);
  const progressOf = (subject: string) => {
    const chapters = chaptersOf(subject, grade);
    if (isBoss) {
      const ids = new Set(chapters.filter((c) => c.boss).map((c) => c.id));
      const won = (bosses?.records ?? []).filter((r) => ids.has(r.chapterId) && r.wins > 0).length;
      return { value: won, max: ids.size, text: `${won}/${ids.size} boss` };
    }
    const ids = chapters.flatMap((c) => c.skills.map((k) => k.id));
    const states = new Map((skills ?? []).map((k) => [k.skillId, k]));
    const gold = ids.filter((id) => acquired(states.get(id))).length;
    return { value: gold, max: ids.length, text: `${gold}/${ids.length} notions` };
  };
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
      {/* Combat de boss : chaque boss vaincu donne un éclat de la relique de sa matière. */}
      {isBoss && (
        <div className="cartoon bg-surface-2 flex items-center gap-3 p-3" role="note">
          <GameIcon id={RELICS.maths.icon} size={64} />
          <p className="text-lg font-bold">
            Chaque boss vaincu te donne un <strong>éclat de relique</strong> de sa matière (le {RELICS.maths.name} en
            maths). Retrouve tes reliques dans <strong>Mes progrès</strong> !
          </p>
        </div>
      )}
      {/* Entraînement : c'est ici qu'on gagne son équipement de combat. */}
      {mode.id === 'entrainement' && (
        <div className="cartoon bg-surface-2 flex items-center gap-3 p-3" role="note">
          <GameIcon id={CHEST_ICON} size={64} />
          <p className="text-lg font-bold">
            C’est ici que tu gagnes ton <strong>équipement</strong> ! Chaque série peut t’offrir un coffre (bouclier,
            soin, indice, pièces). Sans faute = coffre garanti.
          </p>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SUBJECTS.map((s, i) => (
          <motion.li
            key={s.id}
            className="relative"
            initial={enter ? { scale: 0.8, opacity: 0 } : false}
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
              {/* Combat de boss : l'icône est la relique de la matière, à gagner en battant ses boss. */}
              {isBoss ? <GameIcon id={RELICS[s.id].icon} size={80} /> : <SubjectIcon subject={s.id} size={72} />}
              <span className="font-display text-toon text-xl tracking-wide sm:text-2xl">{s.name}</span>
              {s.available &&
                chaptersOf(s.id).length > 0 &&
                (() => {
                  const p = progressOf(s.id);
                  return (
                    <span className="flex w-full flex-col items-center gap-0.5">
                      <ProgressBar
                        className="w-full"
                        value={p.value}
                        max={Math.max(1, p.max)}
                        color={isBoss ? 'var(--boss)' : 'var(--success)'}
                        label={isBoss ? `Boss vaincus en ${s.name}` : `Notions acquises en ${s.name}`}
                        size="sm"
                      />
                      <span className="text-toon text-xs font-bold text-white">{p.text}</span>
                    </span>
                  );
                })()}
            </button>
            {!s.available && <SoonBadge />}
          </motion.li>
        ))}
      </ul>
      {toast}
    </PageShell>
  );
}
