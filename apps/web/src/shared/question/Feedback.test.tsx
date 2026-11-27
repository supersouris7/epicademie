import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CHAPTERS, generate } from '@epicademie/content';
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

  it('brouillon pendant l’explication : étapes lues rappelées, puis retour', async () => {
    const user = userEvent.setup();
    render(<Feedback {...base} correct={false} onNext={() => undefined} />);
    await user.click(screen.getByRole('button', { name: 'Brouillon' }));
    const sheet = screen.getByRole('dialog', { name: 'Brouillon pleine page' });
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(1);
    expect(within(sheet).getByRole('img', { name: /Zone de brouillon/ })).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Revenir à l’explication' }));
    expect(screen.queryByRole('dialog', { name: 'Brouillon pleine page' })).not.toBeInTheDocument();
  });

  it('pas de brouillon hors des matières où l’on calcule', () => {
    const history = CHAPTERS.find((c) => c.subject === 'histoire')!.skills[0]!;
    render(<Feedback {...base} question={generate(history.id, 1, 1)} correct={false} onNext={() => undefined} />);
    expect(screen.queryByRole('button', { name: 'Brouillon' })).not.toBeInTheDocument();
  });
});
