import { motion } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { getChapter } from '@epicademie/content';
import type { Profile } from '@epicademie/shared';
import { useDisabledSkills, useSkills } from './api.ts';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { MedalBadge } from '../../shared/ui/game/RewardBadge.tsx';
import { medal } from '@epicademie/engine';
import { localToday } from '../../shared/lib/dates.ts';
import { masteryOf } from '../../shared/lib/progress.ts';
import { EPREUVE_SKILL } from './epreuve.ts';
import { useEntrance } from '../../shared/lib/entrance.ts';

/** Entraînement : « Épreuve du chapitre » ou une notion précise. */
export function Notions({ profile }: { readonly profile: Profile }) {
  const enter = useEntrance();
  const { subject = '', chapterId = '' } = useParams();
  const navigate = useNavigate();
  const chapter = getChapter(chapterId);
  const { data } = useSkills(profile.id);
  const { data: disabled } = useDisabledSkills();
  if (chapter?.subject !== subject) return <Navigate to={`/jouer/entrainement/${subject}`} replace />;
  const states = new Map((data ?? []).map((s) => [s.skillId, s]));
  const today = localToday();
  const play = (skill: string) => void navigate(`/partie/entrainement/${chapter.id}/${skill}`);
  return (
    <PageShell title={chapter.title} back={`/jouer/entrainement/${subject}?classe=${chapter.grade}`}>
      <button
        type="button"
        onClick={() => play(EPREUVE_SKILL)}
        className="cartoon cartoon-press bg-primary font-display flex min-h-20 flex-col items-center justify-center gap-1 p-2 text-2xl tracking-wide text-white"
      >
        <span>Épreuve du chapitre</span>
        <span className="font-body text-base font-bold tracking-normal">
          Réussis 80 % pour valider le chapitre et gagner son coffre
        </span>
      </button>
      <ul className="flex flex-col gap-3">
        {chapter.skills.map((s, i) => {
          const st = states.get(s.id);
          const m = masteryOf(st, profile.gender);
          const due = st?.due != null && st.due <= today;
          const off = disabled?.has(s.id) === true;
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
                disabled={off}
                className="cartoon cartoon-press bg-surface flex w-full flex-wrap items-center gap-3 p-4 text-left disabled:opacity-60"
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
                {off ? (
                  <span className="bg-surface-2 rounded-full px-3 py-1 text-sm font-bold">en maintenance</span>
                ) : (
                  due && <span className="bg-danger rounded-full px-3 py-1 text-sm font-bold text-white">à revoir</span>
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </PageShell>
  );
}
