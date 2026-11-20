import { describe, expect, it } from 'vitest';
import { createBattle } from '@questeo/engine';
import { BATTLE_STATE_VERSION, readBattle, storeBattle } from './battle-state.ts';

const state = createBattle(
  { mobs: ['a', 'b'], problems: ['p'], traps: ['t'] },
  { random: () => 0.5, seed: () => 42 },
  [],
  ['soin'],
);

describe('état de combat stocké en base', () => {
  it('se relit à l’identique (aller-retour JSON, comme en base)', () => {
    const stored = JSON.parse(JSON.stringify(storeBattle(state))) as unknown;
    expect(stored).toMatchObject({ v: BATTLE_STATE_VERSION });
    expect(readBattle(stored)).toEqual(state);
  });

  it('refuse un état d’une autre version ou sans version', () => {
    expect(readBattle({ v: BATTLE_STATE_VERSION + 1, state })).toBeNull();
    expect(readBattle(state)).toBeNull();
  });

  it('refuse un état incomplet ou corrompu', () => {
    expect(readBattle({ v: BATTLE_STATE_VERSION, state: { ...state, hearts: -1 } })).toBeNull();
    expect(readBattle({ v: BATTLE_STATE_VERSION, state: { ...state, equipped: ['inconnu'] } })).toBeNull();
    const partial = Object.fromEntries(Object.entries(state).filter(([key]) => key !== 'seen'));
    expect(readBattle({ v: BATTLE_STATE_VERSION, state: partial })).toBeNull();
    expect(readBattle(null)).toBeNull();
    expect(readBattle('texte')).toBeNull();
  });
});
