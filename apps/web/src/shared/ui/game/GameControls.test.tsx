import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GameControls } from './GameControls.tsx';
import { HudBar } from './Hud.tsx';

const names = () => screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));

describe('boutons de partie', () => {
  it('Pause puis Quitter, en icônes avec un libellé accessible, cibles de 44 px', async () => {
    const onQuit = vi.fn();
    const onPause = vi.fn();
    const user = userEvent.setup();
    render(<GameControls onQuit={onQuit} onPause={onPause} />);
    expect(names()).toEqual(['Pause', 'Quitter']);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveTextContent('');
      expect(button).toHaveClass('h-11', 'w-11');
    }
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Quitter' }));
    expect(onPause).toHaveBeenCalledOnce();
    expect(onQuit).toHaveBeenCalledOnce();
  });

  it('mode sans pause : « Quitter » seul, au même endroit', () => {
    render(<GameControls onQuit={vi.fn()} />);
    expect(names()).toEqual(['Quitter']);
    expect(screen.getByRole('group', { name: 'Commandes de la partie' })).toHaveClass('fixed', 'top-[18px]');
  });
});

describe('barres en alerte : un symbole double la couleur, sans texte', () => {
  const bar = (props: Partial<Parameters<typeof HudBar>[0]>) =>
    render(<HudBar side="left" value={3} max={3} label="barre" role="img" {...props} />).container;

  it.each([
    ['dernière vie', { value: 1 }],
    ['temps qui presse', { kind: 'time', alert: true }],
  ] as const)('%s', (_, props) => {
    const view = bar(props);
    expect(view.querySelector('[data-alert-symbol]')).not.toBeNull();
    expect(view).toHaveTextContent('');
    expect(screen.getByRole('img', { name: 'barre' })).toHaveClass('h-5');
  });

  it.each([
    ['vies suffisantes', { value: 2 }],
    ['temps tranquille', { kind: 'time', value: 1, alert: false }],
    ['expérience', { kind: 'xp', value: 0 }],
  ] as const)('aucun symbole : %s', (_, props) => {
    expect(bar(props).querySelector('[data-alert-symbol]')).toBeNull();
  });
});
