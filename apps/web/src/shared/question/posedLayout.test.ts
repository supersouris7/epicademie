import { describe, expect, it } from 'vitest';
import { inputIds, isDivisionByZero, layoutOf, parseNumber, type PosedLayout, type PosedRow } from './posedLayout.ts';

const shown = (row: PosedRow) => row.cells.map((c) => (c.kind === 'text' ? (c.text ?? '') : ' ')).join('');
const row = (l: PosedLayout | null, id: string): PosedRow => {
  const r = l?.rows.find((x) => x.id === id);
  if (!r) throw new Error(`ligne ${id} absente`);
  return r;
};
const inputs = (r: PosedRow) => r.cells.filter((c) => c.kind === 'input').length;

describe('parseNumber', () => {
  it('entiers, décimaux, point ou virgule', () => {
    expect(parseNumber('12')).toEqual({ int: '12', frac: '', comma: false });
    expect(parseNumber('12,5')).toEqual({ int: '12', frac: '5', comma: true });
    expect(parseNumber('3.25')).toEqual({ int: '3', frac: '25', comma: true });
    expect(parseNumber('007')).toEqual({ int: '7', frac: '', comma: false });
    expect(parseNumber('0,5')).toEqual({ int: '0', frac: '5', comma: true });
  });
  it('refuse le vide, la virgule seule et les caractères étrangers', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber(',')).toBeNull();
    expect(parseNumber('1a')).toBeNull();
    expect(parseNumber('1,2,3')).toBeNull();
  });
});

describe('addition et soustraction posées', () => {
  it('entiers : unités sous unités', () => {
    const l = layoutOf('addition', '345', '27');
    expect(shown(row(l, 'a'))).toBe('  345');
    expect(shown(row(l, 'b'))).toBe('+  27');
    expect(l?.cols).toBe(5);
  });
  it('décimaux : virgule sous virgule, nombres de longueurs différentes', () => {
    const l = layoutOf('addition', '12,5', '3,25');
    expect(shown(row(l, 'a'))).toBe('  12,5 ');
    expect(shown(row(l, 'b'))).toBe('+  3,25');
    const a = row(l, 'a').cells.findIndex((c) => c.text === ',');
    expect(row(l, 'b').cells.findIndex((c) => c.text === ',')).toBe(a);
    expect(row(l, 'r').cells[a]?.text).toBe(',');
  });
  it('entier + décimal : la virgule apparaît quand même', () => {
    const l = layoutOf('addition', '4', '0,75');
    expect(shown(row(l, 'a'))).toBe('  4,  ');
    expect(shown(row(l, 'b'))).toBe('+ 0,75');
  });
  it('trait sous le second nombre, retenues sauf dernière colonne, résultat à remplir', () => {
    const l = layoutOf('addition', '345', '27');
    expect(row(l, 'b').cells.every((c) => c.under)).toBe(true);
    expect(row(l, 'c').cells.filter((c) => c.kind === 'input')).toHaveLength(2);
    expect(row(l, 'c').cells.at(-1)?.kind).toBe('blank');
    expect(row(l, 'r').cells.every((c) => c.kind !== 'text')).toBe(true);
    expect(inputs(row(l, 'r'))).toBe(4);
  });
  it('un chiffre en plus pour la retenue finale de l’addition, pas pour la soustraction', () => {
    expect(inputs(row(layoutOf('addition', '99', '1'), 'r'))).toBe(3);
    expect(inputs(row(layoutOf('soustraction', '99', '1'), 'r'))).toBe(2);
    expect(shown(row(layoutOf('soustraction', '99', '1'), 'b'))).toBe('− 1');
  });
  it('ordre de saisie : de droite à gauche', () => {
    const l = layoutOf('soustraction', '52', '17');
    expect(l?.order).toEqual(['r:2', 'r:1']);
  });
  it('ne donne jamais la réponse : aucun chiffre dans les lignes à remplir', () => {
    const l = layoutOf('addition', '8', '7');
    expect(row(l, 'r').cells.every((c) => c.text === undefined || c.text === ',')).toBe(true);
    expect(row(l, 'c').cells.every((c) => c.text === undefined)).toBe(true);
  });
});

