import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MathText } from './MathText.tsx';
import { NoDefinitions } from './TermLocked.tsx';
import { useTermReminders } from './termReminders.ts';

function Reminders() {
  const words = useTermReminders();
  return <p data-testid="mots">{words.join(',')}</p>;
}

describe('mots en combat et en défi', () => {
  it('pas de définition : un message, et « me le rappeler à la fin » retient le mot', async () => {
    render(
      <NoDefinitions>
        <MathText text="Calcule le quotient de 23 par 5." terms />
        <Reminders />
      </NoDefinitions>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /quotient : que veut dire ce mot/ }));
    expect(screen.getByText(/on la lit en mode Entraînement/)).toBeInTheDocument();
    expect(screen.queryByText(/Exemple :/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Me le rappeler à la fin' }));
    expect(screen.getByTestId('mots')).toHaveTextContent('quotient');
  });
});
