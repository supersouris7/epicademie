import { useState } from 'react';
import { RecapScreen } from './GameRecap.tsx';
import { motion } from 'motion/react';
import { getChapter, getSkill } from '@epicademie/content';
import { accord, type Gender, type SessionSummary } from '@epicademie/shared';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { Confetti } from '../../shared/ui/Confetti.tsx';
import { MedalBadge, RewardBadge } from '../../shared/ui/game/RewardBadge.tsx';
import { medal } from '@epicademie/engine';
import { QuestyPose } from '../../shared/ui/mascot/QuestyPose.tsx';
import type { QuestyPoseId } from '../../shared/ui/mascot/poses.ts';
import type { MoodId } from '../../shared/ui/mascot/moods.ts';
import { medalMessage } from '../../shared/question/answers.ts';
import { ChestReveal } from '../../shared/ui/game/ChestReveal.tsx';

import type { Missed } from './types.ts';

/**
 * Bilan d'une partie d'entraînement en deux écrans : 1) récompenses seulement (note, XP, pièces,
 * coffre, médailles) ; 2) récap (erreurs avec la bonne réponse, conseil de Questy) puis rejouer ou
 * changer de notion.
 */
export function Results({
  profileId,
  summary,
  missed,
  gender,
  chapterId,
  epreuve = false,
  exitTo,
  onExit,
  onReplay,
}: {
  profileId: string;
  summary: SessionSummary;
  missed: readonly Missed[];
  gender: Gender | null;
  chapterId: string;
  /** Partie = Épreuve du chapitre. */
  epreuve?: boolean;
  /** Page « Autre notion » (révisions : la matière) ; par défaut, la liste des notions du chapitre. */
  exitTo?: string;
  onExit: (to: string) => void;
  onReplay: () => void;
}) {
  const chapter = getChapter(chapterId);
  const [screen, setScreen] = useState<'rewards' | 'recap'>('rewards');
  const { regular } = summary;
  const result = epreuve ? summary.epreuve : undefined;
  const failedEpreuve = result !== undefined && !result.passed;
  const levelUp = summary.levelAfter > summary.levelBefore;
  const { mood, pose, message } = tone(summary, result, gender);
  if (screen === 'recap') {
    return (
      <RecapScreen profileId={profileId} rows={summary.skills} table={false} missed={missed}>
        {summary.variants.answered > 0 && (
          <p className="w-full text-center text-lg font-bold">
            Questions similaires après erreur : {summary.variants.correct}/{summary.variants.answered} réussies.
          </p>
        )}
        {failedEpreuve && (
          <EpreuveAdvice weakest={summary.epreuve?.weakestSkillId ?? null} chapterId={chapterId} onGo={onExit} />
        )}
        <GameButton icon="icons-navigation-retry" onClick={onReplay}>
          Rejouer
        </GameButton>
        <GameButton
          variant="accent"
          icon="icons-navigation-next"
          onClick={() => onExit(exitTo ?? `/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`)}
        >
          Autre notion
        </GameButton>
        <GameButton variant="accent" icon="icons-navigation-home" onClick={() => onExit('/hub')}>
          Accueil
        </GameButton>
      </RecapScreen>
    );
  }
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-6">
      {(summary.perfect || levelUp || result?.passed === true) && <Confetti />}
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <QuestyPose pose={pose} mood={mood} size={150} />
        </motion.div>
        {/* Bandeau en CSS : ruban violet aux pointes repliées. */}
        <h1 className="relative mx-6 rounded-xl border-[3px] border-[var(--outline)] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-strong)] px-8 py-2 text-center shadow-[inset_0_2px_0_rgb(255_255_255/0.3),0_5px_0_var(--outline)]">
          <span
            aria-hidden
            className="absolute top-3 -left-6 -z-10 h-full w-8 rounded-l-md border-[3px] border-[var(--outline)] bg-[var(--accent-strong)] [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,40%_50%)]"
          />
          <span
            aria-hidden
            className="absolute top-3 -right-6 -z-10 h-full w-8 rounded-r-md border-[3px] border-[var(--outline)] bg-[var(--accent-strong)] [clip-path:polygon(0_0,100%_0,60%_50%,100%_100%,0_100%)]"
          />
          <span className="font-display text-toon text-3xl leading-tight tracking-wide sm:text-4xl">{message}</span>
        </h1>
        <p className="font-display text-6xl">
          {regular.correct}/{regular.answered}
        </p>
        <p className="text-muted text-xl font-bold">Note : {String(summary.scoreOn20).replace('.', ',')}/20</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <RewardBadge
          tone="gold"
          icon="icons-resources-xp"
          value={`+${summary.xpGained}`}
          label={`XP${summary.perfect ? ' (bonus sans-faute)' : ''}`}
        />
        <RewardBadge icon="icons-resources-coin" value={`+${summary.coinsGained}`} label="pièces" />
      </div>

      {levelUp && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="cartoon bevel bg-accent font-display text-toon p-4 text-center text-3xl"
        >
          Niveau {summary.levelAfter} atteint !
        </motion.div>
      )}

      <ChestOutcome summary={summary} chapterTitle={chapter?.title} />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Tes notions</h2>
        {summary.skills.map((s) => (
          <div key={s.skillId} className="cartoon bg-surface flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl tracking-wide">{getSkill(s.skillId)?.title}</p>
              <p className="text-muted font-bold">
                {s.correct}/{s.answered} · {medalMessage(s)}
              </p>
            </div>
            <MedalBadge medal={medal({ best: s.bestAfter })} size={48} />
          </div>
        ))}
      </section>

      <div className="flex justify-center">
        <GameButton size="lg" icon="icons-navigation-next" onClick={() => setScreen('recap')}>
          Suite
        </GameButton>
      </div>
    </div>
  );
}

