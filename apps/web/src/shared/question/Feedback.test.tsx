import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { generate } from '@questeo/content';
import { Feedback } from './Feedback.tsx';

const question = generate('m5-tables', 1, 7);

const base = { question, xp: 10, streak: 1, gender: null, onMemo: () => undefined } as const;

describe('Feedback', () => {
  it('bonne réponse : aucun bouton, la suite arrive toute seule après 1,2 s', () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    render(<Feedback {...base} correct onNext={onNext} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    vi.advanceTimersByTime(1100);
    expect(onNext).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(onNext).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('erreur : chaque étape avec « Suivant », puis « Vérifions si j’ai compris » seulement à la fin', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<Feedback {...base} correct={false} given={{ kind: 'number', text: '1' }} onNext={onNext} />);
    expect(question.steps.length).toBeGreaterThan(1);
    for (let i = 1; i < question.steps.length; i++) {
      expect(screen.queryByRole('button', { name: /Vérifions/ })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /^Suivant/ }));
    }
    expect(screen.queryByRole('button', { name: /^Suivant/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Vérifions si j’ai compris' }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
