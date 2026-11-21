import type { Response } from '@questeo/content';
import {
  BATTLE_MOBS,
  type BattleAnswerResult,
  type BattleSummary,
  type BattleView,
  type ItemId,
} from '@questeo/shared';
import type { EnemyState } from '../../../shared/battle/BattleArena.tsx';
import type {
  BossLine,
  BossMoment,
  HeroLine,
  HeroMoment,
  MobLine,
  MobMoment,
  QuestyMoment,
} from '../../../shared/lib/dialogue.ts';
import type { AnimationState, BossExpression, HeroExpression, PiBotHead } from '../../../design/assets.ts';
import { bossMood } from '../../../design/bosses.ts';
import type { Missed } from './constants.ts';

/**
 * État de l'écran de combat de boss, et ses transitions (fonction `reducer` pure).
 *
 * Le combat lui-même (cœurs, vies, question en cours) est tenu par le serveur et arrive dans
 * `battle` (`BattleView`). Ce module décide de la MISE EN SCÈNE : poses et visages des
 * personnages, répliques, scènes en grand (entrée, arrivée du boss, rage, fin), panneau
 * d'erreur. Les durées et effets (minuteurs, sons, appels au serveur) sont dans
 * `useBattle.ts`, qui envoie ici des événements ; l'affichage est dans `BossPlay.tsx`.
 *
 * Les répliques sont tirées par `voices` (injectées) : des tests peuvent fixer le texte.
 */

/** Début du combat : le boss provoque (« boss »), disparaît (« exit »), le 1er mob entre (« mob »). */
export type IntroStage = 'boss' | 'exit' | 'mob';
/** Passage en rage du boss (dernière vie) : trois temps en plein écran. */
export type RageStage = 'debut' | 'montee' | 'rage';
export type RageLines = Readonly<Record<RageStage, string>>;
/** Répliques de l'arrivée du boss, tirées au moment où elle se joue. */
export interface ArrivalLines {
  readonly boss: BossLine;
  readonly hero: HeroLine;
  readonly questy: string;
}
/** Petite réplique sous le bandeau ; `nonce` relance l'animation même si le texte se répète. */
export interface Quip {
  readonly text: string;
  readonly nonce: number;
}
/** Erreur bloquante : message, et possibilité de relancer un combat neuf (combat expiré). */
export interface BattleError {
  readonly message: string;
  readonly canReplay: boolean;
}

export interface BattleScreen {
  readonly battle: BattleView | null;
  readonly summary: BattleSummary | null;
  readonly error: BattleError | null;
  /** Réponse ou action en cours d'envoi : les commandes sont bloquées. */
  readonly busy: boolean;
  /** Après une erreur : ce qui s'est passé, avant de passer à la suite. */
  readonly missed: Missed | null;
  /** Nœud choisi sur une figure (réponse « point »). */
  readonly picked: { readonly x: number; readonly y: number } | null;
  /** Scène d'action en grand (tir, riposte, victoire, défaite) à la place de l'énoncé. */
  readonly scene: boolean;
  /** Entrée en scène en grand, puis bandeau compact pour laisser la place aux énoncés. */
  readonly intro: boolean;
  readonly introStage: IntroStage;
  /** Arrivée du boss après le dernier mob : scène en grand. */
  readonly arrival: boolean;
  readonly arrivalLines: ArrivalLines | null;
  readonly rage: RageStage | null;
  readonly rageLines: RageLines;
  /** Défaite : « On recommence ? » avant le bilan. */
  readonly retry: boolean;
  readonly heroState: AnimationState;
  readonly heroFace: HeroExpression;
  readonly enemyState: EnemyState;
  /** Tête du boss dans le bandeau : il réagit aux coups et aux erreurs. */
  readonly bossFace: BossExpression;
  /** Tête du mob : menaçant, triste quand il est touché, rieur quand le héros se trompe. */
  readonly mobFace: PiBotHead;
  readonly heroQuip: Quip | null;
  readonly enemyQuip: Quip | null;
  /** Compteurs de tirs et de ripostes (chaque incrément rejoue l'animation). */
  readonly shot: number;
  readonly riposte: number;
  /** Dernier coup joué : la scène ne rejoue que lui (sinon tirs croisés). */
  readonly lastHit: 'shot' | 'riposte' | null;
  /** Compteur des répliques (identifiant d'animation). */
  readonly quips: number;
}

export const initialBattleScreen: BattleScreen = {
  battle: null,
  summary: null,
  error: null,
  busy: false,
  missed: null,
  picked: null,
  scene: false,
  intro: true,
  introStage: 'boss',
  arrival: false,
  arrivalLines: null,
  rage: null,
  rageLines: { debut: '', montee: '', rage: '' },
  retry: false,
  // Entrée en scène : le héros arrive en courant.
  heroState: 'run',
  heroFace: 'determine',
  enemyState: 'idle',
  bossFace: 'menace',
  mobFace: 'menace',
  heroQuip: null,
  enemyQuip: null,
  shot: 0,
  riposte: 0,
  lastHit: null,
  quips: 0,
};

