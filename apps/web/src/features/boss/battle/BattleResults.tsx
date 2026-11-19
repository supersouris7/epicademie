import { useState } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router';
import { getSkill, type Chapter } from '@questeo/content';
import { accord, BOSS_MEDAL_LABELS, ITEM_INFO, ITEMS, type BattleSummary, type Profile } from '@questeo/shared';
import { BossSays, HeroSays } from '../../../shared/battle/BattleScenes.tsx';
import { bossSays, heroSays } from '../../../shared/lib/dialogue.ts';
import { Confetti } from '../../../shared/ui/Confetti.tsx';
import { CHEST_ICON } from '../../../shared/ui/game/ChestReveal.tsx';
import { GameButton } from '../../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../../shared/ui/game/GameIcon.tsx';
import { RewardBadge } from '../../../shared/ui/game/RewardBadge.tsx';
import { QuestyPose } from '../../../shared/ui/mascot/QuestyPose.tsx';
import { assetSrc } from '../../../design/assets.ts';
import { HeroFace } from '../../../shared/battle/HeroFace.tsx';
import { CharacterSprite } from '../../../shared/ui/game/CharacterSprite.tsx';
import { BOSS_MEDAL_ICONS, bossOf } from '../../../design/bosses.ts';
import { ITEM_ICONS } from '../../../design/items.ts';
import { RELICS } from '../../../design/relics.ts';

import { FROM_BATTLE } from './constants.ts';

/** Bilan du combat : victoire ou défaite, médaille, gains, et la suite proposée. */
export function BattleResults({
  summary,
  chapter,
  gender,
  hero,
  onExit,
}: {
  readonly summary: BattleSummary;
  readonly chapter: Chapter;
  readonly gender: Profile['gender'];
  readonly hero: Profile['hero'];
  readonly onExit: (to: string, state?: unknown) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const boss = bossOf(chapter);
  const weak = summary.weakSkill ? getSkill(summary.weakSkill) : undefined;
  const gained = ITEMS.filter((i) => (summary.items[i] ?? 0) > 0);
  const bossPose = assetSrc(`bosses-maths-${boss.id}-${summary.won ? 'ko' : 'shield'}`);
  // Le mot de la fin : le héros (victoire ou « je reviendrai ») et le boss (KO ou moqueur).
  const [lines] = useState(() => ({
    hero: heroSays(hero, summary.won ? 'victory' : 'defeat'),
    boss: bossSays(summary.won ? 'ko' : 'wins'),
  }));
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-6">
      {summary.won && <Confetti />}
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="flex items-end gap-2"
        >
          {/* Le héros en entier : victoire, ou la tête basse après une défaite. */}
          {summary.won ? (
            <CharacterSprite hero={hero} state="victory" height={150} />
          ) : (
            <HeroFace hero={hero} expression={lines.hero.face} size={110} />
          )}
          <QuestyPose pose={summary.won ? 'hero' : 'triste'} mood={summary.won ? 'proud' : 'sad'} size={110} />
          {/* Le boss : KO après une victoire, à l'abri derrière son bouclier après une défaite. */}
          {bossPose && (
            <img src={bossPose} alt="" aria-hidden className="h-[110px] w-[110px] object-contain sm:h-36 sm:w-36" />
          )}
        </motion.div>
        <h1 className="font-display text-4xl tracking-wide">
          {summary.won ? `${boss.name} est vaincu !` : `${boss.name} a gagné cette fois…`}
        </h1>
        {/* Échange final : le héros, puis le boss. */}
        <div className="flex w-full max-w-xl flex-col gap-2 text-left">
          <HeroSays hero={hero} face={lines.hero.face} text={lines.hero.text} delay={0.6} />
          <BossSays bossId={boss.id} name={boss.name} expression={lines.boss.face} text={lines.boss.text} delay={1.4} />
        </div>
        <p className="text-muted text-xl font-bold">
          {summary.won
            ? summary.hearts === 3
              ? `Sans perdre un cœur, ${accord(gender, 'champion', 'championne')} !`
              : `Il te restait ${summary.hearts} cœur${summary.hearts > 1 ? 's' : ''}.`
            : 'On s’entraîne un peu, et on revient le battre !'}
        </p>
      </div>

      {summary.medal && (
        <motion.section
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 12 }}
          className="cartoon bg-surface flex items-center gap-4 p-4"
        >
          <GameIcon id={BOSS_MEDAL_ICONS[summary.medal]} size={72} />
          <div className="flex min-w-0 flex-col">
            <h2 className="font-display text-2xl tracking-wide">Médaille {BOSS_MEDAL_LABELS[summary.medal]}</h2>
            <p className="text-muted font-bold">
              {summary.newBest ? 'Nouveau record sur ce boss !' : 'Ton record reste le même.'}{' '}
              {summary.medal === 'diamant'
                ? 'Sans perdre un cœur et sans objet : parfait !'
                : 'Diamant : gagne sans perdre de cœur et sans objet.'}
            </p>
          </div>
        </motion.section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <RewardBadge tone="gold" icon="icons-resources-xp" value={`+${summary.xpGained}`} label="XP" />
        <RewardBadge icon="icons-resources-coin" value={`+${summary.coinsGained}`} label="pièces" />
      </div>

      {summary.firstWin && (
        <motion.section
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="cartoon bevel bg-accent flex flex-col items-center gap-3 p-4 text-center"
        >
          <div className="flex items-end gap-3">
            <GameIcon id={CHEST_ICON} size={88} />
            <GameIcon id={RELICS[chapter.subject].icon} size={80} />
          </div>
          <h2 className="font-display text-toon text-2xl">1re victoire : le coffre et un éclat de relique !</h2>
          <p className="font-bold text-white">
            Tu gagnes un éclat du {RELICS[chapter.subject].name} : retrouve-le dans Mes progrès.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {gained.map((i) => (
              <span key={i} className="flex flex-col items-center gap-1 font-bold text-white">
                <GameIcon id={ITEM_ICONS[i]} size={56} />
                {ITEM_INFO[i].name} +{summary.items[i]}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {summary.levelAfter > summary.levelBefore && (
        <div className="cartoon bevel bg-accent font-display text-toon p-4 text-center text-3xl">
          Niveau {summary.levelAfter} atteint !
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {!summary.won && (
          <GameButton
            variant="success"
            size="lg"
            icon="icons-navigation-lesson"
            onClick={() =>
              onExit(
                weak
                  ? `/partie/entrainement/${chapter.id}/${weak.id}`
                  : `/jouer/entrainement/${chapter.subject}/${chapter.id}`,
              )
            }
          >
            {weak ? `On s’entraîne : ${weak.title}` : 'On s’entraîne'}
          </GameButton>
        )}
        <GameButton
          icon="icons-navigation-retry"
          onClick={() => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } })}
        >
          Rejouer
        </GameButton>
        <GameButton
          variant="accent"
          icon="icons-navigation-next"
          onClick={() => onExit(`/jouer/boss/${chapter.subject}?classe=${chapter.grade}`, FROM_BATTLE)}
        >
          Autres boss
        </GameButton>
        <GameButton variant="accent" icon="icons-navigation-home" onClick={() => onExit('/hub')}>
          Accueil
        </GameButton>
      </div>
    </div>
  );
}
