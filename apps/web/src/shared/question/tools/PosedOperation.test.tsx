import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { EMPTY_POSED, type PosedState } from '../posedState.ts';
import { PosedOperation } from './PosedOperation.tsx';

function Host() {
  const [state, setState] = useState<PosedState>(EMPTY_POSED);
  return <PosedOperation state={state} onChange={setState} />;
}

describe('outil « poser une opération »', () => {
  it('au clavier : saisie des nombres, Entrée, remplissage des cases, effacement', async () => {
    const user = userEvent.setup();
    render(<Host />);
    expect(screen.getByText(/Tape tes deux nombres/)).toBeTruthy();
    await user.keyboard('45{Enter}38{Enter}');
    expect(screen.getByRole('group', { name: 'Opération posée' })).toBeTruthy();
    await user.keyboard('3');
    expect(screen.getByRole('button', { name: 'Résultat, case 1 : 3' })).toBeTruthy();
    await user.keyboard('{Backspace}');
    expect(screen.getByRole('button', { name: 'Résultat, case 1 : vide' })).toBeTruthy();
  });

  it('ne donne jamais la réponse : toutes les cases de résultat sont vides', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.keyboard('45{Enter}38{Enter}');
    const cases = screen.getAllByRole('button', { name: /^Résultat, case \d : vide$/ });
    expect(cases.length).toBeGreaterThan(0);
    expect(screen.queryByText('83')).toBeNull();
  });

  it('au toucher : pavé numérique, effacer, recommencer', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: 'Virgule' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    expect(screen.getByRole('button', { name: 'Premier nombre : 7,5' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Effacer' }));
    expect(screen.getByRole('button', { name: 'Premier nombre : 7,' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Second nombre : vide' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Suivant ➜' }));
    await user.click(screen.getByRole('button', { name: '9' }));
    expect(screen.getAllByRole('button', { name: /: 9$/ }).length).toBe(1);
    await user.click(screen.getByRole('button', { name: 'Recommencer' }));
    expect(screen.queryAllByRole('button', { name: /: 9$/ })).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Premier nombre : 7,' })).toBeTruthy();
  });

  it('l’état survit quand l’outil est fermé puis rouvert (conservé par le parent)', async () => {
    const user = userEvent.setup();
    function Parent() {
      const [state, setState] = useState<PosedState>(EMPTY_POSED);
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(!open)}>
            bascule
          </button>
          {open && <PosedOperation state={state} onChange={setState} />}
        </>
      );
    }
    render(<Parent />);
    await user.keyboard('12');
    await user.click(screen.getByRole('button', { name: 'bascule' }));
    expect(screen.queryByRole('button', { name: /Premier nombre/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'bascule' }));
    expect(screen.getByRole('button', { name: 'Premier nombre : 12' })).toBeTruthy();
  });

  it('division : potence, ajout d’une soustraction, mots à connaître', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'Division' }));
    await user.keyboard('125{Enter}4{Enter}');
    const before = screen.getAllByRole('button', { name: /Soustraction \d, nombre à retirer/ }).length;
    await user.click(screen.getByRole('button', { name: 'Ajouter une soustraction' }));
    expect(screen.getAllByRole('button', { name: /Soustraction \d, nombre à retirer/ }).length).toBeGreaterThan(before);
    expect(screen.getByText('Quotient :')).toBeTruthy();
    expect(screen.getByText('Reste :')).toBeTruthy();
  });

  it('division par zéro : message, pas de potence', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'Division' }));
    await user.keyboard('5{Enter}0');
    expect(screen.getByText(/On ne peut pas diviser par 0/)).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Opération posée' })).toBeNull();
  });
});
