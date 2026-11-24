import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Question } from '@epicademie/content';
import { AnswerInput } from './AnswerInput.tsx';
import { Figure } from './figures/Figure.tsx';

/** Saisie tactile (clic), clavier physique et télécommande (flèches + OK) des réponses structurées. */

const base = {
  skillId: 't',
  level: 1,
  seed: 1,
  prompt: 'Consigne.',
  steps: ['Étape.'],
  hint: 'Indice.',
  traps: [],
  targetSeconds: 30,
} as const;

const ordre: Question = {
  ...base,
  answer: { kind: 'order', items: ['Matin', 'Soir', 'Midi'], correct: [0, 2, 1] },
};
const association: Question = {
  ...base,
  answer: {
    kind: 'match',
    left: ['France', 'Italie', 'Espagne'],
    right: ['Rome', 'Madrid', 'Paris'],
    pairs: [2, 0, 1],
  },
};
const trous: Question = {
  ...base,
  answer: {
    kind: 'cloze',
    parts: ['Nous ', ' au ', '.'],
    blanks: [
      { mode: 'text', accepted: ['mangeons'] },
      { mode: 'list', options: ['restaurant', 'restaurants'], correct: 0 },
    ],
  },
};

const show = (question: Question, onSubmit = vi.fn(), onUnknown = vi.fn()) => {
  render(<AnswerInput question={question} disabled={false} onSubmit={onSubmit} picked={null} onUnknown={onUnknown} />);
  return { onSubmit, onUnknown };
};

describe('ordre', () => {
  it('au toucher : numérote les éléments, retire au second toucher, valide quand tout est placé', async () => {
    const { onSubmit } = show(ordre);
    const user = userEvent.setup();
    const ok = () => screen.getByRole('button', { name: 'OK' });
    expect(screen.queryByRole('button', { name: 'OK' })).toBeNull(); // « ? » tant que rien n'est placé
    await user.click(screen.getByRole('button', { name: 'Matin' }));
    await user.click(screen.getByRole('button', { name: 'Soir' }));
    expect(screen.getByRole('button', { name: 'Soir (place 2)' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Soir (place 2)' }));
    await user.click(screen.getByRole('button', { name: 'Midi' }));
    await user.click(screen.getByRole('button', { name: 'Soir' }));
    expect(screen.getByRole('button', { name: 'Soir (place 3)' })).toBeTruthy();
    await user.click(ok());
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'order', order: [0, 2, 1] });
  });

  it('au clavier : chiffres, Retour arrière, Entrée', () => {
    const { onSubmit } = show(ordre);
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: '2' });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled(); // incomplet
    fireEvent.keyDown(window, { key: 'Backspace' });
    fireEvent.keyDown(window, { key: '3' });
    fireEvent.keyDown(window, { key: '2' });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'order', order: [0, 2, 1] });
  });

  it('à la télécommande : les flèches déplacent le focus entre les éléments', async () => {
    show(ordre);
    const user = userEvent.setup();
    screen.getByRole('button', { name: 'Matin' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Soir' }));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Matin' }));
  });

  it('« ? » sans rien placer demande de l’aide', async () => {
    const { onUnknown } = show(ordre);
    await userEvent.click(screen.getByRole('button', { name: /Je ne sais pas/ }));
    expect(onUnknown).toHaveBeenCalled();
  });
});

describe('association', () => {
  it('au toucher : gauche puis droite, valide quand tout est associé', async () => {
    const { onSubmit } = show(association);
    const user = userEvent.setup();
    // Le 1er élément de gauche est déjà actif : on touche directement la droite.
    await user.click(screen.getByRole('button', { name: 'C. Paris' }));
    await user.click(screen.getByRole('button', { name: 'A. Rome' }));
    await user.click(screen.getByRole('button', { name: 'B. Madrid' }));
    expect(screen.getByRole('button', { name: /A\. Rome \(associé à 2\)/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'match', pairs: [2, 0, 1] });
  });

  it('au clavier : chiffre puis lettre, Retour arrière défait la dernière paire', () => {
    const { onSubmit } = show(association);
    for (const k of ['1', 'c', '2', 'b']) fireEvent.keyDown(window, { key: k });
    fireEvent.keyDown(window, { key: 'Backspace' });
    for (const k of ['2', 'a', '3', 'b', 'Enter']) fireEvent.keyDown(window, { key: k });
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'match', pairs: [2, 0, 1] });
  });

  it('re-toucher un élément de gauche libère son partenaire', async () => {
    show(association);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'A. Rome' }));
    await user.click(screen.getByRole('button', { name: /1\. France \(associé à A\)/ }));
    expect(screen.getByRole('button', { name: 'A. Rome' })).toHaveProperty('disabled', false);
  });
});

describe('texte à trous', () => {
  it('au toucher : saisie au clavier virtuel puis liste, OK passe au trou suivant', async () => {
    const { onSubmit } = show(trous);
    const user = userEvent.setup();
    for (const letter of 'mangeons') await user.click(screen.getByRole('button', { name: new RegExp(`^${letter}$`) }));
    await user.click(screen.getByRole('button', { name: 'OK' })); // passe au trou 2
    await user.click(screen.getByRole('button', { name: /^restaurants$/ }));
    await user.click(screen.getByRole('button', { name: /^restaurant$/ }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'cloze', answers: ['mangeons', 'restaurant'] });
  });

  it('au clavier physique : lettres, Entrée, chiffre de la proposition, Entrée', () => {
    const { onSubmit } = show(trous);
    for (const k of 'mangeons') fireEvent.keyDown(window, { key: k });
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'cloze', answers: ['mangeons', 'restaurant'] });
  });
});

describe('figure « document »', () => {
  it('numérote chaque ligne et cite l’origine', () => {
    render(
      <Figure
        figure={{
          kind: 'document',
          title: 'Extrait',
          lines: ['Première ligne', 'Seconde ligne'],
          credit: 'Auteur, 1900',
        }}
      />,
    );
    expect(screen.getByText('Extrait')).toBeTruthy();
    expect(screen.getByText('Ligne 2 :')).toBeTruthy();
    expect(screen.getByText('Auteur, 1900')).toBeTruthy();
  });
});
