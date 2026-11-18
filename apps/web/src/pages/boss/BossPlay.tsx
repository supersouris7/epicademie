import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { check, generate, getAnySkill, getChapter, getSkill, type Chapter, type Response } from '@questeo/content';
import { itemRefusal } from '@questeo/engine';
import {
  accord,
  BATTLE_MOBS,
  BOSS_MEDAL_LABELS,
  BOSS_LIVES,
  ITEM_INFO,
  ITEMS,
  type BattleSummary,
  type BattleView,
  type ItemId,
  type Profile,
} from '@questeo/shared';
import { answerBattle, bossesKey, finishBattle, sendBattleItem, startBattle, useBosses } from '../../api/battles.ts';
import { ApiError } from '../../api/client.ts';
import { BattleBar } from '../../components/battle/BattleBar.tsx';
import { BattleArena, type ArenaEnemy, type EnemyState } from '../../components/battle/BattleArena.tsx';
import { BossLivesBadge, BossSays, QuestySays, RetryCountdown, Shake } from '../../components/battle/BattleScenes.tsx';
import { faceOffTaunt, questyReply } from '../../lib/battleLines.ts';
import { DOCK_HEIGHT } from '../../lib/tools.ts';
import { ConfirmDialog } from '../../components/ConfirmDialog.tsx';
import { Confetti } from '../../components/Confetti.tsx';
import { Figure } from '../../components/figures/Figure.tsx';
import { GameButton } from '../../components/game/GameButton.tsx';
import { GameIcon } from '../../components/game/GameIcon.tsx';
import { RewardBadge } from '../../components/game/RewardBadge.tsx';
import { Questy } from '../../components/mascot/Questy.tsx';
import { QuestyPose } from '../../components/mascot/QuestyPose.tsx';
import { MathText } from '../../components/MathText.tsx';
import { Memo } from '../../components/play/Memo.tsx';
import { PauseButton } from '../../components/play/PauseButton.tsx';
import { QuestionTools } from '../../components/play/QuestionTools.tsx';
import { useToast } from '../../components/Toast.tsx';
import type { AnimationState, HeroExpression } from '../../design/assets.ts';
import { HeroFace } from '../../components/battle/HeroFace.tsx';
import { CharacterSprite } from '../../components/game/CharacterSprite.tsx';
import { BOSS_MEDAL_ICONS, bossOf, mobOf, randomArena } from '../../design/bosses.ts';
import { formatAnswer, formatResponse } from '../../lib/answers.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../lib/sound.ts';
import { ITEM_ICONS } from '../../design/items.ts';

/** Combat de boss d'un chapitre (docs/SPEC.md §6.2 bis). */
export function BossPlay({ profile }: { readonly profile: Profile }) {
  const { chapterId = '' } = useParams();
  const location = useLocation();
  const chapter = getChapter(chapterId);
  if (!chapter?.boss) return <Navigate to="/jouer/boss/maths" replace />;
  return <Battle key={location.key} profile={profile} chapter={chapter} />;
}

/** Après une erreur : ce qui s'est passé, avant de passer à la suite. */
interface Missed {
  readonly given: Response;
  readonly why?: string;
  readonly next: BattleView;
}

const STAGE_LABEL = { mob: 'Mob', probleme: 'Problème', piege: 'Piège !' } as const;
/** Durées de l'animation d'un tir (ms). */
const HIT_MS = 450;
const NEXT_MS = 1500;
/** Durée de la scène en grand après une erreur, avant l'explication. */
const MISS_SCENE_MS = 1400;
/** Entrée en scène avec le mot de Questy, puis arrivée du boss (le temps de lire). */
const INTRO_MS = 7000;
const ARRIVAL_MS = 4500;

