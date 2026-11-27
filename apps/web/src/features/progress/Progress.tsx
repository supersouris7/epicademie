import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { chaptersOf, DOMAINS, type DomainId } from '@epicademie/content';
import { MEDAL_LABELS, MEDALS, medal, type Medal as MedalId } from '@epicademie/engine';
import {
  ITEM_INFO,
  ITEMS,
  playedGrade,
  SUBJECTS,
  subjectLabel,
  type Grade,
  type Profile,
  type SkillProgress,
  type SubjectId,
} from '@epicademie/shared';
import { TrophiesSection } from './Trophies.tsx';
import { useBosses } from '../boss/index.ts';
import { relicProgressOf, useRelicProgress } from '../../shared/lib/relicProgress.ts';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { SubjectIcon } from '../../shared/ui/game/SubjectIcon.tsx';
import { ProgressBar } from '../../shared/ui/game/ProgressBar.tsx';
import { ITEM_ICONS } from '../../design/items.ts';
import { RELICS } from '../../design/relics.ts';
import { useSkills } from '../training/index.ts';
import { MedalBadge } from '../../shared/ui/game/RewardBadge.tsx';
import { GradeTabs } from '../../shared/ui/GradeTabs.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { SkillRadar } from '../../shared/ui/game/SkillRadar.tsx';
import { localToday } from '../../shared/lib/dates.ts';
import { useGradeChoice } from '../../shared/lib/grades.ts';
import { masteryOf } from '../../shared/lib/progress.ts';
import { useEntrance } from '../../shared/lib/entrance.ts';

/** Noms courts des domaines (axes de la toile). */
const DOMAIN_SHORT: Record<DomainId, string> = {
  nombres: 'Nombres',
  geometrie: 'Géométrie',
  grandeurs: 'Grandeurs',
  donnees: 'Données',
  fonctions: 'Fonctions',
  informatique: 'Programmation',
  langue: 'Langue',
  reperes: 'Repères',
  'physique-chimie': 'Physique-chimie',
  svt: 'SVT',
  technologie: 'Techno',
  grammaire: 'Grammaire',
  conjugaison: 'Conjugaison',
  orthographe: 'Orthographe',
  vocabulaire: 'Vocabulaire',
  lecture: 'Lecture',
  litterature: 'Littérature',
  histoire: 'Histoire',
  geographie: 'Géographie',
  emc: 'EMC',
  'comprehension-orale': 'Écoute',
  culture: 'Culture',
};

