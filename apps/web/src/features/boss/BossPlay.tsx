import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { getChapter, type Chapter, type Question } from '@epicademie/content';
import type { BattleView, Profile } from '@epicademie/shared';
import { RageScene, RetryCountdown } from '../../shared/battle/BattleScenes.tsx';
import { useBackGuard, useGameExit } from '../../shared/lib/gameExit.ts';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.tsx';
import { GameControls } from '../../shared/ui/game/GameControls.tsx';
import { Memo } from '../../shared/question/Memo.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { bossOf, randomArena } from '../../design/bosses.ts';
import { BattleIntro } from './battle/BattleIntro.tsx';
import { BattleQuestion } from './battle/BattleQuestion.tsx';
import { BattleResults } from './battle/BattleResults.tsx';
import { FROM_BATTLE } from './battle/constants.ts';
import { ActionScene, BattleFailure, BattleHud, BattleWaiting } from './battle/BattleStage.tsx';
import { stagedEnemy } from './battle/enemy.ts';
import { useFaceOff } from './battle/useFaceOff.ts';
import { useBattle } from './battle/useBattle.ts';

/** Combat de boss d'un chapitre (docs/SPEC.md §6.2 bis). */
export function BossPlay({ profile }: { readonly profile: Profile }) {
  const { chapterId = '' } = useParams();
  const location = useLocation();
  const chapter = getChapter(chapterId);
  const back = `/jouer/boss/${chapter?.subject ?? 'maths'}?classe=${chapter?.grade ?? ''}`;
  const { left } = useGameExit(back, FROM_BATTLE);
  if (!chapter?.boss) return <Navigate to="/jouer/boss/maths" replace />;
  // Combat déjà quitté, revenu par « précédent » : on ne le relance pas (redirection en cours).
  if (left) return null;
  return <Battle key={location.key} profile={profile} chapter={chapter} />;
}

/** Question en cours, avec son énoncé généré (absente pendant les transitions). */
const askedQuestion = (battle: BattleView | null, question: Question | null) =>
  battle?.question && question ? { battle: { ...battle, question: battle.question }, question } : null;

/**
 * Écran d'un combat : enchaîne entrée en scène, questions (bandeau + énoncé, ou scène d'action
 * en grand), arrivée et rage du boss, puis bilan. Le déroulé est dans `useBattle` (minuteurs,
 * serveur) et `battle/state.ts` (mise en scène) ; ce composant ne fait qu'afficher.
 */
function Battle({ profile, chapter }: { readonly profile: Profile; readonly chapter: Chapter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, showToast] = useToast(2500);
  const boss = bossOf(chapter);
  // Arène tirée une fois par combat, en rotation par profil.
  const [arena] = useState(() => randomArena(profile.id));
  const [memo, setMemo] = useState(false);
  /** Fenêtre ouverte : menu Pause, ou confirmation du bouton « Quitter ». */
  const [dialog, setDialog] = useState<'pause' | 'quit' | null>(null);
  const { state: s, question, skill, ...act } = useBattle(profile, chapter, showToast);
  const exchange = useFaceOff(profile, chapter);

  // Sorties : le combat est remplacé dans l'historique (« précédent » ne le relance pas).
  const { exit, restart } = useGameExit(`/jouer/boss/${chapter.subject}?classe=${chapter.grade}`, FROM_BATTLE);
  // Quitter la partie ramène au menu principal.
  const leave = () => exit('/hub');
  // « Précédent » pendant le combat : même confirmation que la Pause.
  const { rearm } = useBackGuard(!s.summary && !s.error, () => setDialog('pause'));
  const replay = () => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } });

  if (s.error) return <BattleFailure error={s.error} onReplay={replay} onLeave={leave} />;
  if (s.summary && s.retry) return <RetryCountdown hero={profile.hero} onRetry={replay} onSkip={act.skipRetry} />;
  if (s.summary)
    return (
      <BattleResults
        profileId={profile.id}
        summary={s.summary}
        chapter={chapter}
        gender={profile.gender}
        hero={profile.hero}
        onExit={exit}
      />
    );

  const stage = { screen: s, hero: profile.hero, boss, arena };
  const staging = s.intro || s.arrival;
  const asked = askedQuestion(s.battle, question);
  return (
    <div className={`mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 pt-16 pb-3 sm:px-4 ${staging ? '' : 'sm:pt-3'}`}>
      <GameControls onPause={() => setDialog('pause')} onQuit={() => setDialog('quit')} />
      {s.rage && (
        <RageScene bossId={boss.id} name={boss.name} stage={s.rage} lines={s.rageLines} onNext={act.nextRage} />
      )}
      {staging ? (
        // Entrée en scène ou arrivée du boss : en grand, personnages entiers.
        <BattleIntro
          hero={profile.hero}
          heroState={s.heroState}
          enemy={stagedEnemy(boss, s)}
          enemyState={s.enemyState}
          shield={s.battle?.shield ?? false}
          arena={arena}
          boss={boss}
          introStage={s.introStage}
          arrival={s.arrival}
          exchange={exchange}
          arrivalLines={s.arrivalLines}
          onContinue={act.continueIntro}
        />
      ) : (
        <BattleHud {...stage} />
      )}

      {staging ? null : s.scene ? (
        <ActionScene {...stage} />
      ) : asked ? (
        <BattleQuestion
          battle={asked.battle}
          question={asked.question}
          skill={skill}
          missed={s.missed}
          busy={s.busy}
          picked={s.picked}
          onPick={act.pick}
          onSubmit={act.submit}
          onUseItem={act.spendItem}
          onAskHint={act.askHint}
          onMemo={() => setMemo(true)}
          onNext={act.next}
        />
      ) : (
        <BattleWaiting started={s.battle !== null} bossName={boss.name} />
      )}
      {memo && skill && <Memo skill={skill} onClose={() => setMemo(false)} />}
      {dialog && (
        <QuitDialog
          paused={dialog === 'pause'}
          onRestart={restart}
          onQuit={leave}
          onResume={() => {
            setDialog(null);
            rearm();
          }}
        />
      )}
      {toast}
    </div>
  );
}

/** Menu Pause (ou confirmation du bouton « Quitter ») du combat. */
function QuitDialog(p: {
  readonly paused: boolean;
  readonly onRestart: () => void;
  readonly onQuit: () => void;
  readonly onResume: () => void;
}) {
  return (
    <ConfirmDialog
      title={p.paused ? 'Pause' : 'Quitter le combat ?'}
      message="Si tu quittes, le boss garde ses vies : tu pourras revenir l’affronter."
      confirm="Quitter le combat"
      mood="ok"
      cancel="Reprendre"
      extra={{ label: 'Recommencer', onClick: p.onRestart }}
      onConfirm={p.onQuit}
      onCancel={p.onResume}
    />
  );
}
