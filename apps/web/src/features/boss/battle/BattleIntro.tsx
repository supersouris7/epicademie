import type { HeroId } from '@questeo/shared';
import { BOSS_LIVES } from '@questeo/shared';
import { BattleArena, type ArenaEnemy, type EnemyState } from '../../../shared/battle/BattleArena.tsx';
import { BossLivesBadge, BossSays, HeroSays, QuestySays, Shake } from '../../../shared/battle/BattleScenes.tsx';
import { faceOffExchange, type Line } from '../../../shared/lib/dialogue.ts';
import { GameButton } from '../../../shared/ui/game/GameButton.tsx';
import { type AnimationState, type BossExpression, type HeroExpression } from '../../../design/assets.ts';
import { bossOf } from '../../../design/bosses.ts';

/**
 * Mise en scène en grand, personnages entiers : entrée en scène (face-à-face boss ↔ héros,
 * vannes aller-retour) ou arrivée du boss après le dernier mob (il se présente, le héros réagit,
 * Questy encourage). Un bouton fait avancer.
 */
export function BattleIntro({
  hero,
  heroState,
  enemy,
  enemyState,
  shield,
  arena,
  boss,
  introStage,
  arrival,
  exchange,
  arrivalLines,
  onContinue,
}: {
  readonly hero: HeroId;
  readonly heroState: AnimationState;
  readonly enemy: ArenaEnemy | null;
  readonly enemyState: EnemyState;
  readonly shield: boolean;
  readonly arena: string;
  readonly boss: ReturnType<typeof bossOf>;
  readonly introStage: 'boss' | 'summon' | 'mob';
  readonly arrival: boolean;
  readonly exchange: ReturnType<typeof faceOffExchange>;
  readonly arrivalLines: { readonly boss: Line; readonly hero: Line; readonly questy: string } | null;
  readonly onContinue: () => void;
}) {
  return (
    <div
      className="relative flex flex-1 flex-col justify-center gap-3"
      data-testid={arrival ? 'boss-arrival' : 'battle-intro'}
    >
      <Shake delay={arrival ? 0.9 : 0} key={arrival ? 'arrival' : 'intro'}>
        <BattleArena
          hero={hero}
          heroState={heroState}
          enemy={enemy}
          enemyState={enemyState}
          shot={0}
          riposte={0}
          shield={shield}
          arena={arena}
          sky={boss.sky}
          heroEntrance={!arrival}
          entrance={arrival || introStage !== 'summon'}
          entranceSeconds={arrival ? 1.8 : 0.9}
          height={arrival ? 'min(46dvh, 460px)' : 'min(34dvh, 420px)'}
        />
      </Shake>
      {arrival && <BossLivesBadge lives={BOSS_LIVES} />}
      {/* Face-à-face : 4 répliques qui arrivent l'une après l'autre (vannes aller-retour). */}
      {!arrival &&
        exchange.map((e, i) =>
          e.speaker === 'boss' ? (
            <BossSays
              key={i}
              bossId={boss.id}
              name={boss.name}
              expression={e.line.face as BossExpression}
              text={e.line.text}
              delay={1 + i * 1.9}
            />
          ) : (
            <HeroSays key={i} hero={hero} face={e.line.face as HeroExpression} text={e.line.text} delay={1 + i * 1.9} />
          ),
        )}
      {/* Arrivée du boss : il se présente, le héros réagit, Questy encourage. */}
      {arrival && arrivalLines && (
        <>
          <BossSays
            bossId={boss.id}
            name={boss.name}
            expression={arrivalLines.boss.face as BossExpression}
            text={arrivalLines.boss.text}
            delay={2.2}
          />
          <HeroSays
            hero={hero}
            face={arrivalLines.hero.face as HeroExpression}
            text={arrivalLines.hero.text}
            delay={3.6}
          />
        </>
      )}
      {arrival && arrivalLines && <QuestySays text={arrivalLines.questy} pose="bravo" mood="proud" delay={4.8} />}
      {(arrival || introStage === 'boss') && (
        <GameButton className="self-center" icon="icons-navigation-next" onClick={onContinue}>
          {arrival ? 'Au combat !' : 'C’est parti !'}
        </GameButton>
      )}
    </div>
  );
}
