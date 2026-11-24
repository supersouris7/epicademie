import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { createRng } from '../../rng.ts';
import type { Level, Question, QuestionDraft } from '../../types.ts';
import { besoinsVegetaux } from './besoins-vegetaux.ts';

const tirages = (level: Level): QuestionDraft[] =>
  Array.from({ length: 300 }, (_, seed) => besoinsVegetaux.generate(createRng(seed), level));
const texte = (q: QuestionDraft) => JSON.stringify([q.prompt, q.figure, q.answer]);
const toutes = ([1, 2, 3, 4, 5] as const).flatMap(tirages);

describe('besoins des végétaux : corrections de relecture', () => {
  it('à l’obscurité, la hauteur n’est jamais le critère', () => {
    const noir = tirages(5).filter((q) => q.prompt.includes('pot B enfermé dans un placard noir'));
    expect(noir.length).toBeGreaterThan(0);
    for (const q of noir) {
      expect(q.prompt).not.toContain('De combien');
      expect(q.prompt).toContain('B : tige longue et fine, feuilles jaunes');
    }
    for (const q of tirages(5)) expect(texte(q)).not.toMatch(/Pot C[^"]*\d cm/);
  });

  it('quand les sels sont testés, le support est sans sels et annoncé', () => {
    const sels = toutes.filter((q) => texte(q).includes('eau pure'));
    expect(sels.length).toBeGreaterThan(0);
    for (const q of sels) {
      expect(texte(q)).toMatch(/sable lavé, sans sels minéraux|Les racines trempent dans de l’eau pure/);
      expect(texte(q)).not.toContain('la même terre');
      if (q.figure) expect(JSON.stringify(q.figure)).toContain('sable lavé');
    }
  });

  it('l’indice du texte à trous ne donne pas la réponse', () => {
    const trous = tirages(3).filter((q) => q.answer.kind === 'cloze');
    expect(trous.length).toBeGreaterThan(0);
    for (const q of trous) expect(q.hint).not.toMatch(/min[ée]raux|arrose/i);
  });

  it('accepte les variantes sans accent ou au singulier, et explique « soleil »', () => {
    const saisies = [...tirages(3), ...tirages(4)].filter((q) => q.answer.kind === 'text');
    const de = (mot: string) => saisies.find((q) => q.answer.kind === 'text' && q.answer.accepted.includes(mot));
    const sels = de('sels minéraux') as Question;
    for (const v of ['des sels mineraux', 'sel mineral'])
      expect(check(sels, { kind: 'text', text: v }).correct, v).toBe(true);
    const lumiere = de('lumière');
    expect(lumiere?.traps?.some((t) => 'text' in t && t.text === 'soleil')).toBe(true);
  });

  it('le mémo CM1 ne cite pas le dioxyde de carbone', () => {
    expect(JSON.stringify(besoinsVegetaux.lesson)).not.toContain('dioxyde');
  });
});
