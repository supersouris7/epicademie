import { describe, expect, it } from 'vitest';
import type { BattleAnswerResult, BattleSummary, BattleView } from '@epicademie/shared';
import {
  bossArrives,
  bossEnrages,
  createBattleReducer,
  initialBattleScreen,
  onBoss,
  type BattleEvent,
  type BattleScreen,
} from './state.ts';

/** Répliques fixes : le texte dit qui parle et à quel moment, l'expression est stable. */
const reducer = createBattleReducer({
  hero: (m) => ({ text: `héros:${m}`, face: 'joie' }),
  boss: (m) => ({ text: `boss:${m}`, face: 'moqueur' }),
  mob: (m) => ({ text: `mob:${m}`, face: 'rire' }),
  questy: (m) => `questy:${m}`,
});
const run = (events: readonly BattleEvent[], from: BattleScreen = initialBattleScreen) => events.reduce(reducer, from);

const view = (over: Partial<BattleView> = {}): BattleView => ({
  id: '00000000-0000-4000-8000-000000000001',
  chapterId: 'm5-relatifs',
  status: 'fighting',
  hearts: 3,
  maxHearts: 3,
  bossLives: 3,
  mobsDefeated: 0,
  turn: 0,
  shield: false,
  hintShown: false,
  itemsUsed: 0,
  equipped: [],
  question: { skillId: 'm5-relatifs-somme', level: 1, seed: 1, stage: 'mob' },
  inventory: { bouclier: 1, soin: 1, indice: 1 },
  ...over,
});
const result = (battle: BattleView, over: Partial<BattleAnswerResult> = {}): BattleAnswerResult => ({
  correct: false,
  invalid: false,
  outcome: 'riposte',
  battle,
  ...over,
});
const summary = (won: boolean): BattleSummary => ({
  won,
  firstWin: won,
  xpGained: 50,
  coinsGained: 5,
  hearts: won ? 2 : 0,
  medal: won ? 'or' : null,
  newBest: won,
  chest: null,
  weakSkill: null,
  skills: [],
  levelBefore: 1,
  levelAfter: 1,
});
/** Écran en plein combat contre un mob, ou contre le boss. */
const fighting = (over: Partial<BattleView> = {}) =>
  run([{ type: 'started', battle: view(over) }, { type: 'introEnded' }]);
const atBoss = (lives = 3) => fighting({ mobsDefeated: 4, bossLives: lives });

describe('repères du combat', () => {
  it('arrivée du boss : le 4e mob tombe pendant le combat', () => {
    expect(bossArrives(view({ mobsDefeated: 3 }), view({ mobsDefeated: 4 }))).toBe(true);
    expect(bossArrives(view({ mobsDefeated: 4 }), view({ mobsDefeated: 4 }))).toBe(false);
    expect(bossArrives(view({ mobsDefeated: 3 }), view({ mobsDefeated: 4, status: 'won' }))).toBe(false);
    expect(bossArrives(null, view({ mobsDefeated: 4 }))).toBe(false);
  });

  it('rage : le boss passe à sa dernière vie', () => {
    expect(bossEnrages(view({ bossLives: 2 }), view({ bossLives: 1 }))).toBe(true);
    expect(bossEnrages(view({ bossLives: 1 }), view({ bossLives: 1 }))).toBe(false);
    expect(bossEnrages(view({ bossLives: 2 }), view({ bossLives: 1, status: 'lost' }))).toBe(false);
    expect(bossEnrages(null, view({ bossLives: 1 }))).toBe(false);
  });

  it('phase du boss : tous les mobs battus', () => {
    expect(onBoss(null)).toBe(false);
    expect(onBoss(view({ mobsDefeated: 3 }))).toBe(false);
    expect(onBoss(view({ mobsDefeated: 4 }))).toBe(true);
  });
});

describe('entrée en scène', () => {
  it('le héros arrive en courant, puis attend', () => {
    expect(initialBattleScreen).toMatchObject({ intro: true, introStage: 'boss', heroState: 'run' });
    expect(run([{ type: 'started', battle: view() }, { type: 'heroReady' }]).heroState).toBe('idle');
  });

  it('le boss disparaît une seule fois (sans invocation), puis le 1er mob entre', () => {
    const left = run([{ type: 'bossLeft' }]);
    expect(left).toMatchObject({ introStage: 'exit', enemyState: 'idle' });
    expect(reducer(left, { type: 'bossLeft' })).toBe(left);
    const mob = reducer(left, { type: 'mobEntered' });
    expect(mob).toMatchObject({ introStage: 'mob', enemyState: 'idle' });
    expect(reducer(mob, { type: 'introEnded' }).intro).toBe(false);
  });

  it('erreur au lancement : écran d’erreur, commandes libérées', () => {
    const s = run([{ type: 'sent' }, { type: 'failed', error: { message: 'Hors ligne', canReplay: false } }]);
    expect(s).toMatchObject({ error: { message: 'Hors ligne' }, busy: false });
  });
});

