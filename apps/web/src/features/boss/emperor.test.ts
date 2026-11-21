import { describe, expect, it } from 'vitest';
import { emperorDue, markEmperorSeen } from './emperor.ts';

describe('Empereur du Savoir', () => {
  it('l’Empereur se présente une fois par jour et par joueur', () => {
    expect(emperorDue('p1')).toBe(true);
    markEmperorSeen('p1');
    expect(emperorDue('p1')).toBe(false);
    expect(emperorDue('p2')).toBe(true);
  });
});
