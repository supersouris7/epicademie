import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { check, generate, getAnySkill, getChapter, type Chapter, type Response } from '@questeo/content';
import { itemRefusal } from '@questeo/engine';
import {
  BATTLE_MOBS,
  BOSS_LIVES,
  type BattleSummary,
  type BattleView,
  type ItemId,
  type Profile,
} from '@questeo/shared';
import { answerBattle, bossesKey, finishBattle, sendBattleItem, startBattle, useBosses } from './api.ts';
import { ApiError } from '../../shared/api/client.ts';
import { BattleBar } from '../../shared/battle/BattleBar.tsx';
import { BattleArena, type ArenaEnemy, type EnemyState } from '../../shared/battle/BattleArena.tsx';
import { QuipRow, RageScene, RetryCountdown } from '../../shared/battle/BattleScenes.tsx';
import { faceOffTaunt } from '../../shared/lib/battleLines.ts';
import {
  bossSays,
  faceOffExchange,
  HERO_GENDER,
  heroSays,
  mobSays,
  questySays,
  type Line,
} from '../../shared/lib/dialogue.ts';
import { DOCK_HEIGHT } from '../../shared/question/tools.ts';
import { useBackGuard, useGameExit } from '../../shared/lib/gameExit.ts';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.tsx';
import { Figure } from '../../shared/question/figures/Figure.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { MathText } from '../../shared/question/MathText.tsx';
import { Memo } from '../../shared/question/Memo.tsx';
import { PauseButton } from '../../shared/question/PauseButton.tsx';
import { QuestionTools } from '../../shared/question/QuestionTools.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { type AnimationState, type BossExpression, type HeroExpression, type PiBotHead } from '../../design/assets.ts';
import { bossHeadId, bossMood, bossOf, mobHeadId, mobName, mobOf, randomArena } from '../../design/bosses.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../shared/lib/sound.ts';

