import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { chaptersOf, DOMAINS, type DomainId } from '@questeo/content';
import { MEDAL_LABELS, MEDALS, medal, type Medal as MedalId } from '@questeo/engine';
import { SUBJECTS, type Profile, type SkillProgress, type SubjectId } from '@questeo/shared';
import { useSkills } from '../api/play.ts';
import { MedalBadge } from '../components/game/RewardBadge.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { localToday } from '../lib/dates.ts';
import { masteryOf } from '../lib/progress.ts';

function countMedals(ids: readonly string[], states: ReadonlyMap<string, SkillProgress>) {
  const counts: Record<MedalId, number> = { aucune: 0, bronze: 0, argent: 0, or: 0, platine: 0 };
  for (const id of ids) counts[medal(states.get(id))]++;
  return counts;
}

function MedalCounts({ counts }: { readonly counts: Record<MedalId, number> }) {
  return (
    <div className="flex flex-wrap gap-3">
      {[...MEDALS].reverse().map((m) => (
        <span key={m} className="flex items-center gap-1 font-bold" aria-label={`${counts[m]} ${MEDAL_LABELS[m]}`}>
          <MedalBadge medal={m} size={28} label="" />
          <span className="font-display text-xl">{counts[m]}</span>
        </span>
      ))}
    </div>
  );
}

/** Tableau de bord : médailles par domaine, chapitre et notion. */
export function Progress({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const { data } = useSkills(profile.id);
  const [subject, setSubject] = useState<SubjectId>('maths');
  const states = new Map((data ?? []).map((s) => [s.skillId, s]));
  const today = localToday();
  const chapters = chaptersOf(subject);
  const allIds = chapters.flatMap((c) => c.skills.map((s) => s.id));
  const total = countMedals(allIds, states);
  const domains = (Object.keys(DOMAINS) as DomainId[]).filter((d) => chapters.some((c) => c.domain === d));
  const due = allIds.filter((id) => {
    const s = states.get(id);
    return s?.due != null && s.due <= today;
  }).length;

  return (
    <PageShell title="Mes progrès" nav={profile}>
      <section className="cartoon bg-surface flex flex-wrap items-center gap-4 p-4">
        <Questy mood={total.platine + total.or > 0 ? 'proud' : 'happy'} size={110} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-display text-2xl tracking-wide">
            {allIds.length - total.aucune} / {allIds.length} notions médaillées
          </p>
          <MedalCounts counts={total} />
        </div>
        {due > 0 && (
          <span className="bg-danger font-display rounded-full px-3 py-1 text-lg text-white">{due} à revoir</span>
        )}
      </section>

      <p className="text-muted text-sm font-bold">
        Bronze : 1re réussite · Argent : 2e réussite deux jours plus tard · Or : acquise (3e réussite une semaine après)
        · Platine : acquise, au moins 90 % de bonnes réponses récentes et un rappel mensuel réussi.
      </p>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Matières">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={subject === s.id}
            onClick={() => setSubject(s.id)}
            className={`cartoon cartoon-press font-display min-h-12 px-4 text-lg ${subject === s.id ? 'text-white' : 'bg-surface'}`}
            style={subject === s.id ? { backgroundColor: `var(--subject-${s.color})` } : undefined}
          >
            {s.name}
          </button>
        ))}
      </div>

      {chapters.length === 0 && <p className="text-xl font-bold">Les exercices de cette matière arrivent bientôt !</p>}

      {domains.map((d) => {
        const dChapters = chapters.filter((c) => c.domain === d);
        const ids = dChapters.flatMap((c) => c.skills.map((s) => s.id));
        return (
          <section key={d} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl tracking-wide">{DOMAINS[d]}</h2>
              <MedalCounts counts={countMedals(ids, states)} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {dChapters.map((c, i) => (
                <motion.article
                  key={c.id}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="cartoon bg-surface flex flex-col gap-2 p-4"
                >
                  <h3 className="font-display text-xl tracking-wide">{c.title}</h3>
                  <ul className="flex flex-col">
                    {c.skills.map((s) => {
                      const st = states.get(s.id);
                      const m = medal(st);
                      const mastery = masteryOf(st);
                      const isDue = st?.due != null && st.due <= today;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => void navigate(`/partie/entrainement/${c.id}/${s.id}`)}
                            className="hover:bg-surface-2 flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left"
                          >
                            <MedalBadge medal={m} size={30} label={MEDAL_LABELS[m]} />
                            <span className="min-w-0 flex-1 font-bold">{s.title}</span>
                            {isDue && (
                              <span className="bg-danger rounded-full px-2 text-xs font-bold text-white">à revoir</span>
                            )}
                            <span className="hidden text-xs font-bold sm:inline" style={{ color: mastery.color }}>
                              {mastery.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.article>
              ))}
            </div>
          </section>
        );
      })}
    </PageShell>
  );
}
