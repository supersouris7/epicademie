import { motion } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { getChapter } from '@questeo/content';
import type { Profile } from '@questeo/shared';
import { useSkills } from '../../api/play.ts';
import { PageShell } from '../../components/PageShell.tsx';
import { MedalBadge } from '../../components/game/RewardBadge.tsx';
import { medal } from '@questeo/engine';
import { localToday } from '../../lib/dates.ts';
import { masteryOf } from '../../lib/progress.ts';
import { useEntrance } from '../../lib/entrance.ts';

/** Entraînement : « Tout le chapitre » ou une notion précise. */
export function Notions({ profile }: { readonly profile: Profile }) {
  const enter = useEntrance();
  const { subject = '', chapterId = '' } = useParams();
  const navigate = useNavigate();
  const chapter = getChapter(chapterId);
  const { data } = useSkills(profile.id);
  if (chapter?.subject !== subject) return <Navigate to={`/jouer/entrainement/${subject}`} replace />;
  const states = new Map((data ?? []).map((s) => [s.skillId, s]));
  const today = localToday();
  const play = (skill: string) => void navigate(`/partie/entrainement/${chapter.id}/${skill}`);
  return (
    <PageShell title={chapter.title} back={`/jouer/entrainement/${subject}?classe=${chapter.grade}`}>
      <button
        type="button"
        onClick={() => play('tout')}
        className="cartoon cartoon-press bg-primary font-display min-h-20 text-2xl tracking-wide text-white"
      >
        Tout le chapitre ({chapter.skills.length} notions)
      </button>
      <ul className="flex flex-col gap-3">
        {chapter.skills.map((s, i) => {
          const st = states.get(s.id);
          const m = masteryOf(st);
          const due = st?.due != null && st.due <= today;
          return (
            <motion.li
              key={s.id}
              initial={enter ? { x: -20, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <button
                type="button"
                onClick={() => play(s.id)}
                className="cartoon cartoon-press bg-surface flex w-full flex-wrap items-center gap-3 p-4 text-left"
              >
                {/* Titre sur toute la largeur, état en dessous : rien n'écrase le titre sur téléphone. */}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-display text-xl tracking-wide">{s.title}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: m.color }}>
                      {m.label}
                    </span>
                    <MedalBadge medal={medal(st)} size={28} />
                  </span>
                </span>
                {due && <span className="bg-danger rounded-full px-3 py-1 text-sm font-bold text-white">à revoir</span>}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </PageShell>
  );
}
