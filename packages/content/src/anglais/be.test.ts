import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels } from '../types.ts';
import { ENGLISH_BE_CHAPTERS } from './be.ts';
import { FAITS, PRONOUNS } from './be-faits.ts';

const skills = ENGLISH_BE_CHAPTERS.flatMap((c) => c.skills);

describe('anglais cm1 : be et possessifs', () => {
  it('4 notions à 5 niveaux, avec le programme du cycle 3 pour source', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'acm1-be-present',
      'acm1-pronoms-sujets',
      'acm1-questions-be',
      'acm1-possessifs',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
    }
  });

  it('les notions reprises gardent leur identifiant et passent à la version 2', () => {
    for (const id of ['acm1-be-present', 'acm1-possessifs']) expect(skills.find((s) => s.id === id)?.version).toBe(2);
  });

  it('chaque fait cite une source du registre (domaine autorisé) et une citation non vide', () => {
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
  });

  it('la table des pronoms suit le tableau du British Council', () => {
    expect(PRONOUNS.map((p) => `${p.en} ${p.be} ${p.poss}`)).toEqual([
      'I am my',
      'you are your',
      'he is his',
      'she is her',
      'it is its',
      'we are our',
      'they are their',
    ]);
  });

  it('be : la forme courte est acceptée, l’apostrophe oubliée est expliquée', () => {
    for (let seed = 1; seed < 200; seed++) {
      const q = generate('acm1-be-present', 4, seed);
      if (q.answer.kind !== 'text' || !q.prompt.includes('forme courte')) continue;
      const right = q.answer.accepted[1] ?? '';
      expect(check(q, { kind: 'text', text: right }).correct).toBe(true);
      const noApostrophe = check(q, { kind: 'text', text: right.replace('’', '') });
      expect(noApostrophe.correct).toBe(false);
      expect(noApostrophe.why).toMatch(/apostrophe/);
      return;
    }
    throw new Error('contraction jamais tirée');
  });

  it('possessifs : « it’s » est refusé avec une explication sur l’apostrophe', () => {
    for (let seed = 1; seed < 200; seed++) {
      const q = generate('acm1-possessifs', 3, seed);
      if (!q.prompt.includes('au chat')) continue;
      expect(check(q, { kind: 'text', text: 'its' }).correct).toBe(true);
      const res = check(q, { kind: 'text', text: 'it’s' });
      expect(res.correct).toBe(false);
      expect(res.why).toMatch(/it is/);
      return;
    }
    throw new Error('« au chat » jamais tiré');
  });

  it('questions : la question correcte est acceptée avec ou sans point d’interrogation, « do » est refusé', () => {
    for (let seed = 1; seed < 200; seed++) {
      const q = generate('acm1-questions-be', 4, seed);
      if (q.answer.kind !== 'text' || !q.prompt.startsWith('Écris la question')) continue;
      const right = q.answer.accepted[0] ?? '';
      expect(check(q, { kind: 'text', text: right }).correct).toBe(true);
      expect(check(q, { kind: 'text', text: `${right}?` }).correct).toBe(true);
      const withDo = q.traps.find((t) => 'text' in t && /^Do(es)? /.test(t.text));
      expect(withDo, 'piège « do »').toBeDefined();
      if (withDo && 'text' in withDo) {
        const res = check(q, { kind: 'text', text: withDo.text });
        expect(res.correct).toBe(false);
        expect(res.why).toMatch(/do/);
      }
      return;
    }
    throw new Error('question à écrire jamais tirée');
  });

  it('chaque notion prévoit au moins deux erreurs typiques sur l’ensemble des niveaux', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const level of [1, 2, 3, 4, 5] as const)
        for (let seed = 1; seed <= 20; seed++) for (const t of generate(s.id, level, seed).traps) reasons.add(t.why);
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });
});
