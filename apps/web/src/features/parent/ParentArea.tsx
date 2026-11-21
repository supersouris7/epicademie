import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { isBossSkill } from '@questeo/content';
import { api, gradeInfo, type LearningReport, type Profile, type SkillLearning } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';
import { useSession } from '../../shared/lib/session.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { ParentCard, ParentShell } from './ParentShell.tsx';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { ParentUnlock, useMe } from '../account/index.ts';
import { useProfiles } from '../profiles/index.ts';
import { FamilyFriends } from './FamilyFriends.tsx';
import { WeakPoints } from './WeakPoints.tsx';
import {
  chapterTitle,
  skillTitle,
  STATUS_ORDER,
  statusLabel,
  subjectName,
  subjectsWorked,
  successPhrase,
  weekBars,
  weeklySummary,
} from './summary.ts';

/**
 * Espace parent : vue de chaque enfant, puis détail par matière, chapitre et notion, bilan de la
 * semaine et séance ciblée. Réservé au parent : le mot de passe du compte est demandé (verrou
 * parent, 10 minutes). Écrit pour un parent non technicien : des mots, peu de chiffres.
 */

const useLearning = (profileId: string) =>
  useQuery({
    queryKey: ['learning', profileId],
    queryFn: () => request(api.learningReport, { params: { id: profileId } }),
  });

/** Garde : sans déverrouillage parent récent, demande le code PIN (ou le mot de passe). */
function ParentGate({ children }: { readonly children: ReactNode }) {
  const { data: me } = useMe();
  if (me?.parent) return <>{children}</>;
  return (
    <ParentShell title="Espace parent" back="/">
      <div className="bg-surface mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl p-6 shadow-sm">
        <p className="text-center">Le suivi des enfants et les réglages du compte sont réservés au parent.</p>
        <ParentUnlock onUnlocked={() => undefined} />
      </div>
    </ParentShell>
  );
}

export function ParentHome() {
  const { data: profiles, isPending } = useProfiles();
  return (
    <ParentGate>
      <ParentShell title="Espace parent" back="/">
        {isPending && <p>Chargement…</p>}
        <section aria-labelledby="enfants" className="flex flex-col gap-3">
          <h2 id="enfants" className="text-lg font-bold">
            Vos enfants
          </h2>
          {profiles?.length === 0 && <p>Aucun profil enfant pour l’instant : créez-en un depuis le choix du joueur.</p>}
          <ul className="grid gap-4 md:grid-cols-2">
            {profiles?.map((p) => (
              <ChildCard key={p.id} profile={p} />
            ))}
          </ul>
        </section>
        <ParentCard title="Compte familial" id="compte">
          <ul className="divide-y divide-[var(--outline)]/10">
            <li>
              <Link to="/abonnement" className="flex items-center justify-between py-3 font-bold">
                Abonnement familial <span aria-hidden>›</span>
              </Link>
            </li>
            <li>
              <Link to="/parametres" className="flex items-center justify-between py-3 font-bold">
                Code PIN parent et réglages <span aria-hidden>›</span>
              </Link>
            </li>
          </ul>
        </ParentCard>
        <FamilyFriends />
      </ParentShell>
    </ParentGate>
  );
}

/** Chiffre clé d'un enfant : grand nombre, libellé court. */
function Metric({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div className="bg-surface-2 flex flex-col rounded-xl px-3 py-2">
      <span className="text-xl font-bold">{value}</span>
      <span className="text-muted text-xs font-bold">{label}</span>
    </div>
  );
}

function ChildCard({ profile: p }: { readonly profile: Profile }) {
  const { data: r } = useLearning(p.id);
  const week = r && weeklySummary(r);
  const current = r?.weeks.at(-1)?.tally;
  const rate = current && current.answered > 0 ? `${Math.round((100 * current.autonomous) / current.answered)} %` : '—';
  const last = r?.lastActivity
    ? new Date(r.lastActivity).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—';
  return (
    <li className="bg-surface flex flex-col gap-3 rounded-2xl p-4 shadow-sm" aria-label={`Progrès de ${p.name}`}>
      <div className="flex items-center gap-3">
        <CharacterAvatar avatar={p.avatar} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold">{p.name}</h3>
          <p className="text-muted text-sm">{p.grade ? gradeInfo(p.grade).name : 'Classe non renseignée'}</p>
        </div>
      </div>
      {r && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Metric value={String(week?.answered ?? 0)} label="questions cette semaine" />
            <Metric value={rate} label="réussite sans aide" />
            <Metric value={last} label="dernière activité" />
          </div>
          {r.subjects.length > 0 && (
            <p className="text-sm">
              <span className="text-muted font-bold">Matières : </span>
              {subjectsWorked(r).join(', ')}
            </p>
          )}
          {r.toRework.length > 0 && (
            <p className="text-sm">
              <span className="text-muted font-bold">À retravailler : </span>
              {r.toRework.map(skillTitle).join(', ')}
            </p>
          )}
          {r.dueReviews.length > 0 && <p className="text-sm">{r.dueReviews.length} révision(s) à faire.</p>}
        </>
      )}
      <Link
        to={`/parent/${p.id}`}
        className="bg-accent mt-auto rounded-xl px-4 py-2.5 text-center font-bold text-white"
      >
        Voir le suivi de {p.name}
      </Link>
    </li>
  );
}

