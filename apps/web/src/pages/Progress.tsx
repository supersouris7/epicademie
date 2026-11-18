import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { chaptersOf, DOMAINS, type DomainId } from '@questeo/content';
import { MEDAL_LABELS, MEDALS, medal, type Medal as MedalId } from '@questeo/engine';
import { SUBJECTS, type Profile, type SkillProgress, type SubjectId } from '@questeo/shared';
import { useSkills } from '../api/play.ts';
import { MedalBadge } from '../components/game/RewardBadge.tsx';
import { GradeTabs } from '../components/GradeTabs.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { SkillRadar } from '../components/game/SkillRadar.tsx';
import { localToday } from '../lib/dates.ts';
import { useGradeChoice } from '../lib/grades.ts';
import { masteryOf } from '../lib/progress.ts';
import { useEntrance } from '../lib/entrance.ts';

/** Noms courts des domaines (axes de la toile). */
const DOMAIN_SHORT: Record<DomainId, string> = {
  nombres: 'Nombres',
  geometrie: 'Géométrie',
  grandeurs: 'Grandeurs',
  donnees: 'Données',
  fonctions: 'Fonctions',
  informatique: 'Programmation',
};

function countMedals(ids: readonly string[], states: ReadonlyMap<string, SkillProgress>) {
  const counts: Record<MedalId, number> = { aucune: 0, bronze: 0, argent: 0, or: 0 };
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
  const enter = useEntrance();
  const navigate = useNavigate();
  const { data } = useSkills(profile.id);
  const [subject, setSubject] = useState<SubjectId>('maths');
  // Domaines ouverts (tous repliés à l'arrivée : la page reste courte sur téléphone).
  const [open, setOpen] = useState<ReadonlySet<DomainId>>(new Set());
  const toggle = (d: DomainId) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
  const states = new Map((data ?? []).map((s) => [s.skillId, s]));
  const today = localToday();
  const { grade, grades, own, setGrade } = useGradeChoice(profile, subject);
  const chapters = chaptersOf(subject, grade);
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
        <Questy mood={total.or > 0 ? 'proud' : 'happy'} size={110} />
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
        Médaille d’une notion = sa meilleure série de 5 questions : Bronze 3/5 · Argent 4/5 · Or 5/5, sans faute (notion
        acquise).
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
      <GradeTabs grades={grades} value={grade} own={own} onChange={setGrade} />

      {/* Toile des compétences : part de notions acquises (Or) par domaine de la classe choisie. */}
      <SkillRadar
        title="Mes compétences (notions en or)"
        axes={domains.map((d) => {
          const ids = chapters.filter((c) => c.domain === d).flatMap((c) => c.skills.map((s) => s.id));
          const gold = countMedals(ids, states).or;
          return {
            id: d,
            label: DOMAIN_SHORT[d],
            value: ids.length ? gold / ids.length : 0,
            detail: `${gold} notion${gold > 1 ? 's' : ''} en or sur ${ids.length}`,
          };
        })}
      />

      {chapters.length === 0 && <p className="text-xl font-bold">Les exercices de cette matière arrivent bientôt !</p>}

      {domains.map((d) => {
        const dChapters = chapters.filter((c) => c.domain === d);
        const ids = dChapters.flatMap((c) => c.skills.map((s) => s.id));
        const isOpen = open.has(d);
        return (
          <section key={d} className="flex flex-col gap-3">
            {/* Domaine replié par défaut : titre et médailles ; un toucher l'ouvre. */}
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`domaine-${d}`}
                onClick={() => toggle(d)}
                className="cartoon cartoon-press bg-surface flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left"
              >
                <span className="font-display min-w-[60%] flex-1 text-xl tracking-wide sm:text-2xl">{DOMAINS[d]}</span>
                <MedalCounts counts={countMedals(ids, states)} />
                <span className="text-muted text-sm font-bold">
                  {dChapters.length} chapitre{dChapters.length > 1 ? 's' : ''}
                </span>
                <span aria-hidden className={`font-display text-2xl transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  ›
                </span>
              </button>
            </h2>
            <div id={`domaine-${d}`} hidden={!isOpen} className="grid gap-4 lg:grid-cols-2">
              {dChapters.map((c, i) => (
                <motion.article
                  key={c.id}
                  initial={enter ? { y: 15, opacity: 0 } : false}
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
