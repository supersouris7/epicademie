import { describe, expect, it } from 'vitest';
import { allSkillIds, CHAPTERS, generate } from './catalog.ts';
import { r } from './rational.ts';
import type { Question } from './types.ts';
import { validateQuestion, validateVariants } from './validate.ts';

/** Question saine, modifiable par cas de test. */
const base = (over: Partial<Question> = {}): Question => ({
  skillId: 'test',
  level: 1,
  seed: 1,
  prompt: 'Calcule 6 × 7.',
  answer: { kind: 'number', value: r(42) },
  traps: [{ value: r(13), why: 'C’est une addition, pas une multiplication.' }],
  steps: ['6 × 7 = **42**.'],
  hint: 'Pense à la table de 7.',
  targetSeconds: 10,
  ...over,
});
const codes = (q: Question) => validateQuestion(q).map((i) => i.code);

describe('le validateur repère les questions cassées', () => {
  it('question saine : aucun problème', () => {
    expect(codes(base())).toEqual([]);
  });

  it('textes vides ou cassés', () => {
    expect(codes(base({ prompt: ' ' }))).toContain('enonce-vide');
    expect(codes(base({ hint: '' }))).toContain('indice-vide');
    expect(codes(base({ steps: [] }))).toContain('correction-vide');
    expect(codes(base({ prompt: 'Calcule undefined × 7.' }))).toContain('texte-casse');
    expect(codes(base({ targetSeconds: 0 }))).toContain('duree');
  });

  it('audio : texte, langue, et texte écouté absent de l’énoncé', () => {
    expect(codes(base({ audio: { text: 'Seven times six', lang: 'en-GB' } }))).toEqual([]);
    expect(codes(base({ audio: { text: ' ', lang: 'en-GB' } }))).toContain('audio');
    expect(codes(base({ audio: { text: 'Seven', lang: 'anglais' } }))).toContain('audio');
    expect(codes(base({ audio: { text: 'Calcule 6 × 7', lang: 'fr-FR' } }))).toContain('audio');
  });

  it('réponse attendue impossible ou contradictoire', () => {
    expect(codes(base({ answer: { kind: 'number', value: r(1, 3) } }))).toContain('decimal-infini');
    expect(codes(base({ answer: { kind: 'number', value: { n: 1, d: 0 } } }))).toContain('nombre-invalide');
    expect(codes(base({ traps: [{ value: r(42), why: 'Faux ?' }] }))).toEqual(
      expect.arrayContaining(['piege-juste', 'piege-accepte']),
    );
    expect(
      codes(base({ answer: { kind: 'number', value: r(42), accept: [r(40)] }, traps: [{ value: r(40), why: 'x' }] })),
    ).toContain('piege-juste');
  });

  it('QCM : propositions en double, bonne réponse absente, piège sur la bonne réponse', () => {
    const qcm = (options: string[], correct = 0) => base({ answer: { kind: 'choice', options, correct }, traps: [] });
    expect(codes(qcm(['12', '12', '13']))).toContain('qcm-doublon');
    expect(codes(qcm(['12', '13'], 5))).toContain('qcm-correct');
    expect(codes(qcm(['12']))).toContain('qcm-options');
    expect(
      codes(base({ answer: { kind: 'choice', options: ['a', 'b'], correct: 0 }, traps: [{ option: 0, why: 'x' }] })),
    ).toContain('piege-option');
  });

  it('réponse écrite et point', () => {
    expect(codes(base({ answer: { kind: 'text', accepted: [] }, traps: [] }))).toContain('texte-attendu');
    expect(
      codes(
        base({
          answer: { kind: 'point', x: 9, y: 0 },
          traps: [],
          figure: { kind: 'grid', xMin: -5, xMax: 5, yMin: -5, yMax: 5, axes: true, points: [] },
        }),
      ),
    ).toContain('figure');
  });

  it('variantes : un même énoncé ne peut pas attendre deux réponses', () => {
    const a = base({ seed: 1 });
    const b = base({ seed: 2, answer: { kind: 'number', value: r(43) }, traps: [] });
    expect(validateVariants([a, b]).map((i) => i.code)).toContain('enonce-contradictoire');
    expect(validateVariants([a, base({ seed: 3 })])).toEqual([]);
  });
});

describe('tout le contenu passe la validation', () => {
  const bossIds = CHAPTERS.flatMap((c) => [...(c.boss?.problems ?? []), ...(c.boss?.traps ?? [])].map((s) => s.id));
  const ids = [...allSkillIds(), ...bossIds];

  it('plusieurs centaines de notions, entraînement et boss', () => {
    expect(ids.length).toBeGreaterThan(500);
  });

  it.each([1, 2, 3] as const)('niveau %i : 20 variantes de chaque notion, sans aucun problème', (level) => {
    const issues = ids.flatMap((id) =>
      validateVariants(Array.from({ length: 20 }, (_, seed) => generate(id, level, seed))),
    );
    expect(issues.map((i) => `${i.skillId} L${i.level} s${i.seed} ${i.code} : ${i.message}`)).toEqual([]);
  });
});
