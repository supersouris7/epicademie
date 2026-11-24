import { describe, expect, it } from 'vitest';
import { MODES } from '@epicademie/shared';
import { SETUP_BUBBLE_MAX, setupBubble } from './modes.ts';

describe('bulle de Questy au choix de la matière', () => {
  it('reste courte (≤ 90 caractères) pour chaque mode, sans coupe sur smartphone', () => {
    for (const mode of MODES) {
      const text = setupBubble(mode);
      expect(text.length, `${mode.id} : ${text}`).toBeLessThanOrEqual(SETUP_BUBBLE_MAX);
    }
  });

  it('Entraînement : 1 à 2 phrases, parle du coffre et invite à choisir', () => {
    const text = setupBubble({ id: 'entrainement', pitch: '' });
    expect(text).toMatch(/coffre/);
    expect(text).toMatch(/Choisis ta matière/);
    expect(text.split(/[.!?]/).filter(Boolean).length).toBeLessThanOrEqual(2);
  });
});
