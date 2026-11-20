import { motion } from 'motion/react';
import { getChapter, getSkill } from '@questeo/content';
import { accord, type Gender, type SessionSummary } from '@questeo/shared';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { Confetti } from '../../shared/ui/Confetti.tsx';
import { MedalBadge, RewardBadge } from '../../shared/ui/game/RewardBadge.tsx';
import { medal } from '@questeo/engine';
import { QuestyPose } from '../../shared/ui/mascot/QuestyPose.tsx';
import type { QuestyPoseId } from '../../shared/ui/mascot/poses.ts';
import { MathText } from '../../shared/question/MathText.tsx';
import type { MoodId } from '../../shared/ui/mascot/moods.ts';
import { medalMessage } from '../../shared/question/answers.ts';
import { ChestReveal } from '../../shared/ui/game/ChestReveal.tsx';

import type { Missed } from './types.ts';

/**
 * Bilan d'une partie d'entraînement : note sur 20, XP et pièces, coffre éventuel, médailles par
 * notion, récapitulatif des erreurs avec la bonne réponse, puis rejouer ou changer de notion.
 */
export function Results({
  summary,
  missed,
  gender,
  chapterId,
  exitTo,
  onExit,
  onReplay,
}: {
  summary: SessionSummary;
  missed: readonly Missed[];
  gender: Gender | null;
  chapterId: string;
  /** Page « Autre notion » (révisions : la matière) ; par défaut, la liste des notions du chapitre. */
  exitTo?: string;
  onExit: (to: string) => void;
  onReplay: () => void;
}) {
  const chapter = getChapter(chapterId);
  const { regular } = summary;
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
  const levelUp = summary.levelAfter > summary.levelBefore;
  const message = summary.perfect
    ? `Sans-faute, ${accord(gender, 'champion', 'championne')} !`
    : summary.scoreOn20 >= 14
      ? 'Très bien !'
      : summary.scoreOn20 >= 10
        ? 'C’est en bonne voie !'
        : 'On s’accroche, ça va venir !';
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-6">
      {(summary.perfect || levelUp) && <Confetti />}
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

      <ChestReveal chest={summary.chest} />

      {summary.variants.answered > 0 && (
        <p className="text-center text-lg font-bold">
          Questions similaires après erreur : {summary.variants.correct}/{summary.variants.answered} réussies.
        </p>
      )}

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

      {missed.length > 0 && (
        <details className="cartoon bg-surface p-4">
          <summary className="font-display cursor-pointer text-2xl tracking-wide">
            Tes erreurs ({missed.length}) : la bonne réponse
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {missed.map((m, i) => (
              <li key={i} className="bg-surface-2 rounded-2xl p-3 text-lg">
                <MathText text={m.prompt} />
                <span className="text-muted mt-1 block font-bold">
                  Réponse : <MathText text={m.answer} className="text-ink" />
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex flex-wrap justify-center gap-3">
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
      </div>
    </div>
  );
}
