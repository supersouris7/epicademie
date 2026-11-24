import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels } from '../types.ts';
import { ENGLISH_TIME_CHAPTER } from './temps.ts';
import { DAYS, FAITS, MONTHS } from './temps-faits.ts';

const { skills } = ENGLISH_TIME_CHAPTER;

describe('anglais cm1 : le temps qui passe', () => {
  it('6 notions à 5 niveaux, avec le programme du cycle 3 pour source', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'acm1-couleurs',
      'acm1-jours',
      'acm1-mois',
      'acm1-saisons',
      'acm1-date',
      'acm1-meteo',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé) et une citation non vide', () => {
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
  });

  it('7 jours et 12 mois, dans l’ordre des sources', () => {
    expect(DAYS).toHaveLength(7);
    const song = FAITS.find((f) => f.id === 'mois')?.quote ?? '';
    const found = MONTHS.map((m) => song.indexOf(m.en));
    expect(found).toHaveLength(12);
    expect(found).toEqual([...found].sort((a, b) => a - b));
    expect(found.every((i) => i >= 0)).toBe(true);
  });

  it('saisie : réponse juste acceptée, chaque erreur typique expliquée', () => {
    for (const s of skills)
      for (const level of [3, 4, 5] as const)
        for (let seed = 1; seed <= 30; seed++) {
          const q = generate(s.id, level, seed);
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct, q.prompt).toBe(true);
          for (const t of q.traps)
            if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).why, q.prompt).toBe(t.why);
        }
  });

  it('chaque notion prévoit au moins deux erreurs typiques', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const level of [1, 2, 3, 4, 5] as const)
        for (let seed = 1; seed <= 20; seed++) for (const t of generate(s.id, level, seed).traps) reasons.add(t.why);
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });
});