/** Tirage des répliques (le héros est déjà choisi). */
export interface BattleVoices {
  readonly hero: (moment: HeroMoment) => HeroLine;
  readonly boss: (moment: BossMoment) => BossLine;
  readonly mob: (moment: MobMoment) => MobLine;
  readonly questy: (moment: QuestyMoment) => string;
}

export type BattleEvent =
  | { readonly type: 'started'; readonly battle: BattleView }
  | { readonly type: 'failed'; readonly error: BattleError }
  | { readonly type: 'heroReady' }
  | { readonly type: 'bossLeft' }
  | { readonly type: 'mobEntered' }
  | { readonly type: 'introEnded' }
  | { readonly type: 'sent' }
  | { readonly type: 'unsent' }
  | { readonly type: 'picked'; readonly point: { readonly x: number; readonly y: number } | null }
  | { readonly type: 'shot' }
  | { readonly type: 'shotLanded'; readonly next: BattleView }
  | { readonly type: 'missed'; readonly result: BattleAnswerResult; readonly given: Response; readonly why?: string }
  | { readonly type: 'missSceneEnded' }
  | { readonly type: 'riposteLanded'; readonly result: BattleAnswerResult }
  | { readonly type: 'advanced'; readonly next: BattleView }
  | { readonly type: 'rageTimer'; readonly from: RageStage }
  | { readonly type: 'rageTapped' }
  | { readonly type: 'rageAnswered' }
  | { readonly type: 'arrivalEnded' }
  | { readonly type: 'arrivalSkipped' }
  | { readonly type: 'itemUsed'; readonly item: ItemId; readonly battle: BattleView }
  | { readonly type: 'heroIdle' }
  | { readonly type: 'finished'; readonly summary: BattleSummary }
  | { readonly type: 'retrySkipped' };

/** Le combat passe au boss : le dernier mob vient de tomber. */
export const bossArrives = (prev: BattleView | null, next: BattleView): boolean =>
  next.status === 'fighting' && prev !== null && prev.mobsDefeated < BATTLE_MOBS && next.mobsDefeated >= BATTLE_MOBS;

/** Le boss tombe à sa dernière vie : il passe en rage. */
export const bossEnrages = (prev: BattleView | null, next: BattleView): boolean =>
  next.status === 'fighting' && prev !== null && prev.bossLives > 1 && next.bossLives === 1;

/** Le combat en est au boss (tous les mobs battus). */
export const onBoss = (battle: BattleView | null): boolean => (battle ? battle.mobsDefeated >= BATTLE_MOBS : false);

const NEXT_RAGE: Record<RageStage, RageStage | null> = { debut: 'montee', montee: 'rage', rage: null };