describe('multiplication posée', () => {
  it('ligne de produit partiel par chiffre du multiplicateur', () => {
    const l = layoutOf('multiplication', '123', '45');
    expect(l?.rows.filter((r) => r.role === 'partial')).toHaveLength(2);
    expect(shown(row(l, 'a'))).toBe('   123');
    expect(shown(row(l, 'b'))).toBe('×   45');
  });
  it('décalage d’un cran à chaque ligne de produit partiel', () => {
    const l = layoutOf('multiplication', '123', '45');
    const shifts = (id: string) => row(l, id).cells.filter((c) => c.kind === 'shift').length;
    expect(shifts('p0')).toBe(0);
    expect(shifts('p1')).toBe(1);
  });
  it('décimaux : on multiplie comme des entiers et on signale les chiffres après la virgule', () => {
    const l = layoutOf('multiplication', '1,2', '0,35');
    expect(l?.decimals).toBe(3);
    expect(shown(row(l, 'a'))).toContain('12');
    expect(shown(row(l, 'b'))).toContain('35');
    expect(shown(row(l, 'a'))).not.toContain(',');
  });
  it('produits partiels remplis avant le résultat, tous de droite à gauche', () => {
    const l = layoutOf('multiplication', '12', '34');
    const order = l?.order ?? [];
    expect(order.findIndex((id) => id.startsWith('r:'))).toBeGreaterThan(
      order.findLastIndex((id) => id.startsWith('p')),
    );
    const p0 = order.filter((id) => id.startsWith('p0'));
    expect(p0).toEqual([...p0].sort((x, y) => Number(y.split(':')[1]) - Number(x.split(':')[1])));
  });
  it('dernier produit partiel souligné (trait de résultat)', () => {
    const l = layoutOf('multiplication', '12', '34');
    expect(row(l, 'p1').cells.every((c) => c.under)).toBe(true);
  });
});

describe('division posée', () => {
  it('potence : dividende, séparateur, diviseur, quotient et reste à remplir', () => {
    const l = layoutOf('division', '125', '4');
    expect(l?.rows[0]?.cells.slice(0, 3).map((c) => c.text)).toEqual(['1', '2', '5']);
    expect(row(l, 'd').cells[3]?.side).toBe(true);
    expect(row(l, 'd').cells[4]?.text).toBe('4');
    expect(inputs(row(l, 'q'))).toBeGreaterThan(0);
    expect(inputs(row(l, 'z'))).toBeGreaterThan(0);
  });
  it('décimaux : la virgule du dividende est dans la potence', () => {
    const l = layoutOf('division', '7,5', '2');
    expect(
      row(l, 'd')
        .cells.slice(0, 3)
        .map((c) => c.text),
    ).toEqual(['7', ',', '5']);
  });
  it('soustractions successives, extensibles, plafonnées', () => {
    const base = layoutOf('division', '125', '4');
    const more = layoutOf('division', '125', '4', 2);
    const subs = (l: PosedLayout | null) => l?.rows.filter((r) => r.role === 'product').length ?? 0;
    expect(subs(more)).toBe(subs(base) + 2);
    expect(subs(layoutOf('division', '125', '4', 99))).toBe(8);
  });
  it('quotient d’abord, puis soustractions, puis reste', () => {
    const l = layoutOf('division', '125', '4');
    const order = l?.order ?? [];
    expect(order[0]?.startsWith('q:')).toBe(true);
    expect(order.at(-1)?.startsWith('z:')).toBe(true);
    expect(order.some((id) => id.startsWith('s0:'))).toBe(true);
  });
  it('division par zéro : pas de disposition', () => {
    expect(layoutOf('division', '5', '0')).toBeNull();
    expect(layoutOf('division', '5', '0,00')).toBeNull();
    expect(isDivisionByZero('0')).toBe(true);
    expect(isDivisionByZero('2')).toBe(false);
    expect(isDivisionByZero('')).toBe(false);
  });
});

describe('général', () => {
  it('rien tant que les nombres manquent', () => {
    expect(layoutOf('addition', '', '3')).toBeNull();
    expect(layoutOf('multiplication', '3', '')).toBeNull();
  });
  it('chaque case à remplir a un identifiant unique et un nom pour les lecteurs d’écran', () => {
    for (const op of ['addition', 'soustraction', 'multiplication', 'division'] as const) {
      const l = layoutOf(op, '12,5', '3,2');
      const cells = (l?.rows ?? []).flatMap((r) => r.cells.filter((c) => c.kind === 'input'));
      expect(new Set(cells.map((c) => c.id)).size).toBe(cells.length);
      expect(cells.every((c) => c.label)).toBe(true);
      expect(inputIds(l!).size).toBe(cells.length);
      expect(l?.rows.every((r) => r.cells.length === l.cols)).toBe(true);
      expect((l?.order ?? []).every((id) => inputIds(l!).has(id))).toBe(true);
    }
  });
});
