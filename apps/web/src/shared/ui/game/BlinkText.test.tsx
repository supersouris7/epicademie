import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlinkText } from './BlinkText.tsx';

describe('BlinkText', () => {
  it('affiche le message dans un paragraphe par défaut', () => {
    render(<BlinkText>Touche l’écran pour continuer</BlinkText>);
    expect(screen.getByText('Touche l’écran pour continuer').tagName).toBe('P');
  });

  it('peut rendre un titre de niveau 2 avec son identifiant', () => {
    render(
      <BlinkText as="h2" id="equipement">
        Équipe-toi pour ce combat
      </BlinkText>,
    );
    const h = screen.getByRole('heading', { level: 2, name: 'Équipe-toi pour ce combat' });
    expect(h.id).toBe('equipement');
  });
});
