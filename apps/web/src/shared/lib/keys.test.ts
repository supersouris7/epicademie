import { afterEach, describe, expect, it } from 'vitest';
import { keyIsForGame } from './keys.ts';

const press = (target: EventTarget) => {
  let seen: boolean | null = null;
  const handler = (e: Event) => (seen = keyIsForGame(e as KeyboardEvent));
  window.addEventListener('keydown', handler);
  target.dispatchEvent(new KeyboardEvent('keydown', { key: '4', bubbles: true }));
  window.removeEventListener('keydown', handler);
  return seen;
};

afterEach(() => document.body.replaceChildren());

describe('clavier physique des parties', () => {
  it('les touches vont au jeu hors de tout champ', () => {
    expect(press(document.body)).toBe(true);
  });

  it('jamais quand on écrit dans un champ ou une zone de texte', () => {
    for (const tag of ['input', 'textarea', 'select'] as const) {
      const el = document.body.appendChild(document.createElement(tag));
      expect(press(el)).toBe(false);
    }
  });

  it('jamais quand une boîte de dialogue modale est ouverte', () => {
    const dialog = document.body.appendChild(document.createElement('div'));
    dialog.setAttribute('aria-modal', 'true');
    expect(press(document.body)).toBe(false);
  });
});