function Battle({ profile, chapter }: { readonly profile: Profile; readonly chapter: Chapter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [toast, showToast] = useToast(2500);
  const boss = bossOf(chapter);
  // Arène tirée au hasard à chaque combat.
  const [arena] = useState(randomArena);
  const [battle, setBattle] = useState<BattleView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BattleSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [missed, setMissed] = useState<Missed | null>(null);
  /** Scène d'action en grand dans la zone de l'énoncé (tir, riposte, victoire, défaite). */
  const [scene, setScene] = useState(false);
  const [memo, setMemo] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [picked, setPicked] = useState<{ x: number; y: number } | null>(null);
  // Entrée en scène : le héros arrive en courant.
  const [heroState, setHeroState] = useState<AnimationState>('run');
  const [face, setFace] = useState<HeroExpression>('determine');
  /** Entrée en scène en grand, puis bandeau compact pour laisser la place aux énoncés. */
  const [intro, setIntro] = useState(true);
  // Face-à-face : le boss provoque (plus vexé s'il a déjà perdu sur ce chapitre), Questy répond.
  const [roll] = useState(Math.random);
  const { data: overview } = useBosses(profile.id);
  const beaten = (overview?.records ?? []).some((r) => r.chapterId === chapter.id && r.wins > 0);
  /** Arrivée du boss après le dernier mob : scène en grand, Questy félicite. */
  const [arrival, setArrival] = useState(false);
  /** Défaite : « On recommence ? » (5 s) avant le bilan. */
  const [retry, setRetry] = useState(false);
  const [enemyState, setEnemyState] = useState<EnemyState>('idle');
  const [shot, setShot] = useState(0);
  const [riposte, setRiposte] = useState(0);
  const shownAt = useRef(0);
  const started = useRef(false);
  const timers = useRef<number[]>([]);

  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    setSoundEnabled(profile.soundOn);
    preloadSounds();
  }, [profile.soundOn]);

  // Démarrage (une seule fois, même en StrictMode).
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startBattle(profile.id, chapter.id)
      .then((b) => {
        shownAt.current = performance.now();
        setBattle(b);
        later(900, () => setHeroState('idle'));
        later(INTRO_MS, () => setIntro(false));
      })
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError ? err.message : 'Impossible de lancer le combat. Le serveur est-il joignable ?',
        ),
      );
  }, [chapter.id, profile.id]);

  const q = battle?.question ?? null;
  const question = useMemo(() => (q ? generate(q.skillId, q.level, q.seed) : null), [q]);
  const skill = q ? getAnySkill(q.skillId) : undefined;
  const onBoss = battle ? battle.mobsDefeated >= BATTLE_MOBS : false;
  const enemy: ArenaEnemy | null = battle
    ? onBoss
      ? { key: 'boss', name: boss.name, boss: true, image: `bosses-maths-${boss.id}` }
      : (() => {
          const mob = mobOf(boss, battle.mobsDefeated);
          return {
            key: `mob-${battle.mobsDefeated}`,
            name: mob.charAt(0).toUpperCase() + mob.slice(1).replace(/-/g, ' '),
            boss: false,
            image: `bosses-minions-${mob}`,
          };
        })()
    : null;

  const finish = async (b: BattleView) => {
    try {
      const s = await finishBattle(b.id);
      playSound(s.won ? (s.levelAfter > s.levelBefore ? 'levelup' : 'finish') : 'wrong');
      if (!s.won) setRetry(true);
      setSummary(s);
      void qc.invalidateQueries({ queryKey: bossesKey(profile.id) });
      void qc.invalidateQueries({ queryKey: ['profiles'] });
    } catch {
      setError('Impossible d’enregistrer la fin du combat.');
    }
  };

  /** Passe à l'état suivant du combat ; fin de combat : pose finale puis résultats. */
  const advance = (next: BattleView) => {
    // Dernier mob battu : le boss arrive, en grand.
    if (next.status === 'fighting' && battle && battle.mobsDefeated < BATTLE_MOBS && next.mobsDefeated >= BATTLE_MOBS) {
      setArrival(true);
      playSound('reveal');
      later(ARRIVAL_MS, () => setArrival(false));
    }
    setMissed(null);
    setPicked(null);
    setScene(next.status !== 'fighting');
    setBattle(next);
    shownAt.current = performance.now();
    if (next.status === 'won') {
      setEnemyState('ko');
      setHeroState('victory');
      setFace('rire');
      later(1400, () => void finish(next));
    } else if (next.status === 'lost') {
      setHeroState('defeat');
      setFace('etourdi');
      later(1200, () => void finish(next));
    } else {
      setHeroState('idle');
      setEnemyState('idle');
      setFace(next.hearts === 1 ? 'determine' : 'confiant');
      setBusy(false);
    }
  };

  const submit = async (response: Response) => {
    if (!battle || !q || !question || busy || missed) return;
    const local = check(question, response);
    if (local.invalid) {
      showToast('Écris un nombre valide (ex. 3,5 ou −2).');
      return;
    }
    setBusy(true);
    try {
      const res = await answerBattle(battle.id, {
        skillId: q.skillId,
        level: q.level,
        seed: q.seed,
        response,
        durationMs: Math.round(performance.now() - shownAt.current),
      });
      if (res.invalid) {
        showToast('Écris un nombre valide (ex. 3,5 ou −2).');
        setBusy(false);
        return;
      }
      if (res.correct) {
        playSound('correct');
        setScene(true);
        setHeroState('shoot');
        setFace(battle.mobsDefeated >= BATTLE_MOBS ? 'enthousiaste' : 'joie');
        setShot((n) => n + 1);
        later(HIT_MS, () => setEnemyState('hurt'));
        later(NEXT_MS, () => advance(res.battle));
      } else {
        playSound('wrong');
        setScene(true);
        later(MISS_SCENE_MS, () => setScene(false));
        setEnemyState('attack');
        setRiposte((n) => n + 1);
        later(HIT_MS, () => {
          setHeroState(res.outcome === 'blocked' ? 'shield' : 'hurt');
          setFace(res.outcome === 'blocked' ? 'surprise' : res.battle.hearts <= 1 ? 'triste' : 'colere');
          setEnemyState('idle');
          // Le bouclier a servi : on l'enlève tout de suite de la scène.
          setBattle((b) => (b ? { ...b, shield: res.battle.shield, hearts: res.battle.hearts } : b));
        });
        setMissed({ given: response, why: local.why, next: res.battle });
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Réponse non envoyée (problème de connexion).');
      setBusy(false);
    }
  };

  const spendItem = async (item: ItemId) => {
    if (!battle || busy || missed) return;
    const refusal = battle.inventory[item] <= 0 ? 'Tu n’en as plus' : itemRefusal(battle, item);
    if (refusal) {
      showToast(refusal);
      return;
    }
    try {
      const next = await sendBattleItem(battle.id, item);
      playSound('reveal');
      setBattle(next);
      if (item === 'indice') setFace('reflexion');
      if (item === 'soin') setFace('joie');
      if (item === 'bouclier') {
        setHeroState('shield');
        later(900, () => setHeroState('idle'));
        later(2100, () => setIntro(false));
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Problème de connexion');
    }
  };

  const leave = () => void navigate(`/jouer/boss/${chapter.subject}?classe=${chapter.grade}`);

  if (error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={120} />
        <p className="text-xl font-bold">{error}</p>
        <GameButton onClick={leave}>Retour aux boss</GameButton>
      </div>
    );
  }

  const replay = () => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } });
  if (summary && retry) return <RetryCountdown hero={profile.hero} onRetry={replay} onSkip={() => setRetry(false)} />;
  if (summary) return <BattleResults summary={summary} chapter={chapter} gender={profile.gender} hero={profile.hero} />;

  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
      {intro || arrival ? (
        // Entrée en scène (mot de Questy) ou arrivée du boss : en grand, personnages entiers.
        <div
          className="relative flex flex-1 flex-col justify-center gap-3"
          data-testid={arrival ? 'boss-arrival' : 'battle-intro'}
        >
          <Shake delay={arrival ? 0.9 : 0} key={arrival ? 'arrival' : 'intro'}>
            <BattleArena
              hero={profile.hero}
              heroState={heroState}
              enemy={enemy}
              enemyState={enemyState}
              shot={0}
              riposte={0}
              shield={battle?.shield ?? false}
              arena={arena}
              sky={boss.sky}
              heroEntrance={!arrival}
              height={arrival ? 'min(46dvh, 460px)' : 'min(34dvh, 420px)'}
            />
          </Shake>
          <motion.p
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 12 }}
            className="font-display text-toon text-center text-4xl tracking-wide sm:text-5xl"
          >
            {arrival ? `${boss.name} arrive !` : onBoss ? boss.name : 'Combat !'}
          </motion.p>
          {arrival && <BossLivesBadge lives={BOSS_LIVES} />}
          {!arrival && (
            <BossSays
              bossId={boss.id}
              name={boss.name}
              text={faceOffTaunt(chapter.title, beaten, profile.gender, roll)}
              delay={1.1}
            />
          )}
          <QuestySays
            text={arrival ? 'Bravo, tous les mobs sont battus ! Presque fini : plus que le boss !' : questyReply(roll)}
            pose={arrival ? 'bravo' : 'montre'}
            mood={arrival ? 'proud' : 'happy'}
            delay={arrival ? 0.5 : 2.8}
          />
          <GameButton
            className="self-center"
            icon="icons-navigation-next"
            onClick={() => (arrival ? setArrival(false) : setIntro(false))}
          >
            {arrival ? 'Au combat !' : 'C’est parti !'}
          </GameButton>
        </div>
      ) : (
        <BattleBar
          hero={profile.hero}
          face={face}
          hearts={battle?.hearts ?? 3}
          maxHearts={battle?.maxHearts ?? 3}
          shield={battle?.shield ?? false}
          enemyName={enemy?.name ?? boss.name}
          enemyImage={enemy ? (enemy.boss ? `${enemy.image}-portrait` : enemy.image) : 'placeholder-boss'}
          enemyFilter={enemy?.filter}
          enemyKey={enemy?.key ?? 'boss'}
          bossLives={onBoss ? (battle?.bossLives ?? BOSS_LIVES) : null}
          bossMax={BOSS_LIVES}
          mobsLeft={BATTLE_MOBS - Math.min(battle?.mobsDefeated ?? 0, BATTLE_MOBS)}
          mobsMax={BATTLE_MOBS}
          shot={shot}
          riposte={riposte}
          arena={arena}
        />
      )}

      {intro || arrival ? null : scene ? (
        // Les coups se jouent en grand, personnages entiers, à la place de l'énoncé.
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <BattleArena
            hero={profile.hero}
            heroState={heroState}
            enemy={enemy}
            enemyState={enemyState}
            shot={shot}
            riposte={riposte}
            shield={battle?.shield ?? false}
            arena={arena}
            sky={boss.sky}
            entrance={false}
            height="min(58dvh, 520px)"
          />
        </div>
      ) : !battle || !question || !q ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Questy mood={battle ? 'wow' : 'angry'} size={100} />
          <p className="font-display text-2xl">{battle ? 'Fin du combat…' : `${boss.name} arrive…`}</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.main
            key={`${q.seed}-${battle.turn}`}
            data-turn={battle.turn}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] flex min-h-0 flex-1 flex-col gap-3"
          >
            <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-1 [&>*]:shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${q.stage === 'piege' ? 'bg-danger' : q.stage === 'probleme' ? 'bg-accent' : 'bg-info'}`}
                >
                  {STAGE_LABEL[q.stage]}
                </span>
                <span className="flex-1" />
                <ItemBar battle={battle} disabled={busy || missed !== null} onUse={(i) => void spendItem(i)} />
                <PauseButton onClick={() => setConfirmQuit(true)} />
              </div>
              <p className="text-muted text-sm font-bold">{skill?.title}</p>
              <h1 className="text-2xl leading-snug font-bold sm:text-3xl">
                <MathText text={question.prompt} />
              </h1>
              {battle.hintShown && (
                <p className="cartoon bg-surface-2 flex items-start gap-2 px-3 py-2 font-bold" role="note">
                  <GameIcon id="icons-navigation-hint" size="xs" />
                  <span>
                    <strong>Indice :</strong> <MathText text={question.hint} />
                  </span>
                </p>
              )}
              {question.figure && (
                <Figure
                  figure={question.figure}
                  maxHeight="var(--figure-max)"
                  picked={picked}
                  onPick={question.answer.kind === 'point' && !missed ? setPicked : undefined}
                  reveal={missed && question.answer.kind === 'point' ? question.answer : null}
                />
              )}
            </section>

            <section
              className={`side:h-[min(100%,520px)] side:self-center flex ${DOCK_HEIGHT} min-h-0 shrink-0 flex-col`}
            >
              {missed ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="cartoon flex min-h-0 flex-1 flex-col gap-2 bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] p-3"
                  aria-live="polite"
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                    <p className="text-lg leading-snug">
                      Tu as répondu <MathText text={formatResponse(question, missed.given)} className="font-bold" />. La
                      bonne réponse : <MathText text={formatAnswer(question)} className="font-bold" />.
                    </p>
                    {missed.why && (
                      <p className="text-lg">
                        <MathText text={missed.why} />
                      </p>
                    )}
                    <ol className="flex flex-col gap-1.5">
                      {question.steps.map((s, i) => (
                        <li key={i} className="bg-surface rounded-2xl p-2.5 text-lg leading-snug">
                          <MathText text={s} />
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    {skill && (
                      <GameButton
                        variant="surface"
                        size="sm"
                        icon="icons-navigation-hint"
                        onClick={() => setMemo(true)}
                      >
                        Le truc à retenir
                      </GameButton>
                    )}
                    <GameButton icon="icons-navigation-next" onClick={() => advance(missed.next)}>
                      {missed.next.status === 'fighting' ? 'Suivant' : 'Voir le résultat'}
                    </GameButton>
                  </div>
                </motion.div>
              ) : (
                <QuestionTools
                  key={`${q.seed}-${battle.turn}`}
                  question={question}
                  skill={skill}
                  picked={picked}
                  onSubmit={(r) => void submit(r)}
                />
              )}
            </section>
          </motion.main>
        </AnimatePresence>
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
          onCancel={() => setConfirmQuit(false)}
        />
      )}
      {toast}
    </div>
  );
}

/** Objets utilisables pendant le combat : 3 au plus, tous du même type (les autres sont verrouillés). */
function ItemBar({
  battle,
  disabled,
  onUse,
}: {
  readonly battle: BattleView;
  readonly disabled: boolean;
  readonly onUse: (item: ItemId) => void;
}) {
  return (
    <div className="flex gap-1.5" aria-label="Objets">
      {ITEMS.map((item) => {
        const count = battle.inventory[item];
        const off = disabled || count <= 0 || itemRefusal(battle, item) !== null;
        const locked = battle.itemType !== null && battle.itemType !== item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onUse(item)}
            aria-label={`${ITEM_INFO[item].name} (${count}) : ${ITEM_INFO[item].effect}`}
            title={ITEM_INFO[item].effect}
            className={`cartoon cartoon-press bg-surface-2 relative flex h-11 w-11 items-center justify-center ${off ? 'opacity-45' : ''}`}
          >
            <GameIcon id={ITEM_ICONS[item]} size="sm" />
            {locked && (
              <span className="absolute -top-1.5 -left-1.5">
                <GameIcon id="icons-status-locked" size={20} />
              </span>
            )}
            <span className="bg-accent absolute -right-1.5 -bottom-1.5 rounded-full px-1.5 text-xs font-bold text-white">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BattleResults({
  summary,
  chapter,
  gender,
  hero,
}: {
  readonly summary: BattleSummary;
  readonly chapter: Chapter;
  readonly gender: Profile['gender'];
  readonly hero: Profile['hero'];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const boss = bossOf(chapter);
  const weak = summary.weakSkill ? getSkill(summary.weakSkill) : undefined;
  const gained = ITEMS.filter((i) => (summary.items[i] ?? 0) > 0);
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
            <CharacterSprite hero={hero} state="victory" height={170} />
          ) : (
            <span className="relative flex flex-col items-center gap-2">
              {/* Le héros ne baisse pas les bras. */}
              <span className="cartoon font-display text-on-light rounded-2xl bg-white px-3 py-1 text-lg whitespace-nowrap">
                Je reviendrai plus {accord(gender, 'fort', 'forte')} !
              </span>
              <HeroFace hero={hero} expression="determine" size={130} />
            </span>
          )}
          <QuestyPose pose={summary.won ? 'hero' : 'triste'} mood={summary.won ? 'proud' : 'sad'} size={130} />
        </motion.div>
        <h1 className="font-display text-4xl tracking-wide">
          {summary.won ? `${boss.name} est vaincu !` : `${boss.name} a gagné cette fois…`}
        </h1>
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
          <h2 className="font-display text-toon text-2xl">1re victoire : le coffre !</h2>
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
              void navigate(
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
          onClick={() => void navigate(`/jouer/boss/${chapter.subject}?classe=${chapter.grade}`)}
        >
          Autres boss
        </GameButton>
        <GameButton variant="accent" icon="icons-navigation-home" onClick={() => void navigate('/hub')}>
          Accueil
        </GameButton>
      </div>
    </div>
  );
}
