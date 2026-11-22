import { bossOf } from '../../../design/bosses.ts';
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { check, generate, getAnySkill, type Chapter, type Response } from '@questeo/content';
import { itemRefusal } from '@questeo/engine';
import type { BattleView, ItemId, Profile } from '@questeo/shared';
import { answerBattle, bossesKey, finishBattle, sendBattleItem, startBattle } from '../api.ts';
import { ApiError } from '../../../shared/api/client.ts';
import { bossSays, heroSays, mobSays, questySays } from '../../../shared/lib/dialogue.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../../shared/lib/sound.ts';
import { useTimers } from '../../../shared/lib/timers.ts';
import { FINAL_POSE_MS, HIT_MS, INTRO_MS, MISS_SCENE_MS, NEXT_MS, RAGE_STEP_MS } from './constants.ts';
import {
  bossArrives,
  bossEnrages,
  createBattleReducer,
  initialBattleScreen,
  type BattleError,
  type BattleScreen,
} from './state.ts';

/**
 * Déroulé d'un combat de boss : appels au serveur, sons et minuteurs de la mise en scène.
 * Les décisions (qui réagit, quelle pose, quelle scène) sont dans `state.ts` ; ici, le
 * « quand » : chaque étape envoie un événement au réducteur, immédiatement ou après un délai
 * (minuteurs annulés si l'écran est quitté).
 */

const INVALID_NUMBER = 'Écris un nombre valide (ex. 3,5 ou −2).';

/** Erreur bloquante à afficher ; un combat expiré (mise à jour du jeu) peut être relancé. */
const blocking = (err: unknown, fallback: string): BattleError =>
  err instanceof ApiError
    ? { message: err.message, canReplay: err.code === 'GONE' }
    : { message: fallback, canReplay: false };

