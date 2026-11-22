import { describe, expect, it } from 'vitest';
import { layoutOf } from './posedLayout.ts';
import { addStep, advance, EMPTY_POSED, press, restart, selectTarget, setOp, type PosedState } from './posedState.ts';

const type = (s: PosedState, keys: string): PosedState => Array.from(keys).reduce(press, s);

describe('état de l’opération posée', () => {
  it('saisit les deux nombres puis passe aux cases avec Entrée', () => {
    let s = type(EMPTY_POSED, '12,5');
    expect(s.a).toBe('12,5');
    s = advance(s);
    expect(s.target).toBe('b');
    s = advance(type(s, '3'));
    expect(s.target).toEqual({ cell: layoutOf('addition', '12,5', '3')?.order[0] });
  });
  it('n’accepte qu’une virgule et limite la longueur', () => {
    expect(type(EMPTY_POSED, '1,2,3').a).toBe('1,23');
    expect(type(EMPTY_POSED, '123456789').a).toHaveLength(7);
  });
  it('effacer dans un nombre', () => {
    expect(type(EMPTY_POSED, '123⌫').a).toBe('12');
  });
  it('une case contient un caractère, la sélection avance dans l’ordre du calcul', () => {
    let s = advance(advance(type(advance(type(EMPTY_POSED, '45')), '38')));
    expect(s.target).toEqual({ cell: 'r:3' });
    s = press(s, '3');
    expect(s.cells['r:3']).toBe('3');
    expect(s.target).toEqual({ cell: 'r:2' });
  });
  it('la dernière case reste sélectionnée', () => {
    let s = selectTarget(type(advance(type(EMPTY_POSED, '1')), '1'), { cell: 'r:1' });
    s = press(s, '2');
    expect(s.target).toEqual({ cell: 'r:1' });
  });
  it('effacer une case vide revient à la précédente et la vide', () => {
    let s = advance(advance(type(advance(type(EMPTY_POSED, '45')), '38')));
    s = press(press(s, '3'), '⌫');
    expect(s.target).toEqual({ cell: 'r:3' });
    expect(s.cells['r:3']).toBeUndefined();
    s = press(press(s, '7'), '⌫');
    expect(s.cells['r:3']).toBeUndefined();
  });
  it('changer d’opération vide les cases et garde les nombres', () => {
    let s = advance(advance(type(advance(type(EMPTY_POSED, '45')), '38')));
    s = press(s, '3');
    const m = setOp(s, 'multiplication');
    expect(m.cells).toEqual({});
    expect([m.a, m.b]).toEqual(['45', '38']);
    expect(setOp(m, 'multiplication')).toBe(m);
  });
  it('recommencer vide les cases mais garde nombres et opération', () => {
    let s = setOp(EMPTY_POSED, 'division');
    s = addStep(type(advance(type(s, '125')), '4'));
    const r = restart(s);
    expect(r).toMatchObject({ a: '125', b: '4', op: 'division', cells: {}, extraSteps: 0 });
  });
  it('changer un nombre retire les cases qui n’existent plus', () => {
    let s = advance(advance(type(advance(type(EMPTY_POSED, '45')), '38')));
    s = press(press(s, '3'), '1');
    s = selectTarget(s, 'a');
    s = press(press(s, '⌫'), '⌫');
    expect(s.a).toBe('');
    expect(s.cells).toEqual({});
  });
  it('plafonne les soustractions ajoutées', () => {
    let s = EMPTY_POSED;
    for (let i = 0; i < 20; i++) s = addStep(s);
    expect(s.extraSteps).toBe(8);
  });
  it('touche ignorée dans une case si elle n’est pas un chiffre', () => {
    const s = selectTarget(advance(advance(type(advance(type(EMPTY_POSED, '4')), '3'))), { cell: 'r:1' });
    expect(press(s, '−')).toBe(s);
  });
});