describe('bonne réponse', () => {
  it('le héros tire : scène en grand, réplique, tir compté', () => {
    const s = reducer(fighting(), { type: 'shot' });
    expect(s).toMatchObject({ scene: true, heroState: 'shoot', heroFace: 'joie', shot: 1, lastHit: 'shot' });
    expect(s.heroQuip).toEqual({ text: 'héros:shoot', nonce: 1 });
  });

  it('un mob touché fait la tête', () => {
    const s = reducer(fighting(), { type: 'shotLanded', next: view({ mobsDefeated: 1 }) });
    expect(s).toMatchObject({ enemyState: 'hurt', mobFace: 'rire', enemyQuip: { text: 'mob:onHit' } });
  });

  it('le boss touché réagit, devient furieux à sa dernière vie, KO à la fin', () => {
    const hit = reducer(atBoss(3), { type: 'shotLanded', next: view({ mobsDefeated: 4, bossLives: 2 }) });
    expect(hit).toMatchObject({ bossFace: 'moqueur', enemyQuip: { text: 'boss:onHit' } });
    const furious = reducer(atBoss(2), { type: 'shotLanded', next: view({ mobsDefeated: 4, bossLives: 1 }) });
    expect(furious.bossFace).toBe('furieux');
    const ko = reducer(atBoss(1), { type: 'shotLanded', next: view({ mobsDefeated: 4, bossLives: 0 }) });
    expect(ko).toMatchObject({ bossFace: 'ko', enemyQuip: null });
  });

  it('les répliques ont chacune leur identifiant d’animation', () => {
    const s = run([{ type: 'shot' }, { type: 'shotLanded', next: view() }, { type: 'shot' }], fighting());
    expect(s.heroQuip?.nonce).toBe(3);
    expect(s.enemyQuip?.nonce).toBe(2);
  });
});

describe('mauvaise réponse', () => {
  const given = { kind: 'text', text: '7' } as const;

  it('le mob riposte et se moque ; le panneau d’erreur garde la suite', () => {
    const next = view({ hearts: 2 });
    const s = reducer(fighting(), { type: 'missed', result: result(next), given, why: 'signe' });
    expect(s).toMatchObject({ scene: true, enemyState: 'attack', riposte: 1, lastHit: 'riposte', mobFace: 'rire' });
    expect(s.missed).toEqual({ given, why: 'signe', next });
    expect(s.enemyQuip?.text).toBe('mob:onHeroMiss');
  });

  it('le boss râle contre le bouclier, ou se moque de l’erreur', () => {
    const blocked = reducer(atBoss(), {
      type: 'missed',
      result: result(view({ mobsDefeated: 4 }), { outcome: 'blocked' }),
      given,
    });
    expect(blocked.enemyQuip?.text).toBe('boss:onShield');
    const mocked = reducer(atBoss(), { type: 'missed', result: result(view({ mobsDefeated: 4 })), given });
    expect(mocked).toMatchObject({ bossFace: 'moqueur', enemyQuip: { text: 'boss:onHeroMiss' } });
  });

  it('la riposte touche le héros (ou son bouclier) et met à jour cœurs et bouclier', () => {
    const shielded = fighting({ shield: true });
    const hurt = reducer(shielded, { type: 'riposteLanded', result: result(view({ hearts: 2, shield: false })) });
    expect(hurt).toMatchObject({ heroState: 'hurt', enemyState: 'idle', heroQuip: { text: 'héros:hurt' } });
    expect(hurt.battle).toMatchObject({ hearts: 2, shield: false });
    const blocked = reducer(shielded, {
      type: 'riposteLanded',
      result: result(view({ shield: false }), { outcome: 'blocked' }),
    });
    expect(blocked).toMatchObject({ heroState: 'shield', heroQuip: { text: 'héros:shield' } });
  });

  it('la scène en grand se referme', () => {
    expect(reducer({ ...fighting(), scene: true }, { type: 'missSceneEnded' }).scene).toBe(false);
  });

  it('riposte sans combat chargé : pas de plantage', () => {
    const s = reducer(initialBattleScreen, { type: 'riposteLanded', result: result(view()) });
    expect(s.battle).toBeNull();
  });
});

