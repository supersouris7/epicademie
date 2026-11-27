import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { generate } from '@epicademie/content';
import { listenTarget } from '../lib/speech.ts';
import { ListenButton } from './ListenButton.tsx';

const question = { ...generate('m5-tables', 1, 1), audio: { text: 'Seven', lang: 'en-GB' } };
const plain = generate('m5-tables', 1, 1);

afterEach(() => vi.unstubAllGlobals());

describe('bouton Écouter', () => {
  it('lit l’audio, sinon l’énoncé seulement si demandé (CM)', () => {
    expect(listenTarget(question, false)?.lang).toBe('en-GB');
    expect(listenTarget(plain, false)).toBeNull();
    expect(listenTarget(plain, true)?.lang).toBe('fr-FR');
  });

  it('absent quand il n’y a rien à lire', () => {
    render(<ListenButton question={plain} />);
    expect(screen.queryByRole('button', { name: 'Écouter' })).toBeNull();
  });

  it('lit le texte à voix haute, et prévient si aucune voix n’existe', () => {
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [{ lang: 'en-US', localService: true }],
      cancel: vi.fn(),
      speak,
    });
    vi.stubGlobal('SpeechSynthesisUtterance', function (this: { text: string }, t: string) {
      this.text = t;
    });
    const { unmount } = render(<ListenButton question={question} />);
    fireEvent.click(screen.getByRole('button', { name: 'Écouter' }));
    expect(speak).toHaveBeenCalledTimes(1);
    unmount();
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], cancel: vi.fn(), speak });
    render(<ListenButton question={question} />);
    fireEvent.click(screen.getByRole('button', { name: 'Écouter' }));
    expect(screen.getByRole('status').textContent).toContain('Aucune voix');
  });
});
