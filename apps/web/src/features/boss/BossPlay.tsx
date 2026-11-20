import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { getChapter, type Chapter } from '@questeo/content';
import type { Profile } from '@questeo/shared';
import { RageScene, RetryCountdown } from '../../shared/battle/BattleScenes.tsx';
import { useBackGuard, useGameExit } from '../../shared/lib/gameExit.ts';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.tsx';
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
  // Arène tirée une fois par combat.
  const [arena] = useState(randomArena);
  const [memo, setMemo] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const { state: s, question, skill, ...act } = useBattle(profile, chapter, showToast);
  const exchange = useFaceOff(profile, chapter);

  // Sorties : le combat est remplacé dans l'historique (« précédent » ne le relance pas).
  const { exit } = useGameExit(`/jouer/boss/${chapter.subject}?classe=${chapter.grade}`, FROM_BATTLE);
  // Quitter la partie ramène au menu principal.
  const leave = () => exit('/hub');
  // « Précédent » pendant le combat : même confirmation que la Pause.
  const { rearm } = useBackGuard(!s.summary && !s.error, () => setConfirmQuit(true));
  const replay = () => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } });

  if (s.error) return <BattleFailure error={s.error} onReplay={replay} onLeave={leave} />;
  if (s.summary && s.retry) return <RetryCountdown hero={profile.hero} onRetry={replay} onSkip={act.skipRetry} />;
  if (s.summary)
    return (
      <BattleResults summary={s.summary} chapter={chapter} gender={profile.gender} hero={profile.hero} onExit={exit} />
    );

  const stage = { screen: s, hero: profile.hero, boss, arena };
  const staging = s.intro || s.arrival;
  // Question en cours, avec son énoncé généré (absente pendant les transitions).
  const asked =
    s.battle?.question && question ? { battle: { ...s.battle, question: s.battle.question }, question } : null;
  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
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
          onPause={() => setConfirmQuit(true)}
          onMemo={() => setMemo(true)}
          onNext={act.next}
        />
      ) : (
        <BattleWaiting started={s.battle !== null} bossName={boss.name} />
      )}
      {memo && skill && <Memo skill={skill} onClose={() => setMemo(false)} />}
      {confirmQuit && (
        <ConfirmDialog
          title="Pause"
          message="Si tu quittes, le boss garde ses vies : tu pourras revenir l’affronter."
          confirm="Quitter le combat"
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