describe('suite du combat', () => {
  it('question suivante : héros prêt, panneau et point effacés, commandes libérées', () => {
    const before = { ...fighting(), busy: true, picked: { x: 1, y: 2 }, mobFace: 'rire' as const };
    const s = reducer(before, { type: 'advanced', next: view({ mobsDefeated: 1, turn: 1, hearts: 1 }) });
    expect(s).toMatchObject({
      busy: false,
      missed: null,
      picked: null,
      mobFace: 'menace',
      scene: false,
      heroState: 'idle',
      enemyState: 'idle',
      heroFace: 'determine',
    });
    expect(reducer(before, { type: 'advanced', next: view({ turn: 1 }) }).heroFace).toBe('confiant');
  });

  it('dernier mob battu : le boss arrive menaçant, en attente (jamais avec la pose « touché » du mob)', () => {
    const s = reducer(
      { ...fighting({ mobsDefeated: 3 }), enemyState: 'hurt' },
      {
        type: 'advanced',
        next: view({ mobsDefeated: 4 }),
      },
    );
    expect(s).toMatchObject({ arrival: true, bossFace: 'menace', enemyState: 'idle' });
    expect(s.arrivalLines).toEqual({
      boss: { text: 'boss:arrival', face: 'moqueur' },
      hero: { text: 'héros:bossArrives', face: 'joie' },
      questy: 'questy:arrival',
    });
    expect(run([{ type: 'arrivalSkipped' }], s)).toMatchObject({ arrival: false, bossFace: 'menace' });
  });

  it('contre le boss, son humeur suit ses vies', () => {
    const s = reducer(atBoss(3), { type: 'advanced', next: view({ mobsDefeated: 4, bossLives: 2 }) });
    expect(s.bossFace).toBe('inquiet');
  });

  it('dernière vie : rage en trois temps (minuteur ou toucher), puis le héros réagit', () => {
    const s = reducer(atBoss(2), { type: 'advanced', next: view({ mobsDefeated: 4, bossLives: 1 }) });
    expect(s.rage).toBe('debut');
    expect(s.rageLines).toEqual({ debut: 'boss:rageDebut', montee: 'boss:rageMontee', rage: 'boss:rageCri' });
    // Un minuteur en retard sur un toucher ne fait rien.
    const tapped = reducer(s, { type: 'rageTapped' });
    expect(tapped.rage).toBe('montee');
    expect(reducer(tapped, { type: 'rageTimer', from: 'debut' }).rage).toBe('montee');
    const end = run(
      [
        { type: 'rageTimer', from: 'montee' },
        { type: 'rageTimer', from: 'rage' },
      ],
      tapped,
    );
    expect(end.rage).toBeNull();
    expect(reducer(end, { type: 'rageTapped' })).toBe(end);
    expect(reducer(end, { type: 'rageAnswered' }).heroQuip?.text).toBe('héros:rage');
  });

  it('victoire : boss KO, héros en pose de victoire, scène en grand', () => {
    const s = reducer(atBoss(1), { type: 'advanced', next: view({ mobsDefeated: 4, bossLives: 0, status: 'won' }) });
    expect(s).toMatchObject({
      scene: true,
      enemyState: 'ko',
      bossFace: 'ko',
      heroState: 'victory',
      heroFace: 'rire',
      enemyQuip: { text: 'boss:ko' },
    });
  });

  it('défaite : le boss rit, le héros est étourdi', () => {
    const s = reducer(atBoss(), { type: 'advanced', next: view({ mobsDefeated: 4, hearts: 0, status: 'lost' }) });
    expect(s).toMatchObject({ scene: true, bossFace: 'rire', heroState: 'defeat', heroFace: 'etourdi' });
    expect(s.enemyQuip?.text).toBe('boss:wins');
  });
});

describe('objets, envoi et fin', () => {
  it('chaque objet a sa réaction', () => {
    const base = fighting();
    expect(reducer(base, { type: 'itemUsed', item: 'indice', battle: view({ hintShown: true }) })).toMatchObject({
      heroFace: 'reflexion',
      battle: { hintShown: true },
    });
    expect(reducer(base, { type: 'itemUsed', item: 'soin', battle: view() }).heroFace).toBe('joie');
    const shield = reducer(base, { type: 'itemUsed', item: 'bouclier', battle: view({ shield: true }) });
    expect(shield).toMatchObject({ heroState: 'shield', heroFace: base.heroFace });
    expect(reducer(shield, { type: 'heroIdle' }).heroState).toBe('idle');
  });

  it('envoi d’une réponse : commandes bloquées puis libérées ; point choisi', () => {
    const sent = reducer(fighting(), { type: 'sent' });
    expect(sent.busy).toBe(true);
    expect(reducer(sent, { type: 'unsent' }).busy).toBe(false);
    expect(reducer(sent, { type: 'picked', point: { x: 2, y: 3 } }).picked).toEqual({ x: 2, y: 3 });
  });

  it('bilan : une défaite propose d’abord de recommencer', () => {
    const lost = reducer(fighting(), { type: 'finished', summary: summary(false) });
    expect(lost).toMatchObject({ retry: true, summary: { won: false } });
    expect(reducer(lost, { type: 'retrySkipped' }).retry).toBe(false);
    expect(reducer(fighting(), { type: 'finished', summary: summary(true) }).retry).toBe(false);
  });
});
