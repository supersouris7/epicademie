import { describe, expect, it } from 'vitest';
import { generate } from './catalog.ts';
import { check, normalizeText } from './check.ts';
import { dec, r } from './rational.ts';
import type { Question } from './types.ts';

const base = { skillId: 't', level: 1, seed: 1, prompt: '', steps: [], targetSeconds: 30 } as const;

describe('réponses arrondies', () => {
  const q: Question = {
    ...base,
    answer: { kind: 'number', value: dec(785, 1), accept: [dec(784, 1)], round: 1 },
    traps: [],
  };
  const answer = (text: string) => check(q, { kind: 'number', text });

  it('accepte la valeur arrondie et les autres réponses prévues', () => {
    expect(answer('78,5').correct).toBe(true);
    expect(answer('78,4').correct).toBe(true);
  });

  it('rappelle d’arrondir une valeur proche non arrondie', () => {
    const r1 = answer('78,539816');
    expect(r1.correct).toBe(false);
    expect(r1.why).toMatch(/arrondir au dixième/);
  });

  it('pas de rappel pour une valeur fausse', () => {
    expect(answer('80,12').why).toBeUndefined();
    expect(answer('79').why).toBeUndefined();
  });
});

describe('aire du disque avec la touche π', () => {
  it('rayon 5 : 78,5 juste, valeur brute de la calculatrice signalée', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const q = generate('m5-disque', 1, seed);
      if (!q.prompt.includes('rayon 5 cm')) continue;
      expect(check(q, { kind: 'number', text: '78,5' }).correct).toBe(true);
      expect(check(q, { kind: 'number', text: '78,539816' }).why).toMatch(/arrondir/);
      return;
    }
    throw new Error('aucune question de rayon 5');
  });

  it('cylindre : la touche π et π ≈ 3,14 donnent deux arrondis acceptés', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const q = generate('m5-disque', 3, seed);
      if (!q.prompt.includes('rayon 10 cm et de hauteur 10 cm')) continue;
      expect(check(q, { kind: 'number', text: '3141,6' }).correct).toBe(true);
      expect(check(q, { kind: 'number', text: '3140' }).correct).toBe(true);
      return;
    }
  });
});

describe('réponses écrites', () => {
  const q: Question = {
    ...base,
    answer: { kind: 'text', accepted: ['l’hôpital', 'hospital'] },
    traps: [{ text: 'hopital', why: 'Attention à l’accent circonflexe.' }],
  };

  it('ignore casse, apostrophe typographique et espaces', () => {
    expect(normalizeText('  L’Hôpital ')).toBe("l'hôpital");
    expect(check(q, { kind: 'text', text: "L'HÔPITAL" }).correct).toBe(true);
    expect(check(q, { kind: 'text', text: 'Hospital' }).correct).toBe(true);
  });

  it('erreur prévue et saisie vide', () => {
    expect(check(q, { kind: 'text', text: 'hopital' }).why).toMatch(/accent/);
    expect(check(q, { kind: 'text', text: '  ' }).invalid).toBe(true);
    expect(check(q, { kind: 'number', text: '3' }).invalid).toBe(true);
  });
});

it('nombre entier attendu : r(…) inchangé', () => {
  const q: Question = { ...base, answer: { kind: 'number', value: r(12) }, traps: [] };
  expect(check(q, { kind: 'number', text: '12' }).correct).toBe(true);
});
