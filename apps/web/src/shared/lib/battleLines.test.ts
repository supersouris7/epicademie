import { describe, expect, it } from 'vitest';
import { faceOffTaunt, inSentence, questyReply, subjectTaunt } from './battleLines.ts';

describe('répliques du boss', () => {
  it('met le chapitre dans la phrase', () => {
    expect(inSentence('Fractions')).toBe('fractions');
    expect(inSentence('Théorème de Pythagore')).toBe('théorème de Pythagore');
    expect(inSentence('PGCD')).toBe('PGCD');
    expect(faceOffTaunt('Fractions', true, 'garcon', 0)).toBe(
      'Tu m’as peut-être battu… Mais tu ne feras pas long feu en fractions, haha !',
    );
    expect(faceOffTaunt('Fractions', true, 'fille', 0)).toContain('battue');
  });
  it('provoque selon les victoires', () => {
    expect(subjectTaunt(0, 'garcon', 0)).toContain('nouveau challenger');
    expect(subjectTaunt(3, 'fille', 0)).toContain('vaincue 3 fois');
    for (const r of [0, 0.4, 0.99]) {
      expect(subjectTaunt(2, 'garcon', r)).toBeTruthy();
      expect(faceOffTaunt('Nombres relatifs', false, 'garcon', r)).toBeTruthy();
      expect(questyReply(r)).toBeTruthy();
    }
  });
});
