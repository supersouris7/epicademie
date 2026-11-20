import { describe, expect, it } from 'vitest';
import { GLOSSARY, GLOSSARY_FAMILIES, normalizeUnits, splitTerms, termsIn } from './glossary.ts';

describe('glossaire', () => {
  it('identifiants et formes uniques ; chaque mot a une famille connue', () => {
    expect(new Set(GLOSSARY.map((g) => g.id)).size).toBe(GLOSSARY.length);
    const forms = GLOSSARY.flatMap((g) => g.forms);
    expect(new Set(forms).size).toBe(forms.length);
    for (const g of GLOSSARY) {
      expect(Object.keys(GLOSSARY_FAMILIES)).toContain(g.family);
      for (const f of g.forms) expect(f).toBe(f.toLowerCase());
    }
  });

  it('exemples de la division justes : dividende = diviseur × quotient + reste, reste < diviseur', () => {
    for (const g of GLOSSARY) {
      if (g.visual?.kind !== 'division') continue;
      const { dividend, divisor } = g.visual;
      const q = Math.floor(dividend / divisor);
      expect(dividend).toBe(divisor * q + (dividend % divisor));
      expect(dividend % divisor).toBeLessThan(divisor);
    }
    expect(23).toBe(5 * 4 + 3);
  });

  it('repère les mots, le plus long d’abord, sans couper un mot plus grand', () => {
    expect(splitTerms('Le quotient et le reste de la division euclidienne.')).toEqual([
      { text: 'Le ' },
      { text: 'quotient', term: 'quotient' },
      { text: ' et le ' },
      { text: 'reste', term: 'reste' },
      { text: ' de la ' },
      { text: 'division euclidienne', term: 'division-euclidienne' },
      { text: '.' },
    ]);
    // « restez », « produite » : pas des mots du glossaire.
    expect(splitTerms('Restez calmes, produite').every((p) => !p.term)).toBe(true);
    expect(termsIn(['Quelle est l’Aire en cm^2 ?'])).toEqual(['aire', 'cm2']);
  });

  it('unités d’aire et de volume écrites avec leur exposant', () => {
    expect(normalizeUnits('12 cm^2 et 3 m^3, x^2')).toBe('12 cm² et 3 m³, x^2');
  });
});
