import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { getChapter, getSkill } from '@questeo/content';
import { regularCount, type SkillState } from '@questeo/engine';
import type { Profile } from '@questeo/shared';
import { useDisabledSkills, useSkills } from './api.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { ProgressBar } from '../../shared/ui/game/ProgressBar.tsx';
import { ResourceCounter } from '../../shared/ui/game/ResourceCounter.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { Memo } from '../../shared/question/Memo.tsx';
import { useBackGuard, useGameExit } from '../../shared/lib/gameExit.ts';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.tsx';
import { HeroBubble } from '../../shared/battle/HeroBubble.tsx';
import { PauseButton } from '../../shared/question/PauseButton.tsx';
import { Results } from './TrainingResults.tsx';
import { TrainingQuestion } from './TrainingQuestion.tsx';
import { useTraining, type TrainingSetup } from './useTraining.ts';

/** Partie d’Entraînement : 4 questions (5 en calcul de tête) + variantes, correction après chaque réponse. */
export function TrainingPlay({ profile }: { readonly profile: Profile }) {
  const { chapterId = '', skillId = '' } = useParams();
  const chapter = getChapter(chapterId);
  const { data: disabled, isPending: disabledPending } = useDisabledSkills();
  // « Tout le chapitre » : sans les notions en maintenance.
  const skills = useMemo(
    () =>
      chapter
        ? skillId === 'tout'
          ? chapter.skills.map((s) => s.id).filter((id) => !disabled?.has(id))
          : [skillId]
        : [],
    [chapter, skillId, disabled],
  );
  const valid = chapter !== undefined && skills.every((id) => chapter.skills.some((s) => s.id === id));
  const { data: progress, isPending } = useSkills(profile.id);
  const location = useLocation();
  const { left } = useGameExit(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`);
  if (!valid) return <Navigate to="/jouer/entrainement" replace />;
  // Partie déjà quittée, revenue par « précédent » : on ne la relance pas (redirection en cours).
  if (left) return null;
  // La série se compose une fois les notions en maintenance connues.
  if (isPending || !progress || disabledPending) return <p className="p-8 text-xl">Chargement…</p>;
  const states = new Map<string, SkillState>(progress.map((p) => [p.skillId, p]));
  return <Game key={location.key} profile={profile} chapterId={chapterId} skills={skills} states={states} />;
}

/**
 * Écran d'une partie : en-tête (pause, héros, progression, XP), question en cours avec sa
 * correction, puis bilan. Le déroulé est dans `useTraining`, les règles dans `state.ts`.
 */
function Game(setup: TrainingSetup) {
  const { profile, chapterId } = setup;
  const navigate = useNavigate();
  const location = useLocation();
  const chapter = getChapter(chapterId);
  const [toast, showToast] = useToast(2500);
  const [memo, setMemo] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const { state: s, ...act } = useTraining(setup, showToast);

  const quit = () => setConfirmQuit(true);
  // Sorties : la partie est remplacée dans l'historique (« précédent » ne la relance pas).
  const { exit } = useGameExit(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`);
  // Quitter la partie ramène au menu principal.
  const leave = () => exit('/hub');
  // « Précédent » pendant la série : même confirmation que la Pause.
  const { rearm } = useBackGuard(!s.summary && !s.error, quit);

  if (s.error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={120} />
        <p className="text-xl font-bold">{s.error}</p>
        <GameButton onClick={leave}>Retour à l’accueil</GameButton>
      </div>
    );
  }

  if (s.summary)
    return (
      <Results
        summary={s.summary}
        missed={s.missed}
        gender={profile.gender}
        chapterId={chapterId}
        onExit={exit}
        onReplay={() => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } })}
      />
    );

  const skill = s.current ? getSkill(s.current.plan.skillId) : undefined;
  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
      <header className="flex shrink-0 items-center gap-3">
        <PauseButton onClick={quit} />
        <HeroBubble hero={profile.hero} face={s.hero.face} text={s.hero.text} nonce={s.hero.nonce} />
        <ProgressBar
          className="flex-1"
          value={regularCount(s.training)}
          max={s.training.length}
          label="Progression de la série"
          segments={s.training.length}
        />
        <ResourceCounter icon="icons-resources-xp" value={`+${s.xpTotal} XP`} label={`${s.xpTotal} XP gagnés`} />
      </header>

      {!s.current && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Questy mood="wow" size={120} />
          <p className="font-display text-2xl">{s.sessionId ? 'Calcul des résultats…' : 'C’est parti…'}</p>
        </div>
      )}

      <TrainingQuestion
        screen={s}
        skill={skill}
        gender={profile.gender}
        onPick={act.pick}
        onSubmit={act.submit}
        onNext={act.next}
        onMemo={() => {
          setMemo(true);
          act.reportConfused();
        }}
      />
      {memo && skill && <Memo skill={skill} onClose={() => setMemo(false)} />}
      {confirmQuit && (
        <ConfirmDialog
          title="Pause"
          message="Si tu quittes, cette série ne sera pas comptée."
          confirm="Quitter la série"
          mood="ok"
          cancel="Reprendre"
          onConfirm={leave}
          onCancel={() => {
            setConfirmQuit(false);
            rearm();
          }}
        />
      )}
      {toast}
    </div>
  );
}