export function createBattleReducer(voices: BattleVoices) {
  /** Réplique sous le bandeau (héros à gauche, adversaire à droite). */
  const quip = (s: BattleScreen, who: 'hero' | 'enemy', text: string): BattleScreen => {
    const q = { text, nonce: s.quips + 1 };
    return { ...s, quips: q.nonce, ...(who === 'hero' ? { heroQuip: q } : { enemyQuip: q }) };
  };

  /** L'adversaire réagit à une bonne réponse (sa réplique choisit son expression). */
  const enemyHit = (s: BattleScreen, next: BattleView): BattleScreen => {
    const hurt = { ...s, enemyState: 'hurt' as const };
    if (!onBoss(s.battle)) {
      const l = voices.mob('onHit');
      return quip({ ...hurt, mobFace: l.face }, 'enemy', l.text);
    }
    if (next.bossLives === 0) return { ...hurt, bossFace: 'ko' };
    const l = voices.boss('onHit');
    return quip({ ...hurt, bossFace: next.bossLives === 1 ? 'furieux' : l.face }, 'enemy', l.text);
  };

  /** L'adversaire se moque de l'erreur (ou râle contre le bouclier) et riposte. */
  const enemyRiposte = (s: BattleScreen, result: BattleAnswerResult): BattleScreen => {
    const attacking = { ...s, enemyState: 'attack' as const, riposte: s.riposte + 1, lastHit: 'riposte' as const };
    if (!onBoss(s.battle)) {
      const l = voices.mob('onHeroMiss');
      return quip({ ...attacking, mobFace: l.face }, 'enemy', l.text);
    }
    const l = voices.boss(result.outcome === 'blocked' ? 'onShield' : 'onHeroMiss');
    return quip({ ...attacking, bossFace: l.face }, 'enemy', l.text);
  };

  /** Passage à l'état suivant du combat (après un tir réussi, ou après le panneau d'erreur). */
  const advance = (s: BattleScreen, next: BattleView): BattleScreen => {
    const prev = s.battle;
    const arrives = bossArrives(prev, next);
    let out: BattleScreen = {
      ...s,
      missed: null,
      picked: null,
      mobFace: 'menace',
      scene: next.status !== 'fighting',
      battle: next,
    };
    if (bossEnrages(prev, next)) {
      out = {
        ...out,
        rage: 'debut',
        rageLines: {
          debut: voices.boss('rageDebut').text,
          montee: voices.boss('rageMontee').text,
          rage: voices.boss('rageCri').text,
        },
      };
    }
    if (arrives) {
      // Il arrive en courant, l'air menaçant, dans son animation sur place (jamais dans la pose
      // « touché » du dernier mob).
      out = {
        ...out,
        arrival: true,
        arrivalLines: {
          boss: voices.boss('arrival'),
          hero: voices.hero('bossArrives'),
          questy: voices.questy('arrival'),
        },
        bossFace: 'menace',
      };
    }
    if (next.status === 'won') {
      const ko = { ...out, enemyState: 'ko' as const, bossFace: 'ko' as const, heroState: 'victory' as const };
      return quip({ ...ko, heroFace: 'rire' }, 'enemy', voices.boss('ko').text);
    }
    if (next.status === 'lost') {
      const lost = { ...out, bossFace: 'rire' as const, heroState: 'defeat' as const, heroFace: 'etourdi' as const };
      return quip(lost, 'enemy', voices.boss('wins').text);
    }
    return {
      ...out,
      heroState: 'idle',
      enemyState: 'idle',
      bossFace: onBoss(prev) && onBoss(next) ? bossMood(next.bossLives) : out.bossFace,
      heroFace: next.hearts === 1 ? 'determine' : 'confiant',
      busy: false,
    };
  };

  return function reducer(s: BattleScreen, e: BattleEvent): BattleScreen {
    switch (e.type) {
      case 'started':
        return { ...s, battle: e.battle };
      case 'failed':
        return { ...s, error: e.error, busy: false };
      case 'heroReady':
      case 'heroIdle':
        return { ...s, heroState: 'idle' };
      case 'bossLeft':
        // Une seule sortie (le bouton et le minuteur peuvent arriver tous les deux).
        return s.introStage === 'boss' ? { ...s, introStage: 'exit', enemyState: 'idle' } : s;
      case 'mobEntered':
        return { ...s, introStage: 'mob', enemyState: 'idle' };
      case 'introEnded':
        return { ...s, intro: false };
      case 'sent':
        return { ...s, busy: true };
      case 'unsent':
        return { ...s, busy: false };
      case 'picked':
        return { ...s, picked: e.point };
      case 'shot': {
        const shout = voices.hero('shoot');
        const firing = { ...s, scene: true, heroState: 'shoot' as const, heroFace: shout.face };
        return quip({ ...firing, shot: s.shot + 1, lastHit: 'shot' }, 'hero', shout.text);
      }
      case 'shotLanded':
        return enemyHit(s, e.next);
      case 'missed':
        return {
          ...enemyRiposte({ ...s, scene: true }, e.result),
          missed: { given: e.given, why: e.why, next: e.result.battle },
        };
      case 'missSceneEnded':
        return { ...s, scene: false };
      case 'riposteLanded': {
        const blocked = e.result.outcome === 'blocked';
        const l = voices.hero(blocked ? 'shield' : 'hurt');
        // Le bouclier a servi : on l'enlève tout de suite de la scène.
        const battle = s.battle && { ...s.battle, shield: e.result.battle.shield, hearts: e.result.battle.hearts };
        const hurt = { ...s, heroState: blocked ? ('shield' as const) : ('hurt' as const), heroFace: l.face };
        return quip({ ...hurt, enemyState: 'idle', battle }, 'hero', l.text);
      }
      case 'advanced':
        return advance(s, e.next);
      case 'rageTimer':
        return s.rage === e.from ? { ...s, rage: NEXT_RAGE[e.from] } : s;
      case 'rageTapped':
        return s.rage ? { ...s, rage: NEXT_RAGE[s.rage] } : s;
      case 'rageAnswered': {
        const l = voices.hero('rage');
        return quip({ ...s, heroFace: l.face }, 'hero', l.text);
      }
      case 'arrivalEnded':
        return { ...s, arrival: false, bossFace: 'menace' };
      case 'arrivalSkipped':
        return { ...s, arrival: false };
      case 'itemUsed':
        return {
          ...s,
          battle: e.battle,
          heroFace: e.item === 'indice' ? 'reflexion' : e.item === 'soin' ? 'joie' : s.heroFace,
          heroState: e.item === 'bouclier' ? 'shield' : s.heroState,
        };
      case 'finished':
        return { ...s, summary: e.summary, retry: !e.summary.won };
      case 'retrySkipped':
        return { ...s, retry: false };
    }
  };
}