function countMedals(ids: readonly string[], states: ReadonlyMap<string, SkillProgress>) {
  const counts: Record<MedalId, number> = { aucune: 0, bronze: 0, argent: 0, or: 0, diamant: 0 };
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

/** Notions de la classe jouée dans une matière, et leurs médailles. */
function subjectTotals(subject: SubjectId, grade: Grade | undefined, states: ReadonlyMap<string, SkillProgress>) {
  const ids = chaptersOf(subject, grade).flatMap((c) => c.skills.map((s) => s.id));
  return { ids, counts: countMedals(ids, states) };
}

/**
 * « Mes progrès » (résumé) : une barre de progression par matière (notions médaillées de sa
 * classe) ; un toucher ouvre le détail de la matière. Trophées, badges et inventaire à part.
 */
export function Progress({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const { data } = useSkills(profile.id);
  const relicOf = useRelicProgress(profile);
  const states = new Map((data ?? []).map((s) => [s.skillId, s]));
  const grade = playedGrade(profile.grade);
  const subjects = SUBJECTS.filter((s) => chaptersOf(s.id, grade).length > 0);
  const all = subjects.map((s) => ({ subject: s, ...subjectTotals(s.id, grade, states) }));
  const totalIds = all.reduce((n, a) => n + a.ids.length, 0);
  const medaled = all.reduce((n, a) => n + a.ids.length - a.counts.aucune, 0);
  return (
    <PageShell title="Mes progrès" nav={profile}>
      <section className="cartoon bg-surface flex flex-wrap items-center gap-4 p-4">
        <Questy mood={medaled > 0 ? 'proud' : 'happy'} size={90} />
        <p className="font-display min-w-0 flex-1 text-2xl tracking-wide">
          {medaled} / {totalIds} notions médaillées
        </p>
      </section>
      <ul className="flex flex-col gap-3" aria-label="Progrès par matière">
        {all.map(({ subject: s, ids, counts }) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => void navigate(`/progres/${s.id}`)}
              className="cartoon cartoon-press bg-surface flex w-full items-center gap-3 p-3 text-left"
              aria-label={`${subjectLabel(s.id, grade)} : ${ids.length - counts.aucune} notions médaillées sur ${ids.length}`}
            >
              <SubjectIcon subject={s.id} name={subjectLabel(s.id, grade)} {...relicOf(s.id)} size={48} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-display text-xl tracking-wide">{subjectLabel(s.id, grade)}</span>
                <ProgressBar
                  value={ids.length - counts.aucune}
                  max={ids.length}
                  color={`var(--subject-${s.color})`}
                  label={`Progrès en ${subjectLabel(s.id, grade)}`}
                  size="sm"
                />
                <MedalCounts counts={counts} />
              </span>
              <span aria-hidden className="font-display text-2xl">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => void navigate('/progres/trophees')}
        className="cartoon cartoon-press bg-surface flex w-full items-center gap-3 p-3 text-left"
      >
        <GameIcon id="rewards-collectibles-trophy" size={48} />
        <span className="font-display flex-1 text-xl tracking-wide">Trophées, badges et inventaire</span>
        <span aria-hidden className="font-display text-2xl">
          ›
        </span>
      </button>
    </PageShell>
  );
}

/** Trophées (boss vaincus), badges, reliques et équipement. */
export function TrophiesPage({ profile }: { readonly profile: Profile }) {
  const { data: bosses } = useBosses(profile.id);
  return (
    <PageShell title="Trophées et badges" back="/progres" nav={profile}>
      <TrophiesSection profileId={profile.id} grade={playedGrade(profile.grade)} records={bosses?.records ?? []} />
      <section aria-labelledby="inventaire" className="cartoon bg-surface flex flex-col gap-3 p-3">
        <h2 id="inventaire" className="font-display text-2xl tracking-wide">
          Mon inventaire
        </h2>
        <div className="flex flex-wrap gap-3" aria-label="Reliques de boss">
          {SUBJECTS.filter((s) => s.available && chaptersOf(s.id).some((c) => c.boss)).map((s) => {
            // Toutes classes confondues : l'inventaire compte tous les éclats gagnés.
            const { won: shards, max } = relicProgressOf(s.id, undefined, bosses?.records ?? []);
            return (
              <div key={s.id} className="bg-surface-2 flex min-w-0 flex-1 basis-60 items-center gap-3 rounded-2xl p-2">
                <SubjectIcon subject={s.id} name={s.name} won={shards} max={max} size={60} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-display text-lg leading-tight tracking-wide">{RELICS[s.id].name}</span>
                  <ProgressBar
                    value={shards}
                    max={max}
                    color="var(--boss)"
                    label={`Éclats du ${RELICS[s.id].name}`}
                    size="sm"
                  />
                  <span className="text-muted text-xs font-bold">
                    {shards} éclat{shards > 1 ? 's' : ''} sur {max} · un par boss vaincu
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Équipement">
          <span className="text-muted font-bold">Équipement :</span>
          {ITEMS.map((item) => (
            <span
              key={item}
              className="bg-surface-2 font-display flex items-center gap-1 rounded-full py-0.5 pr-3 pl-1 text-lg"
              role="img"
              aria-label={`${ITEM_INFO[item].name} × ${bosses?.inventory[item] ?? 0}`}
            >
              <GameIcon id={ITEM_ICONS[item]} size={28} />× {bosses?.inventory[item] ?? 0}
            </span>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

/** Détail d'une matière : médailles par domaine, chapitre et notion. */
export function SubjectProgress({ profile }: { readonly profile: Profile }) {
  const enter = useEntrance();
  const navigate = useNavigate();
  const { subject: param = 'maths' } = useParams();
  const subject = SUBJECTS.find((s) => s.id === param)?.id ?? 'maths';
  const { data } = useSkills(profile.id);
  const relicOf = useRelicProgress(profile);
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
    const st = states.get(id);
    return st?.due != null && st.due <= today;
  }).length;
  const name = subjectLabel(subject, grade);

  return (
    <PageShell title={`Mes progrès · ${name}`} back="/progres" nav={profile}>
      <section className="cartoon bg-surface flex flex-wrap items-center gap-4 p-4">
        <SubjectIcon subject={subject} name={name} {...relicOf(subject, grade)} size={64} />
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
        Médaille d’une notion = sa meilleure série : Diamant tout réussi sans aide · Or tout réussi avec aide (notion
        acquise) · Argent plus qu’une question à réussir · Bronze deux. Une médaille gagnée reste à toi.
      </p>
      <GradeTabs grades={grades} value={grade} own={own} onChange={setGrade} />

      {/* Toile des compétences : part de notions acquises (Or ou Diamant) par domaine de la classe choisie. */}
      <SkillRadar
        title="Mes compétences (notions en or ou diamant)"
        axes={domains.map((d) => {
          const ids = chapters.filter((c) => c.domain === d).flatMap((c) => c.skills.map((s) => s.id));
          const counts = countMedals(ids, states);
          const gold = counts.or + counts.diamant;
          return {
            id: d,
            label: DOMAIN_SHORT[d],
            value: ids.length ? gold / ids.length : 0,
            detail: `${gold} notion${gold > 1 ? 's' : ''} en or ou diamant sur ${ids.length}`,
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
                      const mastery = masteryOf(st, profile.gender);
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
