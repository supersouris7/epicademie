import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Question } from '@epicademie/content';
import { AnswerInput } from './AnswerInput.tsx';
import { formatAnswer, formatResponse } from './answers.ts';
import { fond as regions } from './figures/cartes/fonds-france-regions.ts';
import { neighbour } from './figures/cartes/geometrie.ts';

/** Réponse « zone » : toucher, clavier physique et télécommande (flèches + OK). */

const question: Question = {
  skillId: 't',
  level: 1,
  seed: 1,
  prompt: 'Touche la Bretagne.',
  steps: ['Étape.'],
  hint: 'Indice.',
  traps: [],
  targetSeconds: 30,
  answer: { kind: 'zone', map: 'france-regions', zone: '53' },
};

const setup = (over: { disabled?: boolean; onUnknown?: () => void } = {}) => {
  const onSubmit = vi.fn();
  render(
    <AnswerInput
      question={question}
      disabled={over.disabled ?? false}
      onSubmit={onSubmit}
      picked={null}
      onUnknown={over.onUnknown}
    />,
  );
  return onSubmit;
};

describe('réponse « zone »', () => {
  it('toucher une zone la choisit, OK envoie la réponse', async () => {
    const onSubmit = setup();
    const ok = await screen.findByRole('button', { name: 'Bretagne' });
    expect(screen.getByText('Rien de choisi')).toBeTruthy();
    fireEvent.click(ok);
    expect(screen.getByText(/Ton choix : Bretagne/)).toBeTruthy();
    expect(ok.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'zone', zone: '53' });
  });

  it('on peut changer d’avis avant de valider', async () => {
    const onSubmit = setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Normandie' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bretagne' }));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'zone', zone: '53' });
  });

  it('sans choix, OK est remplacé par « ? » (aide) et rien n’est envoyé', async () => {
    const onUnknown = vi.fn();
    const onSubmit = setup({ onUnknown });
    await screen.findByRole('button', { name: 'Bretagne' });
    await userEvent.click(screen.getByRole('button', { name: 'Je ne sais pas : un indice' }));
    expect(onUnknown).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clavier et télécommande : flèches pour changer de zone, Entrée choisit puis valide', async () => {
    const onSubmit = setup();
    const start = await screen.findByRole('button', { name: 'Bretagne' });
    start.focus();
    // Une flèche déplace le focus vers une zone voisine ; elle ne choisit rien.
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    await Promise.resolve();
    expect(document.activeElement).not.toBe(start);
    expect(document.activeElement?.getAttribute('role')).toBe('button');
    expect(screen.getByText('Rien de choisi')).toBeTruthy();
    // Retour à la Bretagne : Entrée la choisit, Entrée encore valide.
    fireEvent.keyDown(start, { key: 'Enter' });
    expect(screen.getByText(/Ton choix : Bretagne/)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(start, { key: ' ' });
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'zone', zone: '53' });
  });

  it('désactivée : aucune zone ne se choisit', async () => {
    const onSubmit = setup({ disabled: true });
    fireEvent.click(await screen.findByRole('button', { name: 'Bretagne' }));
    expect(screen.getByText('Rien de choisi')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('les boutons ＋ et － rapprochent et éloignent la carte', async () => {
    setup();
    const svg = await screen.findByRole('group', { name: /régions/ });
    const full = svg.getAttribute('viewBox');
    fireEvent.click(screen.getByRole('button', { name: 'Rapprocher la carte' }));
    expect(svg.getAttribute('viewBox')).not.toBe(full);
    fireEvent.click(screen.getByRole('button', { name: 'Éloigner la carte' }));
    expect(svg.getAttribute('viewBox')).toBe(full);
  });

  it('formulations de la correction', () => {
    expect(formatAnswer(question)).toBe('**Bretagne**');
    expect(formatResponse(question, { kind: 'zone', zone: '28' })).toBe('Normandie');
  });
});

describe('navigation entre zones', () => {
  it('la voisine à l’est de la Bretagne est plus à l’est ; aucune voisine hors carte', () => {
    const at = (id: string) => regions.zones.find((z) => z.id === id)?.c ?? [0, 0];
    const east = neighbour(regions, '53', [1, 0]);
    expect(east).not.toBeNull();
    expect(at(east ?? '')[0]).toBeGreaterThan(at('53')[0]);
    const north = neighbour(regions, '53', [0, -1]);
    expect(at(north ?? '')[1]).toBeLessThan(at('53')[1]);
    expect(neighbour(regions, '32', [0, -1])).toBeNull();
    expect(neighbour(regions, 'zzz', [1, 0])).toBeNull();
  });
});