import { useTimers } from '../../shared/lib/timers.ts';
import { BattleIntro } from './battle/BattleIntro.tsx';
import { BattleResults } from './battle/BattleResults.tsx';
import {
  ARRIVAL_MS,
  FINAL_POSE_MS,
  FROM_BATTLE,
  HIT_MS,
  INTRO_MS,
  MISS_SCENE_MS,
  NEXT_MS,
  RAGE_STEP_MS,
  STAGE_LABEL,
  type Missed,
} from './battle/constants.ts';
import { ItemBar } from './battle/ItemBar.tsx';
import { MissedPanel } from './battle/MissedPanel.tsx';

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
  /**
   * Début du combat : le Golem fait face au héros et provoque (« boss »), invoque ses mobs (« summon »),
   * puis s'efface et le 1er mob entre (« mob ») avant la 1re question.
   */
  const [introStage, setIntroStage] = useState<'boss' | 'summon' | 'mob'>('boss');
  const stageRef = useRef<'boss' | 'summon' | 'mob'>('boss');
  // Face-à-face : le boss provoque (plus vexé s'il a déjà perdu sur ce chapitre), Questy répond.
  const [roll] = useState(Math.random);
  const { data: overview } = useBosses(profile.id);
  const beaten = (overview?.records ?? []).some((r) => r.chapterId === chapter.id && r.wins > 0);
  // Face-à-face : échange de vannes boss ↔ héros (4 répliques), différent à chaque combat.
  const exchange = useMemo(
    () => faceOffExchange(profile.hero, faceOffTaunt(chapter.title, beaten, HERO_GENDER[profile.hero], roll)),
    [profile.hero, chapter.title, beaten, roll],
  );
  /** Arrivée du boss après le dernier mob : scène en grand, Questy félicite. */
  const [arrival, setArrival] = useState(false);
  /** Passage en rage (le boss n'a plus qu'une vie) : « début » puis « rage », plein écran. */
  const [rageScene, setRageScene] = useState<'debut' | 'montee' | 'rage' | null>(null);
  /** Défaite : « On recommence ? » (5 s) avant le bilan. */
  const [retry, setRetry] = useState(false);
  const [enemyState, setEnemyState] = useState<EnemyState>('idle');
  /** Tête du boss dans le bandeau : il réagit aux coups et aux erreurs. */
  const [bossFace, setBossFace] = useState<BossExpression>('menace');
  /** Tête du mob dans le bandeau : menaçant, triste quand il est touché, rieur quand le héros se trompe. */
  const [mobFace, setMobFace] = useState<PiBotHead>('menace');
  /** Petites répliques sous le bandeau (héros à gauche, adversaire à droite). */
  const [heroQuip, setHeroQuip] = useState<{ text: string; nonce: number } | null>(null);
  const [enemyQuip, setEnemyQuip] = useState<{ text: string; nonce: number } | null>(null);
  const say = (who: 'hero' | 'enemy', line: Line) => {
    const q = { text: line.text, nonce: Date.now() + Math.random() };
    if (who === 'hero') setHeroQuip(q);
    else setEnemyQuip(q);
  };
  /** Répliques de l'arrivée du boss et de sa rage (tirées au moment où elles se jouent). */
  const [arrivalLines, setArrivalLines] = useState<{ boss: Line; hero: Line; questy: string } | null>(null);
  const [rageLines, setRageLines] = useState({ debut: '', montee: '', rage: '' });
  const [shot, setShot] = useState(0);
  const [riposte, setRiposte] = useState(0);
  /** Dernier coup joué : la scène ne rejoue que lui (sinon l'ancien tir repart avec la riposte : tirs croisés). */
  const [lastHit, setLastHit] = useState<'shot' | 'riposte' | null>(null);
  const shownAt = useRef(0);
  const started = useRef(false);
  const later = useTimers();
  /** Le boss invoque ses mobs (une seule fois), puis le 1er mob entre et la 1re question arrive. */
  const sendMobs = useCallback(() => {
    if (stageRef.current !== 'boss') return;
    stageRef.current = 'summon';
    setIntroStage('summon');
    setEnemyState('summon');
    playSound('reveal');
    later(1400, () => {
      stageRef.current = 'mob';
      setIntroStage('mob');
      setEnemyState('idle');
    });
    later(2700, () => setIntro(false));
  }, [later]);

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
        later(INTRO_MS, () => sendMobs());
      })
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError ? err.message : 'Impossible de lancer le combat. Le serveur est-il joignable ?',
        ),
      );
  }, [chapter.id, profile.id, later, sendMobs]);

  const q = battle?.question ?? null;
  const question = useMemo(() => (q ? generate(q.skillId, q.level, q.seed) : null), [q]);
  const skill = q ? getAnySkill(q.skillId) : undefined;
  const onBoss = battle ? battle.mobsDefeated >= BATTLE_MOBS : false;
  const bossEnemy: ArenaEnemy = { key: 'boss', name: boss.name, boss: true, image: `bosses-maths-${boss.id}` };
  // En rage (dernière vie), le boss change d'apparence dans l'arène (sauf au KO, qui garde sa pose).
  const enraged = onBoss && battle?.bossLives === 1 && enemyState !== 'ko';
  const enemy: ArenaEnemy | null = battle
    ? onBoss
      ? {
          key: 'boss',
          name: boss.name,
          boss: true,
          image: enraged ? `bosses-maths-${boss.id}-rage-combat` : `bosses-maths-${boss.id}`,
        }
      : (() => {
          const mob = mobOf(boss, battle.mobsDefeated);
          return {
            key: `mob-${battle.mobsDefeated}`,
            name: mobName(mob),
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
  /** Scène de rage : début, puis rage, puis retour au combat (un toucher avance). */
  const nextRage = () => setRageScene((r) => (r === 'debut' ? 'montee' : r === 'montee' ? 'rage' : null));
  // Le temps de réponse de la question repart à la fin de la scène de rage.
  useEffect(() => {
    if (rageScene === null) shownAt.current = performance.now();
  }, [rageScene]);
  const advance = (next: BattleView) => {
    // Le boss tombe à sa dernière vie : il s'énerve et passe en rage.
    if (next.status === 'fighting' && battle && battle.bossLives > 1 && next.bossLives === 1) {
      setRageLines({
        debut: bossSays('rageDebut').text,
        montee: bossSays('rageMontee').text,
        rage: bossSays('rageCri').text,
      });
      setRageScene('debut');
      // Après la scène, le héros réagit.
      later(RAGE_STEP_MS * 3 + 300, () => {
        const l = heroSays(profile.hero, 'rage');
        setFace(l.face);
        say('hero', l);
      });
      playSound('reveal');
      later(RAGE_STEP_MS, () => setRageScene((r) => (r === 'debut' ? 'montee' : r)));
      later(RAGE_STEP_MS * 2, () => setRageScene((r) => (r === 'montee' ? 'rage' : r)));
      later(RAGE_STEP_MS * 3, () => setRageScene((r) => (r === 'rage' ? null : r)));
    }
    // Dernier mob battu : le boss arrive, en grand.
    if (next.status === 'fighting' && battle && battle.mobsDefeated < BATTLE_MOBS && next.mobsDefeated >= BATTLE_MOBS) {
      setArrival(true);
      setArrivalLines({
        boss: bossSays('arrival'),
        hero: heroSays(profile.hero, 'bossArrives'),
        questy: questySays('arrival'),
      });
      playSound('reveal');
      // Il arrive en invoquant ses opérations, l'air moqueur.
      setBossFace('moqueur');
      later(1800, () => setEnemyState('summon'));
      later(4500, () => setEnemyState('idle'));
      later(ARRIVAL_MS, () => {
        setArrival(false);
        setBossFace('menace');
      });
    }
    setMissed(null);
    setPicked(null);
    setMobFace('menace');
    setScene(next.status !== 'fighting');
    setBattle(next);
    shownAt.current = performance.now();
    if (next.status === 'won') {
      setEnemyState('ko');
      setBossFace('ko');
      say('enemy', bossSays('ko'));
      setHeroState('victory');
      setFace('rire');
      later(FINAL_POSE_MS, () => void finish(next));
    } else if (next.status === 'lost') {
      setBossFace('rire');
      say('enemy', bossSays('wins'));
      setHeroState('defeat');
      setFace('etourdi');
      later(FINAL_POSE_MS, () => void finish(next));
    } else {
      setHeroState('idle');
      // Le boss qui vient d'arriver garde sa pose d'invocation.
      if (!(battle && battle.mobsDefeated < BATTLE_MOBS && next.mobsDefeated >= BATTLE_MOBS)) setEnemyState('idle');
      if (next.mobsDefeated >= BATTLE_MOBS && battle && battle.mobsDefeated >= BATTLE_MOBS)
        setBossFace(bossMood(next.bossLives));
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
        const shout = heroSays(profile.hero, 'shoot');
        setFace(shout.face);
        say('hero', shout);
        setShot((n) => n + 1);
        setLastHit('shot');
        later(HIT_MS, () => {
          setEnemyState('hurt');
          // Touché : l'adversaire réagit (sa réplique choisit son expression).
          if (battle.mobsDefeated >= BATTLE_MOBS) {
            if (res.battle.bossLives > 0) {
              const l = bossSays('onHit');
              setBossFace(res.battle.bossLives === 1 ? 'furieux' : l.face);
              say('enemy', l);
            } else setBossFace('ko');
          } else {
            const l = mobSays('onHit');
            setMobFace(l.face);
            say('enemy', l);
          }
        });
        later(NEXT_MS, () => advance(res.battle));
      } else {
        playSound('wrong');
        setScene(true);
        later(MISS_SCENE_MS, () => setScene(false));
        setEnemyState('attack');
        // L'adversaire se moque de l'erreur (ou râle contre le bouclier).
        if (battle.mobsDefeated >= BATTLE_MOBS) {
          const l = bossSays(res.outcome === 'blocked' ? 'onShield' : 'onHeroMiss');
          setBossFace(l.face);
          say('enemy', l);
        } else {
          const l = mobSays('onHeroMiss');
          setMobFace(l.face);
          say('enemy', l);
        }
        setRiposte((n) => n + 1);
        setLastHit('riposte');
        later(HIT_MS, () => {
          setHeroState(res.outcome === 'blocked' ? 'shield' : 'hurt');
          const l = heroSays(profile.hero, res.outcome === 'blocked' ? 'shield' : 'hurt');
          setFace(l.face);
          say('hero', l);
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

  // Sorties : le combat est remplacé dans l'historique (« précédent » ne le relance pas).
  const { exit } = useGameExit(`/jouer/boss/${chapter.subject}?classe=${chapter.grade}`, FROM_BATTLE);
  // Quitter la partie ramène au menu principal.
  const leave = () => exit('/hub');
  // « Précédent » pendant le combat : même confirmation que la Pause.
  const { rearm } = useBackGuard(!summary && !error, () => setConfirmQuit(true));

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
  if (summary)
    return (
      <BattleResults summary={summary} chapter={chapter} gender={profile.gender} hero={profile.hero} onExit={exit} />
    );

  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
      {rageScene && (
        <RageScene bossId={boss.id} name={boss.name} stage={rageScene} lines={rageLines} onNext={nextRage} />
      )}
      {intro || arrival ? (
        // Entrée en scène (mot de Questy) ou arrivée du boss : en grand, personnages entiers.
        <BattleIntro
          hero={profile.hero}
          heroState={heroState}
          enemy={!arrival && introStage !== 'mob' ? bossEnemy : enemy}
          enemyState={enemyState}
          shield={battle?.shield ?? false}
          arena={arena}
          boss={boss}
          introStage={introStage}
          arrival={arrival}
          exchange={exchange}
          arrivalLines={arrivalLines}
          onContinue={() => (arrival ? setArrival(false) : sendMobs())}
        />
      ) : (
        <BattleBar
          hero={profile.hero}
          face={face}
          hearts={battle?.hearts ?? 3}
          maxHearts={battle?.maxHearts ?? 3}
          shield={battle?.shield ?? false}
          enemyName={enemy?.name ?? boss.name}
          enemyImage={
            enemy
              ? enemy.boss
                ? bossHeadId(boss.id, bossFace)
                : mobHeadId(mobOf(boss, battle?.mobsDefeated ?? 0), mobFace)
              : 'placeholder-boss'
          }
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
      {!(intro || arrival) && <QuipRow hero={heroQuip} enemy={enemyQuip} />}

      {intro || arrival ? null : scene ? (
        // Les coups se jouent en grand, personnages entiers, au milieu de l'écran (sur tout appareil).
        <div className="pointer-events-none fixed inset-0 z-20 mx-auto flex max-w-6xl flex-col justify-center px-3 pt-24 sm:px-4">
          <BattleArena
            hero={profile.hero}
            heroState={heroState}
            enemy={enemy}
            enemyState={enemyState}
            shot={lastHit === 'shot' ? shot : 0}
            riposte={lastHit === 'riposte' ? riposte : 0}
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
            className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] xl:side:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] flex min-h-0 flex-1 flex-col gap-3"
          >
            <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-1 [&>*]:shrink-0">
              <div className="flex items-center gap-2">
                {/* Étape du boss seulement (pas de « Mob », pas de titre de notion pendant le combat). */}
                {q.stage !== 'mob' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${q.stage === 'piege' ? 'bg-danger' : 'bg-accent'}`}
                  >
                    {STAGE_LABEL[q.stage]}
                  </span>
                )}
                <span className="flex-1" />
                <ItemBar battle={battle} disabled={busy || missed !== null} onUse={(i) => void spendItem(i)} />
                <PauseButton onClick={() => setConfirmQuit(true)} />
              </div>
              <h1 className="text-2xl leading-snug font-bold sm:text-3xl xl:text-4xl">
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
              className={`side:h-[min(100%,520px)] xl:side:h-[min(100%,680px)] side:self-center flex ${DOCK_HEIGHT} min-h-0 shrink-0 flex-col`}
            >
              {missed ? (
                <MissedPanel
                  question={question}
                  missed={missed}
                  canMemo={skill !== undefined}
                  onMemo={() => setMemo(true)}
                  onNext={() => advance(missed.next)}
                />
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
