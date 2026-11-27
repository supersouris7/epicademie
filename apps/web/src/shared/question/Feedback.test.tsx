import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { generate } from '@epicademie/content';
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

  it('pas encore : chaque étape avec « Suivant », puis la proposition d’une question du même type', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const onSkip = vi.fn();
    render(
      <Feedback
        {...base}
        correct={false}
        similar
        given={{ kind: 'number', text: '1' }}
        onNext={onNext}
        onSkip={onSkip}
      />,
    );
    expect(question.steps.length).toBeGreaterThan(1);
    for (let i = 1; i < question.steps.length; i++) {
      expect(screen.queryByText(/question du même type/)).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /^Suivant/ }));
    }
    expect(screen.queryByRole('button', { name: /^Suivant/ })).not.toBeInTheDocument();
    expect(screen.getByText('Tu veux réessayer une question du même type ?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pas maintenant' }));
    expect(onSkip).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Oui, j’essaie' }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
