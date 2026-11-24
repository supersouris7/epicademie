import type { HeroId } from '@epicademie/shared';
import { BattleArena, type ArenaEnemy, type EnemyState } from '../../../shared/battle/BattleArena.tsx';
import { BossSays, HeroSays, QuestySays, Shake } from '../../../shared/battle/BattleScenes.tsx';
import type { ArrivalLines, IntroStage } from './state.ts';
import type { Exchange } from '../../../shared/lib/dialogue.ts';
import { BlinkText } from '../../../shared/ui/game/BlinkText.tsx';
import { PassZone } from '../../../shared/ui/game/PassZone.tsx';
import type { AnimationState } from '../../../design/assets.ts';
import { bossOf } from '../../../design/bosses.ts';

/**
 * Mise en scène en grand, personnages entiers : entrée en scène (face-à-face boss ↔ héros,
 * vannes aller-retour) ou arrivée du boss après le dernier mob (il se présente, le héros réagit,
 * Questy encourage). Sans bouton : un toucher sur l'écran (ou Entrée/Espace) fait avancer.
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
  readonly introStage: IntroStage;
  readonly arrival: boolean;
  readonly exchange: readonly Exchange[];
  readonly arrivalLines: ArrivalLines | null;
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
          entrance={arrival || introStage !== 'exit'}
          entranceSeconds={arrival ? 1.8 : 0.9}
        />
      </Shake>
      {/* Face-à-face : 4 répliques qui arrivent l'une après l'autre (vannes aller-retour). */}
      {!arrival &&
        exchange.map((e, i) =>
          e.speaker === 'boss' ? (
            <BossSays
              key={i}
              bossId={boss.id}
              name={boss.name}
              expression={e.line.face}
              text={e.line.text}
              delay={1 + i * 1.9}
            />
          ) : (
            <HeroSays key={i} hero={hero} face={e.line.face} text={e.line.text} delay={1 + i * 1.9} />
          ),
        )}
      {/* Arrivée du boss : il se présente, le héros réagit, Questy encourage. */}
      {arrival && arrivalLines && (
        <>
          <BossSays
            bossId={boss.id}
            name={boss.name}
            expression={arrivalLines.boss.face}
            text={arrivalLines.boss.text}
            delay={2.2}
          />
          <HeroSays hero={hero} face={arrivalLines.hero.face} text={arrivalLines.hero.text} delay={3.6} />
        </>
      )}
      {arrival && arrivalLines && <QuestySays text={arrivalLines.questy} pose="bravo" mood="proud" delay={4.8} />}
      {(arrival || introStage === 'boss') && (
        <>
          <PassZone onPass={onContinue} />
          <BlinkText
            className="font-display text-toon pointer-events-none self-center text-xl"
            delay={arrival ? 5.6 : 1 + exchange.length * 1.9}
          >
            Touche l’écran pour continuer
          </BlinkText>
        </>
      )}
    </div>
  );
}