/** Humeur de Questy, pose et message du bilan selon le score (et l'issue d'une épreuve). */
function tone(
  summary: SessionSummary,
  result: SessionSummary['epreuve'],
  gender: Gender | null,
): { mood: MoodId; pose: QuestyPoseId; message: string } {
  const mood: MoodId = summary.perfect
    ? 'proud'
    : summary.scoreOn20 >= 14
      ? 'happy'
      : summary.scoreOn20 >= 10
        ? 'ok'
        : 'sad';
  const pose: QuestyPoseId = summary.perfect
    ? 'hero'
    : summary.scoreOn20 >= 14
      ? 'bravo'
      : summary.scoreOn20 >= 10
        ? 'pouce'
        : 'triste';
  const message = result?.passed
    ? 'Chapitre validé !'
    : result && !result.passed
      ? 'Pas encore 80 %, tu y es presque !'
      : summary.perfect
        ? `Sans-faute, ${accord(gender, 'champion', 'championne')} !`
        : summary.scoreOn20 >= 14
          ? 'Très bien !'
          : summary.scoreOn20 >= 10
            ? 'C’est en bonne voie !'
            : 'On s’accroche, ça va venir !';
  return { mood, pose, message };
}

/** Coffre de fin de série ; pour une Épreuve du chapitre, sa validation (ou son échec) en plus. */
function ChestOutcome({ summary, chapterTitle }: { summary: SessionSummary; chapterTitle: string | undefined }) {
  const result = summary.epreuve;
  if (result && !result.passed) {
    return (
      <p className="cartoon bg-surface-2 p-3 text-center font-bold">
        Il faut 80 % de bonnes réponses pour valider le chapitre et gagner son coffre : pas de coffre cette fois.
      </p>
    );
  }
  return (
    <>
      {result && (
        <p className="cartoon bevel bg-accent font-display text-toon p-3 text-center text-2xl" role="status">
          {result.rewarded
            ? `Épreuve réussie : « ${chapterTitle ?? 'le chapitre'} » est validé, son trophée est à toi !`
            : 'Épreuve réussie ! Ce chapitre était déjà validé : pas de nouveau coffre « chapitre ».'}
        </p>
      )}
      <ChestReveal chest={summary.chest} />
    </>
  );
}

/** Épreuve ratée : conseil d'entraînement sur la notion la plus ratée (ou la liste des notions). */
function EpreuveAdvice({
  weakest,
  chapterId,
  onGo,
}: {
  readonly weakest: string | null;
  readonly chapterId: string;
  readonly onGo: (to: string) => void;
}) {
  const skill = weakest ? getSkill(weakest) : undefined;
  return (
    <section className="cartoon bg-surface flex w-full flex-col items-center gap-2 p-3 text-center">
      <p className="text-lg font-bold">
        {skill
          ? `Conseil de Questy : entraîne-toi sur « ${skill.title} », c’est la notion la plus ratée.`
          : 'Conseil de Questy : reprends les notions une par une.'}
      </p>
      {skill && (
        <GameButton icon="icons-navigation-next" onClick={() => onGo(`/partie/entrainement/${chapterId}/${skill.id}`)}>
          S’entraîner sur cette notion
        </GameButton>
      )}
    </section>
  );
}
