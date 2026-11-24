import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Chest } from '@epicademie/shared';
import { ChestReveal } from './ChestReveal.tsx';

const chest: Chest = { rarity: 'rare', items: { bouclier: 1 }, coins: 10, rubies: 0, hero: null };

describe('ChestReveal', () => {
  it('un toucher sur l’écran ouvre le coffre ; la lumière sort du coffre ; pas de bouton « Passer »', async () => {
    const user = userEvent.setup();
    render(<ChestReveal chest={chest} />);
    expect(screen.getByRole('dialog', { name: 'Un coffre d’équipement !' })).toBeInTheDocument();
    expect(screen.queryByTestId('chest-light')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ouvrir le coffre' }));
    const opened = screen.getByRole('dialog', { name: 'Coffre rare' });
    expect(opened).toHaveTextContent('Bouclier +1');
    expect(opened).toHaveTextContent('+10 pièces');
    // La lumière, masquée aux lecteurs d’écran, est émise depuis le coffre ouvert.
    expect(screen.getByTestId('chest-light')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button', { name: /Passer|Super/ })).not.toBeInTheDocument();
    expect(screen.getByText('Touche l’écran pour continuer')).toBeInTheDocument();
  });

  it('un second toucher continue : le coffre se range dans le bilan', async () => {
    const user = userEvent.setup();
    render(<ChestReveal chest={chest} />);
    await user.click(screen.getByRole('button', { name: 'Ouvrir le coffre' }));
    await user.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Coffre rare' })).toBeInTheDocument();
  });

  it('au clavier : Entrée ouvre, Espace continue (le bouton plein écran a le focus)', async () => {
    const user = userEvent.setup();
    render(<ChestReveal chest={chest} />);
    expect(screen.getByRole('button', { name: 'Ouvrir le coffre' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Continuer' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
