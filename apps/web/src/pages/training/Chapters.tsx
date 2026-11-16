import { motion } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { chaptersOf } from '@questeo/content';
import { SUBJECTS, type Profile } from '@questeo/shared';
import { useSkills } from '../../api/play.ts';
import { PageShell } from '../../components/PageShell.tsx';
import { localToday } from '../../lib/dates.ts';
import { chapterProgress } from '../../lib/progress.ts';

/** Entraînement : choix du chapitre d'une matière. */
export function Chapters({ profile }: { readonly profile: Profile }) {
  const { subject = '' } = useParams();
  const navigate = useNavigate();
  const info = SUBJECTS.find((s) => s.id === subject);
  const chapters = chaptersOf(subject);
  const { data } = useSkills(profile.id);
  if (!info || chapters.length === 0) return <Navigate to="/jouer/entrainement" replace />;
  const states = new Map((data ?? []).map((s) => [s.skillId, s]));
  const today = localToday();
  return (
    <PageShell title={`Entraînement · ${info.name}`} back="/jouer/entrainement">
      <p className="text-muted text-lg font-bold">Choisis un chapitre du programme de 5e.</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c, i) => {
          const p = chapterProgress(
            c.skills.map((s) => s.id),
            states,
            today,
          );
          return (
            <motion.li
              key={c.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              <button
                type="button"
                onClick={() => void navigate(`/jouer/entrainement/${subject}/${c.id}`)}
                className="cartoon cartoon-press bg-surface flex w-full flex-col gap-2 p-4 text-left"
              >
                <span className="font-display text-2xl tracking-wide">{c.title}</span>
                <span className="text-muted text-sm font-bold">
                  {p.acquired} / {p.total} notion{p.total > 1 ? 's' : ''} acquise{p.total > 1 ? 's' : ''}
                </span>
                <span className="bg-surface-2 border-outline h-3 overflow-hidden rounded-full border-2">
                  <span className="bg-success block h-full" style={{ width: `${(p.acquired / p.total) * 100}%` }} />
                </span>
              </button>
              {p.due > 0 && (
                <span
                  className="cartoon bg-danger font-display absolute -top-3 -right-2 px-2 text-base text-white"
                  style={{ borderRadius: '9999px' }}
                >
                  {p.due} à revoir
                </span>
              )}
            </motion.li>
          );
        })}
      </ul>
    </PageShell>
  );
}
