import { useState, type SubmitEvent } from 'react';
import { chaptersOf, isBossSkill } from '@questeo/content';
import {
  RECOMMENDATION_NOTE_MAX,
  RECOMMENDATION_PENDING_MAX,
  SUBJECTS,
  type FamilyRecommendation,
  type LearningReport,
  type Profile,
} from '@questeo/shared';
import { ApiError } from '../../shared/api/client.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { useFamilyRecommendations, useRecommendationActions } from './api.ts';
import { skillTitle, suggestedSkills } from './suggestions.ts';

const dateFr = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

/**
 * Espace parent, vue d'un enfant : « Recommander un entraînement » (matière, notion, petit mot) et suivi
 * des recommandations envoyées (en attente, faites avec date et score), annulables tant qu'elles attendent.
 */
export function RecommendTraining({ report, child }: { readonly report: LearningReport; readonly child: Profile }) {
  const { data } = useFamilyRecommendations();
  const { create, cancel } = useRecommendationActions(child.id);
  const mine = (data ?? []).filter((r) => r.profileId === child.id);
  const pending = mine.filter((r) => r.status === 'en-attente');
  const done = mine.filter((r) => r.status === 'faite');
  const full = pending.length >= RECOMMENDATION_PENDING_MAX;
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="recommander" className="bg-surface flex flex-col gap-3 rounded-2xl p-4 shadow-sm">
      <h2 id="recommander" className="text-lg font-bold">
        Recommander un entraînement
      </h2>
      <p className="text-sm">
        Choisissez une notion et, si vous voulez, laissez un petit mot : {child.name} le verra à l’accueil du jeu.
      </p>
      {pending.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Recommandations en attente">
          {pending.map((r) => (
            <li key={r.id} className="bg-surface-2 flex flex-wrap items-center gap-3 rounded-xl p-2">
              <RecoLine reco={r} status="En attente" />
              <button
                type="button"
                className="text-danger font-bold underline"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate(r.id)}
              >
                Annuler
              </button>
            </li>
          ))}
        </ul>
      )}
      {done.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Recommandations faites">
          {done.map((r) => (
            <li key={r.id} className="bg-surface-2 rounded-xl p-2">
              <RecoLine
                reco={r}
                status={`Faite le ${r.doneAt ? dateFr(r.doneAt) : ''} : ${r.correct ?? 0} réussie${(r.correct ?? 0) > 1 ? 's' : ''} sur ${r.answered ?? 0}`}
              />
            </li>
          ))}
        </ul>
      )}
      {full && (
        <p role="note" className="text-sm font-bold">
          {RECOMMENDATION_PENDING_MAX} recommandations sont déjà en attente : annulez-en une pour en envoyer une autre.
        </p>
      )}
      {!open ? (
        <GameButton disabled={full} onClick={() => setOpen(true)}>
          Recommander un entraînement
        </GameButton>
      ) : (
        <RecommendForm
          report={report}
          child={child}
          sending={create.isPending}
          error={
            create.error instanceof ApiError ? create.error.message : create.isError ? 'Problème de connexion' : null
          }
          onCancel={() => setOpen(false)}
          onSend={(skillId, note) => create.mutate({ skillId, note }, { onSuccess: () => setOpen(false) })}
        />
      )}
    </section>
  );
}

function RecoLine({ reco, status }: { readonly reco: FamilyRecommendation; readonly status: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="font-bold">{skillTitle(reco.skillId)}</p>
      <p className="text-muted text-sm">{status}</p>
      {reco.note && <p className="text-sm italic">« {reco.note} »</p>}
    </div>
  );
}

function RecommendForm({
  report,
  child,
  sending,
  error,
  onSend,
  onCancel,
}: {
  readonly report: LearningReport;
  readonly child: Profile;
  readonly sending: boolean;
  readonly error: string | null;
  readonly onSend: (skillId: string, note: string) => void;
  readonly onCancel: () => void;
}) {
  const subjects = SUBJECTS.filter((s) => s.available && chaptersOf(s.id, child.grade ?? undefined).length > 0);
  const [subject, setSubject] = useState('');
  const [skillId, setSkillId] = useState('');
  const [note, setNote] = useState('');
  const chapters = chaptersOf(subject, child.grade ?? undefined);
  const suggested = suggestedSkills(report, subject, chapters);
  const others = chapters
    .map((c) => ({ chapter: c, skills: c.skills.filter((s) => !isBossSkill(s.id) && !suggested.includes(s.id)) }))
    .filter((c) => c.skills.length > 0);
  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (skillId) onSend(skillId, note);
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-3" aria-label="Nouvelle recommandation">
      <label className="flex flex-col gap-1 font-bold">
        Matière
        <select
          className="bg-surface-2 rounded-xl p-2 font-normal"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setSkillId('');
          }}
        >
          <option value="">Choisir une matière</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      {subject && (
        <label className="flex flex-col gap-1 font-bold">
          Notion
          <select
            className="bg-surface-2 rounded-xl p-2 font-normal"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
          >
            <option value="">Choisir une notion</option>
            {suggested.length > 0 && (
              <optgroup label="Souvent ratées (d’après l’historique)">
                {suggested.map((id) => (
                  <option key={id} value={id}>
                    {skillTitle(id)}
                  </option>
                ))}
              </optgroup>
            )}
            {others.map(({ chapter, skills }) => (
              <optgroup key={chapter.id} label={chapter.title}>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      )}
      <label className="flex flex-col gap-1 font-bold">
        Un petit mot (facultatif)
        <textarea
          className="bg-surface-2 rounded-xl p-2 font-normal"
          rows={2}
          maxLength={RECOMMENDATION_NOTE_MAX}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex. Courage, je suis sûr que tu y arriveras !"
        />
        <span className="text-muted text-xs font-normal">
          {note.length} / {RECOMMENDATION_NOTE_MAX} caractères
        </span>
      </label>
      {error && (
        <p role="alert" className="text-danger font-bold">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <GameButton type="submit" disabled={!skillId || sending}>
          Envoyer à {child.name}
        </GameButton>
        <GameButton type="button" variant="surface" onClick={onCancel}>
          Fermer
        </GameButton>
      </div>
    </form>
  );
}