export function useBattle(profile: Profile, chapter: Chapter, notify: (message: string) => void) {
  const qc = useQueryClient();
  const later = useTimers();
  const reducer = useMemo(
    () =>
      createBattleReducer({
        hero: (moment) => heroSays(profile.hero, moment),
        boss: (moment) => bossSays(moment, bossOf(chapter).id),
        mob: mobSays,
        questy: questySays,
      }),
    [profile.hero, chapter],
  );
  const [state, dispatch] = useReducer(reducer, initialBattleScreen);
  // Dernier état affiché, lu par les actions et les minuteurs (qui survivent aux rendus).
  const latest = useRef<BattleScreen>(state);
  useLayoutEffect(() => {
    latest.current = state;
  }, [state]);
  /** Sortie du boss déjà lancée (bouton et minuteur peuvent arriver dans le même rendu). */
  const bossLeft = useRef(false);
  /** Moment où la question en cours est apparue (temps de réponse envoyé au serveur). */
  const shownAt = useRef(0);
  const started = useRef(false);

  const q = state.battle?.question ?? null;
  const question = useMemo(() => (q ? generate(q.skillId, q.level, q.seed) : null), [q]);
  const skill = q ? getAnySkill(q.skillId) : undefined;

  /** Le boss disparaît (une seule fois), puis le 1er mob entre et la 1re question arrive. */
  const sendMobs = useCallback(() => {
    if (bossLeft.current) return;
    bossLeft.current = true;
    dispatch({ type: 'bossLeft' });
    playSound('appear');
    later(1400, () => dispatch({ type: 'mobEntered' }));
    later(2700, () => dispatch({ type: 'introEnded' }));
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
      .then((battle) => {
        shownAt.current = performance.now();
        dispatch({ type: 'started', battle });
        later(900, () => dispatch({ type: 'heroReady' }));
        later(INTRO_MS, sendMobs);
      })
      .catch((err: unknown) =>
        dispatch({
          type: 'failed',
          error: blocking(err, 'Impossible de lancer le combat. Le serveur est-il joignable ?'),
        }),
      );
  }, [chapter.id, profile.id, later, sendMobs]);

  // Le temps de réponse de la question repart à la fin de la scène de rage.
  useEffect(() => {
    if (state.rage === null) shownAt.current = performance.now();
  }, [state.rage]);

  const finish = async (b: BattleView) => {
    try {
      const summary = await finishBattle(b.id);
      playSound(summary.won ? (summary.levelAfter > summary.levelBefore ? 'levelup' : 'victory') : 'defeat');
      dispatch({ type: 'finished', summary });
      void qc.invalidateQueries({ queryKey: bossesKey(profile.id) });
      void qc.invalidateQueries({ queryKey: ['profiles'] });
    } catch (err) {
      dispatch({ type: 'failed', error: blocking(err, 'Impossible d’enregistrer la fin du combat.') });
    }
  };

  /** Passe à l'état suivant du combat ; fin de combat : pose finale puis résultats. */
  const advance = (next: BattleView) => {
    const prev = latest.current.battle;
    if (bossEnrages(prev, next)) {
      playSound('appear');
      later(RAGE_STEP_MS, () => dispatch({ type: 'rageTimer', from: 'debut' }));
      later(RAGE_STEP_MS * 2, () => dispatch({ type: 'rageTimer', from: 'montee' }));
      later(RAGE_STEP_MS * 3, () => dispatch({ type: 'rageTimer', from: 'rage' }));
      // Après la scène, le héros réagit.
      later(RAGE_STEP_MS * 3 + 300, () => dispatch({ type: 'rageAnswered' }));
    }
    if (bossArrives(prev, next)) {
      playSound('appear');
      // Pas de minuteur : l'arrivée attend un toucher (comme l'Empereur), le temps de lire.
    }
    dispatch({ type: 'advanced', next });
    shownAt.current = performance.now();
    if (next.status !== 'fighting') later(FINAL_POSE_MS, () => void finish(next));
  };

  const submit = async (response: Response) => {
    const { battle, busy, missed } = latest.current;
    if (!battle || !q || !question || busy || missed) return;
    const local = check(question, response);
    if (local.invalid) {
      notify(INVALID_NUMBER);
      return;
    }
    dispatch({ type: 'sent' });
    try {
      const result = await answerBattle(battle.id, {
        skillId: q.skillId,
        level: q.level,
        seed: q.seed,
        response,
        durationMs: Math.round(performance.now() - shownAt.current),
      });
      if (result.invalid) {
        notify(INVALID_NUMBER);
        dispatch({ type: 'unsent' });
      } else if (result.correct) {
        playSound('correct');
        dispatch({ type: 'shot' });
        later(HIT_MS, () => {
          playSound('hit');
          dispatch({ type: 'shotLanded', next: result.battle });
        });
        later(NEXT_MS, () => advance(result.battle));
      } else {
        playSound('wrong');
        dispatch({ type: 'missed', result, given: response, why: local.why });
        later(MISS_SCENE_MS, () => dispatch({ type: 'missSceneEnded' }));
        later(HIT_MS, () => {
          playSound('hurt');
          dispatch({ type: 'riposteLanded', result });
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'GONE') dispatch({ type: 'failed', error: blocking(err, '') });
      else {
        notify(err instanceof ApiError ? err.message : 'Réponse non envoyée (problème de connexion).');
        dispatch({ type: 'unsent' });
      }
    }
  };

  const spendItem = async (item: ItemId) => {
    const { battle, busy, missed } = latest.current;
    if (!battle || busy || missed) return;
    const refusal = battle.inventory[item] <= 0 ? 'Tu n’en as plus' : itemRefusal(battle, item);
    if (refusal) {
      notify(refusal);
      return;
    }
    try {
      const next = await sendBattleItem(battle.id, item);
      playSound('reveal');
      dispatch({ type: 'itemUsed', item, battle: next });
      if (item === 'bouclier') {
        later(900, () => dispatch({ type: 'heroIdle' }));
        later(2100, () => dispatch({ type: 'introEnded' }));
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'GONE') dispatch({ type: 'failed', error: blocking(err, '') });
      else notify(err instanceof ApiError ? err.message : 'Problème de connexion');
    }
  };

  return {
    state,
    question,
    skill,
    sendMobs,
    submit: (response: Response) => void submit(response),
    spendItem: (item: ItemId) => void spendItem(item),
    /** Après le panneau d'erreur : la suite du combat. */
    next: (battle: BattleView) => advance(battle),
    pick: (point: { readonly x: number; readonly y: number } | null) => dispatch({ type: 'picked', point }),
    /** Entrée en scène : invoquer les mobs ; arrivée du boss : passer. */
    continueIntro: () => (latest.current.arrival ? dispatch({ type: 'arrivalSkipped' }) : sendMobs()),
    nextRage: () => dispatch({ type: 'rageTapped' }),
    skipRetry: () => dispatch({ type: 'retrySkipped' }),
  };
}
