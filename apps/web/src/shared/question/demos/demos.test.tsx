import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MathText } from '../MathText.tsx';
import { Term } from '../Term.tsx';
import { TermContext } from '../termContext.ts';
import { DivisionDemo } from './DivisionDemo.tsx';
import { PlaceValueDemo } from './PlaceValueDemo.tsx';
import { UnitsDemo } from './UnitsDemo.tsx';

describe('schémas des explications', () => {
  it('division : chaque nombre nommé, partage en paquets, égalité de contrôle', () => {
    render(<DivisionDemo dividend={23} divisor={5} />);
    for (const word of ['dividende', 'diviseur', 'quotient', 'reste'])
      expect(screen.getByText(word)).toBeInTheDocument();
    expect(screen.getByText('4 paquets')).toBeInTheDocument();
    expect(screen.getByText(/3 jetons qui restent/)).toBeInTheDocument();
    expect(screen.getByLabelText('23 égale 5 fois 4 plus 3')).toBeInTheDocument();
  });

  it('longueur, aire, volume : cm, cm², cm³ côte à côte, l’exemple compté', () => {
    render(<UnitsDemo focus="aire" />);
    expect(screen.getByText('un carré de 1 cm de côté')).toBeInTheDocument();
    expect(screen.getByText('un cube de 1 cm d’arête')).toBeInTheDocument();
    expect(screen.getByText(/3 × 2 = 6 carrés de 1 cm²/)).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('carrés de 1 cm sur 1 cm');
  });

  it('rangs : partie entière et décimales dans leurs colonnes', () => {
    render(<PlaceValueDemo value="12,75" />);
    const table = screen.getByRole('table');
    expect(within(table).getByText('partie entière')).toBeInTheDocument();
    expect(within(table).getByText('décimales')).toBeInTheDocument();
    expect(within(table).getByText('dixièmes')).toBeInTheDocument();
    expect(screen.getByText(/12 unités \+ 7 dixièmes \+ 5 centièmes/)).toBeInTheDocument();
  });
});

describe('mots touchables', () => {
  it('un mot souligné ouvre sa définition, un exemple et le schéma ; cm^2 s’écrit cm²', async () => {
    const user = userEvent.setup();
    render(
      <TermContext.Provider value={Term}>
        <MathText text="Le quotient de 23 par 5. Aire en cm^2." terms />
      </TermContext.Provider>,
    );
    expect(screen.getByText(/cm²/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'quotient : que veut dire ce mot ?' }));
    const dialog = screen.getByRole('dialog', { name: 'Le mot « quotient »' });
    expect(within(dialog).getByText(/nombre de paquets entiers/)).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Division de 23 par 5 expliquée en image')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'J’ai compris' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sans `terms` (options à toucher) : aucun bouton imbriqué', () => {
    render(<MathText text="Le quotient" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