export function ChildReport() {
  const { profileId = '' } = useParams();
  const { data: profiles } = useProfiles();
  const child = profiles?.find((p) => p.id === profileId);
  const { data: r, isPending } = useLearning(profileId);
  return (
    <ParentGate>
      <ParentShell title={child ? `Suivi de ${child.name}` : 'Suivi'} back="/parent">
        {isPending && <p>Chargement…</p>}
        {r && child && <ReportView report={r} child={child} />}
      </ParentShell>
    </ParentGate>
  );
}

function ReportView({ report: r, child }: { readonly report: LearningReport; readonly child: Profile }) {
  const week = weeklySummary(r);
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="bilan">
        <h2 id="bilan" className="text-lg font-bold">
          Bilan de la semaine
        </h2>
        <ul className="list-disc pl-5">
          {week.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <WeekChart report={r} />
      </section>
      <WeakPoints report={r} />
      <TargetedSession report={r} child={child} />
      <section aria-labelledby="matieres" className="flex flex-col gap-3">
        <h2 id="matieres" className="text-lg font-bold">
          Par matière
        </h2>
        {r.subjects.length === 0 && <p>Pas encore de réponse enregistrée.</p>}
        {r.subjects.map((s) => (
          <SubjectBlock key={s.subject} report={r} subject={s.subject} />
        ))}
      </section>
    </div>
  );
}

/** Questions par semaine (8 semaines) ; les chiffres sont écrits, la barre n'est qu'un repère. */
function WeekChart({ report }: { readonly report: LearningReport }) {
  const bars = weekBars(report);
  return (
    <figure className="mt-3">
      <figcaption className="text-muted text-sm font-bold">Questions par semaine (8 dernières semaines)</figcaption>
      <ol className="mt-2 flex h-28 items-end gap-2">
        {bars.map((b) => (
          <li key={b.week} className="flex flex-1 flex-col items-center gap-1 text-xs">
            <span>{b.answered}</span>
            <span
              className="bg-primary w-full rounded-t"
              style={{ height: `${Math.max(2, b.height * 64)}px` }}
              aria-hidden
            />
            <span className="text-muted">{b.label}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function SubjectBlock({ report: r, subject }: { readonly report: LearningReport; readonly subject: string }) {
  const chapters = r.chapters.filter((c) => c.subject === subject);
  const skills = r.skills.filter((s) => s.subject === subject);
  const tally = r.subjects.find((s) => s.subject === subject)?.tally;
  return (
    <details className="bg-surface rounded-2xl shadow-sm p-4">
      <summary className="cursor-pointer font-bold">
        {subjectName(subject)} — {tally ? successPhrase(tally) : ''}
      </summary>
      <ul className="mt-3 flex flex-col gap-3">
        {chapters.map((c) => (
          <li key={c.chapterId}>
            <p className="font-bold">{chapterTitle(skills.find((s) => s.chapterId === c.chapterId)?.skillId ?? '')}</p>
            <p className="text-sm">{successPhrase(c.tally) ?? 'Pas encore de réponse.'}</p>
            <ul className="mt-1 flex flex-col gap-1">
              {skills
                .filter((s) => s.chapterId === c.chapterId)
                .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
                .map((s) => (
                  <SkillLine key={s.skillId} skill={s} />
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </details>
  );
}

function SkillLine({ skill: s }: { readonly skill: SkillLearning }) {
  return (
    <li className="text-sm">
      <span className="font-bold">{skillTitle(s.skillId)}</span> — {statusLabel(s.status)}
      {s.trend === 'hausse' && ' · en progrès'}
      {s.trend === 'baisse' && ' · en baisse'}
      {s.recurringErrors.length > 0 && (
        <span className="text-muted block">Erreur fréquente : {s.recurringErrors[0]?.text}</span>
      )}
    </li>
  );
}

/** Séance ciblée : le parent choisit des notions, l'enfant joue une série sur celles-ci. */
function TargetedSession({ report: r, child }: { readonly report: LearningReport; readonly child: Profile }) {
  const navigate = useNavigate();
  const selectProfile = useSession((s) => s.selectProfile);
  const candidates = [
    ...new Set([
      ...r.toRework,
      ...r.dueReviews,
      ...r.skills.filter((s) => s.status === 'en-progression').map((s) => s.skillId),
    ]),
  ]
    // Les problèmes et pièges de boss ne se jouent qu'en combat.
    .filter((id) => !isBossSkill(id))
    .slice(0, 8);
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set(r.toRework.slice(0, 3)));
  if (candidates.length === 0) return null;
  const toggle = (id: string) =>
    setChosen((c) => {
      const next = new Set(c);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <section aria-labelledby="seance" className="bg-surface rounded-2xl shadow-sm flex flex-col gap-2 p-4">
      <h2 id="seance" className="text-lg font-bold">
        Préparer une séance ciblée
      </h2>
      <p className="text-sm">Choisis les notions à travailler : {child.name} jouera une série de questions dessus.</p>
      <ul className="flex flex-col gap-1">
        {candidates.map((id) => (
          <li key={id}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={chosen.has(id)} onChange={() => toggle(id)} />
              {skillTitle(id)}
            </label>
          </li>
        ))}
      </ul>
      <GameButton
        disabled={chosen.size === 0}
        onClick={() => {
          selectProfile(child.id);
          void navigate(`/partie/entrainement/seance/${[...chosen].join('+')}`);
        }}
      >
        Lancer la séance pour {child.name}
      </GameButton>
    </section>
  );
}
